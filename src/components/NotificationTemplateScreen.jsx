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
    title: __('Issue Title', 'alpaca'),
    description: __('Insert the issue title.', 'alpaca'),
  },
  {
    name: 'alpaca/email-actor-name',
    title: __('Performed By', 'alpaca'),
    description: __(
      'Insert the name of the person who performed the activity.',
      'alpaca',
    ),
  },
  {
    name: 'alpaca/email-event-label',
    title: __('Event Label', 'alpaca'),
    description: __(
      'Insert the event label such as status change or comment.',
      'alpaca',
    ),
  },
  {
    name: 'alpaca/email-comment-content',
    title: __('Full Comment Content', 'alpaca'),
    description: __(
      'Insert the full issue comment, including attachment links.',
      'alpaca',
    ),
  },
  {
    name: 'alpaca/email-issue-link',
    title: __('Issue Link', 'alpaca'),
    description: __('Insert a link to the issue on the board.', 'alpaca'),
  },
  {
    name: 'alpaca/email-site-name',
    title: __('Site Title', 'alpaca'),
    description: __('Insert the current site title.', 'alpaca'),
  },
  {
    name: 'alpaca/email-site-tagline',
    title: __('Site Tagline', 'alpaca'),
    description: __('Insert the current site tagline.', 'alpaca'),
  },
  {
    name: 'alpaca/email-site-logo',
    title: __('Site Icon', 'alpaca'),
    description: __('Insert the current site icon.', 'alpaca'),
  },
  {
    name: 'alpaca/email-event-time',
    title: __('Event Time', 'alpaca'),
    description: __('Insert the event timestamp.', 'alpaca'),
  },
];

/**
 * Register Alpaca email template placeholder blocks.
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
      introTitle={__('Shared Email Template', 'alpaca')}
      introDescription={__(
        'This template is used for instant issue activity emails. Keep the Full Comment Content block in the layout so the activity itself is always included.',
        'alpaca',
      )}
      templateDescription={__(
        'Use core blocks for layout and Alpaca blocks for issue-specific placeholders.',
        'alpaca',
      )}
      previewDescription={__(
        'Preview the shared email using sample issue activity before saving or sending a test.',
        'alpaca',
      )}
      subjectHelp={__(
        'Available placeholders include {{issue_title}}, {{performed_by}}, {{event_label}}, {{site_title}}, {{site_tagline}}, and {{event_time}}.',
        'alpaca',
      )}
      loadErrorMessage={__(
        'Could not load the notification email template.',
        'alpaca',
      )}
      previewErrorMessage={__('Could not refresh the email preview.', 'alpaca')}
      saveErrorMessage={__(
        'Could not save the notification email template.',
        'alpaca',
      )}
      resetErrorMessage={__(
        'Could not reset the notification email template.',
        'alpaca',
      )}
      testErrorMessage={__('Could not send the test email.', 'alpaca')}
      saveSuccessMessage={__('Notification email template saved.', 'alpaca')}
      resetSuccessMessage={__(
        'Notification email template reset to default.',
        'alpaca',
      )}
      testSuccessMessage={__('Test email sent successfully.', 'alpaca')}
      previewEmptyMessage={__(
        'Preview will appear here once the template loads.',
        'alpaca',
      )}
    />
  );
};

export default NotificationTemplateScreen;
