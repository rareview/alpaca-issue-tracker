const { __ } = wp.i18n;
import CommentIcon from '../components/icons/CommentIcon';

/**
 * Filter to add comment count to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original datapoints content.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} Comment count markup or original content.
 */
export const addCommentCountDatapoint = (originalContent, itemProps) => {
  const { commentCount } = itemProps;

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
