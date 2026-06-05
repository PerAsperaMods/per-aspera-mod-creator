import express, { Request, Response } from 'express';
import pool from '../config/database';
import { CompositionService } from '../services/CompositionService';

const router = express.Router();
const compositionService = new CompositionService(pool);

/**
 * POST /api/composition/register-mod
 * Register a mod with metadata
 */
router.post('/register-mod', async (req: Request, res: Response) => {
  try {
    const {
      mod_id,
      name,
      description,
      version,
      author,
      dependencies
    } = req.body;

    if (!mod_id || !name) {
      return res.status(400).json({
        success: false,
        error: 'mod_id and name are required'
      });
    }

    await compositionService.registerMod(
      mod_id,
      name,
      description,
      version,
      author,
      dependencies
    );

    res.json({
      success: true,
      message: `Mod "${mod_id}" registered`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/composition/mods
 * List all registered mods
 */
router.get('/mods', async (req: Request, res: Response) => {
  try {
    const mods = await compositionService.listMods();

    res.json({
      success: true,
      data: mods,
      count: mods.length
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/composition/mod/:modId
 * Get mod metadata
 */
router.get('/mod/:modId', async (req: Request, res: Response) => {
  try {
    const { modId } = req.params;
    const mod = await compositionService.getModMetadata(modId);

    if (!mod) {
      return res.status(404).json({
        success: false,
        error: 'Mod not found'
      });
    }

    res.json({
      success: true,
      data: mod
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/composition/compose
 * Compose multiple mods into a stack
 */
router.post('/compose', async (req: Request, res: Response) => {
  try {
    const { stack_id, mod_ids } = req.body;

    if (!stack_id || !Array.isArray(mod_ids)) {
      return res.status(400).json({
        success: false,
        error: 'stack_id and mod_ids (array) are required'
      });
    }

    const stack = await compositionService.composeModStack(stack_id, mod_ids);

    res.json({
      success: true,
      data: {
        stack_id: stack.stack_id,
        mod_ids: stack.mod_ids,
        resolution_order: stack.resolution_order,
        resolved_resources_count: stack.resolved_resources.length,
        conflicts_count: stack.conflicts.length,
        conflicts: stack.conflicts
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
 * GET /api/composition/stack/:stackId/resolved
 * Get resolved resources for a stack
 */
router.get('/stack/:stackId/resolved', async (req: Request, res: Response) => {
  try {
    const { stackId } = req.params;
    const resources = await compositionService.getResolvedResources(stackId);

    res.json({
      success: true,
      data: resources,
      count: resources.length
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/composition/stack/:stackId/conflicts
 * Get conflicts for a stack
 */
router.get('/stack/:stackId/conflicts', async (req: Request, res: Response) => {
  try {
    const { stackId } = req.params;
    const conflicts = await compositionService.getConflicts(stackId);

    const errors = conflicts.filter(c => c.severity === 'error');
    const warnings = conflicts.filter(c => c.severity === 'warning');

    res.json({
      success: true,
      data: {
        all: conflicts,
        errors,
        warnings,
        total: conflicts.length
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
 * POST /api/composition/validate-stack
 * Validate a mod stack
 */
router.post('/validate-stack', async (req: Request, res: Response) => {
  try {
    const { stack_id } = req.body;

    if (!stack_id) {
      return res.status(400).json({
        success: false,
        error: 'stack_id is required'
      });
    }

    const validation = await compositionService.validateStack(stack_id);

    res.json({
      success: validation.valid,
      data: validation
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/composition/check-conflict
 * Check if two mods conflict
 */
router.post('/check-conflict', async (req: Request, res: Response) => {
  try {
    const { mod_a, mod_b } = req.body;

    if (!mod_a || !mod_b) {
      return res.status(400).json({
        success: false,
        error: 'mod_a and mod_b are required'
      });
    }

    const conflicts = await compositionService.checkModConflict(mod_a, mod_b);

    res.json({
      success: true,
      data: {
        mod_a,
        mod_b,
        conflicts,
        has_conflicts: conflicts.length > 0,
        conflict_count: conflicts.length
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
