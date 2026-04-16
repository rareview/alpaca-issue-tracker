import PropTypes from 'prop-types';

const { __ } = wp.i18n;
const { memo, useCallback, useEffect, useMemo, useRef } = wp.element;
const { FormTokenField } = wp.components;

/**
 * Normalize a token string for case-insensitive comparisons.
 *
 * @param {string} token Raw token value.
 * @return {string} Normalized token value.
 */
const normalizeToken = (token) =>
  String(token || '')
    .trim()
    .toLowerCase();

/**
 * Get the string value for a token entry.
 *
 * @param {string|Object} token Token value from FormTokenField.
 * @return {string} String token value.
 */
const getTokenValue = (token) => {
  if (typeof token === 'string') {
    return token;
  }

  return token && token.value ? token.value : '';
};

/**
 * Label selector for issue modal.
 *
 * @param {Object}   root0             Component props.
 * @param {Array}    root0.labels      Available labels.
 * @param {Array}    root0.selectedIds Selected label term IDs.
 * @param {Function} root0.onChange    Called with updated selected IDs.
 * @param {boolean}  root0.isLoading   Whether selector is disabled.
 * @return {JSX.Element} Label selector dropdown.
 */
const LabelsSelector = memo(
  ({ labels, selectedIds, onChange, isLoading }) => {
    const selectorRef = useRef(null);

    const labelsByName = useMemo(() => {
      const map = new Map();

      labels.forEach((label) => {
        map.set(normalizeToken(label.name), label);
      });

      return map;
    }, [labels]);

    const labelNameById = useMemo(() => {
      const map = new Map();

      labels.forEach((label) => {
        map.set(Number(label.term_id), label.name);
      });

      return map;
    }, [labels]);

    const selectedTokens = useMemo(
      () =>
        selectedIds
          .map((id) => labelNameById.get(Number(id)))
          .filter((name) => Boolean(name)),
      [labelNameById, selectedIds],
    );

    const suggestions = useMemo(
      () => labels.map((label) => label.name),
      [labels],
    );

    const handleChange = useCallback(
      (tokens) => {
        const nextIds = [];

        tokens
          .map(getTokenValue)
          .map((token) => String(token || '').trim())
          .filter((token) => token.length > 0)
          .forEach((token) => {
            const label = labelsByName.get(normalizeToken(token));

            if (!label) {
              return;
            }

            const labelId = Number(label.term_id);

            if (!nextIds.includes(labelId)) {
              nextIds.push(labelId);
            }
          });

        onChange(nextIds);
      },
      [labelsByName, onChange],
    );

    const renderSuggestionItem = useCallback(
      ({ item }) => {
        const label = labelsByName.get(normalizeToken(item));

        return (
          <span className="alpaca-labels-token-suggestion">
            <span
              className="alpaca-item-label alpaca-label-pill"
              style={{
                backgroundColor: (label && label.color) || '#172b4d',
                color: '#fff',
              }}
            >
              {(label && label.name) || item}
            </span>
          </span>
        );
      },
      [labelsByName],
    );

    const validateToken = useCallback(
      (token) => labelsByName.has(normalizeToken(token)),
      [labelsByName],
    );

    useEffect(() => {
      if (!selectorRef.current) {
        return;
      }

      const tokens = selectorRef.current.querySelectorAll(
        '.components-form-token-field__token',
      );

      tokens.forEach((tokenElement) => {
        const textElement = tokenElement.querySelector(
          '.components-form-token-field__token-text [aria-hidden="true"]',
        );

        if (!textElement) {
          return;
        }

        const tokenName = normalizeToken(textElement.textContent);
        const label = labelsByName.get(tokenName);
        const color = (label && label.color) || '#172b4d';

        tokenElement.style.setProperty('--alpaca-label-token-color', color);
      });
    }, [labelsByName, selectedTokens]);

    return (
      <div className="alpaca-labels-selector" ref={selectorRef}>
        <FormTokenField
          label=""
          placeholder={__('Edit labels', 'alpaca')}
          value={selectedTokens}
          suggestions={suggestions}
          onChange={handleChange}
          disabled={isLoading}
          __nextHasNoMarginBottom
          __next40pxDefaultSize
          __experimentalExpandOnFocus
          __experimentalRenderItem={renderSuggestionItem}
          __experimentalValidateInput={validateToken}
        />
      </div>
    );
  },
  (prev, next) =>
    prev.isLoading === next.isLoading &&
    prev.labels === next.labels &&
    prev.selectedIds.join(',') === next.selectedIds.join(','),
);

LabelsSelector.propTypes = {
  labels: PropTypes.arrayOf(
    PropTypes.shape({
      term_id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string,
    }),
  ),
  selectedIds: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func,
  isLoading: PropTypes.bool,
};

LabelsSelector.defaultProps = {
  labels: [],
  selectedIds: [],
  onChange: () => {},
  isLoading: false,
};

export default LabelsSelector;
