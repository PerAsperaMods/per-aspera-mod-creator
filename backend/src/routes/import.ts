import express, { Request, Response } from 'express';
import pool from '../config/database';
import { ImportService } from '../services/ImportService';

const router = express.Router();
const importService = new ImportService(pool);

router.post('/bulk/resources', async (req: Request, res: Response) => {
  try {
    const { resources } = req.body;

    if (!Array.isArray(resources)) {
      return res.status(400).json({
        success: false,
        error: 'resources must be an array',
      });
    }

    const result = await importService.bulkImportResources(resources);

    res.json({
      success: result.failed === 0,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.post('/bulk/buildings', async (req: Request, res: Response) => {
  try {
    const { buildings } = req.body;

    if (!Array.isArray(buildings)) {
      return res.status(400).json({
        success: false,
        error: 'buildings must be an array',
      });
    }

    const result = await importService.bulkImportBuildings(buildings);

    res.json({
      success: result.failed === 0,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.post('/bulk/technologies', async (req: Request, res: Response) => {
  try {
    const { technologies } = req.body;

    if (!Array.isArray(technologies)) {
      return res.status(400).json({
        success: false,
        error: 'technologies must be an array',
      });
    }

    const result = await importService.bulkImportTechnologies(technologies);

    res.json({
      success: result.failed === 0,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.post('/bulk/categories', async (req: Request, res: Response) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        error: 'categories must be an array',
      });
    }

    const result = await importService.bulkImportCategories(categories);

    res.json({
      success: result.failed === 0,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.post('/bulk/knowledge', async (req: Request, res: Response) => {
  try {
    const { knowledge } = req.body;

    if (!Array.isArray(knowledge)) {
      return res.status(400).json({
        success: false,
        error: 'knowledge must be an array',
      });
    }

    const result = await importService.bulkImportKnowledge(knowledge);

    res.json({
      success: result.failed === 0,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { yaml } = req.body;

    if (!yaml) {
      return res.status(400).json({
        success: false,
        error: 'yaml data is required',
      });
    }

    const validation = importService.validateYAML(yaml);

    res.json({
      success: validation.valid,
      data: validation,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
