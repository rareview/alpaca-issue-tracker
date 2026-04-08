import StatusManager from './components/StatusManager';
import EnableTestLogsControl from './components/EnableTestLogsControl';
import LabelsManager from './components/LabelsManager';
import RestoreManager from './components/RestoreManager';
import ItemDatapointsManager from './components/ItemDatapointsManager';
const { useState, useEffect, useCallback, useMemo } = wp.element;
const { __ } = wp.i18n;
const { applyFilters } = wp.hooks;
const { TabPanel } = wp.components;

const SETTINGS_TABS_FILTER = 'alpaca.settings.tabs';
const SETTINGS_TAB_CONTENT_FILTER = 'alpaca.settings.tabContent';

/*
 * Third-party tab extension example:
 * wp.hooks.addFilter(
 *   'alpaca.settings.tabs',
 *   'my-plugin/settings-tab',
 *   (tabs) => [
 *     ...tabs,
 *     {
 *       name: 'my-plugin',
 *       title: __('My Plugin', 'my-plugin'),
 *       className: 'alpaca-settings-tab--my-plugin',
 *     },
 *   ],
 * );
 *
 * Then return that tab's panel content from:
 * wp.hooks.addFilter(
 *   'alpaca.settings.tabContent',
 *   'my-plugin/settings-tab-content',
 *   (content, tab, context) => {
 *     if ('my-plugin' !== tab.name) {
 *       return content;
 *     }
 *
 *     return <MyPluginSettings statuses={context.statuses} />;
 *   },
 * );
 */

const SETTINGS_BASE_TABS = [
  {
    name: 'statuses',
    title: __('Statuses', 'alpaca'),
    className: 'alpaca-settings-tab--statuses',
  },
  {
    name: 'item-datapoints',
    title: __('Cards', 'alpaca'),
    className: 'alpaca-settings-tab--item-datapoints',
  },
  {
    name: 'labels',
    title: __('Labels', 'alpaca'),
    className: 'alpaca-settings-tab--labels',
  },
  {
    name: 'deleted-items',
    title: __('Deleted Items', 'alpaca'),
    className: 'alpaca-settings-tab--deleted-items',
  },
];

const SETTINGS_TAB = {
  name: 'settings',
  title: __('Settings', 'alpaca'),
  className: 'alpaca-settings-tab--settings',
};

/**
 * Build settings tabs including third-party custom tabs.
 *
 * @param {Object} context Filter context.
 * @return {Array<Object>} Tab definitions.
 */
const getSettingsTabs = (context) => {
  const builtInTabs = [...SETTINGS_BASE_TABS, SETTINGS_TAB];
  const filteredTabs =
    'function' === typeof applyFilters
      ? applyFilters(SETTINGS_TABS_FILTER, builtInTabs, context)
      : builtInTabs;
  const normalizedTabs = Array.isArray(filteredTabs)
    ? filteredTabs.filter(
        (tab) =>
          tab &&
          'object' === typeof tab &&
          'string' === typeof tab.name &&
          '' !== tab.name,
      )
    : builtInTabs;

  return normalizedTabs;
};

const renderSettingsTab = (currentStatuses) => {
  return (
    <div className="alpaca-settings-tab-content">
      <table className="form-table">
        <tbody>
          {/*
           * Action hook for adding additional settings.
           * @param {Object} context - Contains statuses array.
           */}
          {wp.hooks.applyFilters('alpaca.settings.additionalRows', null, {
            statuses: currentStatuses,
          })}
          <EnableTestLogsControl />
        </tbody>
      </table>

      {/* Extensibility hook for adding custom settings sections. */}
      {wp.hooks.applyFilters('alpaca.settings.afterTable', null, {
        statuses: currentStatuses,
      })}
    </div>
  );
};

const renderStatusesTab = (
  statuses,
  fetchStatuses,
  isLoading,
  error,
  handleStatusesOrderChange,
) => {
  return (
    <div className="alpaca-settings-tab-content">
      <StatusManager
        statuses={statuses}
        fetchStatuses={fetchStatuses}
        isLoading={isLoading}
        error={error}
        onStatusesChange={handleStatusesOrderChange}
      />
    </div>
  );
};

const renderLabelsTab = () => {
  return (
    <div className="alpaca-settings-tab-content">
      <LabelsManager />
    </div>
  );
};

const renderItemDatapointsTab = () => {
  return (
    <div className="alpaca-settings-tab-content">
      <ItemDatapointsManager />
    </div>
  );
};

const renderCustomSettingsTabContent = (tab, context) => {
  if ('function' !== typeof applyFilters) {
    return null;
  }

  return applyFilters(SETTINGS_TAB_CONTENT_FILTER, null, tab, context);
};

const AlpacaSettings = () => {
  const [statuses, setStatuses] = useState([]);
  const [currentStatuses, setCurrentStatuses] = useState([]); // Track current order
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatuses = useCallback((options = {}) => {
    const { silent = false } = options;

    if (!silent) {
      setIsLoading(true);
    }

    wp.apiFetch({ path: '/alpaca/v1/statuses' })
      .then((data) => {
        setStatuses(data);
        setCurrentStatuses(data); // Initialize current order

        if (!silent) {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setError(err.message);

        if (!silent) {
          setIsLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Handle when StatusManager reorders items
  const handleStatusesOrderChange = useCallback((newOrder) => {
    setCurrentStatuses(newOrder);
  }, []);

  const settingsTabs = useMemo(
    () => getSettingsTabs({ statuses: currentStatuses }),
    [currentStatuses],
  );

  return (
    <div className="alpaca-settings-wrap">
      <TabPanel
        className="alpaca-notifications-tabs alpaca-settings-tabs"
        activeClass="is-active"
        tabs={settingsTabs}
      >
        {(tab) => {
          const tabContext = {
            statuses: currentStatuses,
          };

          if ('statuses' === tab.name) {
            return renderStatusesTab(
              statuses,
              fetchStatuses,
              isLoading,
              error,
              handleStatusesOrderChange,
            );
          }

          if ('labels' === tab.name) {
            return renderLabelsTab();
          }

          if ('deleted-items' === tab.name) {
            return (
              <div className="alpaca-settings-tab-content">
                <RestoreManager />
              </div>
            );
          }

          if ('item-datapoints' === tab.name) {
            return renderItemDatapointsTab();
          }

          if ('settings' === tab.name) {
            return renderSettingsTab(currentStatuses);
          }

          const customContent = renderCustomSettingsTabContent(tab, tabContext);
          if (customContent) {
            return (
              <div className="alpaca-settings-tab-content">{customContent}</div>
            );
          }

          return null;
        }}
      </TabPanel>
    </div>
  );
};

export default AlpacaSettings;
