/**
 * Alpaca Fix with AI
 *
 * Injects Fix with AI / Request a change / Start over into the issue detail view.
 *
 * Relies on globals loaded by Alpaca:
 *   wp.element   (React)
 *   wp.components
 *   wp.hooks
 *   wp.i18n
 *   agenticConfig    (localized by PHP onto alpaca-script)
 */

import {
  groupAgenticHistoryIntoSessions,
  hasAgenticHistory,
  hasAgenticSentEntry,
  readAgenticHistoryFromMeta,
  rememberAgenticSessionFocus,
  rememberLivePullRequests,
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
    Notice,
    Spinner,
  } = wp.components;
  const { addFilter } = wp.hooks;
  const { __, sprintf } = wp.i18n;

  const { restBase, nonce, setupCompleted, isAuthorized, aiTargetBranch } =
    window.agenticConfig || {};

  const ALLOWED_DRAFT_LABELS = new Set([
    'bug',
    'enhancement',
    'agent-candidate',
    'agent-ready',
  ]);

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

  /**
   * Parse a WP REST JSON response and throw on HTTP/API errors.
   *
   * @param {Response} response Fetch response.
   * @return {Promise<Object>} Parsed response data.
   * @throws {Error} On HTTP or API errors.
   */
  async function parseRestResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      const err = new Error(
        data.message || __('Request failed.', 'alpaca-issue-tracker'),
      );
      err.code = data.code || '';
      err.data = data.data || null;
      throw err;
    }

    return data;
  }

  /**
   * GET a WP REST endpoint with the wp_rest nonce.
   *
   * @param {string} path Relative path under restBase, including query string.
   * @return {Promise<Object>} Parsed response data.
   */
  async function restGet(path) {
    const response = await fetch(restBase + path, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'X-WP-Nonce': nonce,
      },
    });

    return parseRestResponse(response);
  }

  /**
   * POST to a WP REST endpoint with the wp_rest nonce.
   *
   * @param {string} path    Relative path under restBase.
   * @param {Object} payload Request body.
   * @return {Promise<Object>} Parsed response data.
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

    return parseRestResponse(response);
  }

  /**
   * Tell the rest of Alpaca an agentic workflow event happened.
   *
   * @param {number} issueId  Alpaca issue post ID.
   * @param {string} mutation Agentic mutation that completed.
   */
  function notifyAgenticChange(issueId, mutation) {
    if (wp.hooks && 'function' === typeof wp.hooks.doAction) {
      wp.hooks.doAction('alpaca.commentCountChanged', { issueId });
      wp.hooks.doAction('alpaca.agentic.changed', { issueId, mutation });
    }
  }

  /**
   * Share live GitHub pull request status with the AI Log tab.
   *
   * @param {number}        issueId      Alpaca issue post ID.
   * @param {Array<Object>} pullRequests Pull request summaries.
   */
  function notifyAgenticGithubStatus(issueId, pullRequests) {
    const list = Array.isArray(pullRequests) ? pullRequests : [];
    rememberLivePullRequests(issueId, list);
    if (wp.hooks && 'function' === typeof wp.hooks.doAction) {
      wp.hooks.doAction('alpaca.agentic.status', {
        issueId,
        pullRequests: list,
      });
    }
  }

  /**
   * Help text for the Request a change form.
   *
   * @param {Object|null} githubStatus Live start-over-status payload.
   * @return {string} Help text.
   */
  function requestChangeHelp(githubStatus) {
    const mode = String(githubStatus?.request_change_mode || '');
    if ('comment_pr' === mode) {
      return __(
        'Your notes will be posted on the open pull request. The AI will update that PR instead of opening a new one.',
        'alpaca-issue-tracker',
      );
    }
    if ('comment_issue' === mode) {
      return __(
        'Your notes will be posted on the GitHub issue so the AI can include them before it opens a pull request.',
        'alpaca-issue-tracker',
      );
    }
    if ('retry_pr' === mode) {
      return __(
        'The previous pull request was closed without merging. The AI will open a new pull request that includes these changes.',
        'alpaca-issue-tracker',
      );
    }
    if (aiTargetBranch) {
      return sprintf(
        /* translators: %s: AI target branch name. */
        __(
          'The AI will open a new pull request into %s, on top of the current code.',
          'alpaca-issue-tracker',
        ),
        aiTargetBranch,
      );
    }
    return '';
  }

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

  /**
   * Shared modal title with the GitHub/AI icon.
   *
   * @param {string} text Title text.
   * @return {Object} Element.
   */
  function modalTitle(text) {
    return el(
      'span',
      { className: 'agentic-modal-header' },
      el(
        'span',
        { className: 'agentic-modal-header-icon', 'aria-hidden': 'true' },
        '✦',
      ),
      text,
    );
  }

  /**
   * Default copy when a request is not suitable for the agentic workflow.
   *
   * @param {'draft'|'request_change'} context Where the check ran.
   * @return {string} Fallback message.
   */
  function defaultUnsuitableReason(context) {
    if ('request_change' === context) {
      return __(
        'These notes are not suitable for the GitHub agentic workflow. Request a change only sends follow-up instructions for bounded code changes in the connected repository.',
        'alpaca-issue-tracker',
      );
    }

    return __(
      'This request is not suitable for the GitHub agentic workflow. Fix with AI only handles bounded code changes in the connected repository.',
      'alpaca-issue-tracker',
    );
  }

  /**
   * Confirm dialog when continuing after an unsuitable verdict.
   *
   * @param {Object}   props
   * @param {string}   props.reason      Unsuitable reason from the AI.
   * @param {string}   props.context     'draft' or 'request_change'.
   * @param {string}   props.confirmLabel Primary button label.
   * @param {Function} props.onConfirm   Called when the user confirms.
   * @param {Function} props.onCancel    Called when the user cancels.
   * @return {Object} Modal element.
   */
  function UnsuitableConfirmModal({
    reason,
    context,
    confirmLabel,
    onConfirm,
    onCancel,
  }) {
    return el(
      Modal,
      {
        title: modalTitle(
          __('Not suitable for the AI workflow', 'alpaca-issue-tracker'),
        ),
        onRequestClose: onCancel,
        className: 'agentic-export-modal agentic-unsuitable-confirm-modal',
      },
      el(
        Notice,
        { status: 'error', isDismissible: false },
        reason || defaultUnsuitableReason(context),
      ),
      el(
        'p',
        { className: 'agentic-choice-copy' },
        __(
          'Are you sure you want to continue?',
          'alpaca-issue-tracker',
        ),
      ),
      el(
        'div',
        { className: 'agentic-modal-actions' },
        el(
          Button,
          {
            variant: 'primary',
            className: 'agentic-agent-btn',
            onClick: onConfirm,
          },
          confirmLabel,
        ),
        el(
          Button,
          { variant: 'tertiary', onClick: onCancel },
          __('Cancel', 'alpaca-issue-tracker'),
        ),
      ),
    );
  }

  /**
   * Preview and confirm modal shown before creating a new GitHub issue.
   *
   * @param {Object}   props
   * @param {number}   props.issueId Alpaca issue post ID.
   * @param {Function} props.onClose Called when the modal should close.
   */
  function ExportModal({ issueId, onClose }) {
    const [phase, setPhase] = useState('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [complexity, setComplexity] = useState('medium');
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [suspicious, setSuspicious] = useState(false);
    const [suspiciousReason, setSuspiciousReason] = useState('');
    const [suitableForAgent, setSuitableForAgent] = useState(true);
    const [unsuitableReason, setUnsuitableReason] = useState('');
    const [createAnyway, setCreateAnyway] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const fetchDraftData = useCallback(async () => {
      setPhase('loading');
      setErrorMsg('');
      setSuspicious(false);
      setSuspiciousReason('');
      setSuitableForAgent(true);
      setUnsuitableReason('');
      setCreateAnyway(false);
      setConfirmAction(null);

      try {
        const draftData = await restPost('/draft', { issue_id: issueId });

        setTitle(draftData.title || '');
        setBody(draftData.body || '');
        setComplexity(draftData.complexity || 'medium');
        setSelectedLabels(
          (draftData.labels || []).filter((labelName) =>
            ALLOWED_DRAFT_LABELS.has(labelName),
          ),
        );
        setSuspicious(!!draftData.suspicious);
        setSuspiciousReason(
          draftData.suspicious
            ? String(draftData.suspicious_reason || '').trim()
            : '',
        );
        const isSuitable = draftData.suitable_for_agent !== false;
        setSuitableForAgent(isSuitable);
        setUnsuitableReason(
          isSuitable
            ? ''
            : String(draftData.unsuitable_reason || '').trim(),
        );
        setPhase('preview');
      } catch (err) {
        setErrorMsg(err.message);
        setPhase('error');
      }
    }, [issueId]);

    useEffect(() => {
      fetchDraftData();
    }, [fetchDraftData]);

    const createGithubIssue = useCallback(async () => {
      if (!suitableForAgent && !createAnyway) {
        return;
      }

      setPhase('creating');
      setErrorMsg('');

      const labels = [
        ...new Set([
          ...selectedLabels,
          'complexity:' + complexity,
          'agent-ready',
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
    }, [
      issueId,
      title,
      body,
      complexity,
      selectedLabels,
      suitableForAgent,
      createAnyway,
    ]);

    const confirmUnsuitableAction = useCallback(() => {
      const action = confirmAction;
      setConfirmAction(null);
      if ('create_anyway' === action) {
        setCreateAnyway(true);
        return;
      }
      if ('regenerate' === action) {
        fetchDraftData();
      }
    }, [confirmAction, fetchDraftData]);

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
      const isUnsuitable = !suitableForAgent;
      const canCreate =
        !!title.trim() &&
        !!body.trim() &&
        (!isUnsuitable || createAnyway);
      const unsuitableMessage =
        unsuitableReason || defaultUnsuitableReason('draft');

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
        isUnsuitable &&
          el(
            Notice,
            {
              status: 'error',
              isDismissible: false,
            },
            unsuitableMessage,
          ),
        suspicious &&
          el(
            Notice,
            {
              status: 'warning',
              isDismissible: false,
            },
            suspiciousReason ||
              __(
                'This draft may contain content that looks like instructions for an AI agent rather than a genuine bug report. Review the title and body carefully before creating the GitHub issue.',
                'alpaca-issue-tracker',
              ),
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
          aiTargetBranch
            ? el(
                'p',
                { className: 'agentic-branches-required-notice' },
                sprintf(
                  /* translators: %s: AI target branch name. */
                  __('The AI will open a pull request into %s.', 'alpaca-issue-tracker'),
                  aiTargetBranch,
                ),
              )
            : null,
        ),
        el(
          'div',
          { className: 'agentic-modal-actions' },
          isCreating
            ? el(Spinner)
            : el(
                Fragment,
                null,
                (!isUnsuitable || createAnyway) &&
                  el(
                    Button,
                    {
                      variant: 'primary',
                      className: 'agentic-agent-btn',
                      onClick: createGithubIssue,
                      disabled: !canCreate,
                    },
                    __('Create a GitHub issue', 'alpaca-issue-tracker'),
                  ),
                isUnsuitable &&
                  !createAnyway &&
                  el(
                    Button,
                    {
                      variant: 'secondary',
                      className: 'agentic-agent-btn-secondary',
                      onClick: () => setConfirmAction('create_anyway'),
                      disabled: !title.trim() || !body.trim(),
                    },
                    __('Create anyway', 'alpaca-issue-tracker'),
                  ),
                el(
                  Button,
                  {
                    variant: 'secondary',
                    className: 'agentic-agent-btn-secondary',
                    onClick: () => {
                      if (isUnsuitable) {
                        setConfirmAction('regenerate');
                        return;
                      }
                      fetchDraftData();
                    },
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
        confirmAction
          ? el(UnsuitableConfirmModal, {
              reason: unsuitableMessage,
              context: 'draft',
              confirmLabel:
                'regenerate' === confirmAction
                  ? __('Regenerate', 'alpaca-issue-tracker')
                  : __('Create anyway', 'alpaca-issue-tracker'),
              onConfirm: confirmUnsuitableAction,
              onCancel: () => setConfirmAction(null),
            })
          : null,
      );
    }

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
        title: modalTitle(
          __('Create an agent-ready issue on GitHub', 'alpaca-issue-tracker'),
        ),
        onRequestClose: onClose,
        className: 'agentic-export-modal',
        size: 'large',
      },
      content,
    );
  }

  /**
   * Follow-up: comment on in-flight GitHub work, or open a new GitHub issue.
   *
   * @param {Object}      props
   * @param {number}      props.issueId      Alpaca issue post ID.
   * @param {Object|null} props.githubStatus Live start-over-status payload.
   * @param {Function}    props.onClose      Called when the modal should close.
   */
  function RequestChangeModal({ issueId, githubStatus, onClose }) {
    const [notes, setNotes] = useState('');
    const [phase, setPhase] = useState('form');
    const [errorMsg, setErrorMsg] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [resultAction, setResultAction] = useState('created');
    const [unsuitable, setUnsuitable] = useState(false);
    const [unsuitableReason, setUnsuitableReason] = useState('');
    const [requestAnyway, setRequestAnyway] = useState(false);
    const [confirmAnyway, setConfirmAnyway] = useState(false);

    const updateNotes = useCallback((value) => {
      setNotes(value);
      setUnsuitable(false);
      setUnsuitableReason('');
      setRequestAnyway(false);
      setConfirmAnyway(false);
      setErrorMsg('');
    }, []);

    const sendRequestedChanges = useCallback(
      async (force = false) => {
        if (!notes.trim()) {
          setErrorMsg(
            __('Describe the changes you want.', 'alpaca-issue-tracker'),
          );
          return;
        }

        if (unsuitable && !force && !requestAnyway) {
          return;
        }

        setPhase('creating');
        setErrorMsg('');
        setConfirmAnyway(false);

        try {
          const data = await restPost('/request-change', {
            issue_id: issueId,
            notes: notes.trim(),
            force: !!(force || requestAnyway),
          });
          setGithubUrl(data.url || '');
          setResultAction(
            'commented' === data.action ? 'commented' : 'created',
          );
          setPhase('done');
          notifyAgenticChange(issueId, 'sent');
        } catch (err) {
          if ('unsuitable_for_agent' === err.code) {
            setUnsuitable(true);
            setUnsuitableReason(String(err.message || '').trim());
            setRequestAnyway(false);
            setConfirmAnyway(false);
            setErrorMsg('');
            setPhase('form');
            return;
          }

          setErrorMsg(err.message);
          setPhase('form');
        }
      },
      [issueId, notes, unsuitable, requestAnyway],
    );

    const doneMessage =
      'commented' === resultAction
        ? __('Requested changes posted on GitHub! ', 'alpaca-issue-tracker')
        : __('Follow-up issue created on GitHub! ', 'alpaca-issue-tracker');

    let content;
    if ('done' === phase) {
      content = el(
        Fragment,
        null,
        el(
          Notice,
          { status: 'success', isDismissible: false },
          el(
            'span',
            null,
            doneMessage,
            githubUrl &&
              el(
                'a',
                {
                  href: githubUrl,
                  target: '_blank',
                  rel: 'noreferrer noopener',
                },
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
    } else {
      const canSubmit = !!notes.trim();
      const showPrimarySubmit = !unsuitable || requestAnyway;
      const unsuitableMessage =
        unsuitableReason || defaultUnsuitableReason('request_change');

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
        unsuitable &&
          el(
            Notice,
            {
              status: 'error',
              isDismissible: false,
            },
            unsuitableMessage,
          ),
        el(TextareaControl, {
          className: 'agentic-request-change-field',
          label: __('What still needs to change?', 'alpaca-issue-tracker'),
          help: requestChangeHelp(githubStatus),
          value: notes,
          onChange: updateNotes,
          rows: 8,
          disabled: 'creating' === phase,
        }),
        el(
          'div',
          { className: 'agentic-modal-actions' },
          'creating' === phase
            ? el(Spinner)
            : el(
                Fragment,
                null,
                showPrimarySubmit &&
                  el(
                    Button,
                    {
                      variant: 'primary',
                      className: 'agentic-agent-btn',
                      onClick: () => sendRequestedChanges(requestAnyway),
                      disabled: !canSubmit,
                    },
                    __('Request a change', 'alpaca-issue-tracker'),
                  ),
                unsuitable &&
                  !requestAnyway &&
                  el(
                    Button,
                    {
                      variant: 'secondary',
                      className: 'agentic-agent-btn-secondary',
                      onClick: () => setConfirmAnyway(true),
                      disabled: !canSubmit,
                    },
                    __('Request anyway', 'alpaca-issue-tracker'),
                  ),
                el(
                  Button,
                  { variant: 'tertiary', onClick: onClose },
                  __('Cancel', 'alpaca-issue-tracker'),
                ),
              ),
        ),
        confirmAnyway
          ? el(UnsuitableConfirmModal, {
              reason: unsuitableMessage,
              context: 'request_change',
              confirmLabel: __('Request anyway', 'alpaca-issue-tracker'),
              onConfirm: () => {
                setConfirmAnyway(false);
                setRequestAnyway(true);
              },
              onCancel: () => setConfirmAnyway(false),
            })
          : null,
      );
    }

    return el(
      Modal,
      {
        title: modalTitle(__('Request a change', 'alpaca-issue-tracker')),
        onRequestClose: onClose,
        className: 'agentic-export-modal',
      },
      content,
    );
  }

  /**
   * Confirm Start over and end the current fixing session.
   *
   * @param {Object}   props
   * @param {number}   props.issueId            Alpaca issue post ID.
   * @param {boolean}  props.willResetBranch    Whether the target branch will rewind.
   * @param {boolean}  props.hasOutsideCommits  Whether outside commits block a rewind.
   * @param {string}   props.resetBlockedReason Why the branch will be left as it is.
   * @param {Function} props.onClose            Called when the modal should close.
   */
  function StartOverModal({
    issueId,
    willResetBranch,
    hasOutsideCommits,
    resetBlockedReason,
    onClose,
  }) {
    const [phase, setPhase] = useState('confirm');
    const [errorMsg, setErrorMsg] = useState('');
    const [doneMessage, setDoneMessage] = useState('');

    const confirmStartOver = useCallback(async () => {
      setPhase('working');
      setErrorMsg('');

      try {
        const data = await restPost('/start-over', { issue_id: issueId });
        let message = __(
          'This fix attempt ended. You can send this issue to the AI again.',
          'alpaca-issue-tracker',
        );

        if (data?.branch_reset) {
          message = __(
            'This fix attempt ended. The AI target branch was moved back to the commit from before the attempt.',
            'alpaca-issue-tracker',
          );
        } else if (data?.branch_reset_error) {
          message = sprintf(
            /* translators: %s: error message from GitHub. */
            __(
              'This fix attempt ended, but the AI target branch could not be reset: %s',
              'alpaca-issue-tracker',
            ),
            data.branch_reset_error,
          );
        } else if (data?.has_outside_commits) {
          message = __(
            'This fix attempt ended. The AI target branch was left as it is because outside changes were pushed during the attempt.',
            'alpaca-issue-tracker',
          );
        } else if (data?.reset_blocked_reason) {
          message = data.reset_blocked_reason;
        }

        setDoneMessage(message);
        setPhase('done');
        notifyAgenticChange(issueId, 'reverted');
      } catch (err) {
        setErrorMsg(err.message);
        setPhase('confirm');
      }
    }, [issueId]);

    let branchOutcomeMessage = resetBlockedReason;
    if (willResetBranch) {
      branchOutcomeMessage = __(
        'Since no outside changes were pushed to the AI target branch during this attempt, Start over will revert it to the state it had before the attempt.',
        'alpaca-issue-tracker',
      );
    } else if (hasOutsideCommits) {
      branchOutcomeMessage = __(
        'Since outside changes were pushed to the AI target branch during this attempt, Start over cannot revert it to the state it had before the attempt.',
        'alpaca-issue-tracker',
      );
    } else if (!branchOutcomeMessage) {
      branchOutcomeMessage = __(
        'The AI target branch is already at the commit from before this attempt, so it will be left as it is.',
        'alpaca-issue-tracker',
      );
    }

    let content;
    if ('done' === phase) {
      content = el(
        Fragment,
        null,
        el(
          Notice,
          {
            status: 'success',
            isDismissible: false,
          },
          doneMessage,
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
          __(
            'This ends the current fix attempt and starts a new one. Alpaca will close any still-open GitHub issues and pull requests from this attempt.',
            'alpaca-issue-tracker',
          ),
        ),
        el(
          Notice,
          {
            status: willResetBranch ? 'warning' : 'info',
            isDismissible: false,
          },
          branchOutcomeMessage,
        ),
        el(
          'div',
          { className: 'agentic-modal-actions' },
          'working' === phase
            ? el(Spinner)
            : el(
                Fragment,
                null,
                el(
                  Button,
                  {
                    variant: 'primary',
                    isDestructive: true,
                    onClick: confirmStartOver,
                  },
                  __('Start over', 'alpaca-issue-tracker'),
                ),
                el(
                  Button,
                  { variant: 'tertiary', onClick: onClose },
                  __('Cancel', 'alpaca-issue-tracker'),
                ),
              ),
        ),
      );
    }

    return el(
      Modal,
      {
        title: modalTitle(__('Start over', 'alpaca-issue-tracker')),
        onRequestClose: onClose,
        className: 'agentic-export-modal',
      },
      content,
    );
  }

  /**
   * Fix attempt number for the current fixing session.
   *
   * @param {Object} meta Issue meta payload.
   * @return {number} Attempt number, starting at 1.
   */
  function readCurrentFixAttemptNumber(meta) {
    const sessions = groupAgenticHistoryIntoSessions(
      readAgenticHistoryFromMeta(meta),
    );
    const current = sessions.find((session) => session.isCurrent);
    return current?.number || sessions[0]?.number || 1;
  }

  /**
   * Open the AI Log tab for this issue.
   *
   * @param {number} issueId Alpaca issue post ID.
   */
  function openAiLogTab(issueId) {
    rememberAgenticSessionFocus(issueId);
    if (wp.hooks && 'function' === typeof wp.hooks.doAction) {
      wp.hooks.doAction('alpaca.issue.selectTab', 'agentic', issueId);
      wp.hooks.doAction('alpaca.agentic.focusCurrentSession', issueId);
    }
  }

  /**
   * Short status line below the title; full details live in the AI Log tab.
   *
   * @param {Object} meta    Issue meta payload.
   * @param {number} issueId Alpaca issue post ID.
   * @return {Object} Element.
   */
  function renderFixAttemptSummaryMessage(meta, issueId) {
    const attemptNumber = readCurrentFixAttemptNumber(meta);
    const attemptLabel = sprintf(
      /* translators: %d: fix attempt number, starting at 1. */
      __('Fix attempt %d', 'alpaca-issue-tracker'),
      attemptNumber,
    );

    return el(
      'span',
      { className: 'agentic-abovetabs-info__summary' },
      el(
        Button,
        {
          variant: 'link',
          className: 'agentic-abovetabs-info__attempt-link',
          onClick: (event) => {
            event.preventDefault();
            openAiLogTab(issueId);
          },
        },
        attemptLabel,
      ),
      __(' in progress', 'alpaca-issue-tracker'),
    );
  }

  /**
   * Issue-header actions: first send, or Request a change + Start over.
   *
   * @param {Object} props
   * @param {number} props.issueId Alpaca issue post ID.
   * @param {Object} props.meta    Issue meta payload.
   * @return {Object} Element.
   */
  function AgenticIssueActions({ issueId, meta }) {
    const hasSent = hasAgenticSentEntry(meta);
    const hasHistory = hasAgenticHistory(meta);
    const [statusNonce, setStatusNonce] = useState(0);
    const [statusLoading, setStatusLoading] = useState(hasSent);
    const [statusError, setStatusError] = useState('');
    const [githubStatus, setGithubStatus] = useState(null);

    useEffect(() => {
      if (!hasHistory) {
        setStatusLoading(false);
        setStatusError('');
        setGithubStatus(null);
        notifyAgenticGithubStatus(issueId, []);
        return;
      }

      let cancelled = false;
      setStatusError('');

      const loadGithubStatus = () => {
        setStatusLoading(true);
        restGet('/start-over-status?issue_id=' + encodeURIComponent(issueId))
          .then((data) => {
            if (cancelled) {
              return;
            }
            setGithubStatus(data || null);
            setStatusError('');
            notifyAgenticGithubStatus(
              issueId,
              Array.isArray(data?.pull_requests) ? data.pull_requests : [],
            );
          })
          .catch((err) => {
            if (cancelled) {
              return;
            }
            setGithubStatus(null);
            setStatusError(
              err.message ||
                __(
                  'Could not load GitHub pull request details for this issue.',
                  'alpaca-issue-tracker',
                ),
            );
          })
          .finally(() => {
            if (!cancelled) {
              setStatusLoading(false);
            }
          });
      };

      loadGithubStatus();

      const onAgenticChanged = (payload) => {
        if (payload?.issueId === issueId) {
          loadGithubStatus();
        }
      };

      if (wp.hooks && 'function' === typeof wp.hooks.addAction) {
        wp.hooks.addAction(
          'alpaca.agentic.changed',
          'alpaca-issue-tracker/agentic-start-over-status',
          onAgenticChanged,
        );
      }

      return () => {
        cancelled = true;
        if (wp.hooks && 'function' === typeof wp.hooks.removeAction) {
          wp.hooks.removeAction(
            'alpaca.agentic.changed',
            'alpaca-issue-tracker/agentic-start-over-status',
          );
        }
      };
    }, [hasHistory, hasSent, issueId, statusNonce]);

    const startOverAllowed = hasSent;
    const requestChangeAllowed = !!githubStatus?.request_change_allowed;
    const checkingGithub =
      hasSent && (statusLoading || (!githubStatus && !statusError));
    const infoMessageId = 'agentic-abovetabs-info-' + issueId;

    const fixWithAiButton = el(
      Button,
      {
        variant: 'primary',
        className: 'agentic-agent-btn',
        icon: GITHUB_ICON,
        onClick: () =>
          renderModal(el(ExportModal, { issueId, onClose: closeModal })),
      },
      __('Fix with AI', 'alpaca-issue-tracker'),
    );

    const requestChangeButton = el(
      Button,
      {
        variant: 'primary',
        className: 'agentic-agent-btn',
        icon: GITHUB_ICON,
        disabled: !requestChangeAllowed,
        'aria-describedby': infoMessageId,
        onClick: () =>
          renderModal(
            el(RequestChangeModal, {
              issueId,
              githubStatus,
              onClose: closeModal,
            }),
          ),
      },
      __('Request a change', 'alpaca-issue-tracker'),
    );

    const startOverButton = el(
      Button,
      {
        variant: 'primary',
        className: 'agentic-agent-btn',
        icon: GITHUB_ICON,
        disabled: !startOverAllowed,
        'aria-describedby': infoMessageId,
        onClick: () =>
          renderModal(
            el(StartOverModal, {
              issueId,
              willResetBranch: !!githubStatus?.will_reset_branch,
              hasOutsideCommits: !!githubStatus?.has_outside_commits,
              resetBlockedReason: githubStatus?.reset_blocked_reason || '',
              onClose: closeModal,
            }),
          ),
      },
      __('Start over', 'alpaca-issue-tracker'),
    );

    let info = null;
    let actions = null;

    if (checkingGithub) {
      info = el(
        'div',
        {
          className: 'agentic-abovetabs-info',
          id: infoMessageId,
          role: 'status',
        },
        el(Spinner),
        el(
          'span',
          null,
          __(
            'Alpaca is gathering information from GitHub…',
            'alpaca-issue-tracker',
          ),
        ),
      );
    } else if (hasSent && statusError) {
      info = el(
        'div',
        {
          className: 'agentic-abovetabs-info agentic-abovetabs-info--error',
          id: infoMessageId,
          role: 'alert',
        },
        el('span', null, statusError),
        el(
          Button,
          {
            variant: 'link',
            onClick: () => setStatusNonce((tick) => tick + 1),
          },
          __('Try again', 'alpaca-issue-tracker'),
        ),
      );
      actions = el(
        'div',
        { className: 'agentic-abovetabs-actions' },
        requestChangeButton,
        startOverButton,
      );
    } else {
      info = hasSent
        ? el(
            'div',
            {
              className: 'agentic-abovetabs-info',
              id: infoMessageId,
              role: 'status',
            },
            renderFixAttemptSummaryMessage(meta, issueId),
          )
        : null;
      actions = el(
        'div',
        { className: 'agentic-abovetabs-actions' },
        hasSent ? requestChangeButton : fixWithAiButton,
        hasSent ? startOverButton : null,
      );
    }

    return el(
      'div',
      { className: 'agentic-abovetabs-bar' },
      el(
        'h3',
        { className: 'agentic-abovetabs-title' },
        __('Fix with AI', 'alpaca-issue-tracker'),
      ),
      info,
      actions,
    );
  }

  addFilter(
    'alpaca.issue.abovetabs',
    'alpaca-issue-tracker/agentic-issue-button',
    (_current, { issueId, meta }) => {
      if (!setupCompleted || !isAuthorized) {
        return _current;
      }

      return el(AgenticIssueActions, { issueId, meta });
    },
  );
})();
