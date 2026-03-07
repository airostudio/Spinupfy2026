-- Add foreign key relationships for PostgREST joins

-- Add foreign key from websites to users
ALTER TABLE websites
DROP CONSTRAINT IF EXISTS websites_user_id_fkey;

ALTER TABLE websites
ADD CONSTRAINT websites_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Add foreign key from pages to websites (if not exists)
ALTER TABLE pages
DROP CONSTRAINT IF EXISTS pages_website_id_fkey;

ALTER TABLE pages
ADD CONSTRAINT pages_website_id_fkey
FOREIGN KEY (website_id)
REFERENCES websites(id)
ON DELETE CASCADE;

-- Add foreign key from sections to pages (if not exists)
ALTER TABLE sections
DROP CONSTRAINT IF EXISTS sections_page_id_fkey;

ALTER TABLE sections
ADD CONSTRAINT sections_page_id_fkey
FOREIGN KEY (page_id)
REFERENCES pages(id)
ON DELETE CASCADE;

-- Add foreign key from stores to websites (if not exists)
ALTER TABLE stores
DROP CONSTRAINT IF EXISTS stores_website_id_fkey;

ALTER TABLE stores
ADD CONSTRAINT stores_website_id_fkey
FOREIGN KEY (website_id)
REFERENCES websites(id)
ON DELETE CASCADE;

-- Add foreign key from stores to users (if not exists)
ALTER TABLE stores
DROP CONSTRAINT IF EXISTS stores_user_id_fkey;

ALTER TABLE stores
ADD CONSTRAINT stores_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Add foreign key from products to stores (if not exists)
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_store_id_fkey;

ALTER TABLE products
ADD CONSTRAINT products_store_id_fkey
FOREIGN KEY (store_id)
REFERENCES stores(id)
ON DELETE CASCADE;

-- Add foreign key from orders to stores (if not exists)
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_store_id_fkey;

ALTER TABLE orders
ADD CONSTRAINT orders_store_id_fkey
FOREIGN KEY (store_id)
REFERENCES stores(id)
ON DELETE CASCADE;

-- Add foreign key from api_usage to users (if not exists)
ALTER TABLE api_usage
DROP CONSTRAINT IF EXISTS api_usage_user_id_fkey;

ALTER TABLE api_usage
ADD CONSTRAINT api_usage_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Create indexes on foreign key columns for better performance
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_website_id ON pages(website_id);
CREATE INDEX IF NOT EXISTS idx_sections_page_id ON sections(page_id);
CREATE INDEX IF NOT EXISTS idx_stores_website_id ON stores(website_id);
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);

COMMENT ON CONSTRAINT websites_user_id_fkey ON websites IS 'Foreign key to users table for PostgREST joins';
