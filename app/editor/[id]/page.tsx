'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Save,
  Eye,
  Undo,
  Redo,
  Plus,
  Settings,
  ArrowLeft,
  Globe,
  Loader2,
  Sparkles,
  Search,
  Layers,
  FileText,
  Pin,
  PinOff,
  AlertCircle,
  Clock,
  X,
  Package,
  Link2,
  CheckCircle,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { useEditorStore } from '@/lib/store';
import {
  HeroSection,
  FeaturesSection,
  CTASection,
  ContactSection,
  PricingSection,
  HeaderSection,
  FooterSection,
  StoreSection,
  AboutSection,
  TeamSection,
  ServicesSection,
  TestimonialsSection,
  BookingSection,
  TrustBadgesSection,
  MobileStickyCtaSection,
  LoanCalculatorSection,
  FloatingCtaSection,
  MenuSection,
  FormSection,
} from '@/components/sections';
import {
  AIAssistantPanel,
  SEOAssistantPanel,
  SectionPropertiesEditor,
  SortableSectionList,
  SiteSettings,
  PageSelector,
  PageContentEditor,
  ElementBreadcrumb,
  ExtrasPanel,
  RightSidebarPanel,
  AddSectionDialog,
} from '@/components/editor';
import { formTemplates, FormTemplate } from '@/components/forms';
import { DraggableSectionWrapper } from '@/components/editor/DraggableSectionWrapper';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import GeneratePagesButton from '@/components/editor/GeneratePagesButton';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { generateMenuItemsFromSections } from '@/lib/config/menu-content';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;

  const {
    website,
    setWebsite,
    selectedPageId,
    selectedSectionId,
    selectPage,
    selectSection,
    updateSection,
    updatePage,
    deleteSection,
    duplicateSection,
    reorderSections,
    hasUnsavedChanges,
    markAsSaved,
    isSaving,
    togglePreviewMode,
    toggleAIPanel,
    previewMode,
    aiState,
  } = useEditorStore();

  const [loading, setLoading] = useState(true);
  const [leftSidebarTab, setLeftSidebarTab] = useState<'pages' | 'sections'>('pages');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [siteSettingsPinned, setSiteSettingsPinned] = useState(false);
  const [mobileBottomSheet, setMobileBottomSheet] = useState<'pages' | 'sections' | 'properties' | 'ai' | 'seo' | 'page' | null>(null);
  const [showExtrasPanel, setShowExtrasPanel] = useState(false);
  const [isFixingLinks, setIsFixingLinks] = useState(false);
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);

  // Scroll to section when it's selected
  useEffect(() => {
    if (selectedSectionId) {
      const element = document.getElementById(`section-${selectedSectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedSectionId]);

  // Drag and drop sensors for canvas
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadWebsite();
  }, [websiteId]);

  // Load Google Fonts dynamically
  useEffect(() => {
    const fontHeading = website?.theme?.fontHeading || 'Inter'
    const fontBody = website?.theme?.fontBody || 'Inter'

    // Only load if fonts are set and different from default
    const fontsToLoad = new Set([fontHeading, fontBody])

    fontsToLoad.forEach(font => {
      if (font && font !== 'Inter') { // Inter is already loaded
        const fontName = font.replace(/ /g, '+')
        const linkId = `google-font-${fontName}`

        // Check if font is already loaded
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link')
          link.id = linkId
          link.rel = 'stylesheet'
          link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700;800;900&display=swap`
          document.head.appendChild(link)
        }
      }
    })
  }, [website?.theme?.fontHeading, website?.theme?.fontBody])

  async function loadWebsite() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Load website
      const { data: websiteData, error: websiteError } = await supabase
        .from('websites')
        .select('*')
        .eq('id', websiteId)
        .eq('user_id', user.id)
        .single();

      if (websiteError) throw websiteError;

      if (!websiteData) {
        toast.error('Website not found');
        router.push('/dashboard');
        return;
      }

      // Load pages for this website
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .eq('website_id', websiteId)
        .order('order', { ascending: true });

      if (pagesError) throw pagesError;

      // Load sections for all pages
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .in('page_id', (pagesData || []).map(p => p.id))
        .order('order', { ascending: true });

      if (sectionsError) throw sectionsError;

      // Build pages with their sections
      const pages = (pagesData || []).map(page => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        path: page.path,
        order: page.order,
        isHomepage: page.is_homepage,
        sections: (sectionsData || [])
          .filter(s => s.page_id === page.id)
          .map(section => ({
            id: section.id,
            type: section.type,
            order: section.order,
            visible: section.visible,
            content: section.content || {},
            settings: section.settings || {},
          })),
      }));

      // Transform data to match our store structure
      const transformedWebsite = {
        id: websiteData.id,
        name: websiteData.name,
        description: websiteData.description,
        slug: websiteData.slug,
        brandName: websiteData.brand_name,
        logoUrl: websiteData.logo_url,
        published: websiteData.published,
        theme: websiteData.theme,
        pages,
      };

      setWebsite(transformedWebsite);
    } catch (error) {
      console.error('Error loading website:', error);
      toast.error('Failed to load website');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleFixLinks() {
    if (!website) return;

    setIsFixingLinks(true);
    const loadingToast = toast.loading('Fixing broken links...');

    try {
      const response = await fetch('/api/website/fix-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: website.id,
          createPages: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix links');
      }

      toast.success(
        `Fixed ${data.fixes.length} broken links and created ${data.createdPages.length} missing pages!`,
        { id: loadingToast, duration: 5000 }
      );

      // Reload the website to show changes
      await loadWebsite();
    } catch (error) {
      console.error('Error fixing links:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to fix links',
        { id: loadingToast }
      );
    } finally {
      setIsFixingLinks(false);
    }
  }

  async function handleSave() {
    if (!website) return;

    try {
      // Update website metadata
      const { error: websiteError } = await supabase
        .from('websites')
        .update({
          name: website.name,
          description: website.description,
          brand_name: website.brandName,
          logo_url: website.logoUrl,
          theme: website.theme,
          updated_at: new Date().toISOString(),
        })
        .eq('id', websiteId);

      if (websiteError) throw websiteError;

      // Update pages and sections
      for (const page of website.pages) {
        // Update page
        const { error: pageError } = await supabase
          .from('pages')
          .update({
            title: page.title,
            slug: page.slug,
            path: page.path,
            order: page.order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', page.id);

        if (pageError) throw pageError;

        // Update sections
        for (const section of page.sections) {
          const { error: sectionError } = await supabase
            .from('sections')
            .upsert({
              id: section.id,
              page_id: page.id,
              type: section.type,
              order: section.order,
              visible: section.visible,
              content: section.content,
              settings: section.settings,
              updated_at: new Date().toISOString(),
            });

          if (sectionError) throw sectionError;
        }
      }

      markAsSaved();
      toast.success('Website saved successfully');
    } catch (error) {
      console.error('Error saving website:', error);
      toast.error('Failed to save website');
    }
  }

  async function handleAddSection(sectionType: string = 'HERO', formTemplate?: FormTemplate) {
    if (!selectedPage || !selectedPageId) {
      toast.error('Please select a page first');
      return;
    }

    try {
      const newOrder = selectedPage.sections.length;

      // Build section content based on type
      let content: any = {
        title: 'New Section',
        subtitle: 'Edit this section',
      };

      // If it's a form section, include the form template
      if (sectionType === 'FORM' && formTemplate) {
        content = {
          title: formTemplate.name,
          subtitle: formTemplate.description,
          templateId: formTemplate.id,
          formTemplate: formTemplate, // Store the entire template for now
        };
      }

      // Create new section in database
      const { data: newSection, error } = await supabase
        .from('sections')
        .insert({
          page_id: selectedPageId,
          type: sectionType,
          order: newOrder,
          visible: true,
          content,
          settings: {},
        })
        .select()
        .single();

      if (error) throw error;

      // Reload website to get the new section
      await loadWebsite();

      toast.success('Section added successfully');
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error('Failed to add section');
    }
  }

  const selectedPage = website?.pages.find((p) => p.id === selectedPageId);
  const selectedSection = selectedPage?.sections.find((s) => s.id === selectedSectionId);

  // Handle drag end on canvas
  function handleCanvasDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || !selectedPage || !selectedPageId) return;

    if (active.id !== over.id) {
      const oldIndex = selectedPage.sections.findIndex((s) => s.id === active.id);
      const newIndex = selectedPage.sections.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(selectedPage.sections, oldIndex, newIndex);
      reorderSections(selectedPageId, newOrder.map((s) => s.id));
    }
  }

  // Toggle section visibility
  function handleToggleVisibility(sectionId: string) {
    const section = selectedPage?.sections.find((s) => s.id === sectionId);
    if (section) {
      updateSection(sectionId, { ...section, visible: !section.visible });
    }
  }

  const renderSection = (section: any, index: number) => {
    const isSelected = section.id === selectedSectionId;

    // Generate dynamic menu items from available sections
    const availableSectionTypes = selectedPage?.sections
      .filter(s => s.visible)
      .map(s => s.type) || [];
    const dynamicMenuItems = generateMenuItemsFromSections(availableSectionTypes);

    // For HeaderSection and FooterSection, inject website-level logo and brand name
    // For HeaderSection, also inject dynamic menu items if none exist
    const sectionContent = section.type === 'HEADER'
      ? {
          ...section.content,
          logo: website?.logoUrl || section.content.logo,
          brandName: website?.brandName || section.content.brandName,
          menuItems: section.content?.menuItems?.length > 0
            ? section.content.menuItems
            : dynamicMenuItems,
        }
      : section.type === 'FOOTER'
      ? {
          ...section.content,
          logo: website?.logoUrl || section.content.logo,
          brandName: website?.brandName || section.content.brandName,
        }
      : section.content;

    const sectionProps = {
      content: sectionContent,
      editable: !previewMode,
      onEdit: () => selectSection(section.id),
    };

    const sectionElement = (() => {
      switch (section.type) {
        case 'HEADER':
          return <HeaderSection {...sectionProps} />;
        case 'HERO':
          return <HeroSection {...sectionProps} />;
        case 'FEATURES':
          return <FeaturesSection {...sectionProps} />;
        case 'ABOUT':
          return <AboutSection {...sectionProps} />;
        case 'TEAM':
          return <TeamSection {...sectionProps} />;
        case 'SERVICES':
          return <ServicesSection {...sectionProps} />;
        case 'TESTIMONIALS':
          return <TestimonialsSection {...sectionProps} />;
        case 'CTA':
          return <CTASection {...sectionProps} />;
        case 'CONTACT':
          return <ContactSection {...sectionProps} />;
        case 'PRICING':
          return <PricingSection {...sectionProps} />;
        case 'STORE':
        case 'ADVANCED_STORE':
          return <StoreSection {...sectionProps} />;
        case 'BOOKING':
          return <BookingSection {...sectionProps} websiteId={websiteId} />;
        case 'TRUST_BADGES':
          return <TrustBadgesSection {...sectionProps} />;
        case 'MOBILE_STICKY_CTA':
          return <MobileStickyCtaSection {...sectionProps} />;
        case 'LOAN_CALCULATOR':
          return <LoanCalculatorSection
            title={section.content?.title}
            subtitle={section.content?.subtitle}
            defaultLoanAmount={section.content?.defaultLoanAmount}
            defaultInterestRate={section.content?.defaultInterestRate}
            defaultLoanTerm={section.content?.defaultLoanTerm}
            maxLoanAmount={section.content?.maxLoanAmount}
            showBreakdown={section.settings?.showBreakdown}
            ctaText={section.content?.ctaText}
            ctaHref={section.content?.ctaHref}
            theme={section.settings?.theme}
            variant={section.settings?.variant}
          />;
        case 'FLOATING_CTA':
          return <FloatingCtaSection content={section.content} />;
        case 'MENU':
          return <MenuSection content={section.content} settings={section.settings} />;
        case 'GALLERY':
          return <FeaturesSection {...sectionProps} content={{
            title: section.content?.title || 'Gallery',
            subtitle: section.content?.subtitle || '',
            features: (section.content?.images || []).map((img: any, idx: number) => ({
              title: img.alt || `Image ${idx + 1}`,
              description: img.caption || '',
              image: img.url || img,
            })),
          }} />;
        case 'PORTFOLIO':
          return <FeaturesSection {...sectionProps} content={{
            title: section.content?.title || 'Our Work',
            subtitle: section.content?.subtitle || 'Featured Projects',
            features: (section.content?.items || []).map((item: any) => ({
              title: item.title,
              description: item.description,
              image: item.image,
            })),
          }} />;
        case 'HOW_IT_WORKS':
          return <FeaturesSection {...sectionProps} />;
        case 'FAQ':
          return (
            <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)' }}>
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-text-heading, #1f2937)' }}>
                  {section.content?.title || 'Frequently Asked Questions'}
                </h2>
                <div className="space-y-4">
                  {(section.content?.items || []).map((item: any, idx: number) => (
                    <details key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <summary className="p-4 cursor-pointer font-medium" style={{ color: 'var(--color-text-heading, #1f2937)' }}>
                        {item.question}
                      </summary>
                      <p className="px-4 pb-4 text-gray-600">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          );
        case 'FOOTER':
          return <FooterSection {...sectionProps} />;
        case 'FORM':
          // Load form template from stored data
          const storedTemplate = section.content?.formTemplate;
          const templateId = section.content?.templateId;
          const formTemplate = storedTemplate || formTemplates.find(t => t.id === templateId);
          return <FormSection template={formTemplate} content={section.content} settings={section.settings} />;
        default:
          console.warn(`Unknown section type in editor: ${section.type}`);
          return null;
      }
    })();

    return (
      <DraggableSectionWrapper
        key={section.id}
        sectionId={section.id}
        sectionType={section.type}
        isSelected={isSelected}
        isVisible={section.visible}
        isPreviewMode={previewMode}
        onSelect={() => selectSection(section.id)}
        onDuplicate={() => duplicateSection(section.id)}
        onDelete={() => deleteSection(section.id)}
        onToggleVisibility={() => handleToggleVisibility(section.id)}
      >
        {sectionElement}
      </DraggableSectionWrapper>
    );
  };

  // Generate CSS variables for comprehensive theme color system and fonts
  const fontHeading = website?.theme?.fontHeading || 'Inter'
  const fontBody = website?.theme?.fontBody || 'Inter'

  const themeStyles = (website?.theme ? {
    // Brand Colors
    '--color-primary': website.theme.primary || '#2563eb',
    '--color-secondary': website.theme.secondary || '#0ea5e9',
    '--color-accent': website.theme.accent || '#06b6d4',

    // Text Colors - Dark text for light backgrounds (proper contrast)
    '--color-text-heading': website.theme.textHeading || '#111827',
    '--color-text-body': website.theme.textBody || '#374151',
    '--color-text-muted': website.theme.textMuted || '#6b7280',
    '--color-text-link': website.theme.textLink || '#2563eb',

    // Background Colors
    '--color-bg-primary': website.theme.bgPrimary || '#ffffff',
    '--color-bg-secondary': website.theme.bgSecondary || '#f9fafb',
    '--color-bg-dark': website.theme.bgDark || '#111827',
    '--color-bg-card': website.theme.bgCard || '#ffffff',

    // UI Colors
    '--color-border': website.theme.border || '#e5e7eb',
    '--color-success': website.theme.success || '#10b981',
    '--color-warning': website.theme.warning || '#f59e0b',
    '--color-error': website.theme.error || '#ef4444',
    '--color-button-text': website.theme.buttonText || '#ffffff',

    // Fonts
    '--font-heading': `'${fontHeading}', system-ui, -apple-system, sans-serif`,
    '--font-body': `'${fontBody}', system-ui, -apple-system, sans-serif`,
  } : {}) as React.CSSProperties;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-gray-400">Website not found</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Editor Header - Mobile Optimized */}
      <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between px-2 sm:px-4 h-14 sm:h-16">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push('/dashboard')}
              className="hidden sm:flex"
            >
              Back
            </Button>
            {/* Mobile: Icon only */}
            <button
              onClick={() => router.push('/dashboard')}
              className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-700 hidden sm:block" />
            <div className="min-w-0 flex-1 sm:flex-initial">
              <h1 className="text-white font-semibold text-sm sm:text-base truncate">{website?.name}</h1>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <Globe className="w-3 h-3" />
                <span>{website?.slug}</span>
              </div>
            </div>
            {hasUnsavedChanges && (
              <Badge variant="warning" size="sm" className="hidden sm:inline-flex">
                Unsaved Changes
              </Badge>
            )}
            {hasUnsavedChanges && (
              <div className="sm:hidden w-2 h-2 rounded-full bg-yellow-500" title="Unsaved changes" />
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop: Full buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <GeneratePagesButton
                websiteId={websiteId}
                onPagesGenerated={loadWebsite}
              />
              <div className="h-6 w-px bg-gray-700" />
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Package className="w-4 h-4" />}
                onClick={() => setShowExtrasPanel(true)}
              >
                Extras & Add-ons
              </Button>
              <div className="h-6 w-px bg-gray-700" />
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={toggleAIPanel}
              >
                AI Assistant
              </Button>
              <div className="h-6 w-px bg-gray-700" />
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={togglePreviewMode}
              >
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <div className="h-6 w-px bg-gray-700" />
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Link2 className="w-4 h-4" />}
                onClick={handleFixLinks}
                isLoading={isFixingLinks}
                title="Fix broken links and create missing pages"
              >
                Fix Links
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!hasUnsavedChanges}
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/preview/${websiteId}`)}
              >
                Publish
              </Button>
            </div>

            {/* Tablet: Icon buttons with some labels */}
            <div className="hidden md:flex lg:hidden items-center gap-1">
              <button
                onClick={togglePreviewMode}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title={previewMode ? 'Edit Mode' : 'Preview Mode'}
              >
                <Eye className="w-5 h-5" />
              </button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!hasUnsavedChanges}
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/preview/${websiteId}`)}
              >
                Publish
              </Button>
            </div>

            {/* Mobile: Icon buttons only */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={togglePreviewMode}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title={previewMode ? 'Edit Mode' : 'Preview Mode'}
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="p-2 text-primary-400 hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Save"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      {!previewMode && <ElementBreadcrumb />}

      {/* Editor Content */}
      <div className="flex">
        {/* Left Sidebar - Pages and Sections (Hidden on mobile) */}
        {!previewMode && leftSidebarOpen && (
          <aside className="hidden lg:flex w-72 bg-gray-900 border-r border-gray-800 flex-col sticky top-0 h-screen">
            {/* Tabs */}
            <div className="flex border-b border-gray-800 flex-shrink-0">
              <button
                onClick={() => setLeftSidebarTab('pages')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  leftSidebarTab === 'pages'
                    ? 'text-primary-400 border-b-2 border-primary-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 mx-auto mb-1" />
                Pages
              </button>
              <button
                onClick={() => setLeftSidebarTab('sections')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  leftSidebarTab === 'sections'
                    ? 'text-primary-400 border-b-2 border-primary-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Layers className="w-4 h-4 mx-auto mb-1" />
                Sections
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {leftSidebarTab === 'pages' ? (
                <PageSelector
                  pages={website?.pages || []}
                  selectedPageId={selectedPageId}
                  onSelectPage={selectPage}
                />
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Sections
                    </h3>
                    <button
                      className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                      onClick={() => setShowAddSectionDialog(true)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>

                  {selectedPage && selectedPage.sections.length > 0 ? (
                    <SortableSectionList
                      sections={selectedPage.sections.sort((a, b) => a.order - b.order)}
                      selectedSectionId={selectedSectionId}
                      onSelectSection={selectSection}
                      onReorderSections={(sectionIds) => {
                        if (selectedPageId) {
                          reorderSections(selectedPageId, sectionIds);
                        }
                      }}
                      onDuplicateSection={duplicateSection}
                      onDeleteSection={deleteSection}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No sections yet</p>
                      <p className="text-xs mt-1">Click Add to create one</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto" style={themeStyles}>
          {/* Temporary Images Warning (for unpublished sites) */}
          {!website?.published && (
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 sticky top-0 z-10">
              <div className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-200 mb-1">
                      Temporary Images - Publish to Save
                    </h3>
                    <p className="text-sm text-yellow-100/90">
                      Your images are temporary. <strong>Publish your website to save them permanently.</strong> Unpublished drafts older than 7 days are automatically deleted.
                    </p>
                  </div>
                  <Clock className="w-5 h-5 text-yellow-500/60 flex-shrink-0" />
                </div>
              </div>
            </div>
          )}

          {selectedPage ? (
            <div className="min-h-screen">
              {selectedPage.sections.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCanvasDragEnd}
                >
                  <SortableContext
                    items={selectedPage.sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {selectedPage.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section, index) => renderSection(section, index))}
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      No sections yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Add your first section to get started
                    </p>
                    <Button
                      variant="primary"
                      leftIcon={<Plus className="w-5 h-5" />}
                      onClick={() => setShowAddSectionDialog(true)}
                    >
                      Add Section
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-gray-400">No page selected</p>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Enhanced with Tabs (Hidden on mobile) */}
        {!previewMode && (
          <aside className="hidden md:flex w-80 bg-gray-900 border-l border-gray-800 overflow-y-auto flex-col sticky top-0 h-screen">
            {/* Page Content Editor - At the top */}
            <PageContentEditor
              page={selectedPage || null}
              onUpdate={(updates) => {
                if (selectedPageId) {
                  updatePage(selectedPageId, updates);
                }
              }}
            />

            {/* Site Settings - Optionally pinned */}
            <div className={`${siteSettingsPinned ? 'sticky top-0 z-10 shadow-lg' : ''} bg-gray-900 border-b border-gray-800`}>
              <div className="relative">
                <SiteSettings websiteName={website?.name} />
                {/* Pin/Unpin Button */}
                <button
                  onClick={() => setSiteSettingsPinned(!siteSettingsPinned)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
                  title={siteSettingsPinned ? 'Unpin settings' : 'Pin settings to top'}
                >
                  {siteSettingsPinned ? (
                    <PinOff className="w-3.5 h-3.5" />
                  ) : (
                    <Pin className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Section Editor - mirrored from mobile panel system */}
            {selectedSectionId && (
              <RightSidebarPanel
                section={selectedSection || null}
                onUpdate={(updates) => {
                  if (selectedSectionId) {
                    updateSection(selectedSectionId, updates);
                  }
                }}
              />
            )}
          </aside>
        )}
      </div>

      {/* Mobile Bottom Navigation - Only visible on small screens */}
      {!previewMode && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 safe-area-inset-bottom">
          <div className="grid grid-cols-6 gap-1 p-2">
            <button
              onClick={() => setMobileBottomSheet(mobileBottomSheet === 'pages' ? null : 'pages')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                mobileBottomSheet === 'pages'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <FileText className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">Pages</span>
            </button>

            <button
              onClick={() => setMobileBottomSheet(mobileBottomSheet === 'page' ? null : 'page')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                mobileBottomSheet === 'page'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              disabled={!selectedPageId}
            >
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">Page</span>
            </button>

            <button
              onClick={() => setMobileBottomSheet(mobileBottomSheet === 'sections' ? null : 'sections')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                mobileBottomSheet === 'sections'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Layers className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">Sections</span>
            </button>

            <button
              onClick={() => setShowAddSectionDialog(true)}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-medium">Add</span>
            </button>

            <button
              onClick={() => setMobileBottomSheet(mobileBottomSheet === 'properties' ? null : 'properties')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                mobileBottomSheet === 'properties'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              disabled={!selectedSectionId}
            >
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">Section</span>
            </button>

            <button
              onClick={() => setMobileBottomSheet(mobileBottomSheet === 'ai' ? null : 'ai')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                mobileBottomSheet === 'ai'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Sparkles className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">AI</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet - Slides up from bottom */}
      {!previewMode && mobileBottomSheet && (
        <div className="md:hidden fixed inset-0 z-40 flex items-end" onClick={() => setMobileBottomSheet(null)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Bottom Sheet Content */}
          <div
            className="relative w-full bg-gray-900 rounded-t-2xl max-h-[80vh] overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <div className="flex-shrink-0 py-3 flex justify-center">
              <div className="w-12 h-1 bg-gray-700 rounded-full" />
            </div>

            {/* Sheet Header */}
            <div className="flex-shrink-0 px-4 pb-3 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {mobileBottomSheet === 'pages' && 'Pages'}
                {mobileBottomSheet === 'page' && 'Edit Page'}
                {mobileBottomSheet === 'sections' && 'Sections'}
                {mobileBottomSheet === 'properties' && 'Edit Section'}
                {mobileBottomSheet === 'ai' && 'AI Assistant'}
                {mobileBottomSheet === 'seo' && 'SEO Assistant'}
              </h3>
              <button
                onClick={() => setMobileBottomSheet(null)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Content */}
            <div className="flex-1 overflow-y-auto">
              {mobileBottomSheet === 'pages' && (
                <div className="p-4">
                  <PageSelector
                    pages={website?.pages || []}
                    selectedPageId={selectedPageId}
                    onSelectPage={(pageId) => {
                      selectPage(pageId);
                      setMobileBottomSheet(null);
                    }}
                  />
                </div>
              )}

              {mobileBottomSheet === 'page' && selectedPageId && (
                <PageContentEditor
                  page={selectedPage || null}
                  onUpdate={(updates) => {
                    if (selectedPageId) {
                      updatePage(selectedPageId, updates);
                    }
                  }}
                />
              )}

              {mobileBottomSheet === 'sections' && (
                <div className="p-4">
                  {selectedPage && selectedPage.sections.length > 0 ? (
                    <SortableSectionList
                      sections={selectedPage.sections.sort((a, b) => a.order - b.order)}
                      selectedSectionId={selectedSectionId}
                      onSelectSection={(sectionId) => {
                        selectSection(sectionId);
                        setMobileBottomSheet('properties');
                      }}
                      onReorderSections={(sectionIds) => {
                        if (selectedPageId) {
                          reorderSections(selectedPageId, sectionIds);
                        }
                      }}
                      onDuplicateSection={duplicateSection}
                      onDeleteSection={deleteSection}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No sections yet</p>
                      <p className="text-xs mt-1">Tap the + button to add one</p>
                    </div>
                  )}
                </div>
              )}

              {mobileBottomSheet === 'properties' && selectedSectionId && (
                <SectionPropertiesEditor
                  section={selectedSection || null}
                  onUpdate={(updates) => {
                    if (selectedSectionId) {
                      updateSection(selectedSectionId, updates);
                    }
                  }}
                />
              )}

              {mobileBottomSheet === 'ai' && (
                <AIAssistantPanel
                  businessName={website?.name}
                  businessType={website?.description}
                />
              )}

              {mobileBottomSheet === 'seo' && (
                <SEOAssistantPanel
                  businessName={website?.name}
                  businessType={website?.description}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Padding Bottom - To prevent content from being hidden behind bottom nav */}
      {!previewMode && (
        <div className="md:hidden h-20" />
      )}

      {/* Extras Panel */}
      {showExtrasPanel && (
        <ExtrasPanel
          websiteId={websiteId}
          businessType={website?.description}
          onClose={() => setShowExtrasPanel(false)}
        />
      )}

      {/* Add Section Dialog */}
      <AddSectionDialog
        isOpen={showAddSectionDialog}
        onClose={() => setShowAddSectionDialog(false)}
        onAddSection={(sectionType, formTemplate) => {
          handleAddSection(sectionType, formTemplate);
          setShowAddSectionDialog(false);
        }}
      />
    </div>
  );
}
