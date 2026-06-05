-- Phase 10: Add mod tracking to resources
-- Allows marking resources as official (read-only) vs custom (editable)
-- Enables override system (patch existing resources)

-- Add mod tracking columns to resources
ALTER TABLE resources ADD COLUMN IF NOT EXISTS mod_id VARCHAR(255);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS override_of_id INTEGER;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add mod tracking columns to buildings
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS mod_id VARCHAR(255);
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS override_of_id INTEGER;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add mod tracking columns to technologies
ALTER TABLE technologies ADD COLUMN IF NOT EXISTS mod_id VARCHAR(255);
ALTER TABLE technologies ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;
ALTER TABLE technologies ADD COLUMN IF NOT EXISTS override_of_id INTEGER;
ALTER TABLE technologies ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE technologies ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add mod tracking columns to building_categories
ALTER TABLE building_categories ADD COLUMN IF NOT EXISTS mod_id VARCHAR(255);
ALTER TABLE building_categories ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;
ALTER TABLE building_categories ADD COLUMN IF NOT EXISTS override_of_id INTEGER;
ALTER TABLE building_categories ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE building_categories ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add mod tracking columns to knowledge
ALTER TABLE knowledge ADD COLUMN IF NOT EXISTS mod_id VARCHAR(255);
ALTER TABLE knowledge ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;
ALTER TABLE knowledge ADD COLUMN IF NOT EXISTS override_of_id INTEGER;
ALTER TABLE knowledge ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE knowledge ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_resources_mod_id ON resources(mod_id);
CREATE INDEX IF NOT EXISTS idx_resources_official ON resources(is_official);
CREATE INDEX IF NOT EXISTS idx_resources_override ON resources(override_of_id);
CREATE INDEX IF NOT EXISTS idx_resources_locked ON resources(is_locked);

CREATE INDEX IF NOT EXISTS idx_buildings_mod_id ON buildings(mod_id);
CREATE INDEX IF NOT EXISTS idx_buildings_official ON buildings(is_official);
CREATE INDEX IF NOT EXISTS idx_buildings_override ON buildings(override_of_id);

CREATE INDEX IF NOT EXISTS idx_technologies_mod_id ON technologies(mod_id);
CREATE INDEX IF NOT EXISTS idx_technologies_official ON technologies(is_official);

CREATE INDEX IF NOT EXISTS idx_categories_mod_id ON building_categories(mod_id);
CREATE INDEX IF NOT EXISTS idx_categories_official ON building_categories(is_official);

CREATE INDEX IF NOT EXISTS idx_knowledge_mod_id ON knowledge(mod_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_official ON knowledge(is_official);

-- Backfill existing data (from game datamodel import)
-- All current resources are marked as official
UPDATE resources SET is_official = true, is_locked = true WHERE is_official = false AND mod_id IS NULL;
UPDATE buildings SET is_official = true, is_locked = true WHERE is_official = false AND mod_id IS NULL;
UPDATE technologies SET is_official = true, is_locked = true WHERE is_official = false AND mod_id IS NULL;
UPDATE building_categories SET is_official = true, is_locked = true WHERE is_official = false AND mod_id IS NULL;
UPDATE knowledge SET is_official = true, is_locked = true WHERE is_official = false AND mod_id IS NULL;
