'use client';

/**
 * Build Guidance Sidebar
 * Main container for the interactive build experience
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building,
  Palette,
  Paintbrush,
  MessageSquare,
  Image,
  CheckCircle,
  HelpCircle,
  Loader2,
  PartyPopper,
  X,
} from 'lucide-react';
import { useBuildGuidance, BUILD_PHASES, BuildPhase } from '@/lib/store/build-guidance.store';
import { PhaseIndicator } from './PhaseIndicator';
import { WelcomePhase } from './phases/WelcomePhase';
import { BusinessDetailsPhase } from './phases/BusinessDetailsPhase';
import { DesignStylePhase } from './phases/DesignStylePhase';
import { ColorCustomizationPhase } from './phases/ColorCustomizationPhase';
import { ContentTonePhase } from './phases/ContentTonePhase';
import { ImagesPhase } from './phases/ImagesPhase';
import { ReviewPhase } from './phases/ReviewPhase';
import { ClarificationPhase } from './phases/ClarificationPhase';
import { GeneratingPhase } from './phases/GeneratingPhase';
import { CompletePhase } from './phases/CompletePhase';

// Icon mapping
const PHASE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Building,
  Palette,
  Paintbrush,
  MessageSquare,
  Image,
  CheckCircle,
  HelpCircle,
  Loader: Loader2,
  PartyPopper,
};

// Phase components mapping
const PHASE_COMPONENTS: Record<BuildPhase, React.ComponentType> = {
  'welcome': WelcomePhase,
  'business-details': BusinessDetailsPhase,
  'design-style': DesignStylePhase,
  'color-customization': ColorCustomizationPhase,
  'content-tone': ContentTonePhase,
  'images': ImagesPhase,
  'review': ReviewPhase,
  'clarification': ClarificationPhase,
  'generating': GeneratingPhase,
  'complete': CompletePhase,
};

interface BuildGuidanceSidebarProps {
  onClose?: () => void;
  className?: string;
}

export function BuildGuidanceSidebar({ onClose, className = '' }: BuildGuidanceSidebarProps) {
  const {
    currentPhase,
    previousPhase,
    nextPhase,
    canGoNext,
    canGoPrevious,
    isGenerating,
    completedPhases,
    triggerClarificationOrGenerate,
  } = useBuildGuidance();

  const currentPhaseConfig = BUILD_PHASES.find(p => p.id === currentPhase);
  const PhaseComponent = PHASE_COMPONENTS[currentPhase] || WelcomePhase;
  const PhaseIcon = PHASE_ICONS[currentPhaseConfig?.icon || 'Sparkles'] || Sparkles;

  const isNextDisabled = !canGoNext() || isGenerating;
  const isPreviousDisabled = !canGoPrevious() || isGenerating;

  return (
    <div
      className={`
        flex flex-col h-full bg-gray-900 border-l border-gray-800
        w-full md:w-[420px] lg:w-[480px]
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <PhaseIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {currentPhaseConfig?.title || 'Build Your Website'}
              </h2>
              <p className="text-sm text-gray-400">
                {currentPhaseConfig?.description}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Phase Indicator */}
        <PhaseIndicator
          currentPhase={currentPhase}
          completedPhases={completedPhases}
        />
      </div>

      {/* Phase Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="p-6"
          >
            <PhaseComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      {currentPhase !== 'generating' && currentPhase !== 'complete' && currentPhase !== 'clarification' && (
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            {/* Back Button */}
            <button
              onClick={previousPhase}
              disabled={isPreviousDisabled}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                ${isPreviousDisabled
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }
              `}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Next Button */}
            <button
              onClick={currentPhase === 'review' ? triggerClarificationOrGenerate : nextPhase}
              disabled={isNextDisabled}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all
                ${isNextDisabled
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-400 hover:to-accent-400 shadow-lg shadow-primary-500/25'
                }
              `}
            >
              {currentPhase === 'review' ? 'Generate Website' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Skip optional phases */}
          {currentPhaseConfig?.optional && (
            <button
              onClick={nextPhase}
              className="w-full mt-3 text-center text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              Skip this step
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default BuildGuidanceSidebar;
