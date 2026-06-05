import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api/resources', require('./routes/resources'));
app.use('/api/buildings', require('./routes/buildings'));
app.use('/api/technologies', require('./routes/technologies'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/knowledge', require('./routes/knowledge'));
app.use('/api/mods', require('./routes/mods'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📚 API docs: http://localhost:${PORT}/api/docs`);
});

export default app;
