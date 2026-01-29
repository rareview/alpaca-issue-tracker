import PropTypes from 'prop-types';
const { TabPanel } = wp.components;
const { __ } = wp.i18n;
import User from './components/User';
import useUserManagement from './hooks/useUserManagement';
import PriorityIcon from './components/icons/PriorityIcon';

const formatDate = (dateString) => {
  if (!dateString) return null;

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateString));
};

function AlpacaDashboardWidget({ data }) {
  const { allUserObjects } = useUserManagement();
  const adminUrlBase =
    typeof window !== 'undefined' &&
    window.alpacaSettings &&
    window.alpacaSettings.adminUrl
      ? window.alpacaSettings.adminUrl
      : 'admin.php';

  if (!data) {
    return <div>{__('Loading…', 'alpaca')}</div>;
  }

  const tabs = [
    {
      name: 'assignedToMe',
      title: __('Assigned to Me', 'alpaca'),
      issues: data.assignedToMe,
    },
    {
      name: 'newlyCreated',
      title: __('Latest', 'alpaca'),
      issues: data.newlyCreated,
    },
    {
      name: 'overdue',
      title: __('Overdue', 'alpaca'),
      issues: data.overdue,
    },
  ];

  return (
    <TabPanel
      className="alpaca-dashboard-widget-tabs"
      activeClass="is-active"
      tabs={tabs}
    >
      {(tab) => (
        <div>
          {tab.issues && tab.issues.length > 0 ? (
            <table>
              <tr>
                <th>{__('Issue', 'alpaca')}</th>
                <th></th>
                <th>{__('Due Date', 'alpaca')}</th>
                <th>{__('Assignees', 'alpaca')}</th>
                <th>{__('Status', 'alpaca')}</th>
              </tr>
              {tab.issues.map((issue) => (
                <tr key={issue.id}>
                  <td className="title">
                    <a
                      href={`${adminUrlBase}?page=alpaca-board&issue=${encodeURIComponent(
                        issue.slug || issue.post_name || issue.id,
                      )}`}
                      target="_self"
                    >
                      {issue.title}
                    </a>
                  </td>
                  <td className="high-priority">
                    {issue.high_priority ? <PriorityIcon /> : null}
                  </td>
                  <td className="deadline">{formatDate(issue.deadline)}</td>
                  <td className="assignees">
                    {issue.assignees &&
                      issue.assignees.map((assignee) => {
                        const userObject = allUserObjects.find(
                          (u) => u.slug === assignee.slug,
                        );
                        return userObject ? (
                          <User
                            key={assignee.term_id}
                            user={userObject}
                            showName={false}
                          />
                        ) : null;
                      })}
                  </td>
                  <td className="status">
                    <span className="nowrap">{issue.status[0].name}</span>
                  </td>
                </tr>
              ))}
            </table>
          ) : (
            <p>{__('No issues found.', 'alpaca')}</p>
          )}
        </div>
      )}
    </TabPanel>
  );
}

AlpacaDashboardWidget.propTypes = {
  data: PropTypes.shape({
    assignedToMe: PropTypes.array,
    newlyCreated: PropTypes.array,
    overdue: PropTypes.array,
  }),
};

AlpacaDashboardWidget.displayName = 'AlpacaDashboardWidget';

export default AlpacaDashboardWidget;
