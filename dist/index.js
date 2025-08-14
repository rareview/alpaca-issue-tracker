// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (
  modules,
  entry,
  mainEntry,
  parcelRequireName,
  externals,
  distDir,
  publicUrl,
  devServer
) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        if (externals[name]) {
          return externals[name];
        }
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})({"9iTdJ":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = 1234;
var HMR_SERVER_PORT = 1234;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "022c1b16b4b6dfad";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_SERVER_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_SERVER_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var HMR_USE_SSE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , disposedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ , bundleNotFound = false;
function getHostname() {
    return HMR_HOST || (typeof location !== 'undefined' && location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || (typeof location !== 'undefined' ? location.port : HMR_SERVER_PORT);
}
// eslint-disable-next-line no-redeclare
let WebSocket = globalThis.WebSocket;
if (!WebSocket && typeof module.bundle.root === 'function') try {
    // eslint-disable-next-line no-global-assign
    WebSocket = module.bundle.root('ws');
} catch  {
// ignore.
}
var hostname = getHostname();
var port = getPort();
var protocol = HMR_SECURE || typeof location !== 'undefined' && location.protocol === 'https:' && ![
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
].includes(hostname) ? 'wss' : 'ws';
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if (!parent || !parent.isParcelRequire) {
    // Web extension context
    var extCtx = typeof browser === 'undefined' ? typeof chrome === 'undefined' ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes('test.js');
    }
    var ws;
    if (HMR_USE_SSE) ws = new EventSource('/__parcel_hmr');
    else try {
        // If we're running in the dev server's node runner, listen for messages on the parent port.
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) {
            parentPort.on('message', async (message)=>{
                try {
                    await handleMessage(message);
                    parentPort.postMessage('updated');
                } catch  {
                    parentPort.postMessage('restart');
                }
            });
            // After the bundle has finished running, notify the dev server that the HMR update is complete.
            queueMicrotask(()=>parentPort.postMessage('ready'));
        }
    } catch  {
        if (typeof WebSocket !== 'undefined') try {
            ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');
        } catch (err) {
            // Ignore cloudflare workers error.
            if (err.message && !err.message.includes('Disallowed operation called within global scope')) console.error(err.message);
        }
    }
    if (ws) {
        // $FlowFixMe
        ws.onmessage = async function(event /*: {data: string, ...} */ ) {
            var data /*: HMRMessage */  = JSON.parse(event.data);
            await handleMessage(data);
        };
        if (ws instanceof WebSocket) {
            ws.onerror = function(e) {
                if (e.message) console.error(e.message);
            };
            ws.onclose = function() {
                console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
            };
        }
    }
}
async function handleMessage(data /*: HMRMessage */ ) {
    checkedAssets = {} /*: {|[string]: boolean|} */ ;
    disposedAssets = {} /*: {|[string]: boolean|} */ ;
    assetsToAccept = [];
    assetsToDispose = [];
    bundleNotFound = false;
    if (data.type === 'reload') fullReload();
    else if (data.type === 'update') {
        // Remove error overlay if there is one
        if (typeof document !== 'undefined') removeErrorOverlay();
        let assets = data.assets;
        // Handle HMR Update
        let handled = assets.every((asset)=>{
            return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
        });
        // Dispatch a custom event in case a bundle was not found. This might mean
        // an asset on the server changed and we should reload the page. This event
        // gives the client an opportunity to refresh without losing state
        // (e.g. via React Server Components). If e.preventDefault() is not called,
        // we will trigger a full page reload.
        if (handled && bundleNotFound && assets.some((a)=>a.envHash !== HMR_ENV_HASH) && typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') handled = !window.dispatchEvent(new CustomEvent('parcelhmrreload', {
            cancelable: true
        }));
        if (handled) {
            console.clear();
            // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
            if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('parcelhmraccept'));
            await hmrApplyUpdates(assets);
            hmrDisposeQueue();
            // Run accept callbacks. This will also re-execute other disposed assets in topological order.
            let processedAssets = {};
            for(let i = 0; i < assetsToAccept.length; i++){
                let id = assetsToAccept[i][1];
                if (!processedAssets[id]) {
                    hmrAccept(assetsToAccept[i][0], id);
                    processedAssets[id] = true;
                }
            }
        } else fullReload();
    }
    if (data.type === 'error') {
        // Log parcel errors to console
        for (let ansiDiagnostic of data.diagnostics.ansi){
            let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
            console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
        }
        if (typeof document !== 'undefined') {
            // Render the fancy html overlay
            removeErrorOverlay();
            var overlay = createErrorOverlay(data.diagnostics.html);
            // $FlowFixMe
            document.body.appendChild(overlay);
        }
    }
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="${protocol === 'wss' ? 'https' : 'http'}://${hostname}:${port}/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, '') : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + '</div>').join('')}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ''}
      </div>
    `;
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if (typeof location !== 'undefined' && 'reload' in location) location.reload();
    else if (typeof extCtx !== 'undefined' && extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
    else try {
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) parentPort.postMessage('restart');
    } catch (err) {
        console.error("[parcel] \u26A0\uFE0F An HMR update was not accepted. Please restart the process.");
    }
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', // $FlowFixMe
    href.split('?')[0] + '?' + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout || typeof document === 'undefined') return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === 'js') {
        if (typeof document !== 'undefined') {
            let script = document.createElement('script');
            script.src = asset.url + '?t=' + Date.now();
            if (asset.outputFormat === 'esmodule') script.type = 'module';
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === 'function') {
            // Worker scripts
            if (asset.outputFormat === 'esmodule') return import(asset.url + '?t=' + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + '?t=' + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != 'undefined' && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        }
        // Always traverse to the parent bundle, even if we already replaced the asset in this bundle.
        // This is required in case modules are duplicated. We need to ensure all instances have the updated code.
        if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    checkedAssets = {};
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else if (a !== null) {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) {
            bundleNotFound = true;
            return true;
        }
        return hmrAcceptCheckOne(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return null;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    if (!cached) return true;
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
    return false;
}
function hmrDisposeQueue() {
    // Dispose all old assets.
    for(let i = 0; i < assetsToDispose.length; i++){
        let id = assetsToDispose[i][1];
        if (!disposedAssets[id]) {
            hmrDispose(assetsToDispose[i][0], id);
            disposedAssets[id] = true;
        }
    }
    assetsToDispose = [];
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        let assetsToAlsoAccept = [];
        cached.hot._acceptCallbacks.forEach(function(cb) {
            let additionalAssets = cb(function() {
                return getParents(module.bundle.root, id);
            });
            if (Array.isArray(additionalAssets) && additionalAssets.length) assetsToAlsoAccept.push(...additionalAssets);
        });
        if (assetsToAlsoAccept.length) {
            let handled = assetsToAlsoAccept.every(function(a) {
                return hmrAcceptCheck(a[0], a[1]);
            });
            if (!handled) return fullReload();
            hmrDisposeQueue();
        }
    }
}

},{}],"d8Dch":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
var _alpacaScss = require("./alpaca.scss");
var _apitestJs = require("./apitest.js");
var _modalJsx = require("./modal.jsx");
var _modalJsxDefault = parcelHelpers.interopDefault(_modalJsx);
var _settingsJsx = require("./settings.jsx");
var _settingsJsxDefault = parcelHelpers.interopDefault(_settingsJsx);
var _boardJsx = require("./board.jsx");
var _boardJsxDefault = parcelHelpers.interopDefault(_boardJsx);
var _userJsx = require("./user.jsx");
var _userJsxDefault = parcelHelpers.interopDefault(_userJsx);
var _commentingJsx = require("./commenting.jsx");
var _commentingJsxDefault = parcelHelpers.interopDefault(_commentingJsx);
var _issueJsx = require("./issue.jsx");
var _issueJsxDefault = parcelHelpers.interopDefault(_issueJsx);
const { render } = wp.element;
if (document.querySelector("#wp-admin-bar-alpaca-menu")) render(/*#__PURE__*/ React.createElement((0, _modalJsxDefault.default), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 15,
        columnNumber: 5
    },
    __self: undefined
}), document.querySelector("#wp-admin-bar-alpaca-report"));
if (document.querySelector("#alpaca-settings")) render(/*#__PURE__*/ React.createElement((0, _settingsJsxDefault.default), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 21,
        columnNumber: 10
    },
    __self: undefined
}), document.querySelector("#alpaca-settings"));
if (document.querySelector("#alpaca-board")) render(/*#__PURE__*/ React.createElement((0, _boardJsxDefault.default), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 25,
        columnNumber: 10
    },
    __self: undefined
}), document.querySelector("#alpaca-board"));

},{"./alpaca.scss":"1ItKB","./apitest.js":"jb82X","./modal.jsx":"lBZco","./settings.jsx":"aIYcP","./board.jsx":"h1t0l","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./user.jsx":"6qIFK","./commenting.jsx":"AUa4b","./issue.jsx":"alebk"}],"1ItKB":[function() {},{}],"jb82X":[function(require,module,exports,__globalThis) {
// --- Basic API Endpoint Tests ---
// To enable, set ALPACA_RUN_API_TESTS to true below.
// The results will be logged to your browser's developer console when the
// #alpaca-board element is on the page.
// You must be logged in with a user that has 'edit_posts' capabilities.
const ALPACA_RUN_API_TESTS = false;
if (ALPACA_RUN_API_TESTS && document.querySelector("#alpaca-board")) {
    const runApiTests = ()=>{
        console.log("--- Running Alpaca API Endpoint Tests ---");
        // Helper function for making API requests
        const testEndpoint = (url, options, operation)=>{
            // Ensure wpApiSettings is available
            if (typeof wpApiSettings === "undefined" || !wpApiSettings.root || !wpApiSettings.nonce) {
                console.error('wpApiSettings is not defined. Make sure "wp-api" is an enqueued dependency.');
                return;
            }
            console.log(`Testing ${operation}...`);
            fetch(url, options).then((response)=>{
                if (!response.ok) return response.text().then((text)=>{
                    throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
                });
                return response.json();
            }).then((data)=>console.log(`\u{2705} ${operation} SUCCESS:`, data)).catch((error)=>console.error(`\u{274C} ${operation} FAILED:`, error.message));
        };
        const nonceHeader = {
            "X-WP-Nonce": wpApiSettings.nonce
        };
        const jsonHeaders = {
            ...nonceHeader,
            "Content-Type": "application/json"
        };
        // Test GET /alpaca/v1/board
        testEndpoint(`${wpApiSettings.root}alpaca/v1/board`, {
            method: "GET",
            headers: nonceHeader
        }, "GET /alpaca/v1/board");
    };
    // Wait for the DOM to be fully loaded to ensure wpApiSettings is available.
    document.addEventListener("DOMContentLoaded", runApiTests);
}

},{}],"lBZco":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _snapdomHandlerJs = require("./snapdom-handler.js");
var _snapdomHandlerJsDefault = parcelHelpers.interopDefault(_snapdomHandlerJs);
const { Button, Modal, TextareaControl, RangeControl, BaseControl, Spinner } = wp.components;
const { useState, useRef, useEffect } = wp.element;
const AlpacaModal = ()=>{
    const [isOpen, setOpen] = useState(false);
    const [severity, setSeverity] = useState("2");
    const [status, setStatus] = useState("idle"); // idle, submitting, success, error
    const [message, setMessage] = useState("");
    const [feedback, setFeedback] = useState("");
    const textareaRef = useRef(null);
    const closeBtnRef = useRef(null);
    const openModal = ()=>{
        setMessage("");
        setStatus("idle");
        setFeedback("");
        setOpen(true);
    };
    const closeModal = ()=>{
        setOpen(false);
        setStatus("idle");
    };
    // Focus textarea when modal opens
    useEffect(()=>{
        if (isOpen && status === "idle" && textareaRef.current) setTimeout(()=>{
            textareaRef.current.focus();
        }, 10);
    }, [
        isOpen,
        status
    ]);
    // Focus close button on success or error
    useEffect(()=>{
        if ((status === "success" || status === "error") && closeBtnRef.current) setTimeout(()=>{
            closeBtnRef.current.focus();
        }, 10);
    }, [
        status
    ]);
    const submitIssue = async ()=>{
        setMessage("");
        try {
            const server = JSON.parse(atob(alpaca_data.env));
            setStatus("submitting");
            await new Promise((resolve)=>setTimeout(resolve, 1000));
            const screenshot = await (0, _snapdomHandlerJsDefault.default)();
            const submitted = {
                userinput: {
                    feedback,
                    severity
                },
                client: alpaca_data.device,
                screenshot
            };
            const payload = {
                ...submitted,
                ...server
            };
            // console.log(payload);
            const response = await fetch(wpApiSettings.root + "issue/v1/submit", {
                method: "POST",
                credentials: "include",
                headers: new Headers({
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-WP-Nonce": wpApiSettings.nonce
                }),
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            setStatus("success");
            setMessage("Your issue has been submitted successfully.");
        } catch (error) {
            console.error("Submission error:", error);
            setStatus("error");
            setMessage("There was an error submitting your issue. Please try again.");
        }
    };
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("a", {
        className: "ab-item",
        href: "#",
        onClick: (e)=>{
            e.preventDefault();
            openModal();
        },
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 91,
            columnNumber: 7
        },
        __self: undefined
    }, "Report An Issue"), isOpen && /*#__PURE__*/ React.createElement(Modal, {
        size: "medium",
        className: "alpaca-modal",
        title: status === "success" ? "Issue Submitted" : status === "error" ? "Submission Failed" : "Report An Issue",
        onRequestClose: closeModal,
        isDismissible: false,
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 103,
            columnNumber: 9
        },
        __self: undefined
    }, status === "success" || status === "error" ? /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 118,
            columnNumber: 15
        },
        __self: undefined
    }, message), /*#__PURE__*/ React.createElement(Button, {
        variant: "primary",
        onClick: closeModal,
        ref: closeBtnRef,
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 119,
            columnNumber: 15
        },
        __self: undefined
    }, "Close")) : /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(TextareaControl, {
        placeholder: "Describe the problem",
        id: "alpaca-modal-textarea",
        value: feedback,
        onChange: (value)=>setFeedback(value),
        disabled: status === "submitting",
        ref: textareaRef,
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 125,
            columnNumber: 15
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("div", {
        className: "small-wrapper",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 134,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("small", {
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 135,
            columnNumber: 17
        },
        __self: undefined
    }, "No need to describe context in your response: the development team will receive full details automatically, along with your issue report.")), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-actions",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 142,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        variant: "primary",
        onClick: submitIssue,
        disabled: status === "submitting",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 143,
            columnNumber: 17
        },
        __self: undefined
    }, status === "submitting" ? /*#__PURE__*/ React.createElement(Spinner, {
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 148,
            columnNumber: 46
        },
        __self: undefined
    }) : "Submit"), /*#__PURE__*/ React.createElement(Button, {
        variant: "secondary",
        onClick: closeModal,
        disabled: status === "submitting",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 150,
            columnNumber: 17
        },
        __self: undefined
    }, "Cancel")))));
};
exports.default = AlpacaModal;

},{"./snapdom-handler.js":"4FHYR","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4FHYR":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const handleSnapdomCapture = async ()=>{
    function hide_from_snapdom(selector) {
        const el = document.querySelector(selector);
        if (el) el.dataset.capture = "exclude";
    }
    hide_from_snapdom("#wpadminbar");
    hide_from_snapdom(".components-modal__screen-overlay");
    // https://github.com/zumerlab/snapdom
    const canvas = await snapdom.toCanvas(document.body, {
        type: "webp",
        embedFonts: true
    });
    // Calculate the visible area based on scroll position and viewport size
    const x = window.scrollX;
    const y = window.scrollY;
    const width = window.innerWidth;
    const height = window.innerHeight;
    // Create a new canvas to hold the cropped image
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const ctx = croppedCanvas.getContext("2d");
    // Draw the relevant portion of the original canvas onto the new canvas
    // ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
    // might want to exclude admin bar's 32px?
    ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
    // Get the Base64-encoded string from the canvas
    const base64String = croppedCanvas.toDataURL("image/webp", 0.5); // Set compression level
    // console.log(base64String);
    return base64String;
};
exports.default = handleSnapdomCapture;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gkKU3":[function(require,module,exports,__globalThis) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, '__esModule', {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === 'default' || key === '__esModule' || Object.prototype.hasOwnProperty.call(dest, key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"aIYcP":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const { TextControl, Button } = wp.components;
const AlpacaSettings = ()=>{
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 6,
            columnNumber: 7
        },
        __self: undefined
    }, "Time for dndkit"), /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        onClick: ()=>alert("Settings saved!"),
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 7,
            columnNumber: 7
        },
        __self: undefined
    }, "Save Settings"));
};
exports.default = AlpacaSettings;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"h1t0l":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "default", ()=>AlpacaBoard);
var _core = require("@dnd-kit/core");
var _sortable = require("@dnd-kit/sortable");
var _utilities = require("@dnd-kit/utilities");
var _user = require("./user");
var _userDefault = parcelHelpers.interopDefault(_user);
var _issue = require("./issue");
var _issueDefault = parcelHelpers.interopDefault(_issue);
const { useState, useRef, useEffect, forwardRef } = wp.element;
const { decodeEntities } = wp.htmlEntities;
/**
 * Transform server data into array format for board state.
 * @param {Array} data The data from `alpaca_get_board_data`.
 */ const transformDataForBoard = (data)=>{
    if (!data || !Array.isArray(data)) return [];
    return data.map((column)=>({
            id: column.id.toString(),
            title: decodeEntities(column.title),
            items: column.issues.map((issue)=>({
                    id: issue.id.toString(),
                    content: decodeEntities(issue.title),
                    author_name: decodeEntities(issue.author_name),
                    author_img: issue.author_img
                }))
        }));
};
/**
 * Save board order in DOM order, including container IDs & titles.
 */ const saveBoardOrder = ()=>{
    const containersInDomOrder = document.querySelectorAll(".alpaca-container");
    const data = Array.from(containersInDomOrder).map((containerEl)=>{
        const id = parseInt(containerEl.dataset.id, 10);
        const title = containerEl.querySelector("h2").textContent.trim();
        // Select all items except for the empty placeholder.
        const items = containerEl.querySelectorAll(".alpaca-item:not(.empty)");
        return {
            id,
            title,
            issues: Array.from(items).map((itemEl)=>parseInt(itemEl.dataset.id, 10))
        };
    });
    // Use wp.apiFetch to send data to the REST API endpoint.
    // It automatically handles nonces for authenticated requests.
    wp.apiFetch({
        path: "/alpaca/v1/board",
        method: "POST",
        data: data
    }).then((res)=>{
    // saved successfully
    }).catch((err)=>{
        console.error("Error saving board order:", err);
    });
};
const Item = forwardRef(({ id, content, author_name, author_img, className, style, ...props }, ref)=>{
    return /*#__PURE__*/ React.createElement("div", {
        ref: ref,
        className: className,
        style: style,
        "data-id": id,
        "data-author": author_name,
        "data-authorimg": author_img,
        ...props,
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 84,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-content",
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 93,
            columnNumber: 9
        },
        __self: undefined
    }, content), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-author",
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 94,
            columnNumber: 9
        },
        __self: undefined
    }, author_img ? /*#__PURE__*/ React.createElement("img", {
        className: "alpaca-item-author-img",
        src: author_img,
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 96,
            columnNumber: 13
        },
        __self: undefined
    }) : "", author_name));
});
/**
 * Sortable item component.
 */ function SortableItem({ id, content, className, isDragDisabled = false, onClick, author_name, author_img = "" }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = (0, _sortable.useSortable)({
        id,
        animateLayoutChanges: ()=>false,
        disabled: isDragDisabled
    });
    const style = {
        transform: isDragging ? undefined : (0, _utilities.CSS).Transform.toString(transform),
        transition: isDragging ? "none" : transition,
        cursor: isDragging ? "grabbing" : isDragDisabled ? "default" : "grab",
        visibility: isDragging ? "hidden" : "visible",
        userSelect: isDragDisabled ? "none" : "auto"
    };
    const handleClick = (event)=>{
        if (!isDragging && onClick) onClick(event, id);
    };
    return /*#__PURE__*/ React.createElement(Item, {
        ref: setNodeRef,
        id: id,
        content: content,
        author_name: author_name,
        author_img: author_img,
        className: className,
        style: style,
        onClick: handleClick,
        ...!isDragDisabled ? {
            ...attributes,
            ...listeners
        } : {
            tabIndex: -1
        },
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 147,
            columnNumber: 5
        },
        __self: this
    });
}
/**
 * Container component.
 */ function Container({ id, title, items, onItemClick }) {
    const hasItems = items.length > 0;
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-container",
        "data-id": id,
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 170,
            columnNumber: 5
        },
        __self: this
    }, /*#__PURE__*/ React.createElement("h2", {
        className: "alpaca-container-title",
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 171,
            columnNumber: 7
        },
        __self: this
    }, title), /*#__PURE__*/ React.createElement((0, _sortable.SortableContext), {
        id: id,
        items: hasItems ? items.map((item)=>item.id) : [
            id
        ],
        strategy: (0, _sortable.verticalListSortingStrategy),
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 172,
            columnNumber: 7
        },
        __self: this
    }, hasItems ? items.map((item)=>/*#__PURE__*/ React.createElement(SortableItem, {
            className: "alpaca-item",
            key: item.id,
            id: item.id,
            content: item.content,
            author_name: item.author_name,
            author_img: item.author_img,
            onClick: onItemClick,
            __source: {
                fileName: "src/board.jsx",
                lineNumber: 179,
                columnNumber: 13
            },
            __self: this
        })) : /*#__PURE__*/ React.createElement(SortableItem, {
        key: id,
        id: id,
        className: "alpaca-item empty",
        content: "Drop items here",
        isDragDisabled: true,
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 190,
            columnNumber: 11
        },
        __self: this
    })));
}
/**
 * Main board component.
 */ function Board() {
    const [containers, setContainers] = useState(()=>{
        if (typeof alpacaBoardData !== "undefined") return transformDataForBoard(alpacaBoardData);
        return [];
    });
    const sensors = (0, _core.useSensors)((0, _core.useSensor)((0, _core.PointerSensor), {
        activationConstraint: {
            distance: 5
        }
    }));
    const [activeId, setActiveId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const triggerRef = useRef(null); // To store the element that opened the modal
    const [draggedItem, setDraggedItem] = useState(null);
    function findContainerByItemId(itemId) {
        return containers.find((c)=>c.items.some((item)=>item.id === itemId));
    }
    function findContainerById(containerId) {
        return containers.find((c)=>c.id === containerId);
    }
    function getItemById(itemId) {
        for (const container of containers){
            const item = container.items.find((item)=>item.id === itemId);
            if (item) return item;
        }
        return null;
    }
    function handleDragStart(event) {
        const { active } = event;
        setActiveId(active.id);
        setDraggedItem(getItemById(active.id));
    }
    function handleDragOver(event) {
        const { active, over } = event;
        if (!over) return;
        const activeContainer = findContainerByItemId(active.id);
        const overContainer = findContainerByItemId(over.id) || findContainerById(over.id);
        if (!activeContainer || !overContainer || activeContainer.id === overContainer.id) return;
        setContainers((prev)=>{
            const newContainers = prev.map((c)=>({
                    ...c,
                    items: [
                        ...c.items
                    ]
                }));
            const source = newContainers.find((c)=>c.id === activeContainer.id);
            const destination = newContainers.find((c)=>c.id === overContainer.id);
            const activeIndex = source.items.findIndex((item)=>item.id === active.id);
            const [movedItem] = source.items.splice(activeIndex, 1);
            let newIndex;
            if (over.id === overContainer.id) newIndex = destination.items.length;
            else {
                newIndex = destination.items.findIndex((item)=>item.id === over.id);
                if (newIndex === -1) newIndex = destination.items.length;
            }
            destination.items.splice(newIndex, 0, movedItem);
            return newContainers;
        });
    }
    function handleDragEnd(event) {
        const { active, over } = event;
        setActiveId(null);
        setDraggedItem(null);
        if (!over) return;
        const activeContainer = findContainerByItemId(active.id);
        const overContainer = findContainerByItemId(over.id) || findContainerById(over.id);
        if (!activeContainer || !overContainer) return;
        if (activeContainer.id === overContainer.id) {
            const items = activeContainer.items;
            const oldIndex = items.findIndex((i)=>i.id === active.id);
            const newIndex = items.findIndex((i)=>i.id === over.id);
            if (oldIndex !== newIndex) setContainers((prev)=>prev.map((c)=>c.id === activeContainer.id ? {
                        ...c,
                        items: (0, _sortable.arrayMove)(items, oldIndex, newIndex)
                    } : c));
        }
        saveBoardOrder();
        // Send REST API call to update taxonomy term (status)
        const movedItemId = parseInt(active.id, 10);
        const newStatusTermId = parseInt(overContainer.id, 10);
        wp.apiFetch({
            path: `/issue/v1/update/${movedItemId}`,
            method: "POST",
            data: {
                taxonomies: {
                    status: [
                        newStatusTermId
                    ]
                }
            }
        }).then((res)=>{
        // successfully updated
        }).catch((err)=>{
            console.error("Error updating issue:", err);
        });
    }
    const handleItemClick = (event, itemId)=>{
        // Store the trigger element so we can return focus to it when the modal closes.
        triggerRef.current = event.currentTarget;
        // Immediately blur the clicked item. This prevents the accessibility warning
        // by ensuring the item doesn't have focus when the modal applies `aria-hidden`
        // to the rest of the page. The Modal component will then trap focus inside itself.
        event.currentTarget.blur();
        const item = getItemById(itemId);
        setSelectedItem(item);
    };
    const closeModal = ()=>{
        setSelectedItem(null);
    };
    // When the modal closes, return focus to the element that opened it.
    useEffect(()=>{
        if (!selectedItem && triggerRef.current) triggerRef.current.focus();
    }, [
        selectedItem
    ]);
    return /*#__PURE__*/ React.createElement((0, _core.DndContext), {
        sensors: sensors,
        collisionDetection: (0, _core.closestCenter),
        onDragStart: handleDragStart,
        onDragOver: handleDragOver,
        onDragEnd: handleDragEnd,
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 365,
            columnNumber: 5
        },
        __self: this
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-wrap",
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 372,
            columnNumber: 7
        },
        __self: this
    }, containers.map((container)=>/*#__PURE__*/ React.createElement(Container, {
            key: container.id,
            id: container.id,
            title: container.title,
            items: container.items,
            onItemClick: handleItemClick,
            __source: {
                fileName: "src/board.jsx",
                lineNumber: 374,
                columnNumber: 11
            },
            __self: this
        }))), /*#__PURE__*/ React.createElement((0, _core.DragOverlay), {
        dropAnimation: null,
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 383,
            columnNumber: 7
        },
        __self: this
    }, activeId && draggedItem ? /*#__PURE__*/ React.createElement(Item, {
        id: draggedItem.id,
        content: draggedItem.content,
        author_name: draggedItem.author_name,
        author_img: draggedItem.author_img,
        className: "alpaca-item-dragging",
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 385,
            columnNumber: 11
        },
        __self: this
    }) : null), /*#__PURE__*/ React.createElement((0, _issueDefault.default), {
        issueId: selectedItem?.id,
        isOpen: !!selectedItem,
        onClose: closeModal,
        triggerRef: triggerRef,
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 395,
            columnNumber: 7
        },
        __self: this
    }));
}
function AlpacaBoard() {
    return /*#__PURE__*/ React.createElement(Board, {
        __source: {
            fileName: "src/board.jsx",
            lineNumber: 406,
            columnNumber: 10
        },
        __self: this
    });
}

},{"@dnd-kit/core":"do19q","@dnd-kit/sortable":"fw7EW","@dnd-kit/utilities":"a2exI","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./user":"6qIFK","./issue":"alebk"}],"do19q":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "AutoScrollActivator", ()=>AutoScrollActivator);
parcelHelpers.export(exports, "DndContext", ()=>DndContext);
parcelHelpers.export(exports, "DragOverlay", ()=>DragOverlay);
parcelHelpers.export(exports, "KeyboardCode", ()=>KeyboardCode);
parcelHelpers.export(exports, "KeyboardSensor", ()=>KeyboardSensor);
parcelHelpers.export(exports, "MeasuringFrequency", ()=>MeasuringFrequency);
parcelHelpers.export(exports, "MeasuringStrategy", ()=>MeasuringStrategy);
parcelHelpers.export(exports, "MouseSensor", ()=>MouseSensor);
parcelHelpers.export(exports, "PointerSensor", ()=>PointerSensor);
parcelHelpers.export(exports, "TouchSensor", ()=>TouchSensor);
parcelHelpers.export(exports, "TraversalOrder", ()=>TraversalOrder);
parcelHelpers.export(exports, "applyModifiers", ()=>applyModifiers);
parcelHelpers.export(exports, "closestCenter", ()=>closestCenter);
parcelHelpers.export(exports, "closestCorners", ()=>closestCorners);
parcelHelpers.export(exports, "defaultAnnouncements", ()=>defaultAnnouncements);
parcelHelpers.export(exports, "defaultCoordinates", ()=>defaultCoordinates);
parcelHelpers.export(exports, "defaultDropAnimation", ()=>defaultDropAnimationConfiguration);
parcelHelpers.export(exports, "defaultDropAnimationSideEffects", ()=>defaultDropAnimationSideEffects);
parcelHelpers.export(exports, "defaultKeyboardCoordinateGetter", ()=>defaultKeyboardCoordinateGetter);
parcelHelpers.export(exports, "defaultScreenReaderInstructions", ()=>defaultScreenReaderInstructions);
parcelHelpers.export(exports, "getClientRect", ()=>getClientRect);
parcelHelpers.export(exports, "getFirstCollision", ()=>getFirstCollision);
parcelHelpers.export(exports, "getScrollableAncestors", ()=>getScrollableAncestors);
parcelHelpers.export(exports, "pointerWithin", ()=>pointerWithin);
parcelHelpers.export(exports, "rectIntersection", ()=>rectIntersection);
parcelHelpers.export(exports, "useDndContext", ()=>useDndContext);
parcelHelpers.export(exports, "useDndMonitor", ()=>useDndMonitor);
parcelHelpers.export(exports, "useDraggable", ()=>useDraggable);
parcelHelpers.export(exports, "useDroppable", ()=>useDroppable);
parcelHelpers.export(exports, "useSensor", ()=>useSensor);
parcelHelpers.export(exports, "useSensors", ()=>useSensors);
var _react = require("react");
var _reactDefault = parcelHelpers.interopDefault(_react);
var _reactDom = require("react-dom");
var _utilities = require("@dnd-kit/utilities");
var _accessibility = require("@dnd-kit/accessibility");
const DndMonitorContext = /*#__PURE__*/ (0, _react.createContext)(null);
function useDndMonitor(listener) {
    const registerListener = (0, _react.useContext)(DndMonitorContext);
    (0, _react.useEffect)(()=>{
        if (!registerListener) throw new Error('useDndMonitor must be used within a children of <DndContext>');
        const unsubscribe = registerListener(listener);
        return unsubscribe;
    }, [
        listener,
        registerListener
    ]);
}
function useDndMonitorProvider() {
    const [listeners] = (0, _react.useState)(()=>new Set());
    const registerListener = (0, _react.useCallback)((listener)=>{
        listeners.add(listener);
        return ()=>listeners.delete(listener);
    }, [
        listeners
    ]);
    const dispatch = (0, _react.useCallback)((_ref)=>{
        let { type, event } = _ref;
        listeners.forEach((listener)=>{
            var _listener$type;
            return (_listener$type = listener[type]) == null ? void 0 : _listener$type.call(listener, event);
        });
    }, [
        listeners
    ]);
    return [
        dispatch,
        registerListener
    ];
}
const defaultScreenReaderInstructions = {
    draggable: "\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  "
};
const defaultAnnouncements = {
    onDragStart (_ref) {
        let { active } = _ref;
        return "Picked up draggable item " + active.id + ".";
    },
    onDragOver (_ref2) {
        let { active, over } = _ref2;
        if (over) return "Draggable item " + active.id + " was moved over droppable area " + over.id + ".";
        return "Draggable item " + active.id + " is no longer over a droppable area.";
    },
    onDragEnd (_ref3) {
        let { active, over } = _ref3;
        if (over) return "Draggable item " + active.id + " was dropped over droppable area " + over.id;
        return "Draggable item " + active.id + " was dropped.";
    },
    onDragCancel (_ref4) {
        let { active } = _ref4;
        return "Dragging was cancelled. Draggable item " + active.id + " was dropped.";
    }
};
function Accessibility(_ref) {
    let { announcements = defaultAnnouncements, container, hiddenTextDescribedById, screenReaderInstructions = defaultScreenReaderInstructions } = _ref;
    const { announce, announcement } = (0, _accessibility.useAnnouncement)();
    const liveRegionId = (0, _utilities.useUniqueId)("DndLiveRegion");
    const [mounted, setMounted] = (0, _react.useState)(false);
    (0, _react.useEffect)(()=>{
        setMounted(true);
    }, []);
    useDndMonitor((0, _react.useMemo)(()=>({
            onDragStart (_ref2) {
                let { active } = _ref2;
                announce(announcements.onDragStart({
                    active
                }));
            },
            onDragMove (_ref3) {
                let { active, over } = _ref3;
                if (announcements.onDragMove) announce(announcements.onDragMove({
                    active,
                    over
                }));
            },
            onDragOver (_ref4) {
                let { active, over } = _ref4;
                announce(announcements.onDragOver({
                    active,
                    over
                }));
            },
            onDragEnd (_ref5) {
                let { active, over } = _ref5;
                announce(announcements.onDragEnd({
                    active,
                    over
                }));
            },
            onDragCancel (_ref6) {
                let { active, over } = _ref6;
                announce(announcements.onDragCancel({
                    active,
                    over
                }));
            }
        }), [
        announce,
        announcements
    ]));
    if (!mounted) return null;
    const markup = (0, _reactDefault.default).createElement((0, _reactDefault.default).Fragment, null, (0, _reactDefault.default).createElement((0, _accessibility.HiddenText), {
        id: hiddenTextDescribedById,
        value: screenReaderInstructions.draggable
    }), (0, _reactDefault.default).createElement((0, _accessibility.LiveRegion), {
        id: liveRegionId,
        announcement: announcement
    }));
    return container ? (0, _reactDom.createPortal)(markup, container) : markup;
}
var Action;
(function(Action) {
    Action["DragStart"] = "dragStart";
    Action["DragMove"] = "dragMove";
    Action["DragEnd"] = "dragEnd";
    Action["DragCancel"] = "dragCancel";
    Action["DragOver"] = "dragOver";
    Action["RegisterDroppable"] = "registerDroppable";
    Action["SetDroppableDisabled"] = "setDroppableDisabled";
    Action["UnregisterDroppable"] = "unregisterDroppable";
})(Action || (Action = {}));
function noop() {}
function useSensor(sensor, options) {
    return (0, _react.useMemo)(()=>({
            sensor,
            options: options != null ? options : {}
        }), [
        sensor,
        options
    ]);
}
function useSensors() {
    for(var _len = arguments.length, sensors = new Array(_len), _key = 0; _key < _len; _key++)sensors[_key] = arguments[_key];
    return (0, _react.useMemo)(()=>[
            ...sensors
        ].filter((sensor)=>sensor != null), [
        ...sensors
    ]);
}
const defaultCoordinates = /*#__PURE__*/ Object.freeze({
    x: 0,
    y: 0
});
/**
 * Returns the distance between two points
 */ function distanceBetween(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
function getRelativeTransformOrigin(event, rect) {
    const eventCoordinates = (0, _utilities.getEventCoordinates)(event);
    if (!eventCoordinates) return '0 0';
    const transformOrigin = {
        x: (eventCoordinates.x - rect.left) / rect.width * 100,
        y: (eventCoordinates.y - rect.top) / rect.height * 100
    };
    return transformOrigin.x + "% " + transformOrigin.y + "%";
}
/**
 * Sort collisions from smallest to greatest value
 */ function sortCollisionsAsc(_ref, _ref2) {
    let { data: { value: a } } = _ref;
    let { data: { value: b } } = _ref2;
    return a - b;
}
/**
 * Sort collisions from greatest to smallest value
 */ function sortCollisionsDesc(_ref3, _ref4) {
    let { data: { value: a } } = _ref3;
    let { data: { value: b } } = _ref4;
    return b - a;
}
/**
 * Returns the coordinates of the corners of a given rectangle:
 * [TopLeft {x, y}, TopRight {x, y}, BottomLeft {x, y}, BottomRight {x, y}]
 */ function cornersOfRectangle(_ref5) {
    let { left, top, height, width } = _ref5;
    return [
        {
            x: left,
            y: top
        },
        {
            x: left + width,
            y: top
        },
        {
            x: left,
            y: top + height
        },
        {
            x: left + width,
            y: top + height
        }
    ];
}
function getFirstCollision(collisions, property) {
    if (!collisions || collisions.length === 0) return null;
    const [firstCollision] = collisions;
    return property ? firstCollision[property] : firstCollision;
}
/**
 * Returns the coordinates of the center of a given ClientRect
 */ function centerOfRectangle(rect, left, top) {
    if (left === void 0) left = rect.left;
    if (top === void 0) top = rect.top;
    return {
        x: left + rect.width * 0.5,
        y: top + rect.height * 0.5
    };
}
/**
 * Returns the closest rectangles from an array of rectangles to the center of a given
 * rectangle.
 */ const closestCenter = (_ref)=>{
    let { collisionRect, droppableRects, droppableContainers } = _ref;
    const centerRect = centerOfRectangle(collisionRect, collisionRect.left, collisionRect.top);
    const collisions = [];
    for (const droppableContainer of droppableContainers){
        const { id } = droppableContainer;
        const rect = droppableRects.get(id);
        if (rect) {
            const distBetween = distanceBetween(centerOfRectangle(rect), centerRect);
            collisions.push({
                id,
                data: {
                    droppableContainer,
                    value: distBetween
                }
            });
        }
    }
    return collisions.sort(sortCollisionsAsc);
};
/**
 * Returns the closest rectangles from an array of rectangles to the corners of
 * another rectangle.
 */ const closestCorners = (_ref)=>{
    let { collisionRect, droppableRects, droppableContainers } = _ref;
    const corners = cornersOfRectangle(collisionRect);
    const collisions = [];
    for (const droppableContainer of droppableContainers){
        const { id } = droppableContainer;
        const rect = droppableRects.get(id);
        if (rect) {
            const rectCorners = cornersOfRectangle(rect);
            const distances = corners.reduce((accumulator, corner, index)=>{
                return accumulator + distanceBetween(rectCorners[index], corner);
            }, 0);
            const effectiveDistance = Number((distances / 4).toFixed(4));
            collisions.push({
                id,
                data: {
                    droppableContainer,
                    value: effectiveDistance
                }
            });
        }
    }
    return collisions.sort(sortCollisionsAsc);
};
/**
 * Returns the intersecting rectangle area between two rectangles
 */ function getIntersectionRatio(entry, target) {
    const top = Math.max(target.top, entry.top);
    const left = Math.max(target.left, entry.left);
    const right = Math.min(target.left + target.width, entry.left + entry.width);
    const bottom = Math.min(target.top + target.height, entry.top + entry.height);
    const width = right - left;
    const height = bottom - top;
    if (left < right && top < bottom) {
        const targetArea = target.width * target.height;
        const entryArea = entry.width * entry.height;
        const intersectionArea = width * height;
        const intersectionRatio = intersectionArea / (targetArea + entryArea - intersectionArea);
        return Number(intersectionRatio.toFixed(4));
    } // Rectangles do not overlap, or overlap has an area of zero (edge/corner overlap)
    return 0;
}
/**
 * Returns the rectangles that has the greatest intersection area with a given
 * rectangle in an array of rectangles.
 */ const rectIntersection = (_ref)=>{
    let { collisionRect, droppableRects, droppableContainers } = _ref;
    const collisions = [];
    for (const droppableContainer of droppableContainers){
        const { id } = droppableContainer;
        const rect = droppableRects.get(id);
        if (rect) {
            const intersectionRatio = getIntersectionRatio(rect, collisionRect);
            if (intersectionRatio > 0) collisions.push({
                id,
                data: {
                    droppableContainer,
                    value: intersectionRatio
                }
            });
        }
    }
    return collisions.sort(sortCollisionsDesc);
};
/**
 * Check if a given point is contained within a bounding rectangle
 */ function isPointWithinRect(point, rect) {
    const { top, left, bottom, right } = rect;
    return top <= point.y && point.y <= bottom && left <= point.x && point.x <= right;
}
/**
 * Returns the rectangles that the pointer is hovering over
 */ const pointerWithin = (_ref)=>{
    let { droppableContainers, droppableRects, pointerCoordinates } = _ref;
    if (!pointerCoordinates) return [];
    const collisions = [];
    for (const droppableContainer of droppableContainers){
        const { id } = droppableContainer;
        const rect = droppableRects.get(id);
        if (rect && isPointWithinRect(pointerCoordinates, rect)) {
            /* There may be more than a single rectangle intersecting
       * with the pointer coordinates. In order to sort the
       * colliding rectangles, we measure the distance between
       * the pointer and the corners of the intersecting rectangle
       */ const corners = cornersOfRectangle(rect);
            const distances = corners.reduce((accumulator, corner)=>{
                return accumulator + distanceBetween(pointerCoordinates, corner);
            }, 0);
            const effectiveDistance = Number((distances / 4).toFixed(4));
            collisions.push({
                id,
                data: {
                    droppableContainer,
                    value: effectiveDistance
                }
            });
        }
    }
    return collisions.sort(sortCollisionsAsc);
};
function adjustScale(transform, rect1, rect2) {
    return {
        ...transform,
        scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
        scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1
    };
}
function getRectDelta(rect1, rect2) {
    return rect1 && rect2 ? {
        x: rect1.left - rect2.left,
        y: rect1.top - rect2.top
    } : defaultCoordinates;
}
function createRectAdjustmentFn(modifier) {
    return function adjustClientRect(rect) {
        for(var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++)adjustments[_key - 1] = arguments[_key];
        return adjustments.reduce((acc, adjustment)=>({
                ...acc,
                top: acc.top + modifier * adjustment.y,
                bottom: acc.bottom + modifier * adjustment.y,
                left: acc.left + modifier * adjustment.x,
                right: acc.right + modifier * adjustment.x
            }), {
            ...rect
        });
    };
}
const getAdjustedRect = /*#__PURE__*/ createRectAdjustmentFn(1);
function parseTransform(transform) {
    if (transform.startsWith('matrix3d(')) {
        const transformArray = transform.slice(9, -1).split(/, /);
        return {
            x: +transformArray[12],
            y: +transformArray[13],
            scaleX: +transformArray[0],
            scaleY: +transformArray[5]
        };
    } else if (transform.startsWith('matrix(')) {
        const transformArray = transform.slice(7, -1).split(/, /);
        return {
            x: +transformArray[4],
            y: +transformArray[5],
            scaleX: +transformArray[0],
            scaleY: +transformArray[3]
        };
    }
    return null;
}
function inverseTransform(rect, transform, transformOrigin) {
    const parsedTransform = parseTransform(transform);
    if (!parsedTransform) return rect;
    const { scaleX, scaleY, x: translateX, y: translateY } = parsedTransform;
    const x = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
    const y = rect.top - translateY - (1 - scaleY) * parseFloat(transformOrigin.slice(transformOrigin.indexOf(' ') + 1));
    const w = scaleX ? rect.width / scaleX : rect.width;
    const h = scaleY ? rect.height / scaleY : rect.height;
    return {
        width: w,
        height: h,
        top: y,
        right: x + w,
        bottom: y + h,
        left: x
    };
}
const defaultOptions = {
    ignoreTransform: false
};
/**
 * Returns the bounding client rect of an element relative to the viewport.
 */ function getClientRect(element, options) {
    if (options === void 0) options = defaultOptions;
    let rect = element.getBoundingClientRect();
    if (options.ignoreTransform) {
        const { transform, transformOrigin } = (0, _utilities.getWindow)(element).getComputedStyle(element);
        if (transform) rect = inverseTransform(rect, transform, transformOrigin);
    }
    const { top, left, width, height, bottom, right } = rect;
    return {
        top,
        left,
        width,
        height,
        bottom,
        right
    };
}
/**
 * Returns the bounding client rect of an element relative to the viewport.
 *
 * @remarks
 * The ClientRect returned by this method does not take into account transforms
 * applied to the element it measures.
 *
 */ function getTransformAgnosticClientRect(element) {
    return getClientRect(element, {
        ignoreTransform: true
    });
}
function getWindowClientRect(element) {
    const width = element.innerWidth;
    const height = element.innerHeight;
    return {
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        width,
        height
    };
}
function isFixed(node, computedStyle) {
    if (computedStyle === void 0) computedStyle = (0, _utilities.getWindow)(node).getComputedStyle(node);
    return computedStyle.position === 'fixed';
}
function isScrollable(element, computedStyle) {
    if (computedStyle === void 0) computedStyle = (0, _utilities.getWindow)(element).getComputedStyle(element);
    const overflowRegex = /(auto|scroll|overlay)/;
    const properties = [
        'overflow',
        'overflowX',
        'overflowY'
    ];
    return properties.some((property)=>{
        const value = computedStyle[property];
        return typeof value === 'string' ? overflowRegex.test(value) : false;
    });
}
function getScrollableAncestors(element, limit) {
    const scrollParents = [];
    function findScrollableAncestors(node) {
        if (limit != null && scrollParents.length >= limit) return scrollParents;
        if (!node) return scrollParents;
        if ((0, _utilities.isDocument)(node) && node.scrollingElement != null && !scrollParents.includes(node.scrollingElement)) {
            scrollParents.push(node.scrollingElement);
            return scrollParents;
        }
        if (!(0, _utilities.isHTMLElement)(node) || (0, _utilities.isSVGElement)(node)) return scrollParents;
        if (scrollParents.includes(node)) return scrollParents;
        const computedStyle = (0, _utilities.getWindow)(element).getComputedStyle(node);
        if (node !== element) {
            if (isScrollable(node, computedStyle)) scrollParents.push(node);
        }
        if (isFixed(node, computedStyle)) return scrollParents;
        return findScrollableAncestors(node.parentNode);
    }
    if (!element) return scrollParents;
    return findScrollableAncestors(element);
}
function getFirstScrollableAncestor(node) {
    const [firstScrollableAncestor] = getScrollableAncestors(node, 1);
    return firstScrollableAncestor != null ? firstScrollableAncestor : null;
}
function getScrollableElement(element) {
    if (!(0, _utilities.canUseDOM) || !element) return null;
    if ((0, _utilities.isWindow)(element)) return element;
    if (!(0, _utilities.isNode)(element)) return null;
    if ((0, _utilities.isDocument)(element) || element === (0, _utilities.getOwnerDocument)(element).scrollingElement) return window;
    if ((0, _utilities.isHTMLElement)(element)) return element;
    return null;
}
function getScrollXCoordinate(element) {
    if ((0, _utilities.isWindow)(element)) return element.scrollX;
    return element.scrollLeft;
}
function getScrollYCoordinate(element) {
    if ((0, _utilities.isWindow)(element)) return element.scrollY;
    return element.scrollTop;
}
function getScrollCoordinates(element) {
    return {
        x: getScrollXCoordinate(element),
        y: getScrollYCoordinate(element)
    };
}
var Direction;
(function(Direction) {
    Direction[Direction["Forward"] = 1] = "Forward";
    Direction[Direction["Backward"] = -1] = "Backward";
})(Direction || (Direction = {}));
function isDocumentScrollingElement(element) {
    if (!(0, _utilities.canUseDOM) || !element) return false;
    return element === document.scrollingElement;
}
function getScrollPosition(scrollingContainer) {
    const minScroll = {
        x: 0,
        y: 0
    };
    const dimensions = isDocumentScrollingElement(scrollingContainer) ? {
        height: window.innerHeight,
        width: window.innerWidth
    } : {
        height: scrollingContainer.clientHeight,
        width: scrollingContainer.clientWidth
    };
    const maxScroll = {
        x: scrollingContainer.scrollWidth - dimensions.width,
        y: scrollingContainer.scrollHeight - dimensions.height
    };
    const isTop = scrollingContainer.scrollTop <= minScroll.y;
    const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
    const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
    const isRight = scrollingContainer.scrollLeft >= maxScroll.x;
    return {
        isTop,
        isLeft,
        isBottom,
        isRight,
        maxScroll,
        minScroll
    };
}
const defaultThreshold = {
    x: 0.2,
    y: 0.2
};
function getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, _ref, acceleration, thresholdPercentage) {
    let { top, left, right, bottom } = _ref;
    if (acceleration === void 0) acceleration = 10;
    if (thresholdPercentage === void 0) thresholdPercentage = defaultThreshold;
    const { isTop, isBottom, isLeft, isRight } = getScrollPosition(scrollContainer);
    const direction = {
        x: 0,
        y: 0
    };
    const speed = {
        x: 0,
        y: 0
    };
    const threshold = {
        height: scrollContainerRect.height * thresholdPercentage.y,
        width: scrollContainerRect.width * thresholdPercentage.x
    };
    if (!isTop && top <= scrollContainerRect.top + threshold.height) {
        // Scroll Up
        direction.y = Direction.Backward;
        speed.y = acceleration * Math.abs((scrollContainerRect.top + threshold.height - top) / threshold.height);
    } else if (!isBottom && bottom >= scrollContainerRect.bottom - threshold.height) {
        // Scroll Down
        direction.y = Direction.Forward;
        speed.y = acceleration * Math.abs((scrollContainerRect.bottom - threshold.height - bottom) / threshold.height);
    }
    if (!isRight && right >= scrollContainerRect.right - threshold.width) {
        // Scroll Right
        direction.x = Direction.Forward;
        speed.x = acceleration * Math.abs((scrollContainerRect.right - threshold.width - right) / threshold.width);
    } else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
        // Scroll Left
        direction.x = Direction.Backward;
        speed.x = acceleration * Math.abs((scrollContainerRect.left + threshold.width - left) / threshold.width);
    }
    return {
        direction,
        speed
    };
}
function getScrollElementRect(element) {
    if (element === document.scrollingElement) {
        const { innerWidth, innerHeight } = window;
        return {
            top: 0,
            left: 0,
            right: innerWidth,
            bottom: innerHeight,
            width: innerWidth,
            height: innerHeight
        };
    }
    const { top, left, right, bottom } = element.getBoundingClientRect();
    return {
        top,
        left,
        right,
        bottom,
        width: element.clientWidth,
        height: element.clientHeight
    };
}
function getScrollOffsets(scrollableAncestors) {
    return scrollableAncestors.reduce((acc, node)=>{
        return (0, _utilities.add)(acc, getScrollCoordinates(node));
    }, defaultCoordinates);
}
function getScrollXOffset(scrollableAncestors) {
    return scrollableAncestors.reduce((acc, node)=>{
        return acc + getScrollXCoordinate(node);
    }, 0);
}
function getScrollYOffset(scrollableAncestors) {
    return scrollableAncestors.reduce((acc, node)=>{
        return acc + getScrollYCoordinate(node);
    }, 0);
}
function scrollIntoViewIfNeeded(element, measure) {
    if (measure === void 0) measure = getClientRect;
    if (!element) return;
    const { top, left, bottom, right } = measure(element);
    const firstScrollableAncestor = getFirstScrollableAncestor(element);
    if (!firstScrollableAncestor) return;
    if (bottom <= 0 || right <= 0 || top >= window.innerHeight || left >= window.innerWidth) element.scrollIntoView({
        block: 'center',
        inline: 'center'
    });
}
const properties = [
    [
        'x',
        [
            'left',
            'right'
        ],
        getScrollXOffset
    ],
    [
        'y',
        [
            'top',
            'bottom'
        ],
        getScrollYOffset
    ]
];
class Rect {
    constructor(rect, element){
        this.rect = void 0;
        this.width = void 0;
        this.height = void 0;
        this.top = void 0;
        this.bottom = void 0;
        this.right = void 0;
        this.left = void 0;
        const scrollableAncestors = getScrollableAncestors(element);
        const scrollOffsets = getScrollOffsets(scrollableAncestors);
        this.rect = {
            ...rect
        };
        this.width = rect.width;
        this.height = rect.height;
        for (const [axis, keys, getScrollOffset] of properties)for (const key of keys)Object.defineProperty(this, key, {
            get: ()=>{
                const currentOffsets = getScrollOffset(scrollableAncestors);
                const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;
                return this.rect[key] + scrollOffsetsDeltla;
            },
            enumerable: true
        });
        Object.defineProperty(this, 'rect', {
            enumerable: false
        });
    }
}
class Listeners {
    constructor(target){
        this.target = void 0;
        this.listeners = [];
        this.removeAll = ()=>{
            this.listeners.forEach((listener)=>{
                var _this$target;
                return (_this$target = this.target) == null ? void 0 : _this$target.removeEventListener(...listener);
            });
        };
        this.target = target;
    }
    add(eventName, handler, options) {
        var _this$target2;
        (_this$target2 = this.target) == null || _this$target2.addEventListener(eventName, handler, options);
        this.listeners.push([
            eventName,
            handler,
            options
        ]);
    }
}
function getEventListenerTarget(target) {
    // If the `event.target` element is removed from the document events will still be targeted
    // at it, and hence won't always bubble up to the window or document anymore.
    // If there is any risk of an element being removed while it is being dragged,
    // the best practice is to attach the event listeners directly to the target.
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
    const { EventTarget } = (0, _utilities.getWindow)(target);
    return target instanceof EventTarget ? target : (0, _utilities.getOwnerDocument)(target);
}
function hasExceededDistance(delta, measurement) {
    const dx = Math.abs(delta.x);
    const dy = Math.abs(delta.y);
    if (typeof measurement === 'number') return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
    if ('x' in measurement && 'y' in measurement) return dx > measurement.x && dy > measurement.y;
    if ('x' in measurement) return dx > measurement.x;
    if ('y' in measurement) return dy > measurement.y;
    return false;
}
var EventName;
(function(EventName) {
    EventName["Click"] = "click";
    EventName["DragStart"] = "dragstart";
    EventName["Keydown"] = "keydown";
    EventName["ContextMenu"] = "contextmenu";
    EventName["Resize"] = "resize";
    EventName["SelectionChange"] = "selectionchange";
    EventName["VisibilityChange"] = "visibilitychange";
})(EventName || (EventName = {}));
function preventDefault(event) {
    event.preventDefault();
}
function stopPropagation(event) {
    event.stopPropagation();
}
var KeyboardCode;
(function(KeyboardCode) {
    KeyboardCode["Space"] = "Space";
    KeyboardCode["Down"] = "ArrowDown";
    KeyboardCode["Right"] = "ArrowRight";
    KeyboardCode["Left"] = "ArrowLeft";
    KeyboardCode["Up"] = "ArrowUp";
    KeyboardCode["Esc"] = "Escape";
    KeyboardCode["Enter"] = "Enter";
    KeyboardCode["Tab"] = "Tab";
})(KeyboardCode || (KeyboardCode = {}));
const defaultKeyboardCodes = {
    start: [
        KeyboardCode.Space,
        KeyboardCode.Enter
    ],
    cancel: [
        KeyboardCode.Esc
    ],
    end: [
        KeyboardCode.Space,
        KeyboardCode.Enter,
        KeyboardCode.Tab
    ]
};
const defaultKeyboardCoordinateGetter = (event, _ref)=>{
    let { currentCoordinates } = _ref;
    switch(event.code){
        case KeyboardCode.Right:
            return {
                ...currentCoordinates,
                x: currentCoordinates.x + 25
            };
        case KeyboardCode.Left:
            return {
                ...currentCoordinates,
                x: currentCoordinates.x - 25
            };
        case KeyboardCode.Down:
            return {
                ...currentCoordinates,
                y: currentCoordinates.y + 25
            };
        case KeyboardCode.Up:
            return {
                ...currentCoordinates,
                y: currentCoordinates.y - 25
            };
    }
    return undefined;
};
class KeyboardSensor {
    constructor(props){
        this.props = void 0;
        this.autoScrollEnabled = false;
        this.referenceCoordinates = void 0;
        this.listeners = void 0;
        this.windowListeners = void 0;
        this.props = props;
        const { event: { target } } = props;
        this.props = props;
        this.listeners = new Listeners((0, _utilities.getOwnerDocument)(target));
        this.windowListeners = new Listeners((0, _utilities.getWindow)(target));
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.attach();
    }
    attach() {
        this.handleStart();
        this.windowListeners.add(EventName.Resize, this.handleCancel);
        this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
        setTimeout(()=>this.listeners.add(EventName.Keydown, this.handleKeyDown));
    }
    handleStart() {
        const { activeNode, onStart } = this.props;
        const node = activeNode.node.current;
        if (node) scrollIntoViewIfNeeded(node);
        onStart(defaultCoordinates);
    }
    handleKeyDown(event) {
        if ((0, _utilities.isKeyboardEvent)(event)) {
            const { active, context, options } = this.props;
            const { keyboardCodes = defaultKeyboardCodes, coordinateGetter = defaultKeyboardCoordinateGetter, scrollBehavior = 'smooth' } = options;
            const { code } = event;
            if (keyboardCodes.end.includes(code)) {
                this.handleEnd(event);
                return;
            }
            if (keyboardCodes.cancel.includes(code)) {
                this.handleCancel(event);
                return;
            }
            const { collisionRect } = context.current;
            const currentCoordinates = collisionRect ? {
                x: collisionRect.left,
                y: collisionRect.top
            } : defaultCoordinates;
            if (!this.referenceCoordinates) this.referenceCoordinates = currentCoordinates;
            const newCoordinates = coordinateGetter(event, {
                active,
                context: context.current,
                currentCoordinates
            });
            if (newCoordinates) {
                const coordinatesDelta = (0, _utilities.subtract)(newCoordinates, currentCoordinates);
                const scrollDelta = {
                    x: 0,
                    y: 0
                };
                const { scrollableAncestors } = context.current;
                for (const scrollContainer of scrollableAncestors){
                    const direction = event.code;
                    const { isTop, isRight, isLeft, isBottom, maxScroll, minScroll } = getScrollPosition(scrollContainer);
                    const scrollElementRect = getScrollElementRect(scrollContainer);
                    const clampedCoordinates = {
                        x: Math.min(direction === KeyboardCode.Right ? scrollElementRect.right - scrollElementRect.width / 2 : scrollElementRect.right, Math.max(direction === KeyboardCode.Right ? scrollElementRect.left : scrollElementRect.left + scrollElementRect.width / 2, newCoordinates.x)),
                        y: Math.min(direction === KeyboardCode.Down ? scrollElementRect.bottom - scrollElementRect.height / 2 : scrollElementRect.bottom, Math.max(direction === KeyboardCode.Down ? scrollElementRect.top : scrollElementRect.top + scrollElementRect.height / 2, newCoordinates.y))
                    };
                    const canScrollX = direction === KeyboardCode.Right && !isRight || direction === KeyboardCode.Left && !isLeft;
                    const canScrollY = direction === KeyboardCode.Down && !isBottom || direction === KeyboardCode.Up && !isTop;
                    if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
                        const newScrollCoordinates = scrollContainer.scrollLeft + coordinatesDelta.x;
                        const canScrollToNewCoordinates = direction === KeyboardCode.Right && newScrollCoordinates <= maxScroll.x || direction === KeyboardCode.Left && newScrollCoordinates >= minScroll.x;
                        if (canScrollToNewCoordinates && !coordinatesDelta.y) {
                            // We don't need to update coordinates, the scroll adjustment alone will trigger
                            // logic to auto-detect the new container we are over
                            scrollContainer.scrollTo({
                                left: newScrollCoordinates,
                                behavior: scrollBehavior
                            });
                            return;
                        }
                        if (canScrollToNewCoordinates) scrollDelta.x = scrollContainer.scrollLeft - newScrollCoordinates;
                        else scrollDelta.x = direction === KeyboardCode.Right ? scrollContainer.scrollLeft - maxScroll.x : scrollContainer.scrollLeft - minScroll.x;
                        if (scrollDelta.x) scrollContainer.scrollBy({
                            left: -scrollDelta.x,
                            behavior: scrollBehavior
                        });
                        break;
                    } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
                        const newScrollCoordinates = scrollContainer.scrollTop + coordinatesDelta.y;
                        const canScrollToNewCoordinates = direction === KeyboardCode.Down && newScrollCoordinates <= maxScroll.y || direction === KeyboardCode.Up && newScrollCoordinates >= minScroll.y;
                        if (canScrollToNewCoordinates && !coordinatesDelta.x) {
                            // We don't need to update coordinates, the scroll adjustment alone will trigger
                            // logic to auto-detect the new container we are over
                            scrollContainer.scrollTo({
                                top: newScrollCoordinates,
                                behavior: scrollBehavior
                            });
                            return;
                        }
                        if (canScrollToNewCoordinates) scrollDelta.y = scrollContainer.scrollTop - newScrollCoordinates;
                        else scrollDelta.y = direction === KeyboardCode.Down ? scrollContainer.scrollTop - maxScroll.y : scrollContainer.scrollTop - minScroll.y;
                        if (scrollDelta.y) scrollContainer.scrollBy({
                            top: -scrollDelta.y,
                            behavior: scrollBehavior
                        });
                        break;
                    }
                }
                this.handleMove(event, (0, _utilities.add)((0, _utilities.subtract)(newCoordinates, this.referenceCoordinates), scrollDelta));
            }
        }
    }
    handleMove(event, coordinates) {
        const { onMove } = this.props;
        event.preventDefault();
        onMove(coordinates);
    }
    handleEnd(event) {
        const { onEnd } = this.props;
        event.preventDefault();
        this.detach();
        onEnd();
    }
    handleCancel(event) {
        const { onCancel } = this.props;
        event.preventDefault();
        this.detach();
        onCancel();
    }
    detach() {
        this.listeners.removeAll();
        this.windowListeners.removeAll();
    }
}
KeyboardSensor.activators = [
    {
        eventName: 'onKeyDown',
        handler: (event, _ref, _ref2)=>{
            let { keyboardCodes = defaultKeyboardCodes, onActivation } = _ref;
            let { active } = _ref2;
            const { code } = event.nativeEvent;
            if (keyboardCodes.start.includes(code)) {
                const activator = active.activatorNode.current;
                if (activator && event.target !== activator) return false;
                event.preventDefault();
                onActivation == null || onActivation({
                    event: event.nativeEvent
                });
                return true;
            }
            return false;
        }
    }
];
function isDistanceConstraint(constraint) {
    return Boolean(constraint && 'distance' in constraint);
}
function isDelayConstraint(constraint) {
    return Boolean(constraint && 'delay' in constraint);
}
class AbstractPointerSensor {
    constructor(props, events, listenerTarget){
        var _getEventCoordinates;
        if (listenerTarget === void 0) listenerTarget = getEventListenerTarget(props.event.target);
        this.props = void 0;
        this.events = void 0;
        this.autoScrollEnabled = true;
        this.document = void 0;
        this.activated = false;
        this.initialCoordinates = void 0;
        this.timeoutId = null;
        this.listeners = void 0;
        this.documentListeners = void 0;
        this.windowListeners = void 0;
        this.props = props;
        this.events = events;
        const { event } = props;
        const { target } = event;
        this.props = props;
        this.events = events;
        this.document = (0, _utilities.getOwnerDocument)(target);
        this.documentListeners = new Listeners(this.document);
        this.listeners = new Listeners(listenerTarget);
        this.windowListeners = new Listeners((0, _utilities.getWindow)(target));
        this.initialCoordinates = (_getEventCoordinates = (0, _utilities.getEventCoordinates)(event)) != null ? _getEventCoordinates : defaultCoordinates;
        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.removeTextSelection = this.removeTextSelection.bind(this);
        this.attach();
    }
    attach() {
        const { events, props: { options: { activationConstraint, bypassActivationConstraint } } } = this;
        this.listeners.add(events.move.name, this.handleMove, {
            passive: false
        });
        this.listeners.add(events.end.name, this.handleEnd);
        if (events.cancel) this.listeners.add(events.cancel.name, this.handleCancel);
        this.windowListeners.add(EventName.Resize, this.handleCancel);
        this.windowListeners.add(EventName.DragStart, preventDefault);
        this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
        this.windowListeners.add(EventName.ContextMenu, preventDefault);
        this.documentListeners.add(EventName.Keydown, this.handleKeydown);
        if (activationConstraint) {
            if (bypassActivationConstraint != null && bypassActivationConstraint({
                event: this.props.event,
                activeNode: this.props.activeNode,
                options: this.props.options
            })) return this.handleStart();
            if (isDelayConstraint(activationConstraint)) {
                this.timeoutId = setTimeout(this.handleStart, activationConstraint.delay);
                this.handlePending(activationConstraint);
                return;
            }
            if (isDistanceConstraint(activationConstraint)) {
                this.handlePending(activationConstraint);
                return;
            }
        }
        this.handleStart();
    }
    detach() {
        this.listeners.removeAll();
        this.windowListeners.removeAll(); // Wait until the next event loop before removing document listeners
        // This is necessary because we listen for `click` and `selection` events on the document
        setTimeout(this.documentListeners.removeAll, 50);
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
    handlePending(constraint, offset) {
        const { active, onPending } = this.props;
        onPending(active, constraint, this.initialCoordinates, offset);
    }
    handleStart() {
        const { initialCoordinates } = this;
        const { onStart } = this.props;
        if (initialCoordinates) {
            this.activated = true; // Stop propagation of click events once activation constraints are met
            this.documentListeners.add(EventName.Click, stopPropagation, {
                capture: true
            }); // Remove any text selection from the document
            this.removeTextSelection(); // Prevent further text selection while dragging
            this.documentListeners.add(EventName.SelectionChange, this.removeTextSelection);
            onStart(initialCoordinates);
        }
    }
    handleMove(event) {
        var _getEventCoordinates2;
        const { activated, initialCoordinates, props } = this;
        const { onMove, options: { activationConstraint } } = props;
        if (!initialCoordinates) return;
        const coordinates = (_getEventCoordinates2 = (0, _utilities.getEventCoordinates)(event)) != null ? _getEventCoordinates2 : defaultCoordinates;
        const delta = (0, _utilities.subtract)(initialCoordinates, coordinates); // Constraint validation
        if (!activated && activationConstraint) {
            if (isDistanceConstraint(activationConstraint)) {
                if (activationConstraint.tolerance != null && hasExceededDistance(delta, activationConstraint.tolerance)) return this.handleCancel();
                if (hasExceededDistance(delta, activationConstraint.distance)) return this.handleStart();
            }
            if (isDelayConstraint(activationConstraint)) {
                if (hasExceededDistance(delta, activationConstraint.tolerance)) return this.handleCancel();
            }
            this.handlePending(activationConstraint, delta);
            return;
        }
        if (event.cancelable) event.preventDefault();
        onMove(coordinates);
    }
    handleEnd() {
        const { onAbort, onEnd } = this.props;
        this.detach();
        if (!this.activated) onAbort(this.props.active);
        onEnd();
    }
    handleCancel() {
        const { onAbort, onCancel } = this.props;
        this.detach();
        if (!this.activated) onAbort(this.props.active);
        onCancel();
    }
    handleKeydown(event) {
        if (event.code === KeyboardCode.Esc) this.handleCancel();
    }
    removeTextSelection() {
        var _this$document$getSel;
        (_this$document$getSel = this.document.getSelection()) == null || _this$document$getSel.removeAllRanges();
    }
}
const events = {
    cancel: {
        name: 'pointercancel'
    },
    move: {
        name: 'pointermove'
    },
    end: {
        name: 'pointerup'
    }
};
class PointerSensor extends AbstractPointerSensor {
    constructor(props){
        const { event } = props; // Pointer events stop firing if the target is unmounted while dragging
        // Therefore we attach listeners to the owner document instead
        const listenerTarget = (0, _utilities.getOwnerDocument)(event.target);
        super(props, events, listenerTarget);
    }
}
PointerSensor.activators = [
    {
        eventName: 'onPointerDown',
        handler: (_ref, _ref2)=>{
            let { nativeEvent: event } = _ref;
            let { onActivation } = _ref2;
            if (!event.isPrimary || event.button !== 0) return false;
            onActivation == null || onActivation({
                event
            });
            return true;
        }
    }
];
const events$1 = {
    move: {
        name: 'mousemove'
    },
    end: {
        name: 'mouseup'
    }
};
var MouseButton;
(function(MouseButton) {
    MouseButton[MouseButton["RightClick"] = 2] = "RightClick";
})(MouseButton || (MouseButton = {}));
class MouseSensor extends AbstractPointerSensor {
    constructor(props){
        super(props, events$1, (0, _utilities.getOwnerDocument)(props.event.target));
    }
}
MouseSensor.activators = [
    {
        eventName: 'onMouseDown',
        handler: (_ref, _ref2)=>{
            let { nativeEvent: event } = _ref;
            let { onActivation } = _ref2;
            if (event.button === MouseButton.RightClick) return false;
            onActivation == null || onActivation({
                event
            });
            return true;
        }
    }
];
const events$2 = {
    cancel: {
        name: 'touchcancel'
    },
    move: {
        name: 'touchmove'
    },
    end: {
        name: 'touchend'
    }
};
class TouchSensor extends AbstractPointerSensor {
    constructor(props){
        super(props, events$2);
    }
    static setup() {
        // Adding a non-capture and non-passive `touchmove` listener in order
        // to force `event.preventDefault()` calls to work in dynamically added
        // touchmove event handlers. This is required for iOS Safari.
        window.addEventListener(events$2.move.name, noop, {
            capture: false,
            passive: false
        });
        return function teardown() {
            window.removeEventListener(events$2.move.name, noop);
        }; // We create a new handler because the teardown function of another sensor
        // could remove our event listener if we use a referentially equal listener.
        function noop() {}
    }
}
TouchSensor.activators = [
    {
        eventName: 'onTouchStart',
        handler: (_ref, _ref2)=>{
            let { nativeEvent: event } = _ref;
            let { onActivation } = _ref2;
            const { touches } = event;
            if (touches.length > 1) return false;
            onActivation == null || onActivation({
                event
            });
            return true;
        }
    }
];
var AutoScrollActivator;
(function(AutoScrollActivator) {
    AutoScrollActivator[AutoScrollActivator["Pointer"] = 0] = "Pointer";
    AutoScrollActivator[AutoScrollActivator["DraggableRect"] = 1] = "DraggableRect";
})(AutoScrollActivator || (AutoScrollActivator = {}));
var TraversalOrder;
(function(TraversalOrder) {
    TraversalOrder[TraversalOrder["TreeOrder"] = 0] = "TreeOrder";
    TraversalOrder[TraversalOrder["ReversedTreeOrder"] = 1] = "ReversedTreeOrder";
})(TraversalOrder || (TraversalOrder = {}));
function useAutoScroller(_ref) {
    let { acceleration, activator = AutoScrollActivator.Pointer, canScroll, draggingRect, enabled, interval = 5, order = TraversalOrder.TreeOrder, pointerCoordinates, scrollableAncestors, scrollableAncestorRects, delta, threshold } = _ref;
    const scrollIntent = useScrollIntent({
        delta,
        disabled: !enabled
    });
    const [setAutoScrollInterval, clearAutoScrollInterval] = (0, _utilities.useInterval)();
    const scrollSpeed = (0, _react.useRef)({
        x: 0,
        y: 0
    });
    const scrollDirection = (0, _react.useRef)({
        x: 0,
        y: 0
    });
    const rect = (0, _react.useMemo)(()=>{
        switch(activator){
            case AutoScrollActivator.Pointer:
                return pointerCoordinates ? {
                    top: pointerCoordinates.y,
                    bottom: pointerCoordinates.y,
                    left: pointerCoordinates.x,
                    right: pointerCoordinates.x
                } : null;
            case AutoScrollActivator.DraggableRect:
                return draggingRect;
        }
    }, [
        activator,
        draggingRect,
        pointerCoordinates
    ]);
    const scrollContainerRef = (0, _react.useRef)(null);
    const autoScroll = (0, _react.useCallback)(()=>{
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;
        const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
        const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;
        scrollContainer.scrollBy(scrollLeft, scrollTop);
    }, []);
    const sortedScrollableAncestors = (0, _react.useMemo)(()=>order === TraversalOrder.TreeOrder ? [
            ...scrollableAncestors
        ].reverse() : scrollableAncestors, [
        order,
        scrollableAncestors
    ]);
    (0, _react.useEffect)(()=>{
        if (!enabled || !scrollableAncestors.length || !rect) {
            clearAutoScrollInterval();
            return;
        }
        for (const scrollContainer of sortedScrollableAncestors){
            if ((canScroll == null ? void 0 : canScroll(scrollContainer)) === false) continue;
            const index = scrollableAncestors.indexOf(scrollContainer);
            const scrollContainerRect = scrollableAncestorRects[index];
            if (!scrollContainerRect) continue;
            const { direction, speed } = getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, rect, acceleration, threshold);
            for (const axis of [
                'x',
                'y'
            ])if (!scrollIntent[axis][direction[axis]]) {
                speed[axis] = 0;
                direction[axis] = 0;
            }
            if (speed.x > 0 || speed.y > 0) {
                clearAutoScrollInterval();
                scrollContainerRef.current = scrollContainer;
                setAutoScrollInterval(autoScroll, interval);
                scrollSpeed.current = speed;
                scrollDirection.current = direction;
                return;
            }
        }
        scrollSpeed.current = {
            x: 0,
            y: 0
        };
        scrollDirection.current = {
            x: 0,
            y: 0
        };
        clearAutoScrollInterval();
    }, [
        acceleration,
        autoScroll,
        canScroll,
        clearAutoScrollInterval,
        enabled,
        interval,
        JSON.stringify(rect),
        JSON.stringify(scrollIntent),
        setAutoScrollInterval,
        scrollableAncestors,
        sortedScrollableAncestors,
        scrollableAncestorRects,
        JSON.stringify(threshold)
    ]);
}
const defaultScrollIntent = {
    x: {
        [Direction.Backward]: false,
        [Direction.Forward]: false
    },
    y: {
        [Direction.Backward]: false,
        [Direction.Forward]: false
    }
};
function useScrollIntent(_ref2) {
    let { delta, disabled } = _ref2;
    const previousDelta = (0, _utilities.usePrevious)(delta);
    return (0, _utilities.useLazyMemo)((previousIntent)=>{
        if (disabled || !previousDelta || !previousIntent) // Reset scroll intent tracking when auto-scrolling is disabled
        return defaultScrollIntent;
        const direction = {
            x: Math.sign(delta.x - previousDelta.x),
            y: Math.sign(delta.y - previousDelta.y)
        }; // Keep track of the user intent to scroll in each direction for both axis
        return {
            x: {
                [Direction.Backward]: previousIntent.x[Direction.Backward] || direction.x === -1,
                [Direction.Forward]: previousIntent.x[Direction.Forward] || direction.x === 1
            },
            y: {
                [Direction.Backward]: previousIntent.y[Direction.Backward] || direction.y === -1,
                [Direction.Forward]: previousIntent.y[Direction.Forward] || direction.y === 1
            }
        };
    }, [
        disabled,
        delta,
        previousDelta
    ]);
}
function useCachedNode(draggableNodes, id) {
    const draggableNode = id != null ? draggableNodes.get(id) : undefined;
    const node = draggableNode ? draggableNode.node.current : null;
    return (0, _utilities.useLazyMemo)((cachedNode)=>{
        var _ref;
        if (id == null) return null;
         // In some cases, the draggable node can unmount while dragging
        // This is the case for virtualized lists. In those situations,
        // we fall back to the last known value for that node.
        return (_ref = node != null ? node : cachedNode) != null ? _ref : null;
    }, [
        node,
        id
    ]);
}
function useCombineActivators(sensors, getSyntheticHandler) {
    return (0, _react.useMemo)(()=>sensors.reduce((accumulator, sensor)=>{
            const { sensor: Sensor } = sensor;
            const sensorActivators = Sensor.activators.map((activator)=>({
                    eventName: activator.eventName,
                    handler: getSyntheticHandler(activator.handler, sensor)
                }));
            return [
                ...accumulator,
                ...sensorActivators
            ];
        }, []), [
        sensors,
        getSyntheticHandler
    ]);
}
var MeasuringStrategy;
(function(MeasuringStrategy) {
    MeasuringStrategy[MeasuringStrategy["Always"] = 0] = "Always";
    MeasuringStrategy[MeasuringStrategy["BeforeDragging"] = 1] = "BeforeDragging";
    MeasuringStrategy[MeasuringStrategy["WhileDragging"] = 2] = "WhileDragging";
})(MeasuringStrategy || (MeasuringStrategy = {}));
var MeasuringFrequency;
(function(MeasuringFrequency) {
    MeasuringFrequency["Optimized"] = "optimized";
})(MeasuringFrequency || (MeasuringFrequency = {}));
const defaultValue = /*#__PURE__*/ new Map();
function useDroppableMeasuring(containers, _ref) {
    let { dragging, dependencies, config } = _ref;
    const [queue, setQueue] = (0, _react.useState)(null);
    const { frequency, measure, strategy } = config;
    const containersRef = (0, _react.useRef)(containers);
    const disabled = isDisabled();
    const disabledRef = (0, _utilities.useLatestValue)(disabled);
    const measureDroppableContainers = (0, _react.useCallback)(function(ids) {
        if (ids === void 0) ids = [];
        if (disabledRef.current) return;
        setQueue((value)=>{
            if (value === null) return ids;
            return value.concat(ids.filter((id)=>!value.includes(id)));
        });
    }, [
        disabledRef
    ]);
    const timeoutId = (0, _react.useRef)(null);
    const droppableRects = (0, _utilities.useLazyMemo)((previousValue)=>{
        if (disabled && !dragging) return defaultValue;
        if (!previousValue || previousValue === defaultValue || containersRef.current !== containers || queue != null) {
            const map = new Map();
            for (let container of containers){
                if (!container) continue;
                if (queue && queue.length > 0 && !queue.includes(container.id) && container.rect.current) {
                    // This container does not need to be re-measured
                    map.set(container.id, container.rect.current);
                    continue;
                }
                const node = container.node.current;
                const rect = node ? new Rect(measure(node), node) : null;
                container.rect.current = rect;
                if (rect) map.set(container.id, rect);
            }
            return map;
        }
        return previousValue;
    }, [
        containers,
        queue,
        dragging,
        disabled,
        measure
    ]);
    (0, _react.useEffect)(()=>{
        containersRef.current = containers;
    }, [
        containers
    ]);
    (0, _react.useEffect)(()=>{
        if (disabled) return;
        measureDroppableContainers();
    }, [
        dragging,
        disabled
    ]);
    (0, _react.useEffect)(()=>{
        if (queue && queue.length > 0) setQueue(null);
    }, [
        JSON.stringify(queue)
    ]);
    (0, _react.useEffect)(()=>{
        if (disabled || typeof frequency !== 'number' || timeoutId.current !== null) return;
        timeoutId.current = setTimeout(()=>{
            measureDroppableContainers();
            timeoutId.current = null;
        }, frequency);
    }, [
        frequency,
        disabled,
        measureDroppableContainers,
        ...dependencies
    ]);
    return {
        droppableRects,
        measureDroppableContainers,
        measuringScheduled: queue != null
    };
    function isDisabled() {
        switch(strategy){
            case MeasuringStrategy.Always:
                return false;
            case MeasuringStrategy.BeforeDragging:
                return dragging;
            default:
                return !dragging;
        }
    }
}
function useInitialValue(value, computeFn) {
    return (0, _utilities.useLazyMemo)((previousValue)=>{
        if (!value) return null;
        if (previousValue) return previousValue;
        return typeof computeFn === 'function' ? computeFn(value) : value;
    }, [
        computeFn,
        value
    ]);
}
function useInitialRect(node, measure) {
    return useInitialValue(node, measure);
}
/**
 * Returns a new MutationObserver instance.
 * If `MutationObserver` is undefined in the execution environment, returns `undefined`.
 */ function useMutationObserver(_ref) {
    let { callback, disabled } = _ref;
    const handleMutations = (0, _utilities.useEvent)(callback);
    const mutationObserver = (0, _react.useMemo)(()=>{
        if (disabled || typeof window === 'undefined' || typeof window.MutationObserver === 'undefined') return undefined;
        const { MutationObserver } = window;
        return new MutationObserver(handleMutations);
    }, [
        handleMutations,
        disabled
    ]);
    (0, _react.useEffect)(()=>{
        return ()=>mutationObserver == null ? void 0 : mutationObserver.disconnect();
    }, [
        mutationObserver
    ]);
    return mutationObserver;
}
/**
 * Returns a new ResizeObserver instance bound to the `onResize` callback.
 * If `ResizeObserver` is undefined in the execution environment, returns `undefined`.
 */ function useResizeObserver(_ref) {
    let { callback, disabled } = _ref;
    const handleResize = (0, _utilities.useEvent)(callback);
    const resizeObserver = (0, _react.useMemo)(()=>{
        if (disabled || typeof window === 'undefined' || typeof window.ResizeObserver === 'undefined') return undefined;
        const { ResizeObserver } = window;
        return new ResizeObserver(handleResize);
    }, [
        disabled
    ]);
    (0, _react.useEffect)(()=>{
        return ()=>resizeObserver == null ? void 0 : resizeObserver.disconnect();
    }, [
        resizeObserver
    ]);
    return resizeObserver;
}
function defaultMeasure(element) {
    return new Rect(getClientRect(element), element);
}
function useRect(element, measure, fallbackRect) {
    if (measure === void 0) measure = defaultMeasure;
    const [rect, setRect] = (0, _react.useState)(null);
    function measureRect() {
        setRect((currentRect)=>{
            if (!element) return null;
            if (element.isConnected === false) {
                var _ref;
                // Fall back to last rect we measured if the element is
                // no longer connected to the DOM.
                return (_ref = currentRect != null ? currentRect : fallbackRect) != null ? _ref : null;
            }
            const newRect = measure(element);
            if (JSON.stringify(currentRect) === JSON.stringify(newRect)) return currentRect;
            return newRect;
        });
    }
    const mutationObserver = useMutationObserver({
        callback (records) {
            if (!element) return;
            for (const record of records){
                const { type, target } = record;
                if (type === 'childList' && target instanceof HTMLElement && target.contains(element)) {
                    measureRect();
                    break;
                }
            }
        }
    });
    const resizeObserver = useResizeObserver({
        callback: measureRect
    });
    (0, _utilities.useIsomorphicLayoutEffect)(()=>{
        measureRect();
        if (element) {
            resizeObserver == null || resizeObserver.observe(element);
            mutationObserver == null || mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            resizeObserver == null || resizeObserver.disconnect();
            mutationObserver == null || mutationObserver.disconnect();
        }
    }, [
        element
    ]);
    return rect;
}
function useRectDelta(rect) {
    const initialRect = useInitialValue(rect);
    return getRectDelta(rect, initialRect);
}
const defaultValue$1 = [];
function useScrollableAncestors(node) {
    const previousNode = (0, _react.useRef)(node);
    const ancestors = (0, _utilities.useLazyMemo)((previousValue)=>{
        if (!node) return defaultValue$1;
        if (previousValue && previousValue !== defaultValue$1 && node && previousNode.current && node.parentNode === previousNode.current.parentNode) return previousValue;
        return getScrollableAncestors(node);
    }, [
        node
    ]);
    (0, _react.useEffect)(()=>{
        previousNode.current = node;
    }, [
        node
    ]);
    return ancestors;
}
function useScrollOffsets(elements) {
    const [scrollCoordinates, setScrollCoordinates] = (0, _react.useState)(null);
    const prevElements = (0, _react.useRef)(elements); // To-do: Throttle the handleScroll callback
    const handleScroll = (0, _react.useCallback)((event)=>{
        const scrollingElement = getScrollableElement(event.target);
        if (!scrollingElement) return;
        setScrollCoordinates((scrollCoordinates)=>{
            if (!scrollCoordinates) return null;
            scrollCoordinates.set(scrollingElement, getScrollCoordinates(scrollingElement));
            return new Map(scrollCoordinates);
        });
    }, []);
    (0, _react.useEffect)(()=>{
        const previousElements = prevElements.current;
        if (elements !== previousElements) {
            cleanup(previousElements);
            const entries = elements.map((element)=>{
                const scrollableElement = getScrollableElement(element);
                if (scrollableElement) {
                    scrollableElement.addEventListener('scroll', handleScroll, {
                        passive: true
                    });
                    return [
                        scrollableElement,
                        getScrollCoordinates(scrollableElement)
                    ];
                }
                return null;
            }).filter((entry)=>entry != null);
            setScrollCoordinates(entries.length ? new Map(entries) : null);
            prevElements.current = elements;
        }
        return ()=>{
            cleanup(elements);
            cleanup(previousElements);
        };
        function cleanup(elements) {
            elements.forEach((element)=>{
                const scrollableElement = getScrollableElement(element);
                scrollableElement == null || scrollableElement.removeEventListener('scroll', handleScroll);
            });
        }
    }, [
        handleScroll,
        elements
    ]);
    return (0, _react.useMemo)(()=>{
        if (elements.length) return scrollCoordinates ? Array.from(scrollCoordinates.values()).reduce((acc, coordinates)=>(0, _utilities.add)(acc, coordinates), defaultCoordinates) : getScrollOffsets(elements);
        return defaultCoordinates;
    }, [
        elements,
        scrollCoordinates
    ]);
}
function useScrollOffsetsDelta(scrollOffsets, dependencies) {
    if (dependencies === void 0) dependencies = [];
    const initialScrollOffsets = (0, _react.useRef)(null);
    (0, _react.useEffect)(()=>{
        initialScrollOffsets.current = null;
    }, dependencies);
    (0, _react.useEffect)(()=>{
        const hasScrollOffsets = scrollOffsets !== defaultCoordinates;
        if (hasScrollOffsets && !initialScrollOffsets.current) initialScrollOffsets.current = scrollOffsets;
        if (!hasScrollOffsets && initialScrollOffsets.current) initialScrollOffsets.current = null;
    }, [
        scrollOffsets
    ]);
    return initialScrollOffsets.current ? (0, _utilities.subtract)(scrollOffsets, initialScrollOffsets.current) : defaultCoordinates;
}
function useSensorSetup(sensors) {
    (0, _react.useEffect)(()=>{
        if (!(0, _utilities.canUseDOM)) return;
        const teardownFns = sensors.map((_ref)=>{
            let { sensor } = _ref;
            return sensor.setup == null ? void 0 : sensor.setup();
        });
        return ()=>{
            for (const teardown of teardownFns)teardown == null || teardown();
        };
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    sensors.map((_ref2)=>{
        let { sensor } = _ref2;
        return sensor;
    }));
}
function useSyntheticListeners(listeners, id) {
    return (0, _react.useMemo)(()=>{
        return listeners.reduce((acc, _ref)=>{
            let { eventName, handler } = _ref;
            acc[eventName] = (event)=>{
                handler(event, id);
            };
            return acc;
        }, {});
    }, [
        listeners,
        id
    ]);
}
function useWindowRect(element) {
    return (0, _react.useMemo)(()=>element ? getWindowClientRect(element) : null, [
        element
    ]);
}
const defaultValue$2 = [];
function useRects(elements, measure) {
    if (measure === void 0) measure = getClientRect;
    const [firstElement] = elements;
    const windowRect = useWindowRect(firstElement ? (0, _utilities.getWindow)(firstElement) : null);
    const [rects, setRects] = (0, _react.useState)(defaultValue$2);
    function measureRects() {
        setRects(()=>{
            if (!elements.length) return defaultValue$2;
            return elements.map((element)=>isDocumentScrollingElement(element) ? windowRect : new Rect(measure(element), element));
        });
    }
    const resizeObserver = useResizeObserver({
        callback: measureRects
    });
    (0, _utilities.useIsomorphicLayoutEffect)(()=>{
        resizeObserver == null || resizeObserver.disconnect();
        measureRects();
        elements.forEach((element)=>resizeObserver == null ? void 0 : resizeObserver.observe(element));
    }, [
        elements
    ]);
    return rects;
}
function getMeasurableNode(node) {
    if (!node) return null;
    if (node.children.length > 1) return node;
    const firstChild = node.children[0];
    return (0, _utilities.isHTMLElement)(firstChild) ? firstChild : node;
}
function useDragOverlayMeasuring(_ref) {
    let { measure } = _ref;
    const [rect, setRect] = (0, _react.useState)(null);
    const handleResize = (0, _react.useCallback)((entries)=>{
        for (const { target } of entries)if ((0, _utilities.isHTMLElement)(target)) {
            setRect((rect)=>{
                const newRect = measure(target);
                return rect ? {
                    ...rect,
                    width: newRect.width,
                    height: newRect.height
                } : newRect;
            });
            break;
        }
    }, [
        measure
    ]);
    const resizeObserver = useResizeObserver({
        callback: handleResize
    });
    const handleNodeChange = (0, _react.useCallback)((element)=>{
        const node = getMeasurableNode(element);
        resizeObserver == null || resizeObserver.disconnect();
        if (node) resizeObserver == null || resizeObserver.observe(node);
        setRect(node ? measure(node) : null);
    }, [
        measure,
        resizeObserver
    ]);
    const [nodeRef, setRef] = (0, _utilities.useNodeRef)(handleNodeChange);
    return (0, _react.useMemo)(()=>({
            nodeRef,
            rect,
            setRef
        }), [
        rect,
        nodeRef,
        setRef
    ]);
}
const defaultSensors = [
    {
        sensor: PointerSensor,
        options: {}
    },
    {
        sensor: KeyboardSensor,
        options: {}
    }
];
const defaultData = {
    current: {}
};
const defaultMeasuringConfiguration = {
    draggable: {
        measure: getTransformAgnosticClientRect
    },
    droppable: {
        measure: getTransformAgnosticClientRect,
        strategy: MeasuringStrategy.WhileDragging,
        frequency: MeasuringFrequency.Optimized
    },
    dragOverlay: {
        measure: getClientRect
    }
};
class DroppableContainersMap extends Map {
    get(id) {
        var _super$get;
        return id != null ? (_super$get = super.get(id)) != null ? _super$get : undefined : undefined;
    }
    toArray() {
        return Array.from(this.values());
    }
    getEnabled() {
        return this.toArray().filter((_ref)=>{
            let { disabled } = _ref;
            return !disabled;
        });
    }
    getNodeFor(id) {
        var _this$get$node$curren, _this$get;
        return (_this$get$node$curren = (_this$get = this.get(id)) == null ? void 0 : _this$get.node.current) != null ? _this$get$node$curren : undefined;
    }
}
const defaultPublicContext = {
    activatorEvent: null,
    active: null,
    activeNode: null,
    activeNodeRect: null,
    collisions: null,
    containerNodeRect: null,
    draggableNodes: /*#__PURE__*/ new Map(),
    droppableRects: /*#__PURE__*/ new Map(),
    droppableContainers: /*#__PURE__*/ new DroppableContainersMap(),
    over: null,
    dragOverlay: {
        nodeRef: {
            current: null
        },
        rect: null,
        setRef: noop
    },
    scrollableAncestors: [],
    scrollableAncestorRects: [],
    measuringConfiguration: defaultMeasuringConfiguration,
    measureDroppableContainers: noop,
    windowRect: null,
    measuringScheduled: false
};
const defaultInternalContext = {
    activatorEvent: null,
    activators: [],
    active: null,
    activeNodeRect: null,
    ariaDescribedById: {
        draggable: ''
    },
    dispatch: noop,
    draggableNodes: /*#__PURE__*/ new Map(),
    over: null,
    measureDroppableContainers: noop
};
const InternalContext = /*#__PURE__*/ (0, _react.createContext)(defaultInternalContext);
const PublicContext = /*#__PURE__*/ (0, _react.createContext)(defaultPublicContext);
function getInitialState() {
    return {
        draggable: {
            active: null,
            initialCoordinates: {
                x: 0,
                y: 0
            },
            nodes: new Map(),
            translate: {
                x: 0,
                y: 0
            }
        },
        droppable: {
            containers: new DroppableContainersMap()
        }
    };
}
function reducer(state, action) {
    switch(action.type){
        case Action.DragStart:
            return {
                ...state,
                draggable: {
                    ...state.draggable,
                    initialCoordinates: action.initialCoordinates,
                    active: action.active
                }
            };
        case Action.DragMove:
            if (state.draggable.active == null) return state;
            return {
                ...state,
                draggable: {
                    ...state.draggable,
                    translate: {
                        x: action.coordinates.x - state.draggable.initialCoordinates.x,
                        y: action.coordinates.y - state.draggable.initialCoordinates.y
                    }
                }
            };
        case Action.DragEnd:
        case Action.DragCancel:
            return {
                ...state,
                draggable: {
                    ...state.draggable,
                    active: null,
                    initialCoordinates: {
                        x: 0,
                        y: 0
                    },
                    translate: {
                        x: 0,
                        y: 0
                    }
                }
            };
        case Action.RegisterDroppable:
            {
                const { element } = action;
                const { id } = element;
                const containers = new DroppableContainersMap(state.droppable.containers);
                containers.set(id, element);
                return {
                    ...state,
                    droppable: {
                        ...state.droppable,
                        containers
                    }
                };
            }
        case Action.SetDroppableDisabled:
            {
                const { id, key, disabled } = action;
                const element = state.droppable.containers.get(id);
                if (!element || key !== element.key) return state;
                const containers = new DroppableContainersMap(state.droppable.containers);
                containers.set(id, {
                    ...element,
                    disabled
                });
                return {
                    ...state,
                    droppable: {
                        ...state.droppable,
                        containers
                    }
                };
            }
        case Action.UnregisterDroppable:
            {
                const { id, key } = action;
                const element = state.droppable.containers.get(id);
                if (!element || key !== element.key) return state;
                const containers = new DroppableContainersMap(state.droppable.containers);
                containers.delete(id);
                return {
                    ...state,
                    droppable: {
                        ...state.droppable,
                        containers
                    }
                };
            }
        default:
            return state;
    }
}
function RestoreFocus(_ref) {
    let { disabled } = _ref;
    const { active, activatorEvent, draggableNodes } = (0, _react.useContext)(InternalContext);
    const previousActivatorEvent = (0, _utilities.usePrevious)(activatorEvent);
    const previousActiveId = (0, _utilities.usePrevious)(active == null ? void 0 : active.id); // Restore keyboard focus on the activator node
    (0, _react.useEffect)(()=>{
        if (disabled) return;
        if (!activatorEvent && previousActivatorEvent && previousActiveId != null) {
            if (!(0, _utilities.isKeyboardEvent)(previousActivatorEvent)) return;
            if (document.activeElement === previousActivatorEvent.target) // No need to restore focus
            return;
            const draggableNode = draggableNodes.get(previousActiveId);
            if (!draggableNode) return;
            const { activatorNode, node } = draggableNode;
            if (!activatorNode.current && !node.current) return;
            requestAnimationFrame(()=>{
                for (const element of [
                    activatorNode.current,
                    node.current
                ]){
                    if (!element) continue;
                    const focusableNode = (0, _utilities.findFirstFocusableNode)(element);
                    if (focusableNode) {
                        focusableNode.focus();
                        break;
                    }
                }
            });
        }
    }, [
        activatorEvent,
        disabled,
        draggableNodes,
        previousActiveId,
        previousActivatorEvent
    ]);
    return null;
}
function applyModifiers(modifiers, _ref) {
    let { transform, ...args } = _ref;
    return modifiers != null && modifiers.length ? modifiers.reduce((accumulator, modifier)=>{
        return modifier({
            transform: accumulator,
            ...args
        });
    }, transform) : transform;
}
function useMeasuringConfiguration(config) {
    return (0, _react.useMemo)(()=>({
            draggable: {
                ...defaultMeasuringConfiguration.draggable,
                ...config == null ? void 0 : config.draggable
            },
            droppable: {
                ...defaultMeasuringConfiguration.droppable,
                ...config == null ? void 0 : config.droppable
            },
            dragOverlay: {
                ...defaultMeasuringConfiguration.dragOverlay,
                ...config == null ? void 0 : config.dragOverlay
            }
        }), [
        config == null ? void 0 : config.draggable,
        config == null ? void 0 : config.droppable,
        config == null ? void 0 : config.dragOverlay
    ]);
}
function useLayoutShiftScrollCompensation(_ref) {
    let { activeNode, measure, initialRect, config = true } = _ref;
    const initialized = (0, _react.useRef)(false);
    const { x, y } = typeof config === 'boolean' ? {
        x: config,
        y: config
    } : config;
    (0, _utilities.useIsomorphicLayoutEffect)(()=>{
        const disabled = !x && !y;
        if (disabled || !activeNode) {
            initialized.current = false;
            return;
        }
        if (initialized.current || !initialRect) // Return early if layout shift scroll compensation was already attempted
        // or if there is no initialRect to compare to.
        return;
         // Get the most up to date node ref for the active draggable
        const node = activeNode == null ? void 0 : activeNode.node.current;
        if (!node || node.isConnected === false) // Return early if there is no attached node ref or if the node is
        // disconnected from the document.
        return;
        const rect = measure(node);
        const rectDelta = getRectDelta(rect, initialRect);
        if (!x) rectDelta.x = 0;
        if (!y) rectDelta.y = 0;
         // Only perform layout shift scroll compensation once
        initialized.current = true;
        if (Math.abs(rectDelta.x) > 0 || Math.abs(rectDelta.y) > 0) {
            const firstScrollableAncestor = getFirstScrollableAncestor(node);
            if (firstScrollableAncestor) firstScrollableAncestor.scrollBy({
                top: rectDelta.y,
                left: rectDelta.x
            });
        }
    }, [
        activeNode,
        x,
        y,
        initialRect,
        measure
    ]);
}
const ActiveDraggableContext = /*#__PURE__*/ (0, _react.createContext)({
    ...defaultCoordinates,
    scaleX: 1,
    scaleY: 1
});
var Status;
(function(Status) {
    Status[Status["Uninitialized"] = 0] = "Uninitialized";
    Status[Status["Initializing"] = 1] = "Initializing";
    Status[Status["Initialized"] = 2] = "Initialized";
})(Status || (Status = {}));
const DndContext = /*#__PURE__*/ (0, _react.memo)(function DndContext(_ref) {
    var _sensorContext$curren, _dragOverlay$nodeRef$, _dragOverlay$rect, _over$rect;
    let { id, accessibility, autoScroll = true, children, sensors = defaultSensors, collisionDetection = rectIntersection, measuring, modifiers, ...props } = _ref;
    const store = (0, _react.useReducer)(reducer, undefined, getInitialState);
    const [state, dispatch] = store;
    const [dispatchMonitorEvent, registerMonitorListener] = useDndMonitorProvider();
    const [status, setStatus] = (0, _react.useState)(Status.Uninitialized);
    const isInitialized = status === Status.Initialized;
    const { draggable: { active: activeId, nodes: draggableNodes, translate }, droppable: { containers: droppableContainers } } = state;
    const node = activeId != null ? draggableNodes.get(activeId) : null;
    const activeRects = (0, _react.useRef)({
        initial: null,
        translated: null
    });
    const active = (0, _react.useMemo)(()=>{
        var _node$data;
        return activeId != null ? {
            id: activeId,
            // It's possible for the active node to unmount while dragging
            data: (_node$data = node == null ? void 0 : node.data) != null ? _node$data : defaultData,
            rect: activeRects
        } : null;
    }, [
        activeId,
        node
    ]);
    const activeRef = (0, _react.useRef)(null);
    const [activeSensor, setActiveSensor] = (0, _react.useState)(null);
    const [activatorEvent, setActivatorEvent] = (0, _react.useState)(null);
    const latestProps = (0, _utilities.useLatestValue)(props, Object.values(props));
    const draggableDescribedById = (0, _utilities.useUniqueId)("DndDescribedBy", id);
    const enabledDroppableContainers = (0, _react.useMemo)(()=>droppableContainers.getEnabled(), [
        droppableContainers
    ]);
    const measuringConfiguration = useMeasuringConfiguration(measuring);
    const { droppableRects, measureDroppableContainers, measuringScheduled } = useDroppableMeasuring(enabledDroppableContainers, {
        dragging: isInitialized,
        dependencies: [
            translate.x,
            translate.y
        ],
        config: measuringConfiguration.droppable
    });
    const activeNode = useCachedNode(draggableNodes, activeId);
    const activationCoordinates = (0, _react.useMemo)(()=>activatorEvent ? (0, _utilities.getEventCoordinates)(activatorEvent) : null, [
        activatorEvent
    ]);
    const autoScrollOptions = getAutoScrollerOptions();
    const initialActiveNodeRect = useInitialRect(activeNode, measuringConfiguration.draggable.measure);
    useLayoutShiftScrollCompensation({
        activeNode: activeId != null ? draggableNodes.get(activeId) : null,
        config: autoScrollOptions.layoutShiftCompensation,
        initialRect: initialActiveNodeRect,
        measure: measuringConfiguration.draggable.measure
    });
    const activeNodeRect = useRect(activeNode, measuringConfiguration.draggable.measure, initialActiveNodeRect);
    const containerNodeRect = useRect(activeNode ? activeNode.parentElement : null);
    const sensorContext = (0, _react.useRef)({
        activatorEvent: null,
        active: null,
        activeNode,
        collisionRect: null,
        collisions: null,
        droppableRects,
        draggableNodes,
        draggingNode: null,
        draggingNodeRect: null,
        droppableContainers,
        over: null,
        scrollableAncestors: [],
        scrollAdjustedTranslate: null
    });
    const overNode = droppableContainers.getNodeFor((_sensorContext$curren = sensorContext.current.over) == null ? void 0 : _sensorContext$curren.id);
    const dragOverlay = useDragOverlayMeasuring({
        measure: measuringConfiguration.dragOverlay.measure
    }); // Use the rect of the drag overlay if it is mounted
    const draggingNode = (_dragOverlay$nodeRef$ = dragOverlay.nodeRef.current) != null ? _dragOverlay$nodeRef$ : activeNode;
    const draggingNodeRect = isInitialized ? (_dragOverlay$rect = dragOverlay.rect) != null ? _dragOverlay$rect : activeNodeRect : null;
    const usesDragOverlay = Boolean(dragOverlay.nodeRef.current && dragOverlay.rect); // The delta between the previous and new position of the draggable node
    // is only relevant when there is no drag overlay
    const nodeRectDelta = useRectDelta(usesDragOverlay ? null : activeNodeRect); // Get the window rect of the dragging node
    const windowRect = useWindowRect(draggingNode ? (0, _utilities.getWindow)(draggingNode) : null); // Get scrollable ancestors of the dragging node
    const scrollableAncestors = useScrollableAncestors(isInitialized ? overNode != null ? overNode : activeNode : null);
    const scrollableAncestorRects = useRects(scrollableAncestors); // Apply modifiers
    const modifiedTranslate = applyModifiers(modifiers, {
        transform: {
            x: translate.x - nodeRectDelta.x,
            y: translate.y - nodeRectDelta.y,
            scaleX: 1,
            scaleY: 1
        },
        activatorEvent,
        active,
        activeNodeRect,
        containerNodeRect,
        draggingNodeRect,
        over: sensorContext.current.over,
        overlayNodeRect: dragOverlay.rect,
        scrollableAncestors,
        scrollableAncestorRects,
        windowRect
    });
    const pointerCoordinates = activationCoordinates ? (0, _utilities.add)(activationCoordinates, translate) : null;
    const scrollOffsets = useScrollOffsets(scrollableAncestors); // Represents the scroll delta since dragging was initiated
    const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets); // Represents the scroll delta since the last time the active node rect was measured
    const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [
        activeNodeRect
    ]);
    const scrollAdjustedTranslate = (0, _utilities.add)(modifiedTranslate, scrollAdjustment);
    const collisionRect = draggingNodeRect ? getAdjustedRect(draggingNodeRect, modifiedTranslate) : null;
    const collisions = active && collisionRect ? collisionDetection({
        active,
        collisionRect,
        droppableRects,
        droppableContainers: enabledDroppableContainers,
        pointerCoordinates
    }) : null;
    const overId = getFirstCollision(collisions, 'id');
    const [over, setOver] = (0, _react.useState)(null); // When there is no drag overlay used, we need to account for the
    // window scroll delta
    const appliedTranslate = usesDragOverlay ? modifiedTranslate : (0, _utilities.add)(modifiedTranslate, activeNodeScrollDelta);
    const transform = adjustScale(appliedTranslate, (_over$rect = over == null ? void 0 : over.rect) != null ? _over$rect : null, activeNodeRect);
    const activeSensorRef = (0, _react.useRef)(null);
    const instantiateSensor = (0, _react.useCallback)((event, _ref2)=>{
        let { sensor: Sensor, options } = _ref2;
        if (activeRef.current == null) return;
        const activeNode = draggableNodes.get(activeRef.current);
        if (!activeNode) return;
        const activatorEvent = event.nativeEvent;
        const sensorInstance = new Sensor({
            active: activeRef.current,
            activeNode,
            event: activatorEvent,
            options,
            // Sensors need to be instantiated with refs for arguments that change over time
            // otherwise they are frozen in time with the stale arguments
            context: sensorContext,
            onAbort (id) {
                const draggableNode = draggableNodes.get(id);
                if (!draggableNode) return;
                const { onDragAbort } = latestProps.current;
                const event = {
                    id
                };
                onDragAbort == null || onDragAbort(event);
                dispatchMonitorEvent({
                    type: 'onDragAbort',
                    event
                });
            },
            onPending (id, constraint, initialCoordinates, offset) {
                const draggableNode = draggableNodes.get(id);
                if (!draggableNode) return;
                const { onDragPending } = latestProps.current;
                const event = {
                    id,
                    constraint,
                    initialCoordinates,
                    offset
                };
                onDragPending == null || onDragPending(event);
                dispatchMonitorEvent({
                    type: 'onDragPending',
                    event
                });
            },
            onStart (initialCoordinates) {
                const id = activeRef.current;
                if (id == null) return;
                const draggableNode = draggableNodes.get(id);
                if (!draggableNode) return;
                const { onDragStart } = latestProps.current;
                const event = {
                    activatorEvent,
                    active: {
                        id,
                        data: draggableNode.data,
                        rect: activeRects
                    }
                };
                (0, _reactDom.unstable_batchedUpdates)(()=>{
                    onDragStart == null || onDragStart(event);
                    setStatus(Status.Initializing);
                    dispatch({
                        type: Action.DragStart,
                        initialCoordinates,
                        active: id
                    });
                    dispatchMonitorEvent({
                        type: 'onDragStart',
                        event
                    });
                    setActiveSensor(activeSensorRef.current);
                    setActivatorEvent(activatorEvent);
                });
            },
            onMove (coordinates) {
                dispatch({
                    type: Action.DragMove,
                    coordinates
                });
            },
            onEnd: createHandler(Action.DragEnd),
            onCancel: createHandler(Action.DragCancel)
        });
        activeSensorRef.current = sensorInstance;
        function createHandler(type) {
            return async function handler() {
                const { active, collisions, over, scrollAdjustedTranslate } = sensorContext.current;
                let event = null;
                if (active && scrollAdjustedTranslate) {
                    const { cancelDrop } = latestProps.current;
                    event = {
                        activatorEvent,
                        active: active,
                        collisions,
                        delta: scrollAdjustedTranslate,
                        over
                    };
                    if (type === Action.DragEnd && typeof cancelDrop === 'function') {
                        const shouldCancel = await Promise.resolve(cancelDrop(event));
                        if (shouldCancel) type = Action.DragCancel;
                    }
                }
                activeRef.current = null;
                (0, _reactDom.unstable_batchedUpdates)(()=>{
                    dispatch({
                        type
                    });
                    setStatus(Status.Uninitialized);
                    setOver(null);
                    setActiveSensor(null);
                    setActivatorEvent(null);
                    activeSensorRef.current = null;
                    const eventName = type === Action.DragEnd ? 'onDragEnd' : 'onDragCancel';
                    if (event) {
                        const handler = latestProps.current[eventName];
                        handler == null || handler(event);
                        dispatchMonitorEvent({
                            type: eventName,
                            event
                        });
                    }
                });
            };
        }
    }, [
        draggableNodes
    ]);
    const bindActivatorToSensorInstantiator = (0, _react.useCallback)((handler, sensor)=>{
        return (event, active)=>{
            const nativeEvent = event.nativeEvent;
            const activeDraggableNode = draggableNodes.get(active);
            if (activeRef.current !== null || // No active draggable
            !activeDraggableNode || // Event has already been captured
            nativeEvent.dndKit || nativeEvent.defaultPrevented) return;
            const activationContext = {
                active: activeDraggableNode
            };
            const shouldActivate = handler(event, sensor.options, activationContext);
            if (shouldActivate === true) {
                nativeEvent.dndKit = {
                    capturedBy: sensor.sensor
                };
                activeRef.current = active;
                instantiateSensor(event, sensor);
            }
        };
    }, [
        draggableNodes,
        instantiateSensor
    ]);
    const activators = useCombineActivators(sensors, bindActivatorToSensorInstantiator);
    useSensorSetup(sensors);
    (0, _utilities.useIsomorphicLayoutEffect)(()=>{
        if (activeNodeRect && status === Status.Initializing) setStatus(Status.Initialized);
    }, [
        activeNodeRect,
        status
    ]);
    (0, _react.useEffect)(()=>{
        const { onDragMove } = latestProps.current;
        const { active, activatorEvent, collisions, over } = sensorContext.current;
        if (!active || !activatorEvent) return;
        const event = {
            active,
            activatorEvent,
            collisions,
            delta: {
                x: scrollAdjustedTranslate.x,
                y: scrollAdjustedTranslate.y
            },
            over
        };
        (0, _reactDom.unstable_batchedUpdates)(()=>{
            onDragMove == null || onDragMove(event);
            dispatchMonitorEvent({
                type: 'onDragMove',
                event
            });
        });
    }, [
        scrollAdjustedTranslate.x,
        scrollAdjustedTranslate.y
    ]);
    (0, _react.useEffect)(()=>{
        const { active, activatorEvent, collisions, droppableContainers, scrollAdjustedTranslate } = sensorContext.current;
        if (!active || activeRef.current == null || !activatorEvent || !scrollAdjustedTranslate) return;
        const { onDragOver } = latestProps.current;
        const overContainer = droppableContainers.get(overId);
        const over = overContainer && overContainer.rect.current ? {
            id: overContainer.id,
            rect: overContainer.rect.current,
            data: overContainer.data,
            disabled: overContainer.disabled
        } : null;
        const event = {
            active,
            activatorEvent,
            collisions,
            delta: {
                x: scrollAdjustedTranslate.x,
                y: scrollAdjustedTranslate.y
            },
            over
        };
        (0, _reactDom.unstable_batchedUpdates)(()=>{
            setOver(over);
            onDragOver == null || onDragOver(event);
            dispatchMonitorEvent({
                type: 'onDragOver',
                event
            });
        });
    }, [
        overId
    ]);
    (0, _utilities.useIsomorphicLayoutEffect)(()=>{
        sensorContext.current = {
            activatorEvent,
            active,
            activeNode,
            collisionRect,
            collisions,
            droppableRects,
            draggableNodes,
            draggingNode,
            draggingNodeRect,
            droppableContainers,
            over,
            scrollableAncestors,
            scrollAdjustedTranslate
        };
        activeRects.current = {
            initial: draggingNodeRect,
            translated: collisionRect
        };
    }, [
        active,
        activeNode,
        collisions,
        collisionRect,
        draggableNodes,
        draggingNode,
        draggingNodeRect,
        droppableRects,
        droppableContainers,
        over,
        scrollableAncestors,
        scrollAdjustedTranslate
    ]);
    useAutoScroller({
        ...autoScrollOptions,
        delta: translate,
        draggingRect: collisionRect,
        pointerCoordinates,
        scrollableAncestors,
        scrollableAncestorRects
    });
    const publicContext = (0, _react.useMemo)(()=>{
        const context = {
            active,
            activeNode,
            activeNodeRect,
            activatorEvent,
            collisions,
            containerNodeRect,
            dragOverlay,
            draggableNodes,
            droppableContainers,
            droppableRects,
            over,
            measureDroppableContainers,
            scrollableAncestors,
            scrollableAncestorRects,
            measuringConfiguration,
            measuringScheduled,
            windowRect
        };
        return context;
    }, [
        active,
        activeNode,
        activeNodeRect,
        activatorEvent,
        collisions,
        containerNodeRect,
        dragOverlay,
        draggableNodes,
        droppableContainers,
        droppableRects,
        over,
        measureDroppableContainers,
        scrollableAncestors,
        scrollableAncestorRects,
        measuringConfiguration,
        measuringScheduled,
        windowRect
    ]);
    const internalContext = (0, _react.useMemo)(()=>{
        const context = {
            activatorEvent,
            activators,
            active,
            activeNodeRect,
            ariaDescribedById: {
                draggable: draggableDescribedById
            },
            dispatch,
            draggableNodes,
            over,
            measureDroppableContainers
        };
        return context;
    }, [
        activatorEvent,
        activators,
        active,
        activeNodeRect,
        dispatch,
        draggableDescribedById,
        draggableNodes,
        over,
        measureDroppableContainers
    ]);
    return (0, _reactDefault.default).createElement(DndMonitorContext.Provider, {
        value: registerMonitorListener
    }, (0, _reactDefault.default).createElement(InternalContext.Provider, {
        value: internalContext
    }, (0, _reactDefault.default).createElement(PublicContext.Provider, {
        value: publicContext
    }, (0, _reactDefault.default).createElement(ActiveDraggableContext.Provider, {
        value: transform
    }, children)), (0, _reactDefault.default).createElement(RestoreFocus, {
        disabled: (accessibility == null ? void 0 : accessibility.restoreFocus) === false
    })), (0, _reactDefault.default).createElement(Accessibility, {
        ...accessibility,
        hiddenTextDescribedById: draggableDescribedById
    }));
    function getAutoScrollerOptions() {
        const activeSensorDisablesAutoscroll = (activeSensor == null ? void 0 : activeSensor.autoScrollEnabled) === false;
        const autoScrollGloballyDisabled = typeof autoScroll === 'object' ? autoScroll.enabled === false : autoScroll === false;
        const enabled = isInitialized && !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;
        if (typeof autoScroll === 'object') return {
            ...autoScroll,
            enabled
        };
        return {
            enabled
        };
    }
});
const NullContext = /*#__PURE__*/ (0, _react.createContext)(null);
const defaultRole = 'button';
const ID_PREFIX = 'Draggable';
function useDraggable(_ref) {
    let { id, data, disabled = false, attributes } = _ref;
    const key = (0, _utilities.useUniqueId)(ID_PREFIX);
    const { activators, activatorEvent, active, activeNodeRect, ariaDescribedById, draggableNodes, over } = (0, _react.useContext)(InternalContext);
    const { role = defaultRole, roleDescription = 'draggable', tabIndex = 0 } = attributes != null ? attributes : {};
    const isDragging = (active == null ? void 0 : active.id) === id;
    const transform = (0, _react.useContext)(isDragging ? ActiveDraggableContext : NullContext);
    const [node, setNodeRef] = (0, _utilities.useNodeRef)();
    const [activatorNode, setActivatorNodeRef] = (0, _utilities.useNodeRef)();
    const listeners = useSyntheticListeners(activators, id);
    const dataRef = (0, _utilities.useLatestValue)(data);
    (0, _utilities.useIsomorphicLayoutEffect)(()=>{
        draggableNodes.set(id, {
            id,
            key,
            node,
            activatorNode,
            data: dataRef
        });
        return ()=>{
            const node = draggableNodes.get(id);
            if (node && node.key === key) draggableNodes.delete(id);
        };
    }, [
        draggableNodes,
        id
    ]);
    const memoizedAttributes = (0, _react.useMemo)(()=>({
            role,
            tabIndex,
            'aria-disabled': disabled,
            'aria-pressed': isDragging && role === defaultRole ? true : undefined,
            'aria-roledescription': roleDescription,
            'aria-describedby': ariaDescribedById.draggable
        }), [
        disabled,
        role,
        tabIndex,
        isDragging,
        roleDescription,
        ariaDescribedById.draggable
    ]);
    return {
        active,
        activatorEvent,
        activeNodeRect,
        attributes: memoizedAttributes,
        isDragging,
        listeners: disabled ? undefined : listeners,
        node,
        over,
        setNodeRef,
        setActivatorNodeRef,
        transform
    };
}
function useDndContext() {
    return (0, _react.useContext)(PublicContext);
}
const ID_PREFIX$1 = 'Droppable';
const defaultResizeObserverConfig = {
    timeout: 25
};
function useDroppable(_ref) {
    let { data, disabled = false, id, resizeObserverConfig } = _ref;
    const key = (0, _utilities.useUniqueId)(ID_PREFIX$1);
    const { active, dispatch, over, measureDroppableContainers } = (0, _react.useContext)(InternalContext);
    const previous = (0, _react.useRef)({
        disabled
    });
    const resizeObserverConnected = (0, _react.useRef)(false);
    const rect = (0, _react.useRef)(null);
    const callbackId = (0, _react.useRef)(null);
    const { disabled: resizeObserverDisabled, updateMeasurementsFor, timeout: resizeObserverTimeout } = {
        ...defaultResizeObserverConfig,
        ...resizeObserverConfig
    };
    const ids = (0, _utilities.useLatestValue)(updateMeasurementsFor != null ? updateMeasurementsFor : id);
    const handleResize = (0, _react.useCallback)(()=>{
        if (!resizeObserverConnected.current) {
            // ResizeObserver invokes the `handleResize` callback as soon as `observe` is called,
            // assuming the element is rendered and displayed.
            resizeObserverConnected.current = true;
            return;
        }
        if (callbackId.current != null) clearTimeout(callbackId.current);
        callbackId.current = setTimeout(()=>{
            measureDroppableContainers(Array.isArray(ids.current) ? ids.current : [
                ids.current
            ]);
            callbackId.current = null;
        }, resizeObserverTimeout);
    }, [
        resizeObserverTimeout
    ]);
    const resizeObserver = useResizeObserver({
        callback: handleResize,
        disabled: resizeObserverDisabled || !active
    });
    const handleNodeChange = (0, _react.useCallback)((newElement, previousElement)=>{
        if (!resizeObserver) return;
        if (previousElement) {
            resizeObserver.unobserve(previousElement);
            resizeObserverConnected.current = false;
        }
        if (newElement) resizeObserver.observe(newElement);
    }, [
        resizeObserver
    ]);
    const [nodeRef, setNodeRef] = (0, _utilities.useNodeRef)(handleNodeChange);
    const dataRef = (0, _utilities.useLatestValue)(data);
    (0, _react.useEffect)(()=>{
        if (!resizeObserver || !nodeRef.current) return;
        resizeObserver.disconnect();
        resizeObserverConnected.current = false;
        resizeObserver.observe(nodeRef.current);
    }, [
        nodeRef,
        resizeObserver
    ]);
    (0, _react.useEffect)(()=>{
        dispatch({
            type: Action.RegisterDroppable,
            element: {
                id,
                key,
                disabled,
                node: nodeRef,
                rect,
                data: dataRef
            }
        });
        return ()=>dispatch({
                type: Action.UnregisterDroppable,
                key,
                id
            });
    }, [
        id
    ]);
    (0, _react.useEffect)(()=>{
        if (disabled !== previous.current.disabled) {
            dispatch({
                type: Action.SetDroppableDisabled,
                id,
                key,
                disabled
            });
            previous.current.disabled = disabled;
        }
    }, [
        id,
        key,
        disabled,
        dispatch
    ]);
    return {
        active,
        rect,
        isOver: (over == null ? void 0 : over.id) === id,
        node: nodeRef,
        over,
        setNodeRef
    };
}
function AnimationManager(_ref) {
    let { animation, children } = _ref;
    const [clonedChildren, setClonedChildren] = (0, _react.useState)(null);
    const [element, setElement] = (0, _react.useState)(null);
    const previousChildren = (0, _utilities.usePrevious)(children);
    if (!children && !clonedChildren && previousChildren) setClonedChildren(previousChildren);
    (0, _utilities.useIsomorphicLayoutEffect)(()=>{
        if (!element) return;
        const key = clonedChildren == null ? void 0 : clonedChildren.key;
        const id = clonedChildren == null ? void 0 : clonedChildren.props.id;
        if (key == null || id == null) {
            setClonedChildren(null);
            return;
        }
        Promise.resolve(animation(id, element)).then(()=>{
            setClonedChildren(null);
        });
    }, [
        animation,
        clonedChildren,
        element
    ]);
    return (0, _reactDefault.default).createElement((0, _reactDefault.default).Fragment, null, children, clonedChildren ? (0, _react.cloneElement)(clonedChildren, {
        ref: setElement
    }) : null);
}
const defaultTransform = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1
};
function NullifiedContextProvider(_ref) {
    let { children } = _ref;
    return (0, _reactDefault.default).createElement(InternalContext.Provider, {
        value: defaultInternalContext
    }, (0, _reactDefault.default).createElement(ActiveDraggableContext.Provider, {
        value: defaultTransform
    }, children));
}
const baseStyles = {
    position: 'fixed',
    touchAction: 'none'
};
const defaultTransition = (activatorEvent)=>{
    const isKeyboardActivator = (0, _utilities.isKeyboardEvent)(activatorEvent);
    return isKeyboardActivator ? 'transform 250ms ease' : undefined;
};
const PositionedOverlay = /*#__PURE__*/ (0, _react.forwardRef)((_ref, ref)=>{
    let { as, activatorEvent, adjustScale, children, className, rect, style, transform, transition = defaultTransition } = _ref;
    if (!rect) return null;
    const scaleAdjustedTransform = adjustScale ? transform : {
        ...transform,
        scaleX: 1,
        scaleY: 1
    };
    const styles = {
        ...baseStyles,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        transform: (0, _utilities.CSS).Transform.toString(scaleAdjustedTransform),
        transformOrigin: adjustScale && activatorEvent ? getRelativeTransformOrigin(activatorEvent, rect) : undefined,
        transition: typeof transition === 'function' ? transition(activatorEvent) : transition,
        ...style
    };
    return (0, _reactDefault.default).createElement(as, {
        className,
        style: styles,
        ref
    }, children);
});
const defaultDropAnimationSideEffects = (options)=>(_ref)=>{
        let { active, dragOverlay } = _ref;
        const originalStyles = {};
        const { styles, className } = options;
        if (styles != null && styles.active) for (const [key, value] of Object.entries(styles.active)){
            if (value === undefined) continue;
            originalStyles[key] = active.node.style.getPropertyValue(key);
            active.node.style.setProperty(key, value);
        }
        if (styles != null && styles.dragOverlay) for (const [key, value] of Object.entries(styles.dragOverlay)){
            if (value === undefined) continue;
            dragOverlay.node.style.setProperty(key, value);
        }
        if (className != null && className.active) active.node.classList.add(className.active);
        if (className != null && className.dragOverlay) dragOverlay.node.classList.add(className.dragOverlay);
        return function cleanup() {
            for (const [key, value] of Object.entries(originalStyles))active.node.style.setProperty(key, value);
            if (className != null && className.active) active.node.classList.remove(className.active);
        };
    };
const defaultKeyframeResolver = (_ref2)=>{
    let { transform: { initial, final } } = _ref2;
    return [
        {
            transform: (0, _utilities.CSS).Transform.toString(initial)
        },
        {
            transform: (0, _utilities.CSS).Transform.toString(final)
        }
    ];
};
const defaultDropAnimationConfiguration = {
    duration: 250,
    easing: 'ease',
    keyframes: defaultKeyframeResolver,
    sideEffects: /*#__PURE__*/ defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0'
            }
        }
    })
};
function useDropAnimation(_ref3) {
    let { config, draggableNodes, droppableContainers, measuringConfiguration } = _ref3;
    return (0, _utilities.useEvent)((id, node)=>{
        if (config === null) return;
        const activeDraggable = draggableNodes.get(id);
        if (!activeDraggable) return;
        const activeNode = activeDraggable.node.current;
        if (!activeNode) return;
        const measurableNode = getMeasurableNode(node);
        if (!measurableNode) return;
        const { transform } = (0, _utilities.getWindow)(node).getComputedStyle(node);
        const parsedTransform = parseTransform(transform);
        if (!parsedTransform) return;
        const animation = typeof config === 'function' ? config : createDefaultDropAnimation(config);
        scrollIntoViewIfNeeded(activeNode, measuringConfiguration.draggable.measure);
        return animation({
            active: {
                id,
                data: activeDraggable.data,
                node: activeNode,
                rect: measuringConfiguration.draggable.measure(activeNode)
            },
            draggableNodes,
            dragOverlay: {
                node,
                rect: measuringConfiguration.dragOverlay.measure(measurableNode)
            },
            droppableContainers,
            measuringConfiguration,
            transform: parsedTransform
        });
    });
}
function createDefaultDropAnimation(options) {
    const { duration, easing, sideEffects, keyframes } = {
        ...defaultDropAnimationConfiguration,
        ...options
    };
    return (_ref4)=>{
        let { active, dragOverlay, transform, ...rest } = _ref4;
        if (!duration) // Do not animate if animation duration is zero.
        return;
        const delta = {
            x: dragOverlay.rect.left - active.rect.left,
            y: dragOverlay.rect.top - active.rect.top
        };
        const scale = {
            scaleX: transform.scaleX !== 1 ? active.rect.width * transform.scaleX / dragOverlay.rect.width : 1,
            scaleY: transform.scaleY !== 1 ? active.rect.height * transform.scaleY / dragOverlay.rect.height : 1
        };
        const finalTransform = {
            x: transform.x - delta.x,
            y: transform.y - delta.y,
            ...scale
        };
        const animationKeyframes = keyframes({
            ...rest,
            active,
            dragOverlay,
            transform: {
                initial: transform,
                final: finalTransform
            }
        });
        const [firstKeyframe] = animationKeyframes;
        const lastKeyframe = animationKeyframes[animationKeyframes.length - 1];
        if (JSON.stringify(firstKeyframe) === JSON.stringify(lastKeyframe)) // The start and end keyframes are the same, infer that there is no animation needed.
        return;
        const cleanup = sideEffects == null ? void 0 : sideEffects({
            active,
            dragOverlay,
            ...rest
        });
        const animation = dragOverlay.node.animate(animationKeyframes, {
            duration,
            easing,
            fill: 'forwards'
        });
        return new Promise((resolve)=>{
            animation.onfinish = ()=>{
                cleanup == null || cleanup();
                resolve();
            };
        });
    };
}
let key = 0;
function useKey(id) {
    return (0, _react.useMemo)(()=>{
        if (id == null) return;
        key++;
        return key;
    }, [
        id
    ]);
}
const DragOverlay = /*#__PURE__*/ (0, _reactDefault.default).memo((_ref)=>{
    let { adjustScale = false, children, dropAnimation: dropAnimationConfig, style, transition, modifiers, wrapperElement = 'div', className, zIndex = 999 } = _ref;
    const { activatorEvent, active, activeNodeRect, containerNodeRect, draggableNodes, droppableContainers, dragOverlay, over, measuringConfiguration, scrollableAncestors, scrollableAncestorRects, windowRect } = useDndContext();
    const transform = (0, _react.useContext)(ActiveDraggableContext);
    const key = useKey(active == null ? void 0 : active.id);
    const modifiedTransform = applyModifiers(modifiers, {
        activatorEvent,
        active,
        activeNodeRect,
        containerNodeRect,
        draggingNodeRect: dragOverlay.rect,
        over,
        overlayNodeRect: dragOverlay.rect,
        scrollableAncestors,
        scrollableAncestorRects,
        transform,
        windowRect
    });
    const initialRect = useInitialValue(activeNodeRect);
    const dropAnimation = useDropAnimation({
        config: dropAnimationConfig,
        draggableNodes,
        droppableContainers,
        measuringConfiguration
    }); // We need to wait for the active node to be measured before connecting the drag overlay ref
    // otherwise collisions can be computed against a mispositioned drag overlay
    const ref = initialRect ? dragOverlay.setRef : undefined;
    return (0, _reactDefault.default).createElement(NullifiedContextProvider, null, (0, _reactDefault.default).createElement(AnimationManager, {
        animation: dropAnimation
    }, active && key ? (0, _reactDefault.default).createElement(PositionedOverlay, {
        key: key,
        id: active.id,
        ref: ref,
        as: wrapperElement,
        activatorEvent: activatorEvent,
        adjustScale: adjustScale,
        className: className,
        transition: transition,
        rect: initialRect,
        style: {
            zIndex,
            ...style
        },
        transform: modifiedTransform
    }, children) : null));
});

},{"react":"f39IF","react-dom":"fc7O8","@dnd-kit/utilities":"a2exI","@dnd-kit/accessibility":"7roGJ","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"f39IF":[function(require,module,exports,__globalThis) {
// This exposes WordPress global React
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "createElement", ()=>createElement);
parcelHelpers.export(exports, "useState", ()=>useState);
parcelHelpers.export(exports, "useEffect", ()=>useEffect);
parcelHelpers.export(exports, "useRef", ()=>useRef);
parcelHelpers.export(exports, "useCallback", ()=>useCallback);
parcelHelpers.export(exports, "createContext", ()=>createContext);
parcelHelpers.export(exports, "useContext", ()=>useContext);
parcelHelpers.export(exports, "useMemo", ()=>useMemo);
parcelHelpers.export(exports, "memo", ()=>memo);
parcelHelpers.export(exports, "useReducer", ()=>useReducer);
parcelHelpers.export(exports, "cloneElement", ()=>cloneElement);
parcelHelpers.export(exports, "forwardRef", ()=>forwardRef);
parcelHelpers.export(exports, "useLayoutEffect", ()=>useLayoutEffect);
const createElement = wp.element.createElement;
const useState = wp.element.useState;
const useEffect = wp.element.useEffect;
const useRef = wp.element.useRef;
const useCallback = wp.element.useCallback;
const createContext = wp.element.createContext;
const useContext = wp.element.useContext;
const useMemo = wp.element.useMemo;
const memo = wp.element.memo;
const useReducer = wp.element.useReducer;
const cloneElement = wp.element.cloneElement;
const forwardRef = wp.element.forwardRef;
const useLayoutEffect = wp.element.useLayoutEffect;
exports.default = wp.element; // default export is the whole wp.element

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fc7O8":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "render", ()=>render);
parcelHelpers.export(exports, "createPortal", ()=>createPortal);
parcelHelpers.export(exports, "unstable_batchedUpdates", ()=>unstable_batchedUpdates);
const { render, createPortal } = wp.element;
const unstable_batchedUpdates = wp.element.unstable_batchedUpdates || function(fn, ...args) {
    // naive fallback: just call fn synchronously (no batching)
    return fn(...args);
};
exports.default = {
    render,
    createPortal,
    unstable_batchedUpdates
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"a2exI":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "CSS", ()=>CSS);
parcelHelpers.export(exports, "add", ()=>add);
parcelHelpers.export(exports, "canUseDOM", ()=>canUseDOM);
parcelHelpers.export(exports, "findFirstFocusableNode", ()=>findFirstFocusableNode);
parcelHelpers.export(exports, "getEventCoordinates", ()=>getEventCoordinates);
parcelHelpers.export(exports, "getOwnerDocument", ()=>getOwnerDocument);
parcelHelpers.export(exports, "getWindow", ()=>getWindow);
parcelHelpers.export(exports, "hasViewportRelativeCoordinates", ()=>hasViewportRelativeCoordinates);
parcelHelpers.export(exports, "isDocument", ()=>isDocument);
parcelHelpers.export(exports, "isHTMLElement", ()=>isHTMLElement);
parcelHelpers.export(exports, "isKeyboardEvent", ()=>isKeyboardEvent);
parcelHelpers.export(exports, "isNode", ()=>isNode);
parcelHelpers.export(exports, "isSVGElement", ()=>isSVGElement);
parcelHelpers.export(exports, "isTouchEvent", ()=>isTouchEvent);
parcelHelpers.export(exports, "isWindow", ()=>isWindow);
parcelHelpers.export(exports, "subtract", ()=>subtract);
parcelHelpers.export(exports, "useCombinedRefs", ()=>useCombinedRefs);
parcelHelpers.export(exports, "useEvent", ()=>useEvent);
parcelHelpers.export(exports, "useInterval", ()=>useInterval);
parcelHelpers.export(exports, "useIsomorphicLayoutEffect", ()=>useIsomorphicLayoutEffect);
parcelHelpers.export(exports, "useLatestValue", ()=>useLatestValue);
parcelHelpers.export(exports, "useLazyMemo", ()=>useLazyMemo);
parcelHelpers.export(exports, "useNodeRef", ()=>useNodeRef);
parcelHelpers.export(exports, "usePrevious", ()=>usePrevious);
parcelHelpers.export(exports, "useUniqueId", ()=>useUniqueId);
var _react = require("react");
function useCombinedRefs() {
    for(var _len = arguments.length, refs = new Array(_len), _key = 0; _key < _len; _key++)refs[_key] = arguments[_key];
    return (0, _react.useMemo)(()=>(node)=>{
            refs.forEach((ref)=>ref(node));
        }, refs);
}
// https://github.com/facebook/react/blob/master/packages/shared/ExecutionEnvironment.js
const canUseDOM = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined';
function isWindow(element) {
    const elementString = Object.prototype.toString.call(element);
    return elementString === '[object Window]' || // In Electron context the Window object serializes to [object global]
    elementString === '[object global]';
}
function isNode(node) {
    return 'nodeType' in node;
}
function getWindow(target) {
    var _target$ownerDocument, _target$ownerDocument2;
    if (!target) return window;
    if (isWindow(target)) return target;
    if (!isNode(target)) return window;
    return (_target$ownerDocument = (_target$ownerDocument2 = target.ownerDocument) == null ? void 0 : _target$ownerDocument2.defaultView) != null ? _target$ownerDocument : window;
}
function isDocument(node) {
    const { Document } = getWindow(node);
    return node instanceof Document;
}
function isHTMLElement(node) {
    if (isWindow(node)) return false;
    return node instanceof getWindow(node).HTMLElement;
}
function isSVGElement(node) {
    return node instanceof getWindow(node).SVGElement;
}
function getOwnerDocument(target) {
    if (!target) return document;
    if (isWindow(target)) return target.document;
    if (!isNode(target)) return document;
    if (isDocument(target)) return target;
    if (isHTMLElement(target) || isSVGElement(target)) return target.ownerDocument;
    return document;
}
/**
 * A hook that resolves to useEffect on the server and useLayoutEffect on the client
 * @param callback {function} Callback function that is invoked when the dependencies of the hook change
 */ const useIsomorphicLayoutEffect = canUseDOM ? (0, _react.useLayoutEffect) : (0, _react.useEffect);
function useEvent(handler) {
    const handlerRef = (0, _react.useRef)(handler);
    useIsomorphicLayoutEffect(()=>{
        handlerRef.current = handler;
    });
    return (0, _react.useCallback)(function() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++)args[_key] = arguments[_key];
        return handlerRef.current == null ? void 0 : handlerRef.current(...args);
    }, []);
}
function useInterval() {
    const intervalRef = (0, _react.useRef)(null);
    const set = (0, _react.useCallback)((listener, duration)=>{
        intervalRef.current = setInterval(listener, duration);
    }, []);
    const clear = (0, _react.useCallback)(()=>{
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);
    return [
        set,
        clear
    ];
}
function useLatestValue(value, dependencies) {
    if (dependencies === void 0) dependencies = [
        value
    ];
    const valueRef = (0, _react.useRef)(value);
    useIsomorphicLayoutEffect(()=>{
        if (valueRef.current !== value) valueRef.current = value;
    }, dependencies);
    return valueRef;
}
function useLazyMemo(callback, dependencies) {
    const valueRef = (0, _react.useRef)();
    return (0, _react.useMemo)(()=>{
        const newValue = callback(valueRef.current);
        valueRef.current = newValue;
        return newValue;
    }, [
        ...dependencies
    ]);
}
function useNodeRef(onChange) {
    const onChangeHandler = useEvent(onChange);
    const node = (0, _react.useRef)(null);
    const setNodeRef = (0, _react.useCallback)((element)=>{
        if (element !== node.current) onChangeHandler == null || onChangeHandler(element, node.current);
        node.current = element;
    }, []);
    return [
        node,
        setNodeRef
    ];
}
function usePrevious(value) {
    const ref = (0, _react.useRef)();
    (0, _react.useEffect)(()=>{
        ref.current = value;
    }, [
        value
    ]);
    return ref.current;
}
let ids = {};
function useUniqueId(prefix, value) {
    return (0, _react.useMemo)(()=>{
        if (value) return value;
        const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
        ids[prefix] = id;
        return prefix + "-" + id;
    }, [
        prefix,
        value
    ]);
}
function createAdjustmentFn(modifier) {
    return function(object) {
        for(var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++)adjustments[_key - 1] = arguments[_key];
        return adjustments.reduce((accumulator, adjustment)=>{
            const entries = Object.entries(adjustment);
            for (const [key, valueAdjustment] of entries){
                const value = accumulator[key];
                if (value != null) accumulator[key] = value + modifier * valueAdjustment;
            }
            return accumulator;
        }, {
            ...object
        });
    };
}
const add = /*#__PURE__*/ createAdjustmentFn(1);
const subtract = /*#__PURE__*/ createAdjustmentFn(-1);
function hasViewportRelativeCoordinates(event) {
    return 'clientX' in event && 'clientY' in event;
}
function isKeyboardEvent(event) {
    if (!event) return false;
    const { KeyboardEvent } = getWindow(event.target);
    return KeyboardEvent && event instanceof KeyboardEvent;
}
function isTouchEvent(event) {
    if (!event) return false;
    const { TouchEvent } = getWindow(event.target);
    return TouchEvent && event instanceof TouchEvent;
}
/**
 * Returns the normalized x and y coordinates for mouse and touch events.
 */ function getEventCoordinates(event) {
    if (isTouchEvent(event)) {
        if (event.touches && event.touches.length) {
            const { clientX: x, clientY: y } = event.touches[0];
            return {
                x,
                y
            };
        } else if (event.changedTouches && event.changedTouches.length) {
            const { clientX: x, clientY: y } = event.changedTouches[0];
            return {
                x,
                y
            };
        }
    }
    if (hasViewportRelativeCoordinates(event)) return {
        x: event.clientX,
        y: event.clientY
    };
    return null;
}
const CSS = /*#__PURE__*/ Object.freeze({
    Translate: {
        toString (transform) {
            if (!transform) return;
            const { x, y } = transform;
            return "translate3d(" + (x ? Math.round(x) : 0) + "px, " + (y ? Math.round(y) : 0) + "px, 0)";
        }
    },
    Scale: {
        toString (transform) {
            if (!transform) return;
            const { scaleX, scaleY } = transform;
            return "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
        }
    },
    Transform: {
        toString (transform) {
            if (!transform) return;
            return [
                CSS.Translate.toString(transform),
                CSS.Scale.toString(transform)
            ].join(' ');
        }
    },
    Transition: {
        toString (_ref) {
            let { property, duration, easing } = _ref;
            return property + " " + duration + "ms " + easing;
        }
    }
});
const SELECTOR = 'a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]';
function findFirstFocusableNode(element) {
    if (element.matches(SELECTOR)) return element;
    return element.querySelector(SELECTOR);
}

},{"react":"f39IF","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"7roGJ":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "HiddenText", ()=>HiddenText);
parcelHelpers.export(exports, "LiveRegion", ()=>LiveRegion);
parcelHelpers.export(exports, "useAnnouncement", ()=>useAnnouncement);
var _react = require("react");
var _reactDefault = parcelHelpers.interopDefault(_react);
const hiddenStyles = {
    display: 'none'
};
function HiddenText(_ref) {
    let { id, value } = _ref;
    return (0, _reactDefault.default).createElement("div", {
        id: id,
        style: hiddenStyles
    }, value);
}
function LiveRegion(_ref) {
    let { id, announcement, ariaLiveType = "assertive" } = _ref;
    // Hide element visually but keep it readable by screen readers
    const visuallyHidden = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        margin: -1,
        border: 0,
        padding: 0,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(100%)',
        whiteSpace: 'nowrap'
    };
    return (0, _reactDefault.default).createElement("div", {
        id: id,
        style: visuallyHidden,
        role: "status",
        "aria-live": ariaLiveType,
        "aria-atomic": true
    }, announcement);
}
function useAnnouncement() {
    const [announcement, setAnnouncement] = (0, _react.useState)('');
    const announce = (0, _react.useCallback)((value)=>{
        if (value != null) setAnnouncement(value);
    }, []);
    return {
        announce,
        announcement
    };
}

},{"react":"f39IF","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fw7EW":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "SortableContext", ()=>SortableContext);
parcelHelpers.export(exports, "arrayMove", ()=>arrayMove);
parcelHelpers.export(exports, "arraySwap", ()=>arraySwap);
parcelHelpers.export(exports, "defaultAnimateLayoutChanges", ()=>defaultAnimateLayoutChanges);
parcelHelpers.export(exports, "defaultNewIndexGetter", ()=>defaultNewIndexGetter);
parcelHelpers.export(exports, "hasSortableData", ()=>hasSortableData);
parcelHelpers.export(exports, "horizontalListSortingStrategy", ()=>horizontalListSortingStrategy);
parcelHelpers.export(exports, "rectSortingStrategy", ()=>rectSortingStrategy);
parcelHelpers.export(exports, "rectSwappingStrategy", ()=>rectSwappingStrategy);
parcelHelpers.export(exports, "sortableKeyboardCoordinates", ()=>sortableKeyboardCoordinates);
parcelHelpers.export(exports, "useSortable", ()=>useSortable);
parcelHelpers.export(exports, "verticalListSortingStrategy", ()=>verticalListSortingStrategy);
var _react = require("react");
var _reactDefault = parcelHelpers.interopDefault(_react);
var _core = require("@dnd-kit/core");
var _utilities = require("@dnd-kit/utilities");
/**
 * Move an array item to a different position. Returns a new array with the item moved to the new position.
 */ function arrayMove(array, from, to) {
    const newArray = array.slice();
    newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
    return newArray;
}
/**
 * Swap an array item to a different position. Returns a new array with the item swapped to the new position.
 */ function arraySwap(array, from, to) {
    const newArray = array.slice();
    newArray[from] = array[to];
    newArray[to] = array[from];
    return newArray;
}
function getSortedRects(items, rects) {
    return items.reduce((accumulator, id, index)=>{
        const rect = rects.get(id);
        if (rect) accumulator[index] = rect;
        return accumulator;
    }, Array(items.length));
}
function isValidIndex(index) {
    return index !== null && index >= 0;
}
function itemsEqual(a, b) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for(let i = 0; i < a.length; i++){
        if (a[i] !== b[i]) return false;
    }
    return true;
}
function normalizeDisabled(disabled) {
    if (typeof disabled === 'boolean') return {
        draggable: disabled,
        droppable: disabled
    };
    return disabled;
}
// To-do: We should be calculating scale transformation
const defaultScale = {
    scaleX: 1,
    scaleY: 1
};
const horizontalListSortingStrategy = (_ref)=>{
    var _rects$activeIndex;
    let { rects, activeNodeRect: fallbackActiveRect, activeIndex, overIndex, index } = _ref;
    const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;
    if (!activeNodeRect) return null;
    const itemGap = getItemGap(rects, index, activeIndex);
    if (index === activeIndex) {
        const newIndexRect = rects[overIndex];
        if (!newIndexRect) return null;
        return {
            x: activeIndex < overIndex ? newIndexRect.left + newIndexRect.width - (activeNodeRect.left + activeNodeRect.width) : newIndexRect.left - activeNodeRect.left,
            y: 0,
            ...defaultScale
        };
    }
    if (index > activeIndex && index <= overIndex) return {
        x: -activeNodeRect.width - itemGap,
        y: 0,
        ...defaultScale
    };
    if (index < activeIndex && index >= overIndex) return {
        x: activeNodeRect.width + itemGap,
        y: 0,
        ...defaultScale
    };
    return {
        x: 0,
        y: 0,
        ...defaultScale
    };
};
function getItemGap(rects, index, activeIndex) {
    const currentRect = rects[index];
    const previousRect = rects[index - 1];
    const nextRect = rects[index + 1];
    if (!currentRect || !previousRect && !nextRect) return 0;
    if (activeIndex < index) return previousRect ? currentRect.left - (previousRect.left + previousRect.width) : nextRect.left - (currentRect.left + currentRect.width);
    return nextRect ? nextRect.left - (currentRect.left + currentRect.width) : currentRect.left - (previousRect.left + previousRect.width);
}
const rectSortingStrategy = (_ref)=>{
    let { rects, activeIndex, overIndex, index } = _ref;
    const newRects = arrayMove(rects, overIndex, activeIndex);
    const oldRect = rects[index];
    const newRect = newRects[index];
    if (!newRect || !oldRect) return null;
    return {
        x: newRect.left - oldRect.left,
        y: newRect.top - oldRect.top,
        scaleX: newRect.width / oldRect.width,
        scaleY: newRect.height / oldRect.height
    };
};
const rectSwappingStrategy = (_ref)=>{
    let { activeIndex, index, rects, overIndex } = _ref;
    let oldRect;
    let newRect;
    if (index === activeIndex) {
        oldRect = rects[index];
        newRect = rects[overIndex];
    }
    if (index === overIndex) {
        oldRect = rects[index];
        newRect = rects[activeIndex];
    }
    if (!newRect || !oldRect) return null;
    return {
        x: newRect.left - oldRect.left,
        y: newRect.top - oldRect.top,
        scaleX: newRect.width / oldRect.width,
        scaleY: newRect.height / oldRect.height
    };
};
// To-do: We should be calculating scale transformation
const defaultScale$1 = {
    scaleX: 1,
    scaleY: 1
};
const verticalListSortingStrategy = (_ref)=>{
    var _rects$activeIndex;
    let { activeIndex, activeNodeRect: fallbackActiveRect, index, rects, overIndex } = _ref;
    const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;
    if (!activeNodeRect) return null;
    if (index === activeIndex) {
        const overIndexRect = rects[overIndex];
        if (!overIndexRect) return null;
        return {
            x: 0,
            y: activeIndex < overIndex ? overIndexRect.top + overIndexRect.height - (activeNodeRect.top + activeNodeRect.height) : overIndexRect.top - activeNodeRect.top,
            ...defaultScale$1
        };
    }
    const itemGap = getItemGap$1(rects, index, activeIndex);
    if (index > activeIndex && index <= overIndex) return {
        x: 0,
        y: -activeNodeRect.height - itemGap,
        ...defaultScale$1
    };
    if (index < activeIndex && index >= overIndex) return {
        x: 0,
        y: activeNodeRect.height + itemGap,
        ...defaultScale$1
    };
    return {
        x: 0,
        y: 0,
        ...defaultScale$1
    };
};
function getItemGap$1(clientRects, index, activeIndex) {
    const currentRect = clientRects[index];
    const previousRect = clientRects[index - 1];
    const nextRect = clientRects[index + 1];
    if (!currentRect) return 0;
    if (activeIndex < index) return previousRect ? currentRect.top - (previousRect.top + previousRect.height) : nextRect ? nextRect.top - (currentRect.top + currentRect.height) : 0;
    return nextRect ? nextRect.top - (currentRect.top + currentRect.height) : previousRect ? currentRect.top - (previousRect.top + previousRect.height) : 0;
}
const ID_PREFIX = 'Sortable';
const Context = /*#__PURE__*/ (0, _reactDefault.default).createContext({
    activeIndex: -1,
    containerId: ID_PREFIX,
    disableTransforms: false,
    items: [],
    overIndex: -1,
    useDragOverlay: false,
    sortedRects: [],
    strategy: rectSortingStrategy,
    disabled: {
        draggable: false,
        droppable: false
    }
});
function SortableContext(_ref) {
    let { children, id, items: userDefinedItems, strategy = rectSortingStrategy, disabled: disabledProp = false } = _ref;
    const { active, dragOverlay, droppableRects, over, measureDroppableContainers } = (0, _core.useDndContext)();
    const containerId = (0, _utilities.useUniqueId)(ID_PREFIX, id);
    const useDragOverlay = Boolean(dragOverlay.rect !== null);
    const items = (0, _react.useMemo)(()=>userDefinedItems.map((item)=>typeof item === 'object' && 'id' in item ? item.id : item), [
        userDefinedItems
    ]);
    const isDragging = active != null;
    const activeIndex = active ? items.indexOf(active.id) : -1;
    const overIndex = over ? items.indexOf(over.id) : -1;
    const previousItemsRef = (0, _react.useRef)(items);
    const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
    const disableTransforms = overIndex !== -1 && activeIndex === -1 || itemsHaveChanged;
    const disabled = normalizeDisabled(disabledProp);
    (0, _utilities.useIsomorphicLayoutEffect)(()=>{
        if (itemsHaveChanged && isDragging) measureDroppableContainers(items);
    }, [
        itemsHaveChanged,
        items,
        isDragging,
        measureDroppableContainers
    ]);
    (0, _react.useEffect)(()=>{
        previousItemsRef.current = items;
    }, [
        items
    ]);
    const contextValue = (0, _react.useMemo)(()=>({
            activeIndex,
            containerId,
            disabled,
            disableTransforms,
            items,
            overIndex,
            useDragOverlay,
            sortedRects: getSortedRects(items, droppableRects),
            strategy
        }), [
        activeIndex,
        containerId,
        disabled.draggable,
        disabled.droppable,
        disableTransforms,
        items,
        overIndex,
        droppableRects,
        useDragOverlay,
        strategy
    ]);
    return (0, _reactDefault.default).createElement(Context.Provider, {
        value: contextValue
    }, children);
}
const defaultNewIndexGetter = (_ref)=>{
    let { id, items, activeIndex, overIndex } = _ref;
    return arrayMove(items, activeIndex, overIndex).indexOf(id);
};
const defaultAnimateLayoutChanges = (_ref2)=>{
    let { containerId, isSorting, wasDragging, index, items, newIndex, previousItems, previousContainerId, transition } = _ref2;
    if (!transition || !wasDragging) return false;
    if (previousItems !== items && index === newIndex) return false;
    if (isSorting) return true;
    return newIndex !== index && containerId === previousContainerId;
};
const defaultTransition = {
    duration: 200,
    easing: 'ease'
};
const transitionProperty = 'transform';
const disabledTransition = /*#__PURE__*/ (0, _utilities.CSS).Transition.toString({
    property: transitionProperty,
    duration: 0,
    easing: 'linear'
});
const defaultAttributes = {
    roleDescription: 'sortable'
};
/*
 * When the index of an item changes while sorting,
 * we need to temporarily disable the transforms
 */ function useDerivedTransform(_ref) {
    let { disabled, index, node, rect } = _ref;
    const [derivedTransform, setDerivedtransform] = (0, _react.useState)(null);
    const previousIndex = (0, _react.useRef)(index);
    (0, _utilities.useIsomorphicLayoutEffect)(()=>{
        if (!disabled && index !== previousIndex.current && node.current) {
            const initial = rect.current;
            if (initial) {
                const current = (0, _core.getClientRect)(node.current, {
                    ignoreTransform: true
                });
                const delta = {
                    x: initial.left - current.left,
                    y: initial.top - current.top,
                    scaleX: initial.width / current.width,
                    scaleY: initial.height / current.height
                };
                if (delta.x || delta.y) setDerivedtransform(delta);
            }
        }
        if (index !== previousIndex.current) previousIndex.current = index;
    }, [
        disabled,
        index,
        node,
        rect
    ]);
    (0, _react.useEffect)(()=>{
        if (derivedTransform) setDerivedtransform(null);
    }, [
        derivedTransform
    ]);
    return derivedTransform;
}
function useSortable(_ref) {
    let { animateLayoutChanges = defaultAnimateLayoutChanges, attributes: userDefinedAttributes, disabled: localDisabled, data: customData, getNewIndex = defaultNewIndexGetter, id, strategy: localStrategy, resizeObserverConfig, transition = defaultTransition } = _ref;
    const { items, containerId, activeIndex, disabled: globalDisabled, disableTransforms, sortedRects, overIndex, useDragOverlay, strategy: globalStrategy } = (0, _react.useContext)(Context);
    const disabled = normalizeLocalDisabled(localDisabled, globalDisabled);
    const index = items.indexOf(id);
    const data = (0, _react.useMemo)(()=>({
            sortable: {
                containerId,
                index,
                items
            },
            ...customData
        }), [
        containerId,
        customData,
        index,
        items
    ]);
    const itemsAfterCurrentSortable = (0, _react.useMemo)(()=>items.slice(items.indexOf(id)), [
        items,
        id
    ]);
    const { rect, node, isOver, setNodeRef: setDroppableNodeRef } = (0, _core.useDroppable)({
        id,
        data,
        disabled: disabled.droppable,
        resizeObserverConfig: {
            updateMeasurementsFor: itemsAfterCurrentSortable,
            ...resizeObserverConfig
        }
    });
    const { active, activatorEvent, activeNodeRect, attributes, setNodeRef: setDraggableNodeRef, listeners, isDragging, over, setActivatorNodeRef, transform } = (0, _core.useDraggable)({
        id,
        data,
        attributes: {
            ...defaultAttributes,
            ...userDefinedAttributes
        },
        disabled: disabled.draggable
    });
    const setNodeRef = (0, _utilities.useCombinedRefs)(setDroppableNodeRef, setDraggableNodeRef);
    const isSorting = Boolean(active);
    const displaceItem = isSorting && !disableTransforms && isValidIndex(activeIndex) && isValidIndex(overIndex);
    const shouldDisplaceDragSource = !useDragOverlay && isDragging;
    const dragSourceDisplacement = shouldDisplaceDragSource && displaceItem ? transform : null;
    const strategy = localStrategy != null ? localStrategy : globalStrategy;
    const finalTransform = displaceItem ? dragSourceDisplacement != null ? dragSourceDisplacement : strategy({
        rects: sortedRects,
        activeNodeRect,
        activeIndex,
        overIndex,
        index
    }) : null;
    const newIndex = isValidIndex(activeIndex) && isValidIndex(overIndex) ? getNewIndex({
        id,
        items,
        activeIndex,
        overIndex
    }) : index;
    const activeId = active == null ? void 0 : active.id;
    const previous = (0, _react.useRef)({
        activeId,
        items,
        newIndex,
        containerId
    });
    const itemsHaveChanged = items !== previous.current.items;
    const shouldAnimateLayoutChanges = animateLayoutChanges({
        active,
        containerId,
        isDragging,
        isSorting,
        id,
        index,
        items,
        newIndex: previous.current.newIndex,
        previousItems: previous.current.items,
        previousContainerId: previous.current.containerId,
        transition,
        wasDragging: previous.current.activeId != null
    });
    const derivedTransform = useDerivedTransform({
        disabled: !shouldAnimateLayoutChanges,
        index,
        node,
        rect
    });
    (0, _react.useEffect)(()=>{
        if (isSorting && previous.current.newIndex !== newIndex) previous.current.newIndex = newIndex;
        if (containerId !== previous.current.containerId) previous.current.containerId = containerId;
        if (items !== previous.current.items) previous.current.items = items;
    }, [
        isSorting,
        newIndex,
        containerId,
        items
    ]);
    (0, _react.useEffect)(()=>{
        if (activeId === previous.current.activeId) return;
        if (activeId != null && previous.current.activeId == null) {
            previous.current.activeId = activeId;
            return;
        }
        const timeoutId = setTimeout(()=>{
            previous.current.activeId = activeId;
        }, 50);
        return ()=>clearTimeout(timeoutId);
    }, [
        activeId
    ]);
    return {
        active,
        activeIndex,
        attributes,
        data,
        rect,
        index,
        newIndex,
        items,
        isOver,
        isSorting,
        isDragging,
        listeners,
        node,
        overIndex,
        over,
        setNodeRef,
        setActivatorNodeRef,
        setDroppableNodeRef,
        setDraggableNodeRef,
        transform: derivedTransform != null ? derivedTransform : finalTransform,
        transition: getTransition()
    };
    function getTransition() {
        if (derivedTransform || // Or to prevent items jumping to back to their "new" position when items change
        itemsHaveChanged && previous.current.newIndex === index) return disabledTransition;
        if (shouldDisplaceDragSource && !(0, _utilities.isKeyboardEvent)(activatorEvent) || !transition) return undefined;
        if (isSorting || shouldAnimateLayoutChanges) return (0, _utilities.CSS).Transition.toString({
            ...transition,
            property: transitionProperty
        });
        return undefined;
    }
}
function normalizeLocalDisabled(localDisabled, globalDisabled) {
    var _localDisabled$dragga, _localDisabled$droppa;
    if (typeof localDisabled === 'boolean') return {
        draggable: localDisabled,
        // Backwards compatibility
        droppable: false
    };
    return {
        draggable: (_localDisabled$dragga = localDisabled == null ? void 0 : localDisabled.draggable) != null ? _localDisabled$dragga : globalDisabled.draggable,
        droppable: (_localDisabled$droppa = localDisabled == null ? void 0 : localDisabled.droppable) != null ? _localDisabled$droppa : globalDisabled.droppable
    };
}
function hasSortableData(entry) {
    if (!entry) return false;
    const data = entry.data.current;
    if (data && 'sortable' in data && typeof data.sortable === 'object' && 'containerId' in data.sortable && 'items' in data.sortable && 'index' in data.sortable) return true;
    return false;
}
const directions = [
    (0, _core.KeyboardCode).Down,
    (0, _core.KeyboardCode).Right,
    (0, _core.KeyboardCode).Up,
    (0, _core.KeyboardCode).Left
];
const sortableKeyboardCoordinates = (event, _ref)=>{
    let { context: { active, collisionRect, droppableRects, droppableContainers, over, scrollableAncestors } } = _ref;
    if (directions.includes(event.code)) {
        event.preventDefault();
        if (!active || !collisionRect) return;
        const filteredContainers = [];
        droppableContainers.getEnabled().forEach((entry)=>{
            if (!entry || entry != null && entry.disabled) return;
            const rect = droppableRects.get(entry.id);
            if (!rect) return;
            switch(event.code){
                case (0, _core.KeyboardCode).Down:
                    if (collisionRect.top < rect.top) filteredContainers.push(entry);
                    break;
                case (0, _core.KeyboardCode).Up:
                    if (collisionRect.top > rect.top) filteredContainers.push(entry);
                    break;
                case (0, _core.KeyboardCode).Left:
                    if (collisionRect.left > rect.left) filteredContainers.push(entry);
                    break;
                case (0, _core.KeyboardCode).Right:
                    if (collisionRect.left < rect.left) filteredContainers.push(entry);
                    break;
            }
        });
        const collisions = (0, _core.closestCorners)({
            active,
            collisionRect: collisionRect,
            droppableRects,
            droppableContainers: filteredContainers,
            pointerCoordinates: null
        });
        let closestId = (0, _core.getFirstCollision)(collisions, 'id');
        if (closestId === (over == null ? void 0 : over.id) && collisions.length > 1) closestId = collisions[1].id;
        if (closestId != null) {
            const activeDroppable = droppableContainers.get(active.id);
            const newDroppable = droppableContainers.get(closestId);
            const newRect = newDroppable ? droppableRects.get(newDroppable.id) : null;
            const newNode = newDroppable == null ? void 0 : newDroppable.node.current;
            if (newNode && newRect && activeDroppable && newDroppable) {
                const newScrollAncestors = (0, _core.getScrollableAncestors)(newNode);
                const hasDifferentScrollAncestors = newScrollAncestors.some((element, index)=>scrollableAncestors[index] !== element);
                const hasSameContainer = isSameContainer(activeDroppable, newDroppable);
                const isAfterActive = isAfter(activeDroppable, newDroppable);
                const offset = hasDifferentScrollAncestors || !hasSameContainer ? {
                    x: 0,
                    y: 0
                } : {
                    x: isAfterActive ? collisionRect.width - newRect.width : 0,
                    y: isAfterActive ? collisionRect.height - newRect.height : 0
                };
                const rectCoordinates = {
                    x: newRect.left,
                    y: newRect.top
                };
                const newCoordinates = offset.x && offset.y ? rectCoordinates : (0, _utilities.subtract)(rectCoordinates, offset);
                return newCoordinates;
            }
        }
    }
    return undefined;
};
function isSameContainer(a, b) {
    if (!hasSortableData(a) || !hasSortableData(b)) return false;
    return a.data.current.sortable.containerId === b.data.current.sortable.containerId;
}
function isAfter(a, b) {
    if (!hasSortableData(a) || !hasSortableData(b)) return false;
    if (!isSameContainer(a, b)) return false;
    return a.data.current.sortable.index < b.data.current.sortable.index;
}

},{"react":"f39IF","@dnd-kit/core":"do19q","@dnd-kit/utilities":"a2exI","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"6qIFK":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const { useState, useRef, useEffect } = wp.element;
// Main AlpacaUser component which will be rendered by WordPress
// It now accepts a 'userId' prop
const AlpacaUser = ({ userId })=>{
    // State to hold the user data being displayed
    const [displayedUser, setDisplayedUser] = useState(null);
    // State for loading status
    const [loading, setLoading] = useState(true);
    // State for error messages
    const [error, setError] = useState(null);
    /**
   * Fetches user data from the WordPress REST API.
   * @param {string | number | null} idToFetch - The ID of the user to fetch. If null, fetches data for the current user ('me' endpoint).
   */ const fetchUserData = async (idToFetch = null)=>{
        // Ensure wpApiSettings is available, which is exposed by WordPress in the admin area
        if (typeof window.wpApiSettings === "undefined" || !window.wpApiSettings.root) {
            setError("WordPress API settings not found. Ensure this component is loaded within a WordPress admin context.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            // Determine the API endpoint based on whether an ID is provided
            const endpoint = idToFetch ? `wp/v2/users/${idToFetch}` : `wp/v2/users/me`;
            const apiUrl = `${window.wpApiSettings.root}${endpoint}`;
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // Include the WordPress nonce for authentication and CSRF protection.
                    // wpApiSettings.nonce is usually localized by WordPress for backend scripts.
                    "X-WP-Nonce": window.wpApiSettings.nonce || ""
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const userData = await response.json();
            setDisplayedUser(userData); // Update the displayed user
        } catch (err) {
            console.error("Failed to fetch user data:", err);
            setDisplayedUser(null); // Clear displayed user on error
            setError(`Error loading user data: ${err.message}`);
        } finally{
            setLoading(false);
        }
    };
    // Effect hook to fetch data when the component mounts or when the 'userId' prop changes
    useEffect(()=>{
        // If a userId prop is provided, fetch that specific user, otherwise fetch the current user
        if (userId) fetchUserData(userId);
        else fetchUserData(); // Calls without an ID to get the current user
    }, [
        userId
    ]); // Re-run effect if the userId prop changes
    // Get the highest resolution avatar URL available from the displayedUser object
    const avatarUrl = displayedUser?.avatar_urls ? displayedUser.avatar_urls["96"] || displayedUser.avatar_urls["48"] || displayedUser.avatar_urls["24"] : "https://placehold.co/96x96/cccccc/333333?text=Avatar"; // Placeholder if no avatar URL is found
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user-container",
        __source: {
            fileName: "src/user.jsx",
            lineNumber: 86,
            columnNumber: 5
        },
        __self: undefined
    }, loading && "Loading user data...", error && !loading && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-error-message",
        role: "alert",
        __source: {
            fileName: "src/user.jsx",
            lineNumber: 91,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("strong", {
        __source: {
            fileName: "src/user.jsx",
            lineNumber: 92,
            columnNumber: 11
        },
        __self: undefined
    }, "Error!"), /*#__PURE__*/ React.createElement("span", {
        className: "alpaca-error-text",
        __source: {
            fileName: "src/user.jsx",
            lineNumber: 93,
            columnNumber: 11
        },
        __self: undefined
    }, error)), !displayedUser && !loading && !error && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-error-message",
        role: "alert",
        __source: {
            fileName: "src/user.jsx",
            lineNumber: 98,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("strong", {
        __source: {
            fileName: "src/user.jsx",
            lineNumber: 99,
            columnNumber: 11
        },
        __self: undefined
    }, "Error!"), /*#__PURE__*/ React.createElement("span", {
        className: "alpaca-error-text",
        __source: {
            fileName: "src/user.jsx",
            lineNumber: 100,
            columnNumber: 11
        },
        __self: undefined
    }, "No user data available")), displayedUser && !loading && /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("div", {
        __source: {
            fileName: "src/user.jsx",
            lineNumber: 106,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("img", {
        src: avatarUrl,
        alt: `Avatar of ${displayedUser.name}`,
        __source: {
            fileName: "src/user.jsx",
            lineNumber: 107,
            columnNumber: 13
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("div", {
        __source: {
            fileName: "src/user.jsx",
            lineNumber: 109,
            columnNumber: 11
        },
        __self: undefined
    }, displayedUser.name, " (", displayedUser.id, ")")));
};
// Export the AlpacaUser component as default for React to render
exports.default = AlpacaUser;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"alebk":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _user = require("./user");
var _userDefault = parcelHelpers.interopDefault(_user);
const { useState, useEffect } = wp.element;
const { Modal, TextareaControl, Button } = wp.components;
const AlpacaIssue = ({ issueId, isOpen, onClose, triggerRef })=>{
    const [issueDetails, setIssueDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    // When the modal closes, return focus to the element that opened it.
    useEffect(()=>{
        if (!isOpen && triggerRef && triggerRef.current) triggerRef.current.focus();
    }, [
        isOpen,
        triggerRef
    ]);
    useEffect(()=>{
        if (issueId && isOpen) {
            setIsLoadingDetails(true);
            setIssueDetails(null); // Clear previous details
            wp.apiFetch({
                path: `/issue/v1/get/${issueId}`
            }).then((data)=>{
                setIssueDetails(data);
                setIsLoadingDetails(false);
            }).catch((err)=>{
                console.error("Error fetching issue details:", err);
                setIssueDetails({
                    error: "Failed to load details."
                });
                setIsLoadingDetails(false);
            });
        }
    }, [
        issueId,
        isOpen
    ]);
    if (!isOpen) return null;
    return /*#__PURE__*/ React.createElement(Modal, {
        title: /*#__PURE__*/ React.createElement(React.Fragment, null, "Issue Details", /*#__PURE__*/ React.createElement("span", {
            className: "alpaca-issue-id",
            __source: {
                fileName: "src/issue.jsx",
                lineNumber: 45,
                columnNumber: 11
            }
        }, " #", issueId)),
        size: "large",
        onRequestClose: onClose,
        className: "alpaca-details-modal",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 41,
            columnNumber: 5
        },
        __self: undefined
    }, isLoadingDetails ? /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 53,
            columnNumber: 9
        },
        __self: undefined
    }, "Loading...") : issueDetails && issueDetails.success ? /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-details",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 55,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("table", {
        className: "wp-list-table widefat striped",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 56,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tbody", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 57,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 58,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 59,
            columnNumber: 17
        },
        __self: undefined
    }, "Screenshot"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 60,
            columnNumber: 17
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 61,
            columnNumber: 19
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("img", {
        src: issueDetails.meta.screenshot,
        alt: "Screenshot",
        style: {
            height: "240px"
        },
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 62,
            columnNumber: 21
        },
        __self: undefined
    })))), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 70,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 71,
            columnNumber: 17
        },
        __self: undefined
    }, "Submitted"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 72,
            columnNumber: 17
        },
        __self: undefined
    }, new Date(issueDetails.post_data.post_date).toLocaleString(), " ", "by ", issueDetails.post_data.post_author_display_name, " (", issueDetails.post_data.post_author, ")")), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 78,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 79,
            columnNumber: 17
        },
        __self: undefined
    }, "Last modified"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 80,
            columnNumber: 17
        },
        __self: undefined
    }, new Date(issueDetails.post_data.post_modified).toLocaleString(), " ")), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 86,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 87,
            columnNumber: 17
        },
        __self: undefined
    }, "Description"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 88,
            columnNumber: 17
        },
        __self: undefined
    }, issueDetails.post_data.post_content)), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 90,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 91,
            columnNumber: 17
        },
        __self: undefined
    }, "URL"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 92,
            columnNumber: 17
        },
        __self: undefined
    }, issueDetails.meta.URL ? /*#__PURE__*/ React.createElement("a", {
        href: issueDetails.meta.URL,
        target: "_blank",
        rel: "noopener noreferrer",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 94,
            columnNumber: 21
        },
        __self: undefined
    }, issueDetails.meta.URL) : "N/A")), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 106,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 107,
            columnNumber: 17
        },
        __self: undefined
    }, "Screen Size"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 108,
            columnNumber: 17
        },
        __self: undefined
    }, issueDetails.meta.screenwidth && issueDetails.meta.screenheight ? `${issueDetails.meta.screenwidth} x ${issueDetails.meta.screenheight}` : "N/A")), Object.entries(issueDetails.taxonomies).map(([taxonomy, terms])=>/*#__PURE__*/ React.createElement("tr", {
            key: taxonomy,
            __source: {
                fileName: "src/issue.jsx",
                lineNumber: 117,
                columnNumber: 19
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("th", {
            scope: "row",
            style: {
                textTransform: "capitalize"
            },
            __source: {
                fileName: "src/issue.jsx",
                lineNumber: 118,
                columnNumber: 21
            },
            __self: undefined
        }, taxonomy), /*#__PURE__*/ React.createElement("td", {
            __source: {
                fileName: "src/issue.jsx",
                lineNumber: 121,
                columnNumber: 21
            },
            __self: undefined
        }, terms.map((term)=>term.name).join(", ")))))), /*#__PURE__*/ React.createElement("h3", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 128,
            columnNumber: 11
        },
        __self: undefined
    }, "Comments"), /*#__PURE__*/ React.createElement("div", {
        id: "alpaca-comments",
        className: "alpaca-grid",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 130,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-row",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 131,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-meta",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 132,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _userDefault.default), {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 133,
            columnNumber: 17
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 135,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(TextareaControl, {
        placeholder: "Not implemented yet",
        id: "alpaca-comment-textarea",
        value: "",
        onChange: ()=>{},
        disabled: true,
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 136,
            columnNumber: 17
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 143,
            columnNumber: 17
        },
        __self: undefined
    }, "Submit Comment"))), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-row",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 147,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-meta",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 148,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-author",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 149,
            columnNumber: 17
        },
        __self: undefined
    }, "Author")), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment",
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 151,
            columnNumber: 15
        },
        __self: undefined
    }, "Comment")))) : /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/issue.jsx",
            lineNumber: 156,
            columnNumber: 9
        },
        __self: undefined
    }, issueDetails?.message || "Could not load issue details."));
};
exports.default = AlpacaIssue;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./user":"6qIFK"}],"AUa4b":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const AlpacaCommenting = ()=>{
    /*#__PURE__*/ React.createElement("div", {
        id: "alpaca-comments",
        className: "alpaca-grid",
        __source: {
            fileName: "src/commenting.jsx",
            lineNumber: 2,
            columnNumber: 3
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-row",
        __source: {
            fileName: "src/commenting.jsx",
            lineNumber: 3,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-meta",
        __source: {
            fileName: "src/commenting.jsx",
            lineNumber: 4,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(AlpacaUser, {
        __source: {
            fileName: "src/commenting.jsx",
            lineNumber: 5,
            columnNumber: 9
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment",
        __source: {
            fileName: "src/commenting.jsx",
            lineNumber: 7,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(TextareaControl, {
        placeholder: "Not implemented yet",
        id: "alpaca-comment-textarea",
        value: "",
        onChange: ()=>{},
        disabled: true,
        __source: {
            fileName: "src/commenting.jsx",
            lineNumber: 8,
            columnNumber: 9
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        __source: {
            fileName: "src/commenting.jsx",
            lineNumber: 15,
            columnNumber: 9
        },
        __self: undefined
    }, "Submit Comment"))), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-row",
        __source: {
            fileName: "src/commenting.jsx",
            lineNumber: 19,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-meta",
        __source: {
            fileName: "src/commenting.jsx",
            lineNumber: 20,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-author",
        __source: {
            fileName: "src/commenting.jsx",
            lineNumber: 21,
            columnNumber: 9
        },
        __self: undefined
    }, "Author")), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment",
        __source: {
            fileName: "src/commenting.jsx",
            lineNumber: 23,
            columnNumber: 7
        },
        __self: undefined
    }, "Comment")));
};
exports.default = AlpacaCommenting;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}]},["9iTdJ","d8Dch"], "d8Dch", "parcelRequire55a0", {})

//# sourceMappingURL=index.js.map
