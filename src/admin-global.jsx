import './scss/admin-global.scss';

import { initializeAlpacaDataDump } from './utils/dataDump.js';
import './utils/issueCommentHandler.js';
import { installAlpacaApiRootMiddleware } from './utils/restApiRoot.js';
import reactMountUtils from './utils/reactMount';
import { mountAdminGlobalUi } from './adminGlobalMounts.jsx';

installAlpacaApiRootMiddleware();

const contextualCaptureEnabled =
  typeof window !== 'undefined' &&
  (window.alpaistrSettings?.contextualCaptureEnabled === true ||
    window.alpaistrSettings?.contextualCaptureEnabled === 1 ||
    window.alpaistrSettings?.contextualCaptureEnabled === '1' ||
    typeof window.alpaistrSettings?.contextualCaptureEnabled === 'undefined');

if (contextualCaptureEnabled) {
  initializeAlpacaDataDump();
}

const { createRoot, render: legacyRender } = wp.element;
const { createMountReactTree } = reactMountUtils;
const mountReactTree = createMountReactTree({
  createRoot,
  legacyRender,
});

mountAdminGlobalUi(mountReactTree, contextualCaptureEnabled);
