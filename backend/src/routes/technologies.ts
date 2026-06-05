import express from 'express';

const router = express.Router();

// TODO: Implement technology routes
router.get('/', (req, res) => {
  res.json({ message: 'Technologies list - Coming soon' });
});

export default router;
