import createError from 'http-errors';

export default function notFound(req, res, next) {
    next(createError(404));
}