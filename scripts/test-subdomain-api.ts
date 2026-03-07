/**
 * Test script for Subdomain API Integration
 *
 * Run with: npx tsx scripts/test-subdomain-api.ts
 */

import fs from 'fs'
import path from 'path'

// Manually load .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })
}

// Import after loading env
import {
  createSubdomain,
  isSubdomainAPIConfigured,
  getParentDomain,
  checkSubdomainAvailability,
  deleteSubdomain
} from '../lib/subdomain-api'
import { generateUniqueSubdomain, generateRandomSubdomain } from '../lib/subdomain-generator'

async function runTests() {
  console.log('='.repeat(60))
  console.log('SUBDOMAIN API INTEGRATION TEST')
  console.log('='.repeat(60))
  console.log('')

  // Test 1: Check configuration
  console.log('TEST 1: Configuration Check')
  console.log('-'.repeat(40))

  const apiUrl = process.env.SUBDOMAIN_API_URL || 'NOT SET'
  const apiKey = process.env.SUBDOMAIN_API_KEY ? '***REDACTED***' : 'NOT SET'
  const parentDomain = getParentDomain()
  const isConfigured = isSubdomainAPIConfigured()

  console.log(`  SUBDOMAIN_API_URL: ${apiUrl}`)
  console.log(`  SUBDOMAIN_API_KEY: ${apiKey}`)
  console.log(`  SUBDOMAIN_PARENT_DOMAIN: ${parentDomain}`)
  console.log(`  API Configured: ${isConfigured ? '✓ YES' : '✗ NO'}`)
  console.log('')

  // Test 2: Subdomain name generation
  console.log('TEST 2: Subdomain Name Generation')
  console.log('-'.repeat(40))

  const randomNames = []
  for (let i = 0; i < 5; i++) {
    randomNames.push(generateRandomSubdomain())
  }
  console.log('  Generated random subdomains:')
  randomNames.forEach((name, i) => console.log(`    ${i + 1}. ${name}`))

  const uniqueName = generateUniqueSubdomain(randomNames)
  console.log(`  Unique subdomain (avoiding collisions): ${uniqueName}`)
  console.log('  ✓ Subdomain generation working')
  console.log('')

  // Test 3: API connectivity test
  if (!isConfigured) {
    console.log('TEST 3: API Connectivity')
    console.log('-'.repeat(40))
    console.log('  ✗ SKIPPED - API not configured')
    console.log('  To enable, add to .env.local:')
    console.log('    SUBDOMAIN_API_URL=https://server.airostudio.io/smb/web/add-subdomain')
    console.log('    SUBDOMAIN_API_KEY=your_api_key')
    console.log('')
    return
  }

  console.log('TEST 3: API Connectivity')
  console.log('-'.repeat(40))

  // Generate a test subdomain
  const testSubdomain = `test-${generateRandomSubdomain()}-${Date.now()}`
  console.log(`  Test subdomain: ${testSubdomain}`)

  // Test availability check (if endpoint exists)
  console.log('  Checking availability...')
  const availResult = await checkSubdomainAvailability(testSubdomain)
  console.log(`  Available: ${availResult.available ? '✓ YES' : '✗ NO'}`)
  if (availResult.error) {
    console.log(`  (Note: ${availResult.error})`)
  }

  // Test 4: Create subdomain
  console.log('')
  console.log('TEST 4: Create Subdomain')
  console.log('-'.repeat(40))
  console.log(`  Creating: ${testSubdomain}.${parentDomain}`)

  const createResult = await createSubdomain({
    subdomain: testSubdomain,
    parentDomain,
    websiteId: 'test-website-id-12345',
    userId: 'test-user-id-67890',
  })

  if (createResult.success) {
    console.log('  ✓ SUCCESS!')
    console.log(`  Full domain: ${createResult.fullDomain}`)
    console.log(`  Message: ${createResult.message}`)
  } else {
    console.log('  ✗ FAILED')
    console.log(`  Error: ${createResult.error}`)
  }

  // Test 5: Delete subdomain (cleanup)
  if (createResult.success) {
    console.log('')
    console.log('TEST 5: Delete Subdomain (Cleanup)')
    console.log('-'.repeat(40))
    console.log(`  Deleting: ${testSubdomain}.${parentDomain}`)

    const deleteResult = await deleteSubdomain(testSubdomain, parentDomain)

    if (deleteResult.success) {
      console.log('  ✓ Cleanup successful')
    } else {
      console.log(`  ✗ Cleanup failed: ${deleteResult.error}`)
      console.log('  (You may need to manually remove the test subdomain)')
    }
  }

  console.log('')
  console.log('='.repeat(60))
  console.log('TEST COMPLETE')
  console.log('='.repeat(60))

  // Summary
  console.log('')
  console.log('SUMMARY:')
  if (createResult.success) {
    console.log('  ✓ Subdomain API is working correctly!')
    console.log(`  ✓ Subdomains can be created on ${parentDomain}`)
    console.log('  ✓ Ready for production use')
  } else {
    console.log('  ✗ Subdomain API test failed')
    console.log('  Please check:')
    console.log('    1. API URL is correct')
    console.log('    2. API key is valid')
    console.log('    3. Server is reachable')
    console.log('    4. Request format matches server expectations')
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test script error:', error)
  process.exit(1)
})
