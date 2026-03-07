'use client'

import { useState } from 'react'
import { Card, CardContent, Button } from '@/components/ui'
import { Copy, Check, ExternalLink, ChevronDown, ChevronUp, Mail } from 'lucide-react'
import { DNSPreset, DNSRecord } from '@/lib/dns-presets'
import toast from 'react-hot-toast'

interface DNSPresetCardProps {
  preset: DNSPreset
  domain?: string
  isExpanded?: boolean
}

export function DNSPresetCard({ preset, domain = 'yourdomain.com', isExpanded: defaultExpanded = false }: DNSPresetCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [copiedRecords, setCopiedRecords] = useState<Set<number>>(new Set())

  const handleCopyRecord = async (record: DNSRecord, index: number) => {
    const textToCopy = `Type: ${record.type}\nName: ${record.name}\nValue: ${record.value}\n${record.priority !== undefined ? `Priority: ${record.priority}\n` : ''}TTL: ${record.ttl}`

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopiedRecords(prev => new Set(prev).add(index))
      toast.success('DNS record copied to clipboard')

      setTimeout(() => {
        setCopiedRecords(prev => {
          const newSet = new Set(prev)
          newSet.delete(index)
          return newSet
        })
      }, 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const getCategoryIcon = () => {
    switch (preset.category) {
      case 'email':
        return <Mail className="w-5 h-5" />
      default:
        return <Mail className="w-5 h-5" />
    }
  }

  const getCategoryColor = () => {
    switch (preset.category) {
      case 'email':
        return 'text-blue-400 bg-blue-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-800/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${getCategoryColor()} flex items-center justify-center`}>
              {getCategoryIcon()}
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white mb-1">{preset.name}</h3>
              <p className="text-sm text-gray-400">{preset.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-300">
                  {preset.provider}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400">
                  {preset.records.length} record{preset.records.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-700/50">
            {/* DNS Records */}
            <div className="p-6 bg-gray-900/30">
              <h4 className="text-sm font-semibold text-white mb-4">DNS Records to Add:</h4>
              <div className="space-y-3">
                {preset.records.map((record, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="text-xs text-gray-500 uppercase">Type</label>
                            <p className="text-sm font-mono text-white mt-1">
                              <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded">
                                {record.type}
                              </span>
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 uppercase">Name</label>
                            <p className="text-sm font-mono text-white mt-1">{record.name}</p>
                          </div>
                        </div>

                        <div className="mb-2">
                          <label className="text-xs text-gray-500 uppercase">Value</label>
                          <p className="text-sm font-mono text-white mt-1 break-all">{record.value}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {record.priority !== undefined && (
                            <div>
                              <label className="text-xs text-gray-500 uppercase">Priority</label>
                              <p className="text-sm font-mono text-white mt-1">{record.priority}</p>
                            </div>
                          )}
                          <div>
                            <label className="text-xs text-gray-500 uppercase">TTL</label>
                            <p className="text-sm font-mono text-white mt-1">{record.ttl} seconds</p>
                          </div>
                        </div>

                        {record.description && (
                          <p className="text-xs text-gray-400 mt-3 italic">{record.description}</p>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyRecord(record, index)}
                        leftIcon={copiedRecords.has(index) ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        className={copiedRecords.has(index) ? 'bg-green-500/20 border-green-500' : ''}
                      >
                        {copiedRecords.has(index) ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            {preset.instructions && preset.instructions.length > 0 && (
              <div className="p-6 border-t border-gray-700/50">
                <h4 className="text-sm font-semibold text-white mb-4">Setup Instructions:</h4>
                <ol className="space-y-2">
                  {preset.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3 text-sm text-gray-300">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Documentation Link */}
            {preset.documentationUrl && (
              <div className="p-6 border-t border-gray-700/50">
                <a
                  href={preset.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Official Documentation
                </a>
              </div>
            )}

            {/* Warning */}
            <div className="p-6 border-t border-gray-700/50 bg-yellow-500/5">
              <div className="flex gap-3">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm text-yellow-400 font-medium mb-1">Important DNS Configuration Notes:</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• DNS changes can take 24-48 hours to fully propagate</li>
                    <li>• Always backup existing DNS records before making changes</li>
                    <li>• Test email functionality after DNS propagation is complete</li>
                    <li>• For {preset.provider}, ensure you have an active account before configuring DNS</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
