import type { User } from "@auto-lincoln/contracts/db";
import type { AuthUser } from "@auto-lincoln/contracts";

export function toAuthUser(user: User): AuthUser {
    return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
    }
}