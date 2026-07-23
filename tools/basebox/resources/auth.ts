import { api } from "./api";

/** The hosted CLI auth page — deployed via Basebox deploy. */
const CLI_AUTH_URL = "https://cli-auth.basebox.site";

export async function auth(operation: string, input: any) {
  switch (operation) {
    case "login": {
      const basebox = api.getClient();
      const provider = input.provider || "google";

      if (!["google", "github", "discord"].includes(provider)) {
        throw new Error(
          `Unsupported provider: ${provider}. Use "google", "github", or "discord".`,
        );
      }

      const publicKey = (basebox as any).options.publicKey;

      // Build the auth page URL with the public key embedded
      const authUrl = new URL(CLI_AUTH_URL);
      authUrl.searchParams.set("publicKey", publicKey);
      authUrl.searchParams.set("provider", provider);

      return {
        url: authUrl.toString(),
        provider,
          message: [
              `Sign in with ${provider} and copy the session ID displayed on the page.`,
              `Then run \`auth set-session with session_id: <the copied session ID>\` to store it.`,
          ].join(" "),
      };
    }

    case "set-session": {
      if (!input.session_id) {
        throw new Error("session_id is required.");
      }
      api.setSession(input.session_id);

      const session = await api.getClientSession();
      if (!session) {
        api.clearSession();
        return {
          success: false,
          message:
            "Session failed validation check. It may be expired or invalid. " +
            "Use `auth login` to get a fresh one.",
        };
      }

      return { success: true, message: "Session stored and validated." };
    }

    case "check": {
      const session = await api.getClientSession();
      if (!session) {
        return { valid: false, message: "No valid session found." };
      }
      return { valid: true, message: "Session is valid." };
    }

    case "clear-session": {
      api.clearSession();
      return { success: true, message: "Session cleared." };
    }

    case "get-session": {
      const id = api.getSessionId();
      if (!id) {
        return { session_id: null, message: "No session stored." };
      }
      return { session_id: id };
    }

    default:
      throw new Error(
        `Unsupported auth operation: "${operation}". ` +
        `Available: login (get sign-in URL for user), set-session (store session ID from user), check (validate session), clear-session, get-session.`
      );
  }
}
