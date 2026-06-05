import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import resourcesRouter from './routes/resources';
import buildingsRouter from './routes/buildings';
import technologiesRouter from './routes/technologies';
import categoriesRouter from './routes/categories';
import knowledgeRouter from './routes/knowledge';
import modsRouter from './routes/mods';
import importRouter from './routes/import';
import exportRouter from './routes/export';
import scopedRouter from './routes/scoped';
import compositionRouter from './routes/composition';
import validationRouter from './routes/validation';
import localizationRouter from './routes/localization';
import yamlLoaderRouter from './routes/yaml-loader';
import pool from './config/database';
import { LocalizationService } from './services/LocalizationService';
import { YamlLoaderService } from './services/YamlLoaderService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: '🚀 Per Aspera Mod Creator API',
    version: '1.0.0',
    status: 'operational',
    docs: 'http://localhost:3001/api/docs',
    frontend: 'http://localhost:3000',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'Per Aspera Mod Creator API',
    version: '1.0.0',
    description: 'REST API for creating Per Aspera mods visually',
    baseUrl: 'http://localhost:3001',
    endpoints: {
      resources: {
        list: 'GET /api/resources',
        create: 'POST /api/resources',
        get: 'GET /api/resources/:id',
        update: 'PUT /api/resources/:id',
        delete: 'DELETE /api/resources/:id',
        yaml: 'GET /api/resources/:id/yaml',
        yamlAll: 'GET /api/resources/yaml/all',
      },
      buildings: {
        list: 'GET /api/buildings',
        create: 'POST /api/buildings',
        get: 'GET /api/buildings/:id',
        update: 'PUT /api/buildings/:id',
        delete: 'DELETE /api/buildings/:id',
        yaml: 'GET /api/buildings/:id/yaml',
        yamlAll: 'GET /api/buildings/yaml/all',
      },
      technologies: {
        list: 'GET /api/technologies',
        create: 'POST /api/technologies',
        get: 'GET /api/technologies/:id',
        update: 'PUT /api/technologies/:id',
        delete: 'DELETE /api/technologies/:id',
        yaml: 'GET /api/technologies/:id/yaml',
        yamlAll: 'GET /api/technologies/yaml/all',
      },
      categories: {
        list: 'GET /api/categories',
        create: 'POST /api/categories',
        get: 'GET /api/categories/:id',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id',
        yaml: 'GET /api/categories/:id/yaml',
        yamlAll: 'GET /api/categories/yaml/all',
      },
      knowledge: {
        list: 'GET /api/knowledge',
        create: 'POST /api/knowledge',
        get: 'GET /api/knowledge/:id',
        update: 'PUT /api/knowledge/:id',
        delete: 'DELETE /api/knowledge/:id',
        yaml: 'GET /api/knowledge/:id/yaml',
        yamlAll: 'GET /api/knowledge/yaml/all',
      },
    },
    example: {
      createResource: {
        method: 'POST',
        url: '/api/resources',
        body: {
          key: 'resource_aluminum',
          color: 'C0C0C0',
          material_type: 'Mined',
          name_label: 'BE_resource_aluminum_name',
          prefab_name: 'Aluminum',
        },
      },
      createBuilding: {
        method: 'POST',
        url: '/api/buildings',
        body: {
          key: 'building_aluminum_mine',
          name_label: 'BE_building_aluminum_mine',
          category_key: 'category_basic',
          prefab_name: 'AluminumMine_1',
          output_resource: 'resource_aluminum',
        },
      },
    },
    links: {
      frontend: 'http://localhost:3000',
      database: 'http://localhost:8080',
      health: 'http://localhost:3001/health',
    },
  });
});

// API Routes
app.use('/api/resources', resourcesRouter);
app.use('/api/buildings', buildingsRouter);
app.use('/api/technologies', technologiesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/mods', modsRouter);
app.use('/api/import', importRouter);
app.use('/api/export', exportRouter);
app.use('/api/scoped', scopedRouter);
app.use('/api/composition', compositionRouter);
app.use('/api/validation', validationRouter);
app.use('/api/localization', localizationRouter);
app.use('/api/yaml-loader', yamlLoaderRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, async () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📚 API docs: http://localhost:${PORT}/api/docs`);

  // Load Phase 1 data on startup
  try {
    const locService = new LocalizationService(pool);
    const yamlLoader = new YamlLoaderService(pool, locService);
    console.log('\n📦 Loading Phase 1 game data...');
    const report = await yamlLoader.loadPhase1();
    console.log(`✅ Phase 1 complete: ${JSON.stringify(report.items_loaded)}\n`);
  } catch (error: any) {
    console.error('⚠️ Phase 1 load failed:', error.message);
    console.error('You can manually trigger via: POST /api/yaml-loader/load-phase-1');
  }
});

export default app;
