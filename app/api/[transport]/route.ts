import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { registerAnimeTools } from "@/tools/anime-tools";
import { registerMangaTools } from "@/tools/manga-tools";
import { registerUserTools } from "@/tools/user-tools";
import { registerForumTools } from "@/tools/forum-tools";

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
  {
    basePath: "/api",
  },
);

// Wrap with optional auth — unauthenticated requests still work for public tools.
// When authenticated, the bearer token (MAL access token) is available via extra.authInfo.
const handler = withMcpAuth(
  mcpHandler,
  async (_req, bearerToken) => {
    if (!bearerToken) return undefined;
    return {
      token: bearerToken,
      clientId: "mal-user",
      scopes: [],
    };
  },
  { required: false },
);

export { handler as GET, handler as POST, handler as DELETE };
