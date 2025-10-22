import createError from 'http-errors';

export default function notFound(_req, _res, next) {
    next(createError(404));
}