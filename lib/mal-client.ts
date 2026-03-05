import { MAL_API_BASE_URL } from "./constants";
import { MalApiError, MalAuthError } from "./errors";

type AuthMode =
  | { type: "client_id"; clientId: string }
  | { type: "bearer"; accessToken: string };

async function malFetch<T>(
  path: string,
  auth: AuthMode,
  options?: { method?: string; body?: URLSearchParams },
): Promise<T> {
  const headers: Record<string, string> = {};

  if (auth.type === "client_id") {
    headers["X-MAL-CLIENT-ID"] = auth.clientId;
  } else {
    headers["Authorization"] = `Bearer ${auth.accessToken}`;
  }

  const url = `${MAL_API_BASE_URL}${path}`;
  const fetchOptions: RequestInit = {
    method: options?.method ?? "GET",
    headers,
  };

  if (options?.body) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    fetchOptions.body = options.body.toString();
  }

  const res = await fetch(url, fetchOptions);

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw MalApiError.fromResponse(res.status, body);
  }

  return res.json() as Promise<T>;
}

function clientAuth(): AuthMode {
  const clientId = process.env.MAL_CLIENT_ID;
  if (!clientId) throw new MalAuthError("MAL_CLIENT_ID is not set");
  return { type: "client_id", clientId };
}

function bearerAuth(accessToken: string): AuthMode {
  if (!accessToken) throw new MalAuthError("Access token is required");
  return { type: "bearer", accessToken };
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

// ─── Anime ────────────────────────────────────────────────

export async function searchAnime(params: {
  q: string;
  limit?: number;
  offset?: number;
  fields?: string;
}) {
  const query = buildQuery({
    q: params.q,
    limit: params.limit ?? 10,
    offset: params.offset,
    fields: params.fields,
  });
  return malFetch(`/anime${query}`, clientAuth());
}

export async function getAnimeDetails(params: {
  animeId: number;
  fields?: string;
}) {
  const query = buildQuery({ fields: params.fields });
  return malFetch(`/anime/${params.animeId}${query}`, clientAuth());
}

export async function getAnimeRanking(params: {
  rankingType: string;
  limit?: number;
  offset?: number;
  fields?: string;
}) {
  const query = buildQuery({
    ranking_type: params.rankingType,
    limit: params.limit ?? 10,
    offset: params.offset,
    fields: params.fields,
  });
  return malFetch(`/anime/ranking${query}`, clientAuth());
}

export async function getSeasonalAnime(params: {
  year: number;
  season: string;
  sort?: string;
  limit?: number;
  offset?: number;
  fields?: string;
}) {
  const query = buildQuery({
    sort: params.sort,
    limit: params.limit ?? 10,
    offset: params.offset,
    fields: params.fields,
  });
  return malFetch(
    `/anime/season/${params.year}/${params.season}${query}`,
    clientAuth(),
  );
}

export async function getAnimeSuggestions(params: {
  accessToken: string;
  limit?: number;
  offset?: number;
  fields?: string;
}) {
  const query = buildQuery({
    limit: params.limit ?? 10,
    offset: params.offset,
    fields: params.fields,
  });
  return malFetch(
    `/anime/suggestions${query}`,
    bearerAuth(params.accessToken),
  );
}

// ─── Anime List ───────────────────────────────────────────

export async function updateAnimeListStatus(params: {
  accessToken: string;
  animeId: number;
  status?: string;
  score?: number;
  numWatchedEpisodes?: number;
  isRewatching?: boolean;
  priority?: number;
  tags?: string;
  comments?: string;
}) {
  const body = new URLSearchParams();
  if (params.status) body.set("status", params.status);
  if (params.score !== undefined) body.set("score", String(params.score));
  if (params.numWatchedEpisodes !== undefined)
    body.set("num_watched_episodes", String(params.numWatchedEpisodes));
  if (params.isRewatching !== undefined)
    body.set("is_rewatching", String(params.isRewatching));
  if (params.priority !== undefined)
    body.set("priority", String(params.priority));
  if (params.tags) body.set("tags", params.tags);
  if (params.comments) body.set("comments", params.comments);

  return malFetch(
    `/anime/${params.animeId}/my_list_status`,
    bearerAuth(params.accessToken),
    { method: "PATCH", body },
  );
}

export async function deleteAnimeListStatus(params: {
  accessToken: string;
  animeId: number;
}) {
  return malFetch(
    `/anime/${params.animeId}/my_list_status`,
    bearerAuth(params.accessToken),
    { method: "DELETE" },
  );
}

// ─── Manga ────────────────────────────────────────────────

export async function searchManga(params: {
  q: string;
  limit?: number;
  offset?: number;
  fields?: string;
}) {
  const query = buildQuery({
    q: params.q,
    limit: params.limit ?? 10,
    offset: params.offset,
    fields: params.fields,
  });
  return malFetch(`/manga${query}`, clientAuth());
}

export async function getMangaDetails(params: {
  mangaId: number;
  fields?: string;
}) {
  const query = buildQuery({ fields: params.fields });
  return malFetch(`/manga/${params.mangaId}${query}`, clientAuth());
}

export async function getMangaRanking(params: {
  rankingType: string;
  limit?: number;
  offset?: number;
  fields?: string;
}) {
  const query = buildQuery({
    ranking_type: params.rankingType,
    limit: params.limit ?? 10,
    offset: params.offset,
    fields: params.fields,
  });
  return malFetch(`/manga/ranking${query}`, clientAuth());
}

// ─── Manga List ───────────────────────────────────────────

export async function updateMangaListStatus(params: {
  accessToken: string;
  mangaId: number;
  status?: string;
  score?: number;
  numVolumesRead?: number;
  numChaptersRead?: number;
  isRereading?: boolean;
  priority?: number;
  tags?: string;
  comments?: string;
}) {
  const body = new URLSearchParams();
  if (params.status) body.set("status", params.status);
  if (params.score !== undefined) body.set("score", String(params.score));
  if (params.numVolumesRead !== undefined)
    body.set("num_volumes_read", String(params.numVolumesRead));
  if (params.numChaptersRead !== undefined)
    body.set("num_chapters_read", String(params.numChaptersRead));
  if (params.isRereading !== undefined)
    body.set("is_rereading", String(params.isRereading));
  if (params.priority !== undefined)
    body.set("priority", String(params.priority));
  if (params.tags) body.set("tags", params.tags);
  if (params.comments) body.set("comments", params.comments);

  return malFetch(
    `/manga/${params.mangaId}/my_list_status`,
    bearerAuth(params.accessToken),
    { method: "PATCH", body },
  );
}

export async function deleteMangaListStatus(params: {
  accessToken: string;
  mangaId: number;
}) {
  return malFetch(
    `/manga/${params.mangaId}/my_list_status`,
    bearerAuth(params.accessToken),
    { method: "DELETE" },
  );
}

// ─── User ─────────────────────────────────────────────────

export async function getMyUserInfo(params: {
  accessToken: string;
  fields?: string;
}) {
  const query = buildQuery({
    fields: params.fields ?? "anime_statistics",
  });
  return malFetch(`/users/@me${query}`, bearerAuth(params.accessToken));
}

export async function getUserAnimeList(params: {
  username: string;
  accessToken?: string;
  status?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  fields?: string;
}) {
  const query = buildQuery({
    status: params.status,
    sort: params.sort,
    limit: params.limit ?? 10,
    offset: params.offset,
    fields: params.fields,
  });
  const auth = params.accessToken ? bearerAuth(params.accessToken) : clientAuth();
  return malFetch(`/users/${params.username}/animelist${query}`, auth);
}

export async function getUserMangaList(params: {
  username: string;
  accessToken?: string;
  status?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  fields?: string;
}) {
  const query = buildQuery({
    status: params.status,
    sort: params.sort,
    limit: params.limit ?? 10,
    offset: params.offset,
    fields: params.fields,
  });
  const auth = params.accessToken ? bearerAuth(params.accessToken) : clientAuth();
  return malFetch(`/users/${params.username}/mangalist${query}`, auth);
}

// ─── Forum ────────────────────────────────────────────────

export async function getForumBoards() {
  return malFetch("/forum/boards", clientAuth());
}

export async function getForumTopic(params: {
  topicId: number;
  limit?: number;
  offset?: number;
}) {
  const query = buildQuery({
    limit: params.limit ?? 20,
    offset: params.offset,
  });
  return malFetch(`/forum/topic/${params.topicId}${query}`, clientAuth());
}

export async function searchForumTopics(params: {
  q?: string;
  boardId?: number;
  subboardId?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  topicUserName?: string;
  userName?: string;
}) {
  const query = buildQuery({
    q: params.q,
    board_id: params.boardId,
    subboard_id: params.subboardId,
    limit: params.limit ?? 20,
    offset: params.offset,
    sort: params.sort,
    topic_user_name: params.topicUserName,
    user_name: params.userName,
  });
  return malFetch(`/forum/topics${query}`, clientAuth());
}
