import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { registerAnimeTools } from "@/tools/anime-tools";
import { registerMangaTools } from "@/tools/manga-tools";
import { registerUserTools } from "@/tools/user-tools";
import { registerForumTools } from "@/tools/forum-tools";
import { unwrapMalToken } from "@/lib/oauth-utils";

const mcpHandler = createMcpHandler(
  (server: McpServer) => {
    registerAnimeTools(server);
    registerMangaTools(server);
    registerUserTools(server);
    registerForumTools(server);
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Bearer tokens must be wrapped blobs we issued via /oauth/token.
// A raw MAL access_token (or any other string) fails to decrypt and
// is rejected here — before any tool or MAL API call runs.
const handler = withMcpAuth(
  mcpHandler,
  async (_req, bearerToken) => {
    if (!bearerToken) return undefined;
    const unwrapped = unwrapMalToken(bearerToken);
    if (!unwrapped) return undefined;
    return {
      token: unwrapped.mal_access_token,
      clientId: "mal-user",
      scopes: [],
    };
  },
  { required: true },
);

export { handler as GET, handler as POST, handler as DELETE };
