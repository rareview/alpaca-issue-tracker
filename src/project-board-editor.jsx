const { registerBlockType } = wp.blocks;
const { InspectorControls, useBlockProps } = wp.blockEditor;
const {
  CheckboxControl,
  Notice,
  PanelBody,
  SelectControl,
  Spinner,
  ToggleControl,
} = wp.components;
const { useEffect, useState } = wp.element;
const { __ } = wp.i18n;

import PropTypes from 'prop-types';

const DATAPOINTS = [
  {
    slug: 'priority',
    label: __('Priority', 'alpaca-issue-tracker'),
  },
  {
    slug: 'assignees',
    label: __('Assignees', 'alpaca-issue-tracker'),
  },
  {
    slug: 'labels',
    label: __('Labels', 'alpaca-issue-tracker'),
  },
  {
    slug: 'last-comment-activity',
    label: __('Last activity', 'alpaca-issue-tracker'),
  },
  {
    slug: 'comment-count',
    label: __('Comment count', 'alpaca-issue-tracker'),
  },
  {
    slug: 'checklist-progress',
    label: __('Checklist progress', 'alpaca-issue-tracker'),
  },
  {
    slug: 'deadline',
    label: __('Deadline', 'alpaca-issue-tracker'),
  },
];

/**
 * Extract the term collection from the Alpaca REST response.
 *
 * @param {Object|Array} response REST response.
 * @return {Array} Status terms.
 */
function getStatusesFromResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

/**
 * Project Board block editor interface.
 *
 * @param {Object}   props               Block editor props.
 * @param {Object}   props.attributes    Current block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {JSX.Element} Block editor element.
 */
function ProjectBoardEdit({ attributes, setAttributes }) {
  const [statuses, setStatuses] = useState([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  const [statusError, setStatusError] = useState(false);
  const {
    accessMode,
    anonymousDetailMode,
    datapoints,
    showFilters,
    showSearch,
    statusIds,
  } = attributes;
  const selectedStatusIds = Array.isArray(statusIds)
    ? statusIds.map((statusId) => String(statusId))
    : [];
  const enabledDatapoints =
    datapoints && typeof datapoints === 'object' ? datapoints : {};

  useEffect(() => {
    let isMounted = true;

    wp.apiFetch({ path: '/alpaca/v1/statuses' })
      .then((response) => {
        if (isMounted) {
          setStatuses(getStatusesFromResponse(response));
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatusError(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingStatuses(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleStatus = (statusId, isSelected) => {
    const nextStatusIds = isSelected
      ? [...selectedStatusIds, statusId]
      : selectedStatusIds.filter((selectedId) => selectedId !== statusId);

    setAttributes({ statusIds: nextStatusIds });
  };

  const toggleDatapoint = (slug, isEnabled) => {
    setAttributes({
      datapoints: {
        ...enabledDatapoints,
        [slug]: isEnabled,
      },
    });
  };

  const blockProps = useBlockProps({
    className: 'alpaca-project-board-editor-preview',
  });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__('Access', 'alpaca-issue-tracker')} initialOpen>
          <SelectControl
            label={__('Board access', 'alpaca-issue-tracker')}
            value={accessMode}
            options={[
              {
                label: __('Logged-in users only', 'alpaca-issue-tracker'),
                value: 'login_required',
              },
              {
                label: __('Anonymous read-only', 'alpaca-issue-tracker'),
                value: 'anonymous_read_only',
              },
            ]}
            onChange={(value) => setAttributes({ accessMode: value })}
          />
          {accessMode === 'anonymous_read_only' && (
            <SelectControl
              label={__('Anonymous issue detail', 'alpaca-issue-tracker')}
              value={anonymousDetailMode}
              options={[
                {
                  label: __('Cards only', 'alpaca-issue-tracker'),
                  value: 'cards_only',
                },
                {
                  label: __('Public issue detail', 'alpaca-issue-tracker'),
                  value: 'issue_detail',
                },
              ]}
              onChange={(value) =>
                setAttributes({ anonymousDetailMode: value })
              }
            />
          )}
        </PanelBody>
        <PanelBody
          title={__('Columns', 'alpaca-issue-tracker')}
          initialOpen={false}
        >
          {isLoadingStatuses && <Spinner />}
          {statusError && (
            <Notice status="warning" isDismissible={false}>
              {__('Unable to load Alpaca statuses.', 'alpaca-issue-tracker')}
            </Notice>
          )}
          {!isLoadingStatuses && !statusError && (
            <>
              <p>
                {__(
                  'Leave all statuses unselected to show every column.',
                  'alpaca-issue-tracker',
                )}
              </p>
              {statuses.map((status) => {
                const statusId = String(status.term_id);

                return (
                  <CheckboxControl
                    key={statusId}
                    label={status.name}
                    checked={selectedStatusIds.includes(statusId)}
                    onChange={(isSelected) =>
                      toggleStatus(statusId, isSelected)
                    }
                  />
                );
              })}
            </>
          )}
        </PanelBody>
        <PanelBody
          title={__('Display', 'alpaca-issue-tracker')}
          initialOpen={false}
        >
          <ToggleControl
            label={__('Show filters', 'alpaca-issue-tracker')}
            checked={showFilters}
            onChange={(value) => setAttributes({ showFilters: value })}
          />
          <ToggleControl
            label={__('Show search', 'alpaca-issue-tracker')}
            checked={showSearch}
            onChange={(value) => setAttributes({ showSearch: value })}
          />
          {DATAPOINTS.map(({ label, slug }) => (
            <ToggleControl
              key={slug}
              label={label}
              checked={enabledDatapoints[slug] !== false}
              onChange={(value) => toggleDatapoint(slug, value)}
            />
          ))}
        </PanelBody>
      </InspectorControls>
      <div {...blockProps}>
        <strong>{__('Alpaca Project Board', 'alpaca-issue-tracker')}</strong>
        <p>
          {accessMode === 'anonymous_read_only'
            ? __('Anonymous read-only board.', 'alpaca-issue-tracker')
            : __(
                'Protected board for authorized users.',
                'alpaca-issue-tracker',
              )}
        </p>
      </div>
    </>
  );
}

registerBlockType('alpaca/project-board', {
  edit: ProjectBoardEdit,
  save: () => null,
});

ProjectBoardEdit.propTypes = {
  attributes: PropTypes.shape({
    accessMode: PropTypes.string,
    anonymousDetailMode: PropTypes.string,
    datapoints: PropTypes.object,
    showFilters: PropTypes.bool,
    showSearch: PropTypes.bool,
    statusIds: PropTypes.array,
  }).isRequired,
  setAttributes: PropTypes.func.isRequired,
};
