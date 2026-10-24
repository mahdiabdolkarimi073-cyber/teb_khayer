-- Add a per-product flag that forces the product to stay available (in stock)
-- even when global PRODUCTS_SALE_ENABLED is disabled.
ALTER TABLE "Product" ADD COLUMN "forceAvailable" BOOLEAN NOT NULL DEFAULT false;
