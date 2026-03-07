'use client'

import { useState, useEffect } from 'react'
import { LuxuryProgressScreen } from '@/components/ui/LuxuryProgressScreen'
import { LuxuryLoader, LoadingOverlay } from '@/components/ui/LuxuryLoader'
import { Wand2, Sparkles, Image, Zap, Check, Palette } from 'lucide-react'

export default function ProgressDemo() {
  const [activeDemo, setActiveDemo] = useState<'progress' | 'loader' | 'overlay' | null>('progress')
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  // Demo steps for the progress screen
  const demoSteps = [
    {
      id: 'analyze',
      label: 'Analyzing Your Content',
      description: 'Reading and understanding your website structure',
      icon: Sparkles
    },
    {
      id: 'generate',
      label: 'Generating AI Content',
      description: 'Creating professional, engaging copy',
      icon: Wand2
    },
    {
      id: 'design',
      label: 'Applying Design System',
      description: 'Implementing luxury styling and colors',
      icon: Palette
    },
    {
      id: 'images',
      label: 'Optimizing Images',
      description: 'Enhancing visuals for perfect presentation',
      icon: Image
    },
    {
      id: 'finalize',
      label: 'Finalizing Website',
      description: 'Adding final touches and optimizations',
      icon: Zap
    }
  ]

  // Simulate progress for demo
  useEffect(() => {
    if (activeDemo !== 'progress') return

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsComplete(true)
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= demoSteps.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 4000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }, [activeDemo])

  // Reset demo
  const resetDemo = () => {
    setCurrentStep(0)
    setProgress(0)
    setIsComplete(false)
  }

  if (activeDemo === 'progress') {
    return (
      <div>
        <LuxuryProgressScreen
          title="Building Your AI Website"
          subtitle="Please wait while we craft your perfect digital presence with professional styling and engaging content"
          steps={demoSteps}
          currentStep={currentStep}
          progress={progress}
          isComplete={isComplete}
          estimatedTime="2-3 minutes"
          showPercentage={true}
          variant="gradient"
        />

        {/* Demo Controls */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={resetDemo}
            className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            Reset
          </button>
          <button
            onClick={() => setActiveDemo(null)}
            className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            Back to Demos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-5xl font-bold mb-4 text-center"
          style={{
            color: 'var(--color-text-heading)',
            fontFamily: 'var(--font-heading)'
          }}
        >
          Luxury Progress Components
        </h1>
        <p
          className="text-xl text-center mb-12"
          style={{ color: 'var(--color-text-body)' }}
        >
          Modern, professional loading states for your AI website builder
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Full Progress Screen */}
          <div
            className="p-8 rounded-2xl border-2 cursor-pointer hover:shadow-luxury-lg transition-all"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)'
            }}
            onClick={() => setActiveDemo('progress')}
          >
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{
                  color: 'var(--color-text-heading)',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                Full Progress Screen
              </h3>
              <p style={{ color: 'var(--color-text-body)' }}>
                Complete progress tracking with steps, percentage, and animations
              </p>
            </div>
          </div>

          {/* Spinner Variants */}
          <div
            className="p-8 rounded-2xl border-2"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)'
            }}
          >
            <h3
              className="text-xl font-bold mb-6 text-center"
              style={{
                color: 'var(--color-text-heading)',
                fontFamily: 'var(--font-heading)'
              }}
            >
              Spinner Loader
            </h3>
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Small</p>
                <LuxuryLoader size="sm" variant="spinner" />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Medium</p>
                <LuxuryLoader size="md" variant="spinner" />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Large</p>
                <LuxuryLoader size="lg" variant="spinner" text="Loading..." />
              </div>
            </div>
          </div>

          {/* Pulse Variants */}
          <div
            className="p-8 rounded-2xl border-2"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)'
            }}
          >
            <h3
              className="text-xl font-bold mb-6 text-center"
              style={{
                color: 'var(--color-text-heading)',
                fontFamily: 'var(--font-heading)'
              }}
            >
              Pulse Loader
            </h3>
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Small</p>
                <LuxuryLoader size="sm" variant="pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Medium</p>
                <LuxuryLoader size="md" variant="pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Large</p>
                <LuxuryLoader size="lg" variant="pulse" text="Processing..." />
              </div>
            </div>
          </div>

          {/* Dots Variants */}
          <div
            className="p-8 rounded-2xl border-2"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)'
            }}
          >
            <h3
              className="text-xl font-bold mb-6 text-center"
              style={{
                color: 'var(--color-text-heading)',
                fontFamily: 'var(--font-heading)'
              }}
            >
              Dots Loader
            </h3>
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Small</p>
                <LuxuryLoader size="sm" variant="dots" />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Medium</p>
                <LuxuryLoader size="md" variant="dots" />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Large</p>
                <LuxuryLoader size="lg" variant="dots" text="Generating..." />
              </div>
            </div>
          </div>

          {/* Bars Variants */}
          <div
            className="p-8 rounded-2xl border-2"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)'
            }}
          >
            <h3
              className="text-xl font-bold mb-6 text-center"
              style={{
                color: 'var(--color-text-heading)',
                fontFamily: 'var(--font-heading)'
              }}
            >
              Bars Loader
            </h3>
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Small</p>
                <LuxuryLoader size="sm" variant="bars" />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Medium</p>
                <LuxuryLoader size="md" variant="bars" />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Large</p>
                <LuxuryLoader size="lg" variant="bars" text="Optimizing..." />
              </div>
            </div>
          </div>

          {/* Loading Overlay Demo */}
          <div
            className="p-8 rounded-2xl border-2 cursor-pointer hover:shadow-luxury-lg transition-all"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)'
            }}
            onClick={() => {
              setShowOverlay(true)
              setTimeout(() => setShowOverlay(false), 3000)
            }}
          >
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{
                  color: 'var(--color-text-heading)',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                Loading Overlay
              </h3>
              <p style={{ color: 'var(--color-text-body)' }}>
                Click to see fullscreen overlay (auto-closes in 3s)
              </p>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="mt-16 p-8 rounded-2xl border-2"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border)'
          }}
        >
          <h2
            className="text-3xl font-bold mb-6"
            style={{
              color: 'var(--color-text-heading)',
              fontFamily: 'var(--font-heading)'
            }}
          >
            Usage Examples
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-heading)' }}>
                Full Progress Screen
              </h3>
              <pre className="p-4 rounded-lg overflow-x-auto" style={{ backgroundColor: 'var(--color-bg-dark)' }}>
                <code style={{ color: 'var(--color-text-body)', fontSize: '0.875rem' }}>{`<LuxuryProgressScreen
  title="Building Your AI Website"
  subtitle="Creating professional content..."
  steps={steps}
  currentStep={currentStep}
  progress={progress}
  isComplete={isComplete}
  estimatedTime="2-3 minutes"
  variant="gradient"
/>`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-heading)' }}>
                Simple Loader
              </h3>
              <pre className="p-4 rounded-lg overflow-x-auto" style={{ backgroundColor: 'var(--color-bg-dark)' }}>
                <code style={{ color: 'var(--color-text-body)', fontSize: '0.875rem' }}>{`<LuxuryLoader
  size="lg"
  text="Loading..."
  variant="spinner"
/>`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-heading)' }}>
                Loading Overlay
              </h3>
              <pre className="p-4 rounded-lg overflow-x-auto" style={{ backgroundColor: 'var(--color-bg-dark)' }}>
                <code style={{ color: 'var(--color-text-body)', fontSize: '0.875rem' }}>{`<LoadingOverlay
  isLoading={isLoading}
  text="Processing your request..."
  variant="pulse"
/>`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Show loading overlay when triggered */}
      <LoadingOverlay
        isLoading={showOverlay}
        text="Processing your request..."
        variant="pulse"
      />
    </div>
  )
}
