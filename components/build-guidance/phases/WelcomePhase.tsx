'use client';

/**
 * Welcome Phase
 * Introduction to the build guidance experience with Quick Start option
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Palette, Image, ArrowRight, Rocket } from 'lucide-react';
import { useBuildGuidance } from '@/lib/store/build-guidance.store';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Design',
    description: 'Our AI analyzes your business type to suggest the perfect design',
  },
  {
    icon: Palette,
    title: 'Custom Color Palettes',
    description: 'Industry-specific color schemes that match your brand',
  },
  {
    icon: Image,
    title: 'Smart Imagery',
    description: 'Automatically selected images that represent your business',
  },
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Get a complete, professional website in minutes',
  },
];

export function WelcomePhase() {
  const { startSession, nextPhase, quickStart } = useBuildGuidance();
  const [prompt, setPrompt] = useState('');

  const handleStart = () => {
    startSession();
    nextPhase();
  };

  const handleQuickStart = () => {
    if (prompt.trim().length < 10) return;
    quickStart(prompt.trim());
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Let&apos;s Create Something Amazing
        </h2>
        <p className="text-gray-400 max-w-sm mx-auto">
          Describe your business and we&apos;ll build a stunning website for you instantly.
        </p>
      </motion.div>

      {/* Quick Start Prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your business... e.g., 'A modern coffee shop in downtown Seattle specializing in artisan roasts and cozy atmosphere'"
            className="w-full h-28 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
            {prompt.length}/500
          </div>
        </div>
        <button
          onClick={handleQuickStart}
          disabled={prompt.trim().length < 10}
          className={`
            w-full py-4 font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2
            ${prompt.trim().length >= 10
              ? 'bg-gradient-to-r from-accent-500 to-primary-500 hover:from-accent-400 hover:to-primary-400 text-white shadow-accent-500/25'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <Rocket className="w-5 h-5" />
          Quick Start - Generate Now
        </button>
        <p className="text-center text-xs text-gray-500">
          Skip the wizard and generate instantly
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4"
      >
        <div className="flex-1 h-px bg-gray-700/50" />
        <span className="text-xs text-gray-500 uppercase tracking-wider">or customize</span>
        <div className="flex-1 h-px bg-gray-700/50" />
      </motion.div>

      {/* Features (collapsible) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid gap-2"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/30 border border-gray-700/30"
            >
              <div className="w-6 h-6 rounded-md bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3 h-3 text-primary-400" />
              </div>
              <span className="text-xs text-gray-400">{feature.title}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Guided CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <button
          onClick={handleStart}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2"
        >
          Step-by-Step Builder
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-center text-xs text-gray-500 mt-2">
          More control over design, colors, and content
        </p>
      </motion.div>
    </div>
  );
}

export default WelcomePhase;
