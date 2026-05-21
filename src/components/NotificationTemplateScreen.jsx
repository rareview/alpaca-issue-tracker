import {
  fetchNotificationTemplate,
  previewNotificationTemplate,
  resetNotificationTemplate,
  sendNotificationTemplateTestEmail,
  updateNotificationTemplate,
} from '../services/notificationApi';
import { registerTemplateBlocks } from '../utils/registerTemplateBlocks.js';
import BlockTemplateEditorScreen from './BlockTemplateEditorScreen';

const { __ } = wp.i18n;

const notificationTemplateBlockDefinitions = [
  {
    name: 'alpaca/email-issue-title',
    title: __('Issue Title', 'alpaca-issue-tracker'),
    description: __('Insert the issue title.', 'alpaca-issue-tracker'),
  },
  {
    name: 'alpaca/email-actor-name',
    title: __('Performed By', 'alpaca-issue-tracker'),
    description: __(
      'Insert the name of the person who performed the activity.',
      'alpaca-issue-tracker',
    ),
  },
  {
    name: 'alpaca/email-event-label',
    title: __('Event Label', 'alpaca-issue-tracker'),
    description: __(
      'Insert the event label such as status change or comment.',
      'alpaca-issue-tracker',
    ),
  },
  {
    name: 'alpaca/email-comment-content',
    title: __('Full Comment Content', 'alpaca-issue-tracker'),
    description: __(
      'Insert the full issue comment, including attachment links.',
      'alpaca-issue-tracker',
    ),
  },
  {
    name: 'alpaca/email-issue-link',
    title: __('Issue Link', 'alpaca-issue-tracker'),
    description: __('Insert a link to the issue on the board.', 'alpaca-issue-tracker'),
  },
  {
    name: 'alpaca/email-site-name',
    title: __('Site Title', 'alpaca-issue-tracker'),
    description: __('Insert the current site title.', 'alpaca-issue-tracker'),
  },
  {
    name: 'alpaca/email-site-tagline',
    title: __('Site Tagline', 'alpaca-issue-tracker'),
    description: __('Insert the current site tagline.', 'alpaca-issue-tracker'),
  },
  {
    name: 'alpaca/email-site-logo',
    title: __('Site Icon', 'alpaca-issue-tracker'),
    description: __('Insert the current site icon.', 'alpaca-issue-tracker'),
  },
  {
    name: 'alpaca/email-event-time',
    title: __('Event Time', 'alpaca-issue-tracker'),
    description: __('Insert the event timestamp.', 'alpaca-issue-tracker'),
  },
];

/**
 * Register Alpaca Issue Tracker email template placeholder blocks.
 *
 * @return {void}
 */
const registerNotificationEmailBlocks = () => {
  registerTemplateBlocks(notificationTemplateBlockDefinitions, 'email');
};

/**
 * Standalone block editor screen for the shared notification email template.
 *
 * @return {JSX.Element} Template screen.
 */
const NotificationTemplateScreen = () => {
  return (
    <BlockTemplateEditorScreen
      fetchTemplate={fetchNotificationTemplate}
      updateTemplate={updateNotificationTemplate}
      resetTemplate={resetNotificationTemplate}
      previewTemplate={previewNotificationTemplate}
      sendTestEmail={sendNotificationTemplateTestEmail}
      registerBlocks={registerNotificationEmailBlocks}
      subjectHelp={__(
        'Available placeholders include {{issue_title}}, {{performed_by}}, {{event_label}}, {{site_title}}, {{site_tagline}}, and {{event_time}}.',
        'alpaca-issue-tracker',
      )}
      loadErrorMessage={__(
        'Could not load the notification email template.',
        'alpaca-issue-tracker',
      )}
      previewErrorMessage={__('Could not refresh the email preview.', 'alpaca-issue-tracker')}
      saveErrorMessage={__(
        'Could not save the notification email template.',
        'alpaca-issue-tracker',
      )}
      resetErrorMessage={__(
        'Could not reset the notification email template.',
        'alpaca-issue-tracker',
      )}
      testErrorMessage={__('Could not send the test email.', 'alpaca-issue-tracker')}
      saveSuccessMessage={__('Notification email template saved.', 'alpaca-issue-tracker')}
      resetSuccessMessage={__(
        'Notification email template reset to default.',
        'alpaca-issue-tracker',
      )}
      testSuccessMessage={__('Test email sent successfully.', 'alpaca-issue-tracker')}
      previewEmptyMessage={__(
        'Preview will appear here once the template loads.',
        'alpaca-issue-tracker',
      )}
    />
  );
};

export default NotificationTemplateScreen;
