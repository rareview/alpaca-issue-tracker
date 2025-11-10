export const fetchIssue = (id) => wp.apiFetch({ path: `/issue/v1/get/${id}` });

export const updateIssue = (id, data) => {
  return wp.apiFetch({
    path: `/issue/v1/update/${id}`,
    method: 'POST',
    data,
  });
};

export const fetchStatuses = () => wp.apiFetch({ path: '/alpaca/v1/statuses' });

export const fetchUsers = () => wp.apiFetch({ path: '/alpaca/v1/users' });

export const fetchIssueCommentCount = (id) => {
  return wp.apiFetch({ path: `/issue/v1/comment-count/${id}` });
};
