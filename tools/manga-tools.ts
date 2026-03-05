import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  searchManga,
  getMangaDetails,
  getMangaRanking,
  updateMangaListStatus,
  deleteMangaListStatus,
} from "@/lib/mal-client";
import {
  DEFAULT_MANGA_FIELDS,
  DETAIL_MANGA_FIELDS,
  MANGA_RANKING_TYPES,
  MANGA_STATUS_VALUES,
} from "@/lib/constants";

function resolveToken(paramToken: string | undefined, extra: { authInfo?: { token: string } }): string {
  const token = extra.authInfo?.token || paramToken;
  if (!token) throw new Error("Authentication required. Either authenticate via OAuth or provide mal_access_token.");
  return token;
}

export function registerMangaTools(server: McpServer) {
  server.tool(
    "search_manga",
    "Search for manga by keyword on MyAnimeList",
    {
      q: z.string().describe("Search keyword"),
      limit: z.number().min(1).max(100).optional().describe("Number of results (default 10)"),
      offset: z.number().min(0).optional().describe("Offset for pagination"),
      fields: z.string().optional().describe("Comma-separated fields to include"),
    },
    async ({ q, limit, offset, fields }) => {
      const result = await searchManga({
        q,
        limit,
        offset,
        fields: fields ?? DEFAULT_MANGA_FIELDS.join(","),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_manga_details",
    "Get detailed information about a specific manga by its MAL ID",
    {
      manga_id: z.number().describe("MyAnimeList manga ID"),
      fields: z.string().optional().describe("Comma-separated fields to include"),
    },
    async ({ manga_id, fields }) => {
      const result = await getMangaDetails({
        mangaId: manga_id,
        fields: fields ?? DETAIL_MANGA_FIELDS.join(","),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_manga_ranking",
    "Get manga ranking by various ranking types (e.g. all, manga, novels, oneshots, bypopularity)",
    {
      ranking_type: z
        .enum(MANGA_RANKING_TYPES)
        .describe("Type of ranking"),
      limit: z.number().min(1).max(100).optional().describe("Number of results (default 10)"),
      offset: z.number().min(0).optional().describe("Offset for pagination"),
      fields: z.string().optional().describe("Comma-separated fields to include"),
    },
    async ({ ranking_type, limit, offset, fields }) => {
      const result = await getMangaRanking({
        rankingType: ranking_type,
        limit,
        offset,
        fields: fields ?? DEFAULT_MANGA_FIELDS.join(","),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "update_manga_list_status",
    "Update the status of a manga in the authenticated user's list. Authenticates via OAuth or mal_access_token parameter.",
    {
      mal_access_token: z.string().optional().describe("MAL OAuth2 access token (optional if authenticated via OAuth)"),
      manga_id: z.number().describe("MyAnimeList manga ID"),
      status: z.enum(MANGA_STATUS_VALUES).optional().describe("Read status"),
      score: z.number().min(0).max(10).optional().describe("Score (0-10, 0 = no score)"),
      num_volumes_read: z.number().min(0).optional().describe("Number of volumes read"),
      num_chapters_read: z.number().min(0).optional().describe("Number of chapters read"),
      is_rereading: z.boolean().optional().describe("Whether rereading"),
      priority: z.number().min(0).max(2).optional().describe("Priority (0-2)"),
      tags: z.string().optional().describe("Comma-separated tags"),
      comments: z.string().optional().describe("Comments"),
    },
    async ({
      mal_access_token,
      manga_id,
      status,
      score,
      num_volumes_read,
      num_chapters_read,
      is_rereading,
      priority,
      tags,
      comments,
    }, extra) => {
      const token = resolveToken(mal_access_token, extra);
      const result = await updateMangaListStatus({
        accessToken: token,
        mangaId: manga_id,
        status,
        score,
        numVolumesRead: num_volumes_read,
        numChaptersRead: num_chapters_read,
        isRereading: is_rereading,
        priority,
        tags,
        comments,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "delete_manga_list_status",
    "Remove a manga from the authenticated user's list. Authenticates via OAuth or mal_access_token parameter.",
    {
      mal_access_token: z.string().optional().describe("MAL OAuth2 access token (optional if authenticated via OAuth)"),
      manga_id: z.number().describe("MyAnimeList manga ID"),
    },
    async ({ mal_access_token, manga_id }, extra) => {
      const token = resolveToken(mal_access_token, extra);
      await deleteMangaListStatus({
        accessToken: token,
        mangaId: manga_id,
      });
      return { content: [{ type: "text", text: "Successfully deleted manga from list." }] };
    },
  );
}
