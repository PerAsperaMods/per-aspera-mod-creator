-- Phase 11: Mod Composition & Layering
-- Support stacking multiple mods with dependency tracking

-- Create mods table to track mod metadata
CREATE TABLE IF NOT EXISTS mods_metadata (
  mod_id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50),
  author VARCHAR(255),
  dependencies TEXT[],           -- Array of mod_ids this depends on
  priority INTEGER DEFAULT 0,    -- Higher = applied later (overrides more)
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track mod dependencies
CREATE TABLE IF NOT EXISTS mod_dependencies (
  mod_id VARCHAR(255) NOT NULL,
  depends_on_mod_id VARCHAR(255) NOT NULL,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (mod_id, depends_on_mod_id),
  FOREIGN KEY (mod_id) REFERENCES mods_metadata(mod_id) ON DELETE CASCADE
);

-- Track which mods are in a "stack" (composition)
CREATE TABLE IF NOT EXISTS mod_stacks (
  stack_id VARCHAR(255) PRIMARY KEY,
  mod_ids TEXT[] NOT NULL,           -- Ordered array of mod_ids
  resolution_order TEXT[] NOT NULL,  -- Final resolution order
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track resolved resources (after all overrides applied in a stack)
CREATE TABLE IF NOT EXISTS resolved_resources (
  stack_id VARCHAR(255) NOT NULL,
  resource_id INTEGER NOT NULL,
  original_resource_id INTEGER,      -- Base official resource
  applied_mods TEXT[],               -- Which mods modified it
  final_definition JSONB,            -- Merged result
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (stack_id, resource_id),
  FOREIGN KEY (stack_id) REFERENCES mod_stacks(stack_id) ON DELETE CASCADE
);

-- Track conflicts detected during composition
CREATE TABLE IF NOT EXISTS mod_conflicts (
  conflict_id SERIAL PRIMARY KEY,
  stack_id VARCHAR(255),
  mod_a VARCHAR(255),
  mod_b VARCHAR(255),
  entity_type VARCHAR(50),           -- 'resource', 'building', etc.
  entity_id INTEGER,
  conflict_type VARCHAR(50),         -- 'override', 'incompatible', etc.
  description TEXT,
  severity VARCHAR(20),              -- 'error', 'warning', 'info'
  resolution TEXT,                   -- How to resolve
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mods_metadata_created ON mods_metadata(created_at);
CREATE INDEX IF NOT EXISTS idx_mod_dependencies_mod ON mod_dependencies(mod_id);
CREATE INDEX IF NOT EXISTS idx_mod_dependencies_depends ON mod_dependencies(depends_on_mod_id);
CREATE INDEX IF NOT EXISTS idx_mod_stacks_created ON mod_stacks(created_at);
CREATE INDEX IF NOT EXISTS idx_resolved_resources_stack ON resolved_resources(stack_id);
CREATE INDEX IF NOT EXISTS idx_resolved_resources_original ON resolved_resources(original_resource_id);
CREATE INDEX IF NOT EXISTS idx_mod_conflicts_stack ON mod_conflicts(stack_id);
CREATE INDEX IF NOT EXISTS idx_mod_conflicts_severity ON mod_conflicts(severity);

-- Insert "official" as a special mod (base game)
INSERT INTO mods_metadata (mod_id, name, description, is_official, priority)
VALUES ('official', 'Per Aspera Official', 'Official game data', true, -1)
ON CONFLICT (mod_id) DO NOTHING;
