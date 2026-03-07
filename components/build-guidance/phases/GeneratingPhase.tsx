'use client';

/**
 * Generating Phase
 * Shows progress while the website is being generated
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Check,
  Sparkles,
  FileText,
  Image,
  Palette,
  Code,
  Zap,
} from 'lucide-react';
import { useBuildGuidance } from '@/lib/store/build-guidance.store';

const GENERATION_STEPS = [
  { id: 'analyzing', label: 'Analyzing your business', icon: Sparkles },
  { id: 'content', label: 'Generating content', icon: FileText },
  { id: 'images', label: 'Selecting images', icon: Image },
  { id: 'styling', label: 'Applying design tokens', icon: Palette },
  { id: 'building', label: 'Building pages', icon: Code },
  { id: 'finalizing', label: 'Finalizing website', icon: Zap },
];

export function GeneratingPhase() {
  const {
    generationProgress,
    isGenerating,
    generationError,
    businessVariables,
    selectedPreset,
    designTokens,
    contentTone,
    imageSelections,
    updateGenerationProgress,
    completeGeneration,
    failGeneration,
  } = useBuildGuidance();

  // Simulate generation process (in production, this would be SSE from server)
  useEffect(() => {
    if (!isGenerating) return;

    const generateWebsite = async () => {
      try {
        // Step 1: Analyzing
        updateGenerationProgress({
          step: 'analyzing',
          progress: 10,
          message: 'Understanding your business needs...',
        });
        await delay(1500);

        // Step 2: Content
        updateGenerationProgress({
          step: 'content',
          progress: 30,
          message: 'Creating compelling content...',
        });

        // Get the full image URLs from selected IDs
        const getImageUrl = (section: 'hero' | 'about'): string | undefined => {
          const selectedId = section === 'hero'
            ? imageSelections.selectedHero
            : imageSelections.selectedAbout;
          if (!selectedId) return undefined;
          const images = imageSelections[section] || [];
          const selectedImage = images.find(img => img.id === selectedId);
          return selectedImage?.url;
        };

        const heroImageUrl = getImageUrl('hero');
        const aboutImageUrl = getImageUrl('about');

        // Make actual API call
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: businessVariables.businessName,
            description: businessVariables.description,
            websiteType: businessVariables.businessType,
            designPreset: selectedPreset,
            designTokens: designTokens,
            contentTone: contentTone,
            selectedImages: {
              heroUrl: heroImageUrl,
              aboutUrl: aboutImageUrl,
            },
            email: businessVariables.email,
            phone: businessVariables.phone,
            tagline: businessVariables.tagline,
            usps: businessVariables.usps,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || errorData.details || 'Generation failed');
        }

        const data = await response.json();

        // Step 3: Images
        updateGenerationProgress({
          step: 'images',
          progress: 50,
          message: 'Selecting perfect images...',
        });
        await delay(800);

        // Step 4: Styling
        updateGenerationProgress({
          step: 'styling',
          progress: 70,
          message: 'Applying your design style...',
        });
        await delay(800);

        // Step 5: Building
        updateGenerationProgress({
          step: 'building',
          progress: 85,
          message: 'Building your pages...',
        });
        await delay(800);

        // Step 6: Finalizing
        updateGenerationProgress({
          step: 'finalizing',
          progress: 95,
          message: 'Adding final touches...',
        });
        await delay(500);

        completeGeneration(data.websiteId);
      } catch (error) {
        console.error('Generation failed:', error);
        failGeneration(error instanceof Error ? error.message : 'Generation failed');
      }
    };

    generateWebsite();
  }, [isGenerating]);

  const currentStepIndex = GENERATION_STEPS.findIndex(
    (step) => step.id === generationProgress.step
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-4"
        >
          <div className="w-full h-full rounded-full border-4 border-primary-500/30 border-t-primary-500" />
        </motion.div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Creating Your Website
        </h3>
        <p className="text-sm text-gray-400">
          {generationProgress.message || 'Please wait...'}
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
            initial={{ width: '0%' }}
            animate={{ width: `${generationProgress.progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>{generationProgress.progress}%</span>
        </div>
      </motion.div>

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        {GENERATION_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-colors
                ${isCurrent ? 'bg-primary-500/10 border border-primary-500/30' : 'bg-gray-800/30'}
              `}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isComplete ? 'bg-green-500' : isCurrent ? 'bg-primary-500' : 'bg-gray-700'}
                `}
              >
                {isComplete ? (
                  <Check className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <span
                className={`
                  text-sm
                  ${isComplete ? 'text-green-400' : isCurrent ? 'text-white' : 'text-gray-500'}
                `}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Error state */}
      {generationError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30"
        >
          <p className="text-sm text-red-400">{generationError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
          >
            Try again
          </button>
        </motion.div>
      )}

      {/* Fun fact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <p className="text-xs text-gray-500">
          💡 Tip: You can edit everything after the website is generated
        </p>
      </motion.div>
    </div>
  );
}

// Helper function
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default GeneratingPhase;
