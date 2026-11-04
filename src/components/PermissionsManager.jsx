const { useEffect, useState } = wp.element;
const { __ } = wp.i18n;
const { Notice, SelectControl, Spinner } = wp.components;

const PERMISSIONS_SETTING = 'alpaistr_permissions';

const DEFAULT_PERMISSIONS = Object.fromEntries([
  ['view_board', 'subscriber'],
  ['create_issue', 'contributor'],
  ['edit_issue', 'contributor'],
  ['add_comment', 'subscriber'],
  ['edit_comment', 'contributor'],
  ['change_issue_status', 'contributor'],
  ['change_final_issue_status', 'contributor'],
]);

const ROLE_OPTIONS = window.alpaistrSettings?.permissionRoles || [];

const PERMISSION_FIELDS = [
  {
    key: 'view_board',
    label: __('View the Project Board', 'alpaca-issue-tracker'),
  },
  {
    key: 'create_issue',
    label: __('Create a new issue', 'alpaca-issue-tracker'),
  },
  {
    key: 'edit_issue',
    label: __('Edit issue detail', 'alpaca-issue-tracker'),
  },
  {
    key: 'add_comment',
    label: __('Add a comment', 'alpaca-issue-tracker'),
  },
  {
    key: 'edit_comment',
    label: __('Edit a comment', 'alpaca-issue-tracker'),
  },
  {
    key: 'change_issue_status',
    label: __('Change an issue status', 'alpaca-issue-tracker'),
  },
  {
    key: 'change_final_issue_status',
    label: __('Move issue to final status', 'alpaca-issue-tracker'),
  },
];

/**
 * Permission threshold controls for Alpaca actions.
 *
 * @return {JSX.Element} Permission settings table.
 */
const PermissionsManager = () => {
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    wp.apiFetch({ path: '/wp/v2/settings' })
      .then((settings) => {
        setPermissions({
          ...DEFAULT_PERMISSIONS,
          ...(settings[PERMISSIONS_SETTING] || {}),
        });
      })
      .catch(() => {
        setErrorMessage(
          __('Failed to load permission settings.', 'alpaca-issue-tracker'),
        );
      })
      .finally(() => setIsFetching(false));
  }, []);

  /**
   * Save a changed minimum role and restore its previous value on failure.
   *
   * @param {string} key  Permission setting key.
   * @param {string} role Selected minimum role.
   * @return {void}
   */
  const handleChange = (key, role) => {
    if (isSaving) {
      return;
    }

    const previousPermissions = permissions;
    const nextPermissions = { ...permissions, [key]: role };

    setErrorMessage('');
    setPermissions(nextPermissions);
    setIsSaving(true);

    wp.apiFetch({
      path: '/wp/v2/settings',
      method: 'POST',
      data: { [PERMISSIONS_SETTING]: nextPermissions },
    })
      .catch(() => {
        setPermissions(previousPermissions);
        setErrorMessage(
          __('Failed to save permission settings.', 'alpaca-issue-tracker'),
        );
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <div className="alpaca-permissions-manager">
      <p>
        {__(
          'Choose the minimum user level required for each task.',
          'alpaca-issue-tracker',
        )}
      </p>

      {errorMessage && (
        <Notice
          status="error"
          isDismissible
          onRemove={() => setErrorMessage('')}
        >
          {errorMessage}
        </Notice>
      )}

      {isFetching && <Spinner />}

      {!isFetching && (
        <table className="form-table">
          <tbody>
            {PERMISSION_FIELDS.map(({ key, label }) => (
              <tr key={key}>
                <th scope="row">{label}</th>
                <td>
                  <SelectControl
                    label={label}
                    hideLabelFromVision
                    value={permissions[key]}
                    options={ROLE_OPTIONS}
                    onChange={(role) => handleChange(key, role)}
                    disabled={isSaving}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PermissionsManager;
