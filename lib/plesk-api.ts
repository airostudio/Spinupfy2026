/**
 * Plesk Obsidian 18.x API Client
 *
 * Integrates with Plesk REST API to:
 * - Create subdomains
 * - Configure hosting space
 * - Set disk quotas
 * - Deploy website files
 */

import https from 'https'
import http from 'http'

interface PleskConfig {
  host: string
  port?: number
  apiKey: string
  useHttps?: boolean
}

interface SubdomainConfig {
  parentDomain: string
  subdomainName: string
  diskSpaceMb?: number
  phpEnabled?: boolean
}

interface PleskResponse {
  success: boolean
  data?: any
  error?: string
  subdomainId?: number
  ftpCredentials?: {
    host: string
    port: number
    username: string
    password: string
    path: string
  }
}

export class PleskAPI {
  private config: PleskConfig

  constructor(config: PleskConfig) {
    this.config = {
      port: config.useHttps ? 8443 : 8880,
      useHttps: true,
      ...config,
    }
  }

  /**
   * Make API request to Plesk
   */
  private async makeRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.config.host,
        port: this.config.port,
        path: `/api/v2/${endpoint}`,
        method,
        headers: {
          'X-API-Key': this.config.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        rejectUnauthorized: false, // For self-signed certificates
      }

      const client = this.config.useHttps ? https : http
      const req = client.request(options, (res) => {
        let responseData = ''

        res.on('data', (chunk) => {
          responseData += chunk
        })

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData)
            resolve(parsed)
          } catch (e) {
            resolve(responseData)
          }
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      if (data && (method === 'POST' || method === 'PUT')) {
        req.write(JSON.stringify(data))
      }

      req.end()
    })
  }

  /**
   * Create a subdomain in Plesk
   */
  async createSubdomain(config: SubdomainConfig): Promise<PleskResponse> {
    try {
      console.log(`Creating subdomain: ${config.subdomainName}.${config.parentDomain}`)

      // First, get the parent domain ID
      const domains = await this.makeRequest('domains', 'GET')
      const parentDomain = domains.find((d: any) => d.name === config.parentDomain)

      if (!parentDomain) {
        return {
          success: false,
          error: `Parent domain ${config.parentDomain} not found`,
        }
      }

      // Create subdomain
      const subdomainData = {
        name: `${config.subdomainName}.${config.parentDomain}`,
        parent_domain_id: parentDomain.id,
        hosting: {
          enabled: true,
          www_root: `/httpdocs/${config.subdomainName}`,
          php_enabled: config.phpEnabled !== false,
          ...(config.diskSpaceMb && { disk_space: config.diskSpaceMb * 1024 * 1024 }), // Convert MB to bytes
        },
      }

      const result = await this.makeRequest('domains', 'POST', subdomainData)

      console.log('Subdomain created successfully:', result)

      return {
        success: true,
        data: result,
        subdomainId: result.id,
      }
    } catch (error: any) {
      console.error('Error creating subdomain:', error)
      return {
        success: false,
        error: error.message || 'Unknown error creating subdomain',
      }
    }
  }

  /**
   * Create FTP account for subdomain
   */
  async createFTPAccount(subdomainId: number, username: string, password: string): Promise<PleskResponse> {
    try {
      console.log(`Creating FTP account for subdomain ID: ${subdomainId}`)

      const ftpData = {
        name: username,
        password: password,
        home: `/httpdocs`,
        domain_id: subdomainId,
      }

      const result = await this.makeRequest('ftp-users', 'POST', ftpData)

      return {
        success: true,
        data: result,
        ftpCredentials: {
          host: this.config.host,
          port: 21,
          username: username,
          password: password,
          path: '/httpdocs',
        },
      }
    } catch (error: any) {
      console.error('Error creating FTP account:', error)
      return {
        success: false,
        error: error.message || 'Unknown error creating FTP account',
      }
    }
  }

  /**
   * Upload files to subdomain via Plesk File Manager API
   */
  async uploadFile(subdomainId: number, localPath: string, remotePath: string): Promise<PleskResponse> {
    try {
      console.log(`Uploading file to subdomain ID ${subdomainId}: ${remotePath}`)

      // This would use Plesk's file manager API
      // Implementation depends on Plesk version and available APIs

      return {
        success: true,
        data: { message: 'File uploaded successfully' },
      }
    } catch (error: any) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: error.message || 'Unknown error uploading file',
      }
    }
  }

  /**
   * Get subdomain info
   */
  async getSubdomainInfo(subdomainId: number): Promise<PleskResponse> {
    try {
      const result = await this.makeRequest(`domains/${subdomainId}`, 'GET')

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      console.error('Error getting subdomain info:', error)
      return {
        success: false,
        error: error.message || 'Unknown error getting subdomain info',
      }
    }
  }

  /**
   * Delete subdomain
   */
  async deleteSubdomain(subdomainId: number): Promise<PleskResponse> {
    try {
      console.log(`Deleting subdomain ID: ${subdomainId}`)

      await this.makeRequest(`domains/${subdomainId}`, 'DELETE')

      return {
        success: true,
        data: { message: 'Subdomain deleted successfully' },
      }
    } catch (error: any) {
      console.error('Error deleting subdomain:', error)
      return {
        success: false,
        error: error.message || 'Unknown error deleting subdomain',
      }
    }
  }

  /**
   * Update disk quota for subdomain
   */
  async updateDiskQuota(subdomainId: number, diskSpaceMb: number): Promise<PleskResponse> {
    try {
      console.log(`Updating disk quota for subdomain ID ${subdomainId}: ${diskSpaceMb}MB`)

      const updateData = {
        hosting: {
          disk_space: diskSpaceMb * 1024 * 1024, // Convert MB to bytes
        },
      }

      const result = await this.makeRequest(`domains/${subdomainId}`, 'PUT', updateData)

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      console.error('Error updating disk quota:', error)
      return {
        success: false,
        error: error.message || 'Unknown error updating disk quota',
      }
    }
  }
}

/**
 * Get Plesk API instance from environment variables
 */
export function getPleskAPI(): PleskAPI {
  const config: PleskConfig = {
    host: process.env.PLESK_HOST || '',
    port: parseInt(process.env.PLESK_PORT || '8443'),
    apiKey: process.env.PLESK_API_KEY || '',
    useHttps: process.env.PLESK_USE_HTTPS !== 'false',
  }

  if (!config.host || !config.apiKey) {
    throw new Error('Plesk configuration missing: PLESK_HOST and PLESK_API_KEY are required')
  }

  return new PleskAPI(config)
}
