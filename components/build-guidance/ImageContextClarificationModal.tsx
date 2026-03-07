'use client';

/**
 * Image Context Clarification Modal
 *
 * Asks users clarifying questions about what type of images they need
 * when the business type is unknown or ambiguous.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Building2, Users, Package, Truck, Briefcase, Stethoscope, Leaf, Sparkles, ChevronRight } from 'lucide-react';
import { useBuildGuidance, ImageContext } from '@/lib/store/build-guidance.store';

interface ImageContextClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (context: ImageContext) => void;
}

// Visual theme options with descriptions
const VISUAL_THEMES = [
  { id: 'industrial', label: 'Industrial / Logistics', icon: Truck, description: 'Warehouses, trucks, shipping, factories, heavy equipment' },
  { id: 'corporate', label: 'Corporate / Office', icon: Briefcase, description: 'Professional offices, meetings, business environments' },
  { id: 'lifestyle', label: 'Lifestyle / People', icon: Users, description: 'People enjoying products/services, daily life, happy customers' },
  { id: 'nature', label: 'Nature / Outdoors', icon: Leaf, description: 'Natural landscapes, outdoor activities, environmental' },
  { id: 'tech', label: 'Technology / Digital', icon: Sparkles, description: 'Computers, software, digital interfaces, innovation' },
  { id: 'medical', label: 'Healthcare / Medical', icon: Stethoscope, description: 'Medical equipment, healthcare providers, clinical settings' },
  { id: 'service', label: 'Service / Hands-on', icon: Package, description: 'Workers providing services, craftsmanship, customer interactions' },
  { id: 'custom', label: 'Custom / I\'ll Describe', icon: ImageIcon, description: 'I want to describe exactly what I need' },
] as const;

// Mood options
const MOOD_OPTIONS = [
  { id: 'professional', label: 'Professional', description: 'Clean, corporate, trustworthy' },
  { id: 'energetic', label: 'Energetic', description: 'Dynamic, active, exciting' },
  { id: 'warm', label: 'Warm & Friendly', description: 'Welcoming, approachable, personal' },
  { id: 'calm', label: 'Calm & Peaceful', description: 'Serene, relaxed, soothing' },
  { id: 'modern', label: 'Modern & Sleek', description: 'Contemporary, minimalist, cutting-edge' },
  { id: 'traditional', label: 'Traditional', description: 'Classic, established, timeless' },
  { id: 'luxury', label: 'Luxury & Premium', description: 'High-end, exclusive, elegant' },
] as const;

// Subject suggestions based on theme
const THEME_SUBJECTS: Record<string, string[]> = {
  industrial: ['Container ships', 'Cargo trucks', 'Warehouses', 'Forklifts', 'Shipping containers', 'Port operations', 'Freight trains', 'Loading docks'],
  corporate: ['Office meetings', 'Business professionals', 'Modern offices', 'Conference rooms', 'Team collaboration', 'Handshakes', 'Presentations'],
  lifestyle: ['Happy customers', 'People using products', 'Family moments', 'Daily activities', 'Social gatherings', 'Recreation'],
  nature: ['Landscapes', 'Outdoor activities', 'Plants & gardens', 'Natural materials', 'Environmental scenes', 'Wildlife'],
  tech: ['Computers & devices', 'Software interfaces', 'Data visualization', 'Innovation labs', 'Digital networks', 'AI & automation'],
  medical: ['Healthcare providers', 'Medical equipment', 'Clinical settings', 'Patient care', 'Wellness activities', 'Medical technology'],
  service: ['Workers at work', 'Customer service', 'Craftsmanship', 'Service delivery', 'Professional tools', 'Satisfied customers'],
  custom: [],
};

export function ImageContextClarificationModal({ isOpen, onClose, onComplete }: ImageContextClarificationModalProps) {
  const { businessVariables } = useBuildGuidance();

  const [step, setStep] = useState<'theme' | 'mood' | 'subjects' | 'custom'>('theme');
  const [selectedTheme, setSelectedTheme] = useState<ImageContext['visualTheme']>();
  const [selectedMood, setSelectedMood] = useState<ImageContext['mood']>();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customDescription, setCustomDescription] = useState('');

  const handleThemeSelect = (themeId: ImageContext['visualTheme']) => {
    setSelectedTheme(themeId);
    if (themeId === 'custom') {
      setStep('custom');
    } else {
      setStep('mood');
    }
  };

  const handleMoodSelect = (moodId: ImageContext['mood']) => {
    setSelectedMood(moodId);
    setStep('subjects');
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleComplete = () => {
    const context: ImageContext = {
      visualTheme: selectedTheme,
      mood: selectedMood,
      mainSubjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
      customDescription: customDescription || undefined,
      clarified: true,
    };
    onComplete(context);
    onClose();
  };

  const handleCustomComplete = () => {
    const context: ImageContext = {
      visualTheme: 'custom',
      customDescription,
      clarified: true,
    };
    onComplete(context);
    onClose();
  };

  const availableSubjects = selectedTheme && selectedTheme !== 'custom'
    ? THEME_SUBJECTS[selectedTheme]
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Help Us Create Better Images
                    </h2>
                    <p className="text-sm text-gray-400">
                      Tell us what kind of images would best represent your business
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Business context */}
              {businessVariables.businessName && (
                <div className="mt-3 p-3 rounded-lg bg-gray-800/50">
                  <p className="text-xs text-gray-500">Creating images for:</p>
                  <p className="text-sm text-white font-medium">{businessVariables.businessName}</p>
                  {businessVariables.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{businessVariables.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* Step 1: Theme Selection */}
                {step === 'theme' && (
                  <motion.div
                    key="theme"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm font-medium text-gray-300">
                      What visual theme best describes your business?
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {VISUAL_THEMES.map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <button
                            key={theme.id}
                            onClick={() => handleThemeSelect(theme.id as ImageContext['visualTheme'])}
                            className={`
                              p-3 rounded-lg border text-left transition-all
                              ${selectedTheme === theme.id
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                              }
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white">{theme.label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{theme.description}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Mood Selection */}
                {step === 'mood' && (
                  <motion.div
                    key="mood"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-300">
                        What mood or feeling should the images convey?
                      </h3>
                      <button
                        onClick={() => setStep('theme')}
                        className="text-xs text-primary-400 hover:text-primary-300"
                      >
                        Back
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {MOOD_OPTIONS.map((mood) => (
                        <button
                          key={mood.id}
                          onClick={() => handleMoodSelect(mood.id as ImageContext['mood'])}
                          className={`
                            p-3 rounded-lg border text-left transition-all flex items-center justify-between
                            ${selectedMood === mood.id
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                            }
                          `}
                        >
                          <div>
                            <p className="text-sm font-medium text-white">{mood.label}</p>
                            <p className="text-xs text-gray-500">{mood.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Subject Selection */}
                {step === 'subjects' && (
                  <motion.div
                    key="subjects"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-300">
                        Select subjects to include in your images (optional)
                      </h3>
                      <button
                        onClick={() => setStep('mood')}
                        className="text-xs text-primary-400 hover:text-primary-300"
                      >
                        Back
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSubjects.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => handleSubjectToggle(subject)}
                          className={`
                            px-3 py-1.5 rounded-full text-sm transition-all
                            ${selectedSubjects.includes(subject)
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }
                          `}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleComplete}
                      className="w-full py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Images
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      You can skip subject selection - we&apos;ll make smart choices based on your theme and mood
                    </p>
                  </motion.div>
                )}

                {/* Custom Description Step */}
                {step === 'custom' && (
                  <motion.div
                    key="custom"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-300">
                        Describe the images you want
                      </h3>
                      <button
                        onClick={() => setStep('theme')}
                        className="text-xs text-primary-400 hover:text-primary-300"
                      >
                        Back
                      </button>
                    </div>
                    <textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Describe what kind of images would represent your business best. For example: 'Container ships at a busy port, cargo logistics operations, global shipping network visualizations, professional warehouse workers...'"
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
                    />
                    <button
                      onClick={handleCustomComplete}
                      disabled={!customDescription.trim()}
                      className={`
                        w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                        ${customDescription.trim()
                          ? 'bg-primary-500 text-white hover:bg-primary-400'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Custom Images
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ImageContextClarificationModal;
