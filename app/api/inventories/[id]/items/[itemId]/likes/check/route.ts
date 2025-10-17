import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// GET - Check if user has liked an item and get count
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const { itemId } = await params;
    const user = await getCurrentUser(request);

    // Get total like count
    const count = await prisma.like.count({
      where: { itemId: itemId },
    });

    // Check if current user liked it
    let isLiked = false;
    if (user) {
      const like = await prisma.like.findUnique({
        where: {
          itemId_userId: {
            itemId: itemId,
            userId: user.id,
          },
        },
      });
      isLiked = !!like;
    }

    return Response.json({ isLiked, count });
  } catch (error) {
    console.error("Error checking like status:", error);
    return Response.json({ error: "Failed to check like status" }, { status: 500 });
  }
}
