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
    title: __('Site Icon', 'alpaca-issue-tracker'),
    description: __('Insert the current site icon.', 'alpaca-issue-tracker'),
    multiple: true,
  },
  {
    name: 'alpaca/digest-deadline-watch',
    title: __('Issues Falling Due', 'alpaca-issue-tracker'),
    description: __(
      'Render the locked deadline-watch digest section.',
      'alpaca-issue-tracker',
    ),
    multiple: false,
  },
  {
    name: 'alpaca/digest-issue-activity',
    title: __('My Issues', 'alpaca-issue-tracker'),
    description: __(
      'Render the locked followed-issues digest section.',
      'alpaca-issue-tracker',
    ),
    multiple: false,
  },
  {
    name: 'alpaca/digest-new-items',
    title: __('New Items', 'alpaca-issue-tracker'),
    description: __(
      'Render the locked new-items digest section.',
      'alpaca-issue-tracker',
    ),
    multiple: false,
  },
];

/**
 * Register Alpaca Issue Tracker digest template placeholder blocks.
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
    subjectHelp={__(
      'Available placeholders include {{site_title}}, {{site_tagline}}, {{digest_day}}, {{issue_count}}, {{activity_count}}, and {{new_item_count}}.',
      'alpaca-issue-tracker',
    )}
    loadErrorMessage={__(
      'Could not load the daily digest template.',
      'alpaca-issue-tracker',
    )}
    previewErrorMessage={__(
      'Could not refresh the daily digest preview.',
      'alpaca-issue-tracker',
    )}
    saveErrorMessage={__(
      'Could not save the daily digest template.',
      'alpaca-issue-tracker',
    )}
    resetErrorMessage={__(
      'Could not reset the daily digest template.',
      'alpaca-issue-tracker',
    )}
    testErrorMessage={__(
      'Could not send the test digest email.',
      'alpaca-issue-tracker',
    )}
    saveSuccessMessage={__(
      'Daily digest template saved.',
      'alpaca-issue-tracker',
    )}
    resetSuccessMessage={__(
      'Daily digest template reset to default.',
      'alpaca-issue-tracker',
    )}
    testSuccessMessage={__(
      'Test digest email sent successfully.',
      'alpaca-issue-tracker',
    )}
    previewEmptyMessage={__(
      'Preview will appear here once the template loads.',
      'alpaca-issue-tracker',
    )}
  />
);

export default DailyDigestTemplateScreen;
