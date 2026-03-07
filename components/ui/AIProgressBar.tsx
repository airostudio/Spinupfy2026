'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check } from 'lucide-react'

interface AIProgressBarProps {
  progress: number // 0-100
  status: string
  substatus?: string
  isComplete?: boolean
}

export function AIProgressBar({ progress, status, substatus, isComplete = false }: AIProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(Math.min(progress, 100))
    }, 50)
    return () => clearTimeout(timer)
  }, [progress])

  // Clamp progress between 0-100
  const clampedProgress = Math.max(0, Math.min(displayProgress, 100))

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-2xl">
        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl"
        >
          {/* Status Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-md border"
            style={{
              backgroundColor: isComplete ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              borderColor: isComplete ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)',
            }}
          >
            {isComplete ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Complete</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </motion.div>
                <span className="text-sm font-semibold text-blue-400">Creating</span>
              </>
            )}
          </motion.div>

          {/* Status Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight"
          >
            {status}
          </motion.h1>

          {/* Substatus */}
          <AnimatePresence mode="wait">
            {substatus && (
              <motion.p
                key={substatus}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-base md:text-lg text-gray-400 mb-10 min-h-[28px]"
              >
                {substatus}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Progress Bar Container */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="relative h-4 md:h-5 bg-black/40 rounded-full overflow-hidden border border-white/10">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50" />

              {/* Progress Fill */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${clampedProgress}%` }}
                transition={{
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1], // Smooth easing
                }}
                className="relative h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 rounded-full"
                style={{
                  backgroundSize: '200% 100%',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                }}
              >
                {/* Animated Shimmer */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />

                {/* Progress Glow */}
                <motion.div
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 blur-sm"
                />
              </motion.div>
            </div>

            {/* Progress Info */}
            <div className="flex items-center justify-between">
              {/* Percentage */}
              <motion.div
                key={Math.floor(clampedProgress)}
                initial={{ scale: 1.1, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-4xl md:text-5xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {Math.round(clampedProgress)}%
              </motion.div>

              {/* Time Estimate (optional visual element) */}
              <div className="text-sm text-gray-500 hidden md:block">
                {isComplete ? (
                  <span className="text-green-400 font-medium">✓ Done</span>
                ) : clampedProgress < 30 ? (
                  'Starting...'
                ) : clampedProgress < 70 ? (
                  'In progress...'
                ) : (
                  'Almost there...'
                )}
              </div>
            </div>
          </div>

          {/* Completion Message */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500/30">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Website Created Successfully!
                    </h3>
                    <p className="text-sm text-gray-400">
                      Preparing your editor workspace...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Dots Indicator (Mobile-friendly) */}
          <div className="flex items-center justify-center gap-2 mt-8 md:hidden">
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0.3 }}
                animate={{
                  scale: clampedProgress > index * 20 ? 1 : 0.8,
                  opacity: clampedProgress > index * 20 ? 1 : 0.3,
                  backgroundColor: clampedProgress > index * 20 ? '#3b82f6' : '#ffffff20',
                }}
                transition={{ duration: 0.3 }}
                className="w-2 h-2 rounded-full"
              />
            ))}
          </div>
        </motion.div>

        {/* Helpful Tip (Mobile-optimized) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-xs md:text-sm text-gray-500">
            💡 Your AI-powered website is being crafted with care
          </p>
        </motion.div>
      </div>
    </div>
  )
}
