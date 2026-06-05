import { Request, Response } from 'express';
import technologyService from '../services/TechnologyService';

export class TechnologyController {
  private cleanTechnologyData(tech: any) {
    return {
      ...tech,
      created_at: tech.created_at ? new Date(tech.created_at).toISOString() : null,
      updated_at: tech.updated_at ? new Date(tech.updated_at).toISOString() : null,
    };
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const techs = await technologyService.getAllTechnologies();
      const cleanedTechs = techs.map((t) => this.cleanTechnologyData(t));
      res.json({ success: true, data: cleanedTechs, count: cleanedTechs.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const tech = await technologyService.getTechnologyById(parseInt(req.params.id));
      if (!tech) {
        res.status(404).json({ success: false, error: `Technology with id ${req.params.id} not found` });
        return;
      }
      res.json({ success: true, data: this.cleanTechnologyData(tech) });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = technologyService.validateTechnology(req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }
      const tech = await technologyService.createTechnology(req.body);
      res.status(201).json({ success: true, data: this.cleanTechnologyData(tech) });
    } catch (error) {
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const errors = technologyService.validateTechnology(req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }
      const tech = await technologyService.updateTechnology(parseInt(req.params.id), req.body);
      res.json({ success: true, data: this.cleanTechnologyData(tech) });
    } catch (error) {
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await technologyService.deleteTechnology(parseInt(req.params.id));
      res.json({ success: true, message: `Technology ${req.params.id} deleted` });
    } catch (error) {
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getYAML(req: Request, res: Response): Promise<void> {
    try {
      const tech = await technologyService.getTechnologyById(parseInt(req.params.id));
      if (!tech) {
        res.status(404).json({ success: false, error: `Technology with id ${req.params.id} not found` });
        return;
      }
      const yaml = technologyService.generateTechnologyYAML(tech);
      res.json({ success: true, yaml });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getAllYAML(_req: Request, res: Response): Promise<void> {
    try {
      const yaml = await technologyService.generateAllTechnologiesYAML();
      res.json({ success: true, yaml });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

export default new TechnologyController();
