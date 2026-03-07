# Database Migrations

This directory contains database migrations for the AI Website Builder.

## How to Apply Migrations

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Paste and execute in the SQL Editor

## Migration: Add HEADER and STORE Section Types

**File:** `add-header-store-section-types.sql`
**Date:** 2025-12-11

This migration adds two new section types to support:
- **HEADER**: Navigation header sections
- **STORE**: Ecommerce product sections

### To Apply:

```sql
-- Run this in your Supabase SQL Editor
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'HEADER';
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'STORE';
```

### Verification:

After running the migration, you can verify the section types with:

```sql
SELECT unnest(enum_range(NULL::section_type))::text AS section_type;
```

This should show all section types including HEADER and STORE.
