-- Phase 13: Localization & Translation System

-- Supported languages
CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,  -- 'en', 'fr', 'de', etc.
  name VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Translation keys (e.g., "BE_resource_aluminum_name")
CREATE TABLE IF NOT EXISTS translation_keys (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  entity_type VARCHAR(50),  -- 'resource', 'building', 'technology', etc.
  entity_id INTEGER,        -- Reference to entity
  context TEXT,             -- Description of what this label is for
  default_text VARCHAR(500),-- Default English text
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Translations (key + language)
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  translation_key_id INTEGER NOT NULL,
  language_id INTEGER NOT NULL,
  translated_text VARCHAR(500) NOT NULL,
  translated_by VARCHAR(255),  -- User who translated
  reviewed BOOLEAN DEFAULT false,
  reviewed_by VARCHAR(255),    -- Reviewer
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (translation_key_id) REFERENCES translation_keys(id) ON DELETE CASCADE,
  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
  UNIQUE(translation_key_id, language_id)
);

-- Translation completion stats
CREATE TABLE IF NOT EXISTS translation_stats (
  id SERIAL PRIMARY KEY,
  language_id INTEGER NOT NULL,
  total_keys INTEGER DEFAULT 0,
  translated_keys INTEGER DEFAULT 0,
  reviewed_keys INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
  UNIQUE(language_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_translation_keys_entity ON translation_keys(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_translation_keys_key ON translation_keys(key);
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language_id);
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(translation_key_id);
CREATE INDEX IF NOT EXISTS idx_translations_reviewed ON translations(reviewed);

-- Insert default languages
INSERT INTO languages (code, name, is_default) VALUES
('en', 'English', true),
('fr', 'Français', false),
('de', 'Deutsch', false),
('es', 'Español', false),
('it', 'Italiano', false),
('pt', 'Português', false),
('ja', '日本語', false),
('zh', '中文', false),
('ru', 'Русский', false),
('ko', '한국어', false)
ON CONFLICT DO NOTHING;

-- Initialize stats for all languages
INSERT INTO translation_stats (language_id, total_keys, translated_keys, reviewed_keys, completion_percentage)
SELECT id, 0, 0, 0, 0 FROM languages
ON CONFLICT (language_id) DO NOTHING;
