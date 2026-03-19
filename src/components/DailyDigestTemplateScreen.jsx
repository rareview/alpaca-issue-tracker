import {
  fetchNotificationDigestTemplate,
  previewNotificationDigestTemplate,
  resetNotificationDigestTemplate,
  sendNotificationDigestTemplateTestEmail,
  updateNotificationDigestTemplate,
} from '../services/notificationApi';
import { registerTemplateBlocks } from '../utils/registerTemplateBlocks.js';
import BlockTemplateEditorScreen from './BlockTemplateEditorScreen';

const { __ } = wp.i18n;

const dailyDigestTemplateBlockDefinitions = [
  {
    name: 'alpaca/digest-site-icon',
    title: __('Site Icon', 'alpaca'),
    description: __('Insert the current site icon.', 'alpaca'),
    multiple: true,
  },
  {
    name: 'alpaca/digest-deadline-watch',
    title: __('Issues Falling Due', 'alpaca'),
    description: __(
      'Render the locked deadline-watch digest section.',
      'alpaca',
    ),
    multiple: false,
  },
  {
    name: 'alpaca/digest-issue-activity',
    title: __('My Issues', 'alpaca'),
    description: __(
      'Render the locked followed-issues digest section.',
      'alpaca',
    ),
    multiple: false,
  },
  {
    name: 'alpaca/digest-new-items',
    title: __('New Items', 'alpaca'),
    description: __('Render the locked new-items digest section.', 'alpaca'),
    multiple: false,
  },
];

/**
 * Register Alpaca digest template placeholder blocks.
 *
 * @return {void}
 */
const registerNotificationDigestBlocks = () => {
  registerTemplateBlocks(dailyDigestTemplateBlockDefinitions, 'schedule');
};

/**
 * Standalone block editor screen for the shared daily digest template.
 *
 * @return {JSX.Element} Template screen.
 */
const DailyDigestTemplateScreen = () => (
  <BlockTemplateEditorScreen
    fetchTemplate={fetchNotificationDigestTemplate}
    updateTemplate={updateNotificationDigestTemplate}
    resetTemplate={resetNotificationDigestTemplate}
    previewTemplate={previewNotificationDigestTemplate}
    sendTestEmail={sendNotificationDigestTemplateTestEmail}
    registerBlocks={registerNotificationDigestBlocks}
    introTitle={__('Daily Digest Template', 'alpaca')}
    introDescription={__(
      'Use core blocks for layout and keep the locked digest section blocks in place so the scheduled summary always includes the system-rendered content.',
      'alpaca',
    )}
    templateDescription={__(
      'Arrange the digest with blocks. The locked section blocks render due issues, grouped issue activity, and new items.',
      'alpaca',
    )}
    previewDescription={__(
      'Preview the scheduled digest using sample board activity before saving or sending a test.',
      'alpaca',
    )}
    subjectHelp={__(
      'Available placeholders include {{site_title}}, {{site_tagline}}, {{digest_day}}, {{issue_count}}, {{activity_count}}, and {{new_item_count}}.',
      'alpaca',
    )}
    loadErrorMessage={__('Could not load the daily digest template.', 'alpaca')}
    previewErrorMessage={__(
      'Could not refresh the daily digest preview.',
      'alpaca',
    )}
    saveErrorMessage={__('Could not save the daily digest template.', 'alpaca')}
    resetErrorMessage={__(
      'Could not reset the daily digest template.',
      'alpaca',
    )}
    testErrorMessage={__('Could not send the test digest email.', 'alpaca')}
    saveSuccessMessage={__('Daily digest template saved.', 'alpaca')}
    resetSuccessMessage={__(
      'Daily digest template reset to default.',
      'alpaca',
    )}
    testSuccessMessage={__('Test digest email sent successfully.', 'alpaca')}
    previewEmptyMessage={__(
      'Preview will appear here once the template loads.',
      'alpaca',
    )}
  />
);

export default DailyDigestTemplateScreen;
