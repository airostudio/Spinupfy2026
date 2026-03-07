'use client';

/**
 * Clarification Phase
 * Asks targeted questions when business type detection confidence is low
 * to ensure we generate the right website for the user
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Target,
  Layers,
  ShoppingBag,
  Calendar,
  Image,
  FileText,
  Users,
  Check,
} from 'lucide-react';
import { useBuildGuidance, ClarificationAnswers } from '@/lib/store/build-guidance.store';
import { getBusinessTypeById } from '@/lib/config/business-types';

// Question configurations
const BUSINESS_CATEGORY_OPTIONS = [
  { id: 'food-hospitality', label: 'Food & Hospitality', icon: '🍽️', description: 'Restaurant, cafe, bakery, hotel' },
  { id: 'professional-services', label: 'Professional Services', icon: '💼', description: 'Law, accounting, consulting' },
  { id: 'healthcare-wellness', label: 'Healthcare & Wellness', icon: '🏥', description: 'Medical, dental, fitness, spa' },
  { id: 'home-services', label: 'Home Services', icon: '🔧', description: 'Plumber, electrician, HVAC, roofing' },
  { id: 'creative-tech', label: 'Creative & Technology', icon: '💻', description: 'Agency, software, photography' },
  { id: 'retail-ecommerce', label: 'Retail & E-commerce', icon: '🛒', description: 'Online store, fashion, products' },
  { id: 'personal-portfolio', label: 'Personal & Portfolio', icon: '📁', description: 'Personal brand, portfolio, blog' },
  { id: 'other', label: 'Something Else', icon: '✨', description: "I'll describe it below" },
];

const WEBSITE_TYPE_OPTIONS = [
  { id: 'service-business', label: 'Service Business', icon: Target, description: 'Showcase services, get leads & bookings' },
  { id: 'product-sales', label: 'Product Sales', icon: ShoppingBag, description: 'Sell physical or digital products' },
  { id: 'portfolio-showcase', label: 'Portfolio / Showcase', icon: Image, description: 'Display work, projects, or creations' },
  { id: 'informational', label: 'Informational', icon: FileText, description: 'Share information about organization' },
];

const PRIMARY_GOAL_OPTIONS = [
  { id: 'get-customers', label: 'Get New Customers', description: 'Generate leads and inquiries' },
  { id: 'sell-online', label: 'Sell Products/Services Online', description: 'E-commerce or bookings' },
  { id: 'build-credibility', label: 'Build Credibility', description: 'Establish trust and authority' },
  { id: 'showcase-work', label: 'Showcase My Work', description: 'Display portfolio or projects' },
];

const KEY_FEATURE_OPTIONS = [
  { id: 'booking', label: 'Online Booking', icon: Calendar, description: 'Let customers schedule appointments' },
  { id: 'ecommerce', label: 'Online Store', icon: ShoppingBag, description: 'Sell products with cart & checkout' },
  { id: 'gallery', label: 'Photo Gallery', icon: Image, description: 'Showcase images and projects' },
  { id: 'team', label: 'Team Profiles', icon: Users, description: 'Introduce team members' },
  { id: 'pricing', label: 'Pricing Tables', icon: Layers, description: 'Display service packages or prices' },
  { id: 'testimonials', label: 'Testimonials', icon: FileText, description: 'Show customer reviews' },
];

export function ClarificationPhase() {
  const {
    businessVariables,
    clarificationAnswers,
    updateClarificationAnswers,
    updateBusinessVariables,
    completeClarification,
    startGeneration,
  } = useBuildGuidance();

  const [currentStep, setCurrentStep] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<ClarificationAnswers>(clarificationAnswers);

  // Determine which questions to show based on detection
  const questions = [
    {
      id: 'category',
      title: 'What best describes your business?',
      subtitle: 'This helps us choose the right design style and content',
      type: 'category' as const,
    },
    {
      id: 'websiteType',
      title: 'What type of website do you need?',
      subtitle: 'Each type has different layouts and features',
      type: 'websiteType' as const,
    },
    {
      id: 'features',
      title: 'What features do you need?',
      subtitle: 'Select all that apply - you can always add more later',
      type: 'features' as const,
    },
  ];

  const currentQuestion = questions[currentStep];

  const handleCategorySelect = (categoryId: string) => {
    setLocalAnswers({ ...localAnswers, businessCategory: categoryId });

    // Map category to a business type if possible
    const categoryToTypeMap: Record<string, string> = {
      'food-hospitality': 'restaurant',
      'professional-services': 'consulting',
      'healthcare-wellness': 'medical',
      'home-services': 'plumber',
      'creative-tech': 'tech-saas',
      'retail-ecommerce': 'ecommerce',
      'personal-portfolio': 'portfolio',
    };

    if (categoryId !== 'other' && categoryToTypeMap[categoryId]) {
      // Suggest a business type based on category
      updateBusinessVariables({ businessType: categoryToTypeMap[categoryId] });
    }

    // Move to next question after a brief delay
    setTimeout(() => setCurrentStep(1), 300);
  };

  const handleWebsiteTypeSelect = (typeId: string) => {
    setLocalAnswers({ ...localAnswers, websiteType: typeId });

    // Refine business type based on website type
    const { businessCategory } = localAnswers;
    let refinedType = businessVariables.businessType;

    // If selling products, suggest ecommerce
    if (typeId === 'product-sales') {
      refinedType = 'ecommerce';
    } else if (typeId === 'portfolio-showcase') {
      refinedType = 'portfolio';
    }

    if (refinedType && refinedType !== businessVariables.businessType) {
      updateBusinessVariables({ businessType: refinedType });
    }

    setTimeout(() => setCurrentStep(2), 300);
  };

  const handleFeatureToggle = (featureId: string) => {
    const currentFeatures = localAnswers.keyFeatures || [];
    const newFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter((f) => f !== featureId)
      : [...currentFeatures, featureId];
    setLocalAnswers({ ...localAnswers, keyFeatures: newFeatures });
  };

  const handleComplete = () => {
    // Save all answers to store
    updateClarificationAnswers(localAnswers);
    completeClarification();
    // Start generation
    startGeneration();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
          <HelpCircle className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          A Few Quick Questions
        </h3>
        <p className="text-sm text-gray-400">
          Help us create the perfect website for &ldquo;{businessVariables.businessName}&rdquo;
        </p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentStep
                ? 'bg-primary-500'
                : index < currentStep
                ? 'bg-primary-500/50'
                : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Question Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        <div className="text-center mb-4">
          <h4 className="text-white font-medium">{currentQuestion.title}</h4>
          <p className="text-sm text-gray-500">{currentQuestion.subtitle}</p>
        </div>

        {/* Category Selection */}
        {currentQuestion.type === 'category' && (
          <div className="grid grid-cols-2 gap-3">
            {BUSINESS_CATEGORY_OPTIONS.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategorySelect(option.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  localAnswers.businessCategory === option.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <span className="text-2xl mb-2 block">{option.icon}</span>
                <span className="text-sm font-medium text-white block">
                  {option.label}
                </span>
                <span className="text-xs text-gray-500">{option.description}</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Website Type Selection */}
        {currentQuestion.type === 'websiteType' && (
          <div className="space-y-3">
            {WEBSITE_TYPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleWebsiteTypeSelect(option.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                    localAnswers.websiteType === option.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white block">
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500">{option.description}</span>
                  </div>
                  {localAnswers.websiteType === option.id && (
                    <Check className="w-5 h-5 text-primary-500 ml-auto" />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Features Selection */}
        {currentQuestion.type === 'features' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {KEY_FEATURE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = localAnswers.keyFeatures?.includes(option.id);
                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFeatureToggle(option.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-primary-400' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium text-white">
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary-500 ml-auto" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{option.description}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Generate button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium shadow-lg shadow-primary-500/25 hover:from-primary-400 hover:to-accent-400 transition-all"
            >
              Generate My Website
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Back button for steps 1 and 2 */}
      {currentStep > 0 && currentQuestion.type !== 'features' && (
        <button
          onClick={handleBack}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-400 transition-colors"
        >
          Back to previous question
        </button>
      )}

      {/* Why we're asking */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50"
      >
        <p className="text-xs text-gray-500 text-center">
          These questions help us create a website tailored specifically to your business needs.
          Your answers determine the layout, features, and content style.
        </p>
      </motion.div>
    </div>
  );
}

export default ClarificationPhase;
