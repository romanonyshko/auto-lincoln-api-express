import { API_ROUTES, type HealthResponse } from '@auto-lincoln/contracts'
import { Router } from 'express'

export const healthRouter = Router()

healthRouter.get(API_ROUTES.health, (_req, res) => {
  const body: HealthResponse = { status: 'ok', backend: 'express' }
  res.json(body)
})
