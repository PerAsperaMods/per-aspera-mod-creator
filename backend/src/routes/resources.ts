import express from 'express';

const router = express.Router();

// TODO: Implement resource routes
router.get('/', (req, res) => {
  res.json({ message: 'Resources list - Coming soon' });
});

export default router;
