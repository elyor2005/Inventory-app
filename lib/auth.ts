import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { APIError } from "better-auth/api";
import { fetchGoogleProfile, fetchGitHubProfile } from "./oauth-helpers";

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
      async mapProfileToUser(profile) {
        return {
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          emailVerified: profile.email_verified,
        };
      },
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ["read:user", "user:email"],
      async mapProfileToUser(profile) {
        return {
          email: profile.email,
          name: profile.name || profile.login,
          image: profile.avatar_url,
          emailVerified: true,
        };
      },
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
    user: {
      create: {
        after: async (user) => {
          // When user is first created, store their provider data
          const account = await prisma.account.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
          });

          if (account) {
            const providerData: any = {};
            providerData[account.providerId] = {
              name: user.name,
              image: user.image,
              email: user.email,
            };

            await prisma.user.update({
              where: { id: user.id },
              data: {
                lastProvider: account.providerId,
                providerData: providerData,
              },
            });
          }

          return user;
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          // Check if user is blocked before creating session
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { blocked: true, providerData: true },
          });

          if (user?.blocked) {
            throw new APIError("FORBIDDEN", {
              message: "Your account has been blocked. Please contact support.",
            });
          }

          // Find which provider is being used for this session
          // by checking the most recent account activity
          const recentAccount = await prisma.account.findFirst({
            where: { userId: session.userId },
            orderBy: { updatedAt: 'desc' },
            select: {
              providerId: true,
              accessToken: true,
            },
          });

          if (recentAccount && (recentAccount.providerId === "google" || recentAccount.providerId === "github") && recentAccount.accessToken) {
            let profileData = null;

            // Fetch fresh profile data from the OAuth provider
            if (recentAccount.providerId === "google") {
              profileData = await fetchGoogleProfile(recentAccount.accessToken);
            } else if (recentAccount.providerId === "github") {
              profileData = await fetchGitHubProfile(recentAccount.accessToken);
            }

            if (profileData) {
              const providerData = (user?.providerData as any) || {};
              providerData[recentAccount.providerId] = profileData;

              await prisma.user.update({
                where: { id: session.userId },
                data: {
                  lastProvider: recentAccount.providerId,
                  providerData: providerData,
                },
              });
            }
          }

          return { data: session };
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          // When a new OAuth account is linked, fetch and store the provider-specific data
          if ((account.providerId === "google" || account.providerId === "github") && account.accessToken) {
            const user = await prisma.user.findUnique({
              where: { id: account.userId },
              select: { providerData: true },
            });

            let profileData = null;

            // Fetch fresh profile data from the OAuth provider
            if (account.providerId === "google") {
              profileData = await fetchGoogleProfile(account.accessToken);
            } else if (account.providerId === "github") {
              profileData = await fetchGitHubProfile(account.accessToken);
            }

            if (profileData && user) {
              const providerData = (user.providerData as any) || {};
              providerData[account.providerId] = profileData;

              await prisma.user.update({
                where: { id: account.userId },
                data: {
                  lastProvider: account.providerId,
                  providerData: providerData,
                },
              });
            }
          }
          return account;
        },
      },
    },
  },
});
