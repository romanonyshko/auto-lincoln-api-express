import type { Request, Response, NextFunction } from 'express';
import { AUTH_COOKIE_NAME } from '@auto-lincoln/contracts'
import { verifySession } from '@auto-lincoln/contracts/auth'
import { ApiError } from '../lib/apiError.js';
import { env } from '../config/env.js'
import type { Session } from '../modules/auth/auth.types.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.cookies?.[AUTH_COOKIE_NAME]

    if (typeof token !== 'string') { throw new ApiError(401, 'Not authenticated') }
    let session: Session

    try {
        session = await verifySession(token, env.jwtSecret)
    }
    catch {
        throw new ApiError(401, 'Session expired')
    }

    res.locals.session = session

    next()
}

