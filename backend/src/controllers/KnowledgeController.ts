import { Request, Response } from 'express';
import knowledgeService from '../services/KnowledgeService';

export class KnowledgeController {
  private cleanKnowledgeData(know: any) {
    return {
      ...know,
      created_at: know.created_at ? new Date(know.created_at).toISOString() : null,
      updated_at: know.updated_at ? new Date(know.updated_at).toISOString() : null,
    };
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const knowledge = await knowledgeService.getAllKnowledge();
      const cleanedKnowledge = knowledge.map((k) => this.cleanKnowledgeData(k));
      res.json({ success: true, data: cleanedKnowledge, count: cleanedKnowledge.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const know = await knowledgeService.getKnowledgeById(parseInt(req.params.id));
      if (!know) {
        res.status(404).json({ success: false, error: `Knowledge with id ${req.params.id} not found` });
        return;
      }
      res.json({ success: true, data: this.cleanKnowledgeData(know) });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = knowledgeService.validateKnowledge(req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }
      const know = await knowledgeService.createKnowledge(req.body);
      res.status(201).json({ success: true, data: this.cleanKnowledgeData(know) });
    } catch (error) {
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const errors = knowledgeService.validateKnowledge(req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }
      const know = await knowledgeService.updateKnowledge(parseInt(req.params.id), req.body);
      res.json({ success: true, data: this.cleanKnowledgeData(know) });
    } catch (error) {
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await knowledgeService.deleteKnowledge(parseInt(req.params.id));
      res.json({ success: true, message: `Knowledge ${req.params.id} deleted` });
    } catch (error) {
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getYAML(req: Request, res: Response): Promise<void> {
    try {
      const know = await knowledgeService.getKnowledgeById(parseInt(req.params.id));
      if (!know) {
        res.status(404).json({ success: false, error: `Knowledge with id ${req.params.id} not found` });
        return;
      }
      const yaml = knowledgeService.generateKnowledgeYAML(know);
      res.json({ success: true, yaml });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getAllYAML(_req: Request, res: Response): Promise<void> {
    try {
      const yaml = await knowledgeService.generateAllKnowledgeYAML();
      res.json({ success: true, yaml });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

export default new KnowledgeController();
