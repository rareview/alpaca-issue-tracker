/**
 * Get the visible WordPress admin bar height for a frontend board.
 *
 * @param {Element|null} boardElement Frontend board element.
 * @return {number} Admin bar height in pixels, or zero when unavailable.
 */
export function getAdminBarOffset(boardElement) {
  if (!boardElement || typeof document === 'undefined') {
    return 0;
  }

  const adminBar = document.getElementById('wpadminbar');
  if (!adminBar) {
    return 0;
  }

  const adminBarStyle = getComputedStyle(adminBar);
  const adminBarRect = adminBar.getBoundingClientRect();

  if (
    adminBarStyle.display === 'none' ||
    adminBarStyle.visibility === 'hidden' ||
    adminBarRect.height <= 0
  ) {
    return 0;
  }

  return adminBarRect.height;
}
