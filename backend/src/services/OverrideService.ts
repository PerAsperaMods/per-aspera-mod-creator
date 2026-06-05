import { Pool } from 'pg';
import { IResource, IBuilding } from '../types';

export class OverrideService {
  constructor(private pool: Pool) {}

  /**
   * Check if a resource is official (read-only)
   */
  async isOfficialResource(resourceId: number): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT is_official, is_locked FROM resources WHERE id = $1',
      [resourceId]
    );
    return result.rows[0]?.is_official || result.rows[0]?.is_locked;
  }

  /**
   * Check if a building is official (read-only)
   */
  async isOfficialBuilding(buildingId: number): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT is_official, is_locked FROM buildings WHERE id = $1',
      [buildingId]
    );
    return result.rows[0]?.is_official || result.rows[0]?.is_locked;
  }

  /**
   * Prevent edit/delete of official resources
   */
  validateEditAllowed(resource: any): { allowed: boolean; error?: string } {
    if (resource.is_official || resource.is_locked) {
      return {
        allowed: false,
        error: `Cannot modify official resource "${resource.key}". Create an override instead.`
      };
    }
    return { allowed: true };
  }

  /**
   * Get all overrides for a resource
   */
  async getResourceOverrides(resourceId: number): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT id, key, name_label, color, mod_id, created_at
       FROM resources
       WHERE override_of_id = $1
       ORDER BY created_at DESC`,
      [resourceId]
    );
    return result.rows;
  }

  /**
   * Get resource with all its overrides
   */
  async getResourceWithOverrides(resourceId: number): Promise<any> {
    const base = await this.pool.query(
      'SELECT * FROM resources WHERE id = $1',
      [resourceId]
    );

    if (base.rows.length === 0) {
      return null;
    }

    const overrides = await this.getResourceOverrides(resourceId);

    return {
      ...base.rows[0],
      overrides
    };
  }

  /**
   * Get the resolved resource (after all overrides applied)
   */
  async getResolvedResource(resourceId: number): Promise<any> {
    const result = await this.pool.query(
      `WITH RECURSIVE resolution AS (
        SELECT id, key, name_label, color, material_type, prefab_name,
               icon_name, show_in_scanner, override_of_id, mod_id, created_at,
               ARRAY[id] as path
        FROM resources
        WHERE id = $1

        UNION ALL

        SELECT r.id, r.key, r.name_label, r.color, r.material_type, r.prefab_name,
               r.icon_name, r.show_in_scanner, r.override_of_id, r.mod_id, r.created_at,
               resolution.path || r.id
        FROM resources r
        JOIN resolution ON r.id = resolution.override_of_id
        WHERE NOT r.id = ANY(resolution.path)  -- Prevent cycles
      )
      SELECT * FROM resolution
      ORDER BY override_of_id DESC NULLS FIRST
      LIMIT 1`,
      [resourceId]
    );

    return result.rows[0] || null;
  }

  /**
   * List all resources (official + custom)
   */
  async listResourcesByScope(): Promise<{
    official: any[];
    custom: any[];
  }> {
    const [official, custom] = await Promise.all([
      this.pool.query(
        `SELECT id, key, name_label, color, material_type, prefab_name, mod_id, is_locked
         FROM resources
         WHERE is_official = true OR is_locked = true
         ORDER BY key`
      ),
      this.pool.query(
        `SELECT id, key, name_label, color, material_type, prefab_name, mod_id, override_of_id
         FROM resources
         WHERE (is_official = false OR is_official IS NULL) AND (is_locked = false OR is_locked IS NULL)
         ORDER BY mod_id, key`
      )
    ]);

    return {
      official: official.rows,
      custom: custom.rows
    };
  }

  /**
   * List all buildings (official + custom)
   */
  async listBuildingsByScope(): Promise<{
    official: any[];
    custom: any[];
  }> {
    const [official, custom] = await Promise.all([
      this.pool.query(
        `SELECT id, key, name_label, category_key, prefab_name, mod_id, is_locked
         FROM buildings
         WHERE is_official = true OR is_locked = true
         ORDER BY key`
      ),
      this.pool.query(
        `SELECT id, key, name_label, category_key, prefab_name, mod_id, override_of_id
         FROM buildings
         WHERE (is_official = false OR is_official IS NULL) AND (is_locked = false OR is_locked IS NULL)
         ORDER BY mod_id, key`
      )
    ]);

    return {
      official: official.rows,
      custom: custom.rows
    };
  }

  /**
   * Get mod's custom resources only
   */
  async getModResources(modId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM resources WHERE mod_id = $1 ORDER BY key`,
      [modId]
    );
    return result.rows;
  }

  /**
   * Validate override chain (no cycles)
   */
  async validateOverrideChain(resourceId: number): Promise<{
    valid: boolean;
    error?: string;
    chain?: number[];
  }> {
    const visited = new Set<number>();
    let current = resourceId;
    const chain: number[] = [];

    while (current !== null && current !== undefined) {
      if (visited.has(current)) {
        return {
          valid: false,
          error: `Circular override detected: ${chain.join(' → ')} → ${current}`,
          chain
        };
      }

      visited.add(current);
      chain.push(current);

      const result = await this.pool.query(
        'SELECT override_of_id FROM resources WHERE id = $1',
        [current]
      );

      if (result.rows.length === 0) {
        return { valid: false, error: `Resource ${current} not found` };
      }

      current = result.rows[0].override_of_id;
    }

    return { valid: true, chain };
  }
}
