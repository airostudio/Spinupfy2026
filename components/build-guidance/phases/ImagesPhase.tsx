'use client';

/**
 * Images Phase
 * Select hero and section images with AI generation option
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, RefreshCw, Check, Sparkles, Wand2, Loader2, HelpCircle } from 'lucide-react';
import { useBuildGuidance, ImageOption, ImageContext } from '@/lib/store/build-guidance.store';
import { ImageContextClarificationModal } from '../ImageContextClarificationModal';

export function ImagesPhase() {
  const {
    businessVariables,
    imageSelections,
    setImageOptions,
    selectImage,
    markPhaseComplete,
    imageContext,
    updateImageContext,
    needsImageContextClarification,
  } = useBuildGuidance();

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'about'>('hero');
  const [showClarificationModal, setShowClarificationModal] = useState(false);

  // Load images on mount
  useEffect(() => {
    if (imageSelections.hero.length === 0) {
      loadImages('hero');
    }
    markPhaseComplete('images');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markPhaseComplete]);

  const loadImages = async (section: 'hero' | 'about') => {
    if (!businessVariables.businessType) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/build-guidance/search-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: businessVariables.businessType,
          businessName: businessVariables.businessName,
          section,
          description: businessVariables.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const images: ImageOption[] = data.images.map((img: any) => ({
          id: img.id,
          url: img.urls.regular,
          thumbUrl: img.urls.small,
          source: 'unsplash',
          alt: img.alt_description || `${businessVariables.businessType} image`,
          photographer: img.user?.name,
          selected: false,
        }));
        setImageOptions(section, images);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    }
    setIsLoading(false);
  };

  const handleImageSelect = (section: 'hero' | 'about', imageId: string) => {
    selectImage(section, imageId);
  };

  const handleGenerateAIImage = async () => {
    if (!businessVariables.businessName) return;

    // Check if we need clarification for better image generation
    if (needsImageContextClarification()) {
      setShowClarificationModal(true);
      return;
    }

    // Proceed with generation
    await generateAIImage(imageContext);
  };

  // Generate AI image with optional context from clarification
  const generateAIImage = async (context?: ImageContext) => {
    setIsGeneratingAI(true);
    setAiGeneratedImage(null);

    try {
      const response = await fetch('/api/build-guidance/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessVariables.businessName,
          businessType: businessVariables.businessType || 'custom',
          section: activeTab,
          description: businessVariables.description,
          style: 'photorealistic',
          imageContext: context,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.image?.url) {
          setAiGeneratedImage(data.image.url);

          // Add to image options
          const newImage: ImageOption = {
            id: `ai-${Date.now()}`,
            url: data.image.url,
            thumbUrl: data.image.url,
            source: 'ai-generated',
            alt: `AI generated ${activeTab} image for ${businessVariables.businessName}`,
            selected: false,
          };

          setImageOptions(activeTab, [newImage, ...imageSelections[activeTab]]);
        }
      }
    } catch (error) {
      console.error('Failed to generate AI image:', error);
    }

    setIsGeneratingAI(false);
  };

  // Handle clarification modal completion
  const handleClarificationComplete = (context: ImageContext) => {
    updateImageContext(context);
    setShowClarificationModal(false);
    // Immediately generate with the new context
    generateAIImage(context);
  };

  const currentImages = imageSelections[activeTab] || [];
  const selectedImageId = activeTab === 'hero'
    ? imageSelections.selectedHero
    : imageSelections.selectedAbout;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <h3 className="text-lg font-semibold text-white mb-2">
          Select Images
        </h3>
        <p className="text-sm text-gray-400">
          Choose images that represent your business
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2"
      >
        {(['hero', 'about'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (imageSelections[tab].length === 0) {
                loadImages(tab);
              }
            }}
            className={`
              flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors
              ${activeTab === tab
                ? 'bg-primary-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
              }
            `}
          >
            {tab === 'hero' ? 'Hero Image' : 'About Image'}
          </button>
        ))}
      </motion.div>

      {/* Refresh button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {currentImages.length} images from Unsplash
        </p>
        <button
          onClick={() => loadImages(activeTab)}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 disabled:text-gray-500"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Image Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1"
      >
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video bg-gray-800 rounded-lg animate-pulse"
            />
          ))
        ) : currentImages.length > 0 ? (
          currentImages.map((image, index) => {
            const isSelected = image.id === selectedImageId;
            return (
              <motion.button
                key={image.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleImageSelect(activeTab, image.id)}
                className={`
                  relative aspect-video rounded-lg overflow-hidden border-2 transition-all group
                  ${isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500/30'
                    : 'border-transparent hover:border-gray-600'
                  }
                `}
              >
                <img
                  src={image.thumbUrl}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {!isSelected && (
                    <span className="text-xs text-white font-medium">Click to select</span>
                  )}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Photographer credit */}
                {image.photographer && (
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-[10px] text-white/70 truncate">
                      Photo by {image.photographer}
                    </p>
                  </div>
                )}
              </motion.button>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-8">
            <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No images found</p>
            <button
              onClick={() => loadImages(activeTab)}
              className="mt-3 text-sm text-primary-400 hover:text-primary-300"
            >
              Try again
            </button>
          </div>
        )}
      </motion.div>

      {/* AI Image generation option */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <Wand2 className="w-4 h-4 text-primary-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-white mb-1">
              AI-Generated Images
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Create a custom image specifically designed for your {activeTab === 'hero' ? 'header' : 'about section'} using AI.
              {needsImageContextClarification() && (
                <span className="block mt-1 text-primary-400">
                  We&apos;ll ask a few quick questions to create the perfect image for your business.
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateAIImage}
                disabled={isGeneratingAI}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isGeneratingAI
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-500 text-white hover:bg-primary-400'
                  }
                `}
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : needsImageContextClarification() ? (
                  <>
                    <HelpCircle className="w-4 h-4" />
                    Customize & Generate
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </>
                )}
              </button>
              {imageContext.clarified && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Customized
                </span>
              )}
            </div>

            {/* AI Generated Image Preview */}
            <AnimatePresence>
              {aiGeneratedImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <div className="relative rounded-lg overflow-hidden border border-primary-500/30">
                    <img
                      src={aiGeneratedImage}
                      alt="AI Generated"
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-primary-500 rounded text-[10px] font-medium text-white flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Generated
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    This image has been added to your selection above.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Skip hint */}
      <p className="text-xs text-gray-500 text-center">
        This step is optional. We&apos;ll select great images automatically if you skip.
      </p>

      {/* Image Context Clarification Modal */}
      <ImageContextClarificationModal
        isOpen={showClarificationModal}
        onClose={() => setShowClarificationModal(false)}
        onComplete={handleClarificationComplete}
      />
    </div>
  );
}

export default ImagesPhase;
