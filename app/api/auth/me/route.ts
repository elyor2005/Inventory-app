import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/admin";

/**
 * API endpoint to get current user with provider-specific data
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    return Response.json({ user });
  } catch {
    return Response.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
