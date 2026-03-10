/**
 * Fetch the current user's notification preferences.
 *
 * @return {Promise<Object>} Preference payload.
 */
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
