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
 * Build template API helpers for a notification template endpoint.
 *
 * @param {string} basePath REST base path.
 * @return {Object} Template API helpers.
 */
const createTemplateApi = (basePath) => ({
  fetchTemplate: () => wp.apiFetch({ path: basePath }),
  updateTemplate: (payload) =>
    wp.apiFetch({
      path: basePath,
      method: 'POST',
      data: payload,
    }),
  resetTemplate: () =>
    wp.apiFetch({
      path: `${basePath}/reset`,
      method: 'POST',
    }),
  previewTemplate: (payload) =>
    wp.apiFetch({
      path: `${basePath}/preview`,
      method: 'POST',
      data: payload,
    }),
  sendTestEmail: (payload) =>
    wp.apiFetch({
      path: `${basePath}/test`,
      method: 'POST',
      data: payload,
    }),
});

const notificationTemplateApi = createTemplateApi(
  '/alpaca/v1/notification-template',
);
const notificationDigestTemplateApi = createTemplateApi(
  '/alpaca/v1/notification-digest-template',
);

/**
 * Fetch the admin notification email template.
 *
 * @return {Promise<Object>} Template payload.
 */
export const fetchNotificationTemplate = notificationTemplateApi.fetchTemplate;

/**
 * Save the admin notification email template.
 *
 * @param {Object} payload Template payload.
 * @return {Promise<Object>} Saved template payload.
 */
export const updateNotificationTemplate =
  notificationTemplateApi.updateTemplate;

/**
 * Reset the admin notification email template to defaults.
 *
 * @return {Promise<Object>} Reset template payload.
 */
export const resetNotificationTemplate = notificationTemplateApi.resetTemplate;

/**
 * Preview the notification email template.
 *
 * @param {Object} payload Template payload.
 * @return {Promise<Object>} Preview payload.
 */
export const previewNotificationTemplate =
  notificationTemplateApi.previewTemplate;

/**
 * Send a notification template test email.
 *
 * @param {Object} payload Template payload.
 * @return {Promise<Object>} Test-send response.
 */
export const sendNotificationTemplateTestEmail =
  notificationTemplateApi.sendTestEmail;

/**
 * Fetch the admin daily digest template.
 *
 * @return {Promise<Object>} Template payload.
 */
export const fetchNotificationDigestTemplate =
  notificationDigestTemplateApi.fetchTemplate;

/**
 * Save the admin daily digest template.
 *
 * @param {Object} payload Template payload.
 * @return {Promise<Object>} Saved template payload.
 */
export const updateNotificationDigestTemplate =
  notificationDigestTemplateApi.updateTemplate;

/**
 * Reset the admin daily digest template to defaults.
 *
 * @return {Promise<Object>} Reset template payload.
 */
export const resetNotificationDigestTemplate =
  notificationDigestTemplateApi.resetTemplate;

/**
 * Preview the daily digest template.
 *
 * @param {Object} payload Template payload.
 * @return {Promise<Object>} Preview payload.
 */
export const previewNotificationDigestTemplate =
  notificationDigestTemplateApi.previewTemplate;

/**
 * Send a daily digest template test email.
 *
 * @param {Object} payload Template payload.
 * @return {Promise<Object>} Test-send response.
 */
export const sendNotificationDigestTemplateTestEmail =
  notificationDigestTemplateApi.sendTestEmail;

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
