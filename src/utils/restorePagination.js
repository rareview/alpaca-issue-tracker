export const DEFAULT_RESTORE_PAGE_SIZE = 20;

export const RESTORE_ISSUE_FIELDS =
  'id,title,content,post_title,post_content,date,date_gmt,meta,alpaca_label';

/**
 * Build the REST path for deleted issues.
 *
 * @param {Object} args         Path arguments.
 * @param {string} args.query   Search term.
 * @param {number} args.page    Page number.
 * @param {number} args.perPage Items per page.
 * @return {string} REST path.
 */
export const buildRestoreIssuesPath = ({
  query = '',
  page = 1,
  perPage = DEFAULT_RESTORE_PAGE_SIZE,
} = {}) => {
  const trimmedQuery = String(query || '').trim();
  const normalizedPage = Math.max(1, parseInt(page, 10) || 1);
  const normalizedPerPage = Math.max(1, parseInt(perPage, 10) || 1);

  let path =
    '/wp/v2/alpaca_issue?status=trash&context=edit' +
    `&per_page=${normalizedPerPage}` +
    `&page=${normalizedPage}` +
    `&_fields=${RESTORE_ISSUE_FIELDS}`;

  if (trimmedQuery) {
    path += `&search=${encodeURIComponent(trimmedQuery)}`;
  }

  return path;
};

/**
 * Read REST pagination totals from a response object.
 *
 * @param {Response|null} response REST response object.
 * @param {number}        perPage  Items per page.
 * @return {Object} Pagination info.
 */
export const getRestorePaginationInfo = (
  response,
  perPage = DEFAULT_RESTORE_PAGE_SIZE,
) => {
  const normalizedPerPage = Math.max(1, parseInt(perPage, 10) || 1);
  const totalItems = parseInt(response?.headers?.get('X-WP-Total') || '0', 10);
  const totalPages = parseInt(
    response?.headers?.get('X-WP-TotalPages') || '1',
    10,
  );

  return {
    totalItems: Number.isNaN(totalItems) ? 0 : Math.max(0, totalItems),
    totalPages: Number.isNaN(totalPages) ? 1 : Math.max(1, totalPages),
    perPage: normalizedPerPage,
  };
};
