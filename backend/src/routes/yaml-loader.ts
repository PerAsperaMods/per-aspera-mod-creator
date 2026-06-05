import express, { Request, Response } from 'express';
import pool from '../config/database';
import { LocalizationService } from '../services/LocalizationService';
import { YamlLoaderService } from '../services/YamlLoaderService';

const router = express.Router();
const localizationService = new LocalizationService(pool);
const yamlLoaderService = new YamlLoaderService(pool, localizationService);

/**
 * POST /api/yaml-loader/load-phase-1
 * Load Phase 1 data (core entities: resources, buildings, technologies, etc.)
 */
router.post('/load-phase-1', async (req: Request, res: Response) => {
  try {
    console.log('🚀 Starting Phase 1 YAML load...');

    const report = await yamlLoaderService.loadPhase1();

    res.json({
      success: true,
      message: 'Phase 1 loading complete',
      data: report,
    });
  } catch (err: any) {
    console.error('❌ Phase 1 load failed:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      data: yamlLoaderService.getLoadingReport(),
    });
  }
});

/**
 * GET /api/yaml-loader/status
 * Get current loading status and report
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const report = yamlLoaderService.getLoadingReport();

    res.json({
      success: true,
      data: report,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * GET /api/yaml-loader/stats
 * Get overall statistics on loaded data
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      resourcesCount,
      buildingsCount,
      technologiesCount,
      knowledgeCount,
      categoriesCount,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM resources WHERE is_official = true'),
      pool.query('SELECT COUNT(*) FROM buildings WHERE is_official = true'),
      pool.query('SELECT COUNT(*) FROM technologies WHERE is_official = true'),
      pool.query('SELECT COUNT(*) FROM knowledge WHERE is_official = true'),
      pool.query('SELECT COUNT(*) FROM categories WHERE is_official = true'),
    ]);

    const total =
      parseInt(resourcesCount.rows[0].count) +
      parseInt(buildingsCount.rows[0].count) +
      parseInt(technologiesCount.rows[0].count) +
      parseInt(knowledgeCount.rows[0].count) +
      parseInt(categoriesCount.rows[0].count);

    res.json({
      success: true,
      data: {
        resources: parseInt(resourcesCount.rows[0].count),
        buildings: parseInt(buildingsCount.rows[0].count),
        technologies: parseInt(technologiesCount.rows[0].count),
        knowledge: parseInt(knowledgeCount.rows[0].count),
        categories: parseInt(categoriesCount.rows[0].count),
        total: total,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * GET /api/yaml-loader/validation-report
 * Get detailed validation report from last load
 */
router.get('/validation-report', (req: Request, res: Response) => {
  try {
    const report = yamlLoaderService.getLoadingReport();

    res.json({
      success: true,
      data: {
        errors: report.errors,
        warnings: report.warnings,
        error_count: report.errors.length,
        warning_count: report.warnings.length,
        all_clear: report.errors.length === 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
