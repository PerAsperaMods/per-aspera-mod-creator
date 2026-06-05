-- Per Aspera Mod Creator Database Schema

-- Resources Table
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  color VARCHAR(6) NOT NULL,
  material_type VARCHAR(50) NOT NULL,
  name_label VARCHAR(255) NOT NULL,
  prefab_name VARCHAR(255) NOT NULL,
  icon_name VARCHAR(255),
  cube_material VARCHAR(255),
  knowledge_ref VARCHAR(255),
  show_in_scanner BOOLEAN DEFAULT true,
  vein_icons JSONB,
  resource_index INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Building Categories Table
CREATE TABLE IF NOT EXISTS building_categories (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  name_label VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buildings Table
CREATE TABLE IF NOT EXISTS buildings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  name_label VARCHAR(255) NOT NULL,
  description_label VARCHAR(255),
  category_key VARCHAR(255) NOT NULL,
  prefab_name VARCHAR(255) NOT NULL,
  compact_name VARCHAR(20),

  -- Production
  output_resource VARCHAR(255),
  output_quantity INT DEFAULT 1,
  input_resources JSONB,
  required_resource_vein VARCHAR(255),

  -- Stats
  power_consumption FLOAT,
  power_priority FLOAT,
  health FLOAT DEFAULT 100,
  health_loss_per_day FLOAT,
  progress_per_day FLOAT,

  -- Workers/Drones
  drone_capacity INT,
  is_worker_hub BOOLEAN DEFAULT false,

  -- Construction
  required_construction_resources JSONB,

  -- Visuals
  rubble_prefab_name VARCHAR(255),
  icon_name VARCHAR(255),
  rival_icon_name VARCHAR(255),
  empty_hub_icon_name VARCHAR(255),
  progress_bar_names JSONB,

  -- Game
  extraction_level INT,
  reserved_radius FLOAT,
  way_snap_radius FLOAT,
  knowledge_ref VARCHAR(255),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Technologies Table
CREATE TABLE IF NOT EXISTS technologies (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  name_label VARCHAR(255) NOT NULL,

  knowledge_cost INT,
  research_points_cost INT,
  required_techs JSONB,
  duration_days INT,
  building_unlock VARCHAR(255),
  knowledge_ref VARCHAR(255),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Table
CREATE TABLE IF NOT EXISTS knowledge (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  name_label VARCHAR(255) NOT NULL,
  description_label VARCHAR(255),
  knowledge_type VARCHAR(50),
  value INT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mods Table
CREATE TABLE IF NOT EXISTS mods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  mod_id VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  compatible_versions JSONB,

  resource_ids JSONB,
  building_ids JSONB,
  technology_ids JSONB,
  category_ids JSONB,
  knowledge_ids JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_key ON resources(key);
CREATE INDEX IF NOT EXISTS idx_buildings_key ON buildings(key);
CREATE INDEX IF NOT EXISTS idx_technologies_key ON technologies(key);
CREATE INDEX IF NOT EXISTS idx_knowledge_key ON knowledge(key);
CREATE INDEX IF NOT EXISTS idx_categories_key ON building_categories(key);
CREATE INDEX IF NOT EXISTS idx_mods_name ON mods(name);
