import type { UserRole } from '@auto-lincoln/contracts'

declare global {
  namespace Express {
    interface Locals {
      session?: { userId: string; role: UserRole }
    }
  }
}

export {}