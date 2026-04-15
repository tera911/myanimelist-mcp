# Architecture

## レイヤー構成

```
MCPクライアント (Claude等)
  │ Streamable HTTP
  ▼
app/mcp/route.ts
  ├── withMcpAuth (optional) … Bearer token → authInfo.token
  └── createMcpHandler       … McpServer にツール登録
  │
  ▼
tools/ — MCPツール定義 (18ツール)
  ├── anime-tools.ts  (7)  search, details, ranking, seasonal,
  │                         suggestions, update/delete list
  ├── manga-tools.ts  (5)  search, details, ranking,
  │                         update/delete list
  ├── user-tools.ts   (3)  my info, anime list, manga list
  └── forum-tools.ts  (3)  boards, topic, search
  │
  ▼
lib/mal-client.ts — MAL API HTTPクライアント
  ├── malFetch<T>()   共通fetch
  ├── AuthMode        client_id | bearer
  └── buildQuery()    クエリストリング組み立て
  │
  ▼ HTTPS
https://api.myanimelist.net/v2
```

## 認証

### 公開ツール vs 認証ツール

- **公開ツール** (search, details, ranking等): `X-MAL-CLIENT-ID` ヘッダーで動作。ユーザー認証不要。
- **認証ツール** (suggestions, list更新等): MAL OAuth2 アクセストークンが必要。

各ツールの `resolveToken()` が以下の優先順でトークンを解決:

1. `extra.authInfo.token` — MCP OAuth 経由の Bearer 認証
2. `mal_access_token` パラメータ — 直接指定

### OAuth プロキシ (ステートレス)

MCPクライアントの OAuth2 フローを**サーバー側ストレージなし**で中継する。

```
MCPクライアント              このサーバ                    MAL
  │                            │                           │
  │─ GET /oauth/authorize ───▶│                           │
  │  (redirect_uri,           │                           │
  │   code_challenge)         │                           │
  │                            │ state = AES暗号化({      │
  │                            │   client params,         │
  │                            │   mal_code_verifier      │
  │                            │ })                        │
  │                            │─ redirect ──────────────▶│
  │                            │                     MAL認証画面
  │                            │◀ callback (code, state) ─│
  │                            │                           │
  │                            │ state復号                 │
  │                            │─ POST token ────────────▶│
  │                            │◀ MALトークン ────────────│
  │                            │                           │
  │                            │ auth_code = AES暗号化({  │
  │                            │   access_token,          │
  │                            │   code_challenge         │
  │                            │ })                        │
  │◀ redirect (auth_code) ────│                           │
  │                            │                           │
  │─ POST /oauth/token ──────▶│                           │
  │  (auth_code,              │ 復号 → PKCE検証 → 返却   │
  │   code_verifier)          │                           │
  │◀ { access_token } ────────│                           │
```

#### ステートレスの仕組み

`lib/oauth-utils.ts` の **AES-256-GCM** で中間状態を暗号化し、パラメータに埋め込む:

- **鍵導出**: `MAL_CLIENT_SECRET` から `scrypt` で 256bit 鍵を生成
- **authorize**: クライアントのリダイレクトURIや code_challenge、MAL用 code_verifier を暗号化して MAL の `state` パラメータに格納
- **callback**: `state` を復号 → MAL のコード交換を実行 → MAL トークンと PKCE 情報を暗号化して auth_code としてクライアントへ返却
- **token**: auth_code を復号 → PKCE 検証 → MAL アクセストークンを返却 (有効期限 5分)

DB・Redis・セッションストア一切不要。

## ディスカバリ

- `/.well-known/oauth-protected-resource` — RFC 9728 リソースメタデータ
- `/.well-known/oauth-authorization-server` — RFC 8414 認可サーバメタデータ
- `/oauth/register` — 動的クライアント登録 (任意のクライアントを受け入れ)

## 環境変数

| 変数 | 用途 |
|---|---|
| `MAL_CLIENT_ID` | 公開APIアクセス (必須) |
| `MAL_CLIENT_SECRET` | OAuth token交換 + AES暗号化キー導出 |
| `NEXT_PUBLIC_BASE_URL` | デプロイURL |
