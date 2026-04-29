import './scss/admin-global.scss';

import './utils/dataDump.js';
import './utils/issueCommentHandler.js';
import { installAlpacaApiRootMiddleware } from './utils/restApiRoot.js';
import reactMountUtils from './utils/reactMount';
import { mountAdminGlobalUi } from './adminGlobalMounts.jsx';

installAlpacaApiRootMiddleware();

const { createRoot, render: legacyRender } = wp.element;
const { createMountReactTree } = reactMountUtils;
const mountReactTree = createMountReactTree({
  createRoot,
  legacyRender,
});

mountAdminGlobalUi(mountReactTree);
