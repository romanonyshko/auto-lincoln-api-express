import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'

/**
 * The web app (another origin, e.g. http://localhost:5173) calls this API
 * directly, so the browser needs CORS headers. `*` is not allowed together
 * with cookies — the origin must be exact and credentials allowed.
 * Mirrors `app.enableCors({ origin, credentials: true })` in the Nest API.
 */
export function cors(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Access-Control-Allow-Origin', env.corsOrigin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Vary', 'Origin')

  // Preflight: the browser asks before a POST with a JSON body.
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.sendStatus(204)
    return
  }

  next()
}
