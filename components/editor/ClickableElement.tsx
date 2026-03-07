'use client';

import { ReactNode, useState } from 'react';
import { Image, Type, MousePointer2, Edit3 } from 'lucide-react';

interface ClickableElementProps {
  type: 'image' | 'text' | 'button' | 'heading' | 'icon';
  children: ReactNode;
  onSelect: () => void;
  isSelected?: boolean;
  label?: string;
}

/**
 * Wraps editable elements to make them clickable and selectable
 * Inspired by Elementor's element selection system
 */
export function ClickableElement({
  type,
  children,
  onSelect,
  isSelected = false,
  label,
}: ClickableElementProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'image':
        return <Image className="w-3 h-3" />;
      case 'text':
      case 'heading':
        return <Type className="w-3 h-3" />;
      case 'button':
        return <MousePointer2 className="w-3 h-3" />;
      default:
        return <Edit3 className="w-3 h-3" />;
    }
  };

  const getLabel = () => {
    if (label) return label;
    switch (type) {
      case 'image':
        return 'Image';
      case 'text':
        return 'Text';
      case 'button':
        return 'Button';
      case 'heading':
        return 'Heading';
      default:
        return 'Element';
    }
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Selection overlay */}
      {(isSelected || isHovered) && (
        <div
          className={`
            absolute inset-0 pointer-events-none z-10 rounded transition-all
            ${isSelected
              ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-transparent'
              : 'ring-1 ring-blue-400/50'
            }
          `}
        >
          {/* Element label */}
          <div
            className={`
              absolute -top-6 left-0 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1.5 whitespace-nowrap
              ${isSelected
                ? 'bg-primary-500 text-white'
                : 'bg-blue-500/90 text-white'
              }
            `}
          >
            {getIcon()}
            {getLabel()}
          </div>

          {/* Edit hint on hover */}
          {isHovered && !isSelected && (
            <div className="absolute inset-0 bg-blue-500/5 rounded flex items-center justify-center">
              <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <Edit3 className="w-3 h-3" />
                Click to edit
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actual content */}
      <div className={isSelected ? 'relative z-0' : ''}>
        {children}
      </div>
    </div>
  );
}
