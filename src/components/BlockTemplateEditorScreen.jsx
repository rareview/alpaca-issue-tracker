import PropTypes from 'prop-types';

const { Fragment, useCallback, useEffect, useMemo, useRef, useState } =
  wp.element;
const { __ } = wp.i18n;
const { parse, serialize } = wp.blocks || {};
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
const DEFAULT_ALLOWED_BLOCK_TYPES = true;
const registeredTemplateBlockSets = new WeakSet();

/**
 * Ensure a template block set is registered only once.
 *
 * @param {Function} registerBlocks Block registration callback.
 * @return {void}
 */
const ensureTemplateEditorBlocks = (registerBlocks) => {
  if (typeof registerBlocks !== 'function') {
    return;
  }

  if (registeredTemplateBlockSets.has(registerBlocks)) {
    return;
  }

  registerBlocks();
  registeredTemplateBlockSets.add(registerBlocks);
};

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
 * Shared block-editor screen for notification templates.
 *
 * @param {Object} props Component props.
 * @return {JSX.Element} Shared template screen.
 */
const BlockTemplateEditorScreen = (props) => {
  const {
    fetchTemplate,
    updateTemplate,
    resetTemplate,
    previewTemplate,
    sendTestEmail,
    registerBlocks,
    screenClassName = '',
    introTitle,
    introDescription,
    templateDescription,
    previewDescription,
    subjectHelp,
    loadErrorMessage,
    previewErrorMessage,
    saveErrorMessage,
    resetErrorMessage,
    testErrorMessage,
    saveSuccessMessage,
    resetSuccessMessage,
    testSuccessMessage,
    previewEmptyMessage,
    editorSettings = {},
  } = props;

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
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [contentElement, setContentElement] = useState(null);
  const [allowedBlockTypes, setAllowedBlockTypes] = useState(
    Array.isArray(editorSettings.allowedBlockTypes)
      ? editorSettings.allowedBlockTypes
      : DEFAULT_ALLOWED_BLOCK_TYPES,
  );
  const previewTimerRef = useRef(null);
  const lastLoadedBodyRef = useRef('');

  const Appender = ButtonBlockAppender || DefaultBlockAppender || null;
  const SelectionClearer = BlockSelectionClearer || Fragment;
  const mediaUpload = useMemo(() => {
    if (wp.mediaUtils && typeof wp.mediaUtils.uploadMedia === 'function') {
      return wp.mediaUtils.uploadMedia;
    }

    return undefined;
  }, []);

  ensureTemplateEditorBlocks(registerBlocks);

  const combinedEditorSettings = {
    hasFixedToolbar: false,
    focusMode: false,
    templateLock: false,
    mediaUpload,
    ...editorSettings,
    allowedBlockTypes,
  };

  const buildTemplatePayload = useCallback(
    () => ({
      subject,
      body,
    }),
    [body, subject],
  );

  const loadTemplate = useCallback(() => {
    setIsLoading(true);
    setError('');

    fetchTemplate()
      .then((response) => {
        const nextSubject = response.subject || '';
        const nextBody = response.body || fallbackBody;

        setSubject(nextSubject);
        setBody(nextBody);
        setBlocks(parseTemplateBody(nextBody));
        setAllowedBlockTypes(
          Array.isArray(response.allowed_block_types)
            ? response.allowed_block_types
            : DEFAULT_ALLOWED_BLOCK_TYPES,
        );
        lastLoadedBodyRef.current = nextBody;
      })
      .catch((loadError) => {
        setError(loadError?.message || loadErrorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fetchTemplate, loadErrorMessage]);

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
      previewTemplate(buildTemplatePayload())
        .then((response) => {
          setPreview(response);
          setError('');
        })
        .catch((previewError) => {
          setError(previewError?.message || previewErrorMessage);
        });
    }, 350);

    return () => {
      window.clearTimeout(previewTimerRef.current);
    };
  }, [body, buildTemplatePayload, previewErrorMessage, previewTemplate]);

  useEffect(() => {
    if (!body) {
      return;
    }

    if (body === lastLoadedBodyRef.current) {
      previewTemplate(buildTemplatePayload())
        .then((response) => {
          setPreview(response);
        })
        .catch(() => {
          // Ignore the initial preview error here; the screen already handles load state.
        });
    }
  }, [body, buildTemplatePayload, previewTemplate]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setError('');
    setNotice('');

    updateTemplate(buildTemplatePayload())
      .then((response) => {
        const savedBody = response.body || fallbackBody;

        setSubject(response.subject || '');
        setBody(savedBody);
        setBlocks(parseTemplateBody(savedBody));
        setAllowedBlockTypes(
          Array.isArray(response.allowed_block_types)
            ? response.allowed_block_types
            : DEFAULT_ALLOWED_BLOCK_TYPES,
        );
        lastLoadedBodyRef.current = savedBody;
        setNotice(saveSuccessMessage);
      })
      .catch((saveError) => {
        setError(saveError?.message || saveErrorMessage);
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [
    buildTemplatePayload,
    saveErrorMessage,
    saveSuccessMessage,
    updateTemplate,
  ]);

  const handleTestSend = useCallback(() => {
    setIsSendingTest(true);
    setError('');
    setNotice('');

    sendTestEmail(buildTemplatePayload())
      .then((response) => {
        setNotice(response?.message || testSuccessMessage);
      })
      .catch((sendError) => {
        setError(sendError?.message || testErrorMessage);
      })
      .finally(() => {
        setIsSendingTest(false);
      });
  }, [
    buildTemplatePayload,
    sendTestEmail,
    testErrorMessage,
    testSuccessMessage,
  ]);

  const handleReset = useCallback(() => {
    setIsResetting(true);
    setError('');
    setNotice('');

    resetTemplate()
      .then((response) => {
        const resetBody = response.body || fallbackBody;

        setSubject(response.subject || '');
        setBody(resetBody);
        setBlocks(parseTemplateBody(resetBody));
        setAllowedBlockTypes(
          Array.isArray(response.allowed_block_types)
            ? response.allowed_block_types
            : DEFAULT_ALLOWED_BLOCK_TYPES,
        );
        lastLoadedBodyRef.current = resetBody;
        setNotice(resetSuccessMessage);
      })
      .catch((resetError) => {
        setError(resetError?.message || resetErrorMessage);
      })
      .finally(() => {
        setIsResetting(false);
      });
  }, [resetErrorMessage, resetSuccessMessage, resetTemplate]);

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
    <div
      className={`alpaca-notification-template-screen ${screenClassName}`.trim()}
    >
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
        <h2>{introTitle}</h2>
        <p>{introDescription}</p>
      </div>

      <div className="alpaca-notification-template-layout">
        <div className="alpaca-notification-template-editor-panel alpaca-notifications-panel">
          <div className="alpaca-notification-template-section-header">
            <h2>{__('Template', 'alpaca')}</h2>
            <p>{templateDescription}</p>
          </div>

          <TextControl
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            label={__('Email subject', 'alpaca')}
            value={subject}
            onChange={setSubject}
            help={subjectHelp}
          />

          <div className="alpaca-notification-template-editor-shell">
            <SlotFillProvider>
              <DropZoneProvider>
                <BlockEditorProvider
                  value={blocks}
                  onInput={handleBlocksChange}
                  onChange={handleBlocksChange}
                  settings={combinedEditorSettings}
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
            <p>{previewDescription}</p>
          </div>
          {preview ? (
            <div className="alpaca-notification-preview-frame">
              <div className="alpaca-notification-preview-envelope">
                <div className="alpaca-notification-preview-meta">
                  <span>{__('From', 'alpaca')}</span>
                  <strong>
                    {preview.from_label ||
                      preview.from_address ||
                      __('WordPress', 'alpaca')}
                  </strong>
                </div>
                <div className="alpaca-notification-preview-meta">
                  <span>{__('Subject', 'alpaca')}</span>
                  <strong>{preview.subject}</strong>
                </div>
              </div>
              <div
                className="alpaca-notification-preview-body"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
            </div>
          ) : (
            <p>{previewEmptyMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

BlockTemplateEditorScreen.propTypes = {
  fetchTemplate: PropTypes.func.isRequired,
  updateTemplate: PropTypes.func.isRequired,
  resetTemplate: PropTypes.func.isRequired,
  previewTemplate: PropTypes.func.isRequired,
  sendTestEmail: PropTypes.func.isRequired,
  registerBlocks: PropTypes.func,
  screenClassName: PropTypes.string,
  introTitle: PropTypes.string.isRequired,
  introDescription: PropTypes.string.isRequired,
  templateDescription: PropTypes.string.isRequired,
  previewDescription: PropTypes.string.isRequired,
  subjectHelp: PropTypes.string.isRequired,
  loadErrorMessage: PropTypes.string.isRequired,
  previewErrorMessage: PropTypes.string.isRequired,
  saveErrorMessage: PropTypes.string.isRequired,
  resetErrorMessage: PropTypes.string.isRequired,
  testErrorMessage: PropTypes.string.isRequired,
  saveSuccessMessage: PropTypes.string.isRequired,
  resetSuccessMessage: PropTypes.string.isRequired,
  testSuccessMessage: PropTypes.string.isRequired,
  previewEmptyMessage: PropTypes.string.isRequired,
  editorSettings: PropTypes.object,
};

export default BlockTemplateEditorScreen;
