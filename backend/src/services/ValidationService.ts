import { Pool } from 'pg';

export interface ValidationRule {
  rule_id: string;
  name: string;
  severity: 'error' | 'warning' | 'info';
  description: string;
  check: (data: any) => boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  infos: ValidationMessage[];
  summary: {
    total_checks: number;
    passed: number;
    failed: number;
    error_count: number;
    warning_count: number;
  };
}

export interface ValidationMessage {
  rule_id: string;
  severity: 'error' | 'warning' | 'info';
  entity_type: string;
  entity_id?: number;
  entity_key?: string;
  message: string;
  suggestion?: string;
}

export class ValidationService {
  private rules: ValidationRule[] = [];

  constructor(private pool: Pool) {
    this._initializeRules();
  }

  /**
   * Validate a single resource
   */
  async validateResource(resource: any): Promise<ValidationMessage[]> {
    const messages: ValidationMessage[] = [];

    for (const rule of this.rules.filter(r => r.rule_id.startsWith('RES'))) {
      try {
        if (!rule.check(resource)) {
          messages.push({
            rule_id: rule.rule_id,
            severity: rule.severity,
            entity_type: 'resource',
            entity_key: resource.key,
            message: rule.description,
            suggestion: this._getSuggestion(rule.rule_id, resource)
          });
        }
      } catch (err: any) {
        messages.push({
          rule_id: rule.rule_id,
          severity: 'warning',
          entity_type: 'resource',
          entity_key: resource.key,
          message: `Validation check failed: ${err.message}`
        });
      }
    }

    return messages;
  }

  /**
   * Validate a single building
   */
  async validateBuilding(building: any): Promise<ValidationMessage[]> {
    const messages: ValidationMessage[] = [];

    for (const rule of this.rules.filter(r => r.rule_id.startsWith('BLD'))) {
      try {
        if (!rule.check(building)) {
          messages.push({
            rule_id: rule.rule_id,
            severity: rule.severity,
            entity_type: 'building',
            entity_key: building.key,
            message: rule.description,
            suggestion: this._getSuggestion(rule.rule_id, building)
          });
        }
      } catch (err: any) {
        messages.push({
          rule_id: rule.rule_id,
          severity: 'warning',
          entity_type: 'building',
          entity_key: building.key,
          message: `Validation check failed: ${err.message}`
        });
      }
    }

    return messages;
  }

  /**
   * Validate a complete mod composition
   */
  async validateComposition(stackId: string): Promise<ValidationResult> {
    // Get stack info
    const stackResult = await this.pool.query(
      'SELECT * FROM mod_stacks WHERE stack_id = $1',
      [stackId]
    );

    if (stackResult.rows.length === 0) {
      return {
        valid: false,
        errors: [{
          rule_id: 'COMP_001',
          severity: 'error',
          entity_type: 'stack',
          message: `Stack "${stackId}" not found`
        }],
        warnings: [],
        infos: [],
        summary: {
          total_checks: 0,
          passed: 0,
          failed: 1,
          error_count: 1,
          warning_count: 0
        }
      };
    }

    const stack = stackResult.rows[0];
    const messages: ValidationMessage[] = [];

    // Validate dependencies
    const depMessages = await this._validateDependencies(stack.mod_ids);
    messages.push(...depMessages);

    // Validate resources
    const resMessages = await this._validateResources(stack.mod_ids);
    messages.push(...resMessages);

    // Validate buildings
    const bldMessages = await this._validateBuildings(stack.mod_ids);
    messages.push(...bldMessages);

    // Validate cross-references
    const refMessages = await this._validateCrossReferences(stack.mod_ids);
    messages.push(...refMessages);

    // Separate by severity
    const errors = messages.filter(m => m.severity === 'error');
    const warnings = messages.filter(m => m.severity === 'warning');
    const infos = messages.filter(m => m.severity === 'info');

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      infos,
      summary: {
        total_checks: messages.length,
        passed: 0,
        failed: messages.length,
        error_count: errors.length,
        warning_count: warnings.length
      }
    };
  }

  /**
   * Generate validation report
   */
  generateReport(result: ValidationResult): string {
    const lines: string[] = [
      '═══════════════════════════════════════',
      '  VALIDATION REPORT',
      '═══════════════════════════════════════',
      '',
      `Status: ${result.valid ? '✅ VALID' : '❌ INVALID'}`,
      '',
      `Errors:   ${result.errors.length}`,
      `Warnings: ${result.warnings.length}`,
      `Infos:    ${result.infos.length}`,
      ''
    ];

    if (result.errors.length > 0) {
      lines.push('❌ ERRORS:');
      result.errors.forEach(e => {
        lines.push(`  [${e.rule_id}] ${e.entity_type}: ${e.message}`);
        if (e.suggestion) lines.push(`    → ${e.suggestion}`);
      });
      lines.push('');
    }

    if (result.warnings.length > 0) {
      lines.push('⚠️  WARNINGS:');
      result.warnings.forEach(w => {
        lines.push(`  [${w.rule_id}] ${w.entity_type}: ${w.message}`);
        if (w.suggestion) lines.push(`    → ${w.suggestion}`);
      });
      lines.push('');
    }

    if (result.infos.length > 0) {
      lines.push('ℹ️  INFOS:');
      result.infos.forEach(i => {
        lines.push(`  [${i.rule_id}] ${i.message}`);
      });
      lines.push('');
    }

    lines.push('═══════════════════════════════════════');
    return lines.join('\n');
  }

  // ====== Private methods ======

  private _initializeRules(): void {
    this.rules = [
      // Resource validation rules
      {
        rule_id: 'RES_001',
        name: 'Key format',
        severity: 'error',
        description: 'Resource key must match format resource_*',
        check: (r: any) => /^resource_[a-z0-9_]+$/.test(r.key)
      },
      {
        rule_id: 'RES_002',
        name: 'Color format',
        severity: 'error',
        description: 'Color must be 6-character hex (e.g., C0C0C0)',
        check: (r: any) => /^[0-9A-F]{6}$/.test(r.color)
      },
      {
        rule_id: 'RES_003',
        name: 'Material type',
        severity: 'error',
        description: 'Material type must be Mined, Manufactured, Released, or Placeholder',
        check: (r: any) => ['Mined', 'Manufactured', 'Released', 'Placeholder'].includes(r.material_type)
      },
      {
        rule_id: 'RES_004',
        name: 'Name label',
        severity: 'warning',
        description: 'Name label should start with BE_ for localization',
        check: (r: any) => r.name_label && (r.name_label.startsWith('BE_') || r.name_label.startsWith('TXT_'))
      },
      {
        rule_id: 'RES_005',
        name: 'Prefab name',
        severity: 'error',
        description: 'Prefab name is required and non-empty',
        check: (r: any) => r.prefab_name && r.prefab_name.length > 0
      },

      // Building validation rules
      {
        rule_id: 'BLD_001',
        name: 'Key format',
        severity: 'error',
        description: 'Building key must match format building_*',
        check: (b: any) => /^building_[a-z0-9_]+$/.test(b.key)
      },
      {
        rule_id: 'BLD_002',
        name: 'Category required',
        severity: 'error',
        description: 'Building must have a category',
        check: (b: any) => b.category_key && b.category_key.length > 0
      },
      {
        rule_id: 'BLD_003',
        name: 'Prefab name',
        severity: 'error',
        description: 'Prefab name is required',
        check: (b: any) => b.prefab_name && b.prefab_name.length > 0
      },
      {
        rule_id: 'BLD_004',
        name: 'Power consumption',
        severity: 'warning',
        description: 'Power consumption should be 0 or positive',
        check: (b: any) => (b.power_consumption === undefined || b.power_consumption >= 0)
      },
      {
        rule_id: 'BLD_005',
        name: 'Health value',
        severity: 'warning',
        description: 'Health should be positive (> 0)',
        check: (b: any) => (b.health === undefined || b.health > 0)
      },
      {
        rule_id: 'BLD_006',
        name: 'Output quantity',
        severity: 'info',
        description: 'Output quantity should be 0 or positive',
        check: (b: any) => (b.output_quantity === undefined || b.output_quantity >= 0)
      }
    ];
  }

  private async _validateDependencies(modIds: string[]): Promise<ValidationMessage[]> {
    const messages: ValidationMessage[] = [];

    for (const modId of modIds) {
      const result = await this.pool.query(
        'SELECT depends_on_mod_id FROM mod_dependencies WHERE mod_id = $1',
        [modId]
      );

      for (const dep of result.rows) {
        if (!modIds.includes(dep.depends_on_mod_id) && dep.depends_on_mod_id !== 'official') {
          messages.push({
            rule_id: 'DEP_001',
            severity: 'error',
            entity_type: 'mod',
            entity_key: modId,
            message: `Mod "${modId}" depends on "${dep.depends_on_mod_id}" which is not in the stack`,
            suggestion: `Add "${dep.depends_on_mod_id}" to the mod stack`
          });
        }
      }
    }

    return messages;
  }

  private async _validateResources(modIds: string[]): Promise<ValidationMessage[]> {
    const messages: ValidationMessage[] = [];

    for (const modId of modIds) {
      const result = await this.pool.query(
        'SELECT * FROM resources WHERE mod_id = $1',
        [modId]
      );

      for (const resource of result.rows) {
        const resMessages = await this.validateResource(resource);
        messages.push(...resMessages);
      }
    }

    return messages;
  }

  private async _validateBuildings(modIds: string[]): Promise<ValidationMessage[]> {
    const messages: ValidationMessage[] = [];

    for (const modId of modIds) {
      const result = await this.pool.query(
        'SELECT * FROM buildings WHERE mod_id = $1',
        [modId]
      );

      for (const building of result.rows) {
        const bldMessages = await this.validateBuilding(building);
        messages.push(...bldMessages);
      }
    }

    return messages;
  }

  private async _validateCrossReferences(modIds: string[]): Promise<ValidationMessage[]> {
    const messages: ValidationMessage[] = [];

    // Check that output resources exist
    const bldResult = await this.pool.query(
      `SELECT DISTINCT output_resource FROM buildings
       WHERE mod_id = ANY($1) AND output_resource IS NOT NULL`,
      [modIds]
    );

    for (const row of bldResult.rows) {
      const resourceExists = await this.pool.query(
        'SELECT id FROM resources WHERE key = $1',
        [row.output_resource]
      );

      if (resourceExists.rows.length === 0) {
        messages.push({
          rule_id: 'REF_001',
          severity: 'error',
          entity_type: 'building',
          message: `Building references unknown resource "${row.output_resource}"`,
          suggestion: `Create resource "${row.output_resource}" or update building references`
        });
      }
    }

    return messages;
  }

  private _getSuggestion(ruleId: string, entity: any): string {
    const suggestions: { [key: string]: string } = {
      'RES_001': `Rename to "resource_${entity.key.toLowerCase().replace(/[^a-z0-9_]/g, '_')}"`,
      'RES_002': 'Use a 6-character hex color code',
      'RES_003': `Set to one of: Mined, Manufactured, Released, Placeholder`,
      'RES_004': `Rename label to "BE_${entity.key}"`,
      'BLD_001': `Rename to "building_${entity.key.toLowerCase().replace(/[^a-z0-9_]/g, '_')}"`,
      'BLD_002': 'Select a building category',
      'BLD_004': 'Set power_consumption to 0 or higher',
      'BLD_005': 'Set health to a positive value'
    };

    return suggestions[ruleId] || '';
  }
}
