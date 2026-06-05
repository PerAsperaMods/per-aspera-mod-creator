import express from 'express';

const router = express.Router();

// TODO: Implement knowledge routes
router.get('/', (req, res) => {
  res.json({ message: 'Knowledge list - Coming soon' });
});

export default router;
