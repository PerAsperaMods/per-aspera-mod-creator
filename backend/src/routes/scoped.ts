import express, { Request, Response } from 'express';
import pool from '../config/database';
import { OverrideService } from '../services/OverrideService';

const router = express.Router();
const overrideService = new OverrideService(pool);

/**
 * GET /api/scoped/resources
 * List all resources separated into official (read-only) and custom (editable)
 */
router.get('/resources', async (req: Request, res: Response) => {
  try {
    const result = await overrideService.listResourcesByScope();

    res.json({
      success: true,
      data: {
        official: result.official.map(r => ({
          ...r,
          editable: false,
          deletable: false
        })),
        custom: result.custom.map(r => ({
          ...r,
          editable: true,
          deletable: true
        }))
      },
      counts: {
        official: result.official.length,
        custom: result.custom.length,
        total: result.official.length + result.custom.length
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
 * GET /api/scoped/buildings
 * List all buildings separated into official and custom
 */
router.get('/buildings', async (req: Request, res: Response) => {
  try {
    const result = await overrideService.listBuildingsByScope();

    res.json({
      success: true,
      data: {
        official: result.official.map(b => ({
          ...b,
          editable: false,
          deletable: false
        })),
        custom: result.custom.map(b => ({
          ...b,
          editable: true,
          deletable: true
        }))
      },
      counts: {
        official: result.official.length,
        custom: result.custom.length,
        total: result.official.length + result.custom.length
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
 * GET /api/scoped/mod/:modId/resources
 * Get all custom resources for a specific mod
 */
router.get('/mod/:modId/resources', async (req: Request, res: Response) => {
  try {
    const { modId } = req.params;
    const resources = await overrideService.getModResources(modId);

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
 * GET /api/scoped/resource/:id/overrides
 * Get all overrides for a specific resource
 */
router.get('/resource/:id/overrides', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const overrides = await overrideService.getResourceOverrides(parseInt(id));

    res.json({
      success: true,
      data: overrides,
      count: overrides.length
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/scoped/resource/:id/resolved
 * Get the resolved resource (after all overrides)
 */
router.get('/resource/:id/resolved', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resolved = await overrideService.getResolvedResource(parseInt(id));

    if (!resolved) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    res.json({
      success: true,
      data: resolved
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/scoped/validate/override-chain
 * Validate that an override doesn't create a cycle
 */
router.post('/validate/override-chain', async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.body;

    if (!resourceId) {
      return res.status(400).json({
        success: false,
        error: 'resourceId is required'
      });
    }

    const validation = await overrideService.validateOverrideChain(resourceId);

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

export default router;
