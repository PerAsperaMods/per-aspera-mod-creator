import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Technologies list - Coming soon' });
});

export default router;
