import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  getMyUserInfo,
  getUserAnimeList,
  getUserMangaList,
} from "@/lib/mal-client";
import {
  DEFAULT_USER_ANIME_FIELDS,
  DEFAULT_USER_MANGA_FIELDS,
  ANIME_STATUS_VALUES,
  MANGA_STATUS_VALUES,
  SORT_OPTIONS,
  MANGA_SORT_OPTIONS,
  DEFAULT_ANIME_FIELDS,
  DEFAULT_MANGA_FIELDS,
} from "@/lib/constants";

function resolveToken(paramToken: string | undefined, extra: { authInfo?: { token: string } }): string {
  const token = extra.authInfo?.token || paramToken;
  if (!token) throw new Error("Authentication required. Either authenticate via OAuth or provide mal_access_token.");
  return token;
}

export function registerUserTools(server: McpServer) {
  server.tool(
    "get_my_user_info",
    "Get the authenticated user's profile information. Authenticates via OAuth or mal_access_token parameter.",
    {
      mal_access_token: z.string().optional().describe("MAL OAuth2 access token (optional if authenticated via OAuth)"),
      fields: z.string().optional().describe("Comma-separated fields to include"),
    },
    async ({ mal_access_token, fields }, extra) => {
      const token = resolveToken(mal_access_token, extra);
      const result = await getMyUserInfo({
        accessToken: token,
        fields,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_user_animelist",
    "Get a user's anime list by username",
    {
      username: z.string().describe("MAL username (use '@me' for authenticated user)"),
      status: z.enum(ANIME_STATUS_VALUES).optional().describe("Filter by status"),
      sort: z.enum(SORT_OPTIONS).optional().describe("Sort order"),
      limit: z.number().min(1).max(100).optional().describe("Number of results (default 10)"),
      offset: z.number().min(0).optional().describe("Offset for pagination"),
      fields: z.string().optional().describe("Comma-separated fields to include"),
    },
    async ({ username, status, sort, limit, offset, fields }, extra) => {
      const accessToken = extra.authInfo?.token;
      const defaultFields = [
        ...DEFAULT_ANIME_FIELDS,
        ...DEFAULT_USER_ANIME_FIELDS,
      ].join(",");
      const result = await getUserAnimeList({
        username,
        accessToken,
        status,
        sort,
        limit,
        offset,
        fields: fields ?? defaultFields,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_user_mangalist",
    "Get a user's manga list by username",
    {
      username: z.string().describe("MAL username (use '@me' for authenticated user)"),
      status: z.enum(MANGA_STATUS_VALUES).optional().describe("Filter by status"),
      sort: z.enum(MANGA_SORT_OPTIONS).optional().describe("Sort order"),
      limit: z.number().min(1).max(100).optional().describe("Number of results (default 10)"),
      offset: z.number().min(0).optional().describe("Offset for pagination"),
      fields: z.string().optional().describe("Comma-separated fields to include"),
    },
    async ({ username, status, sort, limit, offset, fields }, extra) => {
      const accessToken = extra.authInfo?.token;
      const defaultFields = [
        ...DEFAULT_MANGA_FIELDS,
        ...DEFAULT_USER_MANGA_FIELDS,
      ].join(",");
      const result = await getUserMangaList({
        username,
        accessToken,
        status,
        sort,
        limit,
        offset,
        fields: fields ?? defaultFields,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );
}
