const { memo } = wp.element;
const { TabPanel } = wp.components;
const { __ } = wp.i18n;
import PropTypes from 'prop-types';
import User from './components/User';
import useUserManagement from './hooks/useUserManagement';
import PriorityIcon from './components/icons/PriorityIcon';

/**
 * Format a date string for display in the dashboard widget.
 *
 * @param {string} dateString - ISO date string.
 * @return {string|null} Formatted date or null.
 */
const formatDate = (dateString) => {
  if (!dateString) return null;

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateString));
};

/**
 * Dashboard widget component showing assigned, latest, overdue, and watchlist issues.
 *
 * @param {Object} root0      - Props object
 * @param {Object} root0.data - Widget data (assignedToMe, newlyCreated, overdue, watchlist)
 * @return {JSX.Element} Dashboard widget
 */
const AlpacaDashboardWidget = memo(function AlpacaDashboardWidget({ data }) {
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
    {
      name: 'watchlist',
      title: __('Watchlist', 'alpaca'),
      issues: data.watchlist,
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
              <thead>
                <tr>
                  <th scope="col">{__('Issue', 'alpaca')}</th>
                  <th scope="col" aria-hidden="true" />
                  <th scope="col">{__('Due Date', 'alpaca')}</th>
                  <th scope="col">{__('Assignees', 'alpaca')}</th>
                  <th scope="col">{__('Status', 'alpaca')}</th>
                </tr>
              </thead>
              <tbody>
                {tab.issues.map((issue) => (
                  <tr key={issue.id}>
                    <td className="title">
                      <a
                        href={`${adminUrlBase}?page=project-board&issue=${encodeURIComponent(
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
                      <span className="nowrap">
                        {issue.status && issue.status[0]
                          ? issue.status[0].name
                          : ''}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>{__('No issues found.', 'alpaca')}</p>
          )}
        </div>
      )}
    </TabPanel>
  );
});

AlpacaDashboardWidget.propTypes = {
  data: PropTypes.shape({
    assignedToMe: PropTypes.array,
    newlyCreated: PropTypes.array,
    overdue: PropTypes.array,
    watchlist: PropTypes.array,
  }),
};

AlpacaDashboardWidget.displayName = 'AlpacaDashboardWidget';

export default AlpacaDashboardWidget;
