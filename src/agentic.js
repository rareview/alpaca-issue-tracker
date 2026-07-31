/**
 * Alpaca AI Issue Resolver
 *
 * Injects a "Send to AI agent on GitHub" action into the Alpaca issue detail
 * view. Clicking the action calls our WP REST endpoint to get an
 * AI-drafted agent-ready issue, shows a preview modal, then creates the GitHub
 * issue on confirm.
 *
 * Relies on globals loaded by Alpaca:
 *   wp.element   (React)
 *   wp.components
 *   wp.hooks
 *   wp.i18n
 *   agenticConfig    (localized by PHP onto alpaca-script)
 */

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
  const { __ } = wp.i18n;

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

  // ── Modal component ─────────────────────────────────────────────────────────

  /**
   * Preview and confirm modal shown before creating the GitHub issue.
   *
   * @param {Object}   props
   * @param {number}   props.issueId Alpaca issue post ID.
   * @param {Function} props.onClose Called when the modal should close.
   */
  function ExportModal({ issueId, onClose }) {
    const [phase, setPhase] = useState('loading'); // loading | preview | creating | done | error
    const [errorMsg, setErrorMsg] = useState('');
    const [githubUrl, setGithubUrl] = useState('');

    // Editable draft fields.
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [complexity, setComplexity] = useState('medium');
    const [selectedLabels, setSelectedLabels] = useState([]);
    // Required: GitHub branch name for the agent PR base.
    const [targetBranch, setTargetBranch] = useState(
      configuredBranches[0]?.branch || '',
    );

    // ── Fetch AI draft on mount ─────────────────────────────────────────────

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

    // Trigger on first render.
    useEffect(() => {
      fetchDraftData();
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

        // Tell the rest of Alpaca that this issue was sent to GitHub AI:
        // - commentCountChanged → reload the activity/comments timeline
        // - agentic.sent → refetch issue details (history tab, "Sent to AI" label)
        if (wp.hooks && 'function' === typeof wp.hooks.doAction) {
          wp.hooks.doAction('alpaca.commentCountChanged', { issueId });
          wp.hooks.doAction('alpaca.agentic.sent', { issueId });
        }
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

      const targetBranchOptions = configuredBranches.map(
        ({ branch, label }) => ({
          value: branch,
          label,
        }),
      );

      return el(
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
          'div',
          { className: 'agentic-modal-form' },
          el(TextControl, {
            label: __('Issue title', 'alpaca-issue-tracker'),
            value: title,
            onChange: setTitle,
            disabled: isCreating,
            className: 'agentic-field-title',
          }),
          el(TextareaControl, {
            label: __('Issue body', 'alpaca-issue-tracker'),
            value: body,
            onChange: setBody,
            rows: 18,
            disabled: isCreating,
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
              disabled: isCreating,
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
                  disabled: isCreating,
                }),
              ),
            ),
          ),
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
      __('Create AI agent issue', 'alpaca-issue-tracker'),
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

  // ── Portal helper ───────────────────────────────────────────────────────────

  /**
   * Mount (or unmount) the ExportModal into a dedicated DOM node.
   * AKA attach the modal to the div with id 'agentic-modal-root'.
   *
   * @param {number|null} issueId Alpaca issue ID to export, or null to close.
   */
  function openExportModal(issueId) {
    let container = document.getElementById('agentic-modal-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'agentic-modal-root';
      document.body.appendChild(container);
    }

    if (null === issueId) {
      wp.element.render(null, container);
      return;
    }

    wp.element.render(
      el(ExportModal, {
        issueId,
        onClose: () => openExportModal(null),
      }),
      container,
    );
  }

  // ── alpaca.issue.abovetabs ──────────────────────────────────────────────────
  // Injects a button above the tabs in the Alpaca issue detail panel.

  addFilter(
    'alpaca.issue.abovetabs',
    'alpaca-issue-tracker/agentic-issue-button',
    (_current, { issueId }) => {
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

      return el(
        'div',
        { className: 'agentic-abovetabs-bar' },
        el(
          Button,
          {
            variant: 'primary',
            className: 'agentic-agent-btn',
            icon: el(
              'svg',
              {
                viewBox: '0 0 16 16',
                width: 16,
                height: 16,
                fill: 'currentColor',
                'aria-hidden': 'true',
              },
              // GitHub mark SVG path.
              el('path', {
                d: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z',
              }),
            ),
            onClick: () => openExportModal(issueId),
          },
          __('Send to AI agent on GitHub', 'alpaca-issue-tracker'),
        ),
      );
    },
  );
})();
