-- Add a per-product flag that marks the product for free shipping regardless of cart total.
ALTER TABLE "Product" ADD COLUMN "freeShipping" BOOLEAN NOT NULL DEFAULT false;
