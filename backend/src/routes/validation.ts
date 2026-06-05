import express, { Request, Response } from 'express';
import pool from '../config/database';
import { ValidationService } from '../services/ValidationService';

const router = express.Router();
const validationService = new ValidationService(pool);

/**
 * POST /api/validation/resource
 * Validate a single resource
 */
router.post('/resource', async (req: Request, res: Response) => {
  try {
    const resource = req.body;

    if (!resource.key || !resource.color || !resource.material_type) {
      return res.status(400).json({
        success: false,
        error: 'Resource must have key, color, and material_type'
      });
    }

    const messages = await validationService.validateResource(resource);
    const errors = messages.filter(m => m.severity === 'error');

    res.json({
      success: errors.length === 0,
      data: {
        valid: errors.length === 0,
        messages,
        error_count: messages.filter(m => m.severity === 'error').length,
        warning_count: messages.filter(m => m.severity === 'warning').length
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/validation/building
 * Validate a single building
 */
router.post('/building', async (req: Request, res: Response) => {
  try {
    const building = req.body;

    if (!building.key || !building.category_key || !building.prefab_name) {
      return res.status(400).json({
        success: false,
        error: 'Building must have key, category_key, and prefab_name'
      });
    }

    const messages = await validationService.validateBuilding(building);
    const errors = messages.filter(m => m.severity === 'error');

    res.json({
      success: errors.length === 0,
      data: {
        valid: errors.length === 0,
        messages,
        error_count: errors.length,
        warning_count: messages.filter(m => m.severity === 'warning').length
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/validation/composition
 * Validate a complete mod composition
 */
router.post('/composition', async (req: Request, res: Response) => {
  try {
    const { stack_id } = req.body;

    if (!stack_id) {
      return res.status(400).json({
        success: false,
        error: 'stack_id is required'
      });
    }

    const result = await validationService.validateComposition(stack_id);
    const report = validationService.generateReport(result);

    res.json({
      success: result.valid,
      data: {
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings,
        infos: result.infos,
        summary: result.summary,
        report: report
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/validation/report/:stackId
 * Get formatted validation report for a stack
 */
router.get('/report/:stackId', async (req: Request, res: Response) => {
  try {
    const { stackId } = req.params;

    const result = await validationService.validateComposition(stackId);
    const report = validationService.generateReport(result);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(report);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
