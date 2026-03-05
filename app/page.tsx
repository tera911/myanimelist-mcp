export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const mcpUrl = `${baseUrl}/api/mcp`;

  return (
    <div
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        maxWidth: 720,
        margin: "0 auto",
        padding: "60px 20px",
        background: "#1a1a2e",
        minHeight: "100vh",
        color: "#e0e0e0",
      }}
    >
      <h1 style={{ color: "#2e86de", fontSize: 32 }}>
        MyAnimeList MCP Server
      </h1>
      <p style={{ color: "#a0a0a0", lineHeight: 1.6 }}>
        This is a Model Context Protocol (MCP) server that wraps the MyAnimeList
        API v2. It provides 17 tools for searching anime/manga, viewing
        rankings, managing lists, and more.
      </p>

      <div
        style={{
          background: "#16213e",
          border: "1px solid #0f3460",
          borderRadius: 8,
          padding: 24,
          marginTop: 32,
        }}
      >
        <h2 style={{ color: "#2e86de", fontSize: 20, marginTop: 0 }}>
          Quick Start
        </h2>
        <p style={{ marginBottom: 8, color: "#a0a0a0", fontSize: 14 }}>
          Add this server to your MCP client configuration:
        </p>
        <pre
          style={{
            background: "#0a0a1a",
            padding: 16,
            borderRadius: 4,
            overflow: "auto",
            fontSize: 14,
          }}
        >
{JSON.stringify(
  {
    mcpServers: {
      myanimelist: {
        type: "http",
        url: mcpUrl,
      },
    },
  },
  null,
  2,
)}
        </pre>
      </div>

      <div
        style={{
          background: "#16213e",
          border: "1px solid #0f3460",
          borderRadius: 8,
          padding: 24,
          marginTop: 24,
        }}
      >
        <h2 style={{ color: "#2e86de", fontSize: 20, marginTop: 0 }}>
          Available Tools
        </h2>
        <div style={{ fontSize: 14, lineHeight: 1.8 }}>
          <h3 style={{ color: "#e94560", fontSize: 16 }}>Anime (7 tools)</h3>
          <ul>
            <li><code>search_anime</code> - Search for anime by keyword</li>
            <li><code>get_anime_details</code> - Get detailed anime info by ID</li>
            <li><code>get_anime_ranking</code> - Get anime rankings</li>
            <li><code>get_seasonal_anime</code> - Get seasonal anime list</li>
            <li><code>get_anime_suggestions</code> - Get personalized suggestions *</li>
            <li><code>update_anime_list_status</code> - Update anime list entry *</li>
            <li><code>delete_anime_list_status</code> - Remove anime from list *</li>
          </ul>

          <h3 style={{ color: "#e94560", fontSize: 16 }}>Manga (5 tools)</h3>
          <ul>
            <li><code>search_manga</code> - Search for manga by keyword</li>
            <li><code>get_manga_details</code> - Get detailed manga info by ID</li>
            <li><code>get_manga_ranking</code> - Get manga rankings</li>
            <li><code>update_manga_list_status</code> - Update manga list entry *</li>
            <li><code>delete_manga_list_status</code> - Remove manga from list *</li>
          </ul>

          <h3 style={{ color: "#e94560", fontSize: 16 }}>User (3 tools)</h3>
          <ul>
            <li><code>get_my_user_info</code> - Get authenticated user profile *</li>
            <li><code>get_user_animelist</code> - Get user anime list</li>
            <li><code>get_user_mangalist</code> - Get user manga list</li>
          </ul>

          <h3 style={{ color: "#e94560", fontSize: 16 }}>Forum (3 tools)</h3>
          <ul>
            <li><code>get_forum_boards</code> - List forum boards</li>
            <li><code>get_forum_topic</code> - Get forum topic posts</li>
            <li><code>search_forum_topics</code> - Search forum topics</li>
          </ul>

          <p style={{ color: "#a0a0a0", fontSize: 12, marginTop: 16 }}>
            * Requires MAL OAuth2 access token
          </p>
        </div>
      </div>

      <div
        style={{
          background: "#16213e",
          border: "1px solid #0f3460",
          borderRadius: 8,
          padding: 24,
          marginTop: 24,
        }}
      >
        <h2 style={{ color: "#2e86de", fontSize: 20, marginTop: 0 }}>
          Authentication
        </h2>
        <p style={{ fontSize: 14, color: "#a0a0a0" }}>
          Tools marked with * require a MAL access token. To obtain one:
        </p>
        <ol style={{ fontSize: 14, lineHeight: 1.8 }}>
          <li>
            Visit{" "}
            <a
              href="/auth/mal/authorize"
              style={{ color: "#2e86de" }}
            >
              /auth/mal/authorize
            </a>{" "}
            to start the OAuth flow
          </li>
          <li>Authorize the application on MyAnimeList</li>
          <li>
            Use the returned access token as the{" "}
            <code>mal_access_token</code> parameter
          </li>
        </ol>
      </div>
    </div>
  );
}
