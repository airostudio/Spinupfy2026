'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Palette,
  ShoppingCart,
  Image as ImageIcon,
  Users,
  Mail,
  Check,
  Zap
} from 'lucide-react'

interface WizardStep {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}

interface CreationWizardProps {
  onComplete: (data: CreationWizardData) => void
  onCancel?: () => void
}

export interface CreationWizardData {
  businessName: string
  businessType: string
  description: string
  targetAudience: string
  goals: string[]
  features: string[]
  tone: 'professional' | 'casual' | 'friendly' | 'formal' | 'playful'
  hasStore: boolean
  hasBooking: boolean
  hasGallery: boolean
  hasBlog: boolean
  primaryColor?: string
  additionalNotes: string
}

const wizardSteps: WizardStep[] = [
  {
    id: 'basics',
    title: 'Tell us about your business',
    subtitle: 'The basics to get started',
    icon: MessageSquare
  },
  {
    id: 'goals',
    title: 'What are your goals?',
    subtitle: 'Help us understand what you want to achieve',
    icon: Zap
  },
  {
    id: 'features',
    title: 'What features do you need?',
    subtitle: 'Select the functionality that matters to you',
    icon: Sparkles
  },
  {
    id: 'style',
    title: 'Choose your style',
    subtitle: 'Define the look and feel',
    icon: Palette
  },
  {
    id: 'confirm',
    title: 'Review and confirm',
    subtitle: 'Make sure everything looks good',
    icon: Check
  }
]

const businessTypeOptions = [
  { value: 'real-estate', label: 'Real Estate', description: 'Property listings and sales' },
  { value: 'restaurant', label: 'Restaurant / Cafe', description: 'Dining and hospitality' },
  { value: 'ecommerce', label: 'Online Store', description: 'Sell products online' },
  { value: 'services', label: 'Professional Services', description: 'Consulting, legal, accounting' },
  { value: 'health', label: 'Health & Wellness', description: 'Medical, fitness, spa' },
  { value: 'creative', label: 'Creative / Portfolio', description: 'Photography, design, art' },
  { value: 'education', label: 'Education / Training', description: 'Courses and learning' },
  { value: 'nonprofit', label: 'Non-Profit / Charity', description: 'Community and causes' },
  { value: 'pet-services', label: 'Pet Services', description: 'Veterinary, grooming, adoption' },
  { value: 'other', label: 'Other', description: 'Something unique' }
]

const goalOptions = [
  { id: 'leads', label: 'Generate Leads', icon: Users },
  { id: 'sales', label: 'Increase Sales', icon: ShoppingCart },
  { id: 'awareness', label: 'Build Brand Awareness', icon: Sparkles },
  { id: 'info', label: 'Provide Information', icon: MessageSquare },
  { id: 'portfolio', label: 'Showcase Work', icon: ImageIcon },
  { id: 'contact', label: 'Get Contacted', icon: Mail }
]

const featureOptions = [
  { id: 'store', label: 'Online Store', description: 'Sell products with shopping cart' },
  { id: 'booking', label: 'Booking System', description: 'Appointments and reservations' },
  { id: 'gallery', label: 'Image Gallery', description: 'Showcase photos and portfolio' },
  { id: 'blog', label: 'Blog / News', description: 'Share articles and updates' },
  { id: 'contact', label: 'Contact Forms', description: 'Let visitors reach you', included: true },
  { id: 'testimonials', label: 'Testimonials', description: 'Show customer reviews', included: true }
]

const toneOptions = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'playful', label: 'Playful', description: 'Fun and creative' },
  { value: 'formal', label: 'Formal', description: 'Traditional and sophisticated' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' }
]

export function CreationWizard({ onComplete, onCancel }: CreationWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState<CreationWizardData>({
    businessName: '',
    businessType: '',
    description: '',
    targetAudience: '',
    goals: [],
    features: [],
    tone: 'professional',
    hasStore: false,
    hasBooking: false,
    hasGallery: false,
    hasBlog: false,
    additionalNotes: ''
  })

  const currentStep = wizardSteps[currentStepIndex]
  const isLastStep = currentStepIndex === wizardSteps.length - 1
  const isFirstStep = currentStepIndex === 0

  const canProceed = () => {
    switch (currentStep.id) {
      case 'basics':
        return formData.businessName.trim() && formData.businessType && formData.description.trim()
      case 'goals':
        return formData.goals.length > 0 && formData.targetAudience.trim()
      case 'features':
        return true // Optional step
      case 'style':
        return formData.tone
      case 'confirm':
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStepIndex < wizardSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleComplete = () => {
    // Update features based on selections
    const updatedData = {
      ...formData,
      hasStore: formData.features.includes('store'),
      hasBooking: formData.features.includes('booking'),
      hasGallery: formData.features.includes('gallery'),
      hasBlog: formData.features.includes('blog')
    }
    onComplete(updatedData)
  }

  const toggleGoal = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }))
  }

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }))
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {wizardSteps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <motion.div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                    index <= currentStepIndex
                      ? 'border-green-500 bg-green-500/20 text-green-500'
                      : 'border-gray-600 bg-gray-900 text-gray-500'
                  }`}
                  animate={{
                    scale: index === currentStepIndex ? 1.1 : 1
                  }}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </motion.div>
                {index < wizardSteps.length - 1 && (
                  <div className="flex-1 h-1 mx-2">
                    <div className="h-full bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: index < currentStepIndex ? '100%' : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Step {currentStepIndex + 1} of {wizardSteps.length}
            </p>
          </div>
        </div>

        {/* Content Card */}
        <motion.div
          className="bg-gray-900 rounded-3xl p-8 md:p-12 border border-gray-800 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {currentStep.title}
              </h2>
              <p className="text-lg text-gray-400">
                {currentStep.subtitle}
              </p>
            </motion.div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px]"
            >
              {/* Step 1: Basics */}
              {currentStep.id === 'basics' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
                      placeholder="e.g., Paws & Claws Pet Adoption"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      What type of business is this? *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {businessTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, businessType: option.value })}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            formData.businessType === option.value
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          }`}
                        >
                          <div className="font-medium text-white">{option.label}</div>
                          <div className="text-sm text-gray-400 mt-1">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tell us about your business *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors resize-none"
                      placeholder="Describe what you do, what makes you special, and what you offer. Be specific!"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Pro tip: The more details you provide, the better your website will be!
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Goals */}
              {currentStep.id === 'goals' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      What do you want to achieve with your website? *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {goalOptions.map((goal) => (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          className={`p-6 rounded-xl border-2 text-center transition-all ${
                            formData.goals.includes(goal.id)
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          }`}
                        >
                          <goal.icon className="w-8 h-8 mx-auto mb-3 text-green-500" />
                          <div className="font-medium text-white text-sm">{goal.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Who is your target audience? *
                    </label>
                    <textarea
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors resize-none"
                      placeholder="e.g., Families looking to adopt pets, animal lovers aged 25-45, first-time pet owners"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Features */}
              {currentStep.id === 'features' && (
                <div className="space-y-6">
                  <p className="text-gray-400 mb-6">
                    Select any additional features you need. We&apos;ll include contact forms and testimonials by default.
                  </p>
                  <div className="space-y-3">
                    {featureOptions.map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => !feature.included && toggleFeature(feature.id)}
                        disabled={feature.included}
                        className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                          feature.included
                            ? 'border-gray-700 bg-gray-800/30 cursor-default'
                            : formData.features.includes(feature.id)
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-white">{feature.label}</div>
                              {feature.included && (
                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded-full">
                                  Included
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">{feature.description}</div>
                          </div>
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ml-4 ${
                            feature.included || formData.features.includes(feature.id)
                              ? 'border-green-500 bg-green-500/20'
                              : 'border-gray-600'
                          }`}>
                            {(feature.included || formData.features.includes(feature.id)) && (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Style */}
              {currentStep.id === 'style' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      What tone should your website have? *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {toneOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, tone: option.value as any })}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            formData.tone === option.value
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          }`}
                        >
                          <div className="font-medium text-white">{option.label}</div>
                          <div className="text-sm text-gray-400 mt-1">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Any other preferences or requirements?
                    </label>
                    <textarea
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors resize-none"
                      placeholder="e.g., I want to emphasize our adoption process, showcase success stories, include a donation section..."
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Confirm */}
              {currentStep.id === 'confirm' && (
                <div className="space-y-6">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Your Website Summary</h3>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-400">Business Name</div>
                        <div className="text-white font-medium">{formData.businessName}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400">Business Type</div>
                        <div className="text-white font-medium">
                          {businessTypeOptions.find(b => b.value === formData.businessType)?.label}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400">Description</div>
                        <div className="text-white">{formData.description}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400">Goals</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.goals.map(goalId => {
                            const goal = goalOptions.find(g => g.id === goalId)
                            return (
                              <span key={goalId} className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                                {goal?.label}
                              </span>
                            )
                          })}
                        </div>
                      </div>

                      {formData.features.length > 0 && (
                        <div>
                          <div className="text-sm text-gray-400">Additional Features</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.features.map(featureId => {
                              const feature = featureOptions.find(f => f.id === featureId)
                              return (
                                <span key={featureId} className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-sm">
                                  {feature?.label}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm text-gray-400">Tone</div>
                        <div className="text-white font-medium capitalize">{formData.tone}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                    <div className="flex gap-4">
                      <Sparkles className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white font-medium mb-2">Ready to create your website!</h4>
                        <p className="text-sm text-gray-300">
                          Our AI will generate a complete, professional website tailored to your needs. This typically takes 30-60 seconds.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-gray-800">
            <button
              onClick={isFirstStep ? onCancel : prevStep}
              className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {isFirstStep ? 'Cancel' : 'Back'}
            </button>

            <button
              onClick={isLastStep ? handleComplete : nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed"
            >
              {isLastStep ? 'Create Website' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
