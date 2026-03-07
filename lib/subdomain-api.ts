/**
 * Subdomain API Service
 *
 * Handles subdomain creation on webese.ai via the airostudio server API.
 * Endpoint: https://server.airostudio.io/smb/web/add-subdomain
 */

// API Configuration
const SUBDOMAIN_API_URL = process.env.SUBDOMAIN_API_URL || 'https://server.airostudio.io/smb/web/add-subdomain'
const SUBDOMAIN_API_KEY = process.env.SUBDOMAIN_API_KEY || ''
const PARENT_DOMAIN = process.env.SUBDOMAIN_PARENT_DOMAIN || 'webese.ai'

export interface SubdomainCreateRequest {
  subdomain: string
  parentDomain?: string
  websiteId: string
  userId: string
}

export interface SubdomainCreateResponse {
  success: boolean
  subdomain?: string
  fullDomain?: string
  error?: string
  message?: string
}

/**
 * Check if the subdomain API is configured
 */
export function isSubdomainAPIConfigured(): boolean {
  return Boolean(process.env.SUBDOMAIN_API_URL || process.env.SUBDOMAIN_API_KEY)
}

/**
 * Get the parent domain for subdomains
 */
export function getParentDomain(): string {
  return PARENT_DOMAIN
}

/**
 * Create a subdomain via the airostudio server API
 *
 * @param request - Subdomain creation request
 * @returns Promise with creation result
 */
export async function createSubdomain(request: SubdomainCreateRequest): Promise<SubdomainCreateResponse> {
  const { subdomain, parentDomain = PARENT_DOMAIN, websiteId, userId } = request

  try {
    console.log(`Creating subdomain ${subdomain}.${parentDomain} via API...`)

    const response = await fetch(SUBDOMAIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SUBDOMAIN_API_KEY && { 'Authorization': `Bearer ${SUBDOMAIN_API_KEY}` }),
        ...(SUBDOMAIN_API_KEY && { 'X-API-Key': SUBDOMAIN_API_KEY }),
      },
      body: JSON.stringify({
        subdomain,
        parentDomain,
        websiteId,
        userId,
        // Include any additional metadata the server might need
        createdAt: new Date().toISOString(),
        source: 'webese-platform',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Subdomain API error (${response.status}):`, errorText)

      return {
        success: false,
        error: `API returned ${response.status}: ${errorText}`,
      }
    }

    const data = await response.json()

    // Handle various response formats from the API
    if (data.success === false || data.error) {
      return {
        success: false,
        error: data.error || data.message || 'Unknown error from subdomain API',
      }
    }

    const fullDomain = `${subdomain}.${parentDomain}`

    console.log(`Subdomain created successfully: ${fullDomain}`)

    return {
      success: true,
      subdomain,
      fullDomain,
      message: data.message || 'Subdomain created successfully',
    }
  } catch (error: any) {
    console.error('Error creating subdomain:', error)

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error: Unable to reach subdomain API server',
      }
    }

    return {
      success: false,
      error: error.message || 'Unknown error creating subdomain',
    }
  }
}

/**
 * Delete a subdomain via the airostudio server API
 *
 * @param subdomain - The subdomain to delete
 * @param parentDomain - Parent domain (defaults to webese.ai)
 * @returns Promise with deletion result
 */
export async function deleteSubdomain(
  subdomain: string,
  parentDomain: string = PARENT_DOMAIN
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Deleting subdomain ${subdomain}.${parentDomain} via API...`)

    const deleteUrl = process.env.SUBDOMAIN_API_DELETE_URL ||
      SUBDOMAIN_API_URL.replace('add-subdomain', 'delete-subdomain')

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(SUBDOMAIN_API_KEY && { 'Authorization': `Bearer ${SUBDOMAIN_API_KEY}` }),
        ...(SUBDOMAIN_API_KEY && { 'X-API-Key': SUBDOMAIN_API_KEY }),
      },
      body: JSON.stringify({
        subdomain,
        parentDomain,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Subdomain delete API error (${response.status}):`, errorText)

      return {
        success: false,
        error: `API returned ${response.status}: ${errorText}`,
      }
    }

    console.log(`Subdomain deleted successfully: ${subdomain}.${parentDomain}`)

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting subdomain:', error)

    return {
      success: false,
      error: error.message || 'Unknown error deleting subdomain',
    }
  }
}

/**
 * Check if a subdomain is available
 *
 * @param subdomain - The subdomain to check
 * @param parentDomain - Parent domain (defaults to webese.ai)
 * @returns Promise with availability result
 */
export async function checkSubdomainAvailability(
  subdomain: string,
  parentDomain: string = PARENT_DOMAIN
): Promise<{ available: boolean; error?: string }> {
  try {
    const checkUrl = process.env.SUBDOMAIN_API_CHECK_URL ||
      SUBDOMAIN_API_URL.replace('add-subdomain', 'check-subdomain')

    const response = await fetch(`${checkUrl}?subdomain=${encodeURIComponent(subdomain)}&parentDomain=${encodeURIComponent(parentDomain)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(SUBDOMAIN_API_KEY && { 'Authorization': `Bearer ${SUBDOMAIN_API_KEY}` }),
        ...(SUBDOMAIN_API_KEY && { 'X-API-Key': SUBDOMAIN_API_KEY }),
      },
    })

    if (!response.ok) {
      // If check endpoint doesn't exist, assume available
      if (response.status === 404) {
        return { available: true }
      }

      const errorText = await response.text()
      return {
        available: false,
        error: `API returned ${response.status}: ${errorText}`,
      }
    }

    const data = await response.json()
    return { available: Boolean(data.available) }
  } catch (error: any) {
    // If check fails, assume available and let creation handle conflicts
    console.warn('Error checking subdomain availability:', error.message)
    return { available: true }
  }
}

/**
 * Get subdomain info from the API
 *
 * @param subdomain - The subdomain to get info for
 * @param parentDomain - Parent domain (defaults to webese.ai)
 * @returns Promise with subdomain info
 */
export async function getSubdomainInfo(
  subdomain: string,
  parentDomain: string = PARENT_DOMAIN
): Promise<{
  exists: boolean
  subdomain?: string
  fullDomain?: string
  createdAt?: string
  error?: string
}> {
  try {
    const infoUrl = process.env.SUBDOMAIN_API_INFO_URL ||
      SUBDOMAIN_API_URL.replace('add-subdomain', 'subdomain-info')

    const response = await fetch(`${infoUrl}?subdomain=${encodeURIComponent(subdomain)}&parentDomain=${encodeURIComponent(parentDomain)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(SUBDOMAIN_API_KEY && { 'Authorization': `Bearer ${SUBDOMAIN_API_KEY}` }),
        ...(SUBDOMAIN_API_KEY && { 'X-API-Key': SUBDOMAIN_API_KEY }),
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { exists: false }
      }

      const errorText = await response.text()
      return {
        exists: false,
        error: `API returned ${response.status}: ${errorText}`,
      }
    }

    const data = await response.json()
    return {
      exists: true,
      subdomain: data.subdomain,
      fullDomain: data.fullDomain || `${subdomain}.${parentDomain}`,
      createdAt: data.createdAt,
    }
  } catch (error: any) {
    console.warn('Error getting subdomain info:', error.message)
    return {
      exists: false,
      error: error.message,
    }
  }
}
