-- Phase 1: YAML Loader Tables for Core Entities

-- Technologies table (if doesn't exist)
CREATE TABLE IF NOT EXISTS technologies (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  name_label VARCHAR(255),
  is_official BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  mod_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhancements table
CREATE TABLE IF NOT EXISTS enhancements (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  name_label VARCHAR(255),
  is_official BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  mod_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure categories table exists
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  name_label VARCHAR(255),
  is_official BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  mod_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_technologies_official ON technologies(is_official);
CREATE INDEX IF NOT EXISTS idx_technologies_key ON technologies(key);
CREATE INDEX IF NOT EXISTS idx_enhancements_official ON enhancements(is_official);
CREATE INDEX IF NOT EXISTS idx_enhancements_key ON enhancements(key);
CREATE INDEX IF NOT EXISTS idx_categories_official ON categories(is_official);
CREATE INDEX IF NOT EXISTS idx_categories_key ON categories(key);

-- Add missing indexes to existing tables
CREATE INDEX IF NOT EXISTS idx_resources_official ON resources(is_official);
CREATE INDEX IF NOT EXISTS idx_resources_locked ON resources(is_locked);
CREATE INDEX IF NOT EXISTS idx_buildings_official ON buildings(is_official);
CREATE INDEX IF NOT EXISTS idx_buildings_locked ON buildings(is_locked);
CREATE INDEX IF NOT EXISTS idx_buildings_category ON buildings(category_key);
CREATE INDEX IF NOT EXISTS idx_knowledge_official ON knowledge(is_official);
CREATE INDEX IF NOT EXISTS idx_knowledge_locked ON knowledge(is_locked);
