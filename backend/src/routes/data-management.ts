import express, { Router } from 'express';
import pool from '../config/database';
import { DataManagementService } from '../services/DataManagementService';

const router = Router();
const service = new DataManagementService(pool);

/**
 * Purge all official game data
 * POST /api/data-management/purge
 */
router.post('/purge', async (req, res) => {
  try {
    console.log('📋 Purge request received');
    const report = await service.purgeAndReloadData();
    res.json({
      success: report.status === 'success',
      data: report,
    });
  } catch (error: any) {
    console.error('Purge error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Download and install SDK
 * POST /api/data-management/install-sdk
 */
router.post('/install-sdk', async (req, res) => {
  try {
    console.log('📥 SDK installation request received');
    const report = await service.downloadAndInstallSDK();
    res.json({
      success: report.status !== 'error',
      data: report,
    });
  } catch (error: any) {
    console.error('SDK installation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Initialize new C# mod project
 * POST /api/data-management/init-mod
 * Body: { modName: string, description: string }
 */
router.post('/init-mod', async (req, res) => {
  try {
    const { modName, description } = req.body;

    if (!modName || typeof modName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'modName is required and must be a string',
      });
    }

    console.log(`📦 Mod initialization request: ${modName}`);
    const report = await service.initializeCSharpMod(modName, description || '');

    res.json({
      success: report.status === 'success',
      data: report,
    });
  } catch (error: any) {
    console.error('Mod initialization error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get data management status
 * GET /api/data-management/status
 */
router.get('/status', async (req, res) => {
  try {
    // Get item counts from database
    const tables = ['resources', 'buildings', 'technologies', 'knowledge', 'enhancements', 'categories'];
    const counts: Record<string, number> = {};

    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      counts[table] = parseInt(result.rows[0].count, 10);
    }

    res.json({
      success: true,
      data: {
        itemCounts: counts,
        totalItems: Object.values(counts).reduce((a, b) => a + b, 0),
        timestamp: new Date(),
      },
    });
  } catch (error: any) {
    console.error('Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
