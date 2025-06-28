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
  extra_interest?: string;
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
  data: {
    bluesky_posts: BlueskyPost[];
    pm_blips: Blips[];
    qt_blips: Blips[];
    reddit_posts: RedditPost[];
  };
};
