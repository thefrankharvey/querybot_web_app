/**
 * Author E-E-A-T Config Template
 *
 * Populate a real author here for every page that has opinions, advice,
 * or content claims. Especially important for YMYL topics (health, finance,
 * legal, safety) where Google heavily weights author authority.
 *
 * Place this at: src/constants/authors.ts
 *
 * Usage:
 *   import { AUTHORS } from '@/constants/authors'
 *   <JsonLdScript data={buildPersonJsonLd(AUTHORS.ceo)} />
 */

import type { AuthorMeta } from '@/lib/seo'; // <- adjust path to your seo.ts

export const AUTHORS: Record<string, AuthorMeta> = {
  // ── Example: CEO / Founder — appears on homepage, about page ──
  ceo: {
    name: 'Jane Smith',
    title: 'Co-Founder & Chief Executive Officer',
    bio: 'Over a decade of experience in [industry]. Leads [brand] with a focus on [mission].',
    url: undefined,                           // TODO: 'https://yoursite.com/about/jane'
    imageUrl: undefined,                      // TODO: URL to 400x400 headshot
    expertise: [
      'product development',
      'brand strategy',
      'e-commerce',
      // Add domain-specific expertise here
    ],
    linkedinUrl: 'https://linkedin.com/in/janesmith',
    twitterUrl: 'https://x.com/janesmith',
    university: 'University Name',
    degree: 'Bachelor of Science in Business Administration',
    educationLevel: "Bachelor's",
    certifications: [
      // { name: 'Certification Name', category: 'certification' },
    ],
    memberOf: 'Professional Org Name',         // Optional
  },

  // ── Example: Subject-matter expert — appears on product pages, blogs ──
  // For health products, use a healthcare exec, nutritionist, or medical advisor.
  // For finance content, use a CFA, CPA, or financial advisor.
  // For legal content, use a licensed attorney.
  expert: {
    name: 'Dr. John Doe',
    title: 'Chief Science Officer',
    bio: 'Expert in [specific domain] with [N] years of experience and [credentials].',
    url: undefined,
    imageUrl: undefined,
    expertise: [
      'nutrition science',
      'functional medicine',
      'supplement formulation',
    ],
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    twitterUrl: undefined,
    university: 'Medical School Name',
    degree: 'MD, Internal Medicine',
    educationLevel: 'Doctorate',
    certifications: [
      { name: 'Board Certified in Internal Medicine', category: 'certification' },
      { name: 'Fellowship in Integrative Medicine', category: 'certification' },
    ],
    memberOf: 'American Medical Association',
  },

  // ── Example: Content writer / blog author ──
  writer: {
    name: 'Alex Johnson',
    title: 'Senior Content Writer',
    bio: 'Health and wellness writer covering [topics]. Contributor to [publications].',
    url: undefined,
    imageUrl: undefined,
    expertise: ['nutrition', 'mental health', 'habit formation'],
    linkedinUrl: 'https://linkedin.com/in/alexjohnson',
    twitterUrl: 'https://x.com/alexjohnson',
    university: 'Journalism School',
    degree: 'BA in Journalism',
    educationLevel: "Bachelor's",
    certifications: [],
    memberOf: undefined,
  },
};

/**
 * Guidelines for writing strong author bios:
 *
 * 1. Name + credentials in the display name (e.g., "Dr. Jane Smith, RD")
 * 2. Specific job title, not vague (e.g., "Cardiologist" not "Doctor")
 * 3. Bio: 1-3 sentences with specifics — years of experience, notable work,
 *    professional associations, publications
 * 4. Expertise: 5-10 specific topics (not generic like "health")
 * 5. Always include LinkedIn — Google cross-references author pages there
 * 6. Include university + degree for YMYL content (health, finance, legal)
 * 7. Certifications matter: list professional licenses, board certifications,
 *    recognized credentials (CPA, CFA, RD, RN, MD, PhD, etc.)
 *
 * For YMYL (Your Money Your Life) content, the Person schema is especially
 * critical. Google uses it to determine whether content is from a legitimate
 * expert vs. random blogger. Missing E-E-A-T = low ranking on health/finance.
 */
