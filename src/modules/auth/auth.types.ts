import type { verifySession } from "@auto-lincoln/contracts/auth";

export type Session = Awaited<ReturnType<typeof verifySession>>
