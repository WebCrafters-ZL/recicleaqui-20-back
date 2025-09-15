import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import createError from 'http-errors';
import logger from 'morgan';
import path from 'path';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

const app = express();

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.static(path.resolve(path.dirname(new URL(import.meta.url).pathname), 'public')));

app.use('/', apiLimiter, indexRouter);
app.use('/users', apiLimiter, usersRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: req.app.get("env") === "development" ? err : {}
    });
});

export default app;
