import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { LocalizationService } from './LocalizationService';

export interface LoadingReport {
  timestamp: string;
  phase: number;
  status: 'in_progress' | 'completed' | 'failed';
  items_loaded: {
    resources: number;
    buildings: number;
    technologies: number;
    knowledge: number;
    enhancements: number;
    categories: number;
  };
  errors: Array<{ type: string; message: string }>;
  warnings: Array<{ type: string; message: string }>;
  duration_ms: number;
}

export class YamlLoaderService {
  private gameDataPath = 'D:\\SteamLibrary\\steamapps\\common\\Per Aspera\\datamodel';
  private loadingReport: LoadingReport = {
    timestamp: new Date().toISOString(),
    phase: 0,
    status: 'in_progress',
    items_loaded: {
      resources: 0,
      buildings: 0,
      technologies: 0,
      knowledge: 0,
      enhancements: 0,
      categories: 0,
    },
    errors: [],
    warnings: [],
    duration_ms: 0,
  };

  constructor(
    private pool: Pool,
    private localizationService: LocalizationService
  ) {}

  /**
   * Load all Phase 1 data (core entities)
   */
  async loadPhase1(): Promise<LoadingReport> {
    const startTime = Date.now();
    this.loadingReport.phase = 1;
    this.loadingReport.status = 'in_progress';

    try {
      console.log('📦 Loading Phase 1: Core Entities...');

      // Load in order of dependencies
      await this.loadBuildingCategories();
      await this.loadResources();
      await this.loadBuildings();
      await this.loadKnowledge();
      await this.loadTechnologies();
      await this.loadEnhancements();

      // Validate cross-references
      await this.validateCrossReferences();

      // Extract translation keys
      await this.extractTranslationKeys();

      this.loadingReport.status = 'completed';
      this.loadingReport.duration_ms = Date.now() - startTime;

      console.log(
        `✅ Phase 1 complete: ${JSON.stringify(this.loadingReport.items_loaded)}`
      );

      return this.loadingReport;
    } catch (error: any) {
      this.loadingReport.status = 'failed';
      this.loadingReport.errors.push({
        type: 'PHASE_1_ERROR',
        message: error.message,
      });
      this.loadingReport.duration_ms = Date.now() - startTime;

      console.error('❌ Phase 1 failed:', error.message);
      throw error;
    }
  }

  /**
   * Load building categories
   */
  private async loadBuildingCategories(): Promise<void> {
    console.log('Loading building categories...');

    try {
      const filePath = path.join(this.gameDataPath, 'buildingCategory.yaml');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = yaml.load(fileContent) as any;

      if (!data || !data.buildingCategory) {
        throw new Error('Invalid buildingCategory.yaml structure');
      }

      const categories = data.buildingCategory;
      let loaded = 0;

      for (const [key, category] of Object.entries(categories)) {
        const cat = category as any;
        await this.pool.query(
          `INSERT INTO categories (key, name_label, is_official, is_locked)
           VALUES ($1, $2, true, true)
           ON CONFLICT (key) DO NOTHING`,
          [key, cat.name_label || key]
        );
        loaded++;
      }

      this.loadingReport.items_loaded.categories = loaded;
      console.log(`✅ Loaded ${loaded} building categories`);
    } catch (error: any) {
      this.loadingReport.errors.push({
        type: 'CATEGORIES_ERROR',
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Load resources
   */
  private async loadResources(): Promise<void> {
    console.log('Loading resources...');

    try {
      const filePath = path.join(this.gameDataPath, 'resource.yaml');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = yaml.load(fileContent) as any;

      if (!data || !data.resource) {
        throw new Error('Invalid resource.yaml structure');
      }

      const resources = data.resource;
      let loaded = 0;

      for (const [key, resource] of Object.entries(resources)) {
        const res = resource as any;
        await this.pool.query(
          `INSERT INTO resources (
            key, color, material_type, name_label, prefab_name,
            is_official, is_locked, mod_id
          )
           VALUES ($1, $2, $3, $4, $5, true, true, NULL)
           ON CONFLICT (key) DO NOTHING`,
          [
            key,
            res.color || '808080',
            res.materialType || 'Placeholder',
            res.name_label || key,
            res.prefabName || key,
          ]
        );
        loaded++;
      }

      this.loadingReport.items_loaded.resources = loaded;
      console.log(`✅ Loaded ${loaded} resources`);
    } catch (error: any) {
      this.loadingReport.errors.push({
        type: 'RESOURCES_ERROR',
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Load buildings
   */
  private async loadBuildings(): Promise<void> {
    console.log('Loading buildings...');

    try {
      const buildingFiles = ['building.yaml', 'building-greenmars.yaml', 'building-home.yaml'];
      let loaded = 0;

      for (const fileName of buildingFiles) {
        const filePath = path.join(this.gameDataPath, fileName);

        if (!fs.existsSync(filePath)) {
          this.loadingReport.warnings.push({
            type: 'FILE_NOT_FOUND',
            message: `${fileName} not found, skipping`,
          });
          continue;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = yaml.load(fileContent) as any;

        if (!data || !data.building) {
          this.loadingReport.warnings.push({
            type: 'INVALID_YAML',
            message: `${fileName} has invalid structure`,
          });
          continue;
        }

        const buildings = data.building;

        for (const [key, building] of Object.entries(buildings)) {
          const bldg = building as any;

          await this.pool.query(
            `INSERT INTO buildings (
              key, name_label, category_key, prefab_name,
              output_resource, output_quantity,
              power_consumption, health, drone_capacity,
              is_official, is_locked, mod_id
            )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true, NULL)
             ON CONFLICT (key) DO NOTHING`,
            [
              key,
              bldg.name_label || key,
              bldg.buildingCategory || 'category_basic',
              bldg.prefabName || key,
              bldg.outputResource || null,
              bldg.outputQuantity || null,
              bldg.powerConsumption || null,
              bldg.health || 100,
              bldg.droneCapacity || null,
            ]
          );

          loaded++;
        }
      }

      this.loadingReport.items_loaded.buildings = loaded;
      console.log(`✅ Loaded ${loaded} buildings`);
    } catch (error: any) {
      this.loadingReport.errors.push({
        type: 'BUILDINGS_ERROR',
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Load knowledge entries
   */
  private async loadKnowledge(): Promise<void> {
    console.log('Loading knowledge...');

    try {
      const filePath = path.join(this.gameDataPath, 'knowledge.yaml');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = yaml.load(fileContent) as any;

      if (!data || !data.knowledge) {
        throw new Error('Invalid knowledge.yaml structure');
      }

      const knowledge = data.knowledge;
      let loaded = 0;

      for (const [key, entry] of Object.entries(knowledge)) {
        const know = entry as any;
        await this.pool.query(
          `INSERT INTO knowledge (key, name_label, is_official, is_locked, mod_id)
           VALUES ($1, $2, true, true, NULL)
           ON CONFLICT (key) DO NOTHING`,
          [key, know.name_label || key]
        );
        loaded++;
      }

      this.loadingReport.items_loaded.knowledge = loaded;
      console.log(`✅ Loaded ${loaded} knowledge entries`);
    } catch (error: any) {
      this.loadingReport.errors.push({
        type: 'KNOWLEDGE_ERROR',
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Load technologies
   */
  private async loadTechnologies(): Promise<void> {
    console.log('Loading technologies...');

    try {
      const techFiles = [
        'technology-engineering.yaml',
        'technology-biology.yaml',
        'technology-space.yaml',
      ];
      let loaded = 0;

      for (const fileName of techFiles) {
        const filePath = path.join(this.gameDataPath, fileName);

        if (!fs.existsSync(filePath)) {
          this.loadingReport.warnings.push({
            type: 'FILE_NOT_FOUND',
            message: `${fileName} not found, skipping`,
          });
          continue;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = yaml.load(fileContent) as any;

        if (!data || !data.technology) {
          this.loadingReport.warnings.push({
            type: 'INVALID_YAML',
            message: `${fileName} has invalid structure`,
          });
          continue;
        }

        const technologies = data.technology;

        for (const [key, tech] of Object.entries(technologies)) {
          const t = tech as any;
          await this.pool.query(
            `INSERT INTO technologies (key, name_label, is_official, is_locked, mod_id)
             VALUES ($1, $2, true, true, NULL)
             ON CONFLICT (key) DO NOTHING`,
            [key, t.name_label || key]
          );
          loaded++;
        }
      }

      this.loadingReport.items_loaded.technologies = loaded;
      console.log(`✅ Loaded ${loaded} technologies`);
    } catch (error: any) {
      this.loadingReport.errors.push({
        type: 'TECHNOLOGIES_ERROR',
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Load enhancements
   */
  private async loadEnhancements(): Promise<void> {
    console.log('Loading enhancements...');

    try {
      const filePath = path.join(this.gameDataPath, 'enhancements.yaml');

      if (!fs.existsSync(filePath)) {
        this.loadingReport.warnings.push({
          type: 'FILE_NOT_FOUND',
          message: 'enhancements.yaml not found, skipping',
        });
        return;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = yaml.load(fileContent) as any;

      if (!data || !data.enhancement) {
        this.loadingReport.warnings.push({
          type: 'INVALID_YAML',
          message: 'enhancements.yaml has invalid structure',
        });
        return;
      }

      const enhancements = data.enhancement;
      let loaded = 0;

      for (const [key, enhancement] of Object.entries(enhancements)) {
        const enh = enhancement as any;
        await this.pool.query(
          `INSERT INTO enhancements (key, name_label, is_official, is_locked, mod_id)
           VALUES ($1, $2, true, true, NULL)
           ON CONFLICT (key) DO NOTHING`,
          [key, enh.name_label || key]
        );
        loaded++;
      }

      this.loadingReport.items_loaded.enhancements = loaded;
      console.log(`✅ Loaded ${loaded} enhancements`);
    } catch (error: any) {
      this.loadingReport.errors.push({
        type: 'ENHANCEMENTS_ERROR',
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Validate cross-references
   */
  private async validateCrossReferences(): Promise<void> {
    console.log('Validating cross-references...');

    try {
      // Check buildings reference valid resources
      const buildingsWithInvalidResources = await this.pool.query(
        `SELECT b.id, b.key, b.output_resource
         FROM buildings b
         WHERE b.output_resource IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM resources r WHERE r.key = b.output_resource
         )`
      );

      if (buildingsWithInvalidResources.rows.length > 0) {
        buildingsWithInvalidResources.rows.forEach(row => {
          this.loadingReport.warnings.push({
            type: 'INVALID_REFERENCE',
            message: `Building ${row.key} references non-existent resource ${row.output_resource}`,
          });
        });
      }

      console.log('✅ Cross-reference validation complete');
    } catch (error: any) {
      this.loadingReport.warnings.push({
        type: 'VALIDATION_ERROR',
        message: error.message,
      });
    }
  }

  /**
   * Auto-extract translation keys from loaded data
   */
  private async extractTranslationKeys(): Promise<void> {
    console.log('Extracting translation keys...');

    try {
      // Extract from resources
      const resources = await this.pool.query('SELECT key, name_label FROM resources WHERE is_official = true');
      for (const res of resources.rows) {
        await this.localizationService.createTranslationKey(
          res.name_label,
          res.key,
          'resource',
          null,
          `Resource: ${res.key}`
        );
      }

      // Extract from buildings
      const buildings = await this.pool.query('SELECT key, name_label FROM buildings WHERE is_official = true');
      for (const bldg of buildings.rows) {
        await this.localizationService.createTranslationKey(
          bldg.name_label,
          bldg.key,
          'building',
          null,
          `Building: ${bldg.key}`
        );
      }

      // Extract from technologies
      const technologies = await this.pool.query('SELECT key, name_label FROM technologies WHERE is_official = true');
      for (const tech of technologies.rows) {
        await this.localizationService.createTranslationKey(
          tech.name_label,
          tech.key,
          'technology',
          null,
          `Technology: ${tech.key}`
        );
      }

      // Extract from knowledge
      const knowledge = await this.pool.query('SELECT key, name_label FROM knowledge WHERE is_official = true');
      for (const know of knowledge.rows) {
        await this.localizationService.createTranslationKey(
          know.name_label,
          know.key,
          'knowledge',
          null,
          `Knowledge: ${know.key}`
        );
      }

      console.log('✅ Translation keys extracted');
    } catch (error: any) {
      this.loadingReport.warnings.push({
        type: 'TRANSLATION_EXTRACTION_ERROR',
        message: error.message,
      });
    }
  }

  /**
   * Get loading report
   */
  getLoadingReport(): LoadingReport {
    return this.loadingReport;
  }
}
