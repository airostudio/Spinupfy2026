'use client';

import { useState } from 'react';
import { Settings, Image, Palette, Layers, Search, Code } from 'lucide-react';
import { useEditorStore, Section } from '@/lib/store/editor.store';
import { SectionPropertiesEditor } from './SectionPropertiesEditor';
import { ImageWorkbench } from './ImageWorkbench';
import { AIAssistantPanel } from './AIAssistantPanel';
import { SEOAssistantPanel } from './SEOAssistantPanel';

type PanelMode = 'section' | 'image' | 'style' | 'ai' | 'seo';

interface RightSidebarPanelProps {
  section: Section | null;
  onUpdate: (updates: Partial<Section>) => void;
  defaultMode?: PanelMode;
}

/**
 * Enhanced right sidebar that switches between different editing contexts.
 * Mirrors the mobile bottom-sheet panel system on desktop.
 */
export function RightSidebarPanel({
  section,
  onUpdate,
  defaultMode = 'section',
}: RightSidebarPanelProps) {
  const [mode, setMode] = useState<PanelMode>(defaultMode);
  const { website } = useEditorStore();

  const tabs: { id: PanelMode; label: string; icon: React.ElementType }[] = [
    { id: 'section', label: 'Content', icon: Layers },
    { id: 'image',   label: 'Image',   icon: Image },
    { id: 'style',   label: 'Style',   icon: Palette },
    { id: 'ai',      label: 'AI',      icon: Code },
    { id: 'seo',     label: 'SEO',     icon: Search },
  ];

  const renderPanelContent = () => {
    switch (mode) {
      case 'section':
        return <SectionPropertiesEditor section={section} onUpdate={onUpdate} />;

      case 'image':
        return (
          <ImageWorkbench
            imageUrl={section?.content?.backgroundImage || ''}
            altText={section?.content?.imageAlt || ''}
            onImageChange={(url, altText) => {
              onUpdate({
                content: {
                  ...section?.content,
                  backgroundImage: url,
                  imageAlt: altText,
                },
              });
            }}
            onRemove={() => {
              onUpdate({
                content: {
                  ...section?.content,
                  backgroundImage: undefined,
                  imageAlt: undefined,
                },
              });
            }}
            businessName={website?.name}
            businessType={website?.description}
            sectionType={section?.type}
            contextDescription={section?.content?.title || section?.content?.description}
            websiteId={website?.id}
          />
        );

      case 'style':
        return (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Style Settings</h3>
              <p className="text-xs text-gray-400">
                Advanced style customization coming soon. Currently editing through section properties.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                Spacing
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Padding</label>
                  <input type="range" min="0" max="100" defaultValue="20" className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Margin</label>
                  <input type="range" min="0" max="100" defaultValue="0" className="w-full" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                Background
              </label>
              <div className="flex gap-2">
                <input type="color" defaultValue="#ffffff" className="w-12 h-10 rounded border border-gray-800" />
                <input
                  type="text"
                  defaultValue="#ffffff"
                  className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                Border
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Width</label>
                  <input
                    type="number"
                    min="0" max="10" defaultValue="0"
                    className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Radius</label>
                  <input
                    type="number"
                    min="0" max="50" defaultValue="0"
                    className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <AIAssistantPanel
            businessName={website?.name}
            businessType={website?.description}
          />
        );

      case 'seo':
        return (
          <SEOAssistantPanel
            businessName={website?.name}
            businessType={website?.description}
          />
        );

      default:
        return null;
    }
  };

  if (!section) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Select an element to edit</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-gray-800 flex-shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              title={tab.label}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 px-1 py-2.5 text-[10px] font-medium transition-colors
                ${mode === tab.id
                  ? 'text-primary-400 border-b-2 border-primary-500 bg-gray-900/60'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {renderPanelContent()}
      </div>
    </div>
  );
}
