# Luxury Progress Components

Modern, professional loading and progress components that match the luxury design system.

## Components

### 1. LuxuryProgressScreen

A full-screen progress indicator with step tracking, perfect for long-running operations like AI generation.

**Features:**
- Theme-aware colors using CSS variables
- Smooth progress animations
- Step-by-step tracking with icons
- Completion state with celebration animation
- Estimated time display
- Multiple variants (default, gradient, minimal)
- Floating particle effects
- Responsive design

**Usage:**
```tsx
import { LuxuryProgressScreen } from '@/components/ui/LuxuryProgressScreen'
import { Wand2, Sparkles, Image } from 'lucide-react'

const steps = [
  {
    id: 'analyze',
    label: 'Analyzing Content',
    description: 'Reading your website',
    icon: Sparkles
  },
  {
    id: 'generate',
    label: 'Generating Content',
    description: 'Creating AI content',
    icon: Wand2
  }
]

<LuxuryProgressScreen
  title="Building Your Website"
  subtitle="Please wait while we create something amazing"
  steps={steps}
  currentStep={0}
  progress={45}
  isComplete={false}
  estimatedTime="2-3 minutes"
  showPercentage={true}
  variant="gradient"
/>
```

**Props:**
- `title` (string, required): Main heading
- `subtitle` (string, optional): Supporting text
- `steps` (array, required): Array of step objects with id, label, description, and optional icon
- `currentStep` (number, required): Index of current step (0-based)
- `progress` (number, required): Progress percentage (0-100)
- `isComplete` (boolean, optional): Whether process is complete
- `estimatedTime` (string, optional): Display estimated time
- `showPercentage` (boolean, optional): Show percentage display (default: true)
- `variant` ('default' | 'gradient' | 'minimal', optional): Visual variant

### 2. LuxuryLoader

Versatile loading spinner with multiple variants and sizes.

**Features:**
- 4 variants: spinner, pulse, dots, bars
- 4 sizes: sm, md, lg, xl
- Theme-aware colors
- Optional loading text
- Glow effects
- Full-screen option

**Usage:**
```tsx
import { LuxuryLoader } from '@/components/ui/LuxuryLoader'

// Simple spinner
<LuxuryLoader size="md" variant="spinner" />

// With text
<LuxuryLoader
  size="lg"
  text="Loading..."
  variant="pulse"
/>

// Full screen
<LuxuryLoader
  size="xl"
  text="Processing..."
  variant="dots"
  fullScreen={true}
/>
```

**Props:**
- `size` ('sm' | 'md' | 'lg' | 'xl', optional): Loader size (default: 'md')
- `text` (string, optional): Loading text to display
- `fullScreen` (boolean, optional): Show as full-screen overlay
- `variant` ('spinner' | 'pulse' | 'dots' | 'bars', optional): Animation style (default: 'spinner')

### 3. LoadingOverlay

Full-screen loading overlay with blur effect.

**Features:**
- Backdrop blur
- Smooth fade in/out
- Theme-aware styling
- All LuxuryLoader variants available

**Usage:**
```tsx
import { LoadingOverlay } from '@/components/ui/LuxuryLoader'

const [isLoading, setIsLoading] = useState(false)

<LoadingOverlay
  isLoading={isLoading}
  text="Processing your request..."
  variant="pulse"
/>
```

**Props:**
- `isLoading` (boolean, required): Whether to show the overlay
- `text` (string, optional): Loading message
- `variant` ('spinner' | 'pulse' | 'dots' | 'bars', optional): Animation style

## Design System Integration

All components use CSS variables from the luxury design system:
- `--color-primary`: Main brand color
- `--color-accent`: Accent highlights
- `--color-secondary`: Supporting color
- `--color-text-heading`: Heading text
- `--color-text-body`: Body text
- `--color-text-muted`: Muted text
- `--color-bg-primary`: Primary background
- `--color-bg-secondary`: Secondary background
- `--color-bg-card`: Card background
- `--color-border`: Border color
- `--font-heading`: Heading font family
- `--font-body`: Body font family

## Animation Details

### LuxuryProgressScreen
- **Progress bar**: Smooth width transition (0.8s ease-out)
- **Shimmer effect**: Continuous horizontal sweep (1.5s linear)
- **Step icons**: Rotate on active state (2s linear, infinite)
- **Particles**: Floating animation (3s ease-in-out)
- **Completion**: Spring animation on check icon

### LuxuryLoader
- **Spinner**: 360° rotation (1s linear, infinite)
- **Pulse**: Scale and opacity pulse (1.5s infinite)
- **Dots**: Staggered vertical bounce (0.6s infinite)
- **Bars**: Vertical scale animation (0.8s infinite)
- **Glow**: Opacity and scale pulse (2s infinite)

## Accessibility

- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard accessible
- Screen reader friendly
- Color contrast compliant
- Motion respects `prefers-reduced-motion`

## Demo

Visit `/demo/progress` to see all variants and usage examples.

## Examples

### AI Website Generation
```tsx
<LuxuryProgressScreen
  title="Creating Your AI Website"
  subtitle="Crafting professional content with luxury styling"
  steps={generationSteps}
  currentStep={currentStep}
  progress={progress}
  estimatedTime="2-3 minutes"
  variant="gradient"
/>
```

### Simple Loading
```tsx
<LuxuryLoader size="lg" text="Loading..." variant="spinner" />
```

### Form Submission
```tsx
const [submitting, setSubmitting] = useState(false)

<LoadingOverlay
  isLoading={submitting}
  text="Saving changes..."
  variant="dots"
/>
```

### API Request
```tsx
{isLoading && <LuxuryLoader size="md" variant="pulse" />}
```
