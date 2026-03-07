'use client'

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Copy, Trash2 } from 'lucide-react'
import { Section } from '@/lib/store/editor.store'

interface SortableSectionItemProps {
  section: Section
  isSelected: boolean
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function SortableSectionItem({ section, isSelected, onSelect, onDuplicate, onDelete }: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
        isSelected
          ? 'bg-primary-500/10 border-primary-500'
          : 'bg-gray-900 border-gray-800 hover:border-gray-700'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-400"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <button onClick={onSelect} className="flex-1 text-left">
        <div className="font-medium text-sm">{section.type}</div>
        <div className="text-xs text-gray-500">Order: {section.order + 1}</div>
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate()
          }}
          className="p-1.5 hover:bg-gray-800 rounded transition-colors"
          title="Duplicate"
        >
          <Copy className="w-3.5 h-3.5 text-gray-500" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </button>
      </div>
    </div>
  )
}

interface SortableSectionListProps {
  sections: Section[]
  selectedSectionId: string | null
  onSelectSection: (id: string) => void
  onReorderSections: (sectionIds: string[]) => void
  onDuplicateSection: (id: string) => void
  onDeleteSection: (id: string) => void
}

export function SortableSectionList({
  sections,
  selectedSectionId,
  onSelectSection,
  onReorderSections,
  onDuplicateSection,
  onDeleteSection,
}: SortableSectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    // Guard against null over (dropped outside valid area) and same position
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)

    // Guard against invalid indices
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(sections, oldIndex, newIndex)
    onReorderSections(newOrder.map((s) => s.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sections.map((section) => (
            <SortableSectionItem
              key={section.id}
              section={section}
              isSelected={selectedSectionId === section.id}
              onSelect={() => onSelectSection(section.id)}
              onDuplicate={() => onDuplicateSection(section.id)}
              onDelete={() => onDeleteSection(section.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
