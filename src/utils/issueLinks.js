import { escapeAttr, escapeHtml } from './sanitize';

const { decodeEntities } = wp.htmlEntities;

export const ISSUE_LINK_MIN_QUERY_LENGTH = 3;
export const ISSUE_LINK_TOKEN_REGEX = /#\[([^\]]+)\]\(([^)\s]+)\)/g;

/**
 * Build a stable fallback URL for an issue link.
 *
 * @param {string} slug Issue slug.
 * @return {string} URL string.
 */
export const buildIssueLinkHref = (slug) => {
  const normalizedSlug = typeof slug === 'string' ? slug.trim() : '';

  if (!normalizedSlug) {
    return '#';
  }

  try {
    if (typeof window !== 'undefined' && window.location) {
      const issueUrl = new URL(window.location.href);
      issueUrl.searchParams.set('issue', normalizedSlug);
      return issueUrl.toString();
    }
  } catch (error) {
    // Fall back to a relative URL below.
  }

  return `?issue=${encodeURIComponent(normalizedSlug)}`;
};

/**
 * Resolve a string-like value from potential issue field input.
 *
 * @param {*} value Raw field value.
 * @return {string} String representation or empty string.
 */
const resolveStringValue = (value) => {
  if (typeof value === 'string') {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  if (typeof value.rendered === 'string') {
    return value.rendered;
  }

  if (typeof value.raw === 'string') {
    return value.raw;
  }

  if (typeof value.post_title === 'string') {
    return value.post_title;
  }

  if (typeof value.slug === 'string') {
    return value.slug;
  }

  if (typeof value.post_name === 'string') {
    return value.post_name;
  }

  return '';
};

const resolveIssueSlug = (issue) =>
  resolveStringValue(issue?.slug) || resolveStringValue(issue?.post_name) || '';

export const getIssueLinkSlug = (issue) => resolveIssueSlug(issue);

export const getIssueLinkLabel = (issue) => {
  const titleValue =
    resolveStringValue(issue?.title) ||
    resolveStringValue(issue?.content) ||
    resolveStringValue(issue?.post_title) ||
    resolveIssueSlug(issue) ||
    '';

  const normalizedTitle = decodeEntities(String(titleValue || ''))
    .replace(/<[^>]*>?/gm, '')
    .trim();

  return normalizedTitle || resolveIssueSlug(issue);
};

/**
 * Build the raw markdown token used for issue-to-issue links.
 *
 * @param {Object} issue Issue object.
 * @return {string} Issue link token.
 */
export const buildIssueLinkToken = (issue) => {
  const slug = String(issue?.slug || issue?.post_name || '').trim();
  const label = getIssueLinkLabel(issue);

  if (!slug || !label) {
    return '';
  }

  return `#[${label}](${slug})`;
};

/**
 * Extract issue link tokens from raw markdown.
 *
 * @param {string} rawContent Raw comment content.
 * @return {Array<Object>} Extracted issue links.
 */
export const extractIssueLinks = (rawContent) => {
  const content = typeof rawContent === 'string' ? rawContent : '';
  const matches = Array.from(content.matchAll(ISSUE_LINK_TOKEN_REGEX));

  return matches
    .map((match) => {
      const label = String(match[1] || '').trim();
      const slug = String(match[2] || '').trim();

      if (!label || !slug) {
        return null;
      }

      return { label, slug };
    })
    .filter(Boolean);
};

/**
 * Replace issue link tokens with styled anchor markup.
 *
 * @param {string} rawContent Raw markdown content.
 * @return {string} Content with rendered issue link anchors.
 */
export const renderIssueLinkMarkup = (rawContent) => {
  const content = typeof rawContent === 'string' ? rawContent : '';

  return content.replace(ISSUE_LINK_TOKEN_REGEX, (_match, label, slug) => {
    const normalizedLabel = String(label || '').trim();
    const normalizedSlug = String(slug || '').trim();

    if (!normalizedLabel || !normalizedSlug) {
      return _match;
    }

    return `<a href="${escapeAttr(
      buildIssueLinkHref(normalizedSlug),
    )}" class="alpaca-issue-link" data-issue-slug="${escapeAttr(
      normalizedSlug,
    )}"><span class="alpaca-issue-link-label">${escapeHtml(
      normalizedLabel,
    )}</span></a>`;
  });
};
