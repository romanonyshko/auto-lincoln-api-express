import type { ApiErrorBody } from '@auto-lincoln/contracts';
import { STATUS_CODES } from 'node:http'

export class ApiError extends Error {
    readonly status: number
    constructor(status: number, message: string) {
        super(message)
        this.status = status
        this.name = 'ApiError';
    }
}


export function buildErrorBody(status: number, message: string): ApiErrorBody {
    return {
        message,
        statusCode: status,
        error: STATUS_CODES[status]
    }
}


