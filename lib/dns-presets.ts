/**
 * DNS Configuration Presets
 *
 * Pre-configured DNS records for common services like email forwarding,
 * domain verification, and third-party integrations.
 */

export interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV'
  name: string
  value: string
  priority?: number
  ttl: number
  description?: string
}

export interface DNSPreset {
  id: string
  name: string
  description: string
  provider: string
  category: 'email' | 'verification' | 'hosting' | 'cdn' | 'other'
  records: DNSRecord[]
  instructions?: string[]
  documentationUrl?: string
}

/**
 * Google Workspace Email Forwarding DNS Records
 */
export const GOOGLE_WORKSPACE_EMAIL_PRESET: DNSPreset = {
  id: 'google-workspace-email',
  name: 'Google Workspace Email Forwarding',
  description: 'Forward your domain emails to Google Workspace (Gmail for Business)',
  provider: 'Google',
  category: 'email',
  records: [
    {
      type: 'MX',
      name: '@',
      value: 'SMTP.GOOGLE.COM',
      priority: 1,
      ttl: 3600,
      description: 'Primary mail server for Google Workspace'
    },
    {
      type: 'MX',
      name: '@',
      value: 'ALT1.ASPMX.L.GOOGLE.COM',
      priority: 5,
      ttl: 3600,
      description: 'Backup mail server 1'
    },
    {
      type: 'MX',
      name: '@',
      value: 'ALT2.ASPMX.L.GOOGLE.COM',
      priority: 5,
      ttl: 3600,
      description: 'Backup mail server 2'
    },
    {
      type: 'MX',
      name: '@',
      value: 'ALT3.ASPMX.L.GOOGLE.COM',
      priority: 10,
      ttl: 3600,
      description: 'Backup mail server 3'
    },
    {
      type: 'MX',
      name: '@',
      value: 'ALT4.ASPMX.L.GOOGLE.COM',
      priority: 10,
      ttl: 3600,
      description: 'Backup mail server 4'
    }
  ],
  instructions: [
    'Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)',
    'Navigate to DNS Management or DNS Records section',
    'Delete any existing MX records for your domain',
    'Add all 5 MX records listed above with their exact priorities',
    'Wait 24-48 hours for DNS propagation',
    'Verify email is working by sending a test email to your domain'
  ],
  documentationUrl: 'https://support.google.com/a/answer/140034'
}

/**
 * Simplified Google Workspace (Single MX Record - Basic Setup)
 */
export const GOOGLE_WORKSPACE_SIMPLE_PRESET: DNSPreset = {
  id: 'google-workspace-simple',
  name: 'Google Workspace Email (Simplified)',
  description: 'Basic email forwarding with single primary MX record',
  provider: 'Google',
  category: 'email',
  records: [
    {
      type: 'MX',
      name: '@',
      value: 'SMTP.GOOGLE.COM',
      priority: 1,
      ttl: 3600,
      description: 'Primary Google Workspace mail server'
    }
  ],
  instructions: [
    'Log in to your domain registrar',
    'Go to DNS Management',
    'Add this MX record with priority 1',
    'Save and wait for DNS propagation (up to 48 hours)'
  ],
  documentationUrl: 'https://support.google.com/a/answer/140034'
}

/**
 * Microsoft 365 Email Forwarding
 */
export const MICROSOFT_365_EMAIL_PRESET: DNSPreset = {
  id: 'microsoft-365-email',
  name: 'Microsoft 365 Email',
  description: 'Configure email forwarding for Microsoft 365 (Office 365)',
  provider: 'Microsoft',
  category: 'email',
  records: [
    {
      type: 'MX',
      name: '@',
      value: 'yourdomain-com.mail.protection.outlook.com',
      priority: 0,
      ttl: 3600,
      description: 'Replace "yourdomain-com" with your actual domain (use dashes instead of dots)'
    }
  ],
  instructions: [
    'Log in to Microsoft 365 Admin Center',
    'Go to Settings > Domains > Your Domain',
    'Copy your exact MX record value (it will look like: yourdomain-com.mail.protection.outlook.com)',
    'Add this MX record in your domain registrar DNS settings',
    'Set priority to 0',
    'Wait 24-48 hours for propagation'
  ],
  documentationUrl: 'https://learn.microsoft.com/en-us/microsoft-365/admin/get-help-with-domains/create-dns-records-at-any-dns-hosting-provider'
}

/**
 * Cloudflare Email Routing
 */
export const CLOUDFLARE_EMAIL_PRESET: DNSPreset = {
  id: 'cloudflare-email',
  name: 'Cloudflare Email Routing',
  description: 'Free email forwarding using Cloudflare Email Routing',
  provider: 'Cloudflare',
  category: 'email',
  records: [
    {
      type: 'MX',
      name: '@',
      value: 'route1.mx.cloudflare.net',
      priority: 10,
      ttl: 3600,
      description: 'Primary Cloudflare email router'
    },
    {
      type: 'MX',
      name: '@',
      value: 'route2.mx.cloudflare.net',
      priority: 20,
      ttl: 3600,
      description: 'Secondary Cloudflare email router'
    },
    {
      type: 'MX',
      name: '@',
      value: 'route3.mx.cloudflare.net',
      priority: 30,
      ttl: 3600,
      description: 'Tertiary Cloudflare email router'
    }
  ],
  instructions: [
    'Log in to your Cloudflare dashboard',
    'Select your domain',
    'Go to Email > Email Routing',
    'Enable Email Routing',
    'Add destination email addresses',
    'Cloudflare will automatically configure MX records',
    'Create email forwarding rules as needed'
  ],
  documentationUrl: 'https://developers.cloudflare.com/email-routing/'
}

/**
 * All available DNS presets
 */
export const DNS_PRESETS: DNSPreset[] = [
  GOOGLE_WORKSPACE_SIMPLE_PRESET,
  GOOGLE_WORKSPACE_EMAIL_PRESET,
  MICROSOFT_365_EMAIL_PRESET,
  CLOUDFLARE_EMAIL_PRESET
]

/**
 * Get a specific DNS preset by ID
 */
export function getDNSPreset(id: string): DNSPreset | undefined {
  return DNS_PRESETS.find(preset => preset.id === id)
}

/**
 * Get DNS presets by category
 */
export function getDNSPresetsByCategory(category: DNSPreset['category']): DNSPreset[] {
  return DNS_PRESETS.filter(preset => preset.category === category)
}

/**
 * Format DNS record for display
 */
export function formatDNSRecord(record: DNSRecord, domain: string = 'yourdomain.com'): string {
  const name = record.name === '@' ? domain : `${record.name}.${domain}`
  const priority = record.priority !== undefined ? ` (Priority: ${record.priority})` : ''
  return `${record.type} ${name} → ${record.value}${priority} (TTL: ${record.ttl})`
}

/**
 * Generate instructions for a DNS preset
 */
export function generateDNSInstructions(preset: DNSPreset, domain?: string): {
  title: string
  description: string
  records: Array<{
    formatted: string
    record: DNSRecord
  }>
  steps: string[]
  documentation?: string
} {
  return {
    title: preset.name,
    description: preset.description,
    records: preset.records.map(record => ({
      formatted: formatDNSRecord(record, domain),
      record
    })),
    steps: preset.instructions || [],
    documentation: preset.documentationUrl
  }
}
