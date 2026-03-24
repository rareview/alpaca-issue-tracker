const { __ } = wp.i18n;
import CommentIcon from '../components/icons/CommentIcon';
import {
  normalizeCommentAgentType,
  normalizeCommentAgentTypes,
} from '../utils/commentAgentFilters';

/**
 * Try to resolve a comment count for a specific agent type.
 *
 * Supports either a keyed count map (for example `comment_count_by_agent`)
 * or a list of comments that include a `comment_agent` field.
 *
 * @param {Object} itemProps           Item props passed to datapoint filters.
 * @param {Array}  requestedAgentTypes The normalized comment agent types.
 * @return {number|null} Count for the requested type when resolvable, else null.
 */
const getTypedCommentCount = (itemProps, requestedAgentTypes) => {
  if (!Array.isArray(requestedAgentTypes) || requestedAgentTypes.length < 1) {
    return null;
  }

  const countMaps = [
    itemProps?.commentCountByAgent,
    itemProps?.commentCountsByAgent,
    itemProps?.comment_count_by_agent,
    itemProps?.meta?.commentCountByAgent,
    itemProps?.meta?.commentCountsByAgent,
    itemProps?.meta?.comment_count_by_agent,
  ];

  for (const countMap of countMaps) {
    if (countMap && 'object' === typeof countMap && !Array.isArray(countMap)) {
      let typedCount = 0;
      let hasCountMap = false;

      requestedAgentTypes.forEach((requestedAgentType) => {
        const agentCount = Number(countMap[requestedAgentType]);
        if (Number.isFinite(agentCount)) {
          typedCount += agentCount;
        }

        hasCountMap = true;
      });

      if (hasCountMap) {
        return typedCount;
      }
    }
  }

  const commentCollections = [
    itemProps?.comments,
    itemProps?.issuecomments,
    itemProps?.meta?.comments,
    itemProps?.meta?.issuecomments,
  ];

  for (const comments of commentCollections) {
    if (Array.isArray(comments)) {
      return comments.filter((comment) =>
        requestedAgentTypes.includes(
          normalizeCommentAgentType(comment?.comment_agent),
        ),
      ).length;
    }
  }

  return null;
};

/**
 * Resolve the final comment count to display for an item.
 *
 * Consumers can choose the comment agent type with
 * `alpaca.item.commentCount.agentType` and can override the resulting count
 * with `alpaca.item.commentCount`.
 *
 * @param {Object} itemProps Item props passed to datapoint filters.
 * @return {number} Comment count value to display.
 */
const getCommentCountForDatapoint = (itemProps) => {
  const baseCommentCount = Number(itemProps?.commentCount) || 0;
  const requestedAgentTypes = normalizeCommentAgentTypes(
    wp.hooks.applyFilters(
      'alpaca.item.commentCount.agentType',
      null,
      itemProps,
    ),
  );

  let resolvedCommentCount = baseCommentCount;

  if (requestedAgentTypes.length > 0) {
    const typedCommentCount = getTypedCommentCount(
      itemProps,
      requestedAgentTypes,
    );
    if (null !== typedCommentCount) {
      resolvedCommentCount = typedCommentCount;
    }
  }

  const filteredCommentCount = Number(
    wp.hooks.applyFilters('alpaca.item.commentCount', resolvedCommentCount, {
      ...itemProps,
      requestedCommentAgentType:
        1 === requestedAgentTypes.length ? requestedAgentTypes[0] : null,
      requestedCommentAgentTypes: requestedAgentTypes,
    }),
  );

  if (Number.isFinite(filteredCommentCount) && filteredCommentCount >= 0) {
    return filteredCommentCount;
  }

  return resolvedCommentCount;
};

/**
 * Filter to add comment count to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original datapoints content.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} Comment count markup or original content.
 */
export const addCommentCountDatapoint = (originalContent, itemProps) => {
  const commentCount = getCommentCountForDatapoint(itemProps);

  if (typeof commentCount !== 'undefined' && commentCount > 0) {
    return (
      <>
        {originalContent}
        <div className="alpaca-item-icon alpaca-item-comment-count">
          <CommentIcon />
          {commentCount}
        </div>
      </>
    );
  }

  return originalContent;
};

export const commentCountDatapointRegistration = {
  slug: 'comment_count',
  label: __('Comments', 'alpaca'),
  namespace: 'alpaca/item/addCommentCountDatapoint',
  callback: addCommentCountDatapoint,
  defaultEnabled: true,
};

wp.hooks.addFilter(
  'alpaca.item.commentCount.agentType',
  'alpaca/item/comment-agent-type',
  () => ['human'],
);
