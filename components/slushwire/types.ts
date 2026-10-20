export type Category = 'qt' | 'pm' | 'reddit' | 'qcrit' | 'bluesky';
export type Edition = 'full' | 'page';
export type Counts = Record<Category | 'unique_agents', number>;
export interface Item {
  key: string;
  source: 'agents' | 'reddit' | 'bluesky';
  source_id: string;
  occurred_at: string;
  title: string;
  body: string;
  url: string;
  agency: string;
  status: string;
  qt: boolean;
  pm: boolean;
  comments: number;
  upvotes: number;
}
export interface OptionalItem {
  key: string;
  source: string;
  source_id: string;
  title: string;
  text: string;
  author: string;
  url: string;
}
export interface Slot { day: string; ids: Record<Category, string[]> }
export interface Channel { counts: Counts; slots: Slot[] }
export interface SlushWireIssue {
  schema_version: 1;
  mode: 'preview' | 'final';
  web: { slug: string; path: string; url: string; links_bound: boolean };
  context: { issue_id: string; issue_date: string; iso_week: number; iso_year: number; environment: string; revision: number };
  counts: Counts;
  channels: { email: Channel; full: Channel; page?: Channel };
  records: Record<string, Item>;
  quote: OptionalItem | null;
  bonus: OptionalItem[];
}
