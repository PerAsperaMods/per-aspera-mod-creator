import { Pool } from 'pg';

export interface ModStack {
  stack_id: string;
  mod_ids: string[];
  resolution_order: string[];
  resolved_resources: any[];
  conflicts: any[];
}

export interface Conflict {
  entity_type: string;
  entity_id: number;
  conflict_type: string;
  mods: string[];
  description: string;
  severity: 'error' | 'warning' | 'info';
}

export class CompositionService {
  constructor(private pool: Pool) {}

  /**
   * Resolve mod dependencies and build resolution order
   * Applies mods in order, with later mods overriding earlier ones
   */
  async resolveModOrder(modIds: string[]): Promise<string[]> {
    // Start with 'official' base
    const order: string[] = ['official'];
    const processed = new Set(['official']);

    // Topological sort to handle dependencies
    for (const modId of modIds) {
      await this._addModWithDependencies(modId, order, processed);
    }

    return order;
  }

  /**
   * Compose multiple mods into a single mod stack
   */
  async composeModStack(
    stackId: string,
    modIds: string[]
  ): Promise<ModStack> {
    // Resolve order
    const order = await this.resolveModOrder(modIds);

    // Detect conflicts
    const conflicts = await this._detectConflicts(order);

    // Resolve resources
    const resources = await this._resolveResources(order);

    // Save stack to database
    await this.pool.query(
      `INSERT INTO mod_stacks (stack_id, mod_ids, resolution_order)
       VALUES ($1, $2, $3)
       ON CONFLICT (stack_id) DO UPDATE SET
       mod_ids = $2, resolution_order = $3`,
      [stackId, modIds, order]
    );

    return {
      stack_id: stackId,
      mod_ids: modIds,
      resolution_order: order,
      resolved_resources: resources,
      conflicts
    };
  }

  /**
   * Get resolved resources for a mod stack
   */
  async getResolvedResources(stackId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT resource_id, original_resource_id, applied_mods, final_definition
       FROM resolved_resources
       WHERE stack_id = $1
       ORDER BY resource_id`,
      [stackId]
    );
    return result.rows;
  }

  /**
   * Get conflicts for a mod stack
   */
  async getConflicts(stackId: string): Promise<Conflict[]> {
    const result = await this.pool.query(
      `SELECT entity_type, entity_id, conflict_type, mod_a, mod_b,
              description, severity
       FROM mod_conflicts
       WHERE stack_id = $1
       ORDER BY severity DESC, entity_type, entity_id`,
      [stackId]
    );

    return result.rows.map(row => ({
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      conflict_type: row.conflict_type,
      mods: [row.mod_a, row.mod_b],
      description: row.description,
      severity: row.severity
    }));
  }

  /**
   * Register a mod with metadata
   */
  async registerMod(
    modId: string,
    name: string,
    description?: string,
    version?: string,
    author?: string,
    dependencies?: string[]
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO mods_metadata (mod_id, name, description, version, author, dependencies)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (mod_id) DO UPDATE SET
       name = $2, description = $3, version = $4, author = $5, dependencies = $6`,
      [modId, name, description, version, author, dependencies || []]
    );
  }

  /**
   * Get mod metadata
   */
  async getModMetadata(modId: string): Promise<any> {
    const result = await this.pool.query(
      'SELECT * FROM mods_metadata WHERE mod_id = $1',
      [modId]
    );
    return result.rows[0];
  }

  /**
   * List all registered mods
   */
  async listMods(): Promise<any[]> {
    const result = await this.pool.query(
      'SELECT * FROM mods_metadata ORDER BY is_official DESC, priority DESC, created_at DESC'
    );
    return result.rows;
  }

  /**
   * Check if two mods conflict
   */
  async checkModConflict(modA: string, modB: string): Promise<Conflict[]> {
    // Get all resources modified by each mod
    const [resA, resB] = await Promise.all([
      this.pool.query(
        `SELECT DISTINCT override_of_id FROM resources
         WHERE mod_id = $1 AND override_of_id IS NOT NULL`,
        [modA]
      ),
      this.pool.query(
        `SELECT DISTINCT override_of_id FROM resources
         WHERE mod_id = $1 AND override_of_id IS NOT NULL`,
        [modB]
      )
    ]);

    const setA = new Set(resA.rows.map(r => r.override_of_id));
    const setB = new Set(resB.rows.map(r => r.override_of_id));

    // Find overlaps
    const conflicts: Conflict[] = [];
    for (const resourceId of setA) {
      if (setB.has(resourceId)) {
        conflicts.push({
          entity_type: 'resource',
          entity_id: resourceId,
          conflict_type: 'override',
          mods: [modA, modB],
          description: `Both mods override resource #${resourceId}`,
          severity: 'warning'
        });
      }
    }

    return conflicts;
  }

  /**
   * Validate a mod stack (check for errors)
   */
  async validateStack(stackId: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const conflicts = await this.getConflicts(stackId);

    const errors = conflicts
      .filter(c => c.severity === 'error')
      .map(c => c.description);

    const warnings = conflicts
      .filter(c => c.severity === 'warning')
      .map(c => c.description);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ====== Private methods ======

  private async _addModWithDependencies(
    modId: string,
    order: string[],
    processed: Set<string>
  ): Promise<void> {
    if (processed.has(modId)) return;

    // Get mod's dependencies
    const deps = await this.pool.query(
      'SELECT depends_on_mod_id FROM mod_dependencies WHERE mod_id = $1',
      [modId]
    );

    // Add dependencies first
    for (const dep of deps.rows) {
      await this._addModWithDependencies(dep.depends_on_mod_id, order, processed);
    }

    // Add the mod itself
    order.push(modId);
    processed.add(modId);
  }

  private async _detectConflicts(order: string[]): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    // Check each pair of consecutive mods
    for (let i = 0; i < order.length - 1; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const pairConflicts = await this.checkModConflict(order[i], order[j]);
        conflicts.push(...pairConflicts);
      }
    }

    return conflicts;
  }

  private async _resolveResources(order: string[]): Promise<any[]> {
    // Get all resources in resolution order
    const resources = new Map();

    for (const modId of order) {
      // Get all resources for this mod
      const result = await this.pool.query(
        `SELECT id, key, override_of_id, color, name_label, material_type, prefab_name
         FROM resources
         WHERE mod_id = $1 OR (mod_id IS NULL AND $1 = 'official')
         ORDER BY id`,
        [modId === 'official' ? null : modId]
      );

      for (const resource of result.rows) {
        // Track which mods have touched this resource
        const resourceKey = resource.override_of_id || resource.id;

        if (!resources.has(resourceKey)) {
          resources.set(resourceKey, {
            id: resource.id,
            key: resource.key,
            original_id: resource.id,
            applied_mods: [],
            definition: resource
          });
        }

        const item = resources.get(resourceKey);
        item.applied_mods.push(modId);
        item.definition = resource; // Latest override wins
      }
    }

    return Array.from(resources.values());
  }
}
