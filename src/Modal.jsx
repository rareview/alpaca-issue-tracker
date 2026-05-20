import handleSnapdomCapture from './snapdomHandler.js';
import { dataUrlToFile, uploadIssueAttachment } from './utils/attachmentUpload';
import { useTestLogger } from './utils/testLogger.js';
import { buildAlpacaRestUrl, getAlpacaRestNonce } from './utils/restApiRoot.js';
import {
  ensureAlpacaReportContext,
  getAlpacaReportContext,
} from './utils/reportContext.js';

const { __ } = wp.i18n;
const { Button, Modal, TextareaControl, Spinner, ToggleControl } =
  wp.components;
const { doAction } = wp.hooks;
const { useState, useRef, useEffect, useCallback } = wp.element;

const AlpacaModal = () => {
  const [isOpen, setOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isHighPriority, setIsHighPriority] = useState(false);

  const textareaRef = useRef(null);
  const closeBtnRef = useRef(null);

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
      'alpaca/modal',
      handleTestLogSettingChange,
    );

    return () => {
      wp.hooks.removeAction('alpaca.enableTestLogsChanged', 'alpaca/modal');
    };
  }, []);

  useTestLogger(enableTestLogs);

  const openModal = useCallback(() => {
    setMessage('');
    setStatus('idle');
    setFeedback('');
    setFeedback('');
    setIsHighPriority(false);
    setOpen(true);
  }, []);

  const closeModal = () => {
    setOpen(false);
    setStatus('idle');
  };

  // Listen for a global event to open the modal
  useEffect(() => {
    const handleOpen = () => openModal();
    wp.hooks.addAction('alpaca.openModal', 'alpaca/modal', handleOpen);
    return () => wp.hooks.removeAction('alpaca.openModal', 'alpaca/modal');
  }, [openModal]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && status === 'idle' && textareaRef.current) {
      setTimeout(() => textareaRef.current.focus(), 10);
    }
  }, [isOpen, status]);

  // Focus close button on success or error
  useEffect(() => {
    if ((status === 'success' || status === 'error') && closeBtnRef.current) {
      setTimeout(() => closeBtnRef.current.focus(), 10);
    }
  }, [status]);

  const submitIssue = async () => {
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
      setMessage(__('Your issue has been submitted successfully.', 'alpaca-issue-tracker'));

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

      setTimeout(closeModal, 1500);
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
  };

  useEffect(() => {
    const adminBarLink = document.querySelector(
      '#wp-admin-bar-alpaca-report .ab-item',
    );

    if (adminBarLink) {
      const handleClick = (e) => {
        e.preventDefault();
        openModal();
      };

      adminBarLink.addEventListener('click', handleClick);

      return () => {
        adminBarLink.removeEventListener('click', handleClick);
      };
    }
  }, [openModal]);

  return (
    <>
      {isOpen && (
        <Modal
          size="medium"
          className="alpaca-modal"
          title={(() => {
            if (status === 'success') return __('Issue Submitted', 'alpaca-issue-tracker');
            if (status === 'error') return __('Submission Failed', 'alpaca-issue-tracker');
            return __('Context Capture', 'alpaca-issue-tracker');
          })()}
          onRequestClose={closeModal}
          isDismissible={false}
        >
          {status === 'success' || status === 'error' ? (
            <>
              <p>{message}</p>
              <Button variant="primary" onClick={closeModal} ref={closeBtnRef}>
                {__('Close', 'alpaca-issue-tracker')}
              </Button>
            </>
          ) : (
            <>
              <TextareaControl
                placeholder={__('Describe the problem', 'alpaca-issue-tracker')}
                id="alpaca-modal-textarea"
                value={feedback}
                onChange={(value) => setFeedback(value)}
                disabled={status === 'submitting'}
                ref={textareaRef}
                __nextHasNoMarginBottom
              />

              <div className="small-wrapper">
                <ToggleControl
                  label={__('High Priority', 'alpaca-issue-tracker')}
                  checked={isHighPriority}
                  onChange={setIsHighPriority}
                  disabled={status === 'submitting'}
                  __nextHasNoMarginBottom
                />
              </div>

              <div className="alpaca-modal-actions">
                <Button
                  variant="primary"
                  onClick={submitIssue}
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? (
                    <Spinner />
                  ) : (
                    __('Submit', 'alpaca-issue-tracker')
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={closeModal}
                  disabled={status === 'submitting'}
                >
                  {__('Cancel', 'alpaca-issue-tracker')}
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
};

export default AlpacaModal;
