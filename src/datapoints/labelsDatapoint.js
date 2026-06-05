const { __ } = wp.i18n;
const { Tooltip } = wp.components;

import { normalizeLabelColor } from '../utils/labelColor';

/**
 * Filter to add labels to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original datapoints content.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} Labels markup or original content.
 */
export const addLabelsDatapoint = (originalContent, itemProps) => {
  const { labels } = itemProps;

  if (!Array.isArray(labels) || labels.length < 1) {
    return originalContent;
  }

  return (
    <>
      {originalContent}
      <Tooltip text={__('Labels', 'alpaca-issue-tracker')}>
        <div className="alpaca-item-labels">
          {labels.map((label) => (
            <span
              key={label.term_id || `${label.slug}-${label.name}`}
              className="alpaca-item-label alpaca-label-pill"
              style={{
                backgroundColor: normalizeLabelColor(label.color),
                color: '#fff',
              }}
              title={label.name}
            >
              {label.name}
            </span>
          ))}
        </div>
      </Tooltip>
    </>
  );
};

export const labelsDatapointRegistration = {
  slug: 'labels',
  label: __('Labels', 'alpaca-issue-tracker'),
  namespace: 'alpaca/item/addLabelsDatapoint',
  callback: addLabelsDatapoint,
  defaultEnabled: true,
};
