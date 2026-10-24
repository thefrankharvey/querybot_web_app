import type { ReactNode } from 'react';
import Link from 'next/link';
import { JsonLdScript, SITE_LOGO, SITE_NAME, absoluteUrl } from '@/lib/seo';
import CopyButton from './CopyButton';
import { formatCoverageRange } from './format';
import type { Category, Channel, Edition, Item, SlushWireIssue } from './types';
import './slushwire.css';

// Same section order and labels as the email and the WordPress-era posts.
const sections: { label: string; categories: Category[] }[] = [
  { label: 'Bluesky Posts', categories: ['bluesky'] },
  { label: 'Reddit Posts', categories: ['reddit', 'qcrit'] },
  { label: 'Submission Status', categories: ['qt'] },
  { label: 'Agent Activity', categories: ['pm'] },
];
const summary: { label: string; categories: Category[] }[] = [
  { label: 'Reddit', categories: ['reddit'] },
  { label: 'Critiques', categories: ['qcrit'] },
  { label: 'Bluesky', categories: ['bluesky'] },
  { label: 'Status', categories: ['qt'] },
  { label: 'Activity', categories: ['pm'] },
];

// Calendar dates must never shift into the previous day in a visitor's timezone.
function formatDay(day: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(new Date(`${day}T12:00:00Z`));
}
const longDate = (day: string) => formatDay(day, { month: 'long', day: 'numeric', year: 'numeric' });
const dayTitle = (day: string) =>
  `${formatDay(day, { weekday: 'long' })} - ${formatDay(day, { month: 'long', day: 'numeric' })}`;

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

function MaybeLink({ href, children }: { href?: string; children: ReactNode }) {
  const safe = href ? publicLink(href) : undefined;
  return safe ? <a href={safe} target="_blank" rel="noopener noreferrer">{children}</a> : <>{children}</>;
}

const isClosed = (item: Item) => item.status.trim().toLowerCase() === 'closed';

function AgentItem({ item, category }: { item: Item; category: Category }) {
  const genres = item.body.replace(/^Genres:\s*/, '');
  return (
    <div className="sw-agent" data-item-id={item.key} data-category={category}>
      <h5><MaybeLink href={item.url}>{item.agency ? `${item.title} - ${item.agency}` : item.title}</MaybeLink></h5>
      {category === 'qt' && (isClosed(item)
        ? <p>Submissions are <strong>CLOSED</strong></p>
        : <p>Submissions <strong>OPEN</strong>{item.status && <> via <MaybeLink href={item.url}>{item.status}</MaybeLink></>}</p>)}
      {category === 'pm' && item.status && <p><strong>Status:</strong> {item.status}</p>}
      {genres && <p><strong>Genres:</strong> {genres}</p>}
    </div>
  );
}

function RedditItem({ item, category }: { item: Item; category: Category }) {
  return (
    <div className="sw-post" data-item-id={item.key} data-category={category}>
      <h5><MaybeLink href={item.url}>{item.title}</MaybeLink></h5>
      <p><strong>Comments:</strong> {item.comments} | <strong>Upvotes:</strong> {item.upvotes}</p>
      {item.body && <p><strong>Preview:</strong> {item.body}</p>}
    </div>
  );
}

function BlueskyItem({ item, category }: { item: Item; category: Category }) {
  return (
    <div className="sw-post" data-item-id={item.key} data-category={category}>
      <h4><MaybeLink href={item.url}>{item.title.replace(/^#/, '')}</MaybeLink></h4>
      {item.body && <p>{item.body}</p>}
    </div>
  );
}

function SourceItem({ item, category }: { item: Item; category: Category }) {
  if (item.source === 'agents') return <AgentItem item={item} category={category} />;
  if (item.source === 'reddit') return <RedditItem item={item} category={category} />;
  return <BlueskyItem item={item} category={category} />;
}

const engagement = (item: Item) => item.comments + item.upvotes;

/**
 * Web edition of a SlushWire issue, laid out like the newsletter email. Each week's
 * folder under app/blog/ holds only page.tsx + issue.json, written by the
 * wqh-email-gen pipeline; this component and its CSS are shared.
 * `data-slushwire-issue` lets the pipeline verify the live page.
 */
export default function SlushWirePage({ issue, edition = 'full', subscribeUrl }: {
  issue: SlushWireIssue;
  edition?: Edition;
  subscribeUrl?: string;
}) {
  if (issue.schema_version !== 1 && issue.schema_version !== 2) throw new Error('Unsupported SlushWire issue');
  const channel = (issue.channels as Record<string, Channel | undefined>)[edition];
  if (!channel) throw new Error('Unsupported SlushWire issue');
  const record = (key: string) => {
    const item = issue.records[key];
    if (!item) throw new Error(`SlushWire selection references missing record: ${key}`);
    return item;
  };
  const picked = (category: Category) => channel.slots.flatMap(slot => slot.ids[category].map(record));

  const { counts } = issue;
  const v2 = issue.schema_version === 2;
  const publishedDay = issue.schema_version === 2 ? issue.context.send_date : issue.context.issue_date;
  const range = issue.schema_version === 2
    ? formatCoverageRange(issue.context.coverage_start, issue.context.coverage_end) : '';
  const title = issue.schema_version === 2
    ? `SlushWire \u2013 ${range}`
    : `SlushWire Weekly #${issue.context.iso_week} - ${longDate(issue.context.issue_date)}`;
  const citationYear = issue.schema_version === 2 ? publishedDay.slice(0, 4) : issue.context.iso_year;
  const { context } = issue;
  const url = issue.web.url;
  const subscribeHref = subscribeUrl ? publicLink(subscribeUrl) : undefined;
  const alerts = counts.qt + counts.pm + counts.reddit + counts.qcrit + counts.bluesky;
  const openAgents = picked('qt').filter(item => !isClosed(item));
  const description = `${openAgents.length} literary agents open to submissions + ${counts.qt + counts.pm - openAgents.length} more, `
    + `${counts.qcrit} query critiques, ${counts.reddit + counts.bluesky} writing posts. Intel for writers in the query trenches.`;
  const shareText = `${v2 ? "Today's" : "This week's"} SlushWire: ${openAgents.length} literary agents open to queries + query critiques & writing community updates`;
  const citation = `Harvey, F. (${citationYear}). ${title}. ${SITE_NAME}. Retrieved from ${url}`;

  const top = (category: Category) => [...picked(category)].sort((a, b) => engagement(b) - engagement(a))[0];
  const takeaways = [
    { label: 'Reddit', item: top('reddit') },
    { label: 'Query Critiques', item: top('qcrit') },
    { label: 'Bluesky', item: picked('bluesky')[0] },
    { label: 'Agent Activity', item: picked('pm')[0] },
    { label: 'Now Open', item: openAgents[0] },
  ].filter((t): t is { label: string; item: Item } => Boolean(t.item));
  const takeawayText = (item: Item) => {
    if (item.source === 'agents') return item.agency ? `${item.title} (${item.agency})` : item.title;
    const text = item.source === 'bluesky' ? item.body : item.title;
    return text.length > 110 ? `${text.slice(0, 107).trimEnd()}...` : text;
  };

  const days = [...channel.slots].reverse(); // newest first, like the email
  const agentList = [...picked('qt'), ...picked('pm')].filter((item, i, all) => all.findIndex(o => o.key === item.key) === i);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    alternativeHeadline: `${v2 ? '' : `Week #${issue.context.iso_week}: `}${counts.qt} Submission Status Updates + ${counts.qcrit} Query Critiques`,
    description,
    articleBody: `${v2 ? 'This edition of' : "This week's"} SlushWire features ${openAgents.length} literary agents accepting new queries, `
      + `${counts.unique_agents} agent updates, ${counts.qcrit} query letter critiques from the community, `
      + `${counts.reddit} Reddit publishing discussions, and ${counts.bluesky} Bluesky writing community posts.`,
    url,
    image: absoluteUrl('/slushwire-weekly.png'),
    datePublished: publishedDay,
    inLanguage: 'en-US',
    articleSection: 'Publishing Industry',
    keywords: ['literary agents open to submissions', 'literary agents accepting queries', 'query letter critiques',
      'how to find a literary agent', 'publishing news', 'writing community'],
    author: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/') },
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: SITE_LOGO } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isAccessibleForFree: true,
    isPartOf: { '@type': 'Periodical', name: v2 ? 'SlushWire' : 'SlushWire Weekly' },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.sw-takeaways', '.sw-summary', 'h1'] },
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'SlushWire', item: absoluteUrl('/blog') },
      { '@type': 'ListItem', position: 3, name: title, item: url },
    ],
  };
  const agentsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Literary agent submission updates — ${title}`,
    numberOfItems: agentList.length,
    itemListElement: agentList.map((item, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'Person', name: item.title, jobTitle: 'Literary Agent',
        ...(item.agency ? { worksFor: { '@type': 'Organization', name: item.agency } } : {}),
        ...(publicLink(item.url) ? { url: item.url } : {}) },
    })),
  };

  const share = encodeURIComponent(shareText);
  const link = encodeURIComponent(url);

  return (
    <div className="slushwire-page" data-slushwire-issue={context.issue_id} data-slushwire-revision={context.revision}>
      <JsonLdScript id="slushwire-article-jsonld" data={articleJsonLd} />
      <JsonLdScript id="slushwire-breadcrumb-jsonld" data={breadcrumbJsonLd} />
      {agentList.length > 0 && <JsonLdScript id="slushwire-agents-jsonld" data={agentsJsonLd} />}
      {issue.mode === 'preview' && <p className="sw-preview" role="note">Preview edition · Generated locally · Not published</p>}

      <nav className="sw-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/blog">SlushWire</Link></li>
          <li><span aria-current="page">{title}</span></li>
        </ol>
      </nav>

      <article itemScope itemType="https://schema.org/NewsArticle">
        <meta itemProp="articleSection" content="Publishing News" />
        <header className="sw-header">
          <h1 itemProp="headline">{title}</h1>
          <p className="sw-meta">
            <time itemProp="datePublished" dateTime={publishedDay}>Published: {longDate(publishedDay)}</time>{' '}
            <span itemProp="author" itemScope itemType="https://schema.org/Organization">by <span itemProp="name">{SITE_NAME}</span></span>
          </p>
          {issue.quote && <p className="sw-quote">“{issue.quote.text}”<br />— {issue.quote.author}</p>}
        </header>

        <aside className="sw-cite">
          <details>
            <summary>Cite this article</summary>
            <p>{citation}</p>
            <CopyButton text={citation} label="Copy Citation" className="sw-button" />
          </details>
        </aside>

        {takeaways.length > 0 && (
          <section className="sw-takeaways" aria-labelledby="sw-takeaways-heading">
            <h2 id="sw-takeaways-heading">Key Takeaways</h2>
            <ul>
              <li>{v2
                ? <><strong>{alerts} alerts</strong> sent to querying writers in this edition ({range})</>
                : <><strong>{alerts} alerts</strong> sent to querying writers this week ({longDate(context.issue_date)})</>}</li>
              {takeaways.map(t => <li key={t.label}><strong>{t.label}:</strong> {takeawayText(t.item)}</li>)}
            </ul>
          </section>
        )}

        <section className="sw-summary" aria-label={v2 ? 'Edition summary' : 'Weekly summary'}>
          <h2 className="sw-alerts">ALERTS: {alerts}</h2>
          <div className="sw-summary-row">
            {summary.map(s => (
              <div key={s.label}>
                <div className="sw-summary-label">{s.label}</div>
                <div className="sw-summary-number">{s.categories.reduce((n, c) => n + counts[c], 0)}</div>
              </div>
            ))}
          </div>
        </section>

        {days.map(slot => {
          const filled = sections.filter(s => s.categories.some(c => slot.ids[c].length > 0));
          return (
            <section className="sw-day" key={slot.day} id={`slushwire-${edition}-${slot.day}`} data-calendar-day={slot.day}>
              <h2 className="sw-date"><time dateTime={slot.day}>{dayTitle(slot.day)}</time></h2>
              {filled.length === 0 && <p className="sw-empty">No eligible items captured for this day.</p>}
              {filled.map(s => (
                <div className="sw-section" key={s.label}>
                  <h3>{s.label}</h3>
                  {s.categories.flatMap(c => {
                    let keys = slot.ids[c];
                    if (c === 'qt') keys = [...keys].sort((a, b) => Number(isClosed(record(a))) - Number(isClosed(record(b))));
                    return keys.map(key => <SourceItem key={`${c}-${key}`} item={record(key)} category={c} />);
                  })}
                </div>
              ))}
            </section>
          );
        })}

        {issue.bonus.length > 0 && (
          <section className="sw-section sw-bonus" aria-labelledby="sw-hof-heading">
            <h3 id="sw-hof-heading">Hall of Fame</h3>
            {issue.bonus.map(item => (
              <div className="sw-post" key={item.key}>
                <h4><MaybeLink href={item.url}>{item.title}</MaybeLink></h4>
                {item.text && <p>{item.text}</p>}
              </div>
            ))}
          </section>
        )}

        <section className="sw-share" aria-label="Share this article">
          <h3>{v2 ? "Share this edition's intel with fellow writers" : "Share this week's intel with fellow writers"}</h3>
          <div>
            <a className="sw-share-x" href={`https://twitter.com/intent/tweet?text=${share}&url=${link}&via=writequeryhook`} target="_blank" rel="noopener noreferrer" aria-label="Share on X (Twitter)">Post on X</a>
            <a className="sw-share-bsky" href={`https://bsky.app/intent/compose?text=${share}%20${link}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Bluesky">Post on Bluesky</a>
            <a className="sw-share-x" href={`https://www.threads.net/intent/post?text=${share}%20${link}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Threads">Post on Threads</a>
            <CopyButton text={url} label="Copy Link" className="sw-share-copy" />
          </div>
          <p>Follow @writequeryhook for daily writing community updates</p>
        </section>

        {subscribeHref && (
          <section className="sw-signup" aria-label="Subscribe">
            <h2>Get our free newsletter.</h2>
            <p>SlushWire lands in your inbox {v2 ? 'most days' : 'every Sunday'}: agent openings, query critiques and publishing conversations.</p>
            <a className="sw-button" href={subscribeHref}>Subscribe to SlushWire</a>
          </section>
        )}

        <p className="sw-passiton">
          Love SlushWire?{' '}
          <a href={`mailto:?subject=${encodeURIComponent('Check out SlushWire!')}&body=${encodeURIComponent(`Get free ${v2 ? '' : 'weekly '}publishing industry intel: ${url}`)}`}>
            Pass it on to help a fellow writer
          </a>! Feedback: <a href="mailto:feedback@writequeryhook.com">feedback@writequeryhook.com</a>
        </p>
      </article>
    </div>
  );
}
