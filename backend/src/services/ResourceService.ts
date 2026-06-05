import pool from '../config/database';
import { IResource, CreateResourceRequest, UpdateResourceRequest, ResourceYAML } from '../types/Resource';

export class ResourceService {
  /**
   * Get all resources
   */
  async getAllResources(): Promise<IResource[]> {
    const query = 'SELECT * FROM resources ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get resource by ID
   */
  async getResourceById(id: number): Promise<IResource | null> {
    const query = 'SELECT * FROM resources WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get resource by key
   */
  async getResourceByKey(key: string): Promise<IResource | null> {
    const query = 'SELECT * FROM resources WHERE key = $1';
    const result = await pool.query(query, [key]);
    return result.rows[0] || null;
  }

  /**
   * Create resource
   */
  async createResource(data: CreateResourceRequest): Promise<IResource> {
    // Check if key already exists
    const existing = await this.getResourceByKey(data.key);
    if (existing) {
      throw new Error(`Resource with key "${data.key}" already exists`);
    }

    const query = `
      INSERT INTO resources (
        key, color, material_type, name_label, prefab_name,
        icon_name, cube_material, knowledge_ref, show_in_scanner, vein_icons
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      data.key,
      data.color,
      data.material_type,
      data.name_label,
      data.prefab_name,
      data.icon_name || null,
      data.cube_material || null,
      data.knowledge_ref || null,
      data.show_in_scanner ?? true,
      data.vein_icons ? JSON.stringify(data.vein_icons) : null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Update resource
   */
  async updateResource(id: number, data: UpdateResourceRequest): Promise<IResource> {
    const resource = await this.getResourceById(id);
    if (!resource) {
      throw new Error(`Resource with id ${id} not found`);
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (data.color !== undefined) {
      updates.push(`color = $${paramCount++}`);
      values.push(data.color);
    }
    if (data.material_type !== undefined) {
      updates.push(`material_type = $${paramCount++}`);
      values.push(data.material_type);
    }
    if (data.name_label !== undefined) {
      updates.push(`name_label = $${paramCount++}`);
      values.push(data.name_label);
    }
    if (data.prefab_name !== undefined) {
      updates.push(`prefab_name = $${paramCount++}`);
      values.push(data.prefab_name);
    }
    if (data.icon_name !== undefined) {
      updates.push(`icon_name = $${paramCount++}`);
      values.push(data.icon_name || null);
    }
    if (data.cube_material !== undefined) {
      updates.push(`cube_material = $${paramCount++}`);
      values.push(data.cube_material || null);
    }
    if (data.knowledge_ref !== undefined) {
      updates.push(`knowledge_ref = $${paramCount++}`);
      values.push(data.knowledge_ref || null);
    }
    if (data.show_in_scanner !== undefined) {
      updates.push(`show_in_scanner = $${paramCount++}`);
      values.push(data.show_in_scanner);
    }
    if (data.vein_icons !== undefined) {
      updates.push(`vein_icons = $${paramCount++}`);
      values.push(data.vein_icons ? JSON.stringify(data.vein_icons) : null);
    }

    if (updates.length === 0) {
      return resource;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE resources SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete resource
   */
  async deleteResource(id: number): Promise<void> {
    const resource = await this.getResourceById(id);
    if (!resource) {
      throw new Error(`Resource with id ${id} not found`);
    }

    const query = 'DELETE FROM resources WHERE id = $1';
    await pool.query(query, [id]);
  }

  /**
   * Generate YAML for a single resource
   */
  generateResourceYAML(resource: IResource): ResourceYAML {
    const yaml: ResourceYAML = {};

    yaml[resource.key] = {
      color: resource.color,
      materialType: resource.material_type,
      name: resource.name_label,
      prefabName: resource.prefab_name,
      showInScannerLens: resource.show_in_scanner,
    };

    // Add optional fields
    if (resource.icon_name) {
      yaml[resource.key].iconName = resource.icon_name;
    }
    if (resource.cube_material) {
      yaml[resource.key].cubeMaterial = resource.cube_material;
    }
    if (resource.knowledge_ref) {
      yaml[resource.key].knowledge = {
        _ref: resource.knowledge_ref,
      };
    }
    if (resource.vein_icons && resource.vein_icons.length > 0) {
      yaml[resource.key].veinIcons = resource.vein_icons;
    }
    if (resource.resource_index !== null && resource.resource_index !== undefined) {
      yaml[resource.key].index = resource.resource_index;
    }

    return yaml;
  }

  /**
   * Generate YAML for all resources
   */
  async generateAllResourcesYAML(): Promise<ResourceYAML> {
    const resources = await this.getAllResources();
    const yaml: ResourceYAML = {};

    resources.forEach((resource) => {
      Object.assign(yaml, this.generateResourceYAML(resource));
    });

    return yaml;
  }

  /**
   * Validate resource data
   */
  validateResource(data: CreateResourceRequest | UpdateResourceRequest): string[] {
    const errors: string[] = [];

    if ('key' in data && !data.key) {
      errors.push('Resource key is required');
    }
    if ('key' in data && data.key && !/^[a-z_]+$/.test(data.key)) {
      errors.push('Resource key must be lowercase with underscores only');
    }

    if ('color' in data && !data.color) {
      errors.push('Color is required');
    }
    if ('color' in data && data.color && !/^[A-F0-9]{6}$/.test(data.color)) {
      errors.push('Color must be a valid hex code (6 characters, uppercase)');
    }

    if ('material_type' in data && !data.material_type) {
      errors.push('Material type is required');
    }
    const validTypes = ['Mined', 'Manufactured', 'Released', 'Placeholder'];
    if ('material_type' in data && data.material_type && !validTypes.includes(data.material_type)) {
      errors.push(`Material type must be one of: ${validTypes.join(', ')}`);
    }

    if ('name_label' in data && !data.name_label) {
      errors.push('Name label is required');
    }

    if ('prefab_name' in data && !data.prefab_name) {
      errors.push('Prefab name is required');
    }

    return errors;
  }
}

export default new ResourceService();
