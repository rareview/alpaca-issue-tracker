/**
 * Preview and explicitly remove unchanged GitHub setup resources.
 */

const { useState, useEffect } = wp.element;
const { __, sprintf } = wp.i18n;
const { TextControl } = wp.components;

const REST_PATH = '/alpaca/v1/agentic';

/**
 * Review GitHub setup files, then remove only the unchanged ones.
 *
 * @param {Object}  props           Component props.
 * @param {string}  props.repo      Configured repository.
 * @param {boolean} props.showTitle Whether to render the section heading.
 * @return {JSX.Element} Cleanup controls.
 */
const GithubCleanup = ({ repo, showTitle = true }) => {
  const [preview, setPreview] = useState(null);
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    setPreview(null);
    setConfirmation('');
    setResult(null);
  }, [repo]);

  const loadPreview = async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const response = await wp.apiFetch({
        path: `${REST_PATH}/github-cleanup`,
      });
      setPreview(response);
      setConfirmation('');
    } catch (requestError) {
      setError(
        requestError?.message ||
          __('Could not inspect GitHub setup.', 'alpaca-issue-tracker'),
      );
    } finally {
      setBusy(false);
    }
  };

  const removeSetup = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await wp.apiFetch({
        path: `${REST_PATH}/github-cleanup`,
        method: 'POST',
        /* eslint-disable camelcase -- REST API uses snake_case field names. */
        data: { confirm_repo: confirmation },
        /* eslint-enable camelcase */
      });
      setResult(response);
      setPreview(null);
      setConfirmation('');
    } catch (requestError) {
      setError(
        requestError?.message ||
          __('Could not remove GitHub setup.', 'alpaca-issue-tracker'),
      );
    } finally {
      setBusy(false);
    }
  };

  const files = preview?.files || [];
  const canRemove =
    files.length > 0 || !!preview?.variable || !!preview?.setup_branch;

  return (
    <section
      className="agentic-cleanup"
      aria-labelledby={showTitle ? 'agentic-cleanup-title' : undefined}
    >
      {showTitle ? (
        <h2 id="agentic-cleanup-title">
          {__('Remove GitHub setup', 'alpaca-issue-tracker')}
        </h2>
      ) : null}
      <p>
        {__(
          'Uninstalling this plugin never changes GitHub. Review the repository configuration files before removing them.',
          'alpaca-issue-tracker',
        )}
      </p>
      {!preview ? (
        <button
          type="button"
          className="button button-secondary"
          disabled={busy}
          onClick={loadPreview}
        >
          {busy
            ? __('Reviewing…', 'alpaca-issue-tracker')
            : __('Review GitHub resources', 'alpaca-issue-tracker')}
        </button>
      ) : (
        <div className="agentic-cleanup-preview">
          <p>
            <strong>{preview.repo}</strong> · {preview.default_branch}
          </p>
          <h3>{__('Will be removed', 'alpaca-issue-tracker')}</h3>
          {canRemove ? (
            <ul>
              {files.map((file) => (
                <li key={file.path}>
                  <code>{file.path}</code>
                </li>
              ))}
              {preview.variable ? (
                <li>
                  <code>ALPACA_AI_TARGET_BRANCH</code>{' '}
                  {__(
                    'Actions variable (the branch itself is kept)',
                    'alpaca-issue-tracker',
                  )}
                </li>
              ) : null}
              {preview.setup_branch ? (
                <li>
                  {__('Setup branch:', 'alpaca-issue-tracker')}{' '}
                  <code>{preview.setup_branch}</code>
                </li>
              ) : null}
            </ul>
          ) : (
            <p>
              {__(
                'No plugin resources were found in this repository.',
                'alpaca-issue-tracker',
              )}
            </p>
          )}
          <h3>{__('Requires manual removal', 'alpaca-issue-tracker')}</h3>
          <ul>
            <li>
              {__(
                'Repository secrets and existing issues, labels, and pull requests',
                'alpaca-issue-tracker',
              )}
            </li>
            {preview.setup_pr_url ? (
              <li>
                <a
                  href={preview.setup_pr_url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {__('Setup pull request', 'alpaca-issue-tracker')}
                </a>{' '}
                {__(
                  '— GitHub cannot delete a pull request. Removing the setup branch closes it.',
                  'alpaca-issue-tracker',
                )}
              </li>
            ) : null}
          </ul>
          {canRemove ? (
            <>
              <TextControl
                label={__(
                  'Type the repository name to confirm',
                  'alpaca-issue-tracker',
                )}
                help={preview.repo}
                value={confirmation}
                onChange={setConfirmation}
              />
              <button
                type="button"
                className="button button-secondary"
                disabled={busy || confirmation !== preview.repo}
                onClick={removeSetup}
              >
                {busy
                  ? __('Removing…', 'alpaca-issue-tracker')
                  : __('Remove GitHub setup', 'alpaca-issue-tracker')}
              </button>
            </>
          ) : null}
        </div>
      )}
      {error ? (
        <p className="agentic-result-error" role="alert">
          {error}
        </p>
      ) : null}
      {result ? (
        <div role={result.errors?.length ? 'alert' : 'status'}>
          <p>
            {sprintf(
              /* translators: %d: number of GitHub resources removed. */
              __('Removed %d GitHub resources.', 'alpaca-issue-tracker'),
              result.removed.length,
            )}
          </p>
          {result.removed?.length ? (
            <ul>
              {result.removed.map((item) => (
                <li key={item}>
                  <code>{item}</code>
                </li>
              ))}
            </ul>
          ) : null}
          {result.errors?.length ? (
            <>
              <strong>{__('Could not remove', 'alpaca-issue-tracker')}</strong>
              <ul>
                {result.errors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          ) : null}
          <p>
            {__(
              'Also review repository secrets and existing issues, labels, and pull requests in GitHub.',
              'alpaca-issue-tracker',
            )}
          </p>
        </div>
      ) : null}
    </section>
  );
};

export default GithubCleanup;
