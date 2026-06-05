import { Request, Response } from 'express';
import resourceService from '../services/ResourceService';

export class ResourceController {
  /**
   * GET /api/resources - Get all resources
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const resources = await resourceService.getAllResources();
      res.json({
        success: true,
        data: resources,
        count: resources.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/resources/:id - Get resource by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resource = await resourceService.getResourceById(parseInt(id));

      if (!resource) {
        res.status(404).json({
          success: false,
          error: `Resource with id ${id} not found`,
        });
        return;
      }

      res.json({
        success: true,
        data: resource,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/resources - Create resource
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = resourceService.validateResource(req.body);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          errors,
        });
        return;
      }

      const resource = await resourceService.createResource(req.body);
      res.status(201).json({
        success: true,
        data: resource,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * PUT /api/resources/:id - Update resource
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const errors = resourceService.validateResource(req.body);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          errors,
        });
        return;
      }

      const resource = await resourceService.updateResource(parseInt(id), req.body);
      res.json({
        success: true,
        data: resource,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * DELETE /api/resources/:id - Delete resource
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await resourceService.deleteResource(parseInt(id));
      res.json({
        success: true,
        message: `Resource ${id} deleted`,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/resources/:id/yaml - Get resource as YAML
   */
  async getYAML(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resource = await resourceService.getResourceById(parseInt(id));

      if (!resource) {
        res.status(404).json({
          success: false,
          error: `Resource with id ${id} not found`,
        });
        return;
      }

      const yaml = resourceService.generateResourceYAML(resource);
      res.json({
        success: true,
        yaml,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/resources/yaml/all - Get all resources as YAML
   */
  async getAllYAML(req: Request, res: Response): Promise<void> {
    try {
      const yaml = await resourceService.generateAllResourcesYAML();
      res.json({
        success: true,
        yaml,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default new ResourceController();
