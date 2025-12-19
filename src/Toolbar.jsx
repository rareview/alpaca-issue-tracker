import handleSnapdomCapture from './snapdomHandler.js';
import { useTestLogger } from './utils/testLogger.js';

const { Button, TextareaControl, Spinner, CheckboxControl, ToggleControl } =
  wp.components;
const { doAction } = wp.hooks;
const { useState, useRef, useEffect, useCallback } = wp.element;

/**
 * Bottom Toolbar component for Alpaca issue reporting.
 * Dark admin bar theme with WP Components form.
 *
 * @return {JSX.Element} Toolbar component
 */
const AlpacaToolbar = () => {
  const [isExpanded, setIsExpanded] = useState(true); // Open by default
  const [isFormVisible, setFormVisible] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [isHighPriority, setIsHighPriority] = useState(false);

  const textareaRef = useRef(null);
  const formRef = useRef(null);
  const [enableTestLogs, setEnableTestLogs] = useState(false);

  useEffect(() => {
    wp.apiFetch({ path: '/wp/v2/settings' }).then((settings) => {
      setEnableTestLogs(settings.alpaca_enable_test_logs === '1');
    });

    const handleTestLogSettingChange = (value) => {
      setEnableTestLogs(value);
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

  const openForm = useCallback(() => {
    setFormVisible(true);
    setMessage('');
    setStatus('idle');
    setFeedback('');
    setIncludeContext(true);
    setIsHighPriority(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const closeForm = useCallback(() => {
    setFormVisible(false);
    setStatus('idle');
  }, []);

  useEffect(() => {
    if (!isFormVisible) return;

    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
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

  const submitIssue = useCallback(async () => {
    setMessage('');

    try {
      const server = JSON.parse(atob(alpacaDataDump.env));
      setStatus('submitting');

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
          includeContext,
          isHighPriority,
        },
        client: alpacaDataDump.device,
        screenshot,
        errors: alpacaDataDump.errors,
      };

      const payload = { ...submitted, ...server };

      const response = await fetch(wpApiSettings.root + 'alpaca/v1/submit', {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce,
        }),
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }

      setStatus('success');
      setMessage('Your issue has been submitted successfully.');

      doAction(
        'alpaca.issueSubmitted',
        responseData.issue,
        responseData.statusId,
      );

      setTimeout(closeForm, 1500);
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
      setMessage('There was an error submitting your issue. Please try again.');
    }
  }, [feedback, includeContext, isHighPriority, closeForm]);

  return (
    <>
      <div className={`alpaca-bottom-toolbar ${isExpanded ? 'expanded' : ''}`}>
        <button
          className={`alpaca-report-button ${isFormVisible ? 'form-visible' : ''}`}
          onClick={openForm}
        >
          <span className="dashicons dashicons-warning" />
          Report An Issue
        </button>
        <a
          href={
            wpApiSettings.root.replace('/wp-json/', '/wp-admin/') +
            'admin.php?page=alpaca-board'
          }
          className="alpaca-board-link"
        >
          <span className="dashicons dashicons-analytics" />
          Project Board
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
          <h4>Report An Issue</h4>
          <button className="form-close" onClick={closeForm}>
            ×
          </button>
        </div>

        {status === 'success' || status === 'error' ? (
          <>
            <p>{message}</p>
            <Button variant="primary" onClick={closeForm} ref={textareaRef}>
              Close
            </Button>
          </>
        ) : (
          <>
            <TextareaControl
              placeholder="Describe the problem"
              value={feedback}
              onChange={(value) => setFeedback(value)}
              disabled={status === 'submitting'}
              ref={textareaRef}
            />

            <div className="form-toggles">
              <ToggleControl
                label={<span className="priority-label">High Priority</span>}
                checked={isHighPriority}
                onChange={setIsHighPriority}
                disabled={status === 'submitting'}
              />
              <CheckboxControl
                label="Include full context with report?"
                help="Always do this, unless you are sure it is not relevant"
                checked={includeContext}
                onChange={setIncludeContext}
                disabled={status === 'submitting'}
              />
            </div>

            <div className="form-actions">
              <Button
                variant="primary"
                onClick={submitIssue}
                disabled={status === 'submitting' || !feedback.trim()}
              >
                {status === 'submitting' ? <Spinner /> : 'Submit'}
              </Button>
              <Button
                variant="secondary"
                onClick={closeForm}
                disabled={status === 'submitting'}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AlpacaToolbar;
