/**
 * FTP Deployment for Plesk
 *
 * Alternative to Plesk API when API Keys are not available.
 * Uses FTP to upload files directly to the hosting space.
 */

import { Client } from 'basic-ftp'
import * as path from 'path'
import * as fs from 'fs/promises'

export interface FTPConfig {
  host: string
  port?: number
  user: string
  password: string
  secure?: boolean // Use FTPS
}

export interface DeployResult {
  success: boolean
  filesUploaded?: number
  error?: string
  details?: string
}

/**
 * Deploy files to hosting via FTP
 */
export async function deployViaFTP(
  localDir: string,
  remotePath: string,
  files: string[],
  config: FTPConfig
): Promise<DeployResult> {
  const client = new Client()
  client.ftp.verbose = true // Enable logging

  try {
    console.log(`Connecting to FTP: ${config.user}@${config.host}:${config.port || 21}`)

    // Connect to FTP server
    await client.access({
      host: config.host,
      port: config.port || 21,
      user: config.user,
      password: config.password,
      secure: config.secure || false,
    })

    console.log('FTP connected successfully')

    // Ensure remote directory exists and navigate to it
    try {
      await client.cd(remotePath)
    } catch (error) {
      console.log(`Creating remote directory: ${remotePath}`)
      await client.ensureDir(remotePath)
      await client.cd(remotePath)
    }

    console.log(`Working in remote directory: ${remotePath}`)

    let uploadedCount = 0

    // Upload each file
    for (const file of files) {
      const localPath = path.join(localDir, file)
      const remoteName = file.replace(/\\/g, '/') // Normalize path separators

      try {
        // Check if file exists
        const stats = await fs.stat(localPath)

        if (stats.isDirectory()) {
          // Create directory on remote
          await client.ensureDir(remoteName)
          console.log(`  [DIR] ${remoteName}`)
        } else {
          // Upload file
          await client.uploadFrom(localPath, remoteName)
          uploadedCount++
          console.log(`  [UP] ${remoteName} (${(stats.size / 1024).toFixed(2)} KB)`)
        }
      } catch (fileError: any) {
        console.error(`  [FAIL] ${file}: ${fileError.message}`)
        // Continue with other files
      }
    }

    console.log(`FTP upload complete: ${uploadedCount} files uploaded`)

    return {
      success: true,
      filesUploaded: uploadedCount,
      details: `Uploaded ${uploadedCount} of ${files.length} files`,
    }

  } catch (error: any) {
    console.error('FTP deployment failed:', error)
    return {
      success: false,
      error: error.message || 'Unknown FTP error',
      details: error.stack,
    }
  } finally {
    client.close()
  }
}

/**
 * Get FTP configuration from environment variables
 */
export function getFTPConfig(): FTPConfig | null {
  const host = process.env.FTP_HOST || process.env.PLESK_HOST
  const user = process.env.FTP_USER
  const password = process.env.FTP_PASSWORD
  const port = process.env.FTP_PORT ? parseInt(process.env.FTP_PORT) : 21
  const secure = process.env.FTP_SECURE === 'true'

  if (!host || !user || !password) {
    return null
  }

  return {
    host,
    port,
    user,
    password,
    secure,
  }
}

/**
 * Create FTP account in Plesk (manual instructions)
 *
 * Since API is not available, this returns instructions for manual setup
 */
export function getManualFTPSetupInstructions(domain: string): string {
  return `
To create FTP access for ${domain} manually in Plesk:

1. Log in to Plesk
2. Go to "Domains" → Select "${domain}"
3. Click "FTP Access"
4. Click "Add FTP Account"
5. Fill in:
   - FTP Account Name: ${domain.replace(/\./g, '_')}_ftp
   - Home Directory: /httpdocs (or subdirectory for subdomain)
   - Password: [Generate secure password]
6. Click "OK"
7. Add these credentials to your .env.local:
   FTP_HOST=ftp.yourdomain.com (or server IP)
   FTP_USER=the_username_you_created
   FTP_PASSWORD=the_password_you_set
   FTP_PORT=21
   FTP_SECURE=false (or true for FTPS)
`
}
