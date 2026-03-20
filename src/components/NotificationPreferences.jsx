import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '../services/notificationApi';
import { fetchLabels } from '../services/issueApi';

const { useCallback, useEffect, useMemo, useState } = wp.element;
const { __, sprintf } = wp.i18n;
const { Button, CheckboxControl, Notice, Spinner, TextControl, ToggleControl } =
  wp.components;

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
const INBOX_QUERY_KEY = 'inbox';
const INBOX_QUERY_VALUE = 'open';

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
 * Get the Project Board admin URL.
 *
 * @return {string} Project Board admin URL.
 */
const getProjectBoardUrl = () => {
  if (
    window.alpacaSettings?.adminUrl &&
    'string' === typeof window.alpacaSettings.adminUrl
  ) {
    return `${window.alpacaSettings.adminUrl}?page=project-board`;
  }

  const restRoot = window.alpacaSettings?.restRoot;
  if ('string' === typeof restRoot && restRoot.includes('/wp-json/')) {
    return `${restRoot.replace('/wp-json/', '/wp-admin/')}admin.php?page=project-board`;
  }

  return `${window.location.origin}/wp-admin/admin.php?page=project-board`;
};

/**
 * Get the Project Board URL with the inbox drawer open.
 *
 * @return {string} Project Board inbox URL.
 */
const getProjectBoardInboxUrl = () =>
  `${getProjectBoardUrl()}&${INBOX_QUERY_KEY}=${INBOX_QUERY_VALUE}`;

/**
 * Get the toggle label for a notification channel.
 *
 * @param {string} channelKey   Notification channel key.
 * @param {string} channelLabel Notification channel label.
 * @return {string} Toggle label text.
 */
const getChannelToggleLabel = (channelKey, channelLabel) => {
  if ('inbox' === channelKey) {
    return __('Show updates inside Project Board', 'alpaca');
  }

  if ('email' === channelKey) {
    return __('Send updates by email', 'alpaca');
  }

  return sprintf(
    /* translators: %s: notification channel label. */
    __('Enable %s notifications', 'alpaca'),
    channelLabel,
  );
};

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
  const projectBoardInboxUrl = useMemo(() => getProjectBoardInboxUrl(), []);

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
        setPreferences(response.preferences || null);
        setAvailableChannels(
          Array.isArray(response[AVAILABLE_CHANNELS_KEY])
            ? response[AVAILABLE_CHANNELS_KEY]
            : [],
        );
        setChannelStatus(
          response[CHANNEL_STATUS_KEY] &&
            'object' === typeof response[CHANNEL_STATUS_KEY]
            ? response[CHANNEL_STATUS_KEY]
            : {},
        );
        setSiteTimezoneLabel(
          'string' === typeof response[SITE_TIMEZONE_LABEL_KEY]
            ? response[SITE_TIMEZONE_LABEL_KEY]
            : '',
        );
        setEmailDeliveryValue(
          getEmailDeliveryFieldValue(
            response.preferences || null,
            response[CHANNEL_STATUS_KEY] &&
              'object' === typeof response[CHANNEL_STATUS_KEY]
              ? response[CHANNEL_STATUS_KEY]
              : {},
          ),
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

  const emailChannelPreferences = useMemo(() => {
    if (!preferences || !preferences[CHANNELS_KEY]) {
      return {};
    }

    return preferences[CHANNELS_KEY].email || {};
  }, [preferences]);

  const hasInvalidEmailOverride = useMemo(() => {
    const trimmedOverride =
      'string' === typeof emailDeliveryValue ? emailDeliveryValue.trim() : '';
    if (!trimmedOverride) {
      return false;
    }

    return !isValidEmail(trimmedOverride);
  }, [emailDeliveryValue]);

  const selectedLabelIds = useMemo(() => {
    if (!preferences || !Array.isArray(preferences[LABEL_IDS_KEY])) {
      return [];
    }

    return preferences[LABEL_IDS_KEY].map((value) => Number(value));
  }, [preferences]);

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

  const digestChannelOptions = useMemo(
    () =>
      availableChannels.filter(
        (channel) => channel && channel.supports_digest && channel.is_available,
      ),
    [availableChannels],
  );

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

    const nextPreferences = {
      ...preferences,
      [CHANNELS_KEY]: {
        ...preferences[CHANNELS_KEY],
        email: {
          ...emailChannelPreferences,
        },
      },
    };
    const trimmedEmailValue =
      'string' === typeof emailDeliveryValue ? emailDeliveryValue.trim() : '';
    const profileAddress =
      channelStatus?.email &&
      'string' === typeof channelStatus.email.profile_address
        ? channelStatus.email.profile_address.trim()
        : '';

    if (
      '' === trimmedEmailValue ||
      (profileAddress &&
        trimmedEmailValue.toLowerCase() === profileAddress.toLowerCase())
    ) {
      nextPreferences[CHANNELS_KEY].email[ADDRESS_OVERRIDE_KEY] = '';
    } else {
      nextPreferences[CHANNELS_KEY].email[ADDRESS_OVERRIDE_KEY] =
        trimmedEmailValue;
    }

    setIsSaving(true);
    setError('');
    setNotice('');

    updateNotificationPreferences(nextPreferences)
      .then((response) => {
        setPreferences(response.preferences || null);
        setAvailableChannels(
          Array.isArray(response[AVAILABLE_CHANNELS_KEY])
            ? response[AVAILABLE_CHANNELS_KEY]
            : [],
        );
        setChannelStatus(
          response[CHANNEL_STATUS_KEY] &&
            'object' === typeof response[CHANNEL_STATUS_KEY]
            ? response[CHANNEL_STATUS_KEY]
            : {},
        );
        setSiteTimezoneLabel(
          'string' === typeof response[SITE_TIMEZONE_LABEL_KEY]
            ? response[SITE_TIMEZONE_LABEL_KEY]
            : '',
        );
        setEmailDeliveryValue(
          getEmailDeliveryFieldValue(
            response.preferences || null,
            response[CHANNEL_STATUS_KEY] &&
              'object' === typeof response[CHANNEL_STATUS_KEY]
              ? response[CHANNEL_STATUS_KEY]
              : {},
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
  }, [channelStatus, emailChannelPreferences, emailDeliveryValue, preferences]);

  const labelPicker = Boolean(preferences?.subjects?.labeled) && (
    <div className="alpaca-notifications-label-picker">
      <p className="alpaca-notifications-help">
        {__('Select the labels you want to subscribe to.', 'alpaca')}
      </p>
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

      <section className="alpaca-notifications-panel">
        <h2>{__('How You Receive Updates', 'alpaca')}</h2>
        <p className="alpaca-notifications-panel-intro">
          {__(
            'Choose where Alpaca should send updates. The same notification rules below apply to every enabled channel.',
            'alpaca',
          )}
        </p>
        <div className="alpaca-notifications-channel-grid">
          {availableChannels.map((channel) => {
            const channelKey = channel?.key || '';
            const currentChannelPreferences =
              preferences[CHANNELS_KEY]?.[channelKey] || {};
            const currentChannelStatus = channelStatus?.[channelKey] || {};
            const isChannelEnabled = !!currentChannelPreferences.enabled;
            const profileAddress =
              'email' === channelKey &&
              'string' === typeof currentChannelStatus.profile_address
                ? currentChannelStatus.profile_address
                : '';
            const emailFieldValue =
              'email' === channelKey ? emailDeliveryValue : '';
            let channelCanEnable = Boolean(currentChannelStatus.can_enable);

            if ('email' === channelKey) {
              const trimmedEmailFieldValue = emailFieldValue.trim();
              const effectiveEmailFieldValue =
                trimmedEmailFieldValue || profileAddress;

              channelCanEnable = isValidEmail(effectiveEmailFieldValue);
            }

            const channelSettingValue = (fieldKey) => {
              if ('email' === channelKey) {
                return emailDeliveryValue;
              }

              if ('string' === typeof currentChannelPreferences[fieldKey]) {
                return currentChannelPreferences[fieldKey];
              }

              return '';
            };

            const handleChannelSettingChange = (fieldKey, value) => {
              if ('email' === channelKey) {
                setEmailDeliveryValue(value);
                return;
              }

              updateChannelValue(channelKey, fieldKey, value);
            };

            const enableChannelLabel = getChannelToggleLabel(
              channelKey,
              channel.label,
            );

            return (
              <div
                key={channelKey}
                className="alpaca-notifications-channel-card"
              >
                <div className="alpaca-notifications-channel-header">
                  <div>
                    <h3>{channel.label}</h3>
                    {channel.description && <p>{channel.description}</p>}
                  </div>
                  <ToggleControl
                    label={enableChannelLabel}
                    hideLabelFromVision
                    checked={isChannelEnabled}
                    onChange={(value) =>
                      updateChannelValue(channelKey, 'enabled', value)
                    }
                    disabled={
                      isSaving || (!isChannelEnabled && !channelCanEnable)
                    }
                  />
                </div>

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
                              {hasValue
                                ? String(value)
                                : getChannelSummaryFallback()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                {'inbox' === channelKey && (
                  <div className="alpaca-notifications-channel-actions">
                    <Button href={projectBoardInboxUrl} variant="secondary">
                      {__('Open Inbox', 'alpaca')}
                    </Button>
                  </div>
                )}

                {Array.isArray(channel.settings_fields) &&
                  channel.settings_fields.map((field) => {
                    if ('email' === field.type) {
                      return (
                        <TextControl
                          key={field.key}
                          label={field.label}
                          value={channelSettingValue(field.key)}
                          onChange={(value) =>
                            handleChannelSettingChange(field.key, value)
                          }
                          disabled={isSaving}
                          help={
                            'email' === channelKey && hasInvalidEmailOverride
                              ? __(
                                  'Enter a valid email address or leave this blank.',
                                  'alpaca',
                                )
                              : field.help
                          }
                        />
                      );
                    }

                    return null;
                  })}

                {!channelCanEnable && (
                  <p className="alpaca-notifications-help">
                    {'email' === channelKey
                      ? __(
                          'Add an email to your WordPress profile or enter an override email before enabling this channel.',
                          'alpaca',
                        )
                      : __(
                          'This channel is not ready to be enabled yet.',
                          'alpaca',
                        )}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="alpaca-notifications-panel">
        <h2>{__('Daily Summary', 'alpaca')}</h2>
        <p className="alpaca-notifications-panel-intro">
          {__(
            'Receive a scheduled digest every 24 hours at your chosen time, grouping the last 24 hours of activity by issue.',
            'alpaca',
          )}
        </p>

        <div className="alpaca-notifications-digest-layout">
          <ToggleControl
            label={__('Receive a daily summary', 'alpaca')}
            checked={Boolean(dailyDigestPreferences.enabled)}
            onChange={(value) => updateDailyDigestValue('enabled', value)}
            disabled={isSaving}
          />

          <div
            className={`alpaca-notifications-digest-settings${
              dailyDigestPreferences.enabled ? '' : ' is-disabled'
            }`}
            aria-disabled={!dailyDigestPreferences.enabled}
          >
            {!dailyDigestPreferences.enabled && (
              <p className="alpaca-notifications-digest-disabled-note">
                {__(
                  'Turn on Daily Summary to configure the schedule and delivery channel.',
                  'alpaca',
                )}
              </p>
            )}

            <div className="alpaca-notifications-digest-time">
              <TextControl
                label={__('Send time', 'alpaca')}
                type="time"
                value={dailyDigestPreferences[SEND_TIME_KEY] || '17:00'}
                onChange={(value) =>
                  updateDailyDigestValue(SEND_TIME_KEY, value)
                }
                disabled={isSaving || !dailyDigestPreferences.enabled}
              />
            </div>

            <p className="alpaca-notifications-help">
              {sprintf(
                /* translators: %s: site timezone label. */
                __(
                  'Daily summaries repeat every 24 hours using the site timezone: %s.',
                  'alpaca',
                ),
                siteTimezoneLabel || __('Site timezone', 'alpaca'),
              )}
            </p>

            <div className="alpaca-notifications-digest-fieldset">
              <strong>{__('Digest channels', 'alpaca')}</strong>
              <div className="alpaca-notifications-digest-channels">
                {digestChannelOptions.map((channel) => {
                  const canEnable =
                    channelStatus?.[channel.key] &&
                    'boolean' === typeof channelStatus[channel.key].can_enable
                      ? channelStatus[channel.key].can_enable
                      : true;

                  return (
                    <CheckboxControl
                      key={channel.key}
                      label={channel.label}
                      checked={Boolean(
                        dailyDigestPreferences.channels?.[channel.key],
                      )}
                      disabled={
                        isSaving ||
                        !dailyDigestPreferences.enabled ||
                        !canEnable
                      }
                      onChange={(value) =>
                        updateDailyDigestChannelValue(channel.key, value)
                      }
                      help={
                        canEnable
                          ? ''
                          : __(
                              'Configure a valid delivery address before enabling this digest channel.',
                              'alpaca',
                            )
                      }
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

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
                  checked={Boolean(preferences.subjects?.[option.key])}
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

      <div className="alpaca-notifications-actions">
        <Button
          isPrimary
          onClick={handleSave}
          disabled={isSaving || hasInvalidEmailOverride}
        >
          {isSaving
            ? __('Saving…', 'alpaca')
            : __('Save Preferences', 'alpaca')}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
