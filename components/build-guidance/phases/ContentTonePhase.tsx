'use client';

/**
 * Content Tone Phase
 * Sets the voice and tone for generated content
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, RefreshCw, Lightbulb } from 'lucide-react';
import { useBuildGuidance, ContentTone } from '@/lib/store/build-guidance.store';

const TONE_OPTIONS: {
  id: ContentTone;
  name: string;
  description: string;
  example: string;
  emoji: string;
}[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Polished, expert, trustworthy',
    example: 'We deliver excellence through innovative solutions.',
    emoji: '💼',
  },
  {
    id: 'friendly',
    name: 'Friendly',
    description: 'Warm, approachable, conversational',
    example: "Hey there! We're here to help you succeed.",
    emoji: '👋',
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Relaxed, down-to-earth, relatable',
    example: "Let's make something awesome together.",
    emoji: '😊',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Sophisticated, exclusive, refined',
    example: 'Experience unparalleled elegance and distinction.',
    emoji: '✨',
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Fun, energetic, creative',
    example: "Ready to have some fun? Let's go!",
    emoji: '🎉',
  },
  {
    id: 'authoritative',
    name: 'Authoritative',
    description: 'Confident, expert, industry-leading',
    example: 'The definitive standard in our industry.',
    emoji: '🏆',
  },
];

export function ContentTonePhase() {
  const {
    contentTone,
    setContentTone,
    businessVariables,
    updateBusinessVariables,
    markPhaseComplete,
  } = useBuildGuidance();

  const [tagline, setTagline] = useState(businessVariables.tagline || '');
  const [usps, setUsps] = useState<string[]>(businessVariables.usps || ['', '', '']);
  const [isGeneratingTaglines, setIsGeneratingTaglines] = useState(false);
  const [isGeneratingUSPs, setIsGeneratingUSPs] = useState(false);
  const [suggestedTaglines, setSuggestedTaglines] = useState<string[]>([]);
  const [suggestedUSPs, setSuggestedUSPs] = useState<string[]>([]);

  // Update store when tagline changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tagline !== businessVariables.tagline) {
        updateBusinessVariables({ tagline });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [tagline, businessVariables.tagline, updateBusinessVariables]);

  // Update store when USPs change
  useEffect(() => {
    const timer = setTimeout(() => {
      const filteredUsps = usps.filter(u => u.trim() !== '');
      updateBusinessVariables({ usps: filteredUsps });
    }, 300);
    return () => clearTimeout(timer);
  }, [usps, updateBusinessVariables]);

  useEffect(() => {
    markPhaseComplete('content-tone');
  }, [contentTone, markPhaseComplete]);

  const handleToneSelect = (tone: ContentTone) => {
    setContentTone(tone);
  };

  const handleUSPChange = (index: number, value: string) => {
    const newUsps = [...usps];
    newUsps[index] = value;
    setUsps(newUsps);
  };

  const handleGenerateTaglines = async () => {
    if (!businessVariables.businessName || !businessVariables.description) return;

    setIsGeneratingTaglines(true);
    try {
      const response = await fetch('/api/build-guidance/generate-taglines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessVariables.businessName,
          businessType: businessVariables.businessType,
          description: businessVariables.description,
          tone: contentTone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedTaglines(data.taglines || []);
      }
    } catch (error) {
      console.error('Failed to generate taglines:', error);
    }
    setIsGeneratingTaglines(false);
  };

  const handleGenerateUSPs = async () => {
    if (!businessVariables.businessName || !businessVariables.description) return;

    setIsGeneratingUSPs(true);
    try {
      const response = await fetch('/api/build-guidance/generate-usps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessVariables.businessName,
          businessType: businessVariables.businessType,
          description: businessVariables.description,
          tone: contentTone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedUSPs(data.usps || data.templateSuggestions || []);
      }
    } catch (error) {
      console.error('Failed to generate USPs:', error);
    }
    setIsGeneratingUSPs(false);
  };

  const applyUSP = (usp: string) => {
    // Find first empty slot or add to end
    const emptyIndex = usps.findIndex(u => u.trim() === '');
    if (emptyIndex !== -1) {
      const newUsps = [...usps];
      newUsps[emptyIndex] = usp;
      setUsps(newUsps);
    } else if (usps.length < 5) {
      setUsps([...usps, usp]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <h3 className="text-lg font-semibold text-white mb-2">
          Content & Tone
        </h3>
        <p className="text-sm text-gray-400">
          Choose how your website should communicate
        </p>
      </motion.div>

      {/* Tone Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <h4 className="text-sm font-medium text-gray-300">Voice & Tone</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TONE_OPTIONS.map((tone, index) => {
            const isSelected = contentTone === tone.id;
            return (
              <motion.button
                key={tone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => handleToneSelect(tone.id)}
                className={`
                  relative p-3 rounded-lg border text-left transition-all
                  ${isSelected
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{tone.emoji}</span>
                  <span className="text-sm font-medium text-white">{tone.name}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary-400 ml-auto" />
                  )}
                </div>
                <p className="text-xs text-gray-400">{tone.description}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Tone example */}
        {contentTone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
          >
            <p className="text-xs text-gray-500 mb-1">Example:</p>
            <p className="text-sm text-gray-300 italic">
              &ldquo;{TONE_OPTIONS.find(t => t.id === contentTone)?.example}&rdquo;
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-300">Tagline (Optional)</h4>
          <button
            onClick={handleGenerateTaglines}
            disabled={isGeneratingTaglines}
            className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 disabled:text-gray-500"
          >
            {isGeneratingTaglines ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            Suggest
          </button>
        </div>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="A short phrase that captures your brand"
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
        />

        {/* Suggested taglines */}
        {suggestedTaglines.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2"
          >
            {suggestedTaglines.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setTagline(suggestion)}
                className="px-3 py-1.5 text-xs bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 border border-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Unique Selling Points */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-300">
            Key Selling Points (Optional)
          </h4>
          <button
            onClick={handleGenerateUSPs}
            disabled={isGeneratingUSPs}
            className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 disabled:text-gray-500"
          >
            {isGeneratingUSPs ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Lightbulb className="w-3 h-3" />
            )}
            Suggest
          </button>
        </div>
        <p className="text-xs text-gray-500">
          What makes your business unique? These will be highlighted on your site.
        </p>
        <div className="space-y-2">
          {usps.map((usp, index) => (
            <input
              key={index}
              type="text"
              value={usp}
              onChange={(e) => handleUSPChange(index, e.target.value)}
              placeholder={`Selling point ${index + 1}`}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
            />
          ))}
        </div>

        {/* Suggested USPs */}
        {suggestedUSPs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <p className="text-xs text-gray-500">Click to add:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedUSPs.slice(0, 6).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => applyUSP(suggestion)}
                  className="px-3 py-1.5 text-xs bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 border border-gray-700 transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default ContentTonePhase;
