import { NextRequest, NextResponse } from 'next/server';
import { ExtraConfig } from '@/lib/extras/extras-catalog';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Install an extra/addon to a website
 * Adds necessary sections and pages based on the extra type
 */
export async function POST(request: NextRequest) {
  try {
    const { websiteId, extra } = await request.json();

    if (!websiteId || !extra) {
      return NextResponse.json(
        { error: 'Website ID and extra configuration are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Load the website with pages
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('*, pages(*)')
      .eq('id', websiteId)
      .single();

    if (websiteError || !website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }

    // Install based on extra category
    const installResult = await installExtraToWebsite(supabase, website, extra as ExtraConfig);

    return NextResponse.json({
      success: true,
      message: `${extra.name} installed successfully!`,
      addedSections: installResult.addedSections.length,
      addedPages: installResult.addedPages.length,
    });
  } catch (error) {
    console.error('Error installing extra:', error);
    return NextResponse.json(
      { error: 'Failed to install extra' },
      { status: 500 }
    );
  }
}

async function installExtraToWebsite(supabase: any, website: any, extra: ExtraConfig) {
  const addedSections: any[] = [];
  const addedPages: any[] = [];

  switch (extra.category) {
    case 'booking':
      return installBookingExtra(supabase, website, extra);

    case 'ecommerce':
      return installEcommerceExtra(supabase, website, extra);

    case 'scheduling':
      return installSchedulingExtra(supabase, website, extra);

    case 'engagement':
      return installEngagementExtra(supabase, website, extra);

    case 'media':
      return installMediaExtra(supabase, website, extra);

    case 'community':
      return installCommunityExtra(supabase, website, extra);

    case 'analytics':
      return installAnalyticsExtra(supabase, website, extra);

    default:
      return { addedSections, addedPages };
  }
}

// BOOKING EXTRAS
async function installBookingExtra(supabase: any, website: any, extra: ExtraConfig) {
  const addedSections: any[] = [];
  const addedPages: any[] = [];

  // Find or create a booking page
  let bookingPage = website.pages?.find((p: any) => p.slug === 'booking' || p.slug === 'reservations');

  if (!bookingPage) {
    const { data: newPage, error } = await supabase
      .from('pages')
      .insert({
        website_id: website.id,
        title: extra.id.includes('accommodation') ? 'Book Now' : 'Reservations',
        slug: 'booking',
        path: '/booking',
        order: website.pages?.length || 0,
      })
      .select()
      .single();

    if (!error && newPage) {
      bookingPage = newPage;
      addedPages.push(newPage);
    }
  }

  if (bookingPage) {
    const { data: newSection, error } = await supabase
      .from('sections')
      .insert({
        page_id: bookingPage.id,
        type: 'CONTACT_FORM',
        content: {
          heading: `Book Your ${extra.name.replace(' System', '').replace(' Booking', '')}`,
          subheading: 'Select your preferred date and time',
          submitButtonText: 'Complete Booking',
        },
        order: 0,
      })
      .select()
      .single();

    if (!error && newSection) {
      addedSections.push(newSection);
    }
  }

  return { addedSections, addedPages };
}

// ECOMMERCE EXTRAS
async function installEcommerceExtra(supabase: any, website: any, extra: ExtraConfig) {
  const addedSections: any[] = [];
  const addedPages: any[] = [];

  // Sample products
  const sampleProducts = [
    { name: 'Premium Product', description: 'High-quality product for discerning customers', price: 99 },
    { name: 'Best Seller', description: 'Our most popular item', price: 79 },
    { name: 'Featured Item', description: 'Specially selected for you', price: 129 },
    { name: 'New Arrival', description: 'Just added to our collection', price: 89 },
    { name: 'Customer Favorite', description: 'Highly rated by our customers', price: 109 },
    { name: 'Limited Edition', description: 'Exclusive limited availability', price: 149 },
  ];

  // Find or create shop page
  let shopPage = website.pages?.find((p: any) => p.slug === 'shop' || p.slug === 'store');

  if (!shopPage) {
    const { data: newPage, error } = await supabase
      .from('pages')
      .insert({
        website_id: website.id,
        title: 'Shop',
        slug: 'shop',
        path: '/shop',
        order: website.pages?.length || 0,
      })
      .select()
      .single();

    if (!error && newPage) {
      shopPage = newPage;
      addedPages.push(newPage);
    }
  }

  if (shopPage) {
    const { data: newSection, error } = await supabase
      .from('sections')
      .insert({
        page_id: shopPage.id,
        type: 'FEATURES',
        content: {
          heading: 'Our Products',
          subheading: 'Discover our collection',
          items: sampleProducts.map(product => ({
            title: product.name,
            description: product.description,
            icon: 'Package',
          })),
        },
        order: 0,
      })
      .select()
      .single();

    if (!error && newSection) {
      addedSections.push(newSection);
    }
  }

  return { addedSections, addedPages };
}

// SCHEDULING EXTRAS
async function installSchedulingExtra(supabase: any, website: any, extra: ExtraConfig) {
  const addedSections: any[] = [];
  const addedPages: any[] = [];

  let eventsPage = website.pages?.find((p: any) => p.slug === 'events' || p.slug === 'calendar');

  if (!eventsPage) {
    const { data: newPage, error } = await supabase
      .from('pages')
      .insert({
        website_id: website.id,
        title: 'Events',
        slug: 'events',
        path: '/events',
        order: website.pages?.length || 0,
      })
      .select()
      .single();

    if (!error && newPage) {
      eventsPage = newPage;
      addedPages.push(newPage);
    }
  }

  if (eventsPage) {
    const { data: newSection, error } = await supabase
      .from('sections')
      .insert({
        page_id: eventsPage.id,
        type: 'FEATURES',
        content: {
          heading: 'Upcoming Events',
          subheading: 'Check out what\'s happening',
          items: [
            {
              title: 'Sample Event',
              description: 'This is a sample event. Replace with your own events.',
              icon: 'Calendar',
            },
          ],
        },
        order: 0,
      })
      .select()
      .single();

    if (!error && newSection) {
      addedSections.push(newSection);
    }
  }

  return { addedSections, addedPages };
}

// ENGAGEMENT EXTRAS
async function installEngagementExtra(supabase: any, website: any, extra: ExtraConfig) {
  const addedSections: any[] = [];
  const addedPages: any[] = [];

  let contactPage = website.pages?.find((p: any) => p.slug === 'contact');

  if (!contactPage) {
    const { data: newPage, error } = await supabase
      .from('pages')
      .insert({
        website_id: website.id,
        title: 'Contact',
        slug: 'contact',
        path: '/contact',
        order: website.pages?.length || 0,
      })
      .select()
      .single();

    if (!error && newPage) {
      contactPage = newPage;
      addedPages.push(newPage);
    }
  }

  if (contactPage) {
    const { data: newSection, error } = await supabase
      .from('sections')
      .insert({
        page_id: contactPage.id,
        type: 'CONTACT_FORM',
        content: {
          heading: extra.name,
          subheading: extra.description,
          submitButtonText: 'Submit',
        },
        order: 0,
      })
      .select()
      .single();

    if (!error && newSection) {
      addedSections.push(newSection);
    }
  }

  return { addedSections, addedPages };
}

// MEDIA EXTRAS
async function installMediaExtra(supabase: any, website: any, extra: ExtraConfig) {
  const addedSections: any[] = [];
  const addedPages: any[] = [];

  const homePage = website.pages?.find((p: any) => p.slug === 'home' || p.slug === '');

  if (homePage) {
    const { data: newSection, error } = await supabase
      .from('sections')
      .insert({
        page_id: homePage.id,
        type: 'FEATURES',
        content: {
          heading: extra.name,
          subheading: extra.description,
          items: [
            { title: 'Gallery Item 1', description: 'Sample gallery item', icon: 'Image' },
            { title: 'Gallery Item 2', description: 'Sample gallery item', icon: 'Image' },
            { title: 'Gallery Item 3', description: 'Sample gallery item', icon: 'Image' },
          ],
        },
        order: website.pages[0]?.sections?.length || 0,
      })
      .select()
      .single();

    if (!error && newSection) {
      addedSections.push(newSection);
    }
  }

  return { addedSections, addedPages };
}

// COMMUNITY EXTRAS
async function installCommunityExtra(supabase: any, website: any, extra: ExtraConfig) {
  const addedSections: any[] = [];
  const addedPages: any[] = [];

  const homePage = website.pages?.find((p: any) => p.slug === 'home' || p.slug === '');

  if (homePage) {
    const { data: newSection, error } = await supabase
      .from('sections')
      .insert({
        page_id: homePage.id,
        type: 'TESTIMONIALS',
        content: {
          heading: 'What Our Customers Say',
          subheading: 'Real reviews from real people',
          items: [
            {
              title: 'John Doe',
              description: 'Great service! Highly recommended.',
              subtitle: 'Customer',
            },
            {
              title: 'Jane Smith',
              description: 'Excellent experience from start to finish.',
              subtitle: 'Client',
            },
          ],
        },
        order: website.pages[0]?.sections?.length || 0,
      })
      .select()
      .single();

    if (!error && newSection) {
      addedSections.push(newSection);
    }
  }

  return { addedSections, addedPages };
}

// ANALYTICS EXTRAS
async function installAnalyticsExtra(supabase: any, website: any, extra: ExtraConfig) {
  const addedSections: any[] = [];
  const addedPages: any[] = [];

  // Analytics are typically integrated in the background
  // Update website metadata
  await supabase
    .from('websites')
    .update({
      theme: {
        ...website.theme,
        analytics: {
          provider: extra.id,
          enabled: true,
          installedAt: new Date().toISOString(),
        },
      },
    })
    .eq('id', website.id);

  return { addedSections, addedPages };
}
