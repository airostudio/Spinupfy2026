/**
 * Supabase Server Client - Compatibility Export
 * Re-exports createServerSupabaseClient as createClient for compatibility
 */

import { createServerSupabaseClient } from '@/lib/supabase-server';

// Export as createClient for compatibility with content-writer routes
export async function createClient() {
  return await createServerSupabaseClient();
}
