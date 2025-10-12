import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
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
  session: any;
};
