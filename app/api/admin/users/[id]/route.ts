import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await requireAdmin(request);
    if (unauthorized) return unauthorized;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { action } = body; // 'block', 'unblock', 'makeAdmin', 'removeAdmin'

    // Prevent admin from blocking/unblocking themselves, but allow removing their own admin role
    if (userId === session.user.id) {
      if (action === "block" || action === "unblock" || action === "makeAdmin") {
        return Response.json({ error: "Cannot block/unblock or promote yourself" }, { status: 400 });
      }
      // Allow 'removeAdmin' for self
    }

    // Get target user to check their role
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, blocked: true },
    });

    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent blocking or demoting other admins (only they can remove their own admin role)
    if (targetUser.role === "admin" && userId !== session.user.id) {
      if (action === "block" || action === "removeAdmin") {
        return Response.json({ error: "Cannot block or demote other admins. Only admins can remove their own admin role." }, { status: 400 });
      }
    }

    let updateData: { blocked?: boolean; role?: string } = {};

    switch (action) {
      case "block":
        updateData = { blocked: true };
        break;
      case "unblock":
        updateData = { blocked: false };
        break;
      case "makeAdmin":
        updateData = { role: "admin" };
        break;
      case "removeAdmin":
        updateData = { role: "user" };
        break;
      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blocked: true,
      },
    });

    return Response.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}
