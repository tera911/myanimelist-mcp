# MyAnimeList MCP Server

MyAnimeList API v2をラップしたMCPサーバ。Streamable HTTPトランスポートでURL登録可能。

## 技術スタック
- Next.js 15 (App Router) + TypeScript
- `mcp-handler` + `@modelcontextprotocol/sdk`
- Vercelデプロイ対応

## コマンド
- `npm run dev` — 開発サーバ起動
- `npm run build` — ビルド
- `npm run start` — プロダクション起動

## プロジェクト構造
- `app/mcp/route.ts` — MCPエンドポイント (Streamable HTTP at `/mcp`)
- `app/oauth/` — MCP OAuth プロキシ (authorize, callback, token, register)
- `app/.well-known/` — OAuth ディスカバリ (RFC 9728, RFC 8414)
- `tools/` — MCPツール定義 (anime, manga, user, forum)
- `lib/mal-client.ts` — MAL API HTTPクライアント
- `lib/oauth-utils.ts` — AES-256-GCM暗号化、PKCE検証

## 認証
- **公開ツール**: `X-MAL-CLIENT-ID` ヘッダー (環境変数 `MAL_CLIENT_ID`)
- **認証ツール**: OAuth Bearer トークン (`extra.authInfo?.token`)
- MCP OAuth → MAL OAuth2 PKCEをステートレスにプロキシ (暗号化stateパラメータ)

## 環境変数
- `MAL_CLIENT_ID` — 必須
- `MAL_CLIENT_SECRET` — OAuth token交換・暗号化キー導出に使用

## MAL API仕様
https://myanimelist.net/apiconfig/references/api/v2
