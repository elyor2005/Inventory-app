import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    // Get current user
    const currentUser = await getCurrentUser(request);

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Toggle role
    const newRole = targetUser.role === "admin" ? "user" : "admin";

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: newRole },
    });

    // Check if admin removed their own admin access
    const removedOwnAdmin = currentUser?.id === id && newRole === "user";

    return Response.json({
      user: updatedUser,
      message: newRole === "admin" ? "User promoted to admin" : "Admin access removed",
      removedOwnAdmin,
    });
  } catch (error) {
    console.error("Error toggling admin:", error);
    return Response.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
