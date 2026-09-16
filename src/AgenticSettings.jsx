/**
 * Fix With AI settings wizard.
 *
 * Mounted on #alpaca-fix-with-ai-page.
 */
import PropTypes from 'prop-types';
import useUserManagement from './hooks/useUserManagement';

const { useState, useEffect, useCallback, useMemo, useRef, createInterpolateElement } =
  wp.element;
const { __, sprintf } = wp.i18n;
const { Spinner, Notice, FormTokenField, Popover, SlotFillProvider } =
  wp.components;

const REST_PATH = '/alpaca/v1/agentic';

const STEP_LABELS = {
  1: __('GitHub Setup', 'alpaca-issue-tracker'),
  2: __('WP Setup', 'alpaca-issue-tracker'),
  3: __('Finish Setup', 'alpaca-issue-tracker'),
};

const PROJECT_CONTEXT_PLACEHOLDER = [
  __('Examples of what to include:', 'alpaca-issue-tracker'),
  __(
    '• What this site is built with (custom theme, WooCommerce, etc.)',
    'alpaca-issue-tracker',
  ),
  __(
    '• Where the main code lives (e.g. wp-content/themes/my-theme)',
    'alpaca-issue-tracker',
  ),
  __(
    '• Important plugins or tools the AI should know about',
    'alpaca-issue-tracker',
  ),
  __(
    '• Anything unusual about environments or deploy targets',
    'alpaca-issue-tracker',
  ),
  __('• Team conventions or “don’t touch” areas', 'alpaca-issue-tracker'),
].join('\n');

const emptyForm = () => ({
  enabled: false,
  aiProvider: 'claude',
  aiApiKey: '',
  githubRepo: '',
  githubToken: '',
  aiTargetBranch: '',
  githubDefaultBranch: '',
  setupChecklist: [],
  // Admin confirmed WP site + theme match the chosen GitHub repo.
  repoMatchConfirmed: false,
  engineers: [],
  // Site-wide notes appended to every AI-drafted GitHub issue.
  projectContext: '',
});

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
    <span className="dashicons dashicons-info-outline" aria-hidden="true" />
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

const PAT_READ_WRITE = __('Read & write', 'alpaca-issue-tracker');
const PAT_READ_ONLY = __('Read-only', 'alpaca-issue-tracker');

// GitHub fine-grained PAT permissions required for this integration.
const PAT_PERMISSIONS = [
  { label: __('Contents', 'alpaca-issue-tracker'), access: PAT_READ_WRITE },
  { label: __('Issues', 'alpaca-issue-tracker'), access: PAT_READ_WRITE },
  {
    label: __('Pull requests', 'alpaca-issue-tracker'),
    access: PAT_READ_WRITE,
  },
  { label: __('Workflows', 'alpaca-issue-tracker'), access: PAT_READ_WRITE },
  { label: __('Metadata', 'alpaca-issue-tracker'), access: PAT_READ_ONLY },
];

/**
 * Click-to-open info help. Uses the Gutenberg Popover.
 *
 * @param {Object} props       Component props.
 * @param {string} props.label Accessible label for the trigger.
 * @param {*}      props.children Popover content.
 * @return {JSX.Element} Help control.
 */
const InfoHelpPopover = ({ label, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);

  return (
    <span className="agentic-pat-help-wrap" ref={anchorRef}>
      <button
        type="button"
        className="agentic-pat-help-trigger"
        aria-expanded={isOpen}
        aria-label={label}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="dashicons dashicons-info-outline" aria-hidden="true" />
      </button>
      {isOpen ? (
        <Popover
          anchor={anchorRef.current}
          placement="bottom-start"
          focusOnMount="container"
          className="agentic-pat-help-popover"
          onClose={() => setIsOpen(false)}
          onFocusOutside={() => setIsOpen(false)}
        >
          <div className="agentic-pat-help-popover__content">{children}</div>
        </Popover>
      ) : null}
    </span>
  );
};

InfoHelpPopover.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

/**
 * Click-to-open PAT permissions help.
 *
 * @return {JSX.Element} Help control.
 */
const PatHelpPopover = () => (
  <InfoHelpPopover
    label={__('Required permissions', 'alpaca-issue-tracker')}
  >
    <p className="agentic-pat-help-popover__intro">
      {createInterpolateElement(
        __(
          'Use a fine-grained PAT <strong>scoped to this repository only</strong>, with these permissions:',
          'alpaca-issue-tracker',
        ),
        { strong: <strong /> },
      )}
    </p>

    <ul className="agentic-pat-permission-list">
      {PAT_PERMISSIONS.map((permission) => (
        <li key={permission.label} className="agentic-pat-permission-list__row">
          <span>{permission.label}</span>
          <span
            className={`agentic-pat-permission-badge${
              permission.access === PAT_READ_ONLY
                ? ' agentic-pat-permission-badge--read'
                : ' agentic-pat-permission-badge--write'
            }`}
          >
            {permission.access}
          </span>
        </li>
      ))}
    </ul>

    <ul className="agentic-pat-help-popover__notes">
      <li>
        {__(
          'Classic PAT instead? Enable the repo and workflow scopes.',
          'alpaca-issue-tracker',
        )}
      </li>
      <li>
        {__(
          'The token owner must be a member of the organisation with access to this repository.',
          'alpaca-issue-tracker',
        )}
      </li>
      <li>
        {__(
          'Org uses SSO? Authorise the token for the org in GitHub settings.',
          'alpaca-issue-tracker',
        )}
      </li>
    </ul>
  </InfoHelpPopover>
);

/**
 * Placeholder shown when a secret is already stored server-side.
 * The real key is never sent to the browser.
 */
const SAVED_SECRET_MASK = '••••••••••••••••';

/**
 * Password-style custom input, without possibility to reveal the secret (they stay saved on the server).
 * Empty value means "keep the saved secret"; placeholder shows that one exists.
 *
 * @param {Object}   props            Component props.
 * @param {string}   props.id         Input id.
 * @param {string}   props.value      Draft value typed by the user (empty = keep saved).
 * @param {boolean}  props.isSaved    Whether a secret is already stored.
 * @param {boolean}  [props.disabled] Disable the field.
 * @param {Function} props.onChange   Called with the next draft string.
 * @return {JSX.Element} Secret input.
 */
const SavedSecretInput = ({
  id,
  value,
  isSaved,
  disabled = false, // Disabled only when the secret comes from a PHP constant.
  onChange,
}) => (
  <input
    type="password"
    id={id}
    className="regular-text"
    autoComplete="new-password"
    spellCheck="false"
    disabled={disabled}
    value={value}
    placeholder={isSaved ? SAVED_SECRET_MASK : ''}
    onChange={(event) => onChange(event.target.value)}
  />
);

SavedSecretInput.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isSaved: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

/**
 * @param {Object} data Client settings payload from REST.
 * @return {Object} Step done/locked map.
 */
const getStepStates = (data) => {
  const enabled = !!data.enabled;
  const githubConfigured =
    !!data.github_repo && !!data.github_token_set && !!data.ai_ready;
  const workflowInstalled = !!data.workflow_installed;
  const checklistCount = Array.isArray(data.setup_checklist)
    ? data.setup_checklist.length
    : 0;
  const repoMatchConfirmed = !!data.repo_match_confirmed;

  const githubReady =
    enabled &&
    githubConfigured &&
    workflowInstalled &&
    !!data.ai_target_branch;

  return {
    1: {
      done: githubReady,
      locked: !enabled,
    },
    // Optional step: unlocked after GitHub is ready; does not block Finish Setup.
    2: {
      done: githubReady,
      locked: !githubReady,
    },
    3: {
      done: githubReady && checklistCount >= 2 && repoMatchConfirmed,
      locked: !githubReady,
    },
  };
};

/**
 * @param {Object} stepStates Step state map.
 * @return {number} First incomplete unlocked step.
 */
const getActiveStep = (stepStates) => {
  for (const step of [1, 2, 3]) {
    if (!stepStates[step].done && !stepStates[step].locked) {
      return step;
    }
  }
  return 3;
};

const PRODUCTION_BRANCH_NAMES = new Set([
  'main',
  'master',
  'production',
  'prod',
]);

/**
 * @param {Object} props                Component props.
 * @param {string} props.repo           Repository slug.
 * @param {string} props.defaultBranch  GitHub default branch.
 * @param {string} props.aiTargetBranch AI code target branch.
 * @return {JSX.Element} Install intro paragraph.
 */
const RepoInstallMessage = ({ repo, defaultBranch, aiTargetBranch }) => {
  const actionsBranch = defaultBranch || __('the default branch', 'alpaca-issue-tracker');
  /* translators: %s: GitHub repository slug (owner/repo). */
  const template = __(
    'Open a pull request to add the required GitHub Actions files to the %s repository.',
    'alpaca-issue-tracker',
  );
  const parts = template.split('%s');
  return (
    <>
      <p>
        {parts[0]}
        <strong>{repo}</strong>
        {parts[1] || ''}
      </p>
      <p className="description">
        {sprintf(
          /* translators: %1$s: repository default branch. %2$s: AI target branch. */
          __(
            'GitHub Actions files go to %1$s (the repository default). AI code pull requests go to %2$s.',
            'alpaca-issue-tracker',
          ),
          actionsBranch,
          aiTargetBranch || __('the AI target branch', 'alpaca-issue-tracker'),
        )}
      </p>
    </>
  );
};

RepoInstallMessage.propTypes = {
  repo: PropTypes.string.isRequired,
  defaultBranch: PropTypes.string,
  aiTargetBranch: PropTypes.string,
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
    (allUserObjects || []).forEach((userObject) =>
      map.set(userObject.id, userObject),
    );
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
      engineerIds.map((id) => usersById.get(id)?.name).filter((name) => !!name),
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
 * Fix With AI admin screen.
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
  const [setupCompletedStatus, setSetupCompletedStatus] = useState('idle'); // Saved.
  const [installing, setInstalling] = useState(false);
  const [installError, setInstallError] = useState('');
  const [repoBranches, setRepoBranches] = useState([]);
  // Bumped after settings reload so secret inputs remount with a clean UI.
  const [secretFieldsResetKey, setSecretFieldsResetKey] = useState(0);
  const { allUserObjects } = useUserManagement();

  const applySettings = useCallback((payload, advanceToActive = false) => {
    setData(payload);
    setSecretFieldsResetKey((resetKey) => resetKey + 1);
    setForm({
      enabled: !!payload.enabled,
      aiProvider: payload.ai_provider || 'claude',
      aiApiKey: '',
      githubRepo: payload.github_repo || '',
      githubToken: '',
      aiTargetBranch: payload.ai_target_branch || '',
      githubDefaultBranch: payload.github_default_branch || '',
      setupChecklist: Array.isArray(payload.setup_checklist)
        ? payload.setup_checklist.map(Number)
        : [],
      repoMatchConfirmed: !!payload.repo_match_confirmed,
      engineers: Array.isArray(payload.engineers)
        ? payload.engineers.map(Number)
        : [],
      projectContext: payload.project_context || '',
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
          applySettings(payload);
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
        ? getStepStates({ ...data, enabled: form.enabled })
        : {
            1: { done: false, locked: true },
            2: { done: false, locked: true },
            3: { done: false, locked: true },
          },
    [data, form.enabled],
  );

  // !! to make sure it's a boolean, and avoid undefined values.
  const allDone =
    !!form.enabled &&
    !!stepStates[1]?.done &&
    !!stepStates[2]?.done &&
    !!stepStates[3]?.done;

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
      ai_target_branch: form.aiTargetBranch || '',
      github_default_branch: form.githubDefaultBranch || '',
      setup_checklist: form.setupChecklist,
      repo_match_confirmed: !!form.repoMatchConfirmed,
      engineers: form.engineers,
      project_context: form.projectContext || '',
    };
    if (form.aiApiKey) {
      payload.ai_api_key = form.aiApiKey;
    }
    if (form.githubToken) {
      payload.github_token = form.githubToken;
    }
    /* eslint-enable camelcase */
    return payload;
  }, [form]);

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

  const saveEnabledToggle = useCallback(
    async (enabled) => {
      updateForm({ enabled });
      setSaving(true);
      setError('');
      try {
        const payload = await wp.apiFetch({
          path: `${REST_PATH}/settings`,
          method: 'POST',
          data: { ...buildSavePayload(), enabled },
        });
        applySettings(payload, enabled ? true : false);
        return payload;
      } catch (err) {
        updateForm({ enabled: !enabled });
        setError(
          err?.message ||
            __('Could not save settings.', 'alpaca-issue-tracker'),
        );
      } finally {
        setSaving(false);
      }
    },
    [applySettings, buildSavePayload, updateForm],
  );

  const saveFinishSetup = useCallback(async () => {
    setSetupCompletedStatus('saving');
    try {
      await saveSettings(true);
      setSetupCompletedStatus('saved');
    } catch (_err) {
      setSetupCompletedStatus('error');
    }
  }, [saveSettings]);

  const testGithubConnection = useCallback(async () => {
    setTesting(true);
    setTestResult({
      message: __('Validating credentials…', 'alpaca-issue-tracker'),
      className: 'agentic-result-pending',
    });
    try {
      await saveSettings(false);
      const result = await wp.apiFetch({
        path: `${REST_PATH}/test-github`,
        method: 'POST',
        data: {},
      });
      const nextBranches = Array.isArray(result?.branches)
        ? result.branches
        : [];
      setRepoBranches(nextBranches);
      const defaultBranch = result?.default_branch || '';
      // Successful validation replaces the old site↔repo checkbox confirmation.
      /* eslint-disable camelcase -- REST API uses snake_case field names. */
      const payload = await wp.apiFetch({
        path: `${REST_PATH}/settings`,
        method: 'POST',
        data: {
          ...buildSavePayload(),
          repo_match_confirmed: true,
          github_default_branch: defaultBranch,
        },
      });
      /* eslint-enable camelcase */
      applySettings(payload, false);
      setTestResult({
        message: result?.message || __('Connected.', 'alpaca-issue-tracker'),
        className: 'agentic-result-success',
      });
    } catch (err) {
      setTestResult({
        message:
          err?.message || __('Connection failed.', 'alpaca-issue-tracker'),
        className: 'agentic-result-error',
      });
    } finally {
      setTesting(false);
    }
  }, [applySettings, buildSavePayload, saveSettings]);

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
        setFocusedStep(2);
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

  useEffect(() => {
    if (
      1 !== focusedStep ||
      !data?.github_repo ||
      !data?.github_token_set
    ) {
      return;
    }

    let cancelled = false;
    wp.apiFetch({ path: `${REST_PATH}/branches` })
      .then((payload) => {
        if (!cancelled && Array.isArray(payload?.branches)) {
          setRepoBranches(payload.branches);
        }
      })
      .catch(() => {
        // Branch list is optional until Validate credentials succeeds.
      });

    return () => {
      cancelled = true;
    };
  }, [focusedStep, data?.github_repo, data?.github_token_set]);

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

  const handleEngineersChange = useCallback(
    (ids) => {
      updateForm({ engineers: ids });
    },
    [updateForm],
  );

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
          {__('Fix With AI', 'alpaca-issue-tracker')}
        </h1>
        <Notice status="warning" isDismissible={false}>
          {__(
            'Fix With AI is only available to administrators and users granted engineer access. Contact your site administrator if you need access.',
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
    !!data.github_repo && !!data.github_token_set && !!data.ai_ready;
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
    ...((Array.isArray(data.setup_security?.branch_protection)
      ? data.setup_security.branch_protection
      : []
    )
      .filter(
        (item) =>
          item &&
          Number.isFinite(Number(item.key)) &&
          'string' === typeof item.label &&
          item.label.trim(),
      )
      .map((item) => ({
        key: Number(item.key),
        node: item.label,
      }))),
  ];

  return (
    <SlotFillProvider>
    <div
      className={`agentic-wizard-inner${allDone ? ' agentic-wizard-all-done' : ''}`}
      data-agentic-all-done={allDone ? '1' : undefined}
    >
      <div className="agentic-wizard-header">
        <h1 className="wp-heading-inline agentic-wizard-title">
          {__('Fix With AI', 'alpaca-issue-tracker')}
        </h1>
        <label
          htmlFor="agentic-enable-toggle"
          className={`agentic-toggle-label agentic-header-toggle${!canEdit ? ' agentic-fieldset-disabled' : ''}`}
        >
          <input
            id="agentic-enable-toggle"
            type="checkbox"
            className="agentic-toggle-input"
            checked={!!form.enabled}
            disabled={!canEdit || saving}
            onChange={(event) => saveEnabledToggle(event.target.checked)}
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
            {__('Enable Fix With AI', 'alpaca-issue-tracker')}
          </span>
        </label>
        {allDone ? (
          <p className="agentic-all-done-status">
            <span className="agentic-all-done-icon" aria-hidden="true">
              ✓
            </span>
            <strong className="agentic-all-done-heading">
              {__("You're all set!", 'alpaca-issue-tracker')}
            </strong>
          </p>
        ) : null}
      </div>
      <Notice
        className="agentic-advisory-notice"
        status="warning"
        isDismissible={false}
      >
        <p>
          {__(
            'Fix With AI can only propose code changes within the boundaries of the GitHub repository referenced below.',
            'alpaca-issue-tracker',
          )}
        </p>
        <p>
          {__(
            'All Pull Requests must be thoroughly reviewed by a competent developer before being applied to your live site.',
            'alpaca-issue-tracker',
          )}
        </p>
      </Notice>

      {!canEdit && data.is_engineer ? (
        <Notice status="info" isDismissible={false}>
          {__(
            'You have Fix With AI access and can view setup status below. Only administrators can change these settings.',
            'alpaca-issue-tracker',
          )}
        </Notice>
      ) : null}

      {error ? (
        <div className="notice notice-error inline">
          <p>{error}</p>
        </div>
      ) : null}

      <div
        className={`agentic-step-indicators${allDone ? ' agentic-indicators-all-done' : ''}${!form.enabled ? ' agentic-indicators-disabled' : ''}`}
        role="tablist"
      >
        {[1, 2, 3].map((num) => {
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
              aria-disabled={!form.enabled ? 'true' : 'false'}
              onClick={() => {
                if (!form.enabled) {
                  return;
                }
                setFocusedStep(num);
              }}
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
              {__('GitHub Setup', 'alpaca-issue-tracker')}
            </h2>
            {panelLocked ? (
              <p className="agentic-locked-notice">
                {__(
                  'Turn on Fix With AI above to unlock setup steps.',
                  'alpaca-issue-tracker',
                )}
              </p>
            ) : null}

            <table className="form-table" role="presentation">
              <tbody>
                <tr>
                  <th scope="row">
                    <label htmlFor="agentic-github-repo">
                      {__('Repository (owner/repo)', 'alpaca-issue-tracker')}
                    </label>
                    <InfoHelpPopover
                      label={__('Repository match', 'alpaca-issue-tracker')}
                    >
                      <p className="agentic-pat-help-popover__intro">
                        {__(
                          'Make sure this WordPress site matches the GitHub repository.',
                          'alpaca-issue-tracker',
                        )}
                      </p>
                    </InfoHelpPopover>
                  </th>
                  <td>
                    <input
                      type="text"
                      id="agentic-github-repo"
                      className="regular-text"
                      placeholder="owner/repo"
                      value={form.githubRepo}
                      onChange={(event) => {
                        const nextRepo = event.target.value;
                        // Changing repo clears confirmation until credentials are validated again.
                        updateForm({
                          githubRepo: nextRepo,
                          repoMatchConfirmed: false,
                          aiTargetBranch: '',
                          githubDefaultBranch: '',
                        });
                      }}
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
                    <PatHelpPopover />
                  </th>
                  <td>
                    {data.github_token_from_constant ? (
                      <>
                        <SavedSecretInput
                          key={`github-token-${secretFieldsResetKey}`}
                          id="agentic-github-token"
                          value=""
                          isSaved
                          disabled
                          onChange={() => {}}
                        />
                        <p className="description">
                          {__(
                            'Defined via ALPAISTR_AGENTIC_GITHUB_TOKEN constant.',
                            'alpaca-issue-tracker',
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <SavedSecretInput
                          key={`github-token-${secretFieldsResetKey}`}
                          id="agentic-github-token"
                          value={form.githubToken}
                          isSaved={!!data.github_token_set}
                          onChange={(nextToken) =>
                            updateForm({ githubToken: nextToken })
                          }
                        />
                      </>
                    )}
                  </td>
                </tr>
                <tr>
                  <th scope="row" />
                  <td>
                    <div className="agentic-step-actions">
                      <button
                        type="button"
                        className="button button-primary"
                        disabled={saving || testing || panelLocked}
                        onClick={testGithubConnection}
                      >
                        {testing
                          ? __('Validating…', 'alpaca-issue-tracker')
                          : __('Validate credentials', 'alpaca-issue-tracker')}
                      </button>
                      {testResult ? (
                        <span
                          className={`agentic-connection-result ${testResult.className}`}
                        >
                          {testResult.message}
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="agentic-ai-target-branch">
                      {__('AI target branch', 'alpaca-issue-tracker')}
                    </label>
                  </th>
                  <td>
                    <select
                      id="agentic-ai-target-branch"
                      value={form.aiTargetBranch}
                      disabled={
                        0 === repoBranches.length && !form.aiTargetBranch
                      }
                      onChange={(event) =>
                        updateForm({ aiTargetBranch: event.target.value })
                      }
                    >
                      <option value="">
                        {0 === repoBranches.length && !form.aiTargetBranch
                          ? __(
                              'Validate credentials to load branches',
                              'alpaca-issue-tracker',
                            )
                          : __('Select a branch…', 'alpaca-issue-tracker')}
                      </option>
                      {(form.aiTargetBranch &&
                      !repoBranches.includes(form.aiTargetBranch)
                        ? [form.aiTargetBranch, ...repoBranches]
                        : repoBranches
                      ).map((branchName) => (
                        <option key={branchName} value={branchName}>
                          {branchName}
                        </option>
                      ))}
                    </select>
                    <p className="description">
                      {__(
                        'The AI opens pull requests into this branch. Do not use a production branch, unless you are sure what you are doing.',
                        'alpaca-issue-tracker',
                      )}
                    </p>
                    {PRODUCTION_BRANCH_NAMES.has(
                      (form.aiTargetBranch || '').toLowerCase(),
                    ) ? (
                      <p className="description agentic-production-branch-warning">
                        {__(
                          'Are you sure? This looks like a production branch. Staging or development branches are generally preferable.',
                          'alpaca-issue-tracker',
                        )}
                      </p>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>

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
                      <RepoInstallMessage
                        repo={data.github_repo}
                        defaultBranch={form.githubDefaultBranch}
                        aiTargetBranch={form.aiTargetBranch}
                      />
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
                          'GitHub Actions files are already in your repository. Continue to WP Setup.',
                          'alpaca-issue-tracker',
                        )}
                      </p>
                    </>
                  )}
                  <div className="agentic-step-actions">
                    <button
                      type="button"
                      className="button button-primary"
                      disabled={
                        saving || !form.repoMatchConfirmed || !form.aiTargetBranch
                      }
                      onClick={() => saveSettings(2)}
                    >
                      {__('Continue to WP Setup', 'alpaca-issue-tracker')}
                    </button>
                  </div>
                </>
              )}
              {githubConfigured && !workflowInstalled && (
                <div>
                  <RepoInstallMessage
                    repo={data.github_repo}
                    defaultBranch={form.githubDefaultBranch}
                    aiTargetBranch={form.aiTargetBranch}
                  />
                  <div className="agentic-step-actions">
                    <button
                      type="button"
                      className="button agentic-install-btn"
                      disabled={
                        installing ||
                        !form.repoMatchConfirmed ||
                        !form.aiTargetBranch
                      }
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

        {2 === focusedStep ? (
          <fieldset
            disabled={panelLocked || !canEdit}
            className={
              panelLocked || !canEdit ? 'agentic-fieldset-disabled' : undefined
            }
          >
            <h2 className="agentic-panel-title">
              {__('WP Setup', 'alpaca-issue-tracker')}
            </h2>
            {panelLocked ? (
              <p className="agentic-locked-notice">
                {!form.enabled
                  ? __(
                      'Turn on Fix With AI above to unlock setup steps.',
                      'alpaca-issue-tracker',
                    )
                  : __(
                      'Complete GitHub Setup to unlock this step.',
                      'alpaca-issue-tracker',
                    )}
              </p>
            ) : null}

            {data.wp_ai_available ? (
              <div className="agentic-connectors-status">
                {data.wp_ai_configured ? (
                  <p className="agentic-connectors-connected">
                    <span
                      className="agentic-connectors-connected__icon"
                      aria-hidden="true"
                    >
                      ✓
                    </span>{' '}
                    {__(
                      'AI provider configured via WordPress Connectors.',
                      'alpaca-issue-tracker',
                    )}{' '}
                    <a
                      href={data.connectors_admin_url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {__('Manage Connectors', 'alpaca-issue-tracker')}
                    </a>
                  </p>
                ) : (
                  <p className="agentic-connectors-unconfigured">
                    {__('No AI provider configured.', 'alpaca-issue-tracker')}{' '}
                    <a
                      href={data.connectors_admin_url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {__(
                        'Set up in Settings → Connectors',
                        'alpaca-issue-tracker',
                      )}
                    </a>
                    {__(' to continue.', 'alpaca-issue-tracker')}
                  </p>
                )}
              </div>
            ) : (
              <>
                <p>
                  {__(
                    'Select the AI provider used to draft Alpaca issues for GitHub.',
                    'alpaca-issue-tracker',
                  )}{' '}
                  <HelpTip
                    label={__('More information', 'alpaca-issue-tracker')}
                    tooltip={__(
                      'This is separate from the AI that resolves issues on GitHub — you can use the same key for both.',
                      'alpaca-issue-tracker',
                    )}
                  />
                </p>
                <fieldset className="agentic-ai-provider-fields">
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
                              <SavedSecretInput
                                key={`ai-api-key-${secretFieldsResetKey}`}
                                id="agentic-ai-api-key"
                                value=""
                                isSaved
                                disabled
                                onChange={() => {}}
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
                              <SavedSecretInput
                                key={`ai-api-key-${secretFieldsResetKey}`}
                                id="agentic-ai-api-key"
                                value={form.aiApiKey}
                                isSaved={!!data.ai_api_key_set}
                                onChange={(nextKey) =>
                                  updateForm({ aiApiKey: nextKey })
                                }
                              />
                              {!data.ai_api_key_set ? (
                                <p className="description">
                                  {__(
                                    'Used to draft agent-ready issues from Alpaca cards.',
                                    'alpaca-issue-tracker',
                                  )}
                                </p>
                              ) : null}
                            </>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </fieldset>
              </>
            )}

            {data.is_admin ? (
              <>
                <h3 className="agentic-panel-subtitle">
                  {__('Users', 'alpaca-issue-tracker')}
                </h3>
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
                  'Only administrators can manage who has access to Fix With AI.',
                  'alpaca-issue-tracker',
                )}
              </p>
            )}

            <div className="agentic-project-context">
              <h3 className="agentic-panel-subtitle">
                <label htmlFor="agentic-project-context">
                  {__('Project context', 'alpaca-issue-tracker')}
                </label>
              </h3>
              <p className="description">
                {__(
                  'Optional site-wide notes included with every AI-drafted GitHub issue.',
                  'alpaca-issue-tracker',
                )}
              </p>
              <textarea
                id="agentic-project-context"
                className="large-text agentic-project-context__textarea"
                rows={8}
                value={form.projectContext}
                placeholder={PROJECT_CONTEXT_PLACEHOLDER}
                disabled={panelLocked || !canEdit}
                onChange={(event) =>
                  updateForm({ projectContext: event.target.value })
                }
              />
            </div>

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
              {__('Finish Setup', 'alpaca-issue-tracker')}
            </h2>
            {panelLocked ? (
              <p className="agentic-locked-notice">
                {!form.enabled
                  ? __(
                      'Turn on Fix With AI above to unlock setup steps.',
                      'alpaca-issue-tracker',
                    )
                  : __(
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

            {!form.repoMatchConfirmed ? (
              <p className="notice notice-warning inline">
                {__(
                  'Validate credentials in GitHub Setup before finishing.',
                  'alpaca-issue-tracker',
                )}
              </p>
            ) : null}

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
                onClick={() => setFocusedStep(2)}
              >
                {__('Back', 'alpaca-issue-tracker')}
              </button>
              <button
                type="button"
                className="button button-primary"
                disabled={saving || panelLocked || !form.repoMatchConfirmed}
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
        {__(
          'Only intended for skilled engineers with GitHub access who can review the AI-generated pull requests.',
          'alpaca-issue-tracker',
        )}
      </p>
    </div>
    <Popover.Slot />
    </SlotFillProvider>
  );
};

export default AgenticSettings;
