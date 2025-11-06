/**
 * Helper functions to fetch OAuth profile data from providers
 */

export async function fetchGoogleProfile(accessToken: string) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Google profile");
    }

    const profile = await response.json();
    return {
      email: profile.email,
      name: profile.name,
      image: profile.picture,
    };
  } catch (error) {
    return null;
  }
}

export async function fetchGitHubProfile(accessToken: string) {
  try {
    // Fetch user profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch GitHub profile");
    }

    const profile = await userResponse.json();

    // Fetch primary email if not public
    let email = profile.email;
    if (!email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary);
        email = primaryEmail?.email || emails[0]?.email;
      }
    }

    return {
      email: email || profile.login + "@users.noreply.github.com",
      name: profile.name || profile.login,
      image: profile.avatar_url,
    };
  } catch (error) {
    return null;
  }
}
