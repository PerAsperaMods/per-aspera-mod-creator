import { Router } from 'express';
import categoryController from '../controllers/CategoryController';

const router = Router();

router.get('/', (req, res) => categoryController.getAll(req, res));
router.post('/', (req, res) => categoryController.create(req, res));
router.get('/yaml/all', (req, res) => categoryController.getAllYAML(req, res));
router.get('/:id', (req, res) => categoryController.getById(req, res));
router.put('/:id', (req, res) => categoryController.update(req, res));
router.delete('/:id', (req, res) => categoryController.delete(req, res));
router.get('/:id/yaml', (req, res) => categoryController.getYAML(req, res));

export default router;
