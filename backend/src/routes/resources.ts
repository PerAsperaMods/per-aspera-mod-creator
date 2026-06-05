import { Router } from 'express';
import resourceController from '../controllers/ResourceController';

const router = Router();

// Resource CRUD endpoints
router.get('/', (req, res) => resourceController.getAll(req, res));
router.post('/', (req, res) => resourceController.create(req, res));
router.get('/yaml/all', (req, res) => resourceController.getAllYAML(req, res));
router.get('/:id', (req, res) => resourceController.getById(req, res));
router.put('/:id', (req, res) => resourceController.update(req, res));
router.delete('/:id', (req, res) => resourceController.delete(req, res));
router.get('/:id/yaml', (req, res) => resourceController.getYAML(req, res));

export default router;
