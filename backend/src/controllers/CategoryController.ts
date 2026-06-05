import { Request, Response } from 'express';
import categoryService from '../services/CategoryService';

export class CategoryController {
  private cleanCategoryData(cat: any) {
    return {
      ...cat,
      created_at: cat.created_at ? new Date(cat.created_at).toISOString() : null,
      updated_at: cat.updated_at ? new Date(cat.updated_at).toISOString() : null,
    };
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const cats = await categoryService.getAllCategories();
      const cleanedCats = cats.map((c) => this.cleanCategoryData(c));
      res.json({ success: true, data: cleanedCats, count: cleanedCats.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const cat = await categoryService.getCategoryById(parseInt(req.params.id));
      if (!cat) {
        res.status(404).json({ success: false, error: `Category with id ${req.params.id} not found` });
        return;
      }
      res.json({ success: true, data: this.cleanCategoryData(cat) });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = categoryService.validateCategory(req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }
      const cat = await categoryService.createCategory(req.body);
      res.status(201).json({ success: true, data: this.cleanCategoryData(cat) });
    } catch (error) {
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const errors = categoryService.validateCategory(req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }
      const cat = await categoryService.updateCategory(parseInt(req.params.id), req.body);
      res.json({ success: true, data: this.cleanCategoryData(cat) });
    } catch (error) {
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await categoryService.deleteCategory(parseInt(req.params.id));
      res.json({ success: true, message: `Category ${req.params.id} deleted` });
    } catch (error) {
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getYAML(req: Request, res: Response): Promise<void> {
    try {
      const cat = await categoryService.getCategoryById(parseInt(req.params.id));
      if (!cat) {
        res.status(404).json({ success: false, error: `Category with id ${req.params.id} not found` });
        return;
      }
      const yaml = categoryService.generateCategoryYAML(cat);
      res.json({ success: true, yaml });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getAllYAML(_req: Request, res: Response): Promise<void> {
    try {
      const yaml = await categoryService.generateAllCategoriesYAML();
      res.json({ success: true, yaml });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

export default new CategoryController();
