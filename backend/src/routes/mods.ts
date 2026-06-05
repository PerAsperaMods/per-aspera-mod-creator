import express from 'express';

const router = express.Router();

// TODO: Implement mod routes
router.get('/', (req, res) => {
  res.json({ message: 'Mods list - Coming soon' });
});

export default router;
