import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '../services/notificationApi';
import { fetchLabels } from '../services/issueApi';

const { useCallback, useEffect, useMemo, useState } = wp.element;
const { __, sprintf } = wp.i18n;
const { addFilter, applyFilters } = wp.hooks;
const {
  Button,
  CheckboxControl,
  Notice,
  Spinner,
  TabPanel,
  TextControl,
  ToggleControl,
} = wp.components;

const CHANNELS_KEY = 'channels';
const CHANNEL_STATUS_KEY = 'channel_status';
const AVAILABLE_CHANNELS_KEY = 'available_channels';
const DIGESTS_KEY = 'digests';
const DAILY_DIGEST_KEY = 'daily';
const SEND_TIME_KEY = 'send_time';
const LABEL_IDS_KEY = 'label_ids';
const ADDRESS_OVERRIDE_KEY = 'address_override';
const SITE_TIMEZONE_LABEL_KEY = 'site_timezone_label';
const TERM_ID_KEY = 'term_id';
const PREFERENCES_TAB_NAME = 'preferences';
const EMAIL_CHANNEL_KEY = 'email';
const EMAIL_TAB_NAME = `channel-${EMAIL_CHANNEL_KEY}`;
const NOTIFICATION_TABS_FILTER = 'alpaca.notificationPreferences.tabs';
const NOTIFICATION_TAB_CONTENT_FILTER =
  'alpaca.notificationPreferences.tabContent';

let hasRegisteredNotificationPreferenceFilters = false;

const subjectOptions = [
  {
    key: 'created',
    label: __('Issues I created', 'alpaca'),
    help: __('Receive updates about issues you created.', 'alpaca'),
  },
  {
    key: 'assigned',
    label: __('Issues assigned to me', 'alpaca'),
    help: __(
      'Receive updates when you are assigned or when assigned issues change.',
      'alpaca',
    ),
  },
  {
    key: 'starred',
    label: __('Issues I starred', 'alpaca'),
    help: __(
      'Use the existing star/watch feature to follow issue activity.',
      'alpaca',
    ),
  },
  {
    key: 'mentioned',
    label: __('Comments that mention me', 'alpaca'),
    help: __(
      'Receive updates when another user mentions you with @username.',
      'alpaca',
    ),
  },
  {
    key: 'labeled',
    label: __('Issues with these labels', 'alpaca'),
    help: __(
      'Receive updates about activity on issues with selected labels.',
      'alpaca',
    ),
  },
  {
    key: 'high_priority',
    label: __('Issues currently marked high priority', 'alpaca'),
    help: __(
      'Receive updates about activity on issues that are currently marked High Priority.',
      'alpaca',
    ),
  },
  {
    key: 'all_new_tasks',
    label: __('Whenever a new issue is created', 'alpaca'),
    help: __(
      'Includes both new top-level issues and new checklist items, even when they are not otherwise related to you.',
      'alpaca',
    ),
  },
];

const eventOptions = [
  {
    key: 'human_comments',
    label: __('Human comments', 'alpaca'),
  },
  {
    key: 'status_changes',
    label: __('Status changes', 'alpaca'),
  },
  {
    key: 'issue_assignment_changes',
    label: __('Issue assignment changes', 'alpaca'),
  },
  {
    key: 'due_date_changes',
    label: __('Due date changes', 'alpaca'),
  },
  {
    key: 'checklist_created_deleted',
    label: __('Checklist create/delete', 'alpaca'),
  },
  {
    key: 'checklist_assignment_changes',
    label: __('Checklist assignment changes', 'alpaca'),
  },
  {
    key: 'checklist_completion_changes',
    label: __('Checklist completion changes', 'alpaca'),
  },
  {
    key: 'checklist_promotions',
    label: __('Checklist promotions', 'alpaca'),
  },
  {
    key: 'priority_changes',
    label: __('High-priority changes', 'alpaca'),
  },
];

/**
 * Determine whether a string looks like a valid email address.
 *
 * @param {string} email Email address.
 * @return {boolean} True when the email looks valid.
 */
const isValidEmail = (email) => {
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  if (!trimmedEmail) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
};

/**
 * Get the fallback display value for a channel summary field.
 *
 * @return {string} Fallback display value.
 */
const getChannelSummaryFallback = () => __('Not configured.', 'alpaca');

/**
 * Get the displayed value for the email delivery field.
 *
 * @param {Object|null} nextPreferences   Notification preferences payload.
 * @param {Object}      nextChannelStatus Channel status payload.
 * @return {string} Displayed email field value.
 */
const getEmailDeliveryFieldValue = (nextPreferences, nextChannelStatus) => {
  const channelPreferences =
    nextPreferences &&
    nextPreferences[CHANNELS_KEY] &&
    nextPreferences[CHANNELS_KEY].email
      ? nextPreferences[CHANNELS_KEY].email
      : {};
  const overrideValue =
    'string' === typeof channelPreferences[ADDRESS_OVERRIDE_KEY]
      ? channelPreferences[ADDRESS_OVERRIDE_KEY]
      : '';
  const profileAddress =
    nextChannelStatus &&
    nextChannelStatus.email &&
    'string' === typeof nextChannelStatus.email.profile_address
      ? nextChannelStatus.email.profile_address
      : '';

  if (overrideValue) {
    return overrideValue;
  }

  return profileAddress;
};

/**
 * Get the effective email destination from the current field value and profile status.
 *
 * @param {string} emailDeliveryValue Email field value.
 * @param {Object} nextChannelStatus  Email channel status payload.
 * @return {string} Effective email destination.
 */
const getEmailEffectiveDestination = (
  emailDeliveryValue,
  nextChannelStatus,
) => {
  const trimmedValue =
    'string' === typeof emailDeliveryValue ? emailDeliveryValue.trim() : '';
  const profileAddress =
    nextChannelStatus && 'string' === typeof nextChannelStatus.profile_address
      ? nextChannelStatus.profile_address.trim()
      : '';

  if (trimmedValue) {
    return trimmedValue;
  }

  return profileAddress;
};

/**
 * Build the tab list for notification settings.
 *
 * @param {Array<Object>} channels Configurable delivery channels.
 * @return {Array<Object>} Tab definitions.
 */
const getNotificationSettingsTabs = (channels) => {
  const tabs = [
    {
      name: PREFERENCES_TAB_NAME,
      title: __('Preferences', 'alpaca'),
      className: 'alpaca-notifications-tab--preferences',
    },
  ];

  channels.forEach((channel) => {
    if (EMAIL_CHANNEL_KEY === channel.key) {
      return;
    }

    tabs.push({
      name: `channel-${channel.key}`,
      title: channel.label,
      className: `alpaca-notifications-tab--${channel.key}`,
    });
  });

  if (typeof applyFilters === 'function') {
    return applyFilters(NOTIFICATION_TABS_FILTER, tabs, { channels });
  }

  return tabs;
};

/**
 * Extract a channel key from a tab name.
 *
 * @param {string} tabName Tab name.
 * @return {string} Channel key.
 */
const getChannelKeyFromTabName = (tabName) => {
  if ('string' !== typeof tabName || !tabName.startsWith('channel-')) {
    return '';
  }

  return tabName.replace('channel-', '');
};

/**
 * Get the toggle label for a notification channel.
 *
 * @param {string} channelLabel Notification channel label.
 * @return {string} Toggle label text.
 */
const getChannelToggleLabel = (channelLabel) =>
  sprintf(
    /* translators: %s: notification channel label. */
    __('Enable %s notifications', 'alpaca'),
    channelLabel,
  );

/**
 * Get the contextual save button label for a notification settings tab.
 *
 * @param {Object}  tab    Active tab object.
 * @param {boolean} isBusy Whether a save is in progress.
 * @return {string} Save button label.
 */
const getNotificationTabSaveLabel = (tab, isBusy) => {
  if (PREFERENCES_TAB_NAME === tab.name) {
    return isBusy
      ? __('Saving Preferences…', 'alpaca')
      : __('Save Preferences', 'alpaca');
  }

  if (isBusy) {
    return sprintf(
      /* translators: %s: active notification tab title. */
      __('Saving %s…', 'alpaca'),
      tab.title,
    );
  }

  return sprintf(
    /* translators: %s: active notification tab title. */
    __('Save %s', 'alpaca'),
    tab.title,
  );
};

/**
 * Render the email notification tab content.
 *
 * @param {Object} context Screen render context.
 * @param {Object} tab     Active tab object.
 * @return {JSX.Element|null} Email tab content.
 */
const renderNotificationEmailTab = (context, tab) => {
  if (!context.emailChannelDefinition) {
    return null;
  }

  return (
    <section className="alpaca-notifications-panel alpaca-notifications-panel--narrow alpaca-notifications-panel--email">
      <p className="alpaca-notifications-panel-intro">
        {__(
          'Choose whether you want instant email updates, a daily summary, or both.',
          'alpaca',
        )}
      </p>

      <div className="alpaca-notifications-email-layout">
        <TextControl
          label={__('Email address', 'alpaca')}
          type="email"
          value={context.emailDeliveryValue}
          onChange={context.setEmailDeliveryValue}
          disabled={context.isSaving}
          help={
            context.hasInvalidEmailOverride
              ? __(
                  'Enter a valid email address or leave this blank to use your WordPress profile email.',
                  'alpaca',
                )
              : __(
                  'Uses your WordPress profile email unless you enter a different address here.',
                  'alpaca',
                )
          }
        />

        <CheckboxControl
          label={__('Send instant email updates', 'alpaca')}
          checked={context.hasInstantEmailEnabled}
          onChange={(value) =>
            context.updateChannelValue(EMAIL_CHANNEL_KEY, 'enabled', value)
          }
          disabled={context.isSaving}
        />

        <div className="alpaca-notifications-email-digest-row">
          <div className="alpaca-notifications-email-digest-checkbox">
            <CheckboxControl
              label={__('Send a daily summary at', 'alpaca')}
              checked={context.hasEmailDigestEnabled}
              onChange={(value) =>
                context.updateDailyDigestChannelValue(EMAIL_CHANNEL_KEY, value)
              }
              disabled={context.isSaving}
            />
          </div>

          <div className="alpaca-notifications-email-time-wrap">
            <div className="alpaca-notifications-email-time">
              <TextControl
                label={__('Daily summary time', 'alpaca')}
                hideLabelFromVision
                type="time"
                value={context.dailyDigestPreferences[SEND_TIME_KEY] || '17:00'}
                onChange={(value) =>
                  context.updateDailyDigestValue(SEND_TIME_KEY, value)
                }
                disabled={context.isSaving}
              />
            </div>
          </div>
        </div>

        <div className="alpaca-notifications-email-digest-settings">
          <p className="alpaca-notifications-help">
            {sprintf(
              /* translators: %s: site timezone label. */
              __(
                "Summaries of activity matching your preferences will be generated for you at this time every day, based on the site's timezone (%s).",
                'alpaca',
              ),
              context.siteTimezoneLabel || __('Site timezone', 'alpaca'),
            )}
          </p>
        </div>

        {context.hasInvalidEmailDeliveryConfiguration && (
          <Notice status="warning" isDismissible={false}>
            {__(
              'Add a valid email address before enabling instant email updates or the daily summary.',
              'alpaca',
            )}
          </Notice>
        )}
      </div>
      {context.renderSaveActions(tab)}
    </section>
  );
};

/**
 * Register default notification preference tab filters.
 */
const registerNotificationPreferenceFilters = () => {
  if (
    hasRegisteredNotificationPreferenceFilters ||
    typeof addFilter !== 'function'
  ) {
    return;
  }

  hasRegisteredNotificationPreferenceFilters = true;

  addFilter(
    NOTIFICATION_TABS_FILTER,
    'alpaca/notification-preferences/email-tab',
    (tabs, context) => {
      const emailChannel = context.channels.find(
        (channel) => channel?.key === EMAIL_CHANNEL_KEY,
      );

      if (!emailChannel) {
        return tabs;
      }

      return [
        tabs[0],
        {
          name: EMAIL_TAB_NAME,
          title: emailChannel.label,
          className: 'alpaca-notifications-tab--email',
        },
        ...tabs.slice(1),
      ];
    },
  );

  addFilter(
    NOTIFICATION_TAB_CONTENT_FILTER,
    'alpaca/notification-preferences/email-tab',
    (content, tab, context) => {
      if (EMAIL_TAB_NAME !== tab.name) {
        return content;
      }

      return renderNotificationEmailTab(context, tab);
    },
  );
};

registerNotificationPreferenceFilters();

/**
 * Render the current user's notification preferences screen.
 *
 * @return {JSX.Element} Preference screen.
 */
const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [availableChannels, setAvailableChannels] = useState([]);
  const [channelStatus, setChannelStatus] = useState({});
  const [labels, setLabels] = useState([]);
  const [emailDeliveryValue, setEmailDeliveryValue] = useState('');
  const [siteTimezoneLabel, setSiteTimezoneLabel] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadPreferences = useCallback(() => {
    setIsLoading(true);
    setError('');

    Promise.allSettled([fetchNotificationPreferences(), fetchLabels()])
      .then((results) => {
        const preferenceResult = results[0];
        const labelsResult = results[1];

        if (preferenceResult.status !== 'fulfilled') {
          throw preferenceResult.reason;
        }

        const response = preferenceResult.value || {};
        const nextPreferences = response.preferences || null;
        const nextChannelStatus =
          response[CHANNEL_STATUS_KEY] &&
          'object' === typeof response[CHANNEL_STATUS_KEY]
            ? response[CHANNEL_STATUS_KEY]
            : {};

        setPreferences(nextPreferences);
        setAvailableChannels(
          Array.isArray(response[AVAILABLE_CHANNELS_KEY])
            ? response[AVAILABLE_CHANNELS_KEY]
            : [],
        );
        setChannelStatus(nextChannelStatus);
        setSiteTimezoneLabel(
          'string' === typeof response[SITE_TIMEZONE_LABEL_KEY]
            ? response[SITE_TIMEZONE_LABEL_KEY]
            : '',
        );
        setEmailDeliveryValue(
          getEmailDeliveryFieldValue(nextPreferences, nextChannelStatus),
        );

        if (
          labelsResult.status === 'fulfilled' &&
          Array.isArray(labelsResult.value)
        ) {
          setLabels(labelsResult.value);
        } else {
          setLabels([]);
          setError(
            __(
              'Could not load labels. Label notifications are unavailable until labels load.',
              'alpaca',
            ),
          );
        }
      })
      .catch((loadError) => {
        setError(
          loadError?.message ||
            __('Could not load notification preferences.', 'alpaca'),
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const configurableChannels = useMemo(
    () =>
      availableChannels.filter(
        (channel) =>
          channel &&
          channel.key &&
          channel.key !== 'inbox' &&
          channel.is_available,
      ),
    [availableChannels],
  );

  const notificationSettingsTabs = useMemo(
    () => getNotificationSettingsTabs(configurableChannels),
    [configurableChannels],
  );

  const emailChannelDefinition = useMemo(
    () =>
      configurableChannels.find(
        (channel) => channel && channel.key === EMAIL_CHANNEL_KEY,
      ) || null,
    [configurableChannels],
  );

  const emailChannelPreferences = useMemo(() => {
    if (!preferences || !preferences[CHANNELS_KEY]) {
      return {};
    }

    return preferences[CHANNELS_KEY][EMAIL_CHANNEL_KEY] || {};
  }, [preferences]);

  const emailChannelStatus = useMemo(
    () => channelStatus?.[EMAIL_CHANNEL_KEY] || {},
    [channelStatus],
  );

  const hasInvalidEmailOverride = useMemo(() => {
    const trimmedOverride =
      'string' === typeof emailDeliveryValue ? emailDeliveryValue.trim() : '';
    if (!trimmedOverride) {
      return false;
    }

    return !isValidEmail(trimmedOverride);
  }, [emailDeliveryValue]);

  const hasValidEmailDestination = useMemo(
    () =>
      isValidEmail(
        getEmailEffectiveDestination(emailDeliveryValue, emailChannelStatus),
      ),
    [emailChannelStatus, emailDeliveryValue],
  );

  const hasInstantEmailEnabled = useMemo(
    () => Boolean(emailChannelPreferences.enabled),
    [emailChannelPreferences],
  );

  const dailyDigestPreferences = useMemo(() => {
    if (!preferences || !preferences[DIGESTS_KEY]) {
      return {
        enabled: false,
        channels: {},
        [SEND_TIME_KEY]: '17:00',
      };
    }

    return (
      preferences[DIGESTS_KEY][DAILY_DIGEST_KEY] || {
        enabled: false,
        channels: {},
        [SEND_TIME_KEY]: '17:00',
      }
    );
  }, [preferences]);

  const hasEmailDigestEnabled = useMemo(
    () => Boolean(dailyDigestPreferences.channels?.[EMAIL_CHANNEL_KEY]),
    [dailyDigestPreferences],
  );

  const hasInvalidEmailDeliveryConfiguration = useMemo(
    () =>
      (hasInstantEmailEnabled || hasEmailDigestEnabled) &&
      (!hasValidEmailDestination || hasInvalidEmailOverride),
    [
      hasEmailDigestEnabled,
      hasInstantEmailEnabled,
      hasInvalidEmailOverride,
      hasValidEmailDestination,
    ],
  );

  const selectedLabelIds = useMemo(() => {
    if (!preferences || !Array.isArray(preferences[LABEL_IDS_KEY])) {
      return [];
    }

    return preferences[LABEL_IDS_KEY].map((value) => Number(value));
  }, [preferences]);

  const updateSectionValue = useCallback((section, key, value) => {
    setPreferences((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [section]: {
          ...current[section],
          [key]: value,
        },
      };
    });
  }, []);

  const updateChannelValue = useCallback((channelKey, fieldKey, value) => {
    setPreferences((current) => {
      if (!current) {
        return current;
      }

      const currentChannels =
        current[CHANNELS_KEY] && 'object' === typeof current[CHANNELS_KEY]
          ? current[CHANNELS_KEY]
          : {};
      const currentChannel =
        currentChannels[channelKey] &&
        'object' === typeof currentChannels[channelKey]
          ? currentChannels[channelKey]
          : {};

      return {
        ...current,
        [CHANNELS_KEY]: {
          ...currentChannels,
          [channelKey]: {
            ...currentChannel,
            [fieldKey]: value,
          },
        },
      };
    });
  }, []);

  const updateDailyDigestValue = useCallback((fieldKey, value) => {
    setPreferences((current) => {
      if (!current) {
        return current;
      }

      const currentDigests =
        current[DIGESTS_KEY] && 'object' === typeof current[DIGESTS_KEY]
          ? current[DIGESTS_KEY]
          : {};
      const currentDailyDigest =
        currentDigests[DAILY_DIGEST_KEY] &&
        'object' === typeof currentDigests[DAILY_DIGEST_KEY]
          ? currentDigests[DAILY_DIGEST_KEY]
          : {};

      return {
        ...current,
        [DIGESTS_KEY]: {
          ...currentDigests,
          [DAILY_DIGEST_KEY]: {
            ...currentDailyDigest,
            [fieldKey]: value,
          },
        },
      };
    });
  }, []);

  const updateDailyDigestChannelValue = useCallback((channelKey, value) => {
    setPreferences((current) => {
      if (!current) {
        return current;
      }

      const currentDigests =
        current[DIGESTS_KEY] && 'object' === typeof current[DIGESTS_KEY]
          ? current[DIGESTS_KEY]
          : {};
      const currentDailyDigest =
        currentDigests[DAILY_DIGEST_KEY] &&
        'object' === typeof currentDigests[DAILY_DIGEST_KEY]
          ? currentDigests[DAILY_DIGEST_KEY]
          : {};
      const currentChannels =
        currentDailyDigest.channels &&
        'object' === typeof currentDailyDigest.channels
          ? currentDailyDigest.channels
          : {};

      return {
        ...current,
        [DIGESTS_KEY]: {
          ...currentDigests,
          [DAILY_DIGEST_KEY]: {
            ...currentDailyDigest,
            channels: {
              ...currentChannels,
              [channelKey]: value,
            },
          },
        },
      };
    });
  }, []);

  const handleLabelToggle = useCallback((labelId, value) => {
    setPreferences((current) => {
      if (!current) {
        return current;
      }

      const currentLabelIds = Array.isArray(current[LABEL_IDS_KEY])
        ? current[LABEL_IDS_KEY].map((item) => Number(item))
        : [];
      let nextLabelIds = currentLabelIds;

      if (value) {
        nextLabelIds = [...currentLabelIds, Number(labelId)];
      } else {
        nextLabelIds = currentLabelIds.filter(
          (item) => item !== Number(labelId),
        );
      }

      return {
        ...current,
        [LABEL_IDS_KEY]: Array.from(new Set(nextLabelIds)),
      };
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!preferences) {
      return;
    }

    const nextChannels = {
      ...(preferences[CHANNELS_KEY] || {}),
      [EMAIL_CHANNEL_KEY]: {
        ...emailChannelPreferences,
      },
    };
    const nextDailyDigest = {
      ...dailyDigestPreferences,
      channels: {
        ...(dailyDigestPreferences.channels || {}),
      },
    };
    const nextPreferences = {
      ...preferences,
      [CHANNELS_KEY]: nextChannels,
      [DIGESTS_KEY]: {
        ...(preferences[DIGESTS_KEY] || {}),
        [DAILY_DIGEST_KEY]: nextDailyDigest,
      },
    };
    const trimmedEmailValue =
      'string' === typeof emailDeliveryValue ? emailDeliveryValue.trim() : '';
    const profileAddress =
      'string' === typeof emailChannelStatus.profile_address
        ? emailChannelStatus.profile_address.trim()
        : '';

    if (
      '' === trimmedEmailValue ||
      (profileAddress &&
        trimmedEmailValue.toLowerCase() === profileAddress.toLowerCase())
    ) {
      nextPreferences[CHANNELS_KEY][EMAIL_CHANNEL_KEY][ADDRESS_OVERRIDE_KEY] =
        '';
    } else {
      nextPreferences[CHANNELS_KEY][EMAIL_CHANNEL_KEY][ADDRESS_OVERRIDE_KEY] =
        trimmedEmailValue;
    }

    nextPreferences[CHANNELS_KEY][EMAIL_CHANNEL_KEY].enabled = Boolean(
      nextPreferences[CHANNELS_KEY][EMAIL_CHANNEL_KEY].enabled,
    );
    nextPreferences[DIGESTS_KEY][DAILY_DIGEST_KEY].enabled = Object.values(
      nextPreferences[DIGESTS_KEY][DAILY_DIGEST_KEY].channels,
    ).some(Boolean);

    setIsSaving(true);
    setError('');
    setNotice('');

    updateNotificationPreferences(nextPreferences)
      .then((response) => {
        const nextPreferencesResponse = response.preferences || null;
        const nextChannelStatus =
          response[CHANNEL_STATUS_KEY] &&
          'object' === typeof response[CHANNEL_STATUS_KEY]
            ? response[CHANNEL_STATUS_KEY]
            : {};

        setPreferences(nextPreferencesResponse);
        setAvailableChannels(
          Array.isArray(response[AVAILABLE_CHANNELS_KEY])
            ? response[AVAILABLE_CHANNELS_KEY]
            : [],
        );
        setChannelStatus(nextChannelStatus);
        setSiteTimezoneLabel(
          'string' === typeof response[SITE_TIMEZONE_LABEL_KEY]
            ? response[SITE_TIMEZONE_LABEL_KEY]
            : '',
        );
        setEmailDeliveryValue(
          getEmailDeliveryFieldValue(
            nextPreferencesResponse,
            nextChannelStatus,
          ),
        );
        setNotice(__('Notification preferences saved.', 'alpaca'));
      })
      .catch((saveError) => {
        setError(
          saveError?.message ||
            __('Could not save notification preferences.', 'alpaca'),
        );
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [
    dailyDigestPreferences,
    emailChannelPreferences,
    emailChannelStatus,
    emailDeliveryValue,
    preferences,
  ]);

  const isLabelPickerVisible = Boolean(preferences?.subjects?.labeled);

  const labelPicker = (
    <div
      className={`alpaca-notifications-label-picker${
        isLabelPickerVisible ? ' is-visible' : ''
      }`}
      aria-hidden={!isLabelPickerVisible}
    >
      {labels.length > 0 ? (
        <div className="alpaca-notifications-label-grid">
          {labels.map((label) => {
            const labelId = Number(label[TERM_ID_KEY]);

            return (
              <CheckboxControl
                key={labelId}
                label={label.name}
                checked={selectedLabelIds.includes(labelId)}
                disabled={isSaving}
                onChange={(value) => handleLabelToggle(labelId, value)}
              />
            );
          })}
        </div>
      ) : (
        <p className="alpaca-notifications-help">
          {__('No labels are available yet.', 'alpaca')}
        </p>
      )}
    </div>
  );

  const renderSaveActions = (tab) => (
    <div className="alpaca-notifications-actions">
      <Button
        isPrimary
        onClick={handleSave}
        disabled={isSaving || hasInvalidEmailDeliveryConfiguration}
      >
        {getNotificationTabSaveLabel(tab, isSaving)}
      </Button>
    </div>
  );

  const renderGenericChannelSettings = (channel) => {
    const channelKey = channel?.key || '';
    const currentChannelPreferences =
      preferences?.[CHANNELS_KEY]?.[channelKey] || {};
    const currentChannelStatus = channelStatus?.[channelKey] || {};
    const isChannelEnabled = Boolean(currentChannelPreferences.enabled);
    const channelCanEnable = Boolean(currentChannelStatus.can_enable);

    const handleChannelSettingChange = (fieldKey, value) => {
      updateChannelValue(channelKey, fieldKey, value);
    };

    return (
      <section className="alpaca-notifications-panel alpaca-notifications-panel--narrow">
        <p className="alpaca-notifications-panel-intro">
          {channel.description ||
            __('Configure how this delivery channel should behave.', 'alpaca')}
        </p>

        <div className="alpaca-notifications-channel-stack">
          <ToggleControl
            label={getChannelToggleLabel(channel.label)}
            checked={isChannelEnabled}
            onChange={(value) =>
              updateChannelValue(channelKey, 'enabled', value)
            }
            disabled={isSaving || (!isChannelEnabled && !channelCanEnable)}
          />

          {Array.isArray(channel.summary_fields) &&
            channel.summary_fields.length > 0 && (
              <div className="alpaca-notifications-channel-summary">
                {channel.summary_fields.map((field) => {
                  const value = currentChannelStatus?.[field.key];
                  const hasValue =
                    null !== value &&
                    typeof value !== 'undefined' &&
                    '' !== value;

                  return (
                    <div
                      key={field.key}
                      className="alpaca-notifications-channel-row"
                    >
                      <span className="alpaca-notifications-channel-label">
                        {field.label}
                      </span>
                      <span className="alpaca-notifications-channel-value">
                        {hasValue ? String(value) : getChannelSummaryFallback()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

          {Array.isArray(channel.settings_fields) &&
            channel.settings_fields.map((field) => {
              if (!['email', 'text'].includes(field.type)) {
                return null;
              }

              const value =
                'string' === typeof currentChannelPreferences[field.key]
                  ? currentChannelPreferences[field.key]
                  : '';

              return (
                <TextControl
                  key={field.key}
                  label={field.label}
                  type={'email' === field.type ? 'email' : 'text'}
                  value={value}
                  onChange={(nextValue) =>
                    handleChannelSettingChange(field.key, nextValue)
                  }
                  disabled={isSaving}
                  help={field.help}
                />
              );
            })}

          {!channelCanEnable && (
            <p className="alpaca-notifications-help">
              {__('This channel is not ready to be enabled yet.', 'alpaca')}
            </p>
          )}
        </div>
      </section>
    );
  };

  if (isLoading) {
    return (
      <div className="alpaca-notifications-screen">
        <Spinner />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="alpaca-notifications-screen">
        <Notice status="error" isDismissible={false}>
          {error || __('Could not load notification preferences.', 'alpaca')}
        </Notice>
      </div>
    );
  }

  return (
    <div className="alpaca-notifications-screen">
      {error && (
        <Notice status="error" onRemove={() => setError('')}>
          {error}
        </Notice>
      )}
      {notice && (
        <Notice status="success" onRemove={() => setNotice('')}>
          {notice}
        </Notice>
      )}

      <div className="alpaca-notifications-panel alpaca-notifications-intro">
        <p>
          {__(
            'Choose which issue activity matters to you and how email updates should work. In-app notifications stay available inside Project Board.',
            'alpaca',
          )}
        </p>
      </div>

      <TabPanel
        className="alpaca-notifications-tabs"
        activeClass="is-active"
        tabs={notificationSettingsTabs}
      >
        {(tab) => {
          const tabContext = {
            dailyDigestPreferences,
            emailChannelDefinition,
            emailDeliveryValue,
            emailChannelStatus,
            hasEmailDigestEnabled,
            hasInstantEmailEnabled,
            hasInvalidEmailDeliveryConfiguration,
            hasInvalidEmailOverride,
            isSaving,
            renderSaveActions,
            setEmailDeliveryValue,
            siteTimezoneLabel,
            updateChannelValue,
            updateDailyDigestChannelValue,
            updateDailyDigestValue,
          };
          const channelKey = getChannelKeyFromTabName(tab.name);

          if (PREFERENCES_TAB_NAME === tab.name) {
            return (
              <div className="alpaca-notifications-tab-content">
                <div className="alpaca-notifications-grid">
                  <section className="alpaca-notifications-panel">
                    <h2>{__('Notify me about', 'alpaca')}</h2>
                    <div className="alpaca-notifications-options">
                      {subjectOptions.map((option) => (
                        <div
                          key={option.key}
                          className="alpaca-notifications-option-group"
                        >
                          <CheckboxControl
                            label={option.label}
                            help={option.help}
                            checked={Boolean(
                              preferences.subjects?.[option.key],
                            )}
                            disabled={isSaving}
                            onChange={(value) =>
                              updateSectionValue('subjects', option.key, value)
                            }
                          />
                          {'labeled' === option.key && labelPicker}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="alpaca-notifications-panel">
                    <h2>{__('Activity types', 'alpaca')}</h2>
                    <div className="alpaca-notifications-options">
                      {eventOptions.map((option) => (
                        <CheckboxControl
                          key={option.key}
                          label={option.label}
                          checked={Boolean(preferences.events?.[option.key])}
                          disabled={isSaving}
                          onChange={(value) =>
                            updateSectionValue('events', option.key, value)
                          }
                        />
                      ))}
                    </div>
                  </section>
                </div>
                {renderSaveActions(tab)}
              </div>
            );
          }

          if ('function' === typeof applyFilters) {
            const filteredContent = applyFilters(
              NOTIFICATION_TAB_CONTENT_FILTER,
              null,
              tab,
              tabContext,
            );

            if (filteredContent) {
              return (
                <div className="alpaca-notifications-tab-content">
                  {filteredContent}
                </div>
              );
            }
          }

          if (EMAIL_CHANNEL_KEY === channelKey && emailChannelDefinition) {
            return (
              <div className="alpaca-notifications-tab-content">
                {renderNotificationEmailTab(tabContext, tab)}
              </div>
            );
          }

          const genericChannel = configurableChannels.find(
            (channel) => channel.key === channelKey,
          );

          if (genericChannel) {
            return (
              <div className="alpaca-notifications-tab-content">
                {renderGenericChannelSettings(genericChannel)}
                {renderSaveActions(tab)}
              </div>
            );
          }

          return null;
        }}
      </TabPanel>
    </div>
  );
};

export default NotificationPreferences;
