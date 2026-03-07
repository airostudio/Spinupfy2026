'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wand2,
  Sparkles,
  Check,
  Globe,
  Palette,
  Image,
  Zap,
  Layout,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Search,
  Wifi,
  Lock,
  Server,
  FileQuestion,
  Clock,
} from 'lucide-react'

interface WebsiteImprovementProgressProps {
  websiteUrl: string
  onComplete: (websiteId: string) => void
  onError: (error: string) => void
  formData: any
}

interface ErrorInfo {
  message: string
  code: string
  suggestions: string[]
  icon: React.ElementType
}

const quickImprovementSteps = [
  { icon: Globe, text: 'Loading your website...', duration: 2000 },
  { icon: Sparkles, text: 'Analyzing brand colors and fonts...', duration: 3000 },
  { icon: Layout, text: 'Extracting content and structure...', duration: 3000 },
  { icon: Palette, text: 'Generating improved design...', duration: 4000 },
  { icon: Image, text: 'Creating enhanced images...', duration: 5000 },
  { icon: Zap, text: 'Modernizing content with AI...', duration: 4000 },
  { icon: Check, text: 'Finalizing your upgraded website...', duration: 2000 },
]

const fullReproductionSteps = [
  { icon: Globe, text: 'Loading your website...', duration: 2000 },
  { icon: Search, text: 'Crawling all pages (3 levels deep)...', duration: 5000 },
  { icon: Sparkles, text: 'Extracting color schemes and fonts...', duration: 3000 },
  { icon: Image, text: 'Capturing all images across pages...', duration: 4000 },
  { icon: Layout, text: 'Analyzing page structure and menu...', duration: 3000 },
  { icon: Palette, text: 'Preserving your brand identity...', duration: 3000 },
  { icon: Zap, text: 'Reproducing pages with improved content...', duration: 6000 },
  { icon: Layout, text: 'Linking pages to navigation menu...', duration: 3000 },
  { icon: Check, text: 'Finalizing your complete website...', duration: 2000 },
]

// Map error codes to user-friendly info
const getErrorInfo = (code: string, message: string): ErrorInfo => {
  const errorMap: Record<string, Omit<ErrorInfo, 'message'>> = {
    DOMAIN_NOT_FOUND: {
      code: 'DOMAIN_NOT_FOUND',
      icon: Search,
      suggestions: [
        'Double-check the spelling of the domain name',
        'Make sure the website is publicly accessible',
        'Try adding "www." or removing it from the URL',
        'Verify the domain hasn\'t expired',
      ],
    },
    NOT_FOUND: {
      code: 'NOT_FOUND',
      icon: FileQuestion,
      suggestions: [
        'Check if the URL path is correct',
        'Try using the homepage URL instead',
        'The page may have been moved or deleted',
        'Remove any trailing slashes or parameters',
      ],
    },
    TIMEOUT: {
      code: 'TIMEOUT',
      icon: Clock,
      suggestions: [
        'The website may be experiencing high traffic',
        'Check if the website loads in your browser',
        'Try again in a few minutes',
        'The server might be slow to respond',
      ],
    },
    CONNECTION_REFUSED: {
      code: 'CONNECTION_REFUSED',
      icon: Wifi,
      suggestions: [
        'The website server may be down',
        'The site might be blocking automated access',
        'Check if the website works in your browser',
        'Try again later',
      ],
    },
    FORBIDDEN: {
      code: 'FORBIDDEN',
      icon: Lock,
      suggestions: [
        'The website is blocking our access',
        'Try a different page on the website',
        'The site may require authentication',
        'Contact the website owner for access',
      ],
    },
    SERVER_ERROR: {
      code: 'SERVER_ERROR',
      icon: Server,
      suggestions: [
        'The website is experiencing technical issues',
        'This is a problem on their end, not yours',
        'Try again in a few minutes',
        'Check if the website works in your browser',
      ],
    },
    SSL_ERROR: {
      code: 'SSL_ERROR',
      icon: Lock,
      suggestions: [
        'The website\'s security certificate has issues',
        'Try using http:// instead of https://',
        'The certificate may have expired',
        'Contact the website owner about the SSL issue',
      ],
    },
    INVALID_URL_FORMAT: {
      code: 'INVALID_URL_FORMAT',
      icon: AlertTriangle,
      suggestions: [
        'Make sure the URL starts with http:// or https://',
        'Check for spaces or special characters',
        'Use a complete URL (e.g., https://example.com)',
        'Copy the URL directly from your browser',
      ],
    },
    EMPTY_CONTENT: {
      code: 'EMPTY_CONTENT',
      icon: FileQuestion,
      suggestions: [
        'The website may require JavaScript to load content',
        'Try using the main page URL',
        'The site might be under construction',
        'Some single-page apps may not work',
      ],
    },
    NETWORK_ERROR: {
      code: 'NETWORK_ERROR',
      icon: Wifi,
      suggestions: [
        'Check your internet connection',
        'The website may be temporarily unavailable',
        'Try again in a few moments',
        'Verify the URL is correct',
      ],
    },
    INVALID_RESPONSE: {
      code: 'INVALID_RESPONSE',
      icon: Server,
      suggestions: [
        'Our server returned an unexpected response',
        'This may be a temporary issue - try again',
        'The website being analyzed might be too complex',
        'Contact support if the issue persists',
      ],
    },
    EMPTY_RESPONSE: {
      code: 'EMPTY_RESPONSE',
      icon: Server,
      suggestions: [
        'Our server did not return any data',
        'This is usually a temporary issue - try again',
        'The server may be overloaded',
        'Try again in a few minutes',
      ],
    },
    JSON_PARSE_ERROR: {
      code: 'JSON_PARSE_ERROR',
      icon: AlertTriangle,
      suggestions: [
        'There was an error processing the server response',
        'This is usually a temporary issue - try again',
        'Our servers may be experiencing high load',
        'Contact support if the issue persists',
      ],
    },
  }

  const defaultError: Omit<ErrorInfo, 'message'> = {
    code: 'UNKNOWN_ERROR',
    icon: AlertTriangle,
    suggestions: [
      'Double-check the website URL for typos',
      'Make sure the website is publicly accessible',
      'Try again in a few moments',
      'Contact support if the issue persists',
    ],
  }

  const errorInfo = errorMap[code] || defaultError
  return { ...errorInfo, message }
}

export function WebsiteImprovementProgress({
  websiteUrl,
  onComplete,
  onError,
  formData,
}: WebsiteImprovementProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [websiteLoaded, setWebsiteLoaded] = useState(false)
  const [websiteScaled, setWebsiteScaled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [pagesFound, setPagesFound] = useState(0)

  // Select steps based on reproduction mode
  const isFullReproduction = formData?.fullReproduction ?? true
  const improvementSteps = isFullReproduction ? fullReproductionSteps : quickImprovementSteps

  useEffect(() => {
    // Start the improvement process
    startImprovement()
  }, [])

  const startImprovement = async () => {
    setError(null)
    setIsRetrying(false)
    setPagesFound(0)

    // Select API endpoint based on mode
    const apiEndpoint = isFullReproduction ? '/api/improve-website-full' : '/api/improve-website'

    try {
      // Step 1: Load and show original website
      setTimeout(() => setWebsiteLoaded(true), 500)

      // Step 2: Scale down website after 2 seconds
      setTimeout(() => {
        setWebsiteScaled(true)
        setCurrentStep(1)
      }, 2000)

      // Step 3: Advance through steps with realistic timing
      // Full reproduction takes longer, so adjust timing
      const stepInterval = isFullReproduction ? 4000 : 3000
      let stepIndex = 1
      const stepTimer = setInterval(() => {
        if (stepIndex < improvementSteps.length - 1) {
          setCurrentStep(stepIndex)
          setProgress((stepIndex / improvementSteps.length) * 100)
          stepIndex++
        } else {
          clearInterval(stepTimer)
        }
      }, stepInterval)

      // Step 4: Make actual API call
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          existingUrl: websiteUrl,
          maxDepth: 3, // Always crawl 3 levels deep for full reproduction
          preserveImages: true,
          generateNewImages: false,
        }),
      })

      clearInterval(stepTimer)

      // Check content type before parsing
      const contentType = response.headers.get('content-type')

      // Handle non-JSON responses (e.g., timeout HTML pages, server errors)
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response received:', text.substring(0, 200))

        // Check if it's a timeout or server error
        if (text.includes('FUNCTION_INVOCATION_TIMEOUT') || text.includes('504')) {
          throw new Error('TIMEOUT')
        }
        if (response.status >= 500) {
          throw new Error('SERVER_ERROR')
        }
        throw new Error('INVALID_RESPONSE')
      }

      // Safely parse JSON with error handling
      let data
      try {
        const text = await response.text()
        if (!text || text.trim() === '') {
          throw new Error('EMPTY_RESPONSE')
        }
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error('JSON_PARSE_ERROR')
      }

      if (data.success) {
        // Update pages found for full reproduction
        if (isFullReproduction && data.data?.pagesCreated) {
          setPagesFound(data.data.pagesCreated)
        }

        setCurrentStep(improvementSteps.length - 1)
        setProgress(100)
        setIsComplete(true)

        setTimeout(() => {
          onComplete(data.data.websiteId)
        }, 2000)
      } else {
        // Handle error with elegant error UI
        const errorInfo = getErrorInfo(data.code || 'UNKNOWN_ERROR', data.error)
        setError(errorInfo)
        setWebsiteScaled(true)
        setProgress(0)
      }
    } catch (err) {
      console.error('Error improving website:', err)

      // Extract error code from Error message if it's one of our known codes
      const knownErrorCodes = ['TIMEOUT', 'SERVER_ERROR', 'INVALID_RESPONSE', 'EMPTY_RESPONSE', 'JSON_PARSE_ERROR']
      const errorMessage = err instanceof Error ? err.message : ''
      const errorCode = knownErrorCodes.includes(errorMessage) ? errorMessage : 'NETWORK_ERROR'

      const errorMessages: Record<string, string> = {
        TIMEOUT: 'The request took too long. The website may be complex or our servers are busy.',
        SERVER_ERROR: 'Our server encountered an error. Please try again.',
        INVALID_RESPONSE: 'Received an unexpected response from the server.',
        EMPTY_RESPONSE: 'The server returned an empty response. Please try again.',
        JSON_PARSE_ERROR: 'Error processing server response. Please try again.',
        NETWORK_ERROR: 'An unexpected error occurred while improving your website.',
      }

      const errorInfo = getErrorInfo(errorCode, errorMessages[errorCode] || errorMessages.NETWORK_ERROR)
      setError(errorInfo)
      setWebsiteScaled(true)
      setProgress(0)
    }
  }

  const handleRetry = () => {
    setIsRetrying(true)
    setError(null)
    setCurrentStep(0)
    setWebsiteLoaded(false)
    setWebsiteScaled(false)
    setProgress(0)
    setIsComplete(false)

    // Small delay before retrying
    setTimeout(() => {
      startImprovement()
    }, 500)
  }

  const handleGoBack = () => {
    onError('User cancelled')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 px-4 py-2 mb-4">
            <Wand2 className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
              {isFullReproduction ? 'Full Website Reproduction' : 'AI Website Transformation'}
            </span>
          </div>
          <h2 className="text-4xl font-bold mb-2">
            {error
              ? 'Unable to Load Website'
              : isFullReproduction
                ? 'Reproducing Your Website'
                : 'Improving Your Website'
            }
          </h2>
          <p className="text-gray-400">
            {error
              ? 'We encountered an issue while trying to access your website'
              : isFullReproduction
                ? 'Crawling all pages, extracting colors, images, and menu structure'
                : 'Analyzing and enhancing while preserving your brand identity'
            }
          </p>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="bg-gradient-to-b from-red-500/10 to-orange-500/5 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 md:p-10">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center"
                  >
                    <error.icon className="w-10 h-10 text-red-400" />
                  </motion.div>
                </div>

                {/* Error Message */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {error.code === 'DOMAIN_NOT_FOUND' && "Website Not Found"}
                    {error.code === 'NOT_FOUND' && "Page Not Found"}
                    {error.code === 'TIMEOUT' && "Connection Timeout"}
                    {error.code === 'CONNECTION_REFUSED' && "Connection Refused"}
                    {error.code === 'FORBIDDEN' && "Access Denied"}
                    {error.code === 'SERVER_ERROR' && "Server Error"}
                    {error.code === 'SSL_ERROR' && "Security Certificate Error"}
                    {error.code === 'INVALID_URL_FORMAT' && "Invalid URL"}
                    {error.code === 'EMPTY_CONTENT' && "No Content Found"}
                    {error.code === 'NETWORK_ERROR' && "Network Error"}
                    {!['DOMAIN_NOT_FOUND', 'NOT_FOUND', 'TIMEOUT', 'CONNECTION_REFUSED', 'FORBIDDEN', 'SERVER_ERROR', 'SSL_ERROR', 'INVALID_URL_FORMAT', 'EMPTY_CONTENT', 'NETWORK_ERROR'].includes(error.code) && "Something Went Wrong"}
                  </h3>
                  <p className="text-gray-400">{error.message}</p>
                </div>

                {/* URL Display */}
                <div className="bg-black/30 rounded-xl p-4 mb-6">
                  <p className="text-xs text-gray-500 mb-1">URL attempted:</p>
                  <p className="text-sm font-mono text-gray-300 break-all">{websiteUrl}</p>
                </div>

                {/* Suggestions */}
                <div className="mb-8">
                  <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Here are some things to try:
                  </p>
                  <ul className="space-y-2">
                    {error.suggestions.map((suggestion, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 text-sm text-gray-400"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                          {index + 1}
                        </span>
                        {suggestion}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGoBack}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Edit URL
                  </button>
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Retrying...' : 'Try Again'}
                  </button>
                </div>
              </div>

              {/* Help Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-sm text-gray-500 mt-6"
              >
                Still having trouble?{' '}
                <a href="mailto:support@webese.com" className="text-blue-400 hover:text-blue-300 underline">
                  Contact support
                </a>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Original Website Preview (only show if no error) */}
        {!error && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: websiteLoaded ? 1 : 0,
              scale: websiteScaled ? 0.5 : 1,
              y: websiteScaled ? -100 : 0,
            }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="relative mb-8"
          >
            <div className="relative rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl bg-white">
              {/* Website Preview */}
              <div className="aspect-[16/10] relative bg-gradient-to-br from-gray-100 to-gray-200">
                <iframe
                  src={websiteUrl}
                  className="w-full h-full"
                  title="Original Website"
                  sandbox="allow-same-origin allow-scripts"
                  onLoad={() => setWebsiteLoaded(true)}
                />

                {/* Loading overlay */}
                {!websiteLoaded && (
                  <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-gray-400">Loading your website...</p>
                    </div>
                  </div>
                )}

                {/* Original Website Label */}
                {websiteLoaded && !websiteScaled && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg"
                  >
                    <p className="text-sm font-medium text-white">Your Current Website</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Bar Overlay (only show if no error) */}
        <AnimatePresence>
          {websiteScaled && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl mx-auto"
            >
              {/* Progress Container */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                {/* Current Step Icon & Text */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    key={currentStep}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
                  >
                    {improvementSteps[currentStep] && (() => {
                      const IconComponent = improvementSteps[currentStep].icon
                      return <IconComponent className="w-7 h-7 text-white" />
                    })()}
                  </motion.div>
                  <div className="flex-1">
                    <motion.p
                      key={`step-${currentStep}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xl font-semibold text-white"
                    >
                      {improvementSteps[currentStep]?.text}
                    </motion.p>
                    <p className="text-sm text-gray-400 mt-1">
                      Step {currentStep + 1} of {improvementSteps.length}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-full"
                    style={{
                      backgroundSize: '200% 100%',
                    }}
                  >
                    <motion.div
                      animate={{ x: ['0%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>

                {/* Progress Percentage */}
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-400">
                    {isComplete ? 'Transformation complete!' : 'AI is working its magic...'}
                  </p>
                  <motion.p
                    key={progress}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-sm font-mono font-bold text-blue-400"
                  >
                    {Math.round(progress)}%
                  </motion.p>
                </div>

                {/* Step Indicators */}
                <div className="flex gap-2 mt-6">
                  {improvementSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8, opacity: 0.3 }}
                      animate={{
                        scale: index === currentStep ? 1.1 : 0.8,
                        opacity: index <= currentStep ? 1 : 0.3,
                      }}
                      className={`flex-1 h-1.5 rounded-full ${
                        index <= currentStep
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>

                {/* Completion Check */}
                {isComplete && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="mt-6 bg-green-500/10 border border-green-500/20 rounded-xl py-4 px-6"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-green-400 font-semibold">
                        {isFullReproduction
                          ? `Website reproduced with ${pagesFound} pages!`
                          : 'Website improved successfully!'
                        }
                      </p>
                    </div>
                    {isFullReproduction && pagesFound > 0 && (
                      <p className="text-center text-sm text-gray-400 mt-2">
                        All pages, colors, images, and menu structure preserved
                      </p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Fun Facts */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-gray-500">
                  {isFullReproduction
                    ? '🔄 Scanning all pages, extracting colors, images, and menu structure to reproduce your entire website'
                    : '💡 Your brand colors, fonts, and content are being preserved and enhanced'
                  }
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
