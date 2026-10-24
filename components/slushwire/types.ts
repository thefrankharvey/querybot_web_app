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
interface SlushWireIssueBase {
  mode: 'preview' | 'final';
  web: { slug: string; path: string; url: string; links_bound: boolean };
  counts: Counts;
  records: Record<string, Item>;
  quote: OptionalItem | null;
  bonus: OptionalItem[];
}
/** Weekly edition (legacy pages). */
export interface SlushWireIssueV1 extends SlushWireIssueBase {
  schema_version: 1;
  context: { issue_id: string; issue_date: string; iso_week: number; iso_year: number; environment: string; revision: number };
  channels: { email: Channel; full: Channel; page?: Channel };
}
/** Daily edition: issue_date is the send date; coverage is the inclusive day range shown. */
export interface SlushWireIssueV2 extends SlushWireIssueBase {
  schema_version: 2;
  context: {
    issue_id: string; issue_date: string; send_date: string;
    coverage_start: string; coverage_end: string; environment: string; revision: number;
  };
  channels: { email: Channel & { omitted: number }; full: Channel };
}
export type SlushWireIssue = SlushWireIssueV1 | SlushWireIssueV2;
