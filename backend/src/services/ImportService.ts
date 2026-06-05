import { Pool } from 'pg';
import { IResource, IBuilding, ITechnology, ICategory, IKnowledge } from '../types';

export interface BulkImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ item: string; error: string }>;
}

export class ImportService {
  constructor(private pool: Pool) {}

  async bulkImportResources(resources: IResource[]): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    };

    for (const resource of resources) {
      try {
        await this.pool.query(
          `INSERT INTO resources (key, color, material_type, name_label, prefab_name, show_in_scanner)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (key) DO UPDATE SET
           color = $2, material_type = $3, name_label = $4, prefab_name = $5, show_in_scanner = $6`,
          [
            resource.key,
            resource.color,
            resource.material_type || 'Placeholder',
            resource.name_label,
            resource.prefab_name,
            resource.show_in_scanner ?? true,
          ]
        );
        result.imported++;
      } catch (err: any) {
        result.failed++;
        result.errors.push({
          item: resource.key,
          error: err.message,
        });
      }
    }

    return result;
  }

  async bulkImportBuildings(buildings: IBuilding[]): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    };

    for (const building of buildings) {
      try {
        await this.pool.query(
          `INSERT INTO buildings
           (key, name_label, category_key, prefab_name, output_resource, output_quantity,
            power_consumption, health, drone_capacity)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (key) DO UPDATE SET
           name_label = $2, category_key = $3, prefab_name = $4, output_resource = $5,
           output_quantity = $6, power_consumption = $7, health = $8, drone_capacity = $9`,
          [
            building.key,
            building.name_label,
            building.category_key,
            building.prefab_name,
            building.output_resource || null,
            building.output_quantity || 0,
            building.power_consumption || 0,
            building.health || 100,
            building.drone_capacity || 0,
          ]
        );
        result.imported++;
      } catch (err: any) {
        result.failed++;
        result.errors.push({
          item: building.key,
          error: err.message,
        });
      }
    }

    return result;
  }

  async bulkImportTechnologies(technologies: ITechnology[]): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    };

    for (const tech of technologies) {
      try {
        await this.pool.query(
          `INSERT INTO technologies (key, name_label, knowledge_cost)
           VALUES ($1, $2, $3)
           ON CONFLICT (key) DO UPDATE SET
           name_label = $2, knowledge_cost = $3`,
          [tech.key, tech.name_label, tech.knowledge_cost || 0]
        );
        result.imported++;
      } catch (err: any) {
        result.failed++;
        result.errors.push({
          item: tech.key,
          error: err.message,
        });
      }
    }

    return result;
  }

  async bulkImportCategories(categories: ICategory[]): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    };

    for (const cat of categories) {
      try {
        await this.pool.query(
          `INSERT INTO building_categories (key, name_label)
           VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET
           name_label = $2`,
          [cat.key, cat.name_label]
        );
        result.imported++;
      } catch (err: any) {
        result.failed++;
        result.errors.push({
          item: cat.key,
          error: err.message,
        });
      }
    }

    return result;
  }

  async bulkImportKnowledge(knowledge: IKnowledge[]): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    };

    for (const know of knowledge) {
      try {
        await this.pool.query(
          `INSERT INTO knowledge (key, name_label)
           VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET
           name_label = $2`,
          [know.key, know.name_label]
        );
        result.imported++;
      } catch (err: any) {
        result.failed++;
        result.errors.push({
          item: know.key,
          error: err.message,
        });
      }
    }

    return result;
  }

  validateYAML(yamlData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!yamlData || typeof yamlData !== 'object') {
      errors.push('YAML must be an object');
      return { valid: false, errors };
    }

    for (const [key, value] of Object.entries(yamlData)) {
      if (typeof key !== 'string' || !key.match(/^[a-z_0-9]+$/i)) {
        errors.push(`Invalid key format: "${key}" (must be alphanumeric with underscores)`);
      }

      if (typeof value !== 'object' || value === null) {
        errors.push(`Value for "${key}" must be an object, got ${typeof value}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
