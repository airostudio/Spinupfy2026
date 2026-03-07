'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface LuxuryLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  fullScreen?: boolean
  variant?: 'spinner' | 'pulse' | 'dots' | 'bars'
}

export function LuxuryLoader({
  size = 'md',
  text,
  fullScreen = false,
  variant = 'spinner'
}: LuxuryLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const Container = fullScreen ? 'div' : 'div'
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm'
    : 'flex items-center justify-center'

  const SpinnerLoader = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={sizeClasses[size]}
      style={{ color: 'var(--color-primary)' }}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  )

  const PulseLoader = () => (
    <div className="relative" style={{ width: sizeClasses[size].split(' ')[0].replace('w-', '') + 'rem' }}>
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`${sizeClasses[size]} rounded-full`}
        style={{ backgroundColor: 'var(--color-primary)' }}
      />
      <motion.div
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`${sizeClasses[size]} rounded-full absolute inset-0`}
        style={{ backgroundColor: 'var(--color-accent)' }}
      />
    </div>
  )

  const DotsLoader = () => (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15
          }}
          className={size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'}
          style={{
            backgroundColor: i === 0 ? 'var(--color-primary)' : i === 1 ? 'var(--color-accent)' : 'var(--color-secondary)',
            borderRadius: '50%'
          }}
        />
      ))}
    </div>
  )

  const BarsLoader = () => (
    <div className="flex gap-1 items-end" style={{ height: size === 'sm' ? '24px' : size === 'md' ? '40px' : size === 'lg' ? '64px' : '96px' }}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{
            scaleY: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1
          }}
          className={size === 'sm' ? 'w-1' : size === 'md' ? 'w-2' : size === 'lg' ? 'w-3' : 'w-4'}
          style={{
            backgroundColor: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)',
            transformOrigin: 'bottom',
            height: '100%',
            borderRadius: '2px'
          }}
        />
      ))}
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return <PulseLoader />
      case 'dots':
        return <DotsLoader />
      case 'bars':
        return <BarsLoader />
      default:
        return <SpinnerLoader />
    }
  }

  return (
    <Container
      className={containerClasses}
      style={fullScreen ? { backgroundColor: 'var(--color-bg-primary)' } : {}}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Loader */}
        <div className="relative">
          {renderLoader()}

          {/* Glow Effect */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 blur-xl pointer-events-none -z-10"
            style={{
              backgroundColor: 'var(--color-primary)',
              opacity: 0.3
            }}
          />
        </div>

        {/* Loading Text */}
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${textSizeClasses[size]} font-medium`}
            style={{
              color: 'var(--color-text-body)',
              fontFamily: 'var(--font-body)'
            }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </Container>
  )
}

// Export additional loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  variant?: 'spinner' | 'pulse' | 'dots' | 'bars'
}

export function LoadingOverlay({ isLoading, text, variant = 'spinner' }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="p-8 rounded-2xl shadow-luxury-xl border"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)'
        }}
      >
        <LuxuryLoader size="lg" text={text} variant={variant} />
      </motion.div>
    </motion.div>
  )
}
