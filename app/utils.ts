import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AgentMatch } from "./(app)/context/agent-matches-context";
import { sanitizeWordPressHtml } from "@/lib/wp";

// HELPER UTILS ========================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// QUERY FORM UTILS ========================================================

export type QueryPayload = {
  email: string;
  genre: string;
  subgenres: string[];
  format: string;
  target_audience: string;
  non_fiction: boolean; // TODO: add this back in when it's time
  comps?: string[];
  themes?: string[];
  synopsis?: string;
  manuscript?: string;
  enable_ai?: boolean; // TODO: add this back in when it's time
};

export const formatComps = (comps: { title: string; author: string }[]) => {
  const result = [];
  for (const comp of comps) {
    if (comp.title && comp.author) {
      result.push(comp.title);
      result.push(comp.author);
    }
  }
  return result;
};

// Required fields: email, genre, subgenres, target_audience, non_fiction, format

export const validateQuery = (payload: QueryPayload) => {
  const requiredFields = [
    { field: "email", label: "Email" },
    { field: "genre", label: "Genre" },
    { field: "subgenres", label: "Subgenres" },
    { field: "format", label: "Format" },
    { field: "target_audience", label: "Target audience" },
  ] as const;

  for (const { field, label } of requiredFields) {
    if (typeof payload[field] === "object" && payload[field].length === 0) {
      return { error: `${label} required`, isValid: false };
    }
    if (!payload[field]) {
      return { error: `${label} required`, isValid: false };
    }
  }

  return { error: null, isValid: true };
};

// LOCAL STORAGE UTILS ========================================================

export const getFromLocalStorage = (item: string) => {
  if (typeof window !== "undefined") {
    const retrievedItem = window.localStorage.getItem(item);
    if (retrievedItem) {
      try {
        return JSON.parse(retrievedItem);
      } catch (error) {
        // If JSON parsing fails, log the error and return empty object
        console.error("Failed to parse item from localStorage:", error);
        return {};
      }
    }
  }
  return {};
};

export const setInLocalStorage = (key: string, item: unknown) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(item));
  }
};

// CSV UTILS ========================================================

export const formatMatchesForCSV = (matches: AgentMatch[]) => {
  const result = matches
    .map((agent) => {
      const filteredEntries = Object.entries(agent).filter(
        ([key]) =>
          !key.includes("form_") &&
          !["aala_member", "id", "location", "agent_id"].includes(key)
      );
      return Object.fromEntries(filteredEntries) as Partial<AgentMatch>;
    })
    .map((agent) => {
      return {
        ...agent,
        genres: formatGenres(agent.genres || ""),
      };
    });

  return result;
};

// AGENT PROFILE UTILS ========================================================

export const urlFormatter = (url: string | undefined | null) => {
  if (!url?.includes(".")) return null;

  if (url?.includes("|")) {
    if (!url.split("|")[0].includes("http")) {
      return "http://" + url.split("|")[0];
    }
    return url.split("|")[0];
  }
  if (!url?.includes("http")) {
    return "http://" + url;
  }
  return url;
};

export const formatDisplayString = (data: string | undefined | null) => {
  if (!data) return data;
  return data.replace(/[|\/\\"']/g, "");
};

export const formatEmail = (email: string | undefined | null) => {
  if (!email) return [];
  return formatDisplayString(email)?.split(" ").filter(Boolean);
};

export const formatGenres = (genres: string) => {
  const result = [];
  const genresArray = genres.split(",");

  // List of strings to filter out
  const stringsToFilter = [
    "closed to submissions",
    "AALA member",
    "Accepting Submissions",
    "Member of",
    "Special Experience",
    "ORGANIZATIONS",
    "HONORS & MEDIA",
    "Forbes",
    "Jane Friedman's Blog",
    "Electric Literature",
    "Latino Leaders Magazine",
    "Minorities in Publishing",
    "in",
    "read more",
    "read less",
    "Sub-agents",
    "Rights contacts",
    "International Rights:",
    "Ellen K. Greenberg",
    "CLOSED to Submissions",
    "Authors and Illustrators Only",
  ];

  for (const genre of genresArray) {
    if (genre.includes("|")) {
      const genreArray = genre.split("|").filter((str) => {
        // Remove empty strings and whitespace-only strings
        if (!str.trim()) return false;

        // Check if it contains numbers, quotes, or unwanted symbols using regex
        if (/[\d•@"']/.test(str)) return false;

        // Check if it contains any string from the filter list
        if (stringsToFilter.some((filterStr) => str.includes(filterStr)))
          return false;

        return true;
      });
      result.push(...genreArray);
    } else {
      const trimmedGenre = genre.trim();
      if (
        trimmedGenre &&
        !/[\d•@"']/.test(trimmedGenre) &&
        !stringsToFilter.some((filterStr) => trimmedGenre.includes(filterStr))
      ) {
        result.push(trimmedGenre);
      }
    }
  }

  const uniqueResult: string[] = [];

  for (const genre of result) {
    if (!uniqueResult.includes(genre.trim())) {
      uniqueResult.push(genre.trim());
    }
  }

  return uniqueResult;
};

// BLOG POST UTILS ========================================================

// Function to remove the first image from WordPress content
export const removeTopImageFromContent = (html: string): string => {
  let cleanedHtml = html;

  const patterns = [/<figure[^>]*>[\s\S]*?<img[^>]*>[\s\S]*?<\/figure>/i];

  for (const pattern of patterns) {
    const match = cleanedHtml.match(pattern);
    if (match) {
      cleanedHtml = cleanedHtml.replace(pattern, "");
      break; // Only remove the first image found
    }
  }

  return cleanedHtml.trim();
};

// Function to extract alerts data - reuse the same logic as thumbnail
export const extractAlertsData = (
  excerpt: string | null,
  content: string | null
): {
  reddit: number;
  bluesky: number;
  agents: number;
} | null => {
  const textToSearch = excerpt || content || "";
  // Remove HTML tags and search for the pattern
  const cleanText = sanitizeWordPressHtml(textToSearch).replace(
    /<[^>]*>/g,
    " "
  );

  // Look for pattern like "ALERTS: 65 REDDIT 8 BLUESKY 38 AGENTS 19"
  const alertsMatch = cleanText.match(
    /ALERTS:\s*(\d+)\s+REDDIT\s+(\d+)\s+BLUESKY\s+(\d+)\s+AGENTS\s+(\d+)/i
  );

  // If first pattern doesn't match, try pattern without "ALERTS:" prefix
  // e.g., "REDDIT 26 BLUESKY 2025 AGENTS 45"
  const alertsMatchAlt = cleanText.match(
    /REDDIT\s+(\d+)\s+BLUESKY\s+(\d+)\s+AGENTS\s+(\d+)/i
  );

  if (alertsMatch) {
    return {
      reddit: parseInt(alertsMatch[2], 10),
      bluesky: parseInt(alertsMatch[3], 10),
      agents: parseInt(alertsMatch[4], 10),
    };
  }

  if (alertsMatchAlt) {
    return {
      reddit: parseInt(alertsMatchAlt[1], 10),
      bluesky: parseInt(alertsMatchAlt[2], 10),
      agents: parseInt(alertsMatchAlt[3], 10),
    };
  }

  return null;
};

// Function to remove alerts text from HTML content
export const removeAlertsFromContent = (html: string): string => {
  // Remove alerts pattern from HTML content using multiple strategies
  let cleanedHtml = html;

  // Strategy 1: Remove direct text patterns
  const alertsPatterns = [
    /ALERTS:\s*\d+\s+REDDIT\s+\d+\s+BLUESKY\s+\d+\s+AGENTS\s+\d+/gi,
    /ALERTS:[\s\S]*?\d+[\s\S]*?REDDIT[\s\S]*?\d+[\s\S]*?BLUESKY[\s\S]*?\d+[\s\S]*?AGENTS[\s\S]*?\d+/gi,
  ];

  for (const pattern of alertsPatterns) {
    cleanedHtml = cleanedHtml.replace(pattern, "");
  }

  // Strategy 2: Remove common HTML structures that might contain alerts
  // Remove paragraphs that contain the alerts pattern
  cleanedHtml = cleanedHtml.replace(
    /<p[^>]*>[\s\S]*?ALERTS:[\s\S]*?AGENTS[\s\S]*?\d+[\s\S]*?<\/p>/gi,
    ""
  );

  // Strategy 3: Remove any remaining isolated alerts text
  cleanedHtml = cleanedHtml.replace(
    /ALERTS:[\s\S]{0,200}?AGENTS[\s\S]{0,50}?\d+/gi,
    ""
  );

  // Strategy 4: Remove the first <section> tag inside any <article> tag
  cleanedHtml = cleanedHtml.replace(
    /<article[^>]*>([\s\S]*?)<section[^>]*>[\s\S]*?<\/section>([\s\S]*?)<\/article>/i,
    "<article>$1$2</article>"
  );

  // Strategy 5: Remove <article> tags inside any <section> tag
  cleanedHtml = cleanedHtml.replace(
    /<section[^>]*>([\s\S]*?)<article[^>]*>[\s\S]*?<\/article>([\s\S]*?)<\/section>/i,
    "<section>$1$2</section>"
  );

  // Strategy 6: Remove " <!-- Repeat " text inside section tags
  cleanedHtml = cleanedHtml.replace(
    /<section([^>]*)>([\s\S]*?)"[\s]*<!–[\s]*Repeat[\s]*"([\s\S]*?)<\/section>/gi,
    "<section$1>$2$3</section>"
  );

  // Strategy 7: Aggressive removal of any text containing "Repeat"
  if (cleanedHtml.includes("Repeat")) {
    // Try multiple aggressive patterns
    cleanedHtml = cleanedHtml.replace(/.*Repeat.*/gi, ""); // Remove entire lines containing Repeat
    cleanedHtml = cleanedHtml.replace(/[^>]*Repeat[^<]*/gi, ""); // Remove text nodes with Repeat
    cleanedHtml = cleanedHtml.replace(/Repeat/gi, ""); // Just remove the word itself
  }

  // Clean up extra whitespace and empty tags
  cleanedHtml = cleanedHtml
    .replace(/\s+/g, " ")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/^\s+|\s+$/g, "")
    .trim();

  return cleanedHtml;
};

// Function to format Reddit posts content (for posts before Nov 3, 2025)
export function formatSlushWeeklyContent(html: string): string {
  let processedContent = html;

  // Style Reddit Posts heading to be bold and 2xl
  processedContent = processedContent.replace(
    /<h2>Reddit Posts<\/h2>/gi,
    '<h2 class="text-2xl font-bold mb-6">Reddit Posts</h2>'
  );

  // Make Reddit post titles bold (the first line after [PUBQ])
  processedContent = processedContent.replace(
    /(\[PUBQ\]|\[PubQ\])\s*([^\n\r<]+)/gi,
    '<div class="mb-6"><strong>$1 $2</strong>'
  );

  // Remove horizontal dividers (common patterns)
  processedContent = processedContent.replace(/<hr[^>]*>/gi, "");
  processedContent = processedContent.replace(/───+/g, "");
  processedContent = processedContent.replace(/---+/g, "");
  processedContent = processedContent.replace(/___+/g, "");

  // Close the divs properly for each post block
  processedContent = processedContent.replace(
    /(?=<div class="mb-6"><strong>\[PUBQ?\])/gi,
    "</div>"
  );

  // Fix the first occurrence to not have a closing div
  processedContent = processedContent.replace(/^<\/div>/, "");

  // Add closing div at the end if needed
  if (
    processedContent.includes('<div class="mb-6">') &&
    !processedContent.endsWith("</div>")
  ) {
    processedContent += "</div>";
  }

  // Step 1: Extract all Reddit post data first
  const redditPosts: Array<{
    url: string;
    pubqTag: string;
    title: string;
    content: string;
  }> = [];

  // Find Reddit Posts section
  const redditSectionMatch = processedContent.match(
    /<h2[^>]*>Reddit Posts<\/h2>([\s\S]*?)(?=<h2|$)/i
  );
  if (redditSectionMatch) {
    const redditSection = redditSectionMatch[1];

    // Extract all URLs and titles
    const urlMatches = [
      ...redditSection.matchAll(/href="(https?:\/\/[^"]*reddit[^"]*)"[^>]*>/gi),
    ];
    const titleMatches = [
      ...redditSection.matchAll(/<strong>(\[PUBQ?\])\s*([^<]+)<\/strong>/gi),
    ];
    const contentMatches = [
      ...redditSection.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi),
    ];

    for (let i = 0; i < titleMatches.length; i++) {
      redditPosts.push({
        url: urlMatches[i] ? urlMatches[i][1] : "#",
        pubqTag: titleMatches[i][1],
        title: titleMatches[i][2].trim(),
        content: contentMatches[i] ? contentMatches[i][1] : "",
      });
    }
  }

  // Step 2: Replace the entire Reddit section with clean structure
  processedContent = processedContent.replace(
    /<h2[^>]*>Reddit Posts<\/h2>[\s\S]*?(?=<h2|$)/i,
    () => {
      let cleanSection =
        '<h2 class="text-2xl font-bold mb-4 pl-3">Reddit Posts</h2>\n';

      redditPosts.forEach((post) => {
        cleanSection += `<a href="${post.url}" target="_blank" rel="noopener noreferrer" class="block text-inherit no-underline hover:bg-gray-50 transition-colors duration-200 rounded-lg p-3 break-words">
          <div class="flex items-start gap-2">
            <div class="min-w-0 w-full">
              <div class="flex items-center gap-2 min-w-0">
                <img src="/reddit-icon.svg" alt="Reddit" class="inline-block w-6 h-6 flex-none" />
                <span class="break-words min-w-0"><strong>${post.pubqTag} ${post.title}</strong></span>
              </div>
              <p class="mt-2 break-words">${post.content}</p>
            </div>
          </div>
        </a>\n`;
      });

      return cleanSection;
    }
  );

  // Replace any alien emoji marker in Reddit section with our reddit icon SVG
  processedContent = processedContent.replace(
    /(<h2[^>]*>Reddit Posts<\/h2>[\s\S]*?)(?=<h2|$)/i,
    (section) => section.replace(/<strong>\s*👽\s*<\/strong>/g, "")
  );

  // Apply the same styling to Bluesky Posts
  processedContent = processedContent.replace(
    /<h2>Bluesky Posts<\/h2>/gi,
    '<h2 class="text-2xl font-bold mb-4 mt-4 pl-4 break-words">Bluesky Posts</h2>'
  );

  // Replace any alien emoji marker in Reddit section with our reddit icon SVG
  processedContent = processedContent.replace(
    /(<h2[^>]*>Bluesky Posts<\/h2>[\s\S]*?)(?=<h2|$)/i,
    (section) => section.replace(/<strong>\s*🦋\s*<\/strong>/g, "")
  );

  // Process Bluesky posts: make h4 bold and wrap content in clickable links
  processedContent = processedContent.replace(
    /<h4>\s*<a href="([^"]*)"[^>]*>([^<]+)<\/a>\s*<\/h4>\s*(<p[\s\S]*?)<\/p>/gi,
    (match, url, h4Content, pContent) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="block text-inherit no-underline hover:bg-gray-50 transition-colors duration-200 rounded-lg p-3 break-words">
        <div class="min-w-0 w-full">
          <div class="flex items-center gap-2 min-w-0">
            <img src="/bluesky-icon.svg" alt="Bluesky" class="inline-block w-6 h-6 flex-none" />
            <strong class="break-words">${h4Content}</strong>
          </div>
          <p class="mt-2 break-words">${pContent}</p>
        </div>
      </a>`;
    }
  );

  // Remove trailing Bluesky profile links that appear after the main content blocks
  processedContent = processedContent.replace(
    /<p>\s*<a href="[^"]*"[^>]*>[^<]*\.(bsky\.social|com|gy)<\/a>\s*<\/p>/gi,
    ""
  );

  processedContent = processedContent.replace(
    /<h2>New Agent Openings<\/h2>/gi,
    '<h2 class="text-2xl font-bold mb-4 mt-4 pl-4">Agent Openings</h2>'
  );

  processedContent = processedContent.replace(
    /<h2>Active Agents<\/h2>/gi,
    '<h2 class="text-2xl font-bold mb-4 mt-4 pl-4">Agent Activity</h2>'
  );

  // Replace any alien emoji marker in Reddit section with our reddit icon SVG
  processedContent = processedContent.replace(
    /(<h2[^>]*>Active Agents<\/h2>[\s\S]*?)(?=<h2|$)/i,
    (section) => section.replace(/<strong>\s*📡\s*<\/strong>/g, "")
  );

  // Replace any alien emoji marker in Reddit section with our reddit icon SVG
  processedContent = processedContent.replace(
    /(<h2[^>]*>Agent Openings<\/h2>[\s\S]*?)(?=<h2|$)/i,
    (section) => section.replace(/<strong>\s*📡\s*<\/strong>/g, "")
  );

  // Remove any remaining antenna emojis globally (safety net)
  processedContent = processedContent.replace(/📡/g, "");

  // Add padding to agent data container divs - find the entire agent section and process all divs
  processedContent = processedContent.replace(
    /(<h2[^>]*>(?:Agent Openings|Agent Activity)<\/h2>[\s\S]*?)(?=<h2|$)/gi,
    (match, agentSection) => {
      // Add padding class to ALL divs within the agent section
      let paddedSection = agentSection.replace(
        /<div>/gi,
        '<div class="p-3 space-y-2">'
      );

      // Process genres - try multiple patterns since the exact structure is unclear
      // Pattern 1: <p><strong>Genres: </strong>"content"</p>
      paddedSection = paddedSection.replace(
        /<p>\s*<strong>Genres:\s*<\/strong>\s*"([^"]*)"[^<]*<\/p>/gi,
        (match: string, genreContent: string) => {
          const cleanedText = genreContent
            .replace(/\|/g, ", ")
            .replace(/,\s*,/g, ",")
            .replace(/^[,\s"]+|[,\s"]+$/g, "")
            .trim();
          return `<p><strong>Genres:</strong> ${cleanedText}</p>`;
        }
      );

      // Pattern 2: Any paragraph containing pipe-separated content that looks like genres
      paddedSection = paddedSection.replace(
        /<p[^>]*>([^<]*\|[^<]*)<\/p>/gi,
        (match: string, content: string) => {
          // Only process if it looks like genres (contains common genre words)
          if (
            content.includes("Nonfiction") ||
            content.includes("Fiction") ||
            content.includes("Biography") ||
            content.includes("Business")
          ) {
            const cleanedText = content
              .replace(/\|/g, ", ")
              .replace(/,\s*,/g, ",")
              .replace(/^[,\s"]+|[,\s"]+$/g, "")
              .trim();
            return `<p>${cleanedText}</p>`;
          }
          return match;
        }
      );

      // Ensure all paragraph tags inside the agent section have vertical padding
      // 1) Add py-2 to existing class attributes if not present
      paddedSection = paddedSection.replace(
        /<p(\s+[^>]*class=")([^"]*)"/gi,
        (m: string, prefix: string, classes: string) =>
          classes.includes("py-2") ? m : `<p${prefix}py-2 ${classes}"`
      );

      // 2) Add class="py-2" to p tags without a class attribute
      paddedSection = paddedSection.replace(
        /<p(?![^>]*class=)([^>]*)>/gi,
        '<p class="py-0 pb-0"$1>'
      );

      // 3) Replace pipes with commas inside all p tags in the agent section
      paddedSection = paddedSection.replace(
        /<p([^>]*)>([\s\S]*?)<\/p>/gi,
        (m: string, attrs: string, inner: string) => {
          const normalized = inner
            .replace(/\s*\|\s*/g, ", ")
            .replace(/,\s*,/g, ", ")
            .replace(/\s+,/g, ", ")
            .replace(/,\s+/g, ", ")
            .replace(/\s+/g, " ")
            .trim();
          return `<p${attrs}>${normalized}</p>`;
        }
      );

      return paddedSection;
    }
  );

  // Agent name header: add Users icon, make bold + underline, keep link
  processedContent = processedContent.replace(
    /<h5>\s*<a([^>]*)>([\s\S]*?)<\/a>\s*<\/h5>/gi,
    (match, attrs, inner) => {
      // Wrap inner content to ensure bold + underline
      const wrapped = `<span class="inline-flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span class="font-bold underline">${inner}</span>
      </span>`;
      return `<h5><a class="capitalize" ${attrs}>${wrapped}</a></h5>`;
    }
  );

  // Global genres cleanup: replace all pipes with commas inside any paragraph that contains a Genres label
  processedContent = processedContent.replace(
    /<p([^>]*)>([\s\S]*?(?:<strong>\s*Genres\s*:?\s*<\/strong>|Genres\s*:)[\s\S]*?)<\/p>/gi,
    (match, attrs, inner) => {
      const normalized = inner
        .replace(/\|/g, ", ") // pipes -> commas
        .replace(/,\s*,/g, ", ") // collapse duplicate commas
        .replace(/\s+,/g, ", ") // trim space before commas
        .replace(/,\s+/g, ", ") // normalize comma spacing
        .replace(/\s+/g, " ")
        .trim();
      return `<p${attrs}>${normalized}</p>`;
    }
  );

  // Ensure any <footer> element inside processed content has 12px padding (Tailwind p-3)
  // Add p-3 to existing class, or add a class if missing
  processedContent = processedContent.replace(
    /<footer(\s+[^>]*class=")([^\"]*)"/gi,
    (m, prefix, classes) =>
      classes.includes("p-3") ? m : `<footer${prefix}${classes} p-3"`
  );

  processedContent = processedContent.replace(
    /<footer(?![^>]*class=)([^>]*)>/gi,
    '<footer class="p-3"$1>'
  );

  return processedContent;
}

// NEW: Function to format Reddit posts content (for posts from Nov 3, 2025 onwards)
export function formatSlushWeeklyContentAlt(html: string): string {
  let processedContent = html;

  // Style Reddit Posts heading to be bold and 2xl
  processedContent = processedContent.replace(
    /<h2>Reddit Posts<\/h2>/gi,
    '<h2 class="text-2xl font-bold mb-6">Reddit Posts</h2>'
  );

  // Remove horizontal dividers (common patterns)
  processedContent = processedContent.replace(/<hr[^>]*>/gi, "");
  processedContent = processedContent.replace(/───+/g, "");
  processedContent = processedContent.replace(/---+/g, "");
  processedContent = processedContent.replace(/___+/g, "");

  // Replace ALL Reddit sections with clean structure (note the /g flag)
  processedContent = processedContent.replace(
    /<h2[^>]*>Reddit Posts<\/h2>([\s\S]*?)(?=<h2|$)/gi,
    (match, redditSection) => {
      // Extract posts from THIS specific Reddit section
      const sectionPosts: Array<{
        url: string;
        title: string;
        stats: string;
        preview: string;
      }> = [];

      const postPattern =
        /<h5>\s*<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>\s*<\/h5>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<p[^>]*><strong>Preview:<\/strong>\s*([\s\S]*?)<\/p>/gi;

      let postMatch;
      while ((postMatch = postPattern.exec(redditSection)) !== null) {
        sectionPosts.push({
          url: postMatch[1],
          title: postMatch[2].trim(),
          stats: postMatch[3].trim(),
          preview: postMatch[4].trim(),
        });
      }

      let cleanSection =
        '<h2 class="text-2xl font-bold mb-4 pl-3">Reddit Posts</h2>\n';

      sectionPosts.forEach((post) => {
        cleanSection += `<a href="${post.url}" target="_blank" rel="noopener noreferrer" class="block text-inherit no-underline hover:bg-gray-50 transition-colors duration-200 rounded-lg p-3 break-words">
          <div class="flex items-start gap-2">
            <div class="min-w-0 w-full">
              <div class="flex items-center gap-2 min-w-0">
                <img src="/reddit-icon.svg" alt="Reddit" class="inline-block w-6 h-6 flex-none" />
                <span class="break-words min-w-0"><strong>${post.title}</strong></span>
              </div>
              <p class="mt-1 text-sm text-gray-600">${post.stats}</p>
              <p class="mt-2 break-words">${post.preview}</p>
            </div>
          </div>
        </a>\n`;
      });

      return cleanSection;
    }
  );

  // Replace any alien emoji marker in ALL Reddit sections with our reddit icon SVG
  processedContent = processedContent.replace(
    /(<h2[^>]*>Reddit Posts<\/h2>[\s\S]*?)(?=<h2|$)/gi,
    (section) => section.replace(/<strong>\s*👽\s*<\/strong>/g, "")
  );

  // Apply the same styling to Bluesky Posts
  processedContent = processedContent.replace(
    /<h2>Bluesky Posts<\/h2>/gi,
    '<h2 class="text-2xl font-bold mb-4 mt-4 pl-4 break-words">Bluesky Posts</h2>'
  );

  // Replace any alien emoji marker in Bluesky section with our butterfly icon
  processedContent = processedContent.replace(
    /(<h2[^>]*>Bluesky Posts<\/h2>[\s\S]*?)(?=<h2|$)/i,
    (section) => section.replace(/<strong>\s*🦋\s*<\/strong>/g, "")
  );

  // Process Bluesky posts: make h4 bold and wrap content in clickable links
  processedContent = processedContent.replace(
    /<h4>\s*<a href="([^"]*)"[^>]*>([^<]+)<\/a>\s*<\/h4>\s*(<p[\s\S]*?)<\/p>/gi,
    (match, url, h4Content, pContent) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="block text-inherit no-underline hover:bg-gray-50 transition-colors duration-200 rounded-lg p-3 break-words">
        <div class="min-w-0 w-full">
          <div class="flex items-center gap-2 min-w-0">
            <img src="/bluesky-icon.svg" alt="Bluesky" class="inline-block w-6 h-6 flex-none" />
            <strong class="break-words">${h4Content}</strong>
          </div>
          <p class="mt-2 break-words">${pContent}</p>
        </div>
      </a>`;
    }
  );

  // Remove trailing Bluesky profile links that appear after the main content blocks
  processedContent = processedContent.replace(
    /<p>\s*<a href="[^"]*"[^>]*>[^<]*\.(bsky\.social|com|gy)<\/a>\s*<\/p>/gi,
    ""
  );

  processedContent = processedContent.replace(
    /<h2>New Agent Openings<\/h2>/gi,
    '<h2 class="text-2xl font-bold mb-4 mt-4 pl-4">Agent Openings</h2>'
  );

  processedContent = processedContent.replace(
    /<h2>Agent Activity<\/h2>/gi,
    '<h2 class="text-2xl font-bold mb-4 mt-4 pl-4">Agent Activity</h2>'
  );

  // Style Submission Status heading the same way
  processedContent = processedContent.replace(
    /<h2>Submission Status<\/h2>/gi,
    '<h2 class="text-2xl font-bold mb-4 mt-4 pl-4">Submission Status</h2>'
  );

  // Style daily date headings (e.g., "Monday – November 03", "Saturday – November 01")
  processedContent = processedContent.replace(
    /<h2>((Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*[–\-]\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(,?\s*\d{4})?)<\/h2>/gi,
    '<h2 class="text-lg font-medium border border-black rounded-lg p-2.5 m-2.5 mb-[30px]">$1</h2>'
  );

  // Replace any alien emoji marker in agent sections
  processedContent = processedContent.replace(
    /(<h2[^>]*>Agent Activity<\/h2>[\s\S]*?)(?=<h2|$)/i,
    (section) => section.replace(/<strong>\s*📡\s*<\/strong>/g, "")
  );

  processedContent = processedContent.replace(
    /(<h2[^>]*>Agent Openings<\/h2>[\s\S]*?)(?=<h2|$)/i,
    (section) => section.replace(/<strong>\s*📡\s*<\/strong>/g, "")
  );

  processedContent = processedContent.replace(
    /(<h2[^>]*>Submission Status<\/h2>[\s\S]*?)(?=<h2|$)/i,
    (section) => section.replace(/<strong>\s*📡\s*<\/strong>/g, "")
  );

  // Remove any remaining antenna emojis globally (safety net)
  processedContent = processedContent.replace(/📡/g, "");

  // Add padding to agent data container divs - find the entire agent section and process all divs
  processedContent = processedContent.replace(
    /(<h2[^>]*>(?:Agent Openings|Agent Activity|Submission Status)<\/h2>[\s\S]*?)(?=<h2|$)/gi,
    (match, agentSection) => {
      // Add padding class ONLY to divs that contain agent entries (with h5 tags)
      // This avoids adding padding to wrapper divs around daily sections
      let paddedSection = agentSection.replace(
        /<div>([\s\S]*?<h5[\s\S]*?<\/h5>[\s\S]*?)<\/div>/gi,
        '<div class="p-3 space-y-2">$1</div>'
      );

      // Process genres - try multiple patterns since the exact structure is unclear
      // Pattern 1: <p><strong>Genres: </strong>"content"</p>
      paddedSection = paddedSection.replace(
        /<p>\s*<strong>Genres:\s*<\/strong>\s*"([^"]*)"[^<]*<\/p>/gi,
        (match: string, genreContent: string) => {
          const cleanedText = genreContent
            .replace(/\|/g, ", ")
            .replace(/,\s*,/g, ",")
            .replace(/^[,\s"]+|[,\s"]+$/g, "")
            .trim();
          return `<p><strong>Genres:</strong> ${cleanedText}</p>`;
        }
      );

      // Pattern 2: Any paragraph containing pipe-separated content that looks like genres
      paddedSection = paddedSection.replace(
        /<p[^>]*>([^<]*\|[^<]*)<\/p>/gi,
        (match: string, content: string) => {
          // Only process if it looks like genres (contains common genre words)
          if (
            content.includes("Nonfiction") ||
            content.includes("Fiction") ||
            content.includes("Biography") ||
            content.includes("Business")
          ) {
            const cleanedText = content
              .replace(/\|/g, ", ")
              .replace(/,\s*,/g, ",")
              .replace(/^[,\s"]+|[,\s"]+$/g, "")
              .trim();
            return `<p>${cleanedText}</p>`;
          }
          return match;
        }
      );

      // Ensure all paragraph tags inside the agent section have vertical padding
      paddedSection = paddedSection.replace(
        /<p(\s+[^>]*class=")([^"]*)"/gi,
        (m: string, prefix: string, classes: string) =>
          classes.includes("py-2") ? m : `<p${prefix}py-2 ${classes}"`
      );

      paddedSection = paddedSection.replace(
        /<p(?![^>]*class=)([^>]*)>/gi,
        '<p class="py-0 pb-0"$1>'
      );

      // Replace pipes with commas inside all p tags in the agent section
      paddedSection = paddedSection.replace(
        /<p([^>]*)>([\s\S]*?)<\/p>/gi,
        (m: string, attrs: string, inner: string) => {
          const normalized = inner
            .replace(/\s*\|\s*/g, ", ")
            .replace(/,\s*,/g, ", ")
            .replace(/\s+,/g, ", ")
            .replace(/,\s+/g, ", ")
            .replace(/\s+/g, " ")
            .trim();
          return `<p${attrs}>${normalized}</p>`;
        }
      );

      // Process h4 agent names within this section (make them bold like h5)
      paddedSection = paddedSection.replace(
        /<h4>\s*<a([^>]*)>([\s\S]*?)<\/a>\s*<\/h4>/gi,
        (match: string, attrs: string, inner: string) => {
          const wrapped = `<span class="inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="font-bold underline">${inner}</span>
          </span>`;
          return `<h4><a class="capitalize" ${attrs}>${wrapped}</a></h4>`;
        }
      );

      return paddedSection;
    }
  );

  // Agent name header: add Users icon, make bold + underline, keep link
  processedContent = processedContent.replace(
    /<h5>\s*<a([^>]*)>([\s\S]*?)<\/a>\s*<\/h5>/gi,
    (match, attrs, inner) => {
      // Wrap inner content to ensure bold + underline
      const wrapped = `<span class="inline-flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span class="font-bold underline">${inner}</span>
      </span>`;
      return `<h5><a class="capitalize" ${attrs}>${wrapped}</a></h5>`;
    }
  );

  // Global genres cleanup: replace all pipes with commas inside any paragraph that contains a Genres label
  processedContent = processedContent.replace(
    /<p([^>]*)>([\s\S]*?(?:<strong>\s*Genres\s*:?\s*<\/strong>|Genres\s*:)[\s\S]*?)<\/p>/gi,
    (match, attrs, inner) => {
      const normalized = inner
        .replace(/\|/g, ", ") // pipes -> commas
        .replace(/,\s*,/g, ", ") // collapse duplicate commas
        .replace(/\s+,/g, ", ") // trim space before commas
        .replace(/,\s+/g, ", ") // normalize comma spacing
        .replace(/\s+/g, " ")
        .trim();
      return `<p${attrs}>${normalized}</p>`;
    }
  );

  // Ensure any <footer> element inside processed content has 12px padding (Tailwind p-3)
  processedContent = processedContent.replace(
    /<footer(\s+[^>]*class=")([^\"]*)"/gi,
    (m, prefix, classes) =>
      classes.includes("p-3") ? m : `<footer${prefix}${classes} p-3"`
  );

  processedContent = processedContent.replace(
    /<footer(?![^>]*class=)([^>]*)>/gi,
    '<footer class="p-3"$1>'
  );

  return processedContent;
}

// OLD: Remove all content before the <h2>Weekly Summary</h2> heading
// This strips out navigation, empty tags, and other unwanted HTML from WordPress
// Used for posts before November 3rd, 2025
function removeContentBeforeWeeklySummary(contentHtml: string): string {
  // Find the position of <h2>Weekly Summary</h2> (case-insensitive)
  const weeklySummaryMatch = contentHtml.match(
    /<h2[^>]*>Weekly Summary<\/h2>/i
  );

  if (weeklySummaryMatch && weeklySummaryMatch.index !== undefined) {
    // Keep everything from the Weekly Summary heading onwards
    return contentHtml.substring(weeklySummaryMatch.index);
  }

  // If no Weekly Summary found, return original content
  return contentHtml;
}

// NEW: Remove all content before the first daily section (e.g., <h2>Monday – November 03</h2>)
// This strips out the Weekly Summary overview and other unwanted HTML from WordPress
// Used for posts from November 3rd, 2025 onwards
function removeContentBeforeDailySections(contentHtml: string): string {
  // Pattern to match daily headings like "Monday – November 03", "Tuesday – November 04", etc.
  // Matches: Day name, optional whitespace, en-dash or hyphen, optional whitespace, month name, day, optional comma+year
  const dailyHeadingPattern =
    /<h2[^>]*>(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*[–\-]\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}/i;

  const dailyMatch = contentHtml.match(dailyHeadingPattern);

  if (dailyMatch && dailyMatch.index !== undefined) {
    // Keep everything from the first daily heading onwards
    return contentHtml.substring(dailyMatch.index);
  }

  // Fallback: try to find Weekly Summary as before (for backwards compatibility)
  const weeklySummaryMatch = contentHtml.match(
    /<h2[^>]*>Weekly Summary<\/h2>/i
  );

  if (weeklySummaryMatch && weeklySummaryMatch.index !== undefined) {
    return contentHtml.substring(weeklySummaryMatch.index);
  }

  // If neither found, return original content
  return contentHtml;
}

// Main content processing function for OLD post format (before November 3rd, 2025)
export function processSlushwireContent(
  contentHtml: string,
  excerpt: string | null
): {
  processedContent: string;
  alertsData: { reddit: number; bluesky: number; agents: number } | null;
} {
  // First, remove unwanted content before Weekly Summary
  let filteredContent = removeContentBeforeWeeklySummary(contentHtml);

  // Remove top image
  filteredContent = removeTopImageFromContent(filteredContent);

  // Extract alerts data
  const alertsData = extractAlertsData(excerpt, filteredContent);

  // Remove alerts text from content
  let processedContent = alertsData
    ? removeAlertsFromContent(filteredContent)
    : filteredContent;

  // Format Reddit content
  processedContent = formatSlushWeeklyContent(processedContent);

  return { processedContent, alertsData };
}

// Main content processing function for NEW post format (from November 3rd, 2025 onwards)
export function processSlushwireContentAlt(
  contentHtml: string,
  excerpt: string | null
): {
  processedContent: string;
  alertsData: { reddit: number; bluesky: number; agents: number } | null;
} {
  // First, remove unwanted content before the first daily section
  let filteredContent = removeContentBeforeDailySections(contentHtml);

  // Remove top image
  filteredContent = removeTopImageFromContent(filteredContent);

  // Extract alerts data
  const alertsData = extractAlertsData(excerpt, filteredContent);

  // Remove alerts text from content
  let processedContent = alertsData
    ? removeAlertsFromContent(filteredContent)
    : filteredContent;

  // Format Reddit content with NEW formatter
  processedContent = formatSlushWeeklyContentAlt(processedContent);

  return { processedContent, alertsData };
}

// Generic blog content processor (non-Slushwire posts)
// - Removes the top image (WordPress featured image duplication)
// - Ensures footer inside HTML has 12px padding (p-3)
// - Adds safe wrapping so long words/URLs don't overflow on small screens
export function processBlogContent(contentHtml: string): string {
  // Remove the first/top image figure to avoid duplication with our layout
  let processedContent = removeTopImageFromContent(contentHtml);

  // Ensure any <footer> element has Tailwind padding p-3 (~12px)
  processedContent = processedContent.replace(
    /<footer(\s+[^>]*class=")([^\"]*)"/gi,
    (m, prefix, classes) =>
      classes.includes("p-3") ? m : `<footer${prefix}${classes} p-3"`
  );
  processedContent = processedContent.replace(
    /<footer(?![^>]*class=)([^>]*)>/gi,
    '<footer class="p-3"$1>'
  );

  processedContent = processedContent.replace(
    /<h2[^>]*>/gi,
    '<h2 class="text-lg font-semibold break-words mb-2"$1>'
  );

  // Add word wrapping classes to common text blocks to prevent overflow
  // 1) If class exists, append break-words when missing
  processedContent = processedContent.replace(
    /<(p|li|a|h[1-6])((?:\s+[^>]*class=")([^"]*))/gi,
    (m, tag, rest, classes) =>
      classes.includes("break-words") ? m : `<${tag}${rest} break-words"`
  );
  // 2) If no class exists, create one with break-words
  processedContent = processedContent.replace(
    /<(p|li|a|h[1-6])(?![^>]*class=)([^>]*)>/gi,
    '<$1 class="break-words mb-2"$2>'
  );

  // Ensure lists have basic padding and styling
  // 1) If class exists on <ul>, append expected classes when missing
  processedContent = processedContent.replace(
    /<ul(\s+[^>]*class=")([^"]*)"/gi,
    (match, prefix, classes) => {
      let newClasses = classes;
      if (!/\blist-disc\b/i.test(newClasses)) newClasses += " list-disc";
      if (!/\bpl-\d+\b/i.test(newClasses)) newClasses += " pl-6";
      if (!/\bmb-\d+\b/i.test(newClasses)) newClasses += " mb-4";
      if (!/\bbreak-words\b/i.test(newClasses)) newClasses += " break-words";
      return `<ul${prefix}${newClasses}"`;
    }
  );
  // 2) If no class on <ul>, add defaults
  processedContent = processedContent.replace(
    /<ul(?![^>]*class=)([^>]*)>/gi,
    '<ul class="list-disc pl-6 mb-4 break-words"$1>'
  );

  // 3) If class exists on <ol>, append expected classes when missing
  processedContent = processedContent.replace(
    /<ol(\s+[^>]*class=")([^"]*)"/gi,
    (match, prefix, classes) => {
      let newClasses = classes;
      if (!/\blist-decimal\b/i.test(newClasses)) newClasses += " list-decimal";
      if (!/\bpl-\d+\b/i.test(newClasses)) newClasses += " pl-6";
      if (!/\bmb-\d+\b/i.test(newClasses)) newClasses += " mb-4";
      if (!/\bbreak-words\b/i.test(newClasses)) newClasses += " break-words";
      return `<ol${prefix}${newClasses}"`;
    }
  );
  // 4) If no class on <ol>, add defaults
  processedContent = processedContent.replace(
    /<ol(?![^>]*class=)([^>]*)>/gi,
    '<ol class="list-decimal pl-6 mb-4 break-words"$1>'
  );

  return processedContent;
}
