import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Buildings list - Coming soon' });
});

export default router;
