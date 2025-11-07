import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchGoogleProfile, fetchGitHubProfile } from "@/lib/oauth-helpers";

/**
 * API endpoint to sync provider-specific data
 * This should be called after OAuth login to store the provider's profile data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }

    // Find the account for this provider
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: provider,
      },
      select: {
        accessToken: true,
      },
    });

    if (!account || !account.accessToken) {
      return NextResponse.json(
        { error: "Account not found or no access token" },
        { status: 404 }
      );
    }

    // Fetch fresh profile data from the OAuth provider
    let profileData = null;
    if (provider === "google") {
      profileData = await fetchGoogleProfile(account.accessToken);
    } else if (provider === "github") {
      profileData = await fetchGitHubProfile(account.accessToken);
    }

    if (!profileData) {
      return NextResponse.json(
        { error: "Failed to fetch profile from provider" },
        { status: 500 }
      );
    }

    // Fetch existing provider data
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { providerData: true },
    });

    const providerData: Record<string, unknown> = (dbUser?.providerData as Record<string, unknown>) || {};
    providerData[provider] = profileData;

    // Update user with new provider data
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lastProvider: provider,
        providerData: providerData as never,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Provider data synced successfully",
      provider,
      profileData,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to sync provider data" },
      { status: 500 }
    );
  }
}
