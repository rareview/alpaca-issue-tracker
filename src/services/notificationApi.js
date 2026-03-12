/**
 * Fetch the current user's notification preferences.
 *
 * @return {Promise<Object>} Preference payload.
 */
const ITEM_IDS_KEY = 'item_ids';

export const fetchNotificationPreferences = () =>
  wp.apiFetch({ path: '/alpaca/v1/notification-preferences' });

/**
 * Save the current user's notification preferences.
 *
 * @param {Object} preferences Preference payload.
 * @return {Promise<Object>} Saved preference payload.
 */
export const updateNotificationPreferences = (preferences) =>
  wp.apiFetch({
    path: '/alpaca/v1/notification-preferences',
    method: 'POST',
    data: { preferences },
  });

/**
 * Fetch the admin notification email template.
 *
 * @return {Promise<Object>} Template payload.
 */
export const fetchNotificationTemplate = () =>
  wp.apiFetch({ path: '/alpaca/v1/notification-template' });

/**
 * Save the admin notification email template.
 *
 * @param {Object} payload Template payload.
 * @return {Promise<Object>} Saved template payload.
 */
export const updateNotificationTemplate = (payload) =>
  wp.apiFetch({
    path: '/alpaca/v1/notification-template',
    method: 'POST',
    data: payload,
  });

/**
 * Reset the admin notification email template to defaults.
 *
 * @return {Promise<Object>} Reset template payload.
 */
export const resetNotificationTemplate = () =>
  wp.apiFetch({
    path: '/alpaca/v1/notification-template/reset',
    method: 'POST',
  });

/**
 * Preview the notification email template.
 *
 * @param {Object} payload Template payload.
 * @return {Promise<Object>} Preview payload.
 */
export const previewNotificationTemplate = (payload) =>
  wp.apiFetch({
    path: '/alpaca/v1/notification-template/preview',
    method: 'POST',
    data: payload,
  });

/**
 * Send a notification template test email.
 *
 * @param {Object} payload Template payload.
 * @return {Promise<Object>} Test-send response.
 */
export const sendNotificationTemplateTestEmail = (payload) =>
  wp.apiFetch({
    path: '/alpaca/v1/notification-template/test',
    method: 'POST',
    data: payload,
  });

/**
 * Fetch inbox items for the current user.
 *
 * @param {Object} params Query params.
 * @return {Promise<Object>} Inbox payload.
 */
export const fetchNotificationInbox = (params = {}) => {
  const query = new URLSearchParams();

  if (params.filter) {
    query.set('filter', params.filter);
  }

  if (params.page) {
    query.set('page', String(params.page));
  }

  if (params.perPage) {
    query.set('per_page', String(params.perPage));
  }

  const path = query.toString()
    ? `/alpaca/v1/notification-inbox?${query.toString()}`
    : '/alpaca/v1/notification-inbox';

  return wp.apiFetch({ path });
};

/**
 * Fetch the current user's unread inbox count.
 *
 * @return {Promise<Object>} Count payload.
 */
export const fetchNotificationInboxCount = () =>
  wp.apiFetch({ path: '/alpaca/v1/notification-inbox/count' });

/**
 * Mark inbox items as read.
 *
 * @param {number[]} itemIds Inbox item IDs.
 * @return {Promise<Object>} Mutation response.
 */
export const markNotificationInboxItemsRead = (itemIds) =>
  wp.apiFetch({
    path: '/alpaca/v1/notification-inbox/mark-read',
    method: 'POST',
    data: { [ITEM_IDS_KEY]: itemIds },
  });

/**
 * Mark inbox items as unread.
 *
 * @param {number[]} itemIds Inbox item IDs.
 * @return {Promise<Object>} Mutation response.
 */
export const markNotificationInboxItemsUnread = (itemIds) =>
  wp.apiFetch({
    path: '/alpaca/v1/notification-inbox/mark-unread',
    method: 'POST',
    data: { [ITEM_IDS_KEY]: itemIds },
  });

/**
 * Mark all inbox items as read.
 *
 * @return {Promise<Object>} Mutation response.
 */
export const markAllNotificationInboxItemsRead = () =>
  wp.apiFetch({
    path: '/alpaca/v1/notification-inbox/mark-all-read',
    method: 'POST',
  });
