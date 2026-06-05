import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import resourcesRouter from './routes/resources';
import buildingsRouter from './routes/buildings';
import technologiesRouter from './routes/technologies';
import categoriesRouter from './routes/categories';
import knowledgeRouter from './routes/knowledge';
import modsRouter from './routes/mods';

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
app.use('/api/resources', resourcesRouter);
app.use('/api/buildings', buildingsRouter);
app.use('/api/technologies', technologiesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/mods', modsRouter);

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
