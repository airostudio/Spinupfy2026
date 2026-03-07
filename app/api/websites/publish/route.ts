/**
 * Website Publishing API
 *
 * Publishes a generated website to scalable hosting:
 * 1. Generates random subdomain name
 * 2. Creates subdomain via airostudio API (webese.ai)
 * 3. Exports website to static files
 * 4. Deploys files to hosting (R2 > FTP > Plesk API)
 * 5. Updates database with published URL
 *
 * Supports 10,000+ websites via Cloudflare R2 + Workers
 */

import { NextRequest, NextResponse } from 'next/server'

// Maximum duration for website publishing (5 minutes for export + deploy)
export const maxDuration = 300
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { saveWebsiteImagesOnPublish } from '@/lib/image-storage'
import { getPleskAPI } from '@/lib/plesk-api'
import { generateUniqueSubdomain } from '@/lib/subdomain-generator'
import { createSubdomain, isSubdomainAPIConfigured, getParentDomain, deleteSubdomain as deleteSubdomainAPI } from '@/lib/subdomain-api'
import { exportWebsiteToStatic } from '@/lib/website-exporter'
import { deployViaFTP, getFTPConfig } from '@/lib/ftp-deploy'
import { deployToR2, isR2Configured } from '@/lib/r2-deploy'
import path from 'path'
import os from 'os'
import fs from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { websiteId } = body

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    console.log(`Publishing website ${websiteId} for user ${user.id}`)

    // Verify website ownership
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .eq('user_id', user.id)
      .single()

    if (websiteError || !website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // If already published to Plesk, just return the existing URL
    if (website.published_url && website.subdomain) {
      console.log(`Website already published at: ${website.published_url}`)
      return NextResponse.json({
        success: true,
        message: 'Website already published',
        publishedUrl: website.published_url,
        subdomain: website.subdomain,
        alreadyPublished: true,
      })
    }

    // Step 1: Save all images to permanent storage first
    console.log('Saving images to permanent storage...')
    const imageResult = await saveWebsiteImagesOnPublish({
      websiteId,
      userId: user.id,
    })
    console.log(`Saved ${imageResult.savedCount} images with ${imageResult.errors.length} errors`)

    // Get existing subdomains to ensure uniqueness
    const { data: existingWebsites } = await supabase
      .from('websites')
      .select('subdomain')
      .not('subdomain', 'is', null)

    const existingSubdomains = existingWebsites?.map(w => w.subdomain).filter(Boolean) || []

    // Step 2: Generate unique subdomain name
    console.log('Generating unique subdomain...')
    const subdomain = generateUniqueSubdomain(existingSubdomains)
    const parentDomain = getParentDomain()
    const fullDomain = `${subdomain}.${parentDomain}`
    console.log(`Generated subdomain: ${fullDomain}`)

    // Step 3: Create subdomain via API or Plesk
    let subdomainId: number | undefined
    let subdomainCreated = false
    let subdomainMethod = 'none'

    // Priority 1: Use airostudio subdomain API (recommended)
    if (isSubdomainAPIConfigured()) {
      console.log('Creating subdomain via airostudio API...')

      const subdomainResult = await createSubdomain({
        subdomain,
        parentDomain,
        websiteId,
        userId: user.id,
      })

      if (!subdomainResult.success) {
        console.error('Subdomain API error:', subdomainResult.error)
        throw new Error(`Failed to create subdomain: ${subdomainResult.error}`)
      }

      subdomainCreated = true
      subdomainMethod = 'airostudio-api'
      console.log(`Subdomain created via API: ${subdomainResult.fullDomain}`)
    }
    // Priority 2: Fall back to Plesk if configured
    else if (process.env.PLESK_HOST && process.env.PLESK_API_KEY) {
      console.log('Creating subdomain in Plesk (fallback)...')
      const pleskAPI = getPleskAPI()

      // Calculate disk quota based on user plan (default 5MB per website)
      const diskQuotaMb = 5

      const subdomainResult = await pleskAPI.createSubdomain({
        parentDomain,
        subdomainName: subdomain,
        diskSpaceMb: diskQuotaMb,
        phpEnabled: false, // Static sites don't need PHP
      })

      if (!subdomainResult.success) {
        throw new Error(`Failed to create subdomain: ${subdomainResult.error}`)
      }

      subdomainId = subdomainResult.subdomainId
      subdomainCreated = true
      subdomainMethod = 'plesk'
      console.log('Subdomain created via Plesk:', subdomainId)
    } else {
      console.log('No subdomain service configured - subdomain will be reserved but not created')
      console.log('Configure SUBDOMAIN_API_URL or PLESK_HOST to enable subdomain creation')
    }

    // Step 4: Export website to static files
    console.log('Exporting website to static files...')
    const tmpDir = path.join(os.tmpdir(), `website-${websiteId}-${Date.now()}`)

    const exportResult = await exportWebsiteToStatic({
      websiteId,
      outputDir: tmpDir,
      includeAssets: true,
    })

    if (!exportResult.success) {
      // Rollback: Delete the subdomain we just created
      if (subdomainCreated) {
        if (subdomainMethod === 'airostudio-api') {
          await deleteSubdomainAPI(subdomain, parentDomain)
        } else if (subdomainMethod === 'plesk' && subdomainId) {
          const pleskAPI = getPleskAPI()
          await pleskAPI.deleteSubdomain(subdomainId)
        }
      }
      throw new Error(`Failed to export website: ${exportResult.error}`)
    }

    console.log(`Website exported to ${tmpDir} (${exportResult.files?.length} files, ${(exportResult.totalSize! / 1024).toFixed(2)} KB)`)

    // Step 5: Deploy files to hosting
    // Priority: R2 (scalable) > FTP (legacy) > Plesk API (complex)
    console.log('Deploying files to hosting space...')

    let deploymentMethod = 'none'
    let deploymentUrl = `https://${fullDomain}`

    // Option 1: Cloudflare R2 (RECOMMENDED for 10,000+ sites)
    if (isR2Configured()) {
      console.log('Using R2 deployment (scalable for 10,000+ sites)...')

      const r2Result = await deployToR2(
        subdomain,
        tmpDir,
        exportResult.files || []
      )

      if (!r2Result.success) {
        throw new Error(`R2 deployment failed: ${r2Result.error}`)
      }

      deploymentMethod = 'r2'
      if (r2Result.url) deploymentUrl = r2Result.url
      console.log(`✓ Deployed to R2: ${deploymentUrl}`)

    }
    // Option 2: FTP deployment (for smaller scale or legacy)
    else if (getFTPConfig()) {
      console.log('Using FTP deployment...')

      const ftpResult = await deployFilesToPlesk(
        tmpDir,
        subdomainId!,
        exportResult.files || []
      )

      if (!ftpResult.success) {
        throw new Error(`FTP deployment failed: ${ftpResult.error}`)
      }

      deploymentMethod = 'ftp'
      console.log(`✓ Deployed via FTP`)

    }
    // Option 3: Plesk API (if configured and used for subdomain)
    else if (subdomainMethod === 'plesk' && subdomainId) {
      console.log('Using Plesk API deployment...')

      const pleskResult = await deployFilesToPlesk(
        tmpDir,
        subdomainId,
        exportResult.files || []
      )

      if (!pleskResult.success) {
        // Rollback: Delete the Plesk subdomain we created
        if (subdomainCreated && subdomainId) {
          const pleskAPI = getPleskAPI()
          await pleskAPI.deleteSubdomain(subdomainId)
        }
        throw new Error(`Plesk deployment failed: ${pleskResult.error}`)
      }

      deploymentMethod = 'plesk'
      console.log(`✓ Deployed via Plesk API`)

    }
    // No deployment method configured
    else {
      console.warn('⚠ No deployment method configured - files exported but not deployed')
      console.warn('Configure one of: R2 (recommended), FTP, or Plesk API')
      console.warn('See SCALABLE_HOSTING.md for R2 setup (handles 10,000+ sites)')
    }

    // Clean up temporary directory
    await fs.rm(tmpDir, { recursive: true, force: true })

    // Step 6: Update database with published info
    const publishedUrl = `https://${fullDomain}`
    const { error: publishError } = await supabase
      .from('websites')
      .update({
        published: true,
        subdomain,
        parent_domain: parentDomain,
        published_url: publishedUrl,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subdomain_method: subdomainMethod,
        plesk_subdomain_id: subdomainId,
      })
      .eq('id', websiteId)

    if (publishError) {
      console.error('Error updating website record:', publishError)
      // Don't rollback here - the site is already published
    }

    console.log(`Website published successfully: ${publishedUrl}`)
    console.log(`Subdomain method: ${subdomainMethod}, Deployment method: ${deploymentMethod}`)

    return NextResponse.json({
      success: true,
      message: 'Website published successfully!',
      publishedUrl,
      imagesSaved: imageResult.savedCount,
      imageErrors: imageResult.errors,
    })
  } catch (error: any) {
    console.error('Error publishing website:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to publish website' },
      { status: 500 }
    )
  }
}

/**
 * Deploy files to hosting space via FTP
 */
async function deployFilesToPlesk(
  localDir: string,
  subdomainId: number,
  files: string[]
): Promise<{ success: boolean; error?: string; filesUploaded?: number }> {
  try {
    console.log(`Deploying ${files.length} files...`)

    // Check if FTP is configured
    const ftpConfig = getFTPConfig()

    if (!ftpConfig) {
      console.warn('FTP not configured - skipping file deployment')
      console.warn('To enable FTP deployment, add to .env.local:')
      console.warn('  FTP_HOST=ftp.yourdomain.com')
      console.warn('  FTP_USER=your-ftp-username')
      console.warn('  FTP_PASSWORD=your-ftp-password')
      return { success: true } // Don't fail, just skip
    }

    // Determine remote path
    // For subdomains in Plesk, typically: /httpdocs or /subdomain-name
    const remotePath = process.env.FTP_REMOTE_PATH || '/httpdocs'

    console.log(`Uploading to: ${ftpConfig.user}@${ftpConfig.host}:${remotePath}`)

    // Deploy via FTP
    const result = await deployViaFTP(
      localDir,
      remotePath,
      files,
      ftpConfig
    )

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'FTP deployment failed',
      }
    }

    console.log(`✓ Successfully uploaded ${result.filesUploaded} files via FTP`)

    return {
      success: true,
      filesUploaded: result.filesUploaded,
    }

  } catch (error: any) {
    console.error('Error deploying files:', error)
    return {
      success: false,
      error: error.message || 'Unknown error deploying files',
    }
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { websiteId } = body

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    // Verify website ownership
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('id, user_id')
      .eq('id', websiteId)
      .eq('user_id', user.id)
      .single()

    if (websiteError || !website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Unpublish the website
    const { error: unpublishError } = await supabase
      .from('websites')
      .update({
        published: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', websiteId)

    if (unpublishError) {
      throw unpublishError
    }

    return NextResponse.json({
      success: true,
      message: 'Website unpublished successfully',
    })
  } catch (error: any) {
    console.error('Error unpublishing website:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to unpublish website' },
      { status: 500 }
    )
  }
}
