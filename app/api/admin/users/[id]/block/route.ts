import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const { blocked } = await request.json();

    const user = await prisma.user.update({
      where: { id },
      data: { blocked },
    });

    return Response.json({
      user,
      message: blocked ? "User blocked successfully" : "User unblocked successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}
