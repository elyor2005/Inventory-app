import { auth } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentUser(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return null;
    }

    // Fetch full user info including role and provider data from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        blocked: true,
        lastProvider: true,
        providerData: true,
      },
    });

    // Return null if user is blocked, preventing any API access
    if (user?.blocked) {
      return null;
    }

    if (!user) {
      return null;
    }

    // If user has provider-specific data, return it based on lastProvider
    if (user.lastProvider && user.providerData) {
      const providerData = user.providerData as Record<string, { email?: string; name?: string; image?: string }>;
      const currentProviderData = providerData[user.lastProvider];

      if (currentProviderData) {
        // Return provider-specific data
        return {
          id: user.id,
          email: currentProviderData.email || user.email,
          name: currentProviderData.name || user.name,
          image: currentProviderData.image || user.image,
          role: user.role,
          blocked: user.blocked,
          currentProvider: user.lastProvider,
        };
      }
    }

    // Fallback to regular user data if no provider data exists
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      blocked: user.blocked,
    };
  } catch {
    return null;
  }
}

export async function isAdmin(request: Request): Promise<boolean> {
  const user = await getCurrentUser(request);
  // No need to check blocked again as getCurrentUser already filters blocked users
  return user?.role === "admin";
}

export async function requireAdmin(request: Request) {
  const admin = await isAdmin(request);

  if (!admin) {
    return Response.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  return null;
}
