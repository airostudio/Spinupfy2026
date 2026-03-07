# Editor Enhancements - Elementor-Inspired UX

This document describes the enhanced editor features inspired by Elementor and WP Bakery Page Builder.

## New Components

### 1. ElementBreadcrumb
**Location:** `components/editor/ElementBreadcrumb.tsx`

Provides hierarchical navigation showing the current selection path:
- Page > Section > Element
- Click breadcrumbs to navigate up the hierarchy
- Visual active state for current selection
- Icons for each level (File, Layers, Image, Text, etc.)

**Usage:**
```tsx
import { ElementBreadcrumb } from '@/components/editor';

<ElementBreadcrumb />
```

---

### 2. ImageWorkbench
**Location:** `components/editor/ImageWorkbench.tsx`

Dedicated image editing panel that appears when an image is selected:

**Features:**
- **Upload Section**: Drag-and-drop or click to upload (JPG, PNG, WebP, GIF up to 10MB)
- **AI Generation**: Generate images with custom prompts using DALL-E 3
- **URL Linking**: Paste image URLs directly
- **Image Display Controls**:
  - Position: Top, Center, Bottom
  - Fit: Cover, Contain, Fill
  - Alt text for accessibility
- **Preview**: Live preview with hover overlay controls
- **Remove**: One-click image removal

**Usage:**
```tsx
import { ImageWorkbench } from '@/components/editor';

<ImageWorkbench
  imageUrl={section?.content?.backgroundImage}
  altText={section?.content?.imageAlt}
  onImageChange={(url, altText) => handleImageUpdate(url, altText)}
  onRemove={() => handleImageRemove()}
  businessName={website?.name}
  businessType={website?.description}
  sectionType="HERO"
  contextDescription="Hero section background"
/>
```

---

### 3. ClickableElement
**Location:** `components/editor/ClickableElement.tsx`

Wraps individual elements (images, text, buttons, headings) to make them selectable:

**Features:**
- Element-level selection (not just sections)
- Hover state with visual feedback
- Selection ring with primary color
- Element type label badge
- Click-to-edit hint on hover

**Types Supported:**
- `image` - Image elements
- `text` - Text blocks
- `button` - Button elements
- `heading` - Heading elements
- `icon` - Icon elements

**Usage:**
```tsx
import { ClickableElement } from '@/components/editor';

<ClickableElement
  type="image"
  onSelect={() => setSelectedElement('hero-image')}
  isSelected={selectedElement === 'hero-image'}
  label="Hero Background"
>
  <img src={imageUrl} alt="Hero" />
</ClickableElement>
```

---

### 4. ElementToolbar
**Location:** `components/editor/ElementToolbar.tsx`

Contextual floating toolbar that appears when elements are selected:

**Features:**
- Element type indicator with icon
- Move up/down controls
- Style settings button
- Advanced settings button
- Duplicate element
- Toggle visibility
- Delete element

**Actions:**
- Move Up: Reorder element upward
- Move Down: Reorder element downward
- Style: Open style customization panel
- Settings: Open advanced settings
- Duplicate: Create a copy
- Visibility: Hide/show element
- Delete: Remove element

**Usage:**
```tsx
import { ElementToolbar } from '@/components/editor';

<ElementToolbar
  elementType="image"
  canMoveUp={index > 0}
  canMoveDown={index < elements.length - 1}
  isVisible={element.visible}
  onDuplicate={() => handleDuplicate(element.id)}
  onDelete={() => handleDelete(element.id)}
  onMoveUp={() => handleMoveUp(element.id)}
  onMoveDown={() => handleMoveDown(element.id)}
  onToggleVisibility={() => handleToggleVisibility(element.id)}
  onOpenSettings={() => setSettingsPanel('advanced')}
  onOpenStyle={() => setSettingsPanel('style')}
/>
```

---

### 5. RightSidebarPanel
**Location:** `components/editor/RightSidebarPanel.tsx`

Enhanced right sidebar with tabbed interface for different editing contexts:

**Tabs:**
1. **Content** - Section properties editor
2. **Style** - Visual styling controls (spacing, background, border)
3. **AI** - AI assistant panel

**Dynamic Content:**
- Switches between SectionPropertiesEditor, ImageWorkbench, style controls, and AI panels
- Context-aware based on selection
- Smooth transitions between modes

**Usage:**
```tsx
import { RightSidebarPanel } from '@/components/editor';

<RightSidebarPanel
  section={selectedSection}
  onUpdate={(updates) => updateSection(selectedSectionId, updates)}
  defaultMode="section"
/>
```

---

## Key Features

### 1. Drill-Down Navigation
- Breadcrumb showing current position in hierarchy
- Click to navigate up levels
- Visual indicators for active selection
- Supports: Page > Section > Element

### 2. Element-Level Selection
- Not just sections, but individual elements within sections
- Click on images, text, buttons to select them
- Visual feedback with hover and selection states
- Dedicated editing panel for each element type

### 3. Enhanced Image Editing
- Dedicated ImageWorkbench when image selected
- Three ways to add images:
  1. Upload from computer
  2. Generate with AI
  3. Link from URL
- Advanced display controls (position, fit, alt text)
- Live preview with controls

### 4. Comprehensive Toolbar
- Contextual toolbar for each element
- Quick actions (move, duplicate, delete, visibility)
- Style and advanced settings access
- Element type indicator

### 5. Professional UX
- Smooth animations and transitions
- Visual hierarchy with colors and spacing
- Hover states for all interactive elements
- Keyboard shortcuts support
- Mobile-responsive design

---

## Elementor-Inspired Patterns

### Visual Selection
- **Blue ring** on hover
- **Primary color ring** when selected
- **Gradient overlay** for depth
- **Badge labels** showing element type

### Floating Toolbars
- **Positioned above** selected element
- **Background blur** for contrast
- **Icon-first** design
- **Tooltips** on hover

### Contextual Panels
- **Right sidebar** for properties
- **Tabbed interface** (Content, Style, AI)
- **Collapsible sections**
- **Visual controls** over text inputs where possible

### Drill-Down Navigation
- **Breadcrumb trail** at top
- **Click to navigate** up hierarchy
- **Active state** highlighting
- **Icons** for visual clarity

---

## Integration Example

Here's how to integrate all new components into the editor:

```tsx
import {
  ElementBreadcrumb,
  ImageWorkbench,
  ClickableElement,
  ElementToolbar,
  RightSidebarPanel,
} from '@/components/editor';

export default function EnhancedEditor() {
  return (
    <div className="editor-layout">
      {/* Top breadcrumb */}
      <ElementBreadcrumb />

      {/* Main canvas */}
      <div className="canvas">
        {sections.map((section) => (
          <div key={section.id} className="relative">
            {/* Section-level selection */}
            <DraggableSectionWrapper {...sectionProps}>
              {/* Element-level selection for images */}
              <ClickableElement
                type="image"
                onSelect={() => selectElement('image', section.id)}
                isSelected={selectedElement?.id === section.id}
              >
                <img src={section.content.backgroundImage} />
              </ClickableElement>

              {/* Element toolbar when selected */}
              {selectedElement?.id === section.id && (
                <ElementToolbar
                  elementType="image"
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  {...toolbarProps}
                />
              )}
            </DraggableSectionWrapper>
          </div>
        ))}
      </div>

      {/* Right sidebar */}
      <RightSidebarPanel
        section={selectedSection}
        onUpdate={updateSection}
      />
    </div>
  );
}
```

---

## Mobile Optimization

All new components are mobile-responsive:

- **ElementBreadcrumb**: Collapses to icons only on small screens
- **ImageWorkbench**: Stacks vertically on mobile
- **ClickableElement**: Touch-optimized selection
- **ElementToolbar**: Compact layout with essential actions
- **RightSidebarPanel**: Full-screen modal on mobile

---

## Future Enhancements

1. **Text Editor**: Inline rich text editing with formatting toolbar
2. **Style Panel**: Complete visual styling without code
3. **Layout Builder**: Drag-and-drop column/row layouts
4. **Global Styles**: Reusable style presets
5. **Revision History**: Undo/redo with visual diff
6. **Keyboard Shortcuts**: Power user productivity
7. **Component Library**: Reusable design system components
8. **Responsive Preview**: Device-specific breakpoint editing

---

## Developer Notes

### State Management
Element selection state should be added to the editor store:

```typescript
// lib/store/editor.store.ts
interface EditorState {
  // ...existing state
  selectedElementId: string | null;
  selectedElementType: 'image' | 'text' | 'button' | 'heading' | null;

  // New actions
  selectElement: (elementId: string, elementType: string) => void;
  clearElementSelection: () => void;
}
```

### Performance
- Use `React.memo` for ClickableElement to prevent unnecessary re-renders
- Debounce image upload/generation to prevent spam
- Lazy load ImageWorkbench component
- Virtual scrolling for long section lists

### Accessibility
- All interactive elements have ARIA labels
- Keyboard navigation support
- Focus management for modals
- Screen reader announcements for state changes

---

## Summary

These enhancements bring professional page builder UX to the editor:

✅ **Element-level selection** - Click any element to edit
✅ **Dedicated image panel** - Upload, generate, or link images
✅ **Drill-down navigation** - Breadcrumb showing current context
✅ **Contextual toolbars** - Quick actions for selected elements
✅ **Tabbed panels** - Content, Style, and AI editing modes
✅ **Mobile-optimized** - Works great on all devices
✅ **Professional UX** - Smooth animations and visual feedback

The editor now provides a complete, user-friendly suite of tools for website manipulation, rivaling commercial page builders like Elementor and WP Bakery.
