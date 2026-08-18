/**
 * Alpaca AI Issue Resolver
 *
 * Injects a "Fix with AI" action into the Alpaca issue detail view. Clicking it
 * calls our WP REST endpoint to get an AI-drafted agent-ready issue, shows a
 * preview modal, then creates the GitHub issue on confirm. The accepted draft
 * (title/body/complexity/labels) is saved so it can be resent to another branch,
 * viewed, or deleted/restarted, but if it's applied to production, it will not
 * trigger the AI agent again, instead it ensures the fix consistency by
 * cherry-picking the exact same fix for the production.
 *
 * Relies on globals loaded by Alpaca:
 *   wp.element   (React)
 *   wp.components
 *   wp.hooks
 *   wp.i18n
 *   agenticConfig    (localized by PHP onto alpaca-script)
 */

// Import helper functions for the agentic workflow.
import {
  getHandledBranchesInCurrentCycle,
  getSentBranchesInCurrentCycle,
  readAgenticDraftFromMeta,
} from './utils/agenticHistory';

(function () {
  'use strict';

  if (!window.agenticConfig) {
    return;
  }

  const {
    createElement: el,
    useState,
    useCallback,
    useEffect,
    Fragment,
  } = wp.element;
  const {
    Modal,
    Button,
    TextControl,
    TextareaControl,
    SelectControl,
    CheckboxControl,
    Notice,
    Spinner,
  } = wp.components;
  const { addFilter } = wp.hooks;
  const { __, sprintf } = wp.i18n;

  // ── Config ──────────────────────────────────────────────────────────────────

  const { restBase, nonce, setupCompleted, isAuthorized, branches } =
    window.agenticConfig || {};

  const BRANCH_ROLE_LABELS = {
    staging: __('Staging', 'alpaca-issue-tracker'),
    production: __('Production', 'alpaca-issue-tracker'),
  };

  /**
   * Roles that have a real GitHub branch mapped (not None).
   *
   * @return {Array<{role: string, branch: string, label: string}>} Configured role options.
   */
  function getConfiguredBranchOptions() {
    const map = branches && 'object' === typeof branches ? branches : {};
    return ['staging', 'production']
      .filter((role) => map[role])
      .map((role) => ({
        role,
        branch: map[role],
        label: `${BRANCH_ROLE_LABELS[role]} (${map[role]})`,
      }));
  }

  const configuredBranches = getConfiguredBranchOptions();
  const hasConfiguredBranches = configuredBranches.length > 0;

  const ALLOWED_LABELS = [
    { value: 'bug', label: __('bug', 'alpaca-issue-tracker') },
    { value: 'enhancement', label: __('enhancement', 'alpaca-issue-tracker') },
    {
      value: 'agent-candidate',
      label: __('agent-candidate', 'alpaca-issue-tracker'),
    },
    {
      value: 'agent-ready',
      label: __('agent-ready ⚡', 'alpaca-issue-tracker'),
    },
  ];

  // GitHub icon as SVG code.
  const GITHUB_ICON = el(
    'svg',
    {
      viewBox: '0 0 16 16',
      width: 16,
      height: 16,
      fill: 'currentColor',
      'aria-hidden': 'true',
    },
    el('path', {
      d: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z',
    }),
  );

  // ── REST helpers ────────────────────────────────────────────────────────────

  /**
   * A local helper toPOST to a WP REST endpoint with the wp_rest nonce.
   *
   * @param {string} path    Relative path under restBase.
   * @param {Object} payload Request body.
   * @return {Promise<Object>} Parsed response data.
   * @throws {Error} On HTTP or API errors.
   */
  async function restPost(path, payload) {
    const response = await fetch(restBase + path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || __('Request failed.', 'alpaca-issue-tracker'),
      );
    }

    return data;
  }

  /**
   * Tell the rest of Alpaca an agentic workflow event happened:
   * - commentCountChanged → reload the activity/comments timeline
   * - agentic.changed → refetch issue details (AI Log tab, draft, labels)
   *
   * @param {number}                     issueId  Alpaca issue post ID.
   * @param {'sent'|'deleted'|'applied'} mutation Agentic mutation that completed.
   */
  function notifyAgenticChange(issueId, mutation) {
    if (wp.hooks && 'function' === typeof wp.hooks.doAction) {
      wp.hooks.doAction('alpaca.commentCountChanged', { issueId });
      wp.hooks.doAction('alpaca.agentic.changed', { issueId, mutation });
    }
  }

  // ── Modal portal helpers ─────────────────────────────────────────────────────
  // Only one of these modals is ever open at a time, so they share one mount node.

  /**
   * Mount (or unmount) a modal element into a dedicated DOM node.
   *
   * @param {Object|null} node Element to render, or null to unmount.
   */
  function renderModal(node) {
    let container = document.getElementById('agentic-modal-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'agentic-modal-root';
      document.body.appendChild(container);
    }

    wp.element.render(node, container);
  }

  const closeModal = () => renderModal(null);

  // ── ExportModal ──────────────────────────────────────────────────────────────

  /**
   * Preview and confirm modal shown before creating the GitHub issue.
   *
   * Two modes:
   * - 'ai' (default): AI drafts the issue, editable, Regenerate available. Used
   *   both when there is no draft yet, and after Manage existing draft's
   *   "Edit / regenerate draft".
   * - 'locked': a draft already exists and was already sent to at least one
   *   branch. Shows that exact saved text read-only (no edit, no regenerate) so
   *   the same fix is not re-worded before being sent to another branch; only
   *   the target branch (limited to not-yet-sent branches) is selectable.
   *
   * @param {Object}        props
   * @param {number}        props.issueId         Alpaca issue post ID.
   * @param {string}        props.mode            'ai' | 'locked'.
   * @param {Object|null}   props.initialDraft    Saved draft, required when mode is 'locked'.
   * @param {Array<Object>} props.allowedBranches Branch options the target-branch selector may offer.
   * @param {Function}      props.onClose         Called when the modal should close.
   */
  function ExportModal({
    issueId,
    mode,
    initialDraft,
    allowedBranches,
    onClose,
  }) {
    const isLocked = 'locked' === mode;

    const [phase, setPhase] = useState(isLocked ? 'preview' : 'loading'); // loading | preview | creating | done | error
    const [errorMsg, setErrorMsg] = useState('');
    const [githubUrl, setGithubUrl] = useState('');

    // Editable draft fields (read-only in 'locked' mode).
    const [title, setTitle] = useState(isLocked ? initialDraft.title : '');
    const [body, setBody] = useState(isLocked ? initialDraft.body : '');
    const [complexity, setComplexity] = useState(
      isLocked ? initialDraft.complexity : 'medium',
    );
    const [selectedLabels, setSelectedLabels] = useState(
      isLocked ? initialDraft.labels : [],
    );
    // Required: GitHub branch name for the agent PR base.
    const [targetBranch, setTargetBranch] = useState(
      allowedBranches[0]?.branch || '',
    );

    // ── Fetch AI draft on mount (skipped in 'locked' mode) ──────────────────

    const fetchDraftData = useCallback(async () => {
      setPhase('loading');
      setErrorMsg('');

      try {
        const data = await restPost('/draft', { issue_id: issueId });
        setTitle(data.title || '');
        setBody(data.body || '');
        setComplexity(data.complexity || 'medium');

        // Pre-tick suggested labels except agent-ready (intentional gate).
        const suggested = (data.labels || []).filter(
          (l) => l !== 'agent-ready',
        );
        setSelectedLabels(suggested);

        setPhase('preview');
      } catch (err) {
        setErrorMsg(err.message);
        setPhase('error');
      }
    }, [issueId]);

    useEffect(() => {
      if (!isLocked) {
        fetchDraftData();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- isLocked never changes for a mounted instance.
    }, [fetchDraftData]);

    // ── Create GitHub issue ─────────────────────────────────────────────────

    const createGithubIssue = useCallback(async () => {
      if (!targetBranch) {
        setErrorMsg(
          __(
            'Select a target branch for the pull request.',
            'alpaca-issue-tracker',
          ),
        );
        return;
      }

      setPhase('creating');
      setErrorMsg('');

      // Complexity + target-branch labels are read by the GitHub Actions agent.
      const labels = [
        ...new Set([
          ...selectedLabels,
          'complexity:' + complexity,
          'target-branch:' + targetBranch,
        ]),
      ];

      try {
        const data = await restPost('/create', {
          issue_id: issueId,
          title,
          body,
          labels,
        });
        setGithubUrl(data.url || '');
        setPhase('done');
        notifyAgenticChange(issueId, 'sent');
      } catch (err) {
        setErrorMsg(err.message);
        setPhase('preview');
      }
    }, [issueId, title, body, complexity, selectedLabels, targetBranch]);

    // ── Toggle label ───────────────────────────────────────────────────────

    const toggleLabel = useCallback((value, checked) => {
      if (checked) {
        setSelectedLabels((existing) => [...existing, value]);
      } else {
        setSelectedLabels((existing) =>
          existing.filter((label) => label !== value),
        ); // Remove the label.
      }
    }, []);

    // ── Render helpers ─────────────────────────────────────────────────────

    function renderLoading() {
      return el(
        'div',
        { className: 'agentic-modal-loading' },
        el(Spinner),
        el(
          'p',
          null,
          __('AI is drafting the agent-ready issue…', 'alpaca-issue-tracker'),
        ),
      );
    }

    function renderError() {
      return el(
        Fragment,
        null,
        el(
          Notice,
          { status: 'error', isDismissible: false },
          errorMsg || __('Something went wrong.', 'alpaca-issue-tracker'),
        ),
        el(
          'div',
          { className: 'agentic-modal-actions' },
          el(
            Button,
            { variant: 'secondary', onClick: fetchDraftData },
            __('Try again', 'alpaca-issue-tracker'),
          ),
          el(
            Button,
            { variant: 'tertiary', onClick: onClose },
            __('Cancel', 'alpaca-issue-tracker'),
          ),
        ),
      );
    }

    function renderDone() {
      return el(
        Fragment,
        null,
        el(
          Notice,
          { status: 'success', isDismissible: false },
          el(
            'span',
            null,
            __('Agent issue created on GitHub! ', 'alpaca-issue-tracker'),
            el(
              'a',
              { href: githubUrl, target: '_blank', rel: 'noreferrer noopener' },
              githubUrl,
            ),
          ),
        ),
        el(
          'div',
          { className: 'agentic-modal-actions' },
          el(
            Button,
            { variant: 'primary', onClick: onClose },
            __('Done', 'alpaca-issue-tracker'),
          ),
        ),
      );
    }

    function renderPreview() {
      const isCreating = 'creating' === phase;
      const fieldsDisabled = isCreating || isLocked;
      const complexityOptions = [
        {
          value: 'low',
          label: __(
            'complexity:low — single file, obvious pattern',
            'alpaca-issue-tracker',
          ),
        },
        {
          value: 'medium',
          label: __(
            'complexity:medium — multiple files, known patterns',
            'alpaca-issue-tracker',
          ),
        },
        {
          value: 'high',
          label: __(
            'complexity:high — architectural decisions, needs planning',
            'alpaca-issue-tracker',
          ),
        },
      ];

      const targetBranchOptions = allowedBranches.map(({ branch, label }) => ({
        value: branch,
        label,
      }));

      return el(
        Fragment,
        null,
        isLocked &&
          el(
            Notice,
            { status: 'info', isDismissible: false },
            __(
              'Locked to ensure Production gets the same issue description already sent to Staging. Changing it will require you to test on Staging again.',
              'alpaca-issue-tracker',
            ),
          ),
        errorMsg &&
          el(
            Notice,
            {
              status: 'error',
              isDismissible: true,
              onRemove: () => setErrorMsg(''),
            },
            errorMsg,
          ),
        el(
          'div',
          { className: 'agentic-modal-form' },
          el(TextControl, {
            label: __('Issue title', 'alpaca-issue-tracker'),
            value: title,
            onChange: setTitle,
            disabled: fieldsDisabled,
            className: 'agentic-field-title',
          }),
          el(TextareaControl, {
            label: __('Issue body', 'alpaca-issue-tracker'),
            value: body,
            onChange: setBody,
            rows: 18,
            disabled: fieldsDisabled,
            className: 'agentic-field-body',
          }),
          el(
            'div',
            { className: 'agentic-modal-meta' },
            el(SelectControl, {
              label: __('Target branch', 'alpaca-issue-tracker'),
              value: targetBranch,
              options: targetBranchOptions,
              onChange: setTargetBranch,
              disabled: isCreating,
              className: 'agentic-field-target-branch',
              help: __(
                'PR base branch for the AI agent fix.',
                'alpaca-issue-tracker',
              ),
            }),
            el(SelectControl, {
              label: __('Complexity', 'alpaca-issue-tracker'),
              value: complexity,
              options: complexityOptions,
              onChange: setComplexity,
              disabled: fieldsDisabled,
              className: 'agentic-field-complexity',
            }),
            el(
              'fieldset',
              { className: 'agentic-label-checkboxes' },
              el('legend', null, __('Labels', 'alpaca-issue-tracker')),
              ALLOWED_LABELS.map(({ value, label }) =>
                el(CheckboxControl, {
                  key: value,
                  label,
                  checked: selectedLabels.includes(value),
                  onChange: (checked) => toggleLabel(value, checked),
                  disabled: fieldsDisabled,
                }),
              ),
            ),
          ),
          !isLocked &&
            el(
              'p',
              { className: 'agentic-modal-hint' },
              __(
                'The complexity label and all checked labels will be applied. agent-ready triggers the CI agent immediately — check it only when the issue is fully scoped.',
                'alpaca-issue-tracker',
              ),
            ),
        ),
        el(
          'div',
          { className: 'agentic-modal-actions' },
          isCreating
            ? el(Spinner)
            : el(
                Fragment,
                null,
                el(
                  Button,
                  {
                    variant: 'primary',
                    className: 'agentic-agent-btn',
                    onClick: createGithubIssue,
                    disabled: !title.trim() || !body.trim() || !targetBranch,
                  },
                  __('Create agent issue on GitHub', 'alpaca-issue-tracker'),
                ),
                !isLocked &&
                  el(
                    Button,
                    {
                      variant: 'secondary',
                      className: 'agentic-agent-btn-secondary',
                      onClick: fetchDraftData,
                    },
                    __('Regenerate', 'alpaca-issue-tracker'),
                  ),
                el(
                  Button,
                  {
                    variant: 'tertiary',
                    onClick: onClose,
                  },
                  __('Cancel', 'alpaca-issue-tracker'),
                ),
              ),
        ),
      );
    }

    // ── Render ─────────────────────────────────────────────────────────────

    const titleText = el(
      'span',
      { className: 'agentic-modal-header' },
      el(
        'span',
        { className: 'agentic-modal-header-icon', 'aria-hidden': 'true' },
        '✦',
      ),
      isLocked
        ? __('Send saved draft to GitHub', 'alpaca-issue-tracker')
        : __('Create AI agent issue', 'alpaca-issue-tracker'),
    );

    let content;
    switch (phase) {
      case 'loading':
        content = renderLoading();
        break;
      case 'error':
        content = renderError();
        break;
      case 'done':
        content = renderDone();
        break;
      default:
        content = renderPreview();
    }

    return el(
      Modal,
      {
        title: titleText,
        onRequestClose: onClose,
        className: 'agentic-export-modal',
        size: 'large',
      },
      content,
    );
  }

  /**
   * Open the create/resend modal.
   *
   * @param {number}        issueId                   Alpaca issue post ID.
   * @param {Object}        options
   * @param {string}        [options.mode]            'ai' (default) | 'locked'.
   * @param {Object|null}   [options.initialDraft]    Saved draft, required when mode is 'locked'.
   * @param {Array<Object>} [options.allowedBranches] Branch options to offer (defaults to all configured).
   */
  function openExportModal(issueId, options = {}) {
    const {
      mode = 'ai',
      initialDraft = null,
      allowedBranches = configuredBranches,
    } = options;

    renderModal(
      el(ExportModal, {
        issueId,
        mode,
        initialDraft,
        allowedBranches,
        onClose: closeModal,
      }),
    );
  }

  // ── ManageDraftModal ─────────────────────────────────────────────────────────

  /**
   * Read-only view of the saved draft, with "Delete draft" and
   * "Edit / regenerate draft" -- both are, mechanically, the same restart
   * (drop-draft): Delete stops there, Edit/regenerate immediately reopens the
   * normal AI-draft flow. Neither ever touches GitHub.
   *
   * @param {Object}   props
   * @param {number}   props.issueId   Alpaca issue post ID.
   * @param {Object}   props.draft     Saved draft (title/body).
   * @param {Function} props.onClose   Called when the modal should close with no further action.
   * @param {Function} props.onDeleted Called after a confirmed "Delete draft".
   * @param {Function} props.onRestart Called after a confirmed "Edit / regenerate draft".
   */
  function ManageDraftModal({ issueId, draft, onClose, onDeleted, onRestart }) {
    const [pendingAction, setPendingAction] = useState(null); // null | 'delete' | 'restart'
    const [working, setWorking] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const confirmAction = useCallback(async () => {
      setWorking(true);
      setErrorMsg('');

      try {
        await restPost('/drop-draft', { issue_id: issueId });
        notifyAgenticChange(issueId, 'deleted');

        if ('restart' === pendingAction) {
          onRestart();
        } else {
          onDeleted();
        }
      } catch (err) {
        setErrorMsg(err.message);
        setWorking(false);
      }
    }, [issueId, pendingAction, onDeleted, onRestart]);

    if (pendingAction) {
      const isRestart = 'restart' === pendingAction;
      const warning = isRestart
        ? __(
            'This restarts the whole workflow — you\'d need to send to Staging again from scratch, and "Apply fix to Production" resets. This only affects Alpaca; it does not change anything on GitHub. This cannot be undone.',
            'alpaca-issue-tracker',
          )
        : __(
            'Are you sure you want to delete the current draft? This restarts the whole workflow — you\'d need to send to Staging again from scratch, and "Apply fix to Production" resets. This only affects Alpaca; it does not change anything on GitHub. This cannot be undone.',
            'alpaca-issue-tracker',
          );

      return el(
        Modal,
        {
          title: __('Are you sure?', 'alpaca-issue-tracker'),
          onRequestClose: onClose,
          className: 'agentic-export-modal',
        },
        errorMsg &&
          el(Notice, { status: 'error', isDismissible: false }, errorMsg),
        el('p', null, warning),
        el(
          'div',
          { className: 'agentic-modal-actions' },
          working
            ? el(Spinner)
            : el(
                Fragment,
                null,
                el(
                  Button,
                  {
                    variant: 'primary',
                    isDestructive: true,
                    onClick: confirmAction,
                  },
                  isRestart
                    ? __('Restart workflow', 'alpaca-issue-tracker')
                    : __('Delete draft', 'alpaca-issue-tracker'),
                ),
                el(
                  Button,
                  {
                    variant: 'tertiary',
                    onClick: () => setPendingAction(null),
                  },
                  __('Back', 'alpaca-issue-tracker'),
                ),
              ),
        ),
      );
    }

    return el(
      Modal,
      {
        title: __('Manage existing draft', 'alpaca-issue-tracker'),
        onRequestClose: onClose,
        className: 'agentic-export-modal',
      },
      el(
        'div',
        { className: 'agentic-modal-form' },
        el(TextControl, {
          label: __('Issue title', 'alpaca-issue-tracker'),
          value: draft.title,
          disabled: true,
          className: 'agentic-field-title',
        }),
        el(TextareaControl, {
          label: __('Issue body', 'alpaca-issue-tracker'),
          value: draft.body,
          rows: 14,
          disabled: true,
          className: 'agentic-field-body',
        }),
      ),
      el(
        'div',
        { className: 'agentic-modal-actions' },
        el(
          Button,
          {
            variant: 'secondary',
            onClick: () => setPendingAction('restart'),
          },
          __('Edit / regenerate draft', 'alpaca-issue-tracker'),
        ),
        el(
          Button,
          {
            variant: 'secondary',
            isDestructive: true,
            onClick: () => setPendingAction('delete'),
          },
          __('Delete draft', 'alpaca-issue-tracker'),
        ),
        el(
          Button,
          { variant: 'tertiary', onClick: onClose },
          __('Close', 'alpaca-issue-tracker'),
        ),
      ),
    );
  }

  /**
   * Open the Manage existing draft modal.
   *
   * @param {number} issueId Alpaca issue post ID.
   * @param {Object} draft   Saved draft.
   */
  function openManageDraftModal(issueId, draft) {
    renderModal(
      el(ManageDraftModal, {
        issueId,
        draft,
        onClose: closeModal,
        onDeleted: closeModal,
        onRestart: () => openExportModal(issueId, { mode: 'ai' }),
      }),
    );
  }

  // ── ApplyStagingFixToProductionModal ─────────────────────────────────────────

  /**
   * Checks whether the staging fix has been merged, then applies it
   * (cherry-picked, no AI regeneration) to production on confirm.
   *
   * @param {Object}   props
   * @param {number}   props.issueId Alpaca issue post ID.
   * @param {Function} props.onClose Called when the modal should close.
   */
  function ApplyStagingFixToProductionModal({ issueId, onClose }) {
    const [phase, setPhase] = useState('checking'); // checking | blocked | confirm | applying | done | error
    const [errorMsg, setErrorMsg] = useState('');
    const [stagingFixStatus, setStagingFixStatus] = useState(null);

    const fetchStagingFixStatus = useCallback(async () => {
      setPhase('checking');
      setErrorMsg('');

      try {
        const data = await restPost('/staging-fix-status', {
          issue_id: issueId,
        });
        setStagingFixStatus(data);
        setPhase(data.merged ? 'confirm' : 'blocked');
      } catch (err) {
        setErrorMsg(err.message);
        setPhase('error');
      }
    }, [issueId]);

    useEffect(() => {
      fetchStagingFixStatus();
    }, [fetchStagingFixStatus]);

    const applyStagingFixToProduction = useCallback(async () => {
      setPhase('applying');
      setErrorMsg('');

      try {
        await restPost('/apply-staging-fix-to-production', {
          issue_id: issueId,
        });
        notifyAgenticChange(issueId, 'applied');
        setPhase('done');
      } catch (err) {
        setErrorMsg(err.message);
        setPhase('confirm');
      }
    }, [issueId]);

    const stagingLabel = BRANCH_ROLE_LABELS.staging;
    const productionLabel = BRANCH_ROLE_LABELS.production;

    let content;

    if ('checking' === phase) {
      content = el(
        'div',
        { className: 'agentic-modal-loading' },
        el(Spinner),
        el(
          'p',
          null,
          __(
            'Checking whether the fix has been merged…',
            'alpaca-issue-tracker',
          ),
        ),
      );
    } else if ('blocked' === phase) {
      const message = stagingFixStatus?.staging_pr_number
        ? sprintf(
            /* translators: 1: staging branch role label, 2: pull request number. */
            __(
              "The fix for %1$s hasn't been merged yet. Merge PR #%2$d first.",
              'alpaca-issue-tracker',
            ),
            stagingLabel,
            stagingFixStatus.staging_pr_number,
          )
        : sprintf(
            /* translators: %s: staging branch role label. */
            __(
              'No pull request found yet for %s. Wait for the AI agent to open one, then merge it before applying the fix here.',
              'alpaca-issue-tracker',
            ),
            stagingLabel,
          );

      content = el(
        Fragment,
        null,
        el(Notice, { status: 'warning', isDismissible: false }, message),
        el(
          'div',
          { className: 'agentic-modal-actions' },
          el(
            Button,
            { variant: 'tertiary', onClick: onClose },
            __('Close', 'alpaca-issue-tracker'),
          ),
        ),
      );
    } else if ('confirm' === phase || 'applying' === phase) {
      const isApplying = 'applying' === phase;

      content = el(
        Fragment,
        null,
        errorMsg &&
          el(
            Notice,
            {
              status: 'error',
              isDismissible: true,
              onRemove: () => setErrorMsg(''),
            },
            errorMsg,
          ),
        el(
          'p',
          null,
          sprintf(
            /* translators: 1: staging pull request number, 2: production branch role label. */
            __('Apply the fix from PR #%1$d to %2$s?', 'alpaca-issue-tracker'),
            stagingFixStatus.staging_pr_number,
            productionLabel,
          ),
        ),
        el(
          'div',
          { className: 'agentic-modal-actions' },
          isApplying
            ? el(Spinner)
            : el(
                Fragment,
                null,
                el(
                  Button,
                  {
                    variant: 'primary',
                    className: 'agentic-agent-btn',
                    onClick: applyStagingFixToProduction,
                  },
                  __('Apply fix to Production', 'alpaca-issue-tracker'),
                ),
                el(
                  Button,
                  { variant: 'tertiary', onClick: onClose },
                  __('Cancel', 'alpaca-issue-tracker'),
                ),
              ),
        ),
      );
    } else if ('done' === phase) {
      content = el(
        Fragment,
        null,
        el(
          Notice,
          { status: 'success', isDismissible: false },
          __('Fix applied to Production.', 'alpaca-issue-tracker'),
        ),
        el(
          'div',
          { className: 'agentic-modal-actions' },
          el(
            Button,
            { variant: 'primary', onClick: onClose },
            __('Done', 'alpaca-issue-tracker'),
          ),
        ),
      );
    } else {
      content = el(
        Fragment,
        null,
        el(
          Notice,
          { status: 'error', isDismissible: false },
          errorMsg || __('Something went wrong.', 'alpaca-issue-tracker'),
        ),
        el(
          'div',
          { className: 'agentic-modal-actions' },
          el(
            Button,
            { variant: 'tertiary', onClick: onClose },
            __('Close', 'alpaca-issue-tracker'),
          ),
        ),
      );
    }

    return el(
      Modal,
      {
        title: __('Apply tested fix to Production', 'alpaca-issue-tracker'),
        onRequestClose: onClose,
        className: 'agentic-export-modal',
      },
      content,
    );
  }

  /**
   * Open the Apply fix to Production modal.
   *
   * @param {number} issueId Alpaca issue post ID.
   */
  function openApplyStagingFixToProductionModal(issueId) {
    renderModal(
      el(ApplyStagingFixToProductionModal, {
        issueId,
        onClose: closeModal,
      }),
    );
  }

  // ── alpaca.issue.abovetabs ──────────────────────────────────────────────────
  // Injects the AI Issue Resolver buttons above the tabs in the issue detail panel.

  addFilter(
    'alpaca.issue.abovetabs',
    'alpaca-issue-tracker/agentic-issue-button',
    (_current, { issueId, meta }) => {
      // Setup must be complete, and the current user must be an admin or an
      // approved engineer — everyone else never sees this button.
      if (!setupCompleted || !isAuthorized) {
        return _current;
      }

      // At least one Staging / Production branch must be mapped.
      if (!hasConfiguredBranches) {
        return el(
          'div',
          { className: 'agentic-abovetabs-bar agentic-abovetabs-bar--notice' },
          el(
            'p',
            { className: 'agentic-branches-required-notice' },
            __(
              'To send this issue to the AI agent, map at least one Staging or Production branch under Project Board → AI Issue Resolver → GitHub Setup.',
              'alpaca-issue-tracker',
            ),
          ),
        );
      }

      const draft = readAgenticDraftFromMeta(meta);
      const sentBranches = new Set(getSentBranchesInCurrentCycle(meta));
      const handledBranches = new Set(getHandledBranchesInCurrentCycle(meta));
      const unhandledBranches = configuredBranches.filter(
        ({ branch }) => !handledBranches.has(branch),
      );

      const buttons = [];

      if (!draft) {
        buttons.push(
          el(
            Button,
            {
              key: 'fix-with-ai',
              variant: 'primary',
              className: 'agentic-agent-btn',
              icon: GITHUB_ICON,
              onClick: () => openExportModal(issueId, { mode: 'ai' }),
            },
            __('Fix with AI', 'alpaca-issue-tracker'),
          ),
        );
      } else {
        if (unhandledBranches.length) {
          buttons.push(
            el(
              Button,
              {
                key: 'fix-with-ai',
                variant: 'primary',
                className: 'agentic-agent-btn',
                icon: GITHUB_ICON,
                onClick: () =>
                  openExportModal(issueId, {
                    mode: 'locked',
                    initialDraft: draft,
                    allowedBranches: unhandledBranches,
                  }),
              },
              __('Fix with AI', 'alpaca-issue-tracker'),
            ),
          );
        }

        buttons.push(
          el(
            Button,
            {
              key: 'manage-draft',
              variant: 'secondary',
              className: 'agentic-agent-btn-secondary',
              onClick: () => openManageDraftModal(issueId, draft),
            },
            __('Manage existing draft', 'alpaca-issue-tracker'),
          ),
        );

        // Applying a tested fix only supports staging to production.
        const stagingOption = configuredBranches.find(
          ({ role }) => 'staging' === role,
        );
        const productionOption = configuredBranches.find(
          ({ role }) => 'production' === role,
        );

        if (
          stagingOption &&
          productionOption &&
          sentBranches.has(stagingOption.branch) &&
          !handledBranches.has(productionOption.branch)
        ) {
          buttons.push(
            el(
              Button,
              {
                key: 'apply-staging-fix-to-production',
                variant: 'secondary',
                className: 'agentic-agent-btn-secondary',
                onClick: () => openApplyStagingFixToProductionModal(issueId),
              },
              __('Apply fix to Production', 'alpaca-issue-tracker'),
            ),
          );
        }
      }

      return el('div', { className: 'agentic-abovetabs-bar' }, ...buttons);
    },
  );
})();
