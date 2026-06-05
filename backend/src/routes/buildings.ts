import { Router } from 'express';
import buildingController from '../controllers/BuildingController';

const router = Router();

// Building CRUD endpoints
router.get('/', (req, res) => buildingController.getAll(req, res));
router.post('/', (req, res) => buildingController.create(req, res));
router.get('/yaml/all', (req, res) => buildingController.getAllYAML(req, res));
router.get('/:id', (req, res) => buildingController.getById(req, res));
router.put('/:id', (req, res) => buildingController.update(req, res));
router.delete('/:id', (req, res) => buildingController.delete(req, res));
router.get('/:id/yaml', (req, res) => buildingController.getYAML(req, res));

export default router;
