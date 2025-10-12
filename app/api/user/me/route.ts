import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ user });
}
