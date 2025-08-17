export type BlueskyPost = {
  author_did: string;
  created_at: string;
  datetime: string;
  hashtag: string;
  id: string;
  post_id: string;
  text: string;
  updated_at: string;
  url: string;
  username: string;
};

export type Blips = {
  aala_member?: string;
  agency: string;
  bio: string;
  clients?: string;
  company: string;
  created_at: string;
  dont_send?: string;
  email: string;
  extra_interest?: string | null;
  extra_links?: string;
  favorites: string;
  genres: string;
  id: string;
  location: string;
  name: string;
  open_to_queries?: string;
  pubmarketplace?: string;
  querymanager?: string;
  querytracker?: string;
  sales?: string;
  submission_req: string;
  twitter_handle: string;
  twitter_url: string;
  updated: string;
  updated_at: string;
  website: string;
};

export type RedditPost = {
  author: string;
  comments_count: string;
  content: string;
  created_at: string;
  datetime_posted: string;
  headline: string;
  id: string;
  post_link: string;
  updated_at: string;
  upvotes: string;
};

export type SlushFeed = {
  agent_activity: Blips[];
  bluesky: BlueskyPost[];
  new_openings: Blips[];
  reddit: RedditPost[];
};

export type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

export type ClerkUserEventData = {
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
};

export type KitTag = {
  name: string;
};

export type KitSubscriberRequestBody = {
  email_address: string;
  tags?: KitTag[];
};

export interface KitSubscriber {
  id: number | string;
  email_address: string;
}

export interface KitListResponse {
  subscribers?: KitSubscriber[];
}

// Kit API response types
export interface KitTagWithId {
  id: number;
  name: string;
  created_at: string;
}

export interface KitTagsResponse {
  tags?: KitTagWithId[];
  pagination?: {
    has_previous_page: boolean;
    has_next_page: boolean;
    start_cursor: string;
    end_cursor: string;
    per_page: number;
  };
}
