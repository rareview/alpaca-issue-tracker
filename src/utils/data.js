const { decodeEntities } = wp.htmlEntities;

/**
 * Transform server data into array format for board state.
 * @param {Array} data The data from `alpaca_get_board_data`.
 */
const transformDataForBoard = (data) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((column) => ({
    id: column.id.toString(),
    title: decodeEntities(column.title),
    items: column.issues.map((issue) => ({
      id: issue.id.toString(),
      content: decodeEntities(issue.title),
      slug: issue.slug || issue.post_name || '',
      postDate: issue.post_date_gmt || issue.post_date,
      authorName: issue.author_name,
      authorImg: issue.author_img,
      assignees: issue.assignees || [],
      labels: issue.labels || [],
      commentCount: issue.comment_count ?? 0,
      commentCountByAgent: issue.comment_count_by_agent || null,
      meta: issue.meta || {},
    })),
  }));
};

/**
 * Save board order in DOM order, including container IDs & titles.
 */
const saveBoardOrder = () => {
  const containersInDomOrder = document.querySelectorAll('.alpaca-container');

  const data = Array.from(containersInDomOrder).map((containerEl) => {
    const id = parseInt(containerEl.dataset.id, 10);
    const title = containerEl.querySelector('h2').textContent.trim();
    // Select all items except for the empty placeholder.
    const items = containerEl.querySelectorAll('.alpaca-item:not(.empty)');

    return {
      id,
      title,
      issues: Array.from(items).map((itemEl) =>
        parseInt(itemEl.dataset.id, 10),
      ),
    };
  });

  // Use wp.apiFetch to send data to the REST API endpoint.
  // It automatically handles nonces for authenticated requests.
  wp.apiFetch({
    path: '/alpaca/v1/board',
    method: 'POST',
    data,
  })
    .then((_res) => {
      // saved successfully
    })
    .catch((err) => {
      console.error('Error saving board order:', err);
    });
};

export { transformDataForBoard, saveBoardOrder };
