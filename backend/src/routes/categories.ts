import express from 'express';

const router = express.Router();

// TODO: Implement category routes
router.get('/', (req, res) => {
  res.json({ message: 'Categories list - Coming soon' });
});

export default router;
