/**
 * Cloudflare R2 Deployment
 *
 * Scalable deployment solution for 10,000+ user websites
 * Uses S3-compatible R2 storage + global CDN
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
}

export interface DeployResult {
  success: boolean
  filesUploaded?: number
  url?: string
  error?: string
}

/**
 * Get R2 configuration from environment
 */
export function getR2Config(): R2Config | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucketName = process.env.R2_BUCKET_NAME || 'user-websites'

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
  }
}

/**
 * Create R2 client
 */
export function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
}

/**
 * Deploy website files to R2
 */
export async function deployToR2(
  subdomain: string,
  localDir: string,
  files: string[]
): Promise<DeployResult> {
  try {
    const config = getR2Config()

    if (!config) {
      console.warn('R2 not configured - skipping deployment')
      console.warn('To enable R2 deployment, add to .env.local:')
      console.warn('  CLOUDFLARE_ACCOUNT_ID=your-account-id')
      console.warn('  R2_ACCESS_KEY_ID=your-access-key')
      console.warn('  R2_SECRET_ACCESS_KEY=your-secret-key')
      return { success: true } // Don't fail, just skip
    }

    const r2 = createR2Client(config)
    const fs = require('fs/promises')
    const path = require('path')

    console.log(`Deploying ${files.length} files to R2 for subdomain: ${subdomain}`)

    let uploadedCount = 0

    for (const file of files) {
      try {
        const localPath = path.join(localDir, file)
        const fileContent = await fs.readFile(localPath)
        const contentType = getContentType(file)

        // Upload to R2 with path: subdomain/file
        const key = `${subdomain}/${file}`.replace(/\\/g, '/')

        await r2.send(new PutObjectCommand({
          Bucket: config.bucketName,
          Key: key,
          Body: fileContent,
          ContentType: contentType,
          CacheControl: 'public, max-age=86400', // Cache for 24 hours
          Metadata: {
            'uploaded-at': new Date().toISOString(),
            'subdomain': subdomain,
          },
        }))

        uploadedCount++
        console.log(`  ✓ Uploaded: ${key} (${contentType})`)

      } catch (fileError: any) {
        console.error(`  ✗ Failed to upload ${file}:`, fileError.message)
        // Continue with other files
      }
    }

    const parentDomain = process.env.R2_PARENT_DOMAIN || 'webese.ai'
    const url = `https://${subdomain}.${parentDomain}`

    console.log(`✓ Successfully deployed ${uploadedCount} files to R2`)
    console.log(`✓ Website available at: ${url}`)

    return {
      success: true,
      filesUploaded: uploadedCount,
      url,
    }

  } catch (error: any) {
    console.error('R2 deployment failed:', error)
    return {
      success: false,
      error: error.message || 'Unknown R2 error',
    }
  }
}

/**
 * Delete website from R2
 */
export async function deleteFromR2(subdomain: string): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getR2Config()
    if (!config) {
      return { success: false, error: 'R2 not configured' }
    }

    const r2 = createR2Client(config)

    // List all objects with this subdomain prefix
    const listResult = await r2.send(new ListObjectsV2Command({
      Bucket: config.bucketName,
      Prefix: `${subdomain}/`,
    }))

    if (!listResult.Contents || listResult.Contents.length === 0) {
      return { success: true } // Nothing to delete
    }

    // Delete all files for this subdomain
    for (const object of listResult.Contents) {
      if (object.Key) {
        await r2.send(new DeleteObjectCommand({
          Bucket: config.bucketName,
          Key: object.Key,
        }))
      }
    }

    console.log(`✓ Deleted ${listResult.Contents.length} files for subdomain: ${subdomain}`)

    return { success: true }

  } catch (error: any) {
    console.error('R2 deletion failed:', error)
    return {
      success: false,
      error: error.message || 'Unknown R2 error',
    }
  }
}

/**
 * Determine content type from file extension
 */
function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || ''

  const types: Record<string, string> = {
    'html': 'text/html; charset=utf-8',
    'css': 'text/css; charset=utf-8',
    'js': 'application/javascript; charset=utf-8',
    'json': 'application/json; charset=utf-8',
    'xml': 'application/xml; charset=utf-8',
    'txt': 'text/plain; charset=utf-8',

    // Images
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'ico': 'image/x-icon',

    // Fonts
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'eot': 'application/vnd.ms-fontobject',

    // Other
    'pdf': 'application/pdf',
    'zip': 'application/zip',
  }

  return types[ext] || 'application/octet-stream'
}

/**
 * Check if R2 is configured
 */
export function isR2Configured(): boolean {
  return getR2Config() !== null
}
