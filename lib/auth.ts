import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { APIError } from "better-auth/api";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  socialProviders: {
    
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      blocked: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Check if user is blocked before creating session
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { blocked: true },
          });

          if (user?.blocked) {
            throw new APIError("FORBIDDEN", {
              message: "Your account has been blocked. Please contact support.",
            });
          }

          return { data: session };
        },
      },
    },
  },
});
