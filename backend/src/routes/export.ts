import express, { Request, Response } from 'express';
import pool from '../config/database';
import { ExportService } from '../services/ExportService';

const router = express.Router();
const exportService = new ExportService(pool);

router.get('/mod/:modId', async (req: Request, res: Response) => {
  try {
    const { modId } = req.params;

    const result = await exportService.exportModAsYAML(modId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        yaml: result.yaml,
        filename: `mod-${modId}.yaml`,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.post('/as-yaml', async (req: Request, res: Response) => {
  try {
    const { resources, buildings, technologies } = req.body;

    const result = await exportService.exportEntitiesAsYAML({
      resources: resources || [],
      buildings: buildings || [],
      technologies: technologies || [],
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        yaml: result.yaml,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.get('/mod/:modId/stats', async (req: Request, res: Response) => {
  try {
    const { modId } = req.params;

    const result = await exportService.getModStats(modId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.stats,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
