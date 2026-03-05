export interface MalPicture {
  medium?: string;
  large?: string;
}

export interface MalAlternativeTitles {
  synonyms?: string[];
  en?: string;
  ja?: string;
}

export interface MalGenre {
  id: number;
  name: string;
}

export interface MalSeason {
  year: number;
  season: string;
}

export interface MalStudio {
  id: number;
  name: string;
}

export interface MalAnimeListStatus {
  status?: string;
  score?: number;
  num_episodes_watched?: number;
  is_rewatching?: boolean;
  updated_at?: string;
  start_date?: string;
  finish_date?: string;
  priority?: number;
  tags?: string[];
  comments?: string;
}

export interface MalAnime {
  id: number;
  title: string;
  main_picture?: MalPicture;
  alternative_titles?: MalAlternativeTitles;
  start_date?: string;
  end_date?: string;
  synopsis?: string;
  mean?: number;
  rank?: number;
  popularity?: number;
  num_list_users?: number;
  num_scoring_users?: number;
  nsfw?: string;
  genres?: MalGenre[];
  media_type?: string;
  status?: string;
  num_episodes?: number;
  start_season?: MalSeason;
  source?: string;
  average_episode_duration?: number;
  rating?: string;
  studios?: MalStudio[];
  pictures?: MalPicture[];
  background?: string;
  related_anime?: MalRelatedEntry[];
  related_manga?: MalRelatedEntry[];
  recommendations?: MalRecommendation[];
  statistics?: MalStatistics;
  my_list_status?: MalAnimeListStatus;
}

export interface MalRelatedEntry {
  node: { id: number; title: string; main_picture?: MalPicture };
  relation_type: string;
  relation_type_formatted: string;
}

export interface MalRecommendation {
  node: { id: number; title: string; main_picture?: MalPicture };
  num_recommendations: number;
}

export interface MalStatistics {
  status: {
    watching: string;
    completed: string;
    on_hold: string;
    dropped: string;
    plan_to_watch: string;
  };
  num_list_users: number;
}

export interface MalMangaListStatus {
  status?: string;
  score?: number;
  num_volumes_read?: number;
  num_chapters_read?: number;
  is_rereading?: boolean;
  updated_at?: string;
  start_date?: string;
  finish_date?: string;
  priority?: number;
  tags?: string[];
  comments?: string;
}

export interface MalAuthor {
  node: {
    id: number;
    first_name: string;
    last_name: string;
  };
  role: string;
}

export interface MalManga {
  id: number;
  title: string;
  main_picture?: MalPicture;
  alternative_titles?: MalAlternativeTitles;
  start_date?: string;
  end_date?: string;
  synopsis?: string;
  mean?: number;
  rank?: number;
  popularity?: number;
  num_list_users?: number;
  num_scoring_users?: number;
  nsfw?: string;
  genres?: MalGenre[];
  media_type?: string;
  status?: string;
  num_volumes?: number;
  num_chapters?: number;
  authors?: MalAuthor[];
  pictures?: MalPicture[];
  background?: string;
  related_anime?: MalRelatedEntry[];
  related_manga?: MalRelatedEntry[];
  recommendations?: MalRecommendation[];
  my_list_status?: MalMangaListStatus;
}

export interface MalUser {
  id: number;
  name: string;
  picture?: string;
  gender?: string;
  birthday?: string;
  location?: string;
  joined_at?: string;
  anime_statistics?: {
    num_items_watching: number;
    num_items_completed: number;
    num_items_on_hold: number;
    num_items_dropped: number;
    num_items_plan_to_watch: number;
    num_items: number;
    num_days_watched: number;
    num_days_watching: number;
    num_days_completed: number;
    num_days_on_hold: number;
    num_days_dropped: number;
    num_days: number;
    num_episodes: number;
    num_times_rewatched: number;
    mean_score: number;
  };
  time_zone?: string;
  is_supporter?: boolean;
}

export interface MalForumBoard {
  id: number;
  title: string;
  description: string;
  subboards?: MalForumBoard[];
}

export interface MalForumCategory {
  title: string;
  boards: MalForumBoard[];
}

export interface MalForumTopicSummary {
  id: number;
  title: string;
  created_at: string;
  created_by: { id: number; name: string };
  number_of_posts: number;
  last_post_created_at: string;
  last_post_created_by: { id: number; name: string };
  is_locked: boolean;
}

export interface MalForumPost {
  id: number;
  number: number;
  created_at: string;
  created_by: { id: number; name: string };
  body: string;
  signature: string;
}

export interface MalForumTopic {
  title: string;
  posts: MalForumPost[];
  poll?: {
    id: number;
    question: string;
    close_status: string;
    options: { id: number; text: string; votes: number }[];
  };
}

export interface MalListResponse<T> {
  data: { node: T }[];
  paging: {
    previous?: string;
    next?: string;
  };
}

export interface MalRankingResponse<T> {
  data: { node: T; ranking: { rank: number } }[];
  paging: {
    previous?: string;
    next?: string;
  };
}

export interface MalOAuthToken {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}
