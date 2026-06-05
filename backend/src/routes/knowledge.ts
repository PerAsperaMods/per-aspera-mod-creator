import { Router } from 'express';
import knowledgeController from '../controllers/KnowledgeController';

const router = Router();

router.get('/', (req, res) => knowledgeController.getAll(req, res));
router.post('/', (req, res) => knowledgeController.create(req, res));
router.get('/yaml/all', (req, res) => knowledgeController.getAllYAML(req, res));
router.get('/:id', (req, res) => knowledgeController.getById(req, res));
router.put('/:id', (req, res) => knowledgeController.update(req, res));
router.delete('/:id', (req, res) => knowledgeController.delete(req, res));
router.get('/:id/yaml', (req, res) => knowledgeController.getYAML(req, res));

export default router;
