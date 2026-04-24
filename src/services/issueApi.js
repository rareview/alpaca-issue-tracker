export const fetchIssue = (id) => wp.apiFetch({ path: `/alpaca/v1/get/${id}` });

export const updateIssue = (id, data) => {
  return wp.apiFetch({
    path: `/alpaca/v1/update/${id}`,
    method: 'POST',
    data,
  });
};

export const createIssue = (data) => {
  return wp.apiFetch({
    path: '/alpaca/v1/issues',
    method: 'POST',
    data,
  });
};

export const createSubissue = (data) => {
  return wp.apiFetch({
    path: '/alpaca/v1/subissues',
    method: 'POST',
    data,
  });
};

export const fetchStatuses = () => wp.apiFetch({ path: '/alpaca/v1/statuses' });

export const fetchUsers = () => wp.apiFetch({ path: '/alpaca/v1/users' });
export const fetchLabels = () => wp.apiFetch({ path: '/alpaca/v1/labels' });

export const fetchIssueCommentCount = (id) => {
  return wp.apiFetch({ path: `/alpaca/v1/comment-count/${id}` });
};

export const deleteIssue = (id) => {
  return wp.apiFetch({
    path: `/alpaca/v1/delete/${id}`,
    method: 'DELETE',
  });
};
