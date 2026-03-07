/**
 * Build Guidance Store
 * Manages state for the interactive website build process
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DesignTokens, DesignPresetId } from '../types/design-tokens.types';
import { BusinessVariables, GeneratedContent } from '../types/business-variables.types';
import { DESIGN_PRESETS, getPresetForBusinessType } from '../config/design-presets';

// Build phases
export type BuildPhase =
  | 'welcome'
  | 'business-details'
  | 'design-style'
  | 'color-customization'
  | 'content-tone'
  | 'images'
  | 'review'
  | 'clarification'
  | 'generating'
  | 'complete';

// Phase configuration
export interface PhaseConfig {
  id: BuildPhase;
  title: string;
  description: string;
  icon: string;
  optional: boolean;
}

export const BUILD_PHASES: PhaseConfig[] = [
  { id: 'welcome', title: 'Welcome', description: 'Start building your website', icon: 'Sparkles', optional: false },
  { id: 'business-details', title: 'Business Details', description: 'Tell us about your business', icon: 'Building', optional: false },
  { id: 'design-style', title: 'Design Style', description: 'Choose your visual style', icon: 'Palette', optional: false },
  { id: 'color-customization', title: 'Colors', description: 'Customize your color palette', icon: 'Paintbrush', optional: true },
  { id: 'content-tone', title: 'Content & Tone', description: 'Define your messaging', icon: 'MessageSquare', optional: false },
  { id: 'images', title: 'Images', description: 'Select imagery for your site', icon: 'Image', optional: true },
  { id: 'review', title: 'Review', description: 'Review before generating', icon: 'CheckCircle', optional: false },
  { id: 'clarification', title: 'Quick Questions', description: 'Help us understand your needs', icon: 'HelpCircle', optional: false },
  { id: 'generating', title: 'Generating', description: 'Creating your website', icon: 'Loader', optional: false },
  { id: 'complete', title: 'Complete', description: 'Your website is ready', icon: 'PartyPopper', optional: false },
];

// Content tone options
export type ContentTone = 'professional' | 'friendly' | 'casual' | 'luxury' | 'playful' | 'authoritative';

// AI suggestion types
export interface DesignSuggestion {
  presetId: DesignPresetId;
  confidence: number;
  reason: string;
}

export interface ContentSuggestion {
  field: string;
  suggestions: string[];
  selectedIndex: number;
}

// Generation progress
export interface GenerationProgress {
  step: string;
  progress: number;
  message: string;
  subSteps?: {
    name: string;
    status: 'pending' | 'in-progress' | 'complete' | 'error';
  }[];
}

// Image selection
export interface ImageOption {
  id: string;
  url: string;
  thumbUrl: string;
  source: 'unsplash' | 'ai-generated' | 'uploaded';
  alt: string;
  photographer?: string;
  selected: boolean;
}

export interface ImageSelections {
  hero: ImageOption[];
  about: ImageOption[];
  gallery: ImageOption[];
  selectedHero?: string;
  selectedAbout?: string;
  selectedGallery?: string[];
}

// Clarification answers for low-confidence business type matching
export interface ClarificationAnswers {
  businessCategory?: string;
  websiteType?: string;
  primaryGoal?: string;
  keyFeatures?: string[];
}

// Image context for custom/unknown business types
export interface ImageContext {
  visualTheme?: 'industrial' | 'corporate' | 'lifestyle' | 'nature' | 'tech' | 'creative' | 'medical' | 'service' | 'custom';
  mainSubjects?: string[];
  mood?: 'professional' | 'energetic' | 'warm' | 'calm' | 'modern' | 'traditional' | 'luxury';
  customDescription?: string;
  clarified?: boolean;
}

// Business type detection confidence
export interface DetectionConfidence {
  confidence: number;
  matchMethod: string;
  needsClarification: boolean;
}

// Build guidance state
interface BuildGuidanceState {
  // === Session ===
  sessionId: string | null;
  startedAt: string | null;

  // === Phase Management ===
  currentPhase: BuildPhase;
  phaseHistory: BuildPhase[];
  completedPhases: BuildPhase[];

  // === Business Variables ===
  businessVariables: Partial<BusinessVariables>;

  // === Design Tokens ===
  selectedPreset: DesignPresetId | null;
  designTokens: Partial<DesignTokens>;
  customizedColors: boolean;

  // === Content ===
  contentTone: ContentTone;
  generatedContent: Partial<GeneratedContent>;

  // === Images ===
  imageSelections: ImageSelections;

  // === AI Suggestions ===
  designSuggestions: DesignSuggestion[];
  contentSuggestions: ContentSuggestion[];
  isLoadingSuggestions: boolean;

  // === Generation ===
  isGenerating: boolean;
  generationProgress: GenerationProgress;
  generationError: string | null;

  // === Generated Output ===
  generatedWebsiteId: string | null;
  previewHtml: string | null;

  // === Clarification ===
  detectionConfidence: DetectionConfidence | null;
  clarificationAnswers: ClarificationAnswers;
  clarificationCompleted: boolean;

  // === Image Context ===
  imageContext: ImageContext;

  // === Actions ===
  // Session
  startSession: () => void;
  resetSession: () => void;

  // Phase navigation
  setPhase: (phase: BuildPhase) => void;
  nextPhase: () => void;
  previousPhase: () => void;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  markPhaseComplete: (phase: BuildPhase) => void;

  // Business variables
  updateBusinessVariables: (updates: Partial<BusinessVariables>) => void;
  setBusinessVariables: (variables: Partial<BusinessVariables>) => void;

  // Design
  selectPreset: (presetId: DesignPresetId) => void;
  updateDesignTokens: (updates: Partial<DesignTokens>) => void;
  resetToPreset: () => void;

  // Content
  setContentTone: (tone: ContentTone) => void;
  updateGeneratedContent: (updates: Partial<GeneratedContent>) => void;

  // Images
  setImageOptions: (section: 'hero' | 'about' | 'gallery', options: ImageOption[]) => void;
  selectImage: (section: 'hero' | 'about' | 'gallery', imageId: string) => void;

  // AI Suggestions
  setDesignSuggestions: (suggestions: DesignSuggestion[]) => void;
  setContentSuggestions: (suggestions: ContentSuggestion[]) => void;
  setLoadingSuggestions: (loading: boolean) => void;

  // Generation
  startGeneration: () => void;
  updateGenerationProgress: (progress: GenerationProgress) => void;
  completeGeneration: (websiteId: string) => void;
  failGeneration: (error: string) => void;

  // Clarification
  setDetectionConfidence: (confidence: DetectionConfidence) => void;
  updateClarificationAnswers: (answers: Partial<ClarificationAnswers>) => void;
  completeClarification: () => void;
  checkNeedsClarification: () => boolean;
  triggerClarificationOrGenerate: () => void;

  // Image Context
  updateImageContext: (context: Partial<ImageContext>) => void;
  needsImageContextClarification: () => boolean;

  // Quick Start
  quickStart: (prompt: string) => void;

  // Preview
  setPreviewHtml: (html: string) => void;
}

// Initial state
const initialState = {
  sessionId: null,
  startedAt: null,
  currentPhase: 'welcome' as BuildPhase,
  phaseHistory: [] as BuildPhase[],
  completedPhases: [] as BuildPhase[],
  businessVariables: {},
  selectedPreset: null,
  designTokens: {},
  customizedColors: false,
  contentTone: 'professional' as ContentTone,
  generatedContent: {},
  imageSelections: {
    hero: [],
    about: [],
    gallery: [],
  },
  designSuggestions: [],
  contentSuggestions: [],
  isLoadingSuggestions: false,
  isGenerating: false,
  generationProgress: {
    step: '',
    progress: 0,
    message: '',
  },
  generationError: null,
  generatedWebsiteId: null,
  previewHtml: null,
  detectionConfidence: null,
  clarificationAnswers: {},
  clarificationCompleted: false,
  imageContext: {},
};

// Get phase index
function getPhaseIndex(phase: BuildPhase): number {
  return BUILD_PHASES.findIndex(p => p.id === phase);
}

// Get next phase
function getNextPhase(currentPhase: BuildPhase): BuildPhase | null {
  const currentIndex = getPhaseIndex(currentPhase);
  if (currentIndex < BUILD_PHASES.length - 1) {
    return BUILD_PHASES[currentIndex + 1].id;
  }
  return null;
}

// Get previous phase
function getPreviousPhase(currentPhase: BuildPhase): BuildPhase | null {
  const currentIndex = getPhaseIndex(currentPhase);
  if (currentIndex > 0) {
    return BUILD_PHASES[currentIndex - 1].id;
  }
  return null;
}

// Create store
export const useBuildGuidance = create<BuildGuidanceState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // === Session Actions ===
      startSession: () => {
        set({
          sessionId: crypto.randomUUID(),
          startedAt: new Date().toISOString(),
          currentPhase: 'business-details',
        });
      },

      resetSession: () => {
        set(initialState);
      },

      // === Phase Navigation ===
      setPhase: (phase) => {
        const { currentPhase, phaseHistory } = get();
        set({
          currentPhase: phase,
          phaseHistory: [...phaseHistory, currentPhase],
        });
      },

      nextPhase: () => {
        const { currentPhase, completedPhases } = get();
        const nextPhase = getNextPhase(currentPhase);
        if (nextPhase) {
          set({
            currentPhase: nextPhase,
            phaseHistory: [...get().phaseHistory, currentPhase],
            completedPhases: completedPhases.includes(currentPhase)
              ? completedPhases
              : [...completedPhases, currentPhase],
          });
        }
      },

      previousPhase: () => {
        const { phaseHistory } = get();
        if (phaseHistory.length > 0) {
          const newHistory = [...phaseHistory];
          const previousPhase = newHistory.pop()!;
          set({
            currentPhase: previousPhase,
            phaseHistory: newHistory,
          });
        }
      },

      canGoNext: () => {
        const { currentPhase, businessVariables, selectedPreset, detectionConfidence } = get();

        switch (currentPhase) {
          case 'welcome':
            return true;
          case 'business-details':
            // Allow proceeding if either:
            // 1. Traditional: name, type, and description are all filled
            // 2. Custom: name, description, and user selected "other" (detectionConfidence.matchMethod === 'user_selected_other')
            const hasBasicInfo = !!(businessVariables.businessName && businessVariables.description);
            const hasBusinessType = !!businessVariables.businessType;
            const selectedOther = detectionConfidence?.matchMethod === 'user_selected_other';
            return hasBasicInfo && (hasBusinessType || selectedOther);
          case 'design-style':
            return !!selectedPreset;
          case 'color-customization':
            return true; // Optional
          case 'content-tone':
            return true;
          case 'images':
            return true; // Optional
          case 'review':
            return true;
          case 'generating':
            return false;
          case 'complete':
            return false;
          default:
            return false;
        }
      },

      canGoPrevious: () => {
        const { currentPhase } = get();
        return currentPhase !== 'welcome' && currentPhase !== 'generating';
      },

      markPhaseComplete: (phase) => {
        const { completedPhases } = get();
        if (!completedPhases.includes(phase)) {
          set({ completedPhases: [...completedPhases, phase] });
        }
      },

      // === Business Variables ===
      updateBusinessVariables: (updates) => {
        const { businessVariables } = get();
        const newVariables = { ...businessVariables, ...updates };

        // Auto-select preset based on business type
        if (updates.businessType && !get().selectedPreset) {
          const preset = getPresetForBusinessType(updates.businessType);
          set({
            businessVariables: newVariables,
            selectedPreset: preset.id as DesignPresetId,
            designTokens: preset,
          });
        } else {
          set({ businessVariables: newVariables });
        }
      },

      setBusinessVariables: (variables) => {
        set({ businessVariables: variables });
      },

      // === Design ===
      selectPreset: (presetId) => {
        const preset = DESIGN_PRESETS[presetId];
        set({
          selectedPreset: presetId,
          designTokens: preset,
          customizedColors: false,
        });
      },

      updateDesignTokens: (updates) => {
        const { designTokens } = get();
        const newTokens: Partial<DesignTokens> = {
          ...designTokens,
          ...updates,
        };
        // Only merge colors if both exist
        if (updates.colors && designTokens.colors) {
          newTokens.colors = {
            ...designTokens.colors,
            ...updates.colors,
          } as DesignTokens['colors'];
        } else if (updates.colors) {
          newTokens.colors = updates.colors as DesignTokens['colors'];
        }
        set({
          designTokens: newTokens,
          customizedColors: true,
        });
      },

      resetToPreset: () => {
        const { selectedPreset } = get();
        if (selectedPreset) {
          const preset = DESIGN_PRESETS[selectedPreset];
          set({
            designTokens: preset,
            customizedColors: false,
          });
        }
      },

      // === Content ===
      setContentTone: (tone) => {
        set({ contentTone: tone });
      },

      updateGeneratedContent: (updates) => {
        const { generatedContent } = get();
        set({
          generatedContent: { ...generatedContent, ...updates },
        });
      },

      // === Images ===
      setImageOptions: (section, options) => {
        const { imageSelections } = get();
        set({
          imageSelections: {
            ...imageSelections,
            [section]: options,
          },
        });
      },

      selectImage: (section, imageId) => {
        const { imageSelections } = get();
        const sectionImages = imageSelections[section].map(img => ({
          ...img,
          selected: img.id === imageId,
        }));

        const selectedKey = `selected${section.charAt(0).toUpperCase() + section.slice(1)}` as
          'selectedHero' | 'selectedAbout' | 'selectedGallery';

        set({
          imageSelections: {
            ...imageSelections,
            [section]: sectionImages,
            [selectedKey]: imageId,
          },
        });
      },

      // === AI Suggestions ===
      setDesignSuggestions: (suggestions) => {
        set({ designSuggestions: suggestions });
      },

      setContentSuggestions: (suggestions) => {
        set({ contentSuggestions: suggestions });
      },

      setLoadingSuggestions: (loading) => {
        set({ isLoadingSuggestions: loading });
      },

      // === Generation ===
      startGeneration: () => {
        set({
          isGenerating: true,
          generationError: null,
          currentPhase: 'generating',
          generationProgress: {
            step: 'initializing',
            progress: 0,
            message: 'Initializing website generation...',
          },
        });
      },

      updateGenerationProgress: (progress) => {
        set({ generationProgress: progress });
      },

      completeGeneration: (websiteId) => {
        set({
          isGenerating: false,
          generatedWebsiteId: websiteId,
          currentPhase: 'complete',
          generationProgress: {
            step: 'complete',
            progress: 100,
            message: 'Website generated successfully!',
          },
        });
      },

      failGeneration: (error) => {
        set({
          isGenerating: false,
          generationError: error,
          generationProgress: {
            step: 'error',
            progress: 0,
            message: error,
          },
        });
      },

      // === Clarification ===
      setDetectionConfidence: (confidence) => {
        set({ detectionConfidence: confidence });
      },

      updateClarificationAnswers: (answers) => {
        const { clarificationAnswers } = get();
        set({
          clarificationAnswers: { ...clarificationAnswers, ...answers },
        });
      },

      completeClarification: () => {
        set({ clarificationCompleted: true });
      },

      checkNeedsClarification: () => {
        const { detectionConfidence, clarificationCompleted } = get();
        // Need clarification if confidence is below 0.5 and hasn't been completed yet
        if (clarificationCompleted) return false;
        if (!detectionConfidence) return true; // No detection yet, needs clarification
        return detectionConfidence.confidence < 0.5;
      },

      triggerClarificationOrGenerate: () => {
        const { checkNeedsClarification, setPhase, startGeneration, completedPhases } = get();

        if (checkNeedsClarification()) {
          // Go to clarification phase
          set({
            currentPhase: 'clarification',
            phaseHistory: [...get().phaseHistory, 'review'],
            completedPhases: completedPhases.includes('review')
              ? completedPhases
              : [...completedPhases, 'review'],
          });
        } else {
          // Proceed with generation
          startGeneration();
        }
      },

      // === Image Context ===
      updateImageContext: (context) => {
        const { imageContext } = get();
        set({
          imageContext: { ...imageContext, ...context },
        });
      },

      needsImageContextClarification: () => {
        const { detectionConfidence, imageContext, businessVariables } = get();

        // Already clarified
        if (imageContext.clarified) return false;

        // Known business type with high confidence - no need for clarification
        if (detectionConfidence && detectionConfidence.confidence >= 0.6) return false;

        // User selected "other" or low confidence - needs clarification
        if (detectionConfidence?.matchMethod === 'user_selected_other') return true;
        if (detectionConfidence && detectionConfidence.confidence < 0.5) return true;

        // No business type set - needs clarification
        if (!businessVariables.businessType) return true;

        return false;
      },

      // === Quick Start ===
      quickStart: (prompt: string) => {
        // Extract potential business name from prompt (first few words or capitalized phrase)
        const words = prompt.trim().split(/\s+/);
        const businessName = words.slice(0, 3).join(' ');

        // Set minimal defaults for quick generation
        const defaultPreset = 'modern-tech' as DesignPresetId;
        const preset = DESIGN_PRESETS[defaultPreset];

        set({
          sessionId: crypto.randomUUID(),
          startedAt: new Date().toISOString(),
          businessVariables: {
            businessName: businessName,
            businessType: 'technology',
            description: prompt,
          },
          selectedPreset: defaultPreset,
          designTokens: preset,
          contentTone: 'professional',
          isGenerating: true,
          generationError: null,
          currentPhase: 'generating',
          completedPhases: ['welcome', 'business-details', 'design-style', 'color-customization', 'content-tone', 'images', 'review'],
          generationProgress: {
            step: 'initializing',
            progress: 0,
            message: 'Initializing website generation...',
          },
        });
      },

      // === Preview ===
      setPreviewHtml: (html) => {
        set({ previewHtml: html });
      },
    }),
    { name: 'build-guidance-store' }
  )
);

// Selector hooks for performance
export const useBuildPhase = () => useBuildGuidance(state => state.currentPhase);
export const useBusinessVariables = () => useBuildGuidance(state => state.businessVariables);
export const useDesignTokens = () => useBuildGuidance(state => state.designTokens);
export const useSelectedPreset = () => useBuildGuidance(state => state.selectedPreset);
export const useGenerationProgress = () => useBuildGuidance(state => state.generationProgress);
export const useIsGenerating = () => useBuildGuidance(state => state.isGenerating);
