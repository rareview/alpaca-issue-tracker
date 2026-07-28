/**
 * AI Issue Resolver settings wizard.
 *
 * Mounted on #alpaca-ai-issue-resolver-page.
 */
import PropTypes from 'prop-types';
import useUserManagement from './hooks/useUserManagement';

const { useState, useEffect, useCallback, useMemo } = wp.element;
const { __ } = wp.i18n;
const { Spinner, Notice, FormTokenField, ComboboxControl } = wp.components;

const REST_PATH = '/alpaca/v1/agentic';

const STEP_LABELS = {
  1: __('Enable', 'alpaca-issue-tracker'),
  2: __('Add Users', 'alpaca-issue-tracker'),
  3: __('Setup GitHub', 'alpaca-issue-tracker'),
  4: __('Finish Setup', 'alpaca-issue-tracker'),
};

const emptyForm = () => ({
  enabled: false,
  aiProvider: 'claude',
  aiApiKey: '',
  githubRepo: '',
  githubToken: '',
  setupChecklist: [],
  engineers: [],
  // Empty string = None (not mapped to a GitHub branch).
  branches: {
    staging: '',
    production: '',
  },
});

const BRANCH_ROLES = [
  {
    key: 'staging',
    label: __('Staging environment', 'alpaca-issue-tracker'),
  },
  {
    key: 'production',
    label: __('Production environment', 'alpaca-issue-tracker'),
  },
];

/**
 * Build ComboboxControl options: placeholder + repo branch names.
 *
 * @param {string[]} repoBranches Branch names from GitHub.
 * @param {string}   selected     Currently saved value (kept in options even if not in list).
 * @return {Array<{value: string, label: string}>} Options.
 */
const buildBranchOptions = (repoBranches, selected) => {
  const names = new Set(repoBranches);
  if (selected) {
    names.add(selected);
  }

  const options = [
    {
      value: '',
      label: __('Select a branch…', 'alpaca-issue-tracker'),
    },
  ];
  [...names]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .forEach((name) => {
      options.push({ value: name, label: name });
    });

  return options;
};

/**
 * @param {Object}  props         Component props.
 * @param {string}  props.label   Accessible label.
 * @param {*}       props.tooltip Tooltip content.
 * @param {boolean} [props.wide]  Wider tooltip.
 * @return {JSX.Element} Help tip control.
 */
const HelpTip = ({ label, tooltip, wide = false }) => (
  <span
    className="agentic-help-tip"
    tabIndex={0}
    role="button"
    aria-label={label}
  >
    <span className="dashicons dashicons-editor-help" aria-hidden="true" />
    <span
      className={`agentic-help-tip__tooltip${wide ? ' agentic-help-tip__tooltip--wide' : ''}`}
      role="tooltip"
    >
      {tooltip}
    </span>
  </span>
);

HelpTip.propTypes = {
  label: PropTypes.string.isRequired,
  tooltip: PropTypes.node.isRequired,
  wide: PropTypes.bool,
};

/**
 * @param {Object} data Client settings payload from REST.
 * @return {Object} Step done/locked map.
 */
const getStepStates = (data) => {
  const enabled = !!data.enabled;
  const githubConfigured =
    !!data.github_repo && !!data.github_token_set && !!data.ai_api_key_set;
  const workflowInstalled = !!data.workflow_installed;
  const checklistCount = Array.isArray(data.setup_checklist)
    ? data.setup_checklist.length
    : 0;

  return {
    1: { done: enabled, locked: false },
    // Optional step: unlocked once enabled; does not block later setup steps.
    2: { done: enabled, locked: !enabled },
    3: {
      done: enabled && githubConfigured && workflowInstalled,
      locked: !enabled,
    },
    4: {
      done:
        enabled && githubConfigured && workflowInstalled && checklistCount >= 2,
      locked: !(enabled && githubConfigured && workflowInstalled),
    },
  };
};

/**
 * @param {Object} stepStates Step state map.
 * @return {number} First incomplete unlocked step.
 */
const getActiveStep = (stepStates) => {
  for (const step of [1, 2, 3, 4]) {
    if (!stepStates[step].done && !stepStates[step].locked) {
      return step;
    }
  }
  return 4;
};

/**
 * @param {Object} props      Component props.
 * @param {string} props.repo Repository slug.
 * @return {JSX.Element} Install intro paragraph.
 */
const RepoInstallMessage = ({ repo }) => {
  /* translators: %s: GitHub repository slug (owner/repo). */
  const template = __(
    'Open a pull request to add the required GitHub Actions files to the %s repository.',
    'alpaca-issue-tracker',
  );
  const parts = template.split('%s');
  return (
    <p>
      {parts[0]}
      <strong>{repo}</strong>
      {parts[1] || ''}
    </p>
  );
};

RepoInstallMessage.propTypes = {
  repo: PropTypes.string.isRequired,
};

/**
 * @param {Object}   props                Component props.
 * @param {number[]} props.engineerIds    Currently selected user IDs.
 * @param {Object[]} props.allUserObjects Available users (id, name, slug, avatar).
 * @param {Function} props.onChange       Called with the new array of user IDs.
 * @return {JSX.Element} Autosuggest control for the engineers allowlist.
 */
const EngineersField = ({ engineerIds, allUserObjects, onChange }) => {
  const usersById = useMemo(() => {
    const map = new Map();
    (allUserObjects || []).forEach((userObject) => map.set(userObject.id, userObject));
    return map;
  }, [allUserObjects]);

  const usersByToken = useMemo(() => {
    const map = new Map();
    (allUserObjects || []).forEach((userObject) => {
      map.set(userObject.name, userObject);
      map.set(userObject.slug, userObject);
    });
    return map;
  }, [allUserObjects]);

  const tokens = useMemo(
    () =>
      engineerIds
        .map((id) => usersById.get(id)?.name)
        .filter((name) => !!name),
    [engineerIds, usersById],
  );

  const handleChange = useCallback(
    (newTokens) => {
      const ids = newTokens
        .map((token) => usersByToken.get(token)?.id)
        .filter((id) => !!id);
      onChange([...new Set(ids)]);
    },
    [usersByToken, onChange],
  );

  return (
    <FormTokenField
      label=""
      placeholder={__('Start typing a username…', 'alpaca-issue-tracker')}
      value={tokens}
      suggestions={(allUserObjects || []).map((userObject) => userObject.name)}
      onChange={handleChange}
      __nextHasNoMarginBottom
      __next40pxDefaultSize
    />
  );
};

EngineersField.propTypes = {
  engineerIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  allUserObjects: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

/**
 * AI Issue Resolver admin screen.
 *
 * @return {JSX.Element} Wizard screen.
 */
const AgenticSettings = () => {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noAccess, setNoAccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [focusedStep, setFocusedStep] = useState(1);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [branchSaveStatus, setBranchSaveStatus] = useState('idle'); // Save in progress.
  const [setupCompletedStatus, setSetupCompletedStatus] = useState('idle'); // Saved.
  const [installing, setInstalling] = useState(false);
  const [installError, setInstallError] = useState('');
  const [repoBranches, setRepoBranches] = useState([]);
  const { allUserObjects } = useUserManagement();

  const applySettings = useCallback((payload, advanceToActive = false) => {
    setData(payload);
    const savedBranches = payload.branches || {};
    setForm({
      enabled: !!payload.enabled,
      aiProvider: payload.ai_provider || 'claude',
      aiApiKey: '',
      githubRepo: payload.github_repo || '',
      githubToken: '',
      setupChecklist: Array.isArray(payload.setup_checklist)
        ? payload.setup_checklist.map(Number)
        : [],
      engineers: Array.isArray(payload.engineers)
        ? payload.engineers.map(Number)
        : [],
      branches: {
        staging: savedBranches.staging || '',
        production: savedBranches.production || '',
      },
    });
    if (true === advanceToActive) {
      setFocusedStep(getActiveStep(getStepStates(payload)));
    } else if ('number' === typeof advanceToActive) {
      setFocusedStep(advanceToActive);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    wp.apiFetch({ path: `${REST_PATH}/settings` })
      .then((payload) => {
        if (!cancelled) {
          applySettings(payload, true);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (403 === err?.data?.status) {
            setNoAccess(true);
          } else {
            setError(
              err?.message ||
                __('Failed to load settings.', 'alpaca-issue-tracker'),
            );
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [applySettings]);

  const stepStates = useMemo(
    () =>
      data
        ? getStepStates(data)
        : {
            1: { done: false, locked: false },
            2: { done: false, locked: true },
            3: { done: false, locked: true },
            4: { done: false, locked: true },
          },
    [data],
  );

  // !! to make sure it's a boolean, and avoid undefined values.
  const allDone =
    !!stepStates[1]?.done &&
    !!stepStates[2]?.done &&
    !!stepStates[3]?.done &&
    !!stepStates[4]?.done;

  // Branch fields unlock only after a successful connection test + branch fetch.
  const canManageBranches =
    'agentic-result-success' === testResult?.className;

  const updateForm = useCallback((patch) => {
    setForm((existing) => ({ ...existing, ...patch }));
  }, []);

  // Converts the React form data and builds the object sent to the API when saving settings
  const buildSavePayload = useCallback(() => {
    /* eslint-disable camelcase -- REST API uses snake_case field names. */
    const payload = {
      enabled: !!form.enabled,
      ai_provider: form.aiProvider || 'claude',
      github_repo: form.githubRepo || '',
      setup_checklist: form.setupChecklist,
      engineers: form.engineers,
      branches: {
        staging: form.branches?.staging || '',
        production: form.branches?.production || '',
      },
      // Incomplete: preserve existing value on save; no wizard field to edit project_context yet.
      project_context: data?.project_context || '',
    };
    if (form.aiApiKey) {
      payload.ai_api_key = form.aiApiKey;
    }
    if (form.githubToken) {
      payload.github_token = form.githubToken;
    }
    /* eslint-enable camelcase */
    return payload;
  }, [form, data]);

  const updateBranchRole = useCallback((role, value) => {
    setBranchSaveStatus('idle');
    setForm((existing) => ({
      ...existing,
      branches: {
        ...existing.branches,
        [role]: value || '',
      },
    }));
  }, []);

  const saveSettings = useCallback(
    async (advance = false) => {
      setSaving(true);
      setError('');
      try {
        const payload = await wp.apiFetch({
          path: `${REST_PATH}/settings`,
          method: 'POST',
          data: buildSavePayload(),
        });
        applySettings(payload, advance);
        return payload;
      } catch (err) {
        setError(
          err?.message ||
            __('Could not save settings.', 'alpaca-issue-tracker'),
        );
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [applySettings, buildSavePayload],
  );

  const saveBranchMapping = useCallback(async () => {
    setBranchSaveStatus('saving');
    try {
      await saveSettings(false);
      setBranchSaveStatus('saved');
    } catch (_err) {
      setBranchSaveStatus('error');
    }
  }, [saveSettings]);

  const saveFinishSetup = useCallback(async () => {
    setSetupCompletedStatus('saving');
    try {
      await saveSettings(true);
      setSetupCompletedStatus('saved');
    } catch (_err) {
      setSetupCompletedStatus('error');
    }
  }, [saveSettings]);

  const testGithubConnectionAndFetchBranches = useCallback(async () => {
    setTesting(true);
    setTestResult({
      message: __(
        'Connecting to GitHub and fetching branches…',
        'alpaca-issue-tracker',
      ),
      className: 'agentic-result-pending',
    });
    try {
      await saveSettings(false);
      // Also returns up to 100 branch names for the selectors below.
      const result = await wp.apiFetch({
        path: `${REST_PATH}/test-github`,
        method: 'POST',
        data: {},
      });
      setRepoBranches(
        Array.isArray(result?.branches) ? result.branches : [],
      );
      setTestResult({
        message: result?.message || __('Connected.', 'alpaca-issue-tracker'),
        className: 'agentic-result-success',
      });
    } catch (err) {
      setRepoBranches([]);
      setTestResult({
        message:
          err?.message || __('Connection failed.', 'alpaca-issue-tracker'),
        className: 'agentic-result-error',
      });
    } finally {
      setTesting(false);
    }
  }, [saveSettings]);

  const handleInstall = useCallback(async () => {
    setInstalling(true);
    setInstallError('');
    try {
      await saveSettings(false);
      const result = await wp.apiFetch({
        path: `${REST_PATH}/install-workflow`,
        method: 'POST',
        data: {},
      });
      if (result?.pr_url || result?.already_installed) {
        const payload = await wp.apiFetch({ path: `${REST_PATH}/settings` });
        applySettings(payload, false);
        setFocusedStep(4);
        return;
      }
      setInstallError(
        __(
          'GitHub Actions files were committed but the pull request could not be opened. Please open one manually from branch alpaca/ai-development.',
          'alpaca-issue-tracker',
        ),
      );
    } catch (err) {
      setInstallError(
        err?.message ||
          __('Could not open pull request.', 'alpaca-issue-tracker'),
      );
    } finally {
      setInstalling(false);
    }
  }, [applySettings, saveSettings]);

  const toggleChecklist = useCallback((key) => {
    setSetupCompletedStatus('idle');
    setForm((prev) => {
      const current = prev.setupChecklist;
      const next = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];
      return { ...prev, setupChecklist: next };
    });
  }, []);

  const handleEngineersChange = useCallback((ids) => {
    updateForm({ engineers: ids });
  }, [updateForm]);

  if (loading) {
    return (
      <div className="agentic-wizard-loading">
        <Spinner />
      </div>
    );
  }

  if (noAccess) {
    return (
      <div className="agentic-wizard-inner">
        <h1 className="agentic-wizard-title">
          {__('AI Issue Resolver', 'alpaca-issue-tracker')}
        </h1>
        <Notice status="warning" isDismissible={false}>
          {__(
            'The AI Issue Fixer is only available to administrators and users granted engineer access. Contact your site administrator if you need access.',
            'alpaca-issue-tracker',
          )}
        </Notice>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="notice notice-error inline">
        <p>{error || __('Failed to load settings.', 'alpaca-issue-tracker')}</p>
      </div>
    );
  }

  const canEdit = !!data.can_edit;
  const panelLocked = !allDone && !!stepStates[focusedStep]?.locked;
  const githubConfigured =
    !!data.github_repo && !!data.github_token_set && !!data.ai_api_key_set;
  const workflowInstalled = !!data.workflow_installed;
  const prUrl = data.workflow_pr_url || '';
  const secretsUrl = data.repo_secrets_url || '';
  const actionsUrl = data.repo_actions_url || '';

  const checklistItems = [
    {
      key: 1,
      node: prUrl ? (
        <span>
          {__('Merge the pull request on GitHub: ', 'alpaca-issue-tracker')}
          <a href={prUrl} target="_blank" rel="noreferrer noopener">
            {prUrl}
          </a>
        </span>
      ) : (
        __(
          'Merge the Alpaca AI Development pull request on GitHub',
          'alpaca-issue-tracker',
        )
      ),
    },
    {
      key: 2,
      node: secretsUrl ? (
        <span>
          {__('Add ', 'alpaca-issue-tracker')}
          <code>CLAUDE_CODE_OAUTH_TOKEN</code>
          {__(' to ', 'alpaca-issue-tracker')}
          <a href={secretsUrl} target="_blank" rel="noreferrer noopener">
            {__('repository secrets', 'alpaca-issue-tracker')}
          </a>
        </span>
      ) : (
        __(
          'Add CLAUDE_CODE_OAUTH_TOKEN to repository secrets',
          'alpaca-issue-tracker',
        )
      ),
    },
    {
      key: 3,
      node: secretsUrl ? (
        <span>
          {__('(Optional) Add ', 'alpaca-issue-tracker')}
          <code>ANTHROPIC_API_KEY</code>
          {__(' to ', 'alpaca-issue-tracker')}
          <a href={secretsUrl} target="_blank" rel="noreferrer noopener">
            {__('repository secrets', 'alpaca-issue-tracker')}
          </a>
          {__(' for automated code review', 'alpaca-issue-tracker')}
        </span>
      ) : (
        __(
          '(Optional) Add ANTHROPIC_API_KEY to repository secrets for automated code review',
          'alpaca-issue-tracker',
        )
      ),
    },
    {
      key: 4,
      node: actionsUrl ? (
        <span>
          {__('Run ', 'alpaca-issue-tracker')}
          <a href={actionsUrl} target="_blank" rel="noreferrer noopener">
            {__(
              'Actions → Setup Labels → Run workflow',
              'alpaca-issue-tracker',
            )}
          </a>
          {__(' once to create all labels', 'alpaca-issue-tracker')}
        </span>
      ) : (
        __(
          'Run Actions → Setup Labels → Run workflow once to create all labels',
          'alpaca-issue-tracker',
        )
      ),
    },
  ];

  return (
    <div
      className={`agentic-wizard-inner${allDone ? ' agentic-wizard-all-done' : ''}`}
      data-agentic-all-done={allDone ? '1' : undefined}
    >
      <h1 className="agentic-wizard-title">
        {__('AI Issue Resolver', 'alpaca-issue-tracker')}
      </h1>
      <p className="agentic-wizard-tagline">
        {__(
          'Let the AI agents automatically solve your Alpaca issues on Github',
          'alpaca-issue-tracker',
        )}
        <sup aria-hidden="true">*</sup>
      </p>

      {!canEdit && data.is_engineer ? (
        <Notice status="info" isDismissible={false}>
          {__(
            'You have AI Issue Fixer access and can view setup status below. Only administrators can change these settings.',
            'alpaca-issue-tracker',
          )}
        </Notice>
      ) : null}

      {error ? (
        <div className="notice notice-error inline">
          <p>{error}</p>
        </div>
      ) : null}

      {allDone ? (
        <div className="agentic-all-done-banner">
          <div className="agentic-all-done-icon" aria-hidden="true">
            ✓
          </div>
          <div className="agentic-all-done-copy">
            <h2 className="agentic-all-done-heading">
              {__("You're all set!", 'alpaca-issue-tracker')}
            </h2>
            <p className="agentic-all-done-sub">
              {__(
                'The AI agent is ready. Apply the agent-ready label to any GitHub issue to get started.',
                'alpaca-issue-tracker',
              )}
            </p>
          </div>
        </div>
      ) : null}

      <div
        className={`agentic-step-indicators${allDone ? ' agentic-indicators-all-done' : ''}`}
        role="tablist"
      >
        {[1, 2, 3, 4].map((num) => {
          const state = stepStates[num] || { done: false, locked: true };
          const isDone = allDone || state.done;
          const isActive = num === focusedStep;
          const isLocked = !allDone && state.locked;
          const classes = ['agentic-step-indicator'];
          if (isDone) {
            classes.push('agentic-indicator-done');
          }
          if (isActive) {
            classes.push('agentic-indicator-active');
          }
          if (isLocked) {
            classes.push('agentic-indicator-locked');
          }

          return (
            <button
              key={num}
              type="button"
              className={classes.join(' ')}
              role="tab"
              aria-selected={isActive ? 'true' : 'false'}
              onClick={() => setFocusedStep(num)}
            >
              <span className="agentic-indicator-badge">
                {isDone ? '✓' : String(num)}
              </span>
              <span className="agentic-indicator-label">
                {STEP_LABELS[num]}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`agentic-wizard-panel ${panelLocked ? 'agentic-step-locked' : 'agentic-step-active'}`}
      >
        {1 === focusedStep ? (
          <fieldset
            disabled={panelLocked || !canEdit}
            className={
              panelLocked || !canEdit ? 'agentic-fieldset-disabled' : undefined
            }
          >
            <h2 className="agentic-panel-title">
              {__('Enable', 'alpaca-issue-tracker')}
            </h2>
            {panelLocked ? (
              <p className="agentic-locked-notice">
                {__(
                  'Complete the previous steps to unlock this step.',
                  'alpaca-issue-tracker',
                )}
              </p>
            ) : null}

            <label
              htmlFor="agentic-enable-toggle"
              className="agentic-toggle-label"
            >
              <input
                id="agentic-enable-toggle"
                type="checkbox"
                className="agentic-toggle-input"
                checked={!!form.enabled}
                onChange={(event) =>
                  updateForm({ enabled: event.target.checked })
                }
              />
              <span className="agentic-toggle-track" />
              <span className="agentic-toggle-text" aria-hidden="true">
                <span className="agentic-toggle-state agentic-toggle-state--off">
                  {__('Off', 'alpaca-issue-tracker')}
                </span>
                <span className="agentic-toggle-state agentic-toggle-state--on">
                  {__('On', 'alpaca-issue-tracker')}
                </span>
              </span>
              <span className="screen-reader-text">
                {__('Enable', 'alpaca-issue-tracker')}
              </span>
            </label>

            <p>
              {__(
                'Set up the AI provider used by the plugin for preparing human-written Alpaca issues to be sent to GitHub.',
                'alpaca-issue-tracker',
              )}{' '}
              <HelpTip
                label={__('More information', 'alpaca-issue-tracker')}
                tooltip={__(
                  'This is different from the AI used on GitHub to resolve issues and create pull requests, though you can use the same key for both.',
                  'alpaca-issue-tracker',
                )}
              />
            </p>

            <fieldset
              className={`agentic-ai-provider-fields${form.enabled ? '' : ' agentic-fieldset-disabled'}`}
              disabled={!form.enabled}
            >
              <legend className="screen-reader-text">
                {__('AI provider settings', 'alpaca-issue-tracker')}
              </legend>
              <table className="form-table" role="presentation">
                <tbody>
                  <tr>
                    <th scope="row">
                      <label htmlFor="agentic-ai-provider">
                        {__('AI Provider', 'alpaca-issue-tracker')}
                      </label>
                    </th>
                    <td>
                      <select
                        id="agentic-ai-provider"
                        value={form.aiProvider || 'claude'}
                        disabled={!form.enabled}
                        onChange={(event) =>
                          updateForm({ aiProvider: event.target.value })
                        }
                      >
                        <option value="claude">Claude (Anthropic)</option>
                        <option value="openai">OpenAI / GPT-4o</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <label htmlFor="agentic-ai-api-key">
                        {__('AI API Key', 'alpaca-issue-tracker')}
                      </label>
                    </th>
                    <td>
                      {data.ai_api_key_from_constant ? (
                        <>
                          <input
                            type="password"
                            id="agentic-ai-api-key"
                            value=""
                            className="regular-text"
                            disabled
                          />
                          <p className="description">
                            {__(
                              'Defined via ALPAISTR_AGENTIC_AI_API_KEY constant.',
                              'alpaca-issue-tracker',
                            )}
                          </p>
                        </>
                      ) : (
                        <>
                          <input
                            type="password"
                            id="agentic-ai-api-key"
                            value={form.aiApiKey}
                            className="regular-text"
                            autoComplete="off"
                            disabled={!form.enabled}
                            placeholder={
                              data.ai_api_key_set
                                ? __(
                                    '•••••••• (saved — leave blank to keep)',
                                    'alpaca-issue-tracker',
                                  )
                                : ''
                            }
                            onChange={(event) =>
                              updateForm({ aiApiKey: event.target.value })
                            }
                          />
                          <p className="description">
                            {__(
                              'Used to draft agent-ready issues from Alpaca cards.',
                              'alpaca-issue-tracker',
                            )}
                          </p>
                        </>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </fieldset>

            <div className="agentic-step-actions">
              <button
                type="button"
                className="button button-primary"
                disabled={saving || panelLocked || !canEdit}
                onClick={() => saveSettings(2)}
              >
                {saving
                  ? __('Saving…', 'alpaca-issue-tracker')
                  : __('Save & continue', 'alpaca-issue-tracker')}
              </button>
            </div>
          </fieldset>
        ) : null}

        {2 === focusedStep ? (
          <fieldset
            disabled={panelLocked || !canEdit}
            className={
              panelLocked || !canEdit ? 'agentic-fieldset-disabled' : undefined
            }
          >
            <h2 className="agentic-panel-title">
              {__('Add Users', 'alpaca-issue-tracker')}
            </h2>
            {panelLocked ? (
              <p className="agentic-locked-notice">
                {__(
                  'Complete Step 1 to unlock this step.',
                  'alpaca-issue-tracker',
                )}
              </p>
            ) : null}

            {data.is_admin ? (
              <>
                <p className="description">
                  {__(
                    'Users added here can send Alpaca issues to the AI agent for resolving on GitHub (see disclaimer below).',
                    'alpaca-issue-tracker',
                  )}
                </p>
                <EngineersField
                  engineerIds={form.engineers}
                  allUserObjects={allUserObjects}
                  onChange={handleEngineersChange}
                />
              </>
            ) : (
              <p>
                {__(
                  'Only administrators can manage who has access to the AI Issue Fixer.',
                  'alpaca-issue-tracker',
                )}
              </p>
            )}

            <div className="agentic-step-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setFocusedStep(1)}
              >
                {__('Back', 'alpaca-issue-tracker')}
              </button>
              {data.is_admin ? (
                <button
                  type="button"
                  className="button button-primary"
                  disabled={saving || panelLocked || !canEdit}
                  onClick={() => saveSettings(3)}
                >
                  {saving
                    ? __('Saving…', 'alpaca-issue-tracker')
                    : __('Save & continue', 'alpaca-issue-tracker')}
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setFocusedStep(3)}
                >
                  {__('Continue', 'alpaca-issue-tracker')}
                </button>
              )}
            </div>
          </fieldset>
        ) : null}

        {3 === focusedStep ? (
          <fieldset
            disabled={panelLocked || !canEdit}
            className={
              panelLocked || !canEdit ? 'agentic-fieldset-disabled' : undefined
            }
          >
            <h2 className="agentic-panel-title">
              {__('Setup GitHub', 'alpaca-issue-tracker')}
            </h2>
            {panelLocked ? (
              <p className="agentic-locked-notice">
                {__(
                  'Complete Step 1 to unlock this step.',
                  'alpaca-issue-tracker',
                )}
              </p>
            ) : null}

            <p>
              {__(
                'Enter your GitHub repository and credentials.',
                'alpaca-issue-tracker',
              )}{' '}
              <HelpTip
                label={__('Token permissions', 'alpaca-issue-tracker')}
                wide
                tooltip={
                  <>
                    {__(
                      'The token needs Issues, Contents, and Workflows write access (classic PAT: repo + workflow scopes).',
                      'alpaca-issue-tracker',
                    )}
                    <br />
                    <br />
                    {__(
                      'Fine-grained PAT permissions:',
                      'alpaca-issue-tracker',
                    )}
                    <br />
                    {__('Contents — Read and write', 'alpaca-issue-tracker')}
                    <br />
                    {__('Issues — Read and write', 'alpaca-issue-tracker')}
                    <br />
                    {__(
                      'Metadata — Read-only (required)',
                      'alpaca-issue-tracker',
                    )}
                    <br />
                    {__(
                      'Pull requests — Read and write',
                      'alpaca-issue-tracker',
                    )}
                    <br />
                    {__('Workflows — Read and write', 'alpaca-issue-tracker')}
                  </>
                }
              />
            </p>

            <table className="form-table" role="presentation">
              <tbody>
                <tr>
                  <th scope="row">
                    <label htmlFor="agentic-github-repo">
                      {__('Repository (owner/repo)', 'alpaca-issue-tracker')}
                    </label>
                  </th>
                  <td>
                    <input
                      type="text"
                      id="agentic-github-repo"
                      className="regular-text"
                      placeholder="owner/repo"
                      value={form.githubRepo}
                      onChange={(event) =>
                        updateForm({ githubRepo: event.target.value })
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="agentic-github-token">
                      {__(
                        'Personal Access Token (PAT)',
                        'alpaca-issue-tracker',
                      )}
                    </label>
                  </th>
                  <td>
                    {data.github_token_from_constant ? (
                      <>
                        <input
                          type="password"
                          id="agentic-github-token"
                          value=""
                          className="regular-text"
                          disabled
                        />
                        <p className="description">
                          {__(
                            'Defined via ALPAISTR_AGENTIC_GITHUB_TOKEN constant.',
                            'alpaca-issue-tracker',
                          )}
                        </p>
                      </>
                    ) : (
                      <input
                        type="password"
                        id="agentic-github-token"
                        className="regular-text"
                        autoComplete="off"
                        value={form.githubToken}
                        placeholder={
                          data.github_token_set
                            ? __(
                                '•••••••• (saved — leave blank to keep)',
                                'alpaca-issue-tracker',
                              )
                            : ''
                        }
                        onChange={(event) =>
                          updateForm({ githubToken: event.target.value })
                        }
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="agentic-step-actions">
              <button
                type="button"
                className="button button-primary"
                disabled={saving || testing || panelLocked}
                onClick={testGithubConnectionAndFetchBranches}
              >
                {testing
                  ? __('Connecting…', 'alpaca-issue-tracker')
                  : __('Test connection & fetch branches', 'alpaca-issue-tracker')}
              </button>
              {testResult ? (
                <span
                  className={`agentic-connection-result ${testResult.className}`}
                >
                  {testResult.message}
                </span>
              ) : null}
            </div>

            <p className="agentic-branch-intro">
              {__(
                'Select remote branches for each environment.',
                'alpaca-issue-tracker',
              )}{' '}
              <HelpTip
                label={__('Branch mapping guidance', 'alpaca-issue-tracker')}
                wide
                tooltip={__(
                  'At least one environment must have a branch assigned so the AI has a target for creating pull requests.',
                  'alpaca-issue-tracker',
                )}
              />
            </p>

            <fieldset
              className={`agentic-branch-section${canManageBranches ? '' : ' agentic-fieldset-disabled'}`}
              disabled={!canManageBranches}
            >
              <table className="form-table" role="presentation">
                <tbody>
                  {BRANCH_ROLES.map(({ key, label }, index) => (
                    <tr key={key}>
                      <th scope="row">
                        <label htmlFor={`agentic-branch-${key}`}>
                          {label}
                        </label>
                      </th>
                      <td>
                        <div className="agentic-branch-field">
                          <ComboboxControl
                            id={`agentic-branch-${key}`}
                            hideLabelFromVision
                            label={label}
                            value={form.branches?.[key] || ''}
                            options={buildBranchOptions(
                              repoBranches,
                              form.branches?.[key] || '',
                            )}
                            onChange={(value) => updateBranchRole(key, value)}
                            allowReset={false}
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                          />
                        </div>
                        {canManageBranches &&
                        BRANCH_ROLES.length - 1 === index &&
                        0 === repoBranches.length ? (
                          <p className="description">
                            {__(
                              'Click “Test connection & fetch branches” above to load branch options from the repository.',
                              'alpaca-issue-tracker',
                            )}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </fieldset>

            <div className="agentic-step-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setFocusedStep(2)}
              >
                {__('Back', 'alpaca-issue-tracker')}
              </button>
              <button
                type="button"
                className="button button-primary"
                disabled={saving || panelLocked}
                onClick={saveBranchMapping}
              >
                {saving
                  ? __('Saving…', 'alpaca-issue-tracker')
                  : __('Save', 'alpaca-issue-tracker')}
              </button>
              {'saving' === branchSaveStatus ? (
                <span className="agentic-branch-save-status agentic-result-pending">
                  {__(
                    'Saving branch mapping…',
                    'alpaca-issue-tracker',
                  )}
                </span>
              ) : null}
              {'saved' === branchSaveStatus ? (
                <span className="agentic-branch-save-status agentic-result-success">
                  {__('Branch mapping saved.', 'alpaca-issue-tracker')}
                </span>
              ) : null}
              {'error' === branchSaveStatus ? (
                <span className="agentic-branch-save-status agentic-result-error">
                  {__(
                    'Could not save branch mapping.',
                    'alpaca-issue-tracker',
                  )}
                </span>
              ) : null}
            </div>

            <details className="agentic-details-block">
              <summary>
                {__('GitHub checklist', 'alpaca-issue-tracker')}
              </summary>
              <ol>
                <li>
                  {__(
                    'Repository is owner/repo (e.g. acme/my-theme).',
                    'alpaca-issue-tracker',
                  )}
                </li>
                <li>
                  {__(
                    'Token owner is a member of the organisation with repo access.',
                    'alpaca-issue-tracker',
                  )}
                </li>
                <li>
                  {__(
                    'Classic PAT: enable repo + workflow scopes.',
                    'alpaca-issue-tracker',
                  )}
                </li>
                <li>
                  {__('Fine-grained PAT on this repo:', 'alpaca-issue-tracker')}
                  <ul>
                    <li>
                      {__('Contents — Read and write', 'alpaca-issue-tracker')}
                    </li>
                    <li>
                      {__('Issues — Read and write', 'alpaca-issue-tracker')}
                    </li>
                    <li>
                      {__(
                        'Metadata — Read-only (required)',
                        'alpaca-issue-tracker',
                      )}
                    </li>
                    <li>
                      {__(
                        'Pull requests — Read and write',
                        'alpaca-issue-tracker',
                      )}
                    </li>
                    <li>
                      {__('Workflows — Read and write', 'alpaca-issue-tracker')}
                    </li>
                  </ul>
                </li>
                <li>
                  {__(
                    'If the org uses SSO: authorise the token for the org in GitHub settings.',
                    'alpaca-issue-tracker',
                  )}
                </li>
              </ol>
            </details>

            <hr className="agentic-step-hr" />

            <div
              className={
                !githubConfigured ? 'agentic-section-disabled' : undefined
              }
              aria-disabled={!githubConfigured ? 'true' : undefined}
            >
              {!githubConfigured && (
                <p className="agentic-locked-notice">
                  {__(
                    'Save your repository and token above first.',
                    'alpaca-issue-tracker',
                  )}
                </p>
              )}
              {githubConfigured && workflowInstalled && (
                <>
                  {prUrl ? (
                    <>
                      <RepoInstallMessage repo={data.github_repo} />
                      <div className="agentic-workflow-installed">
                        <span className="agentic-check-icon">✓</span>
                        {__(
                          'Pull request opened:',
                          'alpaca-issue-tracker',
                        )}{' '}
                        <a
                          href={prUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {prUrl}
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="agentic-workflow-installed">
                        <span className="agentic-check-icon">✓</span>
                        {__(
                          'GitHub Actions files detected in your repository.',
                          'alpaca-issue-tracker',
                        )}
                      </div>
                      <p className="description">
                        {__(
                          'GitHub Actions files are already in your repository. Continue to last step to complete setup.',
                          'alpaca-issue-tracker',
                        )}
                      </p>
                    </>
                  )}
                  <div className="agentic-step-actions">
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => setFocusedStep(4)}
                    >
                      {__('Continue to Finish Setup', 'alpaca-issue-tracker')}
                    </button>
                  </div>
                </>
              )}
              {githubConfigured && !workflowInstalled && (
                <div>
                  <RepoInstallMessage repo={data.github_repo} />
                  <div className="agentic-step-actions">
                    <button
                      type="button"
                      className="button agentic-install-btn"
                      disabled={installing}
                      onClick={handleInstall}
                    >
                      {installing
                        ? __('Opening pull request…', 'alpaca-issue-tracker')
                        : __('Open a PR & continue', 'alpaca-issue-tracker')}
                    </button>
                    {installing ? (
                      <span
                        className="agentic-install-spinner"
                        style={{ display: 'inline-block' }}
                      />
                    ) : null}
                  </div>
                  {installError ? (
                    <div className="agentic-install-error">{installError}</div>
                  ) : null}
                </div>
              )}
            </div>
          </fieldset>
        ) : null}

        {4 === focusedStep ? (
          <fieldset
            disabled={panelLocked || !canEdit}
            className={
              panelLocked || !canEdit ? 'agentic-fieldset-disabled' : undefined
            }
          >
            <h2 className="agentic-panel-title">
              {__('Finish Setup', 'alpaca-issue-tracker')}
            </h2>
            {panelLocked ? (
              <p className="agentic-locked-notice">
                {__(
                  'Complete the earlier steps to unlock this step.',
                  'alpaca-issue-tracker',
                )}
              </p>
            ) : null}
            <p>
              {__(
                'A few manual steps are needed to finish setup:',
                'alpaca-issue-tracker',
              )}
            </p>

            <ul className="agentic-checklist">
              {checklistItems.map((item) => {
                const checked = form.setupChecklist.includes(item.key);
                const inputId = `agentic-checklist-${item.key}`;
                return (
                  <li
                    key={item.key}
                    className={`agentic-checklist-item${checked ? ' agentic-checklist-done' : ''}`}
                  >
                    <div className="agentic-checklist-label">
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleChecklist(item.key)}
                      />
                      <label htmlFor={inputId}>{item.node}</label>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="agentic-step-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setFocusedStep(3)}
              >
                {__('Back', 'alpaca-issue-tracker')}
              </button>
              <button
                type="button"
                className="button button-primary"
                disabled={saving || panelLocked}
                onClick={saveFinishSetup}
              >
                {saving
                  ? __('Saving…', 'alpaca-issue-tracker')
                  : __('Save', 'alpaca-issue-tracker')}
              </button>
              {'saving' === setupCompletedStatus ? (
                <span className="agentic-branch-save-status agentic-result-pending">
                  {__('Saving final setup…', 'alpaca-issue-tracker')}
                </span>
              ) : null}
              {'saved' === setupCompletedStatus ? (
                <span className="agentic-branch-save-status agentic-result-success">
                  {__('Final setup saved.', 'alpaca-issue-tracker')}
                </span>
              ) : null}
              {'error' === setupCompletedStatus ? (
                <span className="agentic-branch-save-status agentic-result-error">
                  {__('Could not save final setup.', 'alpaca-issue-tracker')}
                </span>
              ) : null}
            </div>

            <details
              className="agentic-details-block"
              style={{ marginBlockStart: 16 }}
            >
              <summary>{__('Security note', 'alpaca-issue-tracker')}</summary>
              <p>
                {__(
                  'API keys are stored in the WordPress options table. For production environments, define them as constants in wp-config.php:',
                  'alpaca-issue-tracker',
                )}
              </p>
              <pre>{`define( 'ALPAISTR_AGENTIC_GITHUB_TOKEN', '...' );
define( 'ALPAISTR_AGENTIC_AI_API_KEY', '...' );`}</pre>
            </details>
          </fieldset>
        ) : null}
      </div>

      <p className="agentic-wizard-footnote">
        <sup aria-hidden="true">*</sup>
        {__(
          'Only intended for skilled engineers with GitHub access who can review the AI-generated pull requests.',
          'alpaca-issue-tracker',
        )}
      </p>
    </div>
  );
};

export default AgenticSettings;
