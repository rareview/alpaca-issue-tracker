export const DEFAULT_RESTORE_PAGE_SIZE = 20;

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
    '/alpaca/v1/deleted-items' +
    `?per_page=${normalizedPerPage}` +
    `&page=${normalizedPage}`;

  if (trimmedQuery) {
    path += `&search=${encodeURIComponent(trimmedQuery)}`;
  }

  return path;
};

/**
 * Read deleted-items pagination totals from a response payload.
 *
 * @param {Object|null} responseData Deleted items response payload.
 * @param {number}      perPage      Items per page.
 * @return {Object} Pagination info.
 */
export const getRestorePaginationInfo = (
  responseData,
  perPage = DEFAULT_RESTORE_PAGE_SIZE,
) => {
  const normalizedPerPage = Math.max(1, parseInt(perPage, 10) || 1);
  const totalItems = parseInt(responseData?.pagination?.totalItems || '0', 10);
  const totalPages = parseInt(responseData?.pagination?.totalPages || '1', 10);

  return {
    totalItems: Number.isNaN(totalItems) ? 0 : Math.max(0, totalItems),
    totalPages: Number.isNaN(totalPages) ? 1 : Math.max(1, totalPages),
    perPage: normalizedPerPage,
  };
};
