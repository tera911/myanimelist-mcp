import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  searchAnime,
  getAnimeDetails,
  getAnimeRanking,
  getSeasonalAnime,
  getAnimeSuggestions,
  updateAnimeListStatus,
  deleteAnimeListStatus,
} from "@/lib/mal-client";
import {
  DEFAULT_ANIME_FIELDS,
  DETAIL_ANIME_FIELDS,
  ANIME_RANKING_TYPES,
  SEASONS,
  ANIME_STATUS_VALUES,
} from "@/lib/constants";

function resolveToken(paramToken: string | undefined, extra: { authInfo?: { token: string } }): string {
  const token = extra.authInfo?.token || paramToken;
  if (!token) throw new Error("Authentication required. Either authenticate via OAuth or provide mal_access_token.");
  return token;
}

export function registerAnimeTools(server: McpServer) {
  server.tool(
    "search_anime",
    "Search for anime by keyword on MyAnimeList",
    {
      q: z.string().describe("Search keyword"),
      limit: z.number().min(1).max(100).optional().describe("Number of results (default 10)"),
      offset: z.number().min(0).optional().describe("Offset for pagination"),
      fields: z.string().optional().describe("Comma-separated fields to include"),
    },
    async ({ q, limit, offset, fields }) => {
      const result = await searchAnime({
        q,
        limit,
        offset,
        fields: fields ?? DEFAULT_ANIME_FIELDS.join(","),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_anime_details",
    "Get detailed information about a specific anime by its MAL ID",
    {
      anime_id: z.number().describe("MyAnimeList anime ID"),
      fields: z.string().optional().describe("Comma-separated fields to include"),
    },
    async ({ anime_id, fields }) => {
      const result = await getAnimeDetails({
        animeId: anime_id,
        fields: fields ?? DETAIL_ANIME_FIELDS.join(","),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_anime_ranking",
    "Get anime ranking by various ranking types (e.g. all, airing, upcoming, tv, movie, bypopularity)",
    {
      ranking_type: z
        .enum(ANIME_RANKING_TYPES)
        .describe("Type of ranking"),
      limit: z.number().min(1).max(100).optional().describe("Number of results (default 10)"),
      offset: z.number().min(0).optional().describe("Offset for pagination"),
      fields: z.string().optional().describe("Comma-separated fields to include"),
    },
    async ({ ranking_type, limit, offset, fields }) => {
      const result = await getAnimeRanking({
        rankingType: ranking_type,
        limit,
        offset,
        fields: fields ?? DEFAULT_ANIME_FIELDS.join(","),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_seasonal_anime",
    "Get anime list for a specific season and year",
    {
      year: z.number().describe("Year (e.g. 2024)"),
      season: z.enum(SEASONS).describe("Season: winter, spring, summer, fall"),
      sort: z.string().optional().describe("Sort option (e.g. anime_score, anime_num_list_users)"),
      limit: z.number().min(1).max(100).optional().describe("Number of results (default 10)"),
      offset: z.number().min(0).optional().describe("Offset for pagination"),
      fields: z.string().optional().describe("Comma-separated fields to include"),
    },
    async ({ year, season, sort, limit, offset, fields }) => {
      const result = await getSeasonalAnime({
        year,
        season,
        sort,
        limit,
        offset,
        fields: fields ?? DEFAULT_ANIME_FIELDS.join(","),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_anime_suggestions",
    "Get personalized anime suggestions for the authenticated user. Authenticates via OAuth or mal_access_token parameter.",
    {
      mal_access_token: z.string().optional().describe("MAL OAuth2 access token (optional if authenticated via OAuth)"),
      limit: z.number().min(1).max(100).optional().describe("Number of results (default 10)"),
      offset: z.number().min(0).optional().describe("Offset for pagination"),
      fields: z.string().optional().describe("Comma-separated fields to include"),
    },
    async ({ mal_access_token, limit, offset, fields }, extra) => {
      const token = resolveToken(mal_access_token, extra);
      const result = await getAnimeSuggestions({
        accessToken: token,
        limit,
        offset,
        fields: fields ?? DEFAULT_ANIME_FIELDS.join(","),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "update_anime_list_status",
    "Update the status of an anime in the authenticated user's list. Authenticates via OAuth or mal_access_token parameter.",
    {
      mal_access_token: z.string().optional().describe("MAL OAuth2 access token (optional if authenticated via OAuth)"),
      anime_id: z.number().describe("MyAnimeList anime ID"),
      status: z.enum(ANIME_STATUS_VALUES).optional().describe("Watch status"),
      score: z.number().min(0).max(10).optional().describe("Score (0-10, 0 = no score)"),
      num_watched_episodes: z.number().min(0).optional().describe("Number of episodes watched"),
      is_rewatching: z.boolean().optional().describe("Whether rewatching"),
      priority: z.number().min(0).max(2).optional().describe("Priority (0-2)"),
      tags: z.string().optional().describe("Comma-separated tags"),
      comments: z.string().optional().describe("Comments"),
    },
    async ({
      mal_access_token,
      anime_id,
      status,
      score,
      num_watched_episodes,
      is_rewatching,
      priority,
      tags,
      comments,
    }, extra) => {
      const token = resolveToken(mal_access_token, extra);
      const result = await updateAnimeListStatus({
        accessToken: token,
        animeId: anime_id,
        status,
        score,
        numWatchedEpisodes: num_watched_episodes,
        isRewatching: is_rewatching,
        priority,
        tags,
        comments,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "delete_anime_list_status",
    "Remove an anime from the authenticated user's list. Authenticates via OAuth or mal_access_token parameter.",
    {
      mal_access_token: z.string().optional().describe("MAL OAuth2 access token (optional if authenticated via OAuth)"),
      anime_id: z.number().describe("MyAnimeList anime ID"),
    },
    async ({ mal_access_token, anime_id }, extra) => {
      const token = resolveToken(mal_access_token, extra);
      await deleteAnimeListStatus({
        accessToken: token,
        animeId: anime_id,
      });
      return { content: [{ type: "text", text: "Successfully deleted anime from list." }] };
    },
  );
}
