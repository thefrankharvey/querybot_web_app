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

export type FeedItem =
  | { type: "bluesky"; data: BlueskyPost }
  | { type: "reddit"; data: RedditPost }
  | { type: "new_opening"; data: Blips }
  | { type: "agent_activity"; data: Blips };

export type FlattenedSlushFeed = FeedItem[];

export type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

export type ClerkUserEventData = {
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
  public_metadata?: {
    isSubscribed?: boolean;
    [key: string]: unknown;
  };
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

// JSON-LD types used for blog posts
export interface JsonLdPerson {
  "@type": "Person";
  name: string;
}

export interface JsonLdWebPage {
  "@type": "WebPage";
  "@id": string;
}

export interface BlogPostingJsonLd {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  headline: string;
  datePublished: string;
  dateModified: string;
  url: string;
  image?: string[];
  author?: JsonLdPerson;
  mainEntityOfPage?: JsonLdWebPage;
}

export type AgentMatch = {
  id: string;
  user_id: string;
  name: string;
  email?: string | null;
  agency?: string | null;
  agency_url?: string | null;
  index_id?: string | null;
  query_tracker?: string | null;
  pub_marketplace?: string | null;
  match_score?: number | null;
  created_at: string; // ISO timestamp
};

// Type for the POST payload matching the API expectations
export interface SaveAgentPayload {
  name: string;
  email?: string | null;
  agency?: string | null;
  agency_url?: string | null;
  index_id?: string | null;
  query_tracker?: string | null;
  pub_marketplace?: string | null;
  match_score?: number | null;
}

// Type for the API response
export interface SaveAgentResponse {
  created: Array<{
    id: string;
    user_id: string;
    name: string;
    email?: string | null;
    agency?: string | null;
    agency_url?: string | null;
    index_id?: string | null;
    query_tracker?: string | null;
    pub_marketplace?: string | null;
    match_score?: number | null;
    created_at: string; // ISO timestamp
  }>;
}

export type FetchAgentResponse = {
  agent: {
    id: string;
    name: string;
    email?: string;
    agency?: string;
    clients?: string;
    favorites?: string;
    extra_interest?: string;
    pubmarketplace?: string;
    normalized_score?: number;
    status?: string;
    agency_url?: string;
    negatives?: string;
    querymanager?: string;
    querytracker?: string;
    query_tracker?: string;
    pub_marketplace?: string;
    website?: string;
    sales?: string;
    match_score?: number;
    bio?: string;
    genres?: string;
    submission_req?: string;
    [key: string]: unknown;
  };
};
