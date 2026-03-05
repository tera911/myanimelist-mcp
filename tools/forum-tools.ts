import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  getForumBoards,
  getForumTopic,
  searchForumTopics,
} from "@/lib/mal-client";

export function registerForumTools(server: McpServer) {
  server.tool(
    "get_forum_boards",
    "Get the list of forum boards on MyAnimeList",
    {},
    async () => {
      const result = await getForumBoards();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_forum_topic",
    "Get posts from a specific forum topic by topic ID",
    {
      topic_id: z.number().describe("Forum topic ID"),
      limit: z.number().min(1).max(100).optional().describe("Number of posts to return (default 20)"),
      offset: z.number().min(0).optional().describe("Offset for pagination"),
    },
    async ({ topic_id, limit, offset }) => {
      const result = await getForumTopic({
        topicId: topic_id,
        limit,
        offset,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "search_forum_topics",
    "Search for forum topics on MyAnimeList",
    {
      q: z.string().optional().describe("Search keyword"),
      board_id: z.number().optional().describe("Board ID to search in"),
      subboard_id: z.number().optional().describe("Subboard ID to search in"),
      limit: z.number().min(1).max(100).optional().describe("Number of results (default 20)"),
      offset: z.number().min(0).optional().describe("Offset for pagination"),
      sort: z.string().optional().describe("Sort option (e.g. recent)"),
      topic_user_name: z.string().optional().describe("Filter by topic creator username"),
      user_name: z.string().optional().describe("Filter by username who posted"),
    },
    async ({ q, board_id, subboard_id, limit, offset, sort, topic_user_name, user_name }) => {
      const result = await searchForumTopics({
        q,
        boardId: board_id,
        subboardId: subboard_id,
        limit,
        offset,
        sort,
        topicUserName: topic_user_name,
        userName: user_name,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );
}
