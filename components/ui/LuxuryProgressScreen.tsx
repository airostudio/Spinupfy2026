'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, Sparkles, Zap } from 'lucide-react'

interface ProgressStep {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  status: 'pending' | 'active' | 'complete'
}

interface LuxuryProgressScreenProps {
  title: string
  subtitle?: string
  steps: Omit<ProgressStep, 'status'>[]
  currentStep: number
  progress: number // 0-100
  isComplete?: boolean
  isPreparingEditor?: boolean // NEW: intermediate state after completion
  estimatedTime?: string
  showPercentage?: boolean
  variant?: 'default' | 'gradient' | 'minimal'
}

// Matrix Rain Effect Component
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Matrix characters (mix of katakana, latin, numbers, symbols)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)

    // Array to track y position of each column
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
    }

    let animationFrame: number

    function draw() {
      if (!ctx || !canvas) return

      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Green text with varying opacity
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)]

        // Gradient effect - brighter at the front
        const gradient = ctx.createLinearGradient(0, drops[i] * fontSize, 0, (drops[i] + 1) * fontSize)
        gradient.addColorStop(0, 'rgba(0, 255, 65, 0.8)')
        gradient.addColorStop(1, 'rgba(0, 255, 65, 0.3)')

        ctx.fillStyle = gradient
        ctx.font = `${fontSize}px monospace`
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)

        // Reset drop to top randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        drops[i]++
      }

      animationFrame = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-20"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

// ASCII Art Animation Component (Midjourney-style with randomization)
function ASCIIAnimation({ progress }: { progress: number }) {
  const [displayText, setDisplayText] = useState('')
  const [currentFrame, setCurrentFrame] = useState(0)

  // More varied Midjourney-style ASCII art frames
  const asciiFrames = [
    `
    ██████╗ ███████╗███╗   ██╗
    ██╔════╝ ██╔════╝████╗  ██║
    ██║  ███╗█████╗  ██╔██╗ ██║
    ██║   ██║██╔══╝  ██║╚██╗██║
    ╚██████╔╝███████╗██║ ╚████║
     ╚═════╝ ╚══════╝╚═╝  ╚═══╝
    `,
    `
   ┌────────────────────────┐
   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
   │ ▓░░░░░░░░░░░░░░░░░░▓ │
   │ ▓░ CRAFTING AI... ░▓ │
   │ ▓░░░░░░░░░░░░░░░░░░▓ │
   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
   └────────────────────────┘
    `,
    `
     ╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲
    ╱                      ╲
    ╲  ∙∘○●◉ DESIGN ◉●○∘∙  ╱
    ╱   PROCESSING...      ╲
    ╲                      ╱
     ╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱
    `,
    `
   ╔══════════════════════╗
   ║ ▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀ ║
   ║ ▄ AI GENERATION  ▄ ║
   ║ ▀   IN PROGRESS  ▀ ║
   ║ ▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄ ║
   ╚══════════════════════╝
    `,
    `
    ░░▒▒▓▓██ MAGIC ██▓▓▒▒░░
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▓  ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡  ▓
    ▓  BUILDING SITE...  ▓
    ▓  ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡  ▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    `,
    `
   ┏━━━━━━━━━━━━━━━━━━━━┓
   ┃  ╭───────────────╮  ┃
   ┃  │ ◆◇◆◇◆◇◆◇◆◇◆ │  ┃
   ┃  │  FINALIZING   │  ┃
   ┃  │ ◇◆◇◆◇◆◇◆◇◆◇ │  ┃
   ┃  ╰───────────────╯  ┃
   ┗━━━━━━━━━━━━━━━━━━━━┛
    `,
    `
    ╔═══════════════════╗
    ║ ▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄ ║
    ║ ▀▄   DONE!   ▄▀ ║
    ║ ▄▀ ◉◉◉◉◉◉◉ ▀▄ ║
    ║ ▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀ ║
    ╚═══════════════════╝
    `
  ]

  // Rotate through frames based on progress with some randomization
  useEffect(() => {
    const baseFrame = Math.floor((progress / 100) * (asciiFrames.length - 1))
    // Add some randomness to make it feel more like Midjourney
    const shouldRandomize = Math.random() > 0.7
    const frameIndex = shouldRandomize && baseFrame > 0
      ? Math.max(0, baseFrame + (Math.random() > 0.5 ? -1 : 0))
      : baseFrame

    setCurrentFrame(frameIndex)

    const targetFrame = asciiFrames[frameIndex]
    let currentIndex = 0
    const typewriterSpeed = 15 + Math.random() * 10 // Variable speed for organic feel

    const interval = setInterval(() => {
      if (currentIndex <= targetFrame.length) {
        setDisplayText(targetFrame.slice(0, currentIndex))
        currentIndex += Math.floor(Math.random() * 4) + 2 // Random character jumps
      } else {
        clearInterval(interval)
      }
    }, typewriterSpeed)

    return () => clearInterval(interval)
  }, [progress, asciiFrames])

  return (
    <motion.div
      key={currentFrame}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="absolute top-8 right-8 hidden lg:block"
    >
      <pre
        className="text-xs leading-tight font-mono"
        style={{
          color: '#00ff41',
          textShadow: '0 0 10px #00ff41, 0 0 20px rgba(0, 255, 65, 0.5)',
          fontFamily: 'monospace',
          filter: `hue-rotate(${Math.sin(currentFrame * 0.5) * 15}deg)` // Subtle color shift
        }}
      >
        {displayText}
      </pre>
    </motion.div>
  )
}

// Floating Random ASCII Patterns (Midjourney-style)
function FloatingASCIIPatterns() {
  const patterns = ['░', '▒', '▓', '█', '▀', '▄', '▌', '▐', '●', '○', '◉', '◎', '◆', '◇', '■', '□', '▪', '▫']
  const [particles, setParticles] = useState<Array<{ id: number, char: string, x: number, y: number, delay: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      char: patterns[Math.floor(Math.random() * patterns.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -100],
            x: [0, (Math.random() - 0.5) * 50]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute text-2xl font-mono"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            color: '#00ff41',
            textShadow: '0 0 5px #00ff41'
          }}
        >
          {particle.char}
        </motion.div>
      ))}
    </div>
  )
}

export function LuxuryProgressScreen({
  title,
  subtitle,
  steps,
  currentStep,
  progress,
  isComplete = false,
  isPreparingEditor = false,
  estimatedTime,
  showPercentage = true,
  variant = 'default'
}: LuxuryProgressScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0)
  const [glitchText, setGlitchText] = useState(title)

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  // Glitch effect for title (Midjourney-style)
  useEffect(() => {
    if (currentStep >= 0 && !isComplete) {
      const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
      const interval = setInterval(() => {
        const shouldGlitch = Math.random() > 0.95
        if (shouldGlitch) {
          const glitched = title.split('').map(char =>
            Math.random() > 0.8 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
          ).join('')
          setGlitchText(glitched)
          setTimeout(() => setGlitchText(title), 50)
        }
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [title, currentStep, isComplete])

  const getStepStatus = (index: number): 'pending' | 'active' | 'complete' => {
    if (index < currentStep) return 'complete'
    if (index === currentStep) return 'active'
    return 'pending'
  }

  const stepsWithStatus: ProgressStep[] = steps.map((step, index) => ({
    ...step,
    status: getStepStatus(index)
  }))

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: '#000000',
        fontFamily: 'var(--font-body)'
      }}
    >
      {/* Matrix Rain Background */}
      <MatrixRain />

      {/* Floating ASCII Patterns */}
      <FloatingASCIIPatterns />

      {/* ASCII Animation */}
      <ASCIIAnimation progress={displayProgress} />

      {/* Animated Background Gradient */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, var(--color-primary), transparent 70%)`
        }}
      />

      {/* Scanline Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 255, 65, 0.03) 0px, rgba(0, 255, 65, 0.03) 1px, transparent 1px, transparent 2px)',
        }}
        animate={{
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Status Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-8 backdrop-blur-md border"
            style={{
              backgroundColor: 'rgba(0, 255, 65, 0.1)',
              borderColor: 'rgba(0, 255, 65, 0.3)',
              color: '#00ff41',
              boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)'
            }}
          >
            {isPreparingEditor ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-4 h-4" />
                </motion.div>
                <span className="text-sm font-medium tracking-wide uppercase font-mono">Preparing Editor</span>
              </>
            ) : isComplete ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wide uppercase font-mono">Complete</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-4 h-4" />
                </motion.div>
                <span className="text-sm font-medium tracking-wide uppercase font-mono">Processing</span>
              </>
            )}
          </motion.div>

          {/* Title with Glitch Effect */}
          <motion.h1
            key={isPreparingEditor ? 'preparing' : 'building'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight font-mono"
            style={{
              color: '#00ff41',
              textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
              fontFamily: 'var(--font-heading)'
            }}
          >
            {isPreparingEditor ? 'Loading Editor' : glitchText}
          </motion.h1>

          {/* Subtitle */}
          <AnimatePresence mode="wait">
            <motion.p
              key={isPreparingEditor ? 'preparing-subtitle' : 'building-subtitle'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl max-w-2xl mx-auto font-mono"
              style={{ color: 'rgba(0, 255, 65, 0.7)' }}
            >
              {isPreparingEditor
                ? 'Preparing your website in the editor...'
                : subtitle || ''}
            </motion.p>
          </AnimatePresence>

          {/* Estimated Time */}
          {estimatedTime && !isComplete && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm mt-4 font-mono"
              style={{ color: 'rgba(0, 255, 65, 0.5)' }}
            >
              [EST: {estimatedTime}]
            </motion.p>
          )}
        </motion.div>

        {/* Progress Bar Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          {/* Progress Bar Container */}
          <div className="relative h-6 rounded overflow-hidden border-2"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderColor: 'rgba(0, 255, 65, 0.3)'
            }}
          >
            {/* Matrix-style Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <motion.div
                className="h-full w-full font-mono text-xs text-green-500 overflow-hidden"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%']
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, rgba(0, 255, 65, 0.1) 0px, rgba(0, 255, 65, 0.1) 2px, transparent 2px, transparent 4px)`
                }}
              />
            </div>

            {/* Progress Fill with ASCII Characters */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${displayProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 flex items-center overflow-hidden"
              style={{
                backgroundColor: 'rgba(0, 255, 65, 0.2)',
                borderRight: '2px solid #00ff41',
                boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)'
              }}
            >
              {/* ASCII Character Fill */}
              <motion.div
                className="absolute inset-0 font-mono text-xs leading-none text-green-400"
                animate={{
                  x: ['-100%', '0%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              >
                {'█'.repeat(200)}
              </motion.div>

              {/* Shimmer Effect */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>

            {/* Scanning Line */}
            <motion.div
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute inset-y-0 w-1"
              style={{
                backgroundColor: '#00ff41',
                boxShadow: '0 0 10px #00ff41, 0 0 20px #00ff41'
              }}
            />
          </div>

          {/* Percentage Display */}
          {showPercentage && (
            <div className="flex justify-between items-center mt-4">
              <motion.span
                key={currentStep}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-mono"
                style={{ color: '#00ff41' }}
              >
                {'>'} {stepsWithStatus[currentStep]?.label || 'Processing...'}
              </motion.span>
              <motion.span
                key={displayProgress}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold font-mono"
                style={{
                  color: '#00ff41',
                  textShadow: '0 0 10px rgba(0, 255, 65, 0.8)'
                }}
              >
                [{Math.round(displayProgress)}%]
              </motion.span>
            </div>
          )}
        </motion.div>

        {/* Steps Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-3"
        >
          {stepsWithStatus.map((step, index) => {
            const IconComponent = step.icon || (step.status === 'complete' ? Check : (step.status === 'active' ? Sparkles : Zap))

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + (index * 0.1) }}
                className="relative flex items-start gap-4 p-4 rounded border transition-all duration-300 font-mono"
                style={{
                  backgroundColor: step.status === 'active'
                    ? 'rgba(0, 255, 65, 0.1)'
                    : 'rgba(0, 0, 0, 0.5)',
                  borderColor: step.status === 'active'
                    ? '#00ff41'
                    : 'rgba(0, 255, 65, 0.2)',
                  borderWidth: step.status === 'active' ? '2px' : '1px',
                  boxShadow: step.status === 'active' ? '0 0 20px rgba(0, 255, 65, 0.3)' : 'none'
                }}
              >
                {/* Step Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded flex items-center justify-center transition-all duration-300 ${
                    step.status === 'active' ? 'scale-110' : ''
                  }`}
                  style={{
                    backgroundColor: step.status === 'complete'
                      ? 'rgba(0, 255, 65, 0.3)'
                      : step.status === 'active'
                        ? 'rgba(0, 255, 65, 0.2)'
                        : 'rgba(0, 255, 65, 0.1)',
                    color: '#00ff41',
                    border: '1px solid rgba(0, 255, 65, 0.3)'
                  }}
                >
                  {step.status === 'active' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{
                      color: step.status === 'pending'
                        ? 'rgba(0, 255, 65, 0.4)'
                        : '#00ff41'
                    }}
                  >
                    {step.status === 'active' ? '>' : step.status === 'complete' ? '✓' : '○'} {step.label}
                  </h3>
                  {step.description && (
                    <p
                      className="text-sm"
                      style={{ color: 'rgba(0, 255, 65, 0.6)' }}
                    >
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Active Step Animation */}
                {step.status === 'active' && (
                  <motion.div
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-xl font-mono" style={{ color: '#00ff41' }}>▮</span>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Completion Message */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mt-12 p-8 rounded text-center border-2 font-mono"
              style={{
                backgroundColor: 'rgba(0, 255, 65, 0.1)',
                borderColor: '#00ff41',
                boxShadow: '0 0 30px rgba(0, 255, 65, 0.3)'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded flex items-center justify-center border-2"
                style={{
                  backgroundColor: 'rgba(0, 255, 65, 0.2)',
                  borderColor: '#00ff41',
                  boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)'
                }}
              >
                <Check className="w-10 h-10" style={{ color: '#00ff41' }} />
              </motion.div>
              <motion.h3
                className="text-2xl md:text-3xl font-bold mb-3"
                style={{
                  color: '#00ff41',
                  textShadow: '0 0 10px rgba(0, 255, 65, 0.8)'
                }}
              >
                {'>'} PROCESS COMPLETE {'<'}
              </motion.h3>
              <p
                className="text-lg"
                style={{ color: 'rgba(0, 255, 65, 0.8)' }}
              >
                All systems operational. Ready to proceed.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
