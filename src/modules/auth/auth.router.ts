import { SESSION_MAX_AGE_MS, signSession, verifyPassword } from '@auto-lincoln/contracts/auth'
import { API_ROUTES, AUTH_COOKIE_NAME } from '@auto-lincoln/contracts'
import { Router } from 'express'
import { env } from '../../config/env.js'
import { ApiError } from '../../lib/apiError.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../middleware/requireAuth.js'
import { toAuthUser } from './toAuthUser.js'

export const authRouter = Router()

authRouter.post(API_ROUTES.auth.login, async (req, res) => {
  const { email, password } = req.body ?? {}

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new ApiError(400, 'Email and password are required')
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const token = await signSession(user.id, user.role, env.jwtSecret)

  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_MS,
  })

  res.json(toAuthUser(user))
})

authRouter.get(API_ROUTES.auth.me, requireAuth, async (_req, res) => {
  const session = res.locals.session

  if (!session) {
    throw new ApiError(401, 'Not authenticated')
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) {
    throw new ApiError(401, 'Not authenticated')
  }

  res.json(toAuthUser(user))
})

authRouter.post(API_ROUTES.auth.logout, (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' })
  res.status(204).end()
})
