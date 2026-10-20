import type { Category, Edition, Item, SlushWireIssue } from './types';
import './slushwire.css';

const categories: Category[] = ['qt', 'pm', 'reddit', 'qcrit', 'bluesky'];
const labels: Record<Category, string> = {
  qt: 'Submission status', pm: 'Agent activity', reddit: 'From Reddit',
  qcrit: 'Query critiques', bluesky: 'From Bluesky',
};

function dateLabel(day: string, long = false) {
  // Calendar dates must never shift into the previous day in a visitor's timezone.
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', weekday: long ? 'long' : 'short', month: 'long', day: 'numeric',
    ...(long ? { year: 'numeric' as const } : {}),
  }).format(new Date(`${day}T12:00:00Z`));
}

function publicLink(value: string): string | undefined {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !host.includes('.') || host.endsWith('.invalid') || host.endsWith('.local') ||
        host.endsWith('.internal') || host.endsWith('.localhost') || host.endsWith('.test') ||
        /^[\d.]+$/.test(host) || host.includes(':')) return undefined;
    return value;
  } catch { return undefined; }
}

function SourceItem({ item, category }: { item: Item; category: Category }) {
  const href = publicLink(item.url);
  return (
    <article className="slushwire-item" data-item-id={item.key} data-category={category}>
      <h4>{href ? <a href={href} target="_blank" rel="noopener noreferrer">{item.title}<span aria-hidden="true"> ↗</span></a> : item.title}</h4>
      {item.agency && <p className="slushwire-byline">{item.agency}</p>}
      {item.source === 'agents' && <p className="slushwire-status">Status: {item.status || 'not provided'}</p>}
      {item.body && <p>{item.body}</p>}
      {item.source === 'reddit' && <p className="slushwire-byline">{item.comments} comments · {item.upvotes} upvotes</p>}
    </article>
  );
}

/**
 * Web edition of a SlushWire issue. Each week's folder under app/blog/ holds only
 * page.tsx + issue.json, written by the wqh-email-gen pipeline; this component and
 * its CSS are shared. `data-slushwire-issue` lets the pipeline verify the live page.
 */
export default function SlushWirePage({ issue, edition = 'full', subscribeUrl }: {
  issue: SlushWireIssue;
  edition?: Edition;
  subscribeUrl?: string;
}) {
  const channel = issue.channels[edition];
  if (issue.schema_version !== 1 || !channel) throw new Error('Unsupported SlushWire issue');
  const subscribeHref = subscribeUrl ? publicLink(subscribeUrl) : undefined;
  const editionName = edition === 'full' ? 'The complete weekly edition' : 'The Monday–Wednesday preview';
  const prefix = `slushwire-${edition}-${issue.context.issue_date}`;
  return (
    <div className="slushwire-page" data-slushwire-issue={issue.context.issue_id} data-slushwire-revision={issue.context.revision}>
      {issue.mode === 'preview' && <p className="slushwire-preview" role="note">Preview edition · Generated locally · Not published</p>}
      <header className="slushwire-masthead">
        <p className="slushwire-eyebrow">Write Query Hook / The weekly dispatch</p>
        <h1>Slush<span>Wire</span><span className="slushwire-period" aria-hidden="true">.</span></h1>
        <div className="slushwire-issue-line"><span>Week {issue.context.iso_week} / {issue.context.iso_year}</span><time dateTime={issue.context.issue_date}>{dateLabel(issue.context.issue_date, true)}</time></div>
        <p className="slushwire-deck">Agent updates. Query craft. Publishing conversations worth your time.</p>
      </header>
      <section className="slushwire-stats" aria-label="Full issue counts">
        <div className="slushwire-leading-stat"><strong>{issue.counts.unique_agents}</strong><span>unique agent updates</span></div>
        {categories.map(category => <div key={category}><strong>{issue.counts[category]}</strong><span>{labels[category]}</span><small>{channel.counts[category]} in this edition</small></div>)}
      </section>
      <p className="slushwire-count-note">Full-issue totals. An agent may appear in both status and activity; the unique-agent total counts each agent once.</p>
      <div className="slushwire-layout">
        <aside className="slushwire-sidebar">
          <nav aria-label="Jump to a day"><h2>This edition</h2><p>{editionName}</p><ol>{channel.slots.map(slot => <li key={slot.day}><a href={`#${prefix}-${slot.day}`}>{dateLabel(slot.day)}</a></li>)}</ol></nav>
          {issue.quote && <blockquote><p>“{issue.quote.text}”</p><cite>{issue.quote.author}</cite></blockquote>}
          {issue.bonus.length > 0 && <section aria-label="Bonus reading"><h2>On the reading list</h2>{issue.bonus.map(item => {
            const href = publicLink(item.url);
            return <p key={item.key}>{href ? <a href={href} target="_blank" rel="noopener noreferrer">{item.title} ↗</a> : item.title}</p>;
          })}</section>}
          {subscribeHref && <a className="slushwire-subscribe" href={subscribeHref}>Get next week’s dispatch →</a>}
        </aside>
        <main className="slushwire-content" aria-label={editionName}>
          {channel.slots.map(slot => {
            const empty = categories.every(category => slot.ids[category].length === 0);
            return <section className="slushwire-day" id={`${prefix}-${slot.day}`} key={slot.day} data-calendar-day={slot.day}>
              <h2><time dateTime={slot.day}>{dateLabel(slot.day)}</time></h2>
              {empty ? <p className="slushwire-empty">No eligible items captured for this day.</p> : categories.map(category => slot.ids[category].length > 0 && <section className="slushwire-category" key={category}>
                <h3>{labels[category]} <span>{slot.ids[category].length}</span></h3>
                {slot.ids[category].map(key => {
                  const item = issue.records[key];
                  if (!item) throw new Error(`SlushWire selection references missing record: ${key}`);
                  return <SourceItem key={`${category}-${key}`} item={item} category={category} />;
                })}
              </section>)}
            </section>;
          })}
        </main>
      </div>
      <footer className="slushwire-footer">SlushWire Weekly · Write Query Hook · {issue.context.iso_year}</footer>
    </div>
  );
}
