-- Add the administrator setting used for the global product markup percentage.
ALTER TYPE "SettingKey" ADD VALUE IF NOT EXISTS 'PRODUCT_MARKUP_PERCENT';
