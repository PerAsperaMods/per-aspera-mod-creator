import express, { Request, Response } from 'express';
import pool from '../config/database';
import { LocalizationService } from '../services/LocalizationService';

const router = express.Router();
const locService = new LocalizationService(pool);

/**
 * GET /api/localization/languages
 * Get all supported languages
 */
router.get('/languages', async (req: Request, res: Response) => {
  try {
    const languages = await locService.getLanguages();
    res.json({
      success: true,
      data: languages,
      count: languages.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/localization/keys
 * Get all translation keys
 */
router.get('/keys', async (req: Request, res: Response) => {
  try {
    const keys = await locService.getTranslationKeys();
    res.json({
      success: true,
      data: keys,
      count: keys.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/localization/keys/:id
 * Get translation key with all translations
 */
router.get('/keys/:id', async (req: Request, res: Response) => {
  try {
    const entry = await locService.getTranslationKeyWithTranslations(parseInt(req.params.id));
    if (!entry) {
      return res.status(404).json({ success: false, error: 'Translation key not found' });
    }
    res.json({ success: true, data: entry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/localization/keys
 * Create new translation key
 */
router.post('/keys', async (req: Request, res: Response) => {
  try {
    const { key, defaultText, entityType, entityId, context } = req.body;

    if (!key || !defaultText) {
      return res.status(400).json({
        success: false,
        error: 'key and defaultText are required',
      });
    }

    const result = await locService.createTranslationKey(key, defaultText, entityType, entityId, context);

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/localization/keys/:id/translate
 * Set translation for a key
 */
router.post('/keys/:id/translate', async (req: Request, res: Response) => {
  try {
    const { languageCode, translatedText, translatedBy } = req.body;

    if (!languageCode || !translatedText) {
      return res.status(400).json({
        success: false,
        error: 'languageCode and translatedText are required',
      });
    }

    const result = await locService.setTranslation(
      parseInt(req.params.id),
      languageCode,
      translatedText,
      translatedBy
    );

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/localization/language/:code
 * Get all translations for a language
 */
router.get('/language/:code', async (req: Request, res: Response) => {
  try {
    const entries = await locService.getTranslationsByLanguage(req.params.code);
    res.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/localization/stats
 * Get translation completion stats
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await locService.getTranslationStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/localization/keys/:id/review
 * Mark translation as reviewed
 */
router.post('/keys/:id/review', async (req: Request, res: Response) => {
  try {
    const { reviewedBy } = req.body;

    if (!reviewedBy) {
      return res.status(400).json({
        success: false,
        error: 'reviewedBy is required',
      });
    }

    await locService.reviewTranslation(parseInt(req.params.id), reviewedBy);

    res.json({ success: true, message: 'Translation marked as reviewed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/localization/search
 * Search translation keys
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) is required',
      });
    }

    const results = await locService.searchTranslationKeys(q);

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/localization/extract-labels
 * Extract all text labels from resources/buildings/technologies
 */
router.post('/extract-labels', async (req: Request, res: Response) => {
  try {
    await locService.extractAllLabels();

    res.json({
      success: true,
      message: 'All labels extracted successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
