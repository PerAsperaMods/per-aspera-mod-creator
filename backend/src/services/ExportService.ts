import { Pool } from 'pg';
import yaml from 'js-yaml';

export class ExportService {
  constructor(private pool: Pool) {}

  async exportModAsYAML(modId: string): Promise<{ success: boolean; yaml?: string; error?: string }> {
    try {
      const mod = await this.pool.query(
        'SELECT * FROM mods WHERE id = $1',
        [modId]
      );

      if (mod.rows.length === 0) {
        return { success: false, error: 'Mod not found' };
      }

      const modData = mod.rows[0];
      const resourceIds = modData.resource_ids || [];
      const buildingIds = modData.building_ids || [];
      const technologyIds = modData.technology_ids || [];

      const yamlObj: any = {};

      if (resourceIds.length > 0) {
        const resources = await this.pool.query(
          'SELECT * FROM resources WHERE id = ANY($1)',
          [resourceIds]
        );

        yamlObj.resource = {};
        for (const res of resources.rows) {
          yamlObj.resource[res.key] = {
            color: res.color,
            materialType: res.material_type,
            name: res.name_label,
            prefabName: res.prefab_name,
            ...(res.show_in_scanner && { showInScannerLens: res.show_in_scanner }),
          };
        }
      }

      if (buildingIds.length > 0) {
        const buildings = await this.pool.query(
          'SELECT * FROM buildings WHERE id = ANY($1)',
          [buildingIds]
        );

        yamlObj.building = {};
        for (const bld of buildings.rows) {
          yamlObj.building[bld.key] = {
            name: bld.name_label,
            categoryType: bld.category_key ? { _ref: bld.category_key } : undefined,
            prefabName: bld.prefab_name,
            ...(bld.output_resource && { outputResource: { _ref: bld.output_resource } }),
            ...(bld.output_quantity && { outputQuantity: bld.output_quantity }),
            ...(bld.power_consumption && { powerConsumption: bld.power_consumption }),
            ...(bld.health && { health: bld.health }),
            ...(bld.drone_capacity && { droneCapacity: bld.drone_capacity }),
          };
        }
      }

      if (technologyIds.length > 0) {
        const technologies = await this.pool.query(
          'SELECT * FROM technologies WHERE id = ANY($1)',
          [technologyIds]
        );

        yamlObj.technology = {};
        for (const tech of technologies.rows) {
          yamlObj.technology[tech.key] = {
            name: tech.name_label,
            ...(tech.knowledge_cost && { knowledgeCost: tech.knowledge_cost }),
          };
        }
      }

      const yamlString = yaml.dump(yamlObj, {
        indent: 2,
        lineWidth: -1,
        quotingType: '"',
      });

      return { success: true, yaml: yamlString };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async exportEntitiesAsYAML(entities: {
    resources?: any[];
    buildings?: any[];
    technologies?: any[];
  }): Promise<{ success: boolean; yaml?: string; error?: string }> {
    try {
      const yamlObj: any = {};

      if (entities.resources && entities.resources.length > 0) {
        yamlObj.resource = {};
        for (const res of entities.resources) {
          yamlObj.resource[res.key] = {
            color: res.color,
            materialType: res.material_type || 'Placeholder',
            name: res.name_label,
            prefabName: res.prefab_name,
            ...(res.show_in_scanner && { showInScannerLens: res.show_in_scanner }),
          };
        }
      }

      if (entities.buildings && entities.buildings.length > 0) {
        yamlObj.building = {};
        for (const bld of entities.buildings) {
          yamlObj.building[bld.key] = {
            name: bld.name_label,
            categoryType: bld.category_key ? { _ref: bld.category_key } : undefined,
            prefabName: bld.prefab_name,
            ...(bld.output_resource && { outputResource: { _ref: bld.output_resource } }),
            ...(bld.output_quantity && { outputQuantity: bld.output_quantity }),
            ...(bld.power_consumption && { powerConsumption: bld.power_consumption }),
            ...(bld.health && { health: bld.health }),
            ...(bld.drone_capacity && { droneCapacity: bld.drone_capacity }),
          };
        }
      }

      if (entities.technologies && entities.technologies.length > 0) {
        yamlObj.technology = {};
        for (const tech of entities.technologies) {
          yamlObj.technology[tech.key] = {
            name: tech.name_label,
            ...(tech.knowledge_cost && { knowledgeCost: tech.knowledge_cost }),
          };
        }
      }

      const yamlString = yaml.dump(yamlObj, {
        indent: 2,
        lineWidth: -1,
        quotingType: '"',
      });

      return { success: true, yaml: yamlString };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async getModStats(modId: string): Promise<{
    success: boolean;
    stats?: { resources: number; buildings: number; technologies: number };
    error?: string;
  }> {
    try {
      const result = await this.pool.query(
        `SELECT
          array_length(resource_ids, 1) as resource_count,
          array_length(building_ids, 1) as building_count,
          array_length(technology_ids, 1) as technology_count
         FROM mods WHERE id = $1`,
        [modId]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Mod not found' };
      }

      return {
        success: true,
        stats: {
          resources: result.rows[0].resource_count || 0,
          buildings: result.rows[0].building_count || 0,
          technologies: result.rows[0].technology_count || 0,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
