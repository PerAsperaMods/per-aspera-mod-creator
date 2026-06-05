import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Knowledge list - Coming soon' });
});

export default router;
