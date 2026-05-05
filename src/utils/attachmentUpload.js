const { __ } = wp.i18n;

/**
 * Upload a file to the Alpaca attachments endpoint.
 *
 * @param {File}   file    File to upload.
 * @param {number} issueId Issue ID.
 * @return {Promise<Object>} Uploaded attachment data.
 */
export const uploadIssueAttachment = async (file, issueId) => {
  if (!file) {
    throw new Error(__('Missing attachment file.', 'alpaca'));
  }

  const formData = new window.FormData();
  formData.append('file', file);
  formData.append('issue_id', issueId);

  const response = await wp.apiFetch({
    path: '/alpaca/v1/comment-attachments',
    method: 'POST',
    body: formData,
  });

  if (!response || response.success === false) {
    throw new Error(
      response?.message || __('Failed to upload attachment.', 'alpaca'),
    );
  }

  if (!response.url) {
    throw new Error(__('Failed to upload attachment.', 'alpaca'));
  }

  return {
    id: `${file.name}-${file.size}-${Date.now()}`,
    name: response.name || file.name,
    mime: response.mime || file.type || '',
    url: response.url,
  };
};

/**
 * Delete a previously uploaded issue attachment.
 *
 * @param {string}      url       Attachment URL to delete.
 * @param {number}      issueId   Issue ID the attachment belongs to.
 * @param {number|null} commentId Optional comment ID for linked attachments.
 * @return {Promise<void>} Resolves when deletion succeeds.
 */
export const deleteIssueAttachment = async (url, issueId, commentId = null) => {
  if (!url || !issueId) {
    return;
  }

  const requestDataEntries = [
    ['issue_id', issueId],
    ['url', url],
  ];

  if (Number(commentId) > 0) {
    requestDataEntries.push(['comment_id', Number(commentId)]);
  }

  const response = await wp.apiFetch({
    path: '/alpaca/v1/comment-attachments/delete',
    method: 'POST',
    data: Object.fromEntries(requestDataEntries),
  });

  if (!response || response.success === false) {
    throw new Error(
      response?.message || __('Failed to delete attachment.', 'alpaca'),
    );
  }
};

/**
 * Convert a data URL to a File for uploading.
 *
 * @param {string} dataUrl  Data URL string.
 * @param {string} filename File name.
 * @return {Promise<File>} File instance.
 */
export const dataUrlToFile = async (dataUrl, filename) => {
  if (!dataUrl) {
    throw new Error(__('Missing attachment data.', 'alpaca'));
  }

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const type = blob.type || 'application/octet-stream';

  return new File([blob], filename, { type });
};
