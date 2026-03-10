import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '../services/notificationApi';

const { useCallback, useEffect, useMemo, useState } = wp.element;
const { __ } = wp.i18n;
const { Button, CheckboxControl, Notice, Spinner, TextControl, ToggleControl } =
  wp.components;

const subjectOptions = [
  {
    key: 'created',
    label: __('Issues I created', 'alpaca'),
    help: __('Receive emails about issues you created.', 'alpaca'),
  },
  {
    key: 'assigned',
    label: __('Issues assigned to me', 'alpaca'),
    help: __(
      'Receive emails when you are assigned or when assigned issues change.',
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
      'Receive emails when another user mentions you with @username.',
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
 * Render the current user's notification preferences screen.
 *
 * @return {JSX.Element} Preference screen.
 */
const NotificationPreferences = () => {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadPreferences = useCallback(() => {
    setIsLoading(true);
    setError('');

    fetchNotificationPreferences()
      .then((response) => {
        setPreferences(response.preferences);
        setEmail(response.email || '');
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

  const hasValidEmail = useMemo(() => Boolean(email), [email]);

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

  const handleSave = useCallback(() => {
    if (!preferences) {
      return;
    }

    setIsSaving(true);
    setError('');
    setNotice('');

    updateNotificationPreferences(preferences)
      .then((response) => {
        setPreferences(response.preferences);
        setEmail(response.email || '');
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
  }, [preferences]);

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

      <div className="alpaca-notifications-panel">
        <ToggleControl
          label={__('Receive Alpaca email notifications', 'alpaca')}
          checked={Boolean(preferences.enabled)}
          onChange={(value) =>
            setPreferences((current) => ({ ...current, enabled: value }))
          }
          disabled={!hasValidEmail || isSaving}
        />
        <p className="alpaca-notifications-help">
          {__(
            'Email notifications are off by default and only apply to your account.',
            'alpaca',
          )}
        </p>

        <TextControl
          label={__('Delivery email', 'alpaca')}
          value={email}
          readOnly
          help={
            hasValidEmail
              ? __(
                  'Notifications are sent to your WordPress profile email.',
                  'alpaca',
                )
              : __(
                  'Add an email address to your WordPress profile before enabling notifications.',
                  'alpaca',
                )
          }
        />
      </div>

      <div className="alpaca-notifications-grid">
        <section className="alpaca-notifications-panel">
          <h2>{__('Notify me for', 'alpaca')}</h2>
          <div className="alpaca-notifications-options">
            {subjectOptions.map((option) => (
              <CheckboxControl
                key={option.key}
                label={option.label}
                help={option.help}
                checked={Boolean(preferences.subjects?.[option.key])}
                disabled={!preferences.enabled || !hasValidEmail || isSaving}
                onChange={(value) =>
                  updateSectionValue('subjects', option.key, value)
                }
              />
            ))}
          </div>
        </section>

        <section className="alpaca-notifications-panel">
          <h2>{__('Send emails for', 'alpaca')}</h2>
          <div className="alpaca-notifications-options">
            {eventOptions.map((option) => (
              <CheckboxControl
                key={option.key}
                label={option.label}
                checked={Boolean(preferences.events?.[option.key])}
                disabled={!preferences.enabled || !hasValidEmail || isSaving}
                onChange={(value) =>
                  updateSectionValue('events', option.key, value)
                }
              />
            ))}
          </div>
        </section>
      </div>

      <div className="alpaca-notifications-actions">
        <Button isPrimary onClick={handleSave} disabled={isSaving}>
          {isSaving
            ? __('Saving…', 'alpaca')
            : __('Save preferences', 'alpaca')}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
