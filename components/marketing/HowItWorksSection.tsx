'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Wand2, Palette, Sparkles, Rocket, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

const steps = [
  {
    number: 1,
    icon: MessageSquare,
    title: 'Describe Your Business',
    description: 'Simply tell us about your business, target audience, and what makes you unique. Our AI understands context and intent.',
    duration: '30 seconds',
    color: '#2563eb'
  },
  {
    number: 2,
    icon: Wand2,
    title: 'AI Generates Content',
    description: 'Our advanced AI creates professional, engaging copy tailored to your industry and brand voice automatically.',
    duration: '1 minute',
    color: '#0ea5e9'
  },
  {
    number: 3,
    icon: Palette,
    title: 'Customize Design',
    description: 'AI suggests colors and fonts based on your business type. Adjust anything with our intuitive visual editor.',
    duration: '1 minute',
    color: '#06b6d4'
  },
  {
    number: 4,
    icon: Sparkles,
    title: 'Add Final Touches',
    description: 'Drag and drop sections, upload images, and fine-tune details. Everything updates in real-time.',
    duration: '2 minutes',
    color: '#f59e0b'
  },
  {
    number: 5,
    icon: Rocket,
    title: 'Launch & Grow',
    description: 'Publish instantly with one click. Your professional website is live and ready to convert visitors.',
    duration: 'Instant',
    color: '#10b981'
  }
]

export function HowItWorksSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % steps.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentSlide, isAutoPlaying])

  const currentStep = steps[currentSlide]

  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
          >
            From Idea to Live Website in 5 Steps
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            No coding, no design skills, no stress
          </motion.p>
        </div>

        {/* Slideshow */}
        <div className="relative h-[500px] md:h-[400px] rounded-3xl overflow-hidden bg-gray-900/50 border border-gray-800">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center p-8 md:p-16"
            >
              <div className="text-center max-w-2xl">
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${currentStep.color}20` }}
                >
                  <currentStep.icon
                    className="w-10 h-10"
                    style={{ color: currentStep.color }}
                  />
                </motion.div>

                <div className="mb-4">
                  <span className="text-sm text-gray-500">Step {currentStep.number} of 5</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  {currentStep.title}
                </h3>

                <p className="text-lg text-gray-300 mb-6">
                  {currentStep.description}
                </p>

                <div
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full"
                  style={{
                    backgroundColor: `${currentStep.color}20`,
                    border: `2px solid ${currentStep.color}`
                  }}
                >
                  <span className="text-xl">⏱️</span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: currentStep.color }}
                  >
                    {currentStep.duration}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + steps.length) % steps.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % steps.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all z-10"
          >
            {isAutoPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Indicators */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="relative group"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  index === currentSlide ? 'scale-110' : 'scale-100'
                }`}
                style={{
                  backgroundColor: index === currentSlide ? step.color : 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <span className="text-sm font-bold text-white">
                  {index + 1}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="text-3xl font-bold mb-4 text-white">
              Total Time: ~5 Minutes
            </h3>
            <p className="text-xl text-white/70 mb-8">
              That&apos;s faster than ordering coffee
            </p>
            <button className="px-12 py-5 rounded-full font-bold text-lg text-white shadow-2xl hover:scale-105 transition-all bg-gradient-to-r from-blue-600 to-green-600">
              Start Building Now
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
