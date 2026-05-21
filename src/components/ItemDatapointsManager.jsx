const { useState, useEffect, useCallback, useRef } = wp.element;
const { __ } = wp.i18n;
const { ToggleControl, Spinner, Notice } = wp.components;
import {
  SettingsList,
  SettingsListBody,
  SettingsListRow,
  SettingsListNameCell,
  SettingsListActionsCell,
} from './settings/SettingsList';
import {
  getRegisteredItemDatapoints,
  getItemDatapointVisibility,
  fetchItemDatapointVisibility,
  saveItemDatapointVisibility,
} from '../utils/itemDatapoints';

const ACTION_NAMESPACE = 'alpaca/settings/itemDatapointsManager';

/**
 * Item datapoints manager settings section.
 *
 * @return {JSX.Element} Item datapoints manager.
 */
const ItemDatapointsManager = () => {
  const [datapoints, setDatapoints] = useState(getRegisteredItemDatapoints());
  const [visibility, setVisibility] = useState(getItemDatapointVisibility());
  const [isFetching, setIsFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const isSavingRef = useRef(false);

  useEffect(() => {
    const handleRegistryChanged = (nextDatapoints) => {
      if (Array.isArray(nextDatapoints)) {
        setDatapoints(nextDatapoints);
        return;
      }

      setDatapoints(getRegisteredItemDatapoints());
    };

    const handleVisibilityChanged = (nextVisibility) => {
      if (!nextVisibility || typeof nextVisibility !== 'object') {
        setVisibility({});
        return;
      }

      setVisibility({ ...nextVisibility });
    };

    wp.hooks.addAction(
      'alpaca.item.datapoints.registryChanged',
      ACTION_NAMESPACE,
      handleRegistryChanged,
    );
    wp.hooks.addAction(
      'alpaca.item.datapoints.visibilityChanged',
      ACTION_NAMESPACE,
      handleVisibilityChanged,
    );

    fetchItemDatapointVisibility().finally(() => {
      setIsFetching(false);
    });

    return () => {
      wp.hooks.removeAction(
        'alpaca.item.datapoints.registryChanged',
        ACTION_NAMESPACE,
      );
      wp.hooks.removeAction(
        'alpaca.item.datapoints.visibilityChanged',
        ACTION_NAMESPACE,
      );
    };
  }, []);

  /**
   * Determine whether a datapoint toggle is enabled.
   *
   * @param {Object} datapoint Datapoint entry.
   * @return {boolean} Toggle checked state.
   */
  const isDatapointChecked = useCallback(
    (datapoint) => {
      if (Object.prototype.hasOwnProperty.call(visibility, datapoint.slug)) {
        return Boolean(visibility[datapoint.slug]);
      }

      return datapoint.defaultEnabled !== false;
    },
    [visibility],
  );

  /**
   * Save a datapoint visibility toggle.
   *
   * @param {Object}  datapoint Datapoint entry.
   * @param {boolean} value     Toggle value.
   * @return {void}
   */
  const handleToggle = useCallback(
    (datapoint, value) => {
      if (isSavingRef.current) {
        return;
      }

      const nextVisibility = {
        ...visibility,
        [datapoint.slug]: value,
      };

      setErrorMessage('');
      isSavingRef.current = true;

      saveItemDatapointVisibility(nextVisibility)
        .catch(() => {
          setErrorMessage(
            __(
              'Failed to save datapoint visibility settings.',
              'alpaca-issue-tracker',
            ),
          );
        })
        .finally(() => {
          isSavingRef.current = false;
        });
    },
    [visibility],
  );

  return (
    <div className="alpaca-item-datapoints-manager">
      <h2 className="screen-reader-text">
        {__('Item Datapoints', 'alpaca-issue-tracker')}
      </h2>

      <p className="alpaca-settings-manager-intro">
        {__(
          'Choose which datapoints appear on issue cards.',
          'alpaca-issue-tracker',
        )}
      </p>

      {errorMessage && (
        <Notice
          status="error"
          isDismissible
          onRemove={() => setErrorMessage('')}
        >
          {errorMessage}
        </Notice>
      )}

      {isFetching && <Spinner />}

      {!isFetching && datapoints.length < 1 && (
        <p>
          {__(
            'No item datapoints are currently registered.',
            'alpaca-issue-tracker',
          )}
        </p>
      )}

      {!isFetching && datapoints.length > 0 && (
        <SettingsList className="alpaca-item-datapoints-list">
          <SettingsListBody>
            {datapoints.map((datapoint) => {
              return (
                <SettingsListRow key={datapoint.slug}>
                  <SettingsListNameCell>
                    <span className="alpaca-item-datapoints-name">
                      {datapoint.label}
                    </span>
                  </SettingsListNameCell>
                  <SettingsListActionsCell className="alpaca-item-datapoints-toggle-cell">
                    <ToggleControl
                      __nextHasNoMarginBottom
                      checked={isDatapointChecked(datapoint)}
                      onChange={(value) => handleToggle(datapoint, value)}
                    />
                  </SettingsListActionsCell>
                </SettingsListRow>
              );
            })}
          </SettingsListBody>
        </SettingsList>
      )}
    </div>
  );
};

export default ItemDatapointsManager;
