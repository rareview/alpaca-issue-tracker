import {
  fetchNotificationTemplate,
  previewNotificationTemplate,
  resetNotificationTemplate,
  sendNotificationTemplateTestEmail,
  updateNotificationTemplate,
} from '../services/notificationApi';
import { registerNotificationEmailBlocks } from './notifications/emailTemplateBlocks';

const { Fragment, useCallback, useEffect, useMemo, useRef, useState } =
  wp.element;
const { __ } = wp.i18n;
const { parse, serialize } = wp.blocks || {};
const { useSelect = () => undefined } = wp.data || {};
const {
  Button,
  Notice,
  Popover,
  SlotFillProvider,
  Spinner,
  TextControl,
  DropZoneProvider,
} = wp.components;

const fallbackBody =
  '<!-- wp:paragraph --><p>' +
  __('Loading template…', 'alpaca') +
  '</p><!-- /wp:paragraph -->';
const SITE_LOGO_ID_KEY = 'site_logo_id';
const SITE_LOGO_KEY = 'site_logo';

registerNotificationEmailBlocks();

/**
 * Parse a serialized template body into blocks.
 *
 * @param {string} body Serialized block content.
 * @return {Array} Parsed blocks.
 */
const parseTemplateBody = (body) => {
  if (typeof parse !== 'function') {
    return [];
  }

  const source = typeof body === 'string' && body.trim() ? body : fallbackBody;
  return parse(source);
};

/**
 * Safely read an object value by key.
 *
 * @param {Object} object Source object.
 * @param {string} key    Property name.
 * @return {*} Property value.
 */
const getObjectValue = (object, key) => {
  if (!object || typeof object !== 'object') {
    return undefined;
  }

  return object[key];
};

/**
 * Standalone block editor screen for the shared notification email template.
 *
 * @return {JSX.Element} Template screen.
 */
const NotificationTemplateScreen = () => {
  const blockEditor = wp.blockEditor || {};
  const {
    BlockEditorProvider,
    BlockList,
    BlockTools,
    ButtonBlockAppender,
    DefaultBlockAppender,
    ObserveTyping,
    WritingFlow,
    BlockSelectionClearer,
  } = blockEditor;
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [templateContext, setTemplateContext] = useState({
    siteLogoId: 0,
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [contentElement, setContentElement] = useState(null);
  const previewTimerRef = useRef(null);
  const lastLoadedBodyRef = useRef('');
  const mediaUpload = useMemo(() => {
    if (wp.mediaUtils && typeof wp.mediaUtils.uploadMedia === 'function') {
      return wp.mediaUtils.uploadMedia;
    }

    return undefined;
  }, []);

  const Appender = ButtonBlockAppender || DefaultBlockAppender || null;
  const SelectionClearer = BlockSelectionClearer || Fragment;
  const siteEntityConfig = useSelect((select) => {
    if (!wp.coreData || !wp.coreData.store) {
      return undefined;
    }

    const coreSelect = select(wp.coreData.store);
    if (!coreSelect || typeof coreSelect.getEntityConfig !== 'function') {
      return undefined;
    }

    return coreSelect.getEntityConfig('root', 'site');
  }, []);
  const siteEntityRecord = useSelect((select) => {
    if (!wp.coreData || !wp.coreData.store) {
      return undefined;
    }

    const coreSelect = select(wp.coreData.store);
    if (!coreSelect || typeof coreSelect.getEntityRecord !== 'function') {
      return undefined;
    }

    return coreSelect.getEntityRecord('root', 'site', undefined);
  }, []);
  const siteLogoEditId = useSelect((select) => {
    if (!wp.coreData || !wp.coreData.store) {
      return undefined;
    }

    const coreSelect = select(wp.coreData.store);
    if (!coreSelect) {
      return undefined;
    }

    const getSiteEdits =
      typeof coreSelect.getEntityRecordNonTransientEdits === 'function'
        ? coreSelect.getEntityRecordNonTransientEdits
        : coreSelect.getEntityRecordEdits;

    if (typeof getSiteEdits !== 'function') {
      return undefined;
    }

    const siteEdits = getSiteEdits('root', 'site', undefined);
    if (
      !siteEdits ||
      !Object.prototype.hasOwnProperty.call(siteEdits, SITE_LOGO_KEY)
    ) {
      return undefined;
    }

    const nextSiteLogoId = parseInt(
      getObjectValue(siteEdits, SITE_LOGO_KEY),
      10,
    );

    if (Number.isNaN(nextSiteLogoId) || nextSiteLogoId < 1) {
      return 0;
    }

    return nextSiteLogoId;
  }, []);

  const editorSettings = useMemo(
    () => ({
      allowedBlockTypes: true,
      hasFixedToolbar: false,
      focusMode: false,
      templateLock: false,
      mediaUpload,
    }),
    [mediaUpload],
  );
  const currentTemplateContext = useMemo(() => {
    const nextTemplateContext = {
      ...templateContext,
    };

    if (typeof siteLogoEditId === 'number') {
      nextTemplateContext.siteLogoId = siteLogoEditId;
    }

    return nextTemplateContext;
  }, [siteLogoEditId, templateContext]);
  const buildTemplatePayload = useCallback(
    () => ({
      subject,
      body,
      templateContext: {
        [SITE_LOGO_ID_KEY]: currentTemplateContext.siteLogoId,
      },
    }),
    [body, currentTemplateContext, subject],
  );

  const loadTemplate = useCallback(() => {
    setIsLoading(true);
    setError('');

    fetchNotificationTemplate()
      .then((response) => {
        const nextSubject = response.subject || '';
        const nextBody = response.body || fallbackBody;
        const nextTemplateContext = getObjectValue(
          response,
          'template_context',
        ) || {
          [SITE_LOGO_ID_KEY]: 0,
        };
        setSubject(nextSubject);
        setBody(nextBody);
        setBlocks(parseTemplateBody(nextBody));
        setTemplateContext({
          siteLogoId:
            getObjectValue(nextTemplateContext, SITE_LOGO_ID_KEY) || 0,
        });
        lastLoadedBodyRef.current = nextBody;
      })
      .catch((loadError) => {
        setError(
          loadError?.message ||
            __('Could not load the notification email template.', 'alpaca'),
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (
      !wp.coreData ||
      !wp.coreData.store ||
      typeof wp.data?.resolveSelect !== 'function'
    ) {
      return;
    }

    wp.data.resolveSelect(wp.coreData.store).getEntitiesConfig('root');
  }, []);

  useEffect(() => {
    if (
      !siteEntityConfig ||
      !wp.coreData ||
      !wp.coreData.store ||
      typeof wp.data?.resolveSelect !== 'function'
    ) {
      return;
    }

    wp.data
      .resolveSelect(wp.coreData.store)
      .getEntityRecord('root', 'site', undefined);
  }, [siteEntityConfig]);

  useEffect(() => {
    if (
      !siteEntityConfig ||
      !siteEntityRecord ||
      !wp.coreData ||
      !wp.coreData.store ||
      typeof wp.data?.dispatch !== 'function' ||
      !templateContext.siteLogoId
    ) {
      return;
    }

    const coreDispatch = wp.data.dispatch(wp.coreData.store);
    if (!coreDispatch || typeof coreDispatch.editEntityRecord !== 'function') {
      return;
    }

    coreDispatch.editEntityRecord('root', 'site', undefined, {
      [SITE_LOGO_KEY]: templateContext.siteLogoId,
    });
  }, [siteEntityConfig, siteEntityRecord, templateContext.siteLogoId]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleBlocksChange = useCallback((nextBlocks) => {
    setBlocks(nextBlocks);
    if (typeof serialize === 'function') {
      setBody(serialize(nextBlocks));
    }
  }, []);

  useEffect(() => {
    if (!body || body === lastLoadedBodyRef.current) {
      return undefined;
    }

    window.clearTimeout(previewTimerRef.current);
    previewTimerRef.current = window.setTimeout(() => {
      previewNotificationTemplate(buildTemplatePayload())
        .then((response) => {
          setPreview(response);
          setError('');
        })
        .catch((previewError) => {
          setError(
            previewError?.message ||
              __('Could not refresh the email preview.', 'alpaca'),
          );
        });
    }, 350);

    return () => {
      window.clearTimeout(previewTimerRef.current);
    };
  }, [body, buildTemplatePayload]);

  useEffect(() => {
    if (!body) {
      return;
    }

    if (body === lastLoadedBodyRef.current) {
      previewNotificationTemplate(buildTemplatePayload())
        .then((response) => {
          setPreview(response);
        })
        .catch(() => {
          // Ignore the initial preview error here; the main request already sets screen state.
        });
    }
  }, [body, buildTemplatePayload]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setError('');
    setNotice('');

    updateNotificationTemplate(buildTemplatePayload())
      .then((response) => {
        const savedBody = response.body || fallbackBody;
        setSubject(response.subject || '');
        setBody(savedBody);
        setBlocks(parseTemplateBody(savedBody));
        setTemplateContext({
          siteLogoId:
            getObjectValue(
              getObjectValue(response, 'template_context'),
              SITE_LOGO_ID_KEY,
            ) || 0,
        });
        lastLoadedBodyRef.current = savedBody;
        setNotice(__('Notification email template saved.', 'alpaca'));
      })
      .catch((saveError) => {
        setError(
          saveError?.message ||
            __('Could not save the notification email template.', 'alpaca'),
        );
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [buildTemplatePayload]);

  const handleTestSend = useCallback(() => {
    setIsSendingTest(true);
    setError('');
    setNotice('');

    sendNotificationTemplateTestEmail(buildTemplatePayload())
      .then((response) => {
        setNotice(
          response?.message || __('Test email sent successfully.', 'alpaca'),
        );
      })
      .catch((sendError) => {
        setError(
          sendError?.message || __('Could not send the test email.', 'alpaca'),
        );
      })
      .finally(() => {
        setIsSendingTest(false);
      });
  }, [buildTemplatePayload]);

  const handleReset = useCallback(() => {
    setIsResetting(true);
    setError('');
    setNotice('');

    resetNotificationTemplate()
      .then((response) => {
        const resetBody = response.body || fallbackBody;
        setSubject(response.subject || '');
        setBody(resetBody);
        setBlocks(parseTemplateBody(resetBody));
        setTemplateContext({
          siteLogoId:
            getObjectValue(
              getObjectValue(response, 'template_context'),
              SITE_LOGO_ID_KEY,
            ) || 0,
        });
        lastLoadedBodyRef.current = resetBody;
        setNotice(
          __('Notification email template reset to default.', 'alpaca'),
        );
      })
      .catch((resetError) => {
        setError(
          resetError?.message ||
            __('Could not reset the notification email template.', 'alpaca'),
        );
      })
      .finally(() => {
        setIsResetting(false);
      });
  }, []);

  if (
    !BlockEditorProvider ||
    !BlockList ||
    !BlockTools ||
    !ObserveTyping ||
    !WritingFlow ||
    typeof parse !== 'function' ||
    typeof serialize !== 'function'
  ) {
    return (
      <div className="alpaca-notification-template-screen">
        <Notice status="error" isDismissible={false}>
          {__(
            'The WordPress block editor could not be loaded for this screen.',
            'alpaca',
          )}
        </Notice>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="alpaca-notification-template-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="alpaca-notification-template-screen">
      {error && (
        <Notice status="error" onRemove={() => setError('')}>
          {error}
        </Notice>
      )}
      {notice && (
        <Notice status="success" onRemove={() => setNotice('')}>
          {notice}
        </Notice>
      )}

      <div className="alpaca-notification-template-intro alpaca-notifications-panel">
        <h2>{__('Shared Email Template', 'alpaca')}</h2>
        <p>
          {__(
            'This template is used for instant issue activity emails. Keep the Full Comment Content block in the layout so the activity itself is always included.',
            'alpaca',
          )}
        </p>
      </div>

      <div className="alpaca-notification-template-layout">
        <div className="alpaca-notification-template-editor-panel alpaca-notifications-panel">
          <div className="alpaca-notification-template-section-header">
            <h2>{__('Template', 'alpaca')}</h2>
            <p>
              {__(
                'Use core blocks for layout and Alpaca blocks for issue-specific placeholders.',
                'alpaca',
              )}
            </p>
          </div>

          <TextControl
            label={__('Email subject', 'alpaca')}
            value={subject}
            onChange={setSubject}
            help={__(
              'Available placeholders include {{issue_title}}, {{performed_by}}, {{event_label}}, {{site_title}}, {{site_tagline}}, and {{event_time}}.',
              'alpaca',
            )}
          />

          <div className="alpaca-notification-template-editor-shell">
            <SlotFillProvider>
              <DropZoneProvider>
                <BlockEditorProvider
                  value={blocks}
                  onInput={handleBlocksChange}
                  onChange={handleBlocksChange}
                  settings={editorSettings}
                >
                  <BlockTools __unstableContentRef={contentElement}>
                    <SelectionClearer>
                      <WritingFlow>
                        <ObserveTyping>
                          <div
                            ref={setContentElement}
                            className="alpaca-notification-template-canvas editor-styles-wrapper"
                          >
                            <BlockList
                              className="alpaca-notification-template-block-list"
                              renderAppender={
                                Appender
                                  ? () => (
                                      <div className="alpaca-notification-template-appender">
                                        <Appender />
                                      </div>
                                    )
                                  : undefined
                              }
                            />
                          </div>
                        </ObserveTyping>
                      </WritingFlow>
                    </SelectionClearer>
                  </BlockTools>
                  <Popover.Slot />
                </BlockEditorProvider>
              </DropZoneProvider>
            </SlotFillProvider>
          </div>

          <div className="alpaca-notifications-actions">
            <Button isPrimary onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? __('Saving…', 'alpaca')
                : __('Save Template', 'alpaca')}
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={isResetting}
            >
              {isResetting
                ? __('Resetting…', 'alpaca')
                : __('Reset to Default', 'alpaca')}
            </Button>
            <Button
              variant="tertiary"
              onClick={handleTestSend}
              disabled={isSendingTest}
            >
              {isSendingTest
                ? __('Sending Test…', 'alpaca')
                : __('Send Test Email', 'alpaca')}
            </Button>
          </div>
        </div>

        <div className="alpaca-notification-template-preview-panel alpaca-notifications-panel">
          <div className="alpaca-notification-template-section-header">
            <h2>{__('Live Preview', 'alpaca')}</h2>
            <p>
              {__(
                'Preview the shared email using sample issue activity before saving or sending a test.',
                'alpaca',
              )}
            </p>
          </div>
          {preview ? (
            <>
              <div className="alpaca-notification-preview-subject">
                <span>{__('Subject', 'alpaca')}</span>
                <strong>{preview.subject}</strong>
              </div>
              <div
                className="alpaca-notification-preview-frame"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
            </>
          ) : (
            <p>
              {__(
                'Preview will appear here once the template loads.',
                'alpaca',
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationTemplateScreen;
