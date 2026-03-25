const { useState, useEffect, useCallback, useMemo } = wp.element;
const { __ } = wp.i18n;
const { Button, Spinner, TextControl, Dropdown, Notice } = wp.components;
const ColorPalette = wp.components.ColorPalette || wp.blockEditor?.ColorPalette;
const ColorIndicator = wp.components.ColorIndicator;
import {
  SettingsList,
  SettingsListBody,
  SettingsListRow,
  SettingsListNameCell,
  SettingsListActionsCell,
} from './settings/SettingsList';

const DEFAULT_LABEL_COLOR = '#172b4d';
const INITIAL_LABEL_SLOT_COUNT = 6;
const LABEL_COLOR_OPTIONS = [
  '#940d0d',
  '#94550d',
  '#947d0d',
  '#879a0d',
  '#649a0d',
  '#0d9a5f',
  '#0d909a',
  '#134f94',
  '#3a0d9a',
  '#740d9a',
];

/**
 * Normalize a possible label color to a supported fallback.
 *
 * @param {string} color Candidate color value.
 * @return {string} Normalized color.
 */
const normalizeLabelColor = (color) => {
  if (typeof color !== 'string' || color.trim() === '') {
    return DEFAULT_LABEL_COLOR;
  }

  return color;
};

/**
 * Create an empty label row.
 *
 * @param {string} key Stable row key.
 * @return {Object} Empty label row state.
 */
const createEmptyLabelRow = (key = '') => {
  const normalizedKey =
    key || `new-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    term_id: null,
    name: '',
    color: DEFAULT_LABEL_COLOR,
    key: normalizedKey,
  };
};

/**
 * Labels manager component.
 *
 * @return {JSX.Element} Labels manager section.
 */
const LabelsManager = () => {
  const [labels, setLabels] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [savingKeys, setSavingKeys] = useState([]);
  const [saveError, setSaveError] = useState('');
  const isSaving = savingKeys.length > 0;

  const fetchLabels = useCallback(() => {
    setIsFetching(true);
    setSaveError('');
    wp.apiFetch({ path: '/alpaca/v1/labels' })
      .then((response) => {
        if (Array.isArray(response)) {
          setLabels(
            response.map((label) => ({
              ...label,
              color: normalizeLabelColor(label.color),
              key: `term-${label.term_id}`,
            })),
          );
        } else {
          setLabels([]);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch labels.', error);
        setSaveError(__('Failed to load labels.', 'alpaca'));
      })
      .finally(() => setIsFetching(false));
  }, []);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  const slotLabels = useMemo(() => {
    return Array.from(
      { length: INITIAL_LABEL_SLOT_COUNT },
      (_unused, index) => {
        const existingRow = labels[index];
        if (existingRow) {
          return existingRow;
        }

        return createEmptyLabelRow(`slot-${index}`);
      },
    );
  }, [labels]);

  const extraLabels = useMemo(() => {
    return labels.slice(INITIAL_LABEL_SLOT_COUNT);
  }, [labels]);

  const updateLabelRow = useCallback((key, field, value) => {
    setLabels((previousLabels) =>
      previousLabels.map((label) => {
        if (label.key !== key) {
          return label;
        }

        return {
          ...label,
          [field]: field === 'color' ? normalizeLabelColor(value) : value,
        };
      }),
    );
  }, []);

  const updateSlotRow = useCallback((slotIndex, field, value) => {
    setLabels((previousLabels) => {
      const nextLabels = [...previousLabels];
      for (let index = 0; index <= slotIndex; index += 1) {
        if (!nextLabels[index]) {
          nextLabels[index] = createEmptyLabelRow(`slot-${index}`);
        }
      }

      const currentRow = nextLabels[slotIndex];

      if (!currentRow) {
        return nextLabels;
      }

      nextLabels[slotIndex] = {
        ...currentRow,
        [field]: field === 'color' ? normalizeLabelColor(value) : value,
      };

      return nextLabels;
    });
  }, []);

  const addNewLabel = useCallback(() => {
    setLabels((previousLabels) => [...previousLabels, createEmptyLabelRow()]);
  }, []);

  /**
   * Delete a label term with endpoint fallback for environments
   * where one route may be unavailable.
   *
   * @param {number|string} termId Label term ID.
   * @return {Promise<void>} Resolves when delete succeeds.
   */
  const deleteLabelTerm = useCallback(async (termId) => {
    const id = Number(termId);

    if (!Number.isInteger(id) || id < 1) {
      return;
    }

    try {
      await wp.apiFetch({
        path: `/alpaca/v1/label/${id}`,
        method: 'DELETE',
      });
      return;
    } catch (error) {
      // If the label is already gone, treat as success.
      if (error?.data?.status === 404 && error?.code !== 'rest_no_route') {
        return;
      }
    }

    try {
      await wp.apiFetch({
        path: `/wp/v2/alpaca_label/${id}?force=true`,
        method: 'DELETE',
      });
    } catch (error) {
      if (error?.data?.status === 404) {
        return;
      }
      throw error;
    }
  }, []);

  const saveLabelDraft = useCallback(
    async (labelDraft) => {
      const key = labelDraft.key;
      if (!key || savingKeys.includes(key)) {
        return;
      }

      const trimmedName = labelDraft.name.trim();

      if (trimmedName === '' && !labelDraft.term_id) {
        return;
      }

      setSaveError('');
      setSavingKeys((previousKeys) => [...previousKeys, key]);

      try {
        if (trimmedName === '' && labelDraft.term_id) {
          await deleteLabelTerm(labelDraft.term_id);
          setLabels((previousLabels) => {
            const labelIndex = previousLabels.findIndex(
              (label) => label.key === key,
            );

            if (labelIndex < 0) {
              return previousLabels;
            }

            const nextLabels = [...previousLabels];
            if (labelIndex < INITIAL_LABEL_SLOT_COUNT) {
              nextLabels[labelIndex] = createEmptyLabelRow(
                `slot-${labelIndex}`,
              );
            } else {
              nextLabels.splice(labelIndex, 1);
            }

            return nextLabels;
          });
          return;
        }

        if (labelDraft.term_id) {
          await wp.apiFetch({
            path: `/alpaca/v1/label/${labelDraft.term_id}`,
            method: 'POST',
            data: {
              name: trimmedName,
              color: normalizeLabelColor(labelDraft.color),
            },
          });
          return;
        }

        const response = await wp.apiFetch({
          path: '/alpaca/v1/labels',
          method: 'POST',
          data: {
            name: trimmedName,
            color: normalizeLabelColor(labelDraft.color),
          },
        });

        if (response?.label?.term_id) {
          setLabels((previousLabels) =>
            previousLabels.map((label) => {
              if (label.key !== key) {
                return label;
              }

              return {
                ...label,
                term_id: response.label.term_id,
                name: response.label.name || trimmedName,
                color:
                  response.label.color || normalizeLabelColor(labelDraft.color),
              };
            }),
          );
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to save label.', error);
        setSaveError(__('Failed to save label.', 'alpaca'));
      } finally {
        setSavingKeys((previousKeys) =>
          previousKeys.filter((existingKey) => existingKey !== key),
        );
      }
    },
    [deleteLabelTerm, savingKeys],
  );

  const removeLabelRow = useCallback(
    async (labelDraft, slotIndex = null) => {
      if (!labelDraft) {
        return;
      }

      const key = labelDraft.key;
      if (!key || savingKeys.includes(key)) {
        return;
      }

      setSaveError('');
      setSavingKeys((previousKeys) => [...previousKeys, key]);

      try {
        if (labelDraft.term_id) {
          await deleteLabelTerm(labelDraft.term_id);
        }

        setLabels((previousLabels) => {
          const nextLabels = [...previousLabels];

          if (slotIndex !== null) {
            if (nextLabels[slotIndex]) {
              nextLabels[slotIndex] = createEmptyLabelRow(`slot-${slotIndex}`);
            }
            return nextLabels;
          }

          return nextLabels.filter((label) => label.key !== key);
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to delete label.', error);
        setSaveError(__('Failed to delete label.', 'alpaca'));
      } finally {
        setSavingKeys((previousKeys) =>
          previousKeys.filter((existingKey) => existingKey !== key),
        );
      }
    },
    [deleteLabelTerm, savingKeys],
  );

  const palette = useMemo(() => {
    return LABEL_COLOR_OPTIONS.map((color) => ({
      color,
      name: color,
    }));
  }, []);

  const renderColorControl = (label, onColorChange) => {
    const currentColor = normalizeLabelColor(label.color);

    return (
      <Dropdown
        className="alpaca-label-color-picker"
        renderToggle={({ onToggle }) => (
          <Button
            variant="secondary"
            className="alpaca-label-color-button"
            onClick={onToggle}
          >
            {ColorIndicator ? (
              <ColorIndicator colorValue={currentColor} />
            ) : (
              <span
                className="alpaca-label-color-fallback"
                style={{ backgroundColor: currentColor }}
              />
            )}
            <span>{__('Color')}</span>
          </Button>
        )}
        renderContent={() => (
          <div className="alpaca-label-color-popover">
            {ColorPalette ? (
              <ColorPalette
                colors={palette}
                value={currentColor}
                disableCustomColors={true}
                onChange={(value) =>
                  onColorChange(
                    normalizeLabelColor(value || DEFAULT_LABEL_COLOR),
                  )
                }
              />
            ) : (
              <p>{__('Color picker unavailable.', 'alpaca')}</p>
            )}
          </div>
        )}
      />
    );
  };

  return (
    <div className="alpaca-labels-manager">
      <h2 className="screen-reader-text">{__('Labels', 'alpaca')}</h2>
      <p className="alpaca-settings-manager-intro">
        {__(
          'Create and maintain labels to categorize and filter your issues.',
          'alpaca',
        )}
      </p>

      {saveError && (
        <Notice status="error" isDismissible={false}>
          {saveError}
        </Notice>
      )}

      <SettingsList className="alpaca-labels-list">
        <SettingsListBody>
          {slotLabels.map((label, index) => (
            <SettingsListRow key={label.key}>
              <SettingsListNameCell>
                <TextControl
                  className="alpaca-label-name-input"
                  label={
                    index < INITIAL_LABEL_SLOT_COUNT ? '' : __('Name', 'alpaca')
                  }
                  hideLabelFromVision={index < INITIAL_LABEL_SLOT_COUNT}
                  value={label.name}
                  placeholder={__('Label name', 'alpaca')}
                  onChange={(value) => updateSlotRow(index, 'name', value)}
                  onBlur={() => saveLabelDraft(label)}
                  disabled={isFetching || isSaving}
                />
              </SettingsListNameCell>
              <SettingsListActionsCell className="alpaca-label-color-cell">
                {renderColorControl(label, (value) => {
                  updateSlotRow(index, 'color', value);
                  saveLabelDraft({
                    ...label,
                    color: value,
                  });
                })}
              </SettingsListActionsCell>
              <SettingsListActionsCell className="alpaca-label-delete-cell">
                {label.term_id ? (
                  <Button
                    icon="trash"
                    className="alpaca-settings-table-delete"
                    label={__('Delete label', 'alpaca')}
                    showTooltip
                    isDestructive
                    onClick={() => removeLabelRow(label, index)}
                    disabled={isFetching || isSaving}
                  />
                ) : (
                  <span
                    className="alpaca-label-delete-slot"
                    aria-hidden="true"
                  />
                )}
              </SettingsListActionsCell>
            </SettingsListRow>
          ))}

          {extraLabels.map((label) => (
            <SettingsListRow key={label.key}>
              <SettingsListNameCell>
                <TextControl
                  className="alpaca-label-name-input"
                  label=""
                  value={label.name}
                  placeholder={__('Label name', 'alpaca')}
                  onChange={(value) => updateLabelRow(label.key, 'name', value)}
                  onBlur={() => saveLabelDraft(label)}
                  disabled={isFetching || isSaving}
                />
              </SettingsListNameCell>
              <SettingsListActionsCell className="alpaca-label-color-cell">
                {renderColorControl(label, (value) => {
                  updateLabelRow(label.key, 'color', value);
                  saveLabelDraft({
                    ...label,
                    color: value,
                  });
                })}
              </SettingsListActionsCell>
              <SettingsListActionsCell className="alpaca-label-delete-cell">
                <Button
                  icon="trash"
                  className="alpaca-settings-table-delete"
                  label={__('Delete label', 'alpaca')}
                  showTooltip
                  isDestructive
                  onClick={() => removeLabelRow(label)}
                  disabled={isFetching || isSaving}
                />
              </SettingsListActionsCell>
            </SettingsListRow>
          ))}
        </SettingsListBody>
      </SettingsList>

      <div className="alpaca-labels-actions">
        <Button
          variant="primary"
          onClick={addNewLabel}
          disabled={isFetching || isSaving}
        >
          {__('New Label', 'alpaca')}
        </Button>

        {(isFetching || isSaving) && <Spinner />}
      </div>
    </div>
  );
};

export default LabelsManager;
