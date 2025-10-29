import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import logger from 'morgan';
import path from 'node:path';
import notFound from './middlewares/not-found.js';
import errorHandler from './middlewares/error-handler.js';
import corsConfig from './middlewares/cors-config.js';
import apiLimiter from './middlewares/rate-limiter.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/client.js';

const app = express();

app.use(corsConfig);
app.use(apiLimiter);
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientRoutes);

app.use(notFound);

app.use(errorHandler);

export default app;
