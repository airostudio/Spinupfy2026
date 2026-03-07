'use client';

/**
 * Business Details Phase
 * Collects core business information
 */

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building, MapPin, Phone, Mail, Globe, Info, Sparkles, AlertCircle } from 'lucide-react';
import { useBuildGuidance } from '@/lib/store/build-guidance.store';
import { BUSINESS_TYPES, BUSINESS_CATEGORIES, getBusinessTypeById } from '@/lib/config/business-types';
import { detectBusinessType, findClosestBusinessType } from '@/lib/business-type-detector';

export function BusinessDetailsPhase() {
  const { businessVariables, updateBusinessVariables, markPhaseComplete, setDetectionConfidence } = useBuildGuidance();

  const [localState, setLocalState] = useState({
    businessName: businessVariables.businessName || '',
    description: businessVariables.description || '',
    businessType: businessVariables.businessType || '',
    email: businessVariables.email || '',
    phone: businessVariables.phone || '',
  });

  const [autoDetectedType, setAutoDetectedType] = useState<string | null>(null);
  const [detectionInfo, setDetectionInfo] = useState<{
    confidence: number;
    matchedKeywords: string[];
  } | null>(null);
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  // Auto-detect business type from description
  useEffect(() => {
    if (localState.description && localState.description.length > 15) {
      const timer = setTimeout(() => {
        const detection = detectBusinessType(localState.description, localState.businessName);
        setAutoDetectedType(detection.primaryType.id);
        setDetectionInfo({
          confidence: detection.confidence,
          matchedKeywords: detection.matchedKeywords.slice(0, 3),
        });

        // Update confidence in the store for later use
        setDetectionConfidence({
          confidence: detection.confidence,
          matchMethod: detection.confidence >= 0.5 ? 'keyword_match' : 'low_confidence',
          needsClarification: detection.confidence < 0.5,
        });

        // Auto-select if confidence is high and user hasn't manually selected
        if (detection.confidence >= 0.6 && !localState.businessType && !isOtherSelected) {
          setLocalState(prev => ({ ...prev, businessType: detection.primaryType.id }));
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [localState.description, localState.businessName, localState.businessType, isOtherSelected, setDetectionConfidence]);

  // Update store when local state changes (debounced effect)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateBusinessVariables(localState);
    }, 300);
    return () => clearTimeout(timer);
  }, [localState, updateBusinessVariables]);

  // Mark phase complete when required fields are filled
  // If "other" is selected, we still allow proceeding with just the description
  useEffect(() => {
    const hasRequiredFields = localState.businessName && localState.description;
    const hasBusinessType = localState.businessType || isOtherSelected;
    if (hasRequiredFields && hasBusinessType) {
      markPhaseComplete('business-details');
    }
  }, [localState.businessName, localState.businessType, localState.description, isOtherSelected, markPhaseComplete]);

  const handleChange = (field: string, value: string) => {
    if (field === 'businessType') {
      if (value === 'other') {
        setIsOtherSelected(true);
        // Keep the value as empty so the form stays valid with description
        setLocalState(prev => ({ ...prev, businessType: '' }));
        // Mark as low confidence needing clarification
        setDetectionConfidence({
          confidence: 0.2,
          matchMethod: 'user_selected_other',
          needsClarification: true,
        });
        return;
      } else {
        setIsOtherSelected(false);
        // User explicitly selected a type, high confidence
        setDetectionConfidence({
          confidence: 1.0,
          matchMethod: 'user_selected',
          needsClarification: false,
        });
      }
    }
    setLocalState(prev => ({ ...prev, [field]: value }));
  };

  const selectedType = localState.businessType ? getBusinessTypeById(localState.businessType) : null;
  const showAutoDetection = autoDetectedType && !localState.businessType && detectionInfo && detectionInfo.confidence > 0.3;

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-start gap-3 p-4 rounded-lg bg-primary-500/10 border border-primary-500/20"
      >
        <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-gray-300">
            Tell us about your business and we&apos;ll create a design that perfectly matches your industry and style.
          </p>
        </div>
      </motion.div>

      {/* Business Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Business Name *
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={localState.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            placeholder="Enter your business name"
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          />
        </div>
      </motion.div>

      {/* Business Type */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Business Type *
        </label>

        {/* Auto-detection suggestion */}
        {showAutoDetection && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-400">Suggested Match</span>
            </div>
            <button
              type="button"
              onClick={() => handleChange('businessType', autoDetectedType!)}
              className="w-full p-2 bg-gray-800/50 rounded-lg text-left hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{getBusinessTypeById(autoDetectedType!)?.emoji}</span>
                <div className="flex-1">
                  <span className="text-sm text-white group-hover:text-primary-400 transition-colors">
                    {getBusinessTypeById(autoDetectedType!)?.label}
                  </span>
                  {detectionInfo?.matchedKeywords.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Matched: {detectionInfo.matchedKeywords.join(', ')}
                    </p>
                  )}
                </div>
                <span className="text-xs text-primary-400">Click to use</span>
              </div>
            </button>
          </motion.div>
        )}

        {/* "Other" selection notice */}
        {isOtherSelected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
              <div>
                <span className="text-sm text-amber-400 font-medium">Custom Business Type</span>
                <p className="text-xs text-gray-400 mt-1">
                  No worries! Just describe your business well below and we&apos;ll ask a few quick questions to get it right.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <select
          value={isOtherSelected ? 'other' : localState.businessType}
          onChange={(e) => handleChange('businessType', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors appearance-none cursor-pointer"
        >
          <option value="">Select your business type</option>
          {BUSINESS_CATEGORIES.map((cat) => (
            <optgroup key={cat.category} label={cat.category}>
              {cat.types.map((typeId) => {
                const type = getBusinessTypeById(typeId);
                return type ? (
                  <option key={type.id} value={type.id}>
                    {type.emoji} {type.label}
                  </option>
                ) : null;
              })}
            </optgroup>
          ))}
          <optgroup label="Can't find your type?">
            <option value="other">✨ Something else / I&apos;ll describe it</option>
          </optgroup>
        </select>

        {/* Selected type info */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
          >
            <div className="flex items-start gap-2">
              <span className="text-2xl">{selectedType.emoji}</span>
              <div>
                <h4 className="text-sm font-medium text-white">{selectedType.label}</h4>
                <p className="text-xs text-gray-400 mt-1">{selectedType.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedType.colorTheme.primary }}
                  />
                  <span className="text-xs text-gray-500 capitalize">
                    {selectedType.colorTheme.mood} mood
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Business Description *
        </label>
        <textarea
          value={localState.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe what your business does, your services, and what makes you unique..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Be as detailed as possible - this helps us create better content for your website.
        </p>
      </motion.div>

      {/* Optional Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="text-sm font-medium text-gray-400">Contact Information (Optional)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              value={localState.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="tel"
              value={localState.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Phone number"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default BusinessDetailsPhase;
