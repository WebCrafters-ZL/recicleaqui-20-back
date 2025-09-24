import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import logger from 'morgan';
import path from 'path';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import corsConfig from './middlewares/corsConfig.js';
import apiLimiter from './middlewares/rateLimiter.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use(corsConfig);
app.use(apiLimiter);
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/auth', authRoutes);

app.use(notFound);

app.use(errorHandler);

export default app;
