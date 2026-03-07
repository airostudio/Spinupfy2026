'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  Check,
  X,
  Globe,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  FileCode,
  Upload,
  Database,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui'
import toast from 'react-hot-toast'

interface PublishStep {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'in_progress' | 'completed' | 'error'
}

interface PublishProgressModalProps {
  isOpen: boolean
  onClose: () => void
  websiteId: string
  websiteName: string
  onPublishComplete: (publishedUrl: string) => void
}

export function PublishProgressModal({
  isOpen,
  onClose,
  websiteId,
  websiteName,
  onPublishComplete,
}: PublishProgressModalProps) {
  const [steps, setSteps] = useState<PublishStep[]>([
    {
      id: 'images',
      label: 'Saving Images',
      description: 'Saving your images to permanent storage',
      icon: <ImageIcon className="w-5 h-5" />,
      status: 'pending',
    },
    {
      id: 'subdomain',
      label: 'Creating Subdomain',
      description: 'Generating your unique website address',
      icon: <Globe className="w-5 h-5" />,
      status: 'pending',
    },
    {
      id: 'export',
      label: 'Exporting Website',
      description: 'Generating static files for your site',
      icon: <FileCode className="w-5 h-5" />,
      status: 'pending',
    },
    {
      id: 'deploy',
      label: 'Deploying',
      description: 'Uploading files to the web',
      icon: <Upload className="w-5 h-5" />,
      status: 'pending',
    },
    {
      id: 'finalize',
      label: 'Finalizing',
      description: 'Making your website live',
      icon: <Database className="w-5 h-5" />,
      status: 'pending',
    },
  ])

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen && !isPublishing && !publishedUrl && !error) {
      startPublishing()
    }
  }, [isOpen])

  const updateStepStatus = (stepId: string, status: PublishStep['status']) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const startPublishing = async () => {
    setIsPublishing(true)
    setError(null)
    setPublishedUrl(null)
    setCurrentStepIndex(0)

    // Reset all steps to pending
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })))

    // Simulate step progression while API call happens
    const stepIds = ['images', 'subdomain', 'export', 'deploy', 'finalize']

    // Start with first step
    updateStepStatus('images', 'in_progress')
    setCurrentStepIndex(0)

    try {
      // Create a promise that progresses steps while waiting for API
      const progressPromise = (async () => {
        // Simulate image saving (1.5s)
        await new Promise(resolve => setTimeout(resolve, 1500))
        updateStepStatus('images', 'completed')
        updateStepStatus('subdomain', 'in_progress')
        setCurrentStepIndex(1)

        // Simulate subdomain creation (1s)
        await new Promise(resolve => setTimeout(resolve, 1000))
        updateStepStatus('subdomain', 'completed')
        updateStepStatus('export', 'in_progress')
        setCurrentStepIndex(2)

        // Simulate export (2s)
        await new Promise(resolve => setTimeout(resolve, 2000))
        updateStepStatus('export', 'completed')
        updateStepStatus('deploy', 'in_progress')
        setCurrentStepIndex(3)

        // Simulate deploy (2s)
        await new Promise(resolve => setTimeout(resolve, 2000))
        updateStepStatus('deploy', 'completed')
        updateStepStatus('finalize', 'in_progress')
        setCurrentStepIndex(4)
      })()

      // Call the actual API
      const response = await fetch('/api/websites/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId }),
      })

      const data = await response.json()

      // Wait for visual progress to catch up
      await progressPromise

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish website')
      }

      // Mark final step as completed
      updateStepStatus('finalize', 'completed')
      setCurrentStepIndex(5)

      // Wait a moment before showing success
      await new Promise(resolve => setTimeout(resolve, 500))

      const url = data.publishedUrl || `${window.location.origin}/site/${websiteId}`
      setPublishedUrl(url)
      onPublishComplete(url)
    } catch (err: any) {
      console.error('Publish error:', err)
      setError(err.message || 'An error occurred while publishing')

      // Mark current step as error
      const currentStep = stepIds[currentStepIndex]
      if (currentStep) {
        updateStepStatus(currentStep, 'error')
      }
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCopyUrl = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl)
      setCopied(true)
      toast.success('URL copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleVisitSite = () => {
    if (publishedUrl) {
      window.open(publishedUrl, '_blank')
    }
  }

  const handleClose = () => {
    if (!isPublishing) {
      onClose()
    }
  }

  const completedSteps = steps.filter(s => s.status === 'completed').length
  const progress = (completedSteps / steps.length) * 100

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {publishedUrl ? (
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                ) : error ? (
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {publishedUrl ? 'Published!' : error ? 'Publishing Failed' : 'Publishing Website'}
                  </h2>
                  <p className="text-sm text-gray-400">{websiteName}</p>
                </div>
              </div>
              {!isPublishing && (
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Progress Bar */}
            {!publishedUrl && !error && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-white">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Steps */}
            {!publishedUrl && (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      step.status === 'in_progress'
                        ? 'bg-primary-500/10 border border-primary-500/30'
                        : step.status === 'completed'
                        ? 'bg-green-500/10 border border-green-500/20'
                        : step.status === 'error'
                        ? 'bg-red-500/10 border border-red-500/20'
                        : 'bg-gray-800/50 border border-transparent'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.status === 'in_progress'
                        ? 'bg-primary-500/20 text-primary-400'
                        : step.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : step.status === 'error'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-700 text-gray-500'
                    }`}>
                      {step.status === 'in_progress' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : step.status === 'completed' ? (
                        <Check className="w-5 h-5" />
                      ) : step.status === 'error' ? (
                        <X className="w-5 h-5" />
                      ) : (
                        step.icon
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium ${
                        step.status === 'in_progress'
                          ? 'text-white'
                          : step.status === 'completed'
                          ? 'text-green-400'
                          : step.status === 'error'
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}>
                        {step.label}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Success State */}
            {publishedUrl && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-2">
                  Your website is live!
                </h3>
                <p className="text-gray-400 mb-6">
                  Your website has been published and is now accessible to everyone
                </p>

                {/* URL Display */}
                <div className="bg-gray-800 rounded-xl p-4 mb-6">
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Your Website URL
                  </label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary-400 flex-shrink-0" />
                    <a
                      href={publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-primary-400 hover:text-primary-300 text-left font-medium truncate transition-colors"
                    >
                      {publishedUrl}
                    </a>
                    <button
                      onClick={handleCopyUrl}
                      className={`p-2 rounded-lg transition-colors ${
                        copied
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                      }`}
                      title="Copy URL"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    leftIcon={<Copy className="w-4 h-4" />}
                    onClick={handleCopyUrl}
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    leftIcon={<ExternalLink className="w-4 h-4" />}
                    onClick={handleVisitSite}
                  >
                    Visit Site
                  </Button>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Publishing Failed
                </h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={startPublishing}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
