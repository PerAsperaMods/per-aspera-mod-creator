import pool from '../config/database';
import { IBuilding, CreateBuildingRequest, UpdateBuildingRequest, BuildingYAML, ResourceEntry } from '../types/Building';
import resourceService from './ResourceService';

export class BuildingService {
  /**
   * Get all buildings
   */
  async getAllBuildings(): Promise<IBuilding[]> {
    const query = 'SELECT * FROM buildings ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows.map(this.parseBuilding);
  }

  /**
   * Get building by ID
   */
  async getBuildingById(id: number): Promise<IBuilding | null> {
    const query = 'SELECT * FROM buildings WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.parseBuilding(result.rows[0]) : null;
  }

  /**
   * Get building by key
   */
  async getBuildingByKey(key: string): Promise<IBuilding | null> {
    const query = 'SELECT * FROM buildings WHERE key = $1';
    const result = await pool.query(query, [key]);
    return result.rows[0] ? this.parseBuilding(result.rows[0]) : null;
  }

  /**
   * Create building
   */
  async createBuilding(data: CreateBuildingRequest): Promise<IBuilding> {
    // Check if key already exists
    const existing = await this.getBuildingByKey(data.key);
    if (existing) {
      throw new Error(`Building with key "${data.key}" already exists`);
    }

    // Validate cross-references
    const errors = await this.validateBuildingReferences(data);
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join('; ')}`);
    }

    const query = `
      INSERT INTO buildings (
        key, name_label, description_label, category_key, prefab_name,
        compact_name, output_resource, output_quantity, input_resources,
        required_resource_vein, power_consumption, power_priority, health,
        health_loss_per_day, progress_per_day, drone_capacity, is_worker_hub,
        required_construction_resources, rubble_prefab_name, icon_name,
        rival_icon_name, empty_hub_icon_name, progress_bar_names,
        extraction_level, reserved_radius, way_snap_radius, knowledge_ref
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      )
      RETURNING *
    `;

    const values = [
      data.key,
      data.name_label,
      data.description_label || null,
      data.category_key,
      data.prefab_name,
      data.compact_name || null,
      data.output_resource || null,
      data.output_quantity || null,
      data.input_resources ? JSON.stringify(data.input_resources) : null,
      data.required_resource_vein || null,
      data.power_consumption || null,
      data.power_priority || null,
      data.health || 100,
      data.health_loss_per_day || null,
      data.progress_per_day || null,
      data.drone_capacity || null,
      data.is_worker_hub || false,
      data.required_construction_resources ? JSON.stringify(data.required_construction_resources) : null,
      data.rubble_prefab_name || null,
      data.icon_name || null,
      data.rival_icon_name || null,
      data.empty_hub_icon_name || null,
      data.progress_bar_names ? JSON.stringify(data.progress_bar_names) : null,
      data.extraction_level || null,
      data.reserved_radius || null,
      data.way_snap_radius || null,
      data.knowledge_ref || null,
    ];

    const result = await pool.query(query, values);
    return this.parseBuilding(result.rows[0]);
  }

  /**
   * Update building
   */
  async updateBuilding(id: number, data: UpdateBuildingRequest): Promise<IBuilding> {
    const building = await this.getBuildingById(id);
    if (!building) {
      throw new Error(`Building with id ${id} not found`);
    }

    // Validate cross-references
    const errors = await this.validateBuildingReferences(data);
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join('; ')}`);
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    const fieldMap: Record<string, string> = {
      name_label: 'name_label',
      description_label: 'description_label',
      category_key: 'category_key',
      prefab_name: 'prefab_name',
      compact_name: 'compact_name',
      output_resource: 'output_resource',
      output_quantity: 'output_quantity',
      input_resources: 'input_resources',
      required_resource_vein: 'required_resource_vein',
      power_consumption: 'power_consumption',
      power_priority: 'power_priority',
      health: 'health',
      health_loss_per_day: 'health_loss_per_day',
      progress_per_day: 'progress_per_day',
      drone_capacity: 'drone_capacity',
      is_worker_hub: 'is_worker_hub',
      required_construction_resources: 'required_construction_resources',
      rubble_prefab_name: 'rubble_prefab_name',
      icon_name: 'icon_name',
      rival_icon_name: 'rival_icon_name',
      empty_hub_icon_name: 'empty_hub_icon_name',
      progress_bar_names: 'progress_bar_names',
      extraction_level: 'extraction_level',
      reserved_radius: 'reserved_radius',
      way_snap_radius: 'way_snap_radius',
      knowledge_ref: 'knowledge_ref',
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (key in data) {
        const value = data[key as keyof UpdateBuildingRequest];
        updates.push(`${dbField} = $${paramCount++}`);

        if (typeof value === 'object' && value !== null) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value || null);
        }
      }
    }

    if (updates.length === 0) {
      return building;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE buildings SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return this.parseBuilding(result.rows[0]);
  }

  /**
   * Delete building
   */
  async deleteBuilding(id: number): Promise<void> {
    const building = await this.getBuildingById(id);
    if (!building) {
      throw new Error(`Building with id ${id} not found`);
    }

    const query = 'DELETE FROM buildings WHERE id = $1';
    await pool.query(query, [id]);
  }

  /**
   * Validate building references (resources, knowledge, etc.)
   */
  private async validateBuildingReferences(data: CreateBuildingRequest | UpdateBuildingRequest): Promise<string[]> {
    const errors: string[] = [];

    // Validate output resource
    if (data.output_resource) {
      const resource = await resourceService.getResourceByKey(data.output_resource);
      if (!resource) {
        errors.push(`Output resource "${data.output_resource}" not found`);
      }
    }

    // Validate input resources
    if (data.input_resources) {
      for (const [resourceKey] of Object.entries(data.input_resources)) {
        const resource = await resourceService.getResourceByKey(resourceKey);
        if (!resource) {
          errors.push(`Input resource "${resourceKey}" not found`);
        }
      }
    }

    // Validate required vein
    if (data.required_resource_vein) {
      const resource = await resourceService.getResourceByKey(data.required_resource_vein);
      if (!resource) {
        errors.push(`Required vein resource "${data.required_resource_vein}" not found`);
      }
    }

    // Validate construction resources
    if (data.required_construction_resources) {
      for (const [resourceKey] of Object.entries(data.required_construction_resources)) {
        const resource = await resourceService.getResourceByKey(resourceKey);
        if (!resource) {
          errors.push(`Construction resource "${resourceKey}" not found`);
        }
      }
    }

    return errors;
  }

  /**
   * Generate YAML for a building
   */
  generateBuildingYAML(building: IBuilding): BuildingYAML {
    const yaml: BuildingYAML = {};

    yaml[building.key] = {
      categoryType: {
        _ref: building.category_key,
      },
      name: building.name_label,
      prefabName: building.prefab_name,
    };

    // Add optional fields
    if (building.compact_name) yaml[building.key].compactName = building.compact_name;
    if (building.description_label) yaml[building.key].description = building.description_label;
    if (building.drone_capacity) yaml[building.key].droneCapacity = building.drone_capacity;
    if (building.health_loss_per_day) yaml[building.key].healthLossPerDay = building.health_loss_per_day;
    if (building.health) yaml[building.key].maxHealth = building.health;
    if (building.power_consumption) yaml[building.key].powerConsumption = building.power_consumption;
    if (building.power_priority) yaml[building.key].powerPriority = building.power_priority;
    if (building.progress_per_day) yaml[building.key].progressPerDay = building.progress_per_day;

    if (building.output_resource) {
      yaml[building.key].outputResource = {
        _ref: building.output_resource,
      };
    }
    if (building.output_quantity) yaml[building.key].outputQuantity = building.output_quantity;

    if (building.input_resources && Object.keys(building.input_resources).length > 0) {
      yaml[building.key].inputResources = building.input_resources;
    }

    if (building.required_resource_vein) {
      yaml[building.key].requiredResourceVein = {
        _ref: building.required_resource_vein,
      };
    }

    if (building.required_construction_resources && Object.keys(building.required_construction_resources).length > 0) {
      yaml[building.key].requiredConstructionResources = building.required_construction_resources;
    }

    if (building.rubble_prefab_name) yaml[building.key].rubblePrefabName = building.rubble_prefab_name;
    if (building.icon_name) yaml[building.key].iconName = building.icon_name;
    if (building.rival_icon_name) yaml[building.key].rivalIconName = building.rival_icon_name;
    if (building.empty_hub_icon_name) yaml[building.key].emptyHubIconName = building.empty_hub_icon_name;
    if (building.progress_bar_names && building.progress_bar_names.length > 0) {
      yaml[building.key].progressBarNames = building.progress_bar_names;
    }

    if (building.extraction_level !== null && building.extraction_level !== undefined) {
      yaml[building.key].extractionLevel = building.extraction_level;
    }
    if (building.reserved_radius) yaml[building.key].reservedRadius = building.reserved_radius;
    if (building.way_snap_radius) yaml[building.key].waySnapRadius = building.way_snap_radius;

    if (building.knowledge_ref) {
      yaml[building.key].knowledge = {
        _ref: building.knowledge_ref,
      };
    }

    if (building.is_worker_hub) yaml[building.key].isWorkerHub = building.is_worker_hub;

    return yaml;
  }

  /**
   * Generate YAML for all buildings
   */
  async generateAllBuildingsYAML(): Promise<BuildingYAML> {
    const buildings = await this.getAllBuildings();
    const yaml: BuildingYAML = {};

    buildings.forEach((building) => {
      Object.assign(yaml, this.generateBuildingYAML(building));
    });

    return yaml;
  }

  /**
   * Validate building data
   */
  validateBuilding(data: CreateBuildingRequest | UpdateBuildingRequest): string[] {
    const errors: string[] = [];

    if ('key' in data && !data.key) {
      errors.push('Building key is required');
    }
    if ('key' in data && data.key && !/^[a-z_]+$/.test(data.key)) {
      errors.push('Building key must be lowercase with underscores only');
    }

    if ('name_label' in data && !data.name_label) {
      errors.push('Name label is required');
    }

    if ('category_key' in data && !data.category_key) {
      errors.push('Category key is required');
    }

    if ('prefab_name' in data && !data.prefab_name) {
      errors.push('Prefab name is required');
    }

    if (data.output_quantity && data.output_quantity < 0) {
      errors.push('Output quantity must be positive');
    }

    if (data.drone_capacity && data.drone_capacity < 0) {
      errors.push('Drone capacity must be positive');
    }

    return errors;
  }

  /**
   * Parse building row from database
   */
  private parseBuilding(row: any): IBuilding {
    return {
      ...row,
      input_resources: row.input_resources ? JSON.parse(row.input_resources) : undefined,
      required_construction_resources: row.required_construction_resources ? JSON.parse(row.required_construction_resources) : undefined,
      progress_bar_names: row.progress_bar_names ? JSON.parse(row.progress_bar_names) : undefined,
    };
  }
}

export default new BuildingService();
