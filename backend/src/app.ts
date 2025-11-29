import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Sécurité : Helmet
app.use(helmet());

// Sécurité : CORS
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
}));

// Sécurité : Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
});
app.use('/api', limiter);

// Parsing JSON
app.use(express.json({ limit: '10kb' }));

// Routes API
app.use('/api/v1', routes);

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Gestion des erreurs
app.use(errorHandler);

export default app;
