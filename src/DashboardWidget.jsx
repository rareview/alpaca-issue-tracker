import PropTypes from 'prop-types';
const { TabPanel } = wp.components;
const { __ } = wp.i18n;
import User from './components/User';
import useUserManagement from './hooks/useUserManagement';

const formatDate = (dateString) => {
  if (!dateString) {
    return null;
  }
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });

  return `${day} ${month}`;
};

function AlpacaDashboardWidget({ data }) {
  const { allUserObjects } = useUserManagement();

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
      title: __('Newly Created', 'alpaca'),
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
            <table className="widefat striped">
              <tr>
                <th>Issue</th>
                <th>Submitted</th>
                <th>Deadline</th>
                <th>Assignees</th>
                <th>Status</th>
              </tr>
              {tab.issues.map((issue) => (
                <tr key={issue.id}>
                  <td className="title">
                    <a href={issue.url}>{issue.title}</a>
                  </td>
                  <td className="postdate">{formatDate(issue.postDate)}</td>
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
                  <td className="status">{issue.status[0].name}</td>
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
