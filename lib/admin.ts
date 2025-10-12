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

    // Fetch full user info including role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        blocked: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function isAdmin(request: Request): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user?.role === "admin" && !user.blocked;
}

export async function requireAdmin(request: Request) {
  const admin = await isAdmin(request);

  if (!admin) {
    return Response.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  return null;
}
