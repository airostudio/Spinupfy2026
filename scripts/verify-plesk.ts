#!/usr/bin/env tsx
/**
 * Plesk Infrastructure Verification Script
 *
 * This script verifies that your Plesk publishing infrastructure is properly configured
 * and can connect to your Plesk server.
 *
 * Usage: npx tsx scripts/verify-plesk.ts
 */

import { getPleskAPI } from '../lib/plesk-api'
import { generateUniqueSubdomain } from '../lib/subdomain-generator'

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function checkMark() {
  return `${colors.green}✓${colors.reset}`
}

function crossMark() {
  return `${colors.red}✗${colors.reset}`
}

function warningMark() {
  return `${colors.yellow}⚠${colors.reset}`
}

async function main() {
  console.log('\n' + '='.repeat(70))
  log('  PLESK PUBLISHING INFRASTRUCTURE VERIFICATION', colors.bold + colors.cyan)
  console.log('='.repeat(70) + '\n')

  // Step 1: Check environment variables
  log('Step 1: Checking Environment Variables', colors.bold)
  console.log('')

  const requiredVars = {
    'PLESK_HOST': process.env.PLESK_HOST,
    'PLESK_API_KEY': process.env.PLESK_API_KEY,
    'PLESK_PARENT_DOMAIN': process.env.PLESK_PARENT_DOMAIN || 'webese.ai (default)',
  }

  const optionalVars = {
    'PLESK_PORT': process.env.PLESK_PORT || '8443 (default)',
    'PLESK_USE_HTTPS': process.env.PLESK_USE_HTTPS || 'true (default)',
  }

  let allConfigured = true

  for (const [key, value] of Object.entries(requiredVars)) {
    if (value && !value.includes('(default)')) {
      log(`  ${checkMark()} ${key}: ${value}`, colors.green)
    } else if (value && value.includes('(default)')) {
      log(`  ${warningMark()} ${key}: ${value}`, colors.yellow)
    } else {
      log(`  ${crossMark()} ${key}: NOT SET`, colors.red)
      allConfigured = false
    }
  }

  console.log('')
  log('  Optional Variables:', colors.blue)
  for (const [key, value] of Object.entries(optionalVars)) {
    log(`  ${checkMark()} ${key}: ${value}`, colors.cyan)
  }

  console.log('')

  if (!allConfigured) {
    log('❌ PLESK NOT CONFIGURED', colors.red + colors.bold)
    console.log('')
    log('To configure Plesk, add these to your .env.local file:', colors.yellow)
    console.log('')
    console.log('  PLESK_HOST=your-plesk-server.com')
    console.log('  PLESK_API_KEY=your-api-key-here')
    console.log('  PLESK_PARENT_DOMAIN=webese.ai')
    console.log('')
    log('How to get your Plesk API Key:', colors.cyan)
    console.log('  1. Log in to your Plesk panel')
    console.log('  2. Go to Tools & Settings → API Keys')
    console.log('  3. Click "Create API Key"')
    console.log('  4. Name it "Webese AI Publisher" and copy the key')
    console.log('')
    process.exit(1)
  }

  log('✓ All required environment variables are set!', colors.green + colors.bold)
  console.log('')

  // Step 2: Test subdomain generation
  log('Step 2: Testing Subdomain Generator', colors.bold)
  console.log('')

  const testSubdomains = []
  for (let i = 0; i < 5; i++) {
    const subdomain = generateUniqueSubdomain(testSubdomains)
    testSubdomains.push(subdomain)
    log(`  ${checkMark()} Generated: ${subdomain}.${process.env.PLESK_PARENT_DOMAIN}`, colors.green)
  }

  console.log('')
  log('✓ Subdomain generator working!', colors.green + colors.bold)
  console.log('')

  // Step 3: Test Plesk API connection
  log('Step 3: Testing Plesk API Connection', colors.bold)
  console.log('')

  try {
    const pleskAPI = getPleskAPI()
    log('  → Attempting to connect to Plesk...', colors.cyan)

    // Try to list domains (this verifies API key and connectivity)
    const response = await pleskAPI['makeRequest']('domains', 'GET')

    if (Array.isArray(response)) {
      log(`  ${checkMark()} Connected successfully!`, colors.green)
      log(`  ${checkMark()} Found ${response.length} domain(s) on server`, colors.green)
      console.log('')

      if (response.length > 0) {
        log('  Available domains:', colors.blue)
        response.slice(0, 5).forEach((domain: any) => {
          log(`    • ${domain.name} (ID: ${domain.id})`, colors.cyan)
        })
        if (response.length > 5) {
          log(`    ... and ${response.length - 5} more`, colors.cyan)
        }
      }
    } else {
      log(`  ${checkMark()} API responded, but unexpected format`, colors.yellow)
    }

    console.log('')
    log('✓ Plesk API connection successful!', colors.green + colors.bold)
    console.log('')

  } catch (error: any) {
    log(`  ${crossMark()} Connection failed!`, colors.red)
    console.log('')
    log('Error details:', colors.red)
    console.log(`  ${error.message}`)
    console.log('')
    log('Common issues:', colors.yellow)
    console.log('  • Incorrect API key')
    console.log('  • Firewall blocking connection to Plesk')
    console.log('  • Wrong PLESK_HOST value')
    console.log('  • API key doesn\'t have required permissions')
    console.log('')
    process.exit(1)
  }

  // Step 4: Verify parent domain exists
  log('Step 4: Verifying Parent Domain', colors.bold)
  console.log('')

  try {
    const pleskAPI = getPleskAPI()
    const domains = await pleskAPI['makeRequest']('domains', 'GET')
    const parentDomain = process.env.PLESK_PARENT_DOMAIN || 'webese.ai'
    const domainExists = domains.find((d: any) => d.name === parentDomain)

    if (domainExists) {
      log(`  ${checkMark()} Parent domain "${parentDomain}" exists on server!`, colors.green)
      log(`  ${checkMark()} Domain ID: ${domainExists.id}`, colors.green)
      console.log('')
      log('✓ Ready to create subdomains!', colors.green + colors.bold)
    } else {
      log(`  ${crossMark()} Parent domain "${parentDomain}" NOT FOUND on server!`, colors.red)
      console.log('')
      log('Available domains on your Plesk server:', colors.yellow)
      domains.forEach((d: any) => log(`  • ${d.name}`, colors.cyan))
      console.log('')
      log('Action required:', colors.yellow)
      console.log(`  Update PLESK_PARENT_DOMAIN in .env.local to one of the domains above,`)
      console.log(`  OR add "${parentDomain}" to your Plesk server first.`)
      console.log('')
      process.exit(1)
    }

  } catch (error: any) {
    log(`  ${crossMark()} Failed to verify parent domain`, colors.red)
    console.log(`  Error: ${error.message}`)
    process.exit(1)
  }

  // Final Summary
  console.log('')
  console.log('='.repeat(70))
  log('  ✓ ALL CHECKS PASSED!', colors.green + colors.bold)
  console.log('='.repeat(70))
  console.log('')
  log('Your Plesk publishing infrastructure is ready to use!', colors.green)
  console.log('')
  log('Next steps:', colors.cyan)
  console.log('  1. Implement FTP deployment in app/api/websites/publish/route.ts')
  console.log('  2. Test publishing a website from the dashboard')
  console.log('  3. Monitor logs with: vercel logs (production) or npm run dev (local)')
  console.log('')
  log('Note: File deployment is currently a placeholder.', colors.yellow)
  log('See PLESK_SETUP.md for FTP/SFTP implementation examples.', colors.yellow)
  console.log('')
}

main().catch((error) => {
  console.error('')
  log('❌ Verification failed with error:', colors.red + colors.bold)
  console.error(error)
  process.exit(1)
})
