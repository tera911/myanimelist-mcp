# MyAnimeList MCP Server

[MyAnimeList API v2](https://myanimelist.net/apiconfig/references/api/v2) をラップした [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) サーバです。

Streamable HTTP トランスポートに対応しており、Claude Desktop や Cursor などの MCP クライアントに URL で登録できます。

## Features

- 17個の MCP ツール（アニメ検索・ランキング・シーズン、マンガ検索、ユーザーリスト、フォーラム等）
- MCP 標準 OAuth 認証フロー（MCP Inspector / Claude Desktop / Claude Code 対応）
- MAL OAuth2 PKCE をステートレスにプロキシ（サーバー側にDB不要）
- Vercel デプロイ対応

## セットアップ

### 1. MAL API の登録

[MyAnimeList API Config](https://myanimelist.net/apiconfig) でアプリを作成し、Client ID と Client Secret を取得します。

Redirect URL には `http://localhost:3000/oauth/callback` を設定してください。

### 2. 環境変数

```bash
cp .env.example .env.local
```

```env
MAL_CLIENT_ID=your_client_id
MAL_CLIENT_SECRET=your_client_secret
```

### 3. 起動

```bash
npm install
npm run dev
```

`http://localhost:3000` でサーバーが起動します。

## MCP クライアントへの登録

### Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "myanimelist": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

### MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

URL に `http://localhost:3000/api/mcp` を入力して接続します。

## ツール一覧

### アニメ
| ツール | 説明 | 認証 |
|--------|------|------|
| `search_anime` | キーワードでアニメ検索 | 不要 |
| `get_anime_details` | アニメ詳細情報取得 | 不要 |
| `get_anime_ranking` | アニメランキング取得 | 不要 |
| `get_seasonal_anime` | シーズン別アニメ取得 | 不要 |
| `get_anime_suggestions` | おすすめアニメ取得 | 必要 |
| `update_anime_list_status` | アニメリスト更新 | 必要 |
| `delete_anime_list_status` | アニメリストから削除 | 必要 |

### マンガ
| ツール | 説明 | 認証 |
|--------|------|------|
| `search_manga` | キーワードでマンガ検索 | 不要 |
| `get_manga_details` | マンガ詳細情報取得 | 不要 |
| `get_manga_ranking` | マンガランキング取得 | 不要 |
| `update_manga_list_status` | マンガリスト更新 | 必要 |
| `delete_manga_list_status` | マンガリストから削除 | 必要 |

### ユーザー
| ツール | 説明 | 認証 |
|--------|------|------|
| `get_my_user_info` | 認証ユーザーのプロフィール取得 | 必要 |
| `get_user_animelist` | ユーザーのアニメリスト取得 | `@me` は必要 |
| `get_user_mangalist` | ユーザーのマンガリスト取得 | `@me` は必要 |

### フォーラム
| ツール | 説明 | 認証 |
|--------|------|------|
| `get_forum_boards` | フォーラムボード一覧取得 | 不要 |
| `get_forum_topic` | トピックの投稿取得 | 不要 |
| `search_forum_topics` | フォーラムトピック検索 | 不要 |

## デプロイ

```bash
npm run build
```

Vercel にデプロイする場合は環境変数を Vercel Dashboard で設定してください。
本番環境では MAL App の Redirect URL を `https://your-domain.vercel.app/oauth/callback` に更新する必要があります。

## License

MIT
