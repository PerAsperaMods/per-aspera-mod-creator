import pool from '../config/database';
import { IKnowledge, CreateKnowledgeRequest, UpdateKnowledgeRequest, KnowledgeYAML } from '../types/Knowledge';

export class KnowledgeService {
  async getAllKnowledge(): Promise<IKnowledge[]> {
    const result = await pool.query('SELECT * FROM knowledge ORDER BY created_at DESC');
    return result.rows;
  }

  async getKnowledgeById(id: number): Promise<IKnowledge | null> {
    const result = await pool.query('SELECT * FROM knowledge WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async getKnowledgeByKey(key: string): Promise<IKnowledge | null> {
    const result = await pool.query('SELECT * FROM knowledge WHERE key = $1', [key]);
    return result.rows[0] || null;
  }

  async createKnowledge(data: CreateKnowledgeRequest): Promise<IKnowledge> {
    const existing = await this.getKnowledgeByKey(data.key);
    if (existing) throw new Error(`Knowledge with key "${data.key}" already exists`);

    const query = `
      INSERT INTO knowledge (key, name_label, description_label, knowledge_type, value)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      data.key,
      data.name_label,
      data.description_label || null,
      data.knowledge_type || null,
      data.value || null,
    ]);
    return result.rows[0];
  }

  async updateKnowledge(id: number, data: UpdateKnowledgeRequest): Promise<IKnowledge> {
    const know = await this.getKnowledgeById(id);
    if (!know) throw new Error(`Knowledge with id ${id} not found`);

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if ('name_label' in data) { updates.push(`name_label = $${paramCount++}`); values.push(data.name_label); }
    if ('description_label' in data) { updates.push(`description_label = $${paramCount++}`); values.push(data.description_label || null); }
    if ('knowledge_type' in data) { updates.push(`knowledge_type = $${paramCount++}`); values.push(data.knowledge_type || null); }
    if ('value' in data) { updates.push(`value = $${paramCount++}`); values.push(data.value || null); }

    if (updates.length === 0) return know;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE knowledge SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async deleteKnowledge(id: number): Promise<void> {
    const know = await this.getKnowledgeById(id);
    if (!know) throw new Error(`Knowledge with id ${id} not found`);
    await pool.query('DELETE FROM knowledge WHERE id = $1', [id]);
  }

  generateKnowledgeYAML(know: IKnowledge): KnowledgeYAML {
    const yaml: KnowledgeYAML = {};
    yaml[know.key] = { name: know.name_label };

    if (know.description_label) yaml[know.key].description = know.description_label;
    if (know.knowledge_type) yaml[know.key].knowledgeType = know.knowledge_type;
    if (know.value !== null && know.value !== undefined) yaml[know.key].value = know.value;

    return yaml;
  }

  async generateAllKnowledgeYAML(): Promise<KnowledgeYAML> {
    const knowledge = await this.getAllKnowledge();
    const yaml: KnowledgeYAML = {};
    knowledge.forEach((k) => Object.assign(yaml, this.generateKnowledgeYAML(k)));
    return yaml;
  }

  validateKnowledge(data: CreateKnowledgeRequest | UpdateKnowledgeRequest): string[] {
    const errors: string[] = [];
    if ('key' in data && !data.key) errors.push('Knowledge key is required');
    if ('key' in data && data.key && !/^[a-z_]+$/.test(data.key)) errors.push('Knowledge key must be lowercase with underscores only');
    if ('name_label' in data && !data.name_label) errors.push('Name label is required');
    return errors;
  }
}

export default new KnowledgeService();
