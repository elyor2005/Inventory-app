import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { action } = body; // 'block', 'unblock', 'makeAdmin', 'removeAdmin'

    // Prevent admin from blocking/demoting themselves
    if (userId === session.user.id) {
      return Response.json({ error: "Cannot modify your own account" }, { status: 400 });
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
