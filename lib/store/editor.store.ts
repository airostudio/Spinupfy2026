/**
 * Editor State Management with Zustand
 *
 * This store manages the state of the website editor including:
 * - Current website data
 * - Selected page and section
 * - Undo/redo functionality
 * - Save status
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Section {
  id: string;
  type: string;
  content: any;
  settings?: any;
  order: number;
  visible?: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  path: string;
  isHomepage?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  order: number;
  sections: Section[];
}

export interface Website {
  id: string;
  name: string;
  description?: string;
  slug: string;
  brandName?: string;
  logoUrl?: string;
  published: boolean;
  theme?: any;
  pages: Page[];
}

interface AIState {
  isGenerating: boolean;
  suggestions: string[];
  seoData: any;
  showAIPanel: boolean;
}

interface EditorState {
  // Current website data
  website: Website | null;

  // Selection state
  selectedPageId: string | null;
  selectedSectionId: string | null;

  // Save state
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;

  // History for undo/redo
  history: Website[];
  historyIndex: number;

  // UI state
  sidebarOpen: boolean;
  previewMode: boolean;

  // AI state
  aiState: AIState;

  // Actions
  setWebsite: (website: Website) => void;
  updateWebsite: (updates: Partial<Website>) => void;

  // Page actions
  selectPage: (pageId: string) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;

  // Section actions
  selectSection: (sectionId: string) => void;
  addSection: (pageId: string, section: Omit<Section, 'id' | 'order'>) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (sectionId: string) => void;
  reorderSections: (pageId: string, sectionIds: string[]) => void;
  duplicateSection: (sectionId: string) => void;

  // Save actions
  markAsSaved: () => void;

  // UI actions
  togglePreviewMode: () => void;

  // AI actions
  setAIGenerating: (isGenerating: boolean) => void;
  setSEOData: (seoData: any) => void;
  toggleAIPanel: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useEditorStore = create<EditorState>()(
  devtools((set, get) => ({
    // Initial state
    website: null,
    selectedPageId: null,
    selectedSectionId: null,
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    history: [],
    historyIndex: -1,
    sidebarOpen: true,
    previewMode: false,
    aiState: {
      isGenerating: false,
      suggestions: [],
      seoData: null,
      showAIPanel: false,
    },

    // Website actions
    setWebsite: (website) => {
      set({
        website,
        selectedPageId: website.pages[0]?.id || null,
        history: [website],
        historyIndex: 0,
        hasUnsavedChanges: false,
      });
    },

    updateWebsite: (updates) => {
      const state = get();
      if (state.website) {
        set({
          website: { ...state.website, ...updates },
          hasUnsavedChanges: true,
        });
      }
    },

    // Page actions
    selectPage: (pageId) => {
      set({
        selectedPageId: pageId,
        selectedSectionId: null, // Clear section selection when switching pages
      });
    },

    updatePage: (pageId, updates) => {
      const state = get();
      if (state.website) {
        set({
          website: {
            ...state.website,
            pages: state.website.pages.map((p) =>
              p.id === pageId ? { ...p, ...updates } : p
            ),
          },
          hasUnsavedChanges: true,
        });
      }
    },

    // Section actions
    selectSection: (sectionId) => {
      set({
        selectedSectionId: sectionId,
      });
    },

    addSection: (pageId, section) => {
      const state = get();
      if (state.website) {
        set({
          website: {
            ...state.website,
            pages: state.website.pages.map((page) => {
              if (page.id === pageId) {
                const newSection: Section = {
                  ...section,
                  id: generateId(),
                  order: page.sections.length,
                  visible: section.visible !== false,
                };
                return {
                  ...page,
                  sections: [...page.sections, newSection],
                };
              }
              return page;
            }),
          },
          hasUnsavedChanges: true,
        });
      }
    },

    updateSection: (sectionId, updates) => {
      const state = get();
      if (state.website) {
        set({
          website: {
            ...state.website,
            pages: state.website.pages.map((page) => ({
              ...page,
              sections: page.sections.map((section) => {
                if (section.id !== sectionId) return section;
                // Deep merge content to prevent data loss
                const mergedContent = updates.content
                  ? { ...section.content, ...updates.content }
                  : section.content;
                // Deep merge settings if provided
                const mergedSettings = updates.settings
                  ? { ...section.settings, ...updates.settings }
                  : section.settings;
                return {
                  ...section,
                  ...updates,
                  content: mergedContent,
                  settings: mergedSettings,
                };
              }),
            })),
          },
          hasUnsavedChanges: true,
        });
      }
    },

    deleteSection: (sectionId) => {
      const state = get();
      if (state.website) {
        set({
          website: {
            ...state.website,
            pages: state.website.pages.map((page) => ({
              ...page,
              sections: page.sections.filter((s) => s.id !== sectionId),
            })),
          },
          selectedSectionId:
            state.selectedSectionId === sectionId
              ? null
              : state.selectedSectionId,
          hasUnsavedChanges: true,
        });
      }
    },

    reorderSections: (pageId, sectionIds) => {
      const state = get();
      if (state.website) {
        set({
          website: {
            ...state.website,
            pages: state.website.pages.map((page) => {
              if (page.id === pageId) {
                const sectionMap = new Map(
                  page.sections.map((s) => [s.id, s])
                );
                const reorderedSections = sectionIds
                  .map((id) => sectionMap.get(id))
                  .filter(Boolean)
                  .map((section, index) => ({ ...section!, order: index }));
                return {
                  ...page,
                  sections: reorderedSections,
                };
              }
              return page;
            }),
          },
          hasUnsavedChanges: true,
        });
      }
    },

    duplicateSection: (sectionId) => {
      const state = get();
      if (state.website) {
        let newSectionId: string | null = null;

        const newPages = state.website.pages.map((page) => {
          const sectionIndex = page.sections.findIndex(
            (s) => s.id === sectionId
          );
          if (sectionIndex !== -1) {
            const section = page.sections[sectionIndex];
            const duplicatedSection: Section = {
              ...section,
              id: generateId(),
              order: section.order + 1,
            };
            newSectionId = duplicatedSection.id;
            const newSections = [...page.sections];
            newSections.splice(sectionIndex + 1, 0, duplicatedSection);
            // Reorder
            return {
              ...page,
              sections: newSections.map((s, index) => ({ ...s, order: index })),
            };
          }
          return page;
        });

        set({
          website: {
            ...state.website,
            pages: newPages,
          },
          selectedSectionId: newSectionId || state.selectedSectionId,
          hasUnsavedChanges: true,
        });
      }
    },

    // Save actions
    markAsSaved: () => {
      set({
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
      });
    },

    // UI actions

    togglePreviewMode: () => {
      set((state) => ({
        previewMode: !state.previewMode,
      }));
    },

    // AI actions
    setAIGenerating: (isGenerating) => {
      set((state) => ({
        aiState: { ...state.aiState, isGenerating },
      }));
    },

    setSEOData: (seoData) => {
      set((state) => ({
        aiState: { ...state.aiState, seoData },
      }));
    },

    toggleAIPanel: () => {
      set((state) => ({
        aiState: { ...state.aiState, showAIPanel: !state.aiState.showAIPanel },
      }));
    },
  }), { name: 'EditorStore' })
);
