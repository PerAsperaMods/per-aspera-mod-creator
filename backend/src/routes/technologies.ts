import { Router } from 'express';
import technologyController from '../controllers/TechnologyController';

const router = Router();

router.get('/', (req, res) => technologyController.getAll(req, res));
router.post('/', (req, res) => technologyController.create(req, res));
router.get('/yaml/all', (req, res) => technologyController.getAllYAML(req, res));
router.get('/:id', (req, res) => technologyController.getById(req, res));
router.put('/:id', (req, res) => technologyController.update(req, res));
router.delete('/:id', (req, res) => technologyController.delete(req, res));
router.get('/:id/yaml', (req, res) => technologyController.getYAML(req, res));

export default router;
