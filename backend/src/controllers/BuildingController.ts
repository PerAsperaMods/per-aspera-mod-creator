import { Request, Response } from 'express';
import buildingService from '../services/BuildingService';

export class BuildingController {
  /**
   * GET /api/buildings - Get all buildings
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const buildings = await buildingService.getAllBuildings();
      res.json({
        success: true,
        data: buildings,
        count: buildings.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/buildings/:id - Get building by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const building = await buildingService.getBuildingById(parseInt(id));

      if (!building) {
        res.status(404).json({
          success: false,
          error: `Building with id ${id} not found`,
        });
        return;
      }

      res.json({
        success: true,
        data: building,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/buildings - Create building
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = buildingService.validateBuilding(req.body);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          errors,
        });
        return;
      }

      const building = await buildingService.createBuilding(req.body);
      res.status(201).json({
        success: true,
        data: building,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * PUT /api/buildings/:id - Update building
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const errors = buildingService.validateBuilding(req.body);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          errors,
        });
        return;
      }

      const building = await buildingService.updateBuilding(parseInt(id), req.body);
      res.json({
        success: true,
        data: building,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * DELETE /api/buildings/:id - Delete building
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await buildingService.deleteBuilding(parseInt(id));
      res.json({
        success: true,
        message: `Building ${id} deleted`,
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
   * GET /api/buildings/:id/yaml - Get building as YAML
   */
  async getYAML(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const building = await buildingService.getBuildingById(parseInt(id));

      if (!building) {
        res.status(404).json({
          success: false,
          error: `Building with id ${id} not found`,
        });
        return;
      }

      const yaml = buildingService.generateBuildingYAML(building);
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
   * GET /api/buildings/yaml/all - Get all buildings as YAML
   */
  async getAllYAML(req: Request, res: Response): Promise<void> {
    try {
      const yaml = await buildingService.generateAllBuildingsYAML();
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

export default new BuildingController();
