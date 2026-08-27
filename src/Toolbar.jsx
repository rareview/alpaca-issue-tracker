import PropTypes from 'prop-types';
import handleSnapdomCapture from './snapdomHandler.js';
import { dataUrlToFile, uploadIssueAttachment } from './utils/attachmentUpload';
import { useTestLogger } from './utils/testLogger.js';
import { isTestLoggingEnabled } from './utils/testLogSetting.js';
import Icon from './components/icons/Icon';
import ActivityPopover from './components/ActivityPopover';
import InboxControl from './components/InboxControl';
import { buildAlpacaRestUrl, getAlpacaRestNonce } from './utils/restApiRoot.js';
import { getProjectBoardUrl } from './utils/projectBoardUrl.js';
import {
  ensureAlpacaReportContext,
  getAlpacaReportContext,
} from './utils/reportContext.js';

const { __ } = wp.i18n;
const { Button, TextareaControl, Spinner, ToggleControl } = wp.components;
const { doAction } = wp.hooks;
const { useState, useRef, useEffect, useCallback } = wp.element;

const FORM_CLOSE_RESET_DELAY_MS = 300;

/**
 * Bottom Toolbar component for Alpaca Issue Tracker issue reporting.
 * Dark admin bar theme with WP Components form.
 *
 * @param {Object}  props                 Component props.
 * @param {boolean} props.showInbox       Whether to show Inbox.
 * @param {boolean} props.showActivity    Whether to show Project Activity.
 * @return {JSX.Element} Toolbar component
 */
const AlpacaToolbar = ({ showInbox, showActivity }) => {
  const [isExpanded, setIsExpanded] = useState(true); // Open by default
  const [isFormVisible, setFormVisible] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isHighPriority, setIsHighPriority] = useState(false);

  const textareaRef = useRef(null);
  const formRef = useRef(null);
  const reportButtonRef = useRef(null);
  const closeResetTimeoutRef = useRef(null);
  const [enableTestLogs, setEnableTestLogs] = useState(isTestLoggingEnabled);

  useEffect(() => {
    const handleTestLogSettingChange = (value) => {
      setEnableTestLogs(Boolean(value));
    };

    wp.hooks.addAction(
      'alpaca.enableTestLogsChanged',
      'alpaca/toolbar',
      handleTestLogSettingChange,
    );

    return () => {
      wp.hooks.removeAction('alpaca.enableTestLogsChanged', 'alpaca/toolbar');
    };
  }, []);

  useTestLogger(enableTestLogs);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const clearCloseResetTimeout = useCallback(() => {
    if (closeResetTimeoutRef.current) {
      window.clearTimeout(closeResetTimeoutRef.current);
      closeResetTimeoutRef.current = null;
    }
  }, []);

  const resetFormState = useCallback(() => {
    setMessage('');
    setStatus('idle');
    setFeedback('');
    setIsHighPriority(false);
  }, []);

  const openForm = useCallback(() => {
    clearCloseResetTimeout();
    setFormVisible(true);
    resetFormState();
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [clearCloseResetTimeout, resetFormState]);

  const closeForm = useCallback(() => {
    setFormVisible(false);
    clearCloseResetTimeout();
    closeResetTimeoutRef.current = window.setTimeout(() => {
      resetFormState();
      closeResetTimeoutRef.current = null;
    }, FORM_CLOSE_RESET_DELAY_MS);
  }, [clearCloseResetTimeout, resetFormState]);

  const toggleFormVisibility = useCallback(() => {
    if (isFormVisible) {
      closeForm();
      return;
    }

    openForm();
  }, [closeForm, isFormVisible, openForm]);

  useEffect(() => {
    if (!isFormVisible) return;

    const handleClickOutside = (event) => {
      if (
        formRef.current &&
        !formRef.current.contains(event.target) &&
        reportButtonRef.current &&
        !reportButtonRef.current.contains(event.target)
      ) {
        closeForm();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFormVisible, closeForm]);

  useEffect(() => {
    const handleOpen = () => {
      setIsExpanded(true);
      openForm();
    };
    wp.hooks.addAction('alpaca.openModal', 'alpaca/toolbar', handleOpen);
    return () => wp.hooks.removeAction('alpaca.openModal', 'alpaca/toolbar');
  }, [openForm]);

  useEffect(() => clearCloseResetTimeout, [clearCloseResetTimeout]);

  const submitIssue = useCallback(async () => {
    setMessage('');

    try {
      setStatus('submitting');
      const reportContext = await ensureAlpacaReportContext();
      const server = JSON.parse(atob(reportContext.env));

      let screenshot = '';
      try {
        screenshot = await handleSnapdomCapture();
      } catch (screenshotError) {
        // eslint-disable-next-line no-console
        console.warn('Screenshot capture failed:', screenshotError);
      }

      const submitted = {
        userinput: {
          feedback,
          includeContext: true, // Always include context
          isHighPriority,
        },
        client: reportContext.device || getAlpacaReportContext().device,
        screenshot: '',
        errors: reportContext.errors || getAlpacaReportContext().errors || [],
      };

      const payload = { ...submitted, ...server };

      const response = await fetch(buildAlpacaRestUrl('/alpaca/v1/submit'), {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-WP-Nonce': getAlpacaRestNonce(),
        }),
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }

      let screenshotUrl = '';
      if (screenshot && responseData.issue?.id) {
        try {
          const screenshotFile = await dataUrlToFile(
            screenshot,
            'alpaca-screenshot.webp',
          );
          const uploaded = await uploadIssueAttachment(
            screenshotFile,
            responseData.issue.id,
          );
          screenshotUrl = uploaded.url || '';
        } catch (uploadError) {
          // eslint-disable-next-line no-console
          console.warn('Screenshot upload failed:', uploadError);
        }
      }

      setStatus('success');
      setMessage(
        __(
          'Your issue has been submitted successfully.',
          'alpaca-issue-tracker',
        ),
      );

      doAction(
        'alpaca.issueSubmitted',
        responseData.issue,
        responseData.statusId,
        isHighPriority,
        {
          feedback,
          screenshotUrl,
        },
      );

      if (isHighPriority) {
        doAction('alpaca.priorityUpdated', {
          issueId: responseData.issue.id,
          isHighPriority: true,
          issue: responseData.issue,
        });
      }

      setTimeout(closeForm, 1500);
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
      setMessage(
        __(
          'There was an error submitting your issue. Please try again.',
          'alpaca-issue-tracker',
        ),
      );
    }
  }, [feedback, isHighPriority, closeForm]);

  const projectBoardUrl = getProjectBoardUrl();

  return (
    <>
      <div className={`alpaca-bottom-toolbar ${isExpanded ? 'expanded' : ''}`}>
        <button
          ref={reportButtonRef}
          className={`alpaca-report-button ${isFormVisible ? 'form-visible' : ''}`}
          onClick={toggleFormVisibility}
        >
          <Icon name="report" />
          {__('Report An Issue', 'alpaca-issue-tracker')}
        </button>
        {showActivity && <ActivityPopover />}
        {showInbox && <InboxControl isInline />}
        <a href={projectBoardUrl} className="project-board-link">
          <Icon name="board" />
          {__('Project Board', 'alpaca-issue-tracker')}
        </a>
        <button className="toggle-button" onClick={toggleExpand}>
          <span className="toggle-pointer">►</span>
        </button>
      </div>

      <div
        ref={formRef}
        className={`alpaca-report-form ${isFormVisible ? 'visible' : ''}`}
      >
        <div className="form-header">
          <h4>{__('Report An Issue', 'alpaca-issue-tracker')}</h4>
          <button className="form-close" onClick={closeForm}>
            ×
          </button>
        </div>

        {status === 'success' || status === 'error' ? (
          <>
            <p>{message}</p>
            <Button variant="primary" onClick={closeForm} ref={textareaRef}>
              {__('Close', 'alpaca-issue-tracker')}
            </Button>
          </>
        ) : (
          <>
            <TextareaControl
              placeholder={__('Describe the problem', 'alpaca-issue-tracker')}
              value={feedback}
              onChange={(value) => setFeedback(value)}
              disabled={status === 'submitting'}
              ref={textareaRef}
              __nextHasNoMarginBottom
            />

            <div className="form-toggles">
              <ToggleControl
                label={
                  <span className="priority-label">
                    {__('High Priority', 'alpaca-issue-tracker')}
                  </span>
                }
                checked={isHighPriority}
                onChange={setIsHighPriority}
                disabled={status === 'submitting'}
                __nextHasNoMarginBottom
              />
            </div>

            <div className="form-actions">
              <Button
                variant="primary"
                onClick={submitIssue}
                disabled={status === 'submitting' || !feedback.trim()}
              >
                {status === 'submitting' ? (
                  <Spinner />
                ) : (
                  __('Submit', 'alpaca-issue-tracker')
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={closeForm}
                disabled={status === 'submitting'}
              >
                {__('Cancel', 'alpaca-issue-tracker')}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

AlpacaToolbar.propTypes = {
  showInbox: PropTypes.bool,
  showActivity: PropTypes.bool,
};

AlpacaToolbar.defaultProps = {
  showInbox: false,
  showActivity: false,
};

export default AlpacaToolbar;
