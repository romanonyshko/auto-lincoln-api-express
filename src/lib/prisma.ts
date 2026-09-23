import { createPrismaClient } from '@auto-lincoln/contracts/db'
import { env } from '../config/env.js'

export const prisma = createPrismaClient(env.databaseUrl)
