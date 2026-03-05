export const MAL_API_BASE_URL = "https://api.myanimelist.net/v2";
export const MAL_AUTH_URL = "https://myanimelist.net/v1/oauth2/authorize";
export const MAL_TOKEN_URL = "https://myanimelist.net/v1/oauth2/token";

export const DEFAULT_ANIME_FIELDS = [
  "id",
  "title",
  "main_picture",
  "alternative_titles",
  "start_date",
  "end_date",
  "synopsis",
  "mean",
  "rank",
  "popularity",
  "num_list_users",
  "num_scoring_users",
  "nsfw",
  "genres",
  "media_type",
  "status",
  "num_episodes",
  "start_season",
  "source",
  "average_episode_duration",
  "rating",
  "studios",
] as const;

export const DETAIL_ANIME_FIELDS = [
  ...DEFAULT_ANIME_FIELDS,
  "pictures",
  "background",
  "related_anime",
  "related_manga",
  "recommendations",
  "statistics",
  "my_list_status",
] as const;

export const DEFAULT_MANGA_FIELDS = [
  "id",
  "title",
  "main_picture",
  "alternative_titles",
  "start_date",
  "end_date",
  "synopsis",
  "mean",
  "rank",
  "popularity",
  "num_list_users",
  "num_scoring_users",
  "nsfw",
  "genres",
  "media_type",
  "status",
  "num_volumes",
  "num_chapters",
  "authors{first_name,last_name}",
] as const;

export const DETAIL_MANGA_FIELDS = [
  ...DEFAULT_MANGA_FIELDS,
  "pictures",
  "background",
  "related_anime",
  "related_manga",
  "recommendations",
  "my_list_status",
] as const;

export const DEFAULT_USER_ANIME_FIELDS = [
  "list_status{status,score,num_episodes_watched,is_rewatching,updated_at}",
] as const;

export const DEFAULT_USER_MANGA_FIELDS = [
  "list_status{status,score,num_volumes_read,num_chapters_read,is_rereading,updated_at}",
] as const;

export const ANIME_RANKING_TYPES = [
  "all",
  "airing",
  "upcoming",
  "tv",
  "ova",
  "movie",
  "special",
  "bypopularity",
  "favorite",
] as const;

export const MANGA_RANKING_TYPES = [
  "all",
  "manga",
  "novels",
  "oneshots",
  "doujin",
  "manhwa",
  "manhua",
  "bypopularity",
  "favorite",
] as const;

export const SEASONS = ["winter", "spring", "summer", "fall"] as const;

export const ANIME_STATUS_VALUES = [
  "watching",
  "completed",
  "on_hold",
  "dropped",
  "plan_to_watch",
] as const;

export const MANGA_STATUS_VALUES = [
  "reading",
  "completed",
  "on_hold",
  "dropped",
  "plan_to_read",
] as const;

export const SORT_OPTIONS = [
  "list_score",
  "list_updated_at",
  "anime_title",
  "anime_start_date",
  "anime_id",
] as const;

export const MANGA_SORT_OPTIONS = [
  "list_score",
  "list_updated_at",
  "manga_title",
  "manga_start_date",
  "manga_id",
] as const;
