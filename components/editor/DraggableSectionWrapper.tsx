'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Copy, Trash2, Eye, EyeOff, Edit3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useState } from 'react'

interface DraggableSectionWrapperProps {
  sectionId: string
  sectionType?: string
  isSelected: boolean
  isVisible: boolean
  isPreviewMode: boolean
  children: ReactNode
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleVisibility: () => void
}

export function DraggableSectionWrapper({
  sectionId,
  sectionType,
  isSelected,
  isVisible,
  isPreviewMode,
  children,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleVisibility,
}: DraggableSectionWrapperProps) {
  const [isHovering, setIsHovering] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sectionId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : isVisible ? 1 : 0.4,
  }

  // Format section type for display
  const formatSectionType = (type?: string) => {
    if (!type) return 'Section'
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
  }

  if (isPreviewMode) {
    return <div>{children}</div>
  }

  return (
    <div
      id={`section-${sectionId}`}
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative group transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-gray-950 shadow-2xl shadow-blue-500/20 rounded-lg'
          : isHovering
          ? 'ring-2 ring-blue-400/50 ring-offset-2 ring-offset-gray-950 rounded-lg'
          : ''
      } ${isDragging ? 'z-50 scale-105' : ''}`}
    >
      {/* Hover Overlay with better visibility */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 transition-all duration-200 pointer-events-none rounded-lg ${
        isSelected
          ? 'opacity-100 border-2 border-blue-500'
          : isHovering
          ? 'opacity-100 border-2 border-blue-400/50'
          : 'opacity-0'
      }`} />

      {/* Section Label - Always visible on hover/select */}
      <AnimatePresence>
        {(isSelected || isHovering) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute top-3 left-3 z-50"
          >
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              <Edit3 className="w-3 h-3" />
              {formatSectionType(sectionType)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Bar - More prominent Elementor-style toolbar */}
      <AnimatePresence>
        {(isSelected || isHovering) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-blue-500/50 rounded-xl px-3 py-2 shadow-2xl backdrop-blur-sm">
              {/* Drag Handle */}
              <button
                {...attributes}
                {...listeners}
                className="p-2 hover:bg-blue-500/20 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:scale-110"
                title="Drag to reorder"
              >
                <GripVertical className="w-5 h-5 text-blue-400" />
              </button>

              <div className="w-px h-6 bg-gray-600" />

              {/* Toggle Visibility */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleVisibility()
                }}
                className="p-2 hover:bg-blue-500/20 rounded-lg transition-all hover:scale-110"
                title={isVisible ? 'Hide section' : 'Show section'}
              >
                {isVisible ? (
                  <Eye className="w-5 h-5 text-gray-300" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Duplicate */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate()
                }}
                className="p-2 hover:bg-blue-500/20 rounded-lg transition-all hover:scale-110"
                title="Duplicate section"
              >
                <Copy className="w-5 h-5 text-gray-300" />
              </button>

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-2 hover:bg-red-500/30 rounded-lg transition-all hover:scale-110"
                title="Delete section"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative">{children}</div>

      {/* Click to Edit Hint - More prominent Elementor-style */}
      {!isSelected && !isDragging && isHovering && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 backdrop-blur-md px-6 py-3 rounded-xl border-2 border-white/30 shadow-2xl">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-white" />
              <p className="text-base text-white font-semibold">Click to edit {formatSectionType(sectionType)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Drag indicator when dragging */}
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-4 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-40"
        >
          <div className="bg-black/90 backdrop-blur-sm px-6 py-3 rounded-xl">
            <p className="text-white font-semibold">Drop to reorder</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
