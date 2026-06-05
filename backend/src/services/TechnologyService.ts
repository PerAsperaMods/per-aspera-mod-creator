import pool from '../config/database';
import { ITechnology, CreateTechnologyRequest, UpdateTechnologyRequest, TechnologyYAML } from '../types/Technology';

export class TechnologyService {
  async getAllTechnologies(): Promise<ITechnology[]> {
    const result = await pool.query('SELECT * FROM technologies ORDER BY created_at DESC');
    return result.rows.map(this.parseTechnology);
  }

  async getTechnologyById(id: number): Promise<ITechnology | null> {
    const result = await pool.query('SELECT * FROM technologies WHERE id = $1', [id]);
    return result.rows[0] ? this.parseTechnology(result.rows[0]) : null;
  }

  async getTechnologyByKey(key: string): Promise<ITechnology | null> {
    const result = await pool.query('SELECT * FROM technologies WHERE key = $1', [key]);
    return result.rows[0] ? this.parseTechnology(result.rows[0]) : null;
  }

  async createTechnology(data: CreateTechnologyRequest): Promise<ITechnology> {
    const existing = await this.getTechnologyByKey(data.key);
    if (existing) throw new Error(`Technology with key "${data.key}" already exists`);

    const query = `
      INSERT INTO technologies (key, name_label, knowledge_cost, research_points_cost, required_techs, duration_days, building_unlock, knowledge_ref)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, [
      data.key,
      data.name_label,
      data.knowledge_cost || null,
      data.research_points_cost || null,
      data.required_techs ? JSON.stringify(data.required_techs) : null,
      data.duration_days || null,
      data.building_unlock || null,
      data.knowledge_ref || null,
    ]);
    return this.parseTechnology(result.rows[0]);
  }

  async updateTechnology(id: number, data: UpdateTechnologyRequest): Promise<ITechnology> {
    const tech = await this.getTechnologyById(id);
    if (!tech) throw new Error(`Technology with id ${id} not found`);

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if ('name_label' in data) { updates.push(`name_label = $${paramCount++}`); values.push(data.name_label); }
    if ('knowledge_cost' in data) { updates.push(`knowledge_cost = $${paramCount++}`); values.push(data.knowledge_cost || null); }
    if ('research_points_cost' in data) { updates.push(`research_points_cost = $${paramCount++}`); values.push(data.research_points_cost || null); }
    if ('required_techs' in data) { updates.push(`required_techs = $${paramCount++}`); values.push(data.required_techs ? JSON.stringify(data.required_techs) : null); }
    if ('duration_days' in data) { updates.push(`duration_days = $${paramCount++}`); values.push(data.duration_days || null); }
    if ('building_unlock' in data) { updates.push(`building_unlock = $${paramCount++}`); values.push(data.building_unlock || null); }
    if ('knowledge_ref' in data) { updates.push(`knowledge_ref = $${paramCount++}`); values.push(data.knowledge_ref || null); }

    if (updates.length === 0) return tech;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE technologies SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return this.parseTechnology(result.rows[0]);
  }

  async deleteTechnology(id: number): Promise<void> {
    const tech = await this.getTechnologyById(id);
    if (!tech) throw new Error(`Technology with id ${id} not found`);
    await pool.query('DELETE FROM technologies WHERE id = $1', [id]);
  }

  generateTechnologyYAML(tech: ITechnology): TechnologyYAML {
    const yaml: TechnologyYAML = {};
    yaml[tech.key] = { name: tech.name_label };

    if (tech.knowledge_cost) yaml[tech.key].knowledgeCost = tech.knowledge_cost;
    if (tech.research_points_cost) yaml[tech.key].researchPointsCost = tech.research_points_cost;
    if (tech.required_techs && tech.required_techs.length > 0) {
      yaml[tech.key].requiredTechs = tech.required_techs.map((t) => ({ _ref: t }));
    }
    if (tech.duration_days) yaml[tech.key].durationDays = tech.duration_days;
    if (tech.building_unlock) yaml[tech.key].buildingUnlock = { _ref: tech.building_unlock };
    if (tech.knowledge_ref) yaml[tech.key].knowledge = { _ref: tech.knowledge_ref };

    return yaml;
  }

  async generateAllTechnologiesYAML(): Promise<TechnologyYAML> {
    const techs = await this.getAllTechnologies();
    const yaml: TechnologyYAML = {};
    techs.forEach((t) => Object.assign(yaml, this.generateTechnologyYAML(t)));
    return yaml;
  }

  validateTechnology(data: CreateTechnologyRequest | UpdateTechnologyRequest): string[] {
    const errors: string[] = [];
    if ('key' in data && !data.key) errors.push('Technology key is required');
    if ('key' in data && data.key && !/^[a-z_]+$/.test(data.key)) errors.push('Technology key must be lowercase with underscores only');
    if ('name_label' in data && !data.name_label) errors.push('Name label is required');
    return errors;
  }

  private parseTechnology(row: any): ITechnology {
    return {
      ...row,
      required_techs: this.safeJSONParse(row.required_techs),
    };
  }

  private safeJSONParse(value: any): any {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn('Failed to parse JSON:', value, e);
      return undefined;
    }
  }
}

export default new TechnologyService();
