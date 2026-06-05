import express from 'express';

const router = express.Router();

// TODO: Implement building routes
router.get('/', (req, res) => {
  res.json({ message: 'Buildings list - Coming soon' });
});

export default router;
