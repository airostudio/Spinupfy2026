/**
 * Website Database Service
 *
 * This service provides type-safe database operations for websites using Supabase.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';

/**
 * Create a new website
 * @param data Website data including userId and pages
 * @param supabaseClient Optional authenticated Supabase client (required for server-side calls)
 */
export async function createWebsite(data: {
  userId: string;
  name: string;
  description?: string;
  websiteType?: string;
  brandName?: string;
  logoUrl?: string;
  theme?: any;  // Design tokens and theme configuration
  pages?: {
    title: string;
    slug: string;
    path: string;
    isHomepage?: boolean;
    sections: {
      type: string;
      content: any;
      order: number;
    }[];
  }[];
}, supabaseClient?: SupabaseClient) {
  const db = supabaseClient || supabase;

  // Generate unique slug from name
  const baseSlug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Check for slug uniqueness and append number if needed
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data: existing } = await db
      .from('websites')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create website
  const { data: website, error: websiteError } = await db
    .from('websites')
    .insert({
      user_id: data.userId,
      name: data.name,
      description: data.description,
      slug,
      website_type: data.websiteType,
      brand_name: data.brandName,
      logo_url: data.logoUrl,
      theme: data.theme,
    })
    .select()
    .single();

  if (websiteError) throw websiteError;

  // Create pages and sections if provided
  if (data.pages && data.pages.length > 0) {
    for (let pageIndex = 0; pageIndex < data.pages.length; pageIndex++) {
      const page = data.pages[pageIndex];

      const { data: createdPage, error: pageError } = await db
        .from('pages')
        .insert({
          website_id: website.id,
          title: page.title,
          slug: page.slug,
          path: page.path,
          order: pageIndex,
          is_homepage: page.isHomepage || pageIndex === 0,
        })
        .select()
        .single();

      if (pageError) throw pageError;

      // Create sections for this page
      if (page.sections && page.sections.length > 0) {
        const sectionsToInsert = page.sections.map((section) => ({
          page_id: createdPage.id,
          type: section.type,
          content: section.content,
          settings: {},
          order: section.order,
        }));

        const { error: sectionsError } = await db
          .from('sections')
          .insert(sectionsToInsert);

        if (sectionsError) throw sectionsError;
      }
    }
  }

  // Fetch complete website with relations
  return getWebsiteById(website.id, data.userId, db);
}

/**
 * Get all websites for a user
 */
export async function getUserWebsites(userId: string) {
  const { data: websites, error } = await supabase
    .from('websites')
    .select(`
      *,
      pages (
        *,
        sections (*)
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return websites || [];
}

/**
 * Get a single website by ID
 */
export async function getWebsiteById(websiteId: string, userId: string, supabaseClient?: SupabaseClient) {
  const db = supabaseClient || supabase;
  const { data: website, error } = await db
    .from('websites')
    .select(`
      *,
      pages (
        *,
        sections (*)
      )
    `)
    .eq('id', websiteId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return website;
}

/**
 * Get a website by slug (public access)
 */
export async function getWebsiteBySlug(slug: string) {
  const { data: website, error } = await supabase
    .from('websites')
    .select(`
      *,
      pages (
        *,
        sections!inner (*)
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .eq('pages.sections.visible', true)
    .single();

  if (error) throw error;
  return website;
}

/**
 * Update website
 */
export async function updateWebsite(
  websiteId: string,
  userId: string,
  data: Partial<{
    name: string;
    description: string;
    websiteType: string;
    brandName: string;
    logoUrl: string;
    favicon: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    theme: any;
  }>
) {
  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.websiteType !== undefined) updateData.website_type = data.websiteType;
  if (data.brandName !== undefined) updateData.brand_name = data.brandName;
  if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;
  if (data.favicon !== undefined) updateData.favicon = data.favicon;
  if (data.metaTitle !== undefined) updateData.meta_title = data.metaTitle;
  if (data.metaDescription !== undefined) updateData.meta_description = data.metaDescription;
  if (data.metaKeywords !== undefined) updateData.meta_keywords = data.metaKeywords;
  if (data.theme !== undefined) updateData.theme = data.theme;

  const { data: website, error } = await supabase
    .from('websites')
    .update(updateData)
    .eq('id', websiteId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return website;
}

/**
 * Publish a website
 */
export async function publishWebsite(websiteId: string, userId: string) {
  // Get website first
  const { data: website, error: fetchError } = await supabase
    .from('websites')
    .select('*')
    .eq('id', websiteId)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;
  if (!website) throw new Error('Website not found');

  // Generate subdomain if not exists
  let subdomain = website.subdomain;
  if (!subdomain) {
    subdomain = website.slug;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from('websites')
        .select('id')
        .eq('subdomain', subdomain)
        .single();

      if (!existing) break;
      subdomain = `${website.slug}-${counter}`;
      counter++;
    }
  }

  const { data: updated, error } = await supabase
    .from('websites')
    .update({
      published: true,
      published_at: new Date().toISOString(),
      subdomain,
    })
    .eq('id', websiteId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

/**
 * Unpublish a website
 */
export async function unpublishWebsite(websiteId: string, userId: string) {
  const { data: website, error } = await supabase
    .from('websites')
    .update({ published: false })
    .eq('id', websiteId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return website;
}

/**
 * Delete a website
 */
export async function deleteWebsite(websiteId: string, userId: string) {
  const { data: website, error } = await supabase
    .from('websites')
    .delete()
    .eq('id', websiteId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return website;
}

/**
 * Update page content
 */
export async function updatePage(
  pageId: string,
  websiteId: string,
  userId: string,
  data: Partial<{
    title: string;
    slug: string;
    path: string;
    metaTitle: string;
    metaDescription: string;
    order: number;
  }>
) {
  // Verify ownership through website
  const { data: website } = await supabase
    .from('websites')
    .select('id')
    .eq('id', websiteId)
    .eq('user_id', userId)
    .single();

  if (!website) {
    throw new Error('Website not found or unauthorized');
  }

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.path !== undefined) updateData.path = data.path;
  if (data.metaTitle !== undefined) updateData.meta_title = data.metaTitle;
  if (data.metaDescription !== undefined) updateData.meta_description = data.metaDescription;
  if (data.order !== undefined) updateData.order = data.order;

  const { data: page, error } = await supabase
    .from('pages')
    .update(updateData)
    .eq('id', pageId)
    .eq('website_id', websiteId)
    .select()
    .single();

  if (error) throw error;
  return page;
}

/**
 * Update section content
 */
export async function updateSection(
  sectionId: string,
  websiteId: string,
  userId: string,
  data: Partial<{
    content: any;
    settings: any;
    order: number;
    visible: boolean;
  }>
) {
  // Verify ownership
  const { data: website } = await supabase
    .from('websites')
    .select('id')
    .eq('id', websiteId)
    .eq('user_id', userId)
    .single();

  if (!website) {
    throw new Error('Website not found or unauthorized');
  }

  const updateData: any = {};
  if (data.content !== undefined) updateData.content = data.content;
  if (data.settings !== undefined) updateData.settings = data.settings;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.visible !== undefined) updateData.visible = data.visible;

  const { data: section, error } = await supabase
    .from('sections')
    .update(updateData)
    .eq('id', sectionId)
    .select()
    .single();

  if (error) throw error;
  return section;
}

/**
 * Add a new section to a page
 */
export async function addSection(
  pageId: string,
  websiteId: string,
  userId: string,
  data: {
    type: string;
    content: any;
    settings?: any;
    order: number;
  }
) {
  // Verify ownership
  const { data: website } = await supabase
    .from('websites')
    .select(`
      id,
      pages!inner (id)
    `)
    .eq('id', websiteId)
    .eq('user_id', userId)
    .eq('pages.id', pageId)
    .single();

  if (!website) {
    throw new Error('Page not found or unauthorized');
  }

  const { data: section, error } = await supabase
    .from('sections')
    .insert({
      page_id: pageId,
      type: data.type,
      content: data.content,
      settings: data.settings || {},
      order: data.order,
    })
    .select()
    .single();

  if (error) throw error;
  return section;
}

/**
 * Delete a section
 */
export async function deleteSection(
  sectionId: string,
  websiteId: string,
  userId: string
) {
  // Verify ownership
  const { data: website } = await supabase
    .from('websites')
    .select('id')
    .eq('id', websiteId)
    .eq('user_id', userId)
    .single();

  if (!website) {
    throw new Error('Website not found or unauthorized');
  }

  const { data: section, error } = await supabase
    .from('sections')
    .delete()
    .eq('id', sectionId)
    .select()
    .single();

  if (error) throw error;
  return section;
}

/**
 * Get website analytics
 */
export async function getWebsiteStats(websiteId: string, userId: string) {
  // Verify ownership
  const { data: website, error: websiteError } = await supabase
    .from('websites')
    .select('*')
    .eq('id', websiteId)
    .eq('user_id', userId)
    .single();

  if (websiteError) throw websiteError;
  if (!website) throw new Error('Website not found or unauthorized');

  // Get page count
  const { count: pageCount, error: pageError } = await supabase
    .from('pages')
    .select('*', { count: 'exact', head: true })
    .eq('website_id', websiteId);

  if (pageError) throw pageError;

  // Get section count
  const { count: sectionCount, error: sectionError } = await supabase
    .from('sections')
    .select('page_id, pages!inner(website_id)', { count: 'exact', head: true })
    .eq('pages.website_id', websiteId);

  if (sectionError) throw sectionError;

  // Get views (if analytics enabled)
  const { count: views, error: viewsError } = await supabase
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('website_id', websiteId);

  if (viewsError) throw viewsError;

  return {
    pages: pageCount || 0,
    sections: sectionCount || 0,
    views: views || 0,
    published: website.published,
    createdAt: website.created_at,
    updatedAt: website.updated_at,
  };
}
