import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || window.location.origin,
});

export const { signIn, signOut, useSession } = authClient;

export type ExtendedSession = {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: string;
    blocked: boolean;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
};
