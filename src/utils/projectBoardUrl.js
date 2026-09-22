import { getAlpacaRestRoot } from './restApiRoot.js';

/**
 * Get the admin URL that links to the project board.
 *
 * @return {string} Project board admin URL.
 */
export const getProjectBoardUrl = () => {
  if (
    typeof window !== 'undefined' &&
    window.alpaistrSettings?.adminUrl &&
    typeof window.alpaistrSettings.adminUrl === 'string'
  ) {
    return `${window.alpaistrSettings.adminUrl}?page=project-board`;
  }

  const restRoot = getAlpacaRestRoot();
  if (typeof restRoot === 'string' && restRoot.includes('/wp-json/')) {
    return `${restRoot.replace('/wp-json/', '/wp-admin/')}admin.php?page=project-board`;
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/wp-admin/admin.php?page=project-board`;
  }

  return '/wp-admin/admin.php?page=project-board';
};
