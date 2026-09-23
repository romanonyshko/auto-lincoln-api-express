import type { Request, Response, NextFunction } from 'express';
import { ApiError, buildErrorBody } from '../lib/apiError.js';

export function errorHandler(error: unknown, _req: Request, _res: Response, _next: NextFunction): void {
    let status: number
    let message: string
    if (error instanceof ApiError) {
        status = error.status
        message = error.message
    } else {
        console.error(error)
        status = 500
        message = 'Internal server error'
    }

    _res.status(status).json(buildErrorBody(status, message))
}