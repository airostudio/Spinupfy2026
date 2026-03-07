'use client';

/**
 * Phase Indicator Component
 * Shows progress through the build phases
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { BUILD_PHASES, BuildPhase } from '@/lib/store/build-guidance.store';

interface PhaseIndicatorProps {
  currentPhase: BuildPhase;
  completedPhases: BuildPhase[];
}

export function PhaseIndicator({ currentPhase, completedPhases }: PhaseIndicatorProps) {
  // Filter out generating and complete phases for the indicator
  const visiblePhases = BUILD_PHASES.filter(
    p => !['generating', 'complete', 'welcome'].includes(p.id)
  );

  const currentIndex = visiblePhases.findIndex(p => p.id === currentPhase);

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden mb-3">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-accent-500"
          initial={{ width: '0%' }}
          animate={{
            width: `${Math.max(
              ((completedPhases.length) / visiblePhases.length) * 100,
              currentPhase === 'welcome' ? 0 : ((currentIndex + 0.5) / visiblePhases.length) * 100
            )}%`,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Phase dots */}
      <div className="flex items-center justify-between">
        {visiblePhases.map((phase, index) => {
          const isCompleted = completedPhases.includes(phase.id);
          const isCurrent = phase.id === currentPhase;
          const isPast = completedPhases.includes(phase.id);

          return (
            <div
              key={phase.id}
              className="flex flex-col items-center"
            >
              {/* Dot */}
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                }}
                className={`
                  w-3 h-3 rounded-full flex items-center justify-center
                  transition-colors duration-200
                  ${isCompleted
                    ? 'bg-primary-500'
                    : isCurrent
                      ? 'bg-accent-500 ring-4 ring-primary-500/20'
                      : 'bg-gray-700'
                  }
                `}
              >
                {isCompleted && (
                  <Check className="w-2 h-2 text-white" />
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Current phase label */}
      <div className="mt-4 text-center">
        <span className="text-xs text-gray-500">
          {currentIndex >= 0
            ? `Step ${currentIndex + 1} of ${visiblePhases.length}`
            : 'Getting Started'}
        </span>
      </div>
    </div>
  );
}

export default PhaseIndicator;
