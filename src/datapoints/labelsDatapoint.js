const { __ } = wp.i18n;

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
      <div className="alpaca-item-labels">
        {labels.map((label) => (
          <span
            key={label.term_id || `${label.slug}-${label.name}`}
            className="alpaca-item-label alpaca-label-pill"
            style={{
              backgroundColor: label.color || '#172b4d',
              color: '#fff',
            }}
            title={label.name}
          >
            {label.name}
          </span>
        ))}
      </div>
    </>
  );
};

export const labelsDatapointRegistration = {
  slug: 'labels',
  label: __('Labels', 'alpaca'),
  namespace: 'alpaca/item/addLabelsDatapoint',
  callback: addLabelsDatapoint,
  defaultEnabled: true,
};
