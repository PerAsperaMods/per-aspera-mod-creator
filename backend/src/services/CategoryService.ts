import pool from '../config/database';
import { ICategory, CreateCategoryRequest, UpdateCategoryRequest, CategoryYAML } from '../types/Category';

export class CategoryService {
  async getAllCategories(): Promise<ICategory[]> {
    const result = await pool.query('SELECT * FROM building_categories ORDER BY created_at DESC');
    return result.rows;
  }

  async getCategoryById(id: number): Promise<ICategory | null> {
    const result = await pool.query('SELECT * FROM building_categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async getCategoryByKey(key: string): Promise<ICategory | null> {
    const result = await pool.query('SELECT * FROM building_categories WHERE key = $1', [key]);
    return result.rows[0] || null;
  }

  async createCategory(data: CreateCategoryRequest): Promise<ICategory> {
    const existing = await this.getCategoryByKey(data.key);
    if (existing) throw new Error(`Category with key "${data.key}" already exists`);

    const result = await pool.query(
      'INSERT INTO building_categories (key, name_label) VALUES ($1, $2) RETURNING *',
      [data.key, data.name_label]
    );
    return result.rows[0];
  }

  async updateCategory(id: number, data: UpdateCategoryRequest): Promise<ICategory> {
    const cat = await this.getCategoryById(id);
    if (!cat) throw new Error(`Category with id ${id} not found`);

    if ('name_label' in data && data.name_label) {
      const result = await pool.query(
        'UPDATE building_categories SET name_label = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [data.name_label, id]
      );
      return result.rows[0];
    }
    return cat;
  }

  async deleteCategory(id: number): Promise<void> {
    const cat = await this.getCategoryById(id);
    if (!cat) throw new Error(`Category with id ${id} not found`);
    await pool.query('DELETE FROM building_categories WHERE id = $1', [id]);
  }

  generateCategoryYAML(cat: ICategory): CategoryYAML {
    return { [cat.key]: { name: cat.name_label } };
  }

  async generateAllCategoriesYAML(): Promise<CategoryYAML> {
    const cats = await this.getAllCategories();
    const yaml: CategoryYAML = {};
    cats.forEach((c) => Object.assign(yaml, this.generateCategoryYAML(c)));
    return yaml;
  }

  validateCategory(data: CreateCategoryRequest | UpdateCategoryRequest): string[] {
    const errors: string[] = [];
    if ('key' in data && !data.key) errors.push('Category key is required');
    if ('key' in data && data.key && !/^[a-z_]+$/.test(data.key)) errors.push('Category key must be lowercase with underscores only');
    if ('name_label' in data && !data.name_label) errors.push('Name label is required');
    return errors;
  }
}

export default new CategoryService();
