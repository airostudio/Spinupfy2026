/**
 * Search Images API
 * Intelligent image search using Unsplash with business-specific optimization
 *
 * CRITICAL: Uses keyword synonym system to ensure accurate image results.
 * Prevents word truncation (e.g., "eye care" should never become "car")
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBusinessTypeById } from '@/lib/config/business-types';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
  PROTECTED_PHRASES,
  expandKeywords,
  safeExtractKeywords,
  getImageSearchSynonyms,
} from '@/lib/keyword-synonyms';

// Input validation
const MAX_DESCRIPTION_LENGTH = 500;
const ALLOWED_SECTIONS = ['hero', 'about', 'services', 'gallery'];

// Business-type specific image search configurations
const IMAGE_SEARCH_CONFIG: Record<string, {
  hero: string[];
  about: string[];
  services: string[];
  gallery: string[];
  default: string[];
}> = {
  'real-estate': {
    hero: ['luxury home interior', 'modern house exterior', 'real estate property'],
    about: ['real estate agent professional', 'house keys handover', 'happy homeowners'],
    services: ['house for sale sign', 'property viewing', 'mortgage consultation'],
    gallery: ['luxury interior design', 'modern kitchen', 'dream home'],
    default: ['real estate modern', 'property professional'],
  },
  'restaurant': {
    hero: ['fine dining restaurant', 'gourmet food plating', 'restaurant interior'],
    about: ['chef cooking kitchen', 'restaurant team', 'fresh ingredients'],
    services: ['catering service', 'private dining', 'food delivery'],
    gallery: ['delicious food photography', 'restaurant dishes', 'cuisine presentation'],
    default: ['restaurant food', 'dining experience'],
  },
  'tech-startup': {
    hero: ['tech office modern', 'startup workspace', 'innovative technology'],
    about: ['tech team collaboration', 'developers working', 'startup founders'],
    services: ['software development', 'digital transformation', 'technology innovation'],
    gallery: ['modern office space', 'tech equipment', 'coding programming'],
    default: ['technology startup', 'digital innovation'],
  },
  'healthcare': {
    hero: ['medical facility modern', 'healthcare professional', 'doctor patient care'],
    about: ['medical team', 'caring doctor patient', 'hospital staff'],
    services: ['medical examination', 'health checkup', 'medical equipment'],
    gallery: ['modern clinic', 'healthcare technology', 'medical care'],
    default: ['healthcare professional', 'medical modern'],
  },
  'fitness': {
    hero: ['gym fitness training', 'workout motivation', 'fitness center modern'],
    about: ['personal trainer client', 'fitness coach', 'gym community'],
    services: ['group fitness class', 'personal training session', 'yoga class'],
    gallery: ['gym equipment', 'fitness transformation', 'workout routine'],
    default: ['fitness gym', 'workout training'],
  },
  'photography': {
    hero: ['photography studio', 'camera equipment professional', 'creative photography'],
    about: ['photographer at work', 'photography session', 'creative professional'],
    services: ['portrait photography', 'wedding photography', 'product photography'],
    gallery: ['beautiful photography', 'photo gallery', 'stunning images'],
    default: ['photography professional', 'camera creative'],
  },
  'bakery': {
    hero: ['artisan bakery', 'fresh bread pastries', 'bakery display'],
    about: ['baker making bread', 'bakery kitchen', 'pastry chef'],
    services: ['custom cakes', 'wedding cake', 'pastry selection'],
    gallery: ['delicious pastries', 'bread varieties', 'cake decoration'],
    default: ['bakery artisan', 'fresh baked'],
  },
  'law-firm': {
    hero: ['law office professional', 'legal books gavel', 'attorney office'],
    about: ['lawyer client meeting', 'legal team', 'attorney consultation'],
    services: ['legal documents', 'courtroom', 'contract signing'],
    gallery: ['law library', 'legal office', 'justice scales'],
    default: ['legal professional', 'attorney office'],
  },
  'eye-care': {
    hero: ['optical shop modern interior', 'eye care clinic professional', 'eyewear display boutique'],
    about: ['optometrist eye exam patient', 'eye doctor consultation', 'vision care professional team'],
    services: ['eye examination equipment', 'comprehensive eye exam', 'vision testing equipment'],
    gallery: ['designer eyeglasses frames display', 'modern optical store', 'stylish eyewear collection'],
    default: ['optical eyewear professional', 'vision care modern'],
  },
  'chiropractic': {
    hero: ['chiropractic office modern', 'wellness center professional', 'spinal care clinic'],
    about: ['chiropractor adjustment patient', 'chiropractic consultation', 'wellness professional team'],
    services: ['spinal adjustment treatment', 'chiropractic therapy', 'back pain relief treatment'],
    gallery: ['modern chiropractic clinic', 'wellness center interior', 'chiropractic equipment'],
    default: ['chiropractic wellness professional', 'spinal care modern'],
  },
  'physical-therapy': {
    hero: ['physical therapy clinic modern', 'rehabilitation center professional', 'physiotherapy facility'],
    about: ['physical therapist patient exercise', 'rehabilitation team', 'therapy consultation'],
    services: ['rehabilitation exercises', 'mobility therapy', 'sports rehabilitation'],
    gallery: ['physical therapy equipment', 'rehabilitation gym', 'therapy session'],
    default: ['physical therapy professional', 'rehabilitation modern'],
  },
  'mental-health': {
    hero: ['therapy office calm serene', 'counseling center peaceful', 'mental health clinic welcoming'],
    about: ['therapist consultation caring', 'counseling session professional', 'supportive therapy environment'],
    services: ['therapy session room', 'counseling private office', 'mental wellness consultation'],
    gallery: ['peaceful therapy space', 'calming wellness interior', 'serene counseling environment'],
    default: ['mental health professional', 'therapy calm welcoming'],
  },
  'veterinary': {
    hero: ['veterinary clinic modern', 'animal hospital professional', 'pet care facility'],
    about: ['veterinarian examining pet', 'vet team with animals', 'caring veterinary staff'],
    services: ['pet examination room', 'veterinary surgery', 'animal health checkup'],
    gallery: ['happy healthy pets', 'veterinary clinic interior', 'pet care professional'],
    default: ['veterinary professional', 'pet care modern'],
  },
};

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessType, section, description } = await request.json();

    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    // Validate section
    const validSection = ALLOWED_SECTIONS.includes(section) ? section : 'hero';
    const sanitizedDescription = description ? String(description).slice(0, MAX_DESCRIPTION_LENGTH) : undefined;

    const businessTypeConfig = getBusinessTypeById(businessType);

    // Build search queries based on business type and section
    const queries = generateSearchQueries(
      businessType,
      businessTypeConfig,
      validSection,
      sanitizedDescription
    );

    // Search Unsplash with primary query
    const images = await searchUnsplash(queries[0], validSection);

    // If no results, try fallback queries
    if (images.length === 0 && queries.length > 1) {
      const fallbackImages = await searchUnsplash(queries[1], validSection);
      return NextResponse.json({ images: fallbackImages, queries });
    }

    return NextResponse.json({ images, queries });
  } catch (error) {
    console.error('Image search error:', error);
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    );
  }
}

function generateSearchQueries(
  businessType: string,
  typeConfig: ReturnType<typeof getBusinessTypeById>,
  section: string,
  description?: string
): string[] {
  const queries: string[] = [];
  const typeLabel = typeConfig?.label || String(businessType).replace(/-/g, ' ').slice(0, 50);

  // Get business-specific search terms
  const config = IMAGE_SEARCH_CONFIG[businessType];

  if (config) {
    const sectionQueries = config[section as keyof typeof config] || config.default;
    queries.push(...sectionQueries);
  } else {
    // Fallback for unconfigured business types
    if (section === 'hero') {
      queries.push(`${typeLabel} business professional`);
      queries.push(`${typeLabel} modern workspace`);
      queries.push('professional business modern');
    } else if (section === 'about') {
      queries.push(`${typeLabel} team professional`);
      queries.push('business team collaboration');
      queries.push('professional workspace modern');
    } else if (section === 'services') {
      queries.push(`${typeLabel} services`);
      queries.push(`${typeLabel} professional work`);
    } else if (section === 'gallery') {
      queries.push(`${typeLabel} portfolio`);
      queries.push(`${typeLabel} showcase`);
    } else {
      queries.push(`${typeLabel} professional`);
    }
  }

  // Add keyword-based queries from business type config
  if (typeConfig?.keywords) {
    const topKeywords = typeConfig.keywords.slice(0, 3);
    topKeywords.forEach((keyword: string) => {
      queries.push(`${keyword} modern professional`);
    });
  }

  // Add description-based query if provided
  // CRITICAL: Preserve protected phrases and prevent word truncation
  if (description) {
    // First, extract protected phrases that must be preserved
    const preservedPhrases: string[] = [];
    for (const phrase of PROTECTED_PHRASES) {
      if (description.toLowerCase().includes(phrase)) {
        preservedPhrases.push(phrase);
      }
    }

    // If we found protected phrases, use them directly
    if (preservedPhrases.length > 0) {
      // Add the first protected phrase with context
      queries.push(`${preservedPhrases[0]} professional`);

      // Expand with synonyms for better coverage
      const expanded = expandKeywords(preservedPhrases[0]);
      if (expanded.length > 1) {
        // Add top synonym as alternative query
        queries.push(`${expanded[1]} modern professional`);
      }
    }

    // Also extract safe keywords from description
    const safeKeywords = safeExtractKeywords(description);
    if (safeKeywords.length > 0) {
      // Use the top 3 keywords for search
      const keywordQuery = safeKeywords.slice(0, 3).join(' ');
      if (keywordQuery.trim() && !queries.includes(keywordQuery)) {
        queries.push(keywordQuery);
      }
    }

    // Get synonym-based queries for better coverage
    const synonyms = getImageSearchSynonyms(description);
    if (synonyms.length > 0) {
      // Add top 2 synonyms as additional queries
      synonyms.slice(0, 2).forEach(syn => {
        const synQuery = `${syn} professional modern`;
        if (!queries.includes(synQuery)) {
          queries.push(synQuery);
        }
      });
    }
  }

  return queries;
}

async function searchUnsplash(query: string, section: string) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn('Unsplash API key not configured');
    return [];
  }

  const orientation = section === 'hero' ? 'landscape' : 'squarish';
  const perPage = 12;

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Unsplash search failed:', error);
    return [];
  }
}
