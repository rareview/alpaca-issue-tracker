import NotificationTemplateScreen from './NotificationTemplateScreen.jsx';
import DailyDigestTemplateScreen from './DailyDigestTemplateScreen.jsx';

const { __ } = wp.i18n;
const { TabPanel } = wp.components;

const EMAIL_TEMPLATE_TABS = [
  {
    name: 'instant-emails',
    title: __('Instant Emails', 'alpaca'),
    className: 'alpaca-email-templates-tab--instant',
  },
  {
    name: 'daily-digest',
    title: __('Daily Digest', 'alpaca'),
    className: 'alpaca-email-templates-tab--digest',
  },
];

/**
 * Render the unified email templates admin screen.
 *
 * @return {JSX.Element} Email templates screen.
 */
const EmailTemplatesScreen = () => {
  return (
    <div className="alpaca-email-templates-screen">
      <div className="alpaca-notification-template-intro">
        <p>
          {__(
            'Manage the templates used for outbound emails in the block editor areas below. Locked blocks are essential for the correct functioning of the templates. They can be moved, but should not be removed.',
            'alpaca',
          )}
        </p>
      </div>

      <TabPanel
        className="alpaca-email-templates-tabs"
        activeClass="is-active"
        tabs={EMAIL_TEMPLATE_TABS}
      >
        {(tab) => {
          if (tab.name === 'daily-digest') {
            return <DailyDigestTemplateScreen />;
          }

          return <NotificationTemplateScreen />;
        }}
      </TabPanel>
    </div>
  );
};

export default EmailTemplatesScreen;
