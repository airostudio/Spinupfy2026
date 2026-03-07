'use client';

import { ChevronRight, Layers, FileText, Image, Type, MousePointer } from 'lucide-react';
import { useEditorStore } from '@/lib/store/editor.store';

interface BreadcrumbItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active: boolean;
}

/**
 * Elementor-style breadcrumb navigation showing current selection hierarchy
 * Example: Page > Hero Section > Background Image
 */
export function ElementBreadcrumb() {
  const { website, selectedPageId, selectedSectionId, selectPage, selectSection } = useEditorStore();

  if (!website || !selectedPageId) {
    return null;
  }

  const currentPage = website.pages.find(p => p.id === selectedPageId);
  const currentSection = currentPage?.sections.find(s => s.id === selectedSectionId);

  const breadcrumbs: BreadcrumbItem[] = [];

  // Page level
  breadcrumbs.push({
    label: currentPage?.title || 'Page',
    icon: <FileText className="w-3.5 h-3.5" />,
    onClick: () => {
      selectSection('');
    },
    active: !selectedSectionId,
  });

  // Section level
  if (currentSection) {
    breadcrumbs.push({
      label: formatSectionType(currentSection.type),
      icon: <Layers className="w-3.5 h-3.5" />,
      onClick: () => {
        // Already at section level
      },
      active: true,
    });
  }

  return (
    <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-2.5">
      <div className="flex items-center gap-1.5 text-xs">
        <MousePointer className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-gray-500">Editing:</span>

        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="w-3 h-3 text-gray-600" />
            )}
            <button
              onClick={item.onClick}
              className={`
                flex items-center gap-1.5 px-2 py-1 rounded transition-colors
                ${item.active
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatSectionType(type: string): string {
  const formatted = type.replace(/_/g, ' ').toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
