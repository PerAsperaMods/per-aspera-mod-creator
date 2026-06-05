import { Pool } from 'pg';

export interface Language {
  id: number;
  code: string;
  name: string;
  is_default: boolean;
}

export interface TranslationKey {
  id: number;
  key: string;
  entity_type?: string;
  entity_id?: number;
  context?: string;
  default_text?: string;
}

export interface Translation {
  id: number;
  translation_key_id: number;
  language_id: number;
  translated_text: string;
  translated_by?: string;
  reviewed: boolean;
  reviewed_by?: string;
}

export interface TranslationEntry {
  key_id: number;
  key: string;
  default_text?: string;
  context?: string;
  translations: {
    [language_code: string]: {
      text: string;
      reviewed: boolean;
      translated_by?: string;
    };
  };
}

export class LocalizationService {
  constructor(private pool: Pool) {}

  /**
   * Get all supported languages
   */
  async getLanguages(): Promise<Language[]> {
    const result = await this.pool.query('SELECT * FROM languages ORDER BY is_default DESC, name');
    return result.rows;
  }

  /**
   * Get all translation keys
   */
  async getTranslationKeys(): Promise<TranslationKey[]> {
    const result = await this.pool.query('SELECT * FROM translation_keys ORDER BY key');
    return result.rows;
  }

  /**
   * Get a single translation key with all translations
   */
  async getTranslationKeyWithTranslations(keyId: number): Promise<TranslationEntry | null> {
    const keyResult = await this.pool.query('SELECT * FROM translation_keys WHERE id = $1', [keyId]);

    if (keyResult.rows.length === 0) return null;

    const key = keyResult.rows[0];

    // Get all translations for this key
    const transResult = await this.pool.query(
      `SELECT t.*, l.code FROM translations t
       JOIN languages l ON t.language_id = l.id
       WHERE t.translation_key_id = $1`,
      [keyId]
    );

    const translations: { [key: string]: any } = {};
    for (const trans of transResult.rows) {
      translations[trans.code] = {
        text: trans.translated_text,
        reviewed: trans.reviewed,
        translated_by: trans.translated_by,
      };
    }

    return {
      key_id: key.id,
      key: key.key,
      default_text: key.default_text,
      context: key.context,
      translations,
    };
  }

  /**
   * Create a new translation key
   */
  async createTranslationKey(
    key: string,
    defaultText: string,
    entityType?: string,
    entityId?: number,
    context?: string
  ): Promise<TranslationKey> {
    const result = await this.pool.query(
      `INSERT INTO translation_keys (key, default_text, entity_type, entity_id, context)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, defaultText, entityType, entityId, context]
    );
    return result.rows[0];
  }

  /**
   * Set a translation for a key in a specific language
   */
  async setTranslation(
    keyId: number,
    languageCode: string,
    translatedText: string,
    translatedBy?: string
  ): Promise<Translation> {
    // Get language ID
    const langResult = await this.pool.query('SELECT id FROM languages WHERE code = $1', [languageCode]);

    if (langResult.rows.length === 0) {
      throw new Error(`Language not found: ${languageCode}`);
    }

    const languageId = langResult.rows[0].id;

    // Insert or update translation
    const result = await this.pool.query(
      `INSERT INTO translations (translation_key_id, language_id, translated_text, translated_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (translation_key_id, language_id) DO UPDATE
       SET translated_text = $3, translated_by = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [keyId, languageId, translatedText, translatedBy]
    );

    return result.rows[0];
  }

  /**
   * Get all translations for a language
   */
  async getTranslationsByLanguage(languageCode: string): Promise<TranslationEntry[]> {
    const result = await this.pool.query(
      `SELECT tk.id as key_id, tk.key, tk.default_text, tk.context,
              t.translated_text, t.reviewed, t.translated_by, t.language_id
       FROM translation_keys tk
       LEFT JOIN translations t ON tk.id = t.translation_key_id
       LEFT JOIN languages l ON t.language_id = l.id
       WHERE l.code = $1 OR t.translation_key_id IS NULL
       ORDER BY tk.key`,
      [languageCode]
    );

    // Group by key
    const grouped: { [key: string]: TranslationEntry } = {};

    for (const row of result.rows) {
      if (!grouped[row.key_id]) {
        grouped[row.key_id] = {
          key_id: row.key_id,
          key: row.key,
          default_text: row.default_text,
          context: row.context,
          translations: {},
        };
      }

      if (row.translated_text) {
        grouped[row.key_id].translations[languageCode] = {
          text: row.translated_text,
          reviewed: row.reviewed,
          translated_by: row.translated_by,
        };
      }
    }

    return Object.values(grouped);
  }

  /**
   * Get translation completion stats
   */
  async getTranslationStats(): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT l.code, l.name, COUNT(DISTINCT tk.id) as total_keys,
              COUNT(DISTINCT CASE WHEN t.translated_text IS NOT NULL THEN tk.id END) as translated_keys,
              COUNT(DISTINCT CASE WHEN t.reviewed THEN tk.id END) as reviewed_keys,
              ROUND(100.0 * COUNT(DISTINCT CASE WHEN t.translated_text IS NOT NULL THEN tk.id END) /
                    NULLIF(COUNT(DISTINCT tk.id), 0), 2) as completion_percentage
       FROM languages l
       CROSS JOIN translation_keys tk
       LEFT JOIN translations t ON tk.id = t.translation_key_id AND t.language_id = l.id
       GROUP BY l.id, l.code, l.name
       ORDER BY l.is_default DESC, l.name`
    );

    return result.rows;
  }

  /**
   * Mark translation as reviewed
   */
  async reviewTranslation(translationId: number, reviewedBy: string): Promise<void> {
    await this.pool.query(
      'UPDATE translations SET reviewed = true, reviewed_by = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [reviewedBy, translationId]
    );
  }

  /**
   * Search translations by key pattern
   */
  async searchTranslationKeys(pattern: string): Promise<TranslationKey[]> {
    const result = await this.pool.query(
      `SELECT * FROM translation_keys
       WHERE key ILIKE $1 OR context ILIKE $1
       ORDER BY key
       LIMIT 50`,
      [`%${pattern}%`]
    );

    return result.rows;
  }

  /**
   * Extract all text labels from resources/buildings/technologies
   */
  async extractAllLabels(): Promise<void> {
    // Extract from resources
    const resourcesResult = await this.pool.query(
      `SELECT id, key, name_label FROM resources WHERE name_label IS NOT NULL`
    );

    for (const resource of resourcesResult.rows) {
      await this.createTranslationKey(resource.name_label, resource.key, 'resource', resource.id);
    }

    // Extract from buildings
    const buildingsResult = await this.pool.query(
      `SELECT id, key, name_label FROM buildings WHERE name_label IS NOT NULL`
    );

    for (const building of buildingsResult.rows) {
      await this.createTranslationKey(building.name_label, building.key, 'building', building.id);
    }

    // Extract from technologies
    const techResult = await this.pool.query(
      `SELECT id, key, name_label FROM technologies WHERE name_label IS NOT NULL`
    );

    for (const tech of techResult.rows) {
      await this.createTranslationKey(tech.name_label, tech.key, 'technology', tech.id);
    }
  }
}
