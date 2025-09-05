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
var _watchlistContextJsx = require("./context/WatchlistContext.jsx");
var _boardJsx = require("./board.jsx");
const { render } = wp.element;
if (document.querySelector("#wp-admin-bar-alpaca-menu")) render(/*#__PURE__*/ React.createElement((0, _modalJsxDefault.default), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 13,
        columnNumber: 5
    },
    __self: undefined
}), document.querySelector("#wp-admin-bar-alpaca-report"));
if (document.querySelector("#alpaca-settings")) render(/*#__PURE__*/ React.createElement((0, _settingsJsxDefault.default), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 19,
        columnNumber: 10
    },
    __self: undefined
}), document.querySelector("#alpaca-settings"));
if (document.querySelector("#alpaca-board")) render(/*#__PURE__*/ React.createElement((0, _watchlistContextJsx.WatchlistProvider), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 24,
        columnNumber: 5
    },
    __self: undefined
}, /*#__PURE__*/ React.createElement((0, _boardJsx.AlpacaBoard), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 25,
        columnNumber: 7
    },
    __self: undefined
})), document.querySelector("#alpaca-board"));
if (document.querySelector("#alpaca-board-controls")) render(/*#__PURE__*/ React.createElement((0, _boardJsx.AlpacaBoardControls), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 33,
        columnNumber: 5
    },
    __self: undefined
}), document.querySelector("#alpaca-board-controls"));

},{"./alpaca.scss":"1ItKB","./apitest.js":"jb82X","./modal.jsx":"lBZco","./settings.jsx":"aIYcP","./context/WatchlistContext.jsx":"WrED9","./board.jsx":"h1t0l","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1ItKB":[function() {},{}],"jb82X":[function(require,module,exports,__globalThis) {
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
var _testLoggerJs = require("./utils/test-logger.js");
const { Button, Modal, TextareaControl, Spinner, CheckboxControl } = wp.components;
const { doAction } = wp.hooks;
const { useState, useRef, useEffect, useCallback } = wp.element;
const AlpacaModal = ()=>{
    const [isOpen, setOpen] = useState(false);
    const [status, setStatus] = useState("idle"); // idle, submitting, success, error
    const [message, setMessage] = useState("");
    const [feedback, setFeedback] = useState("");
    const [includeContext, setIncludeContext] = useState(true); // <-- new state
    const textareaRef = useRef(null);
    const closeBtnRef = useRef(null);
    const [enableTestLogs, setEnableTestLogs] = useState(false);
    useEffect(()=>{
        wp.apiFetch({
            path: "/wp/v2/settings"
        }).then((settings)=>{
            setEnableTestLogs(settings.alpaca_enable_test_logs === "1");
        });
        const handleTestLogSettingChange = (value)=>{
            setEnableTestLogs(value);
        };
        wp.hooks.addAction("alpaca.enableTestLogsChanged", "alpaca/modal", handleTestLogSettingChange);
        return ()=>{
            wp.hooks.removeAction("alpaca.enableTestLogsChanged", "alpaca/modal");
        };
    }, []);
    (0, _testLoggerJs.useTestLogger)(enableTestLogs);
    const openModal = useCallback(()=>{
        setMessage("");
        setStatus("idle");
        setFeedback("");
        setIncludeContext(true); // reset to default each time modal opens
        setOpen(true);
    }, []);
    const closeModal = ()=>{
        setOpen(false);
        setStatus("idle");
    };
    // Listen for a global event to open the modal
    useEffect(()=>{
        const handleOpen = ()=>openModal();
        wp.hooks.addAction("alpaca.openModal", "alpaca/modal", handleOpen);
        return ()=>wp.hooks.removeAction("alpaca.openModal", "alpaca/modal");
    }, [
        openModal
    ]);
    // Focus textarea when modal opens
    useEffect(()=>{
        if (isOpen && status === "idle" && textareaRef.current) setTimeout(()=>textareaRef.current.focus(), 10);
    }, [
        isOpen,
        status
    ]);
    // Focus close button on success or error
    useEffect(()=>{
        if ((status === "success" || status === "error") && closeBtnRef.current) setTimeout(()=>closeBtnRef.current.focus(), 10);
    }, [
        status
    ]);
    const submitIssue = async ()=>{
        setMessage("");
        try {
            const server = JSON.parse(atob(alpaca_data.env));
            setStatus("submitting");
            const screenshot = await (0, _snapdomHandlerJsDefault.default)();
            const submitted = {
                userinput: {
                    feedback,
                    includeContext
                },
                client: alpaca_data.device,
                screenshot
            };
            const payload = {
                ...submitted,
                ...server
            };
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
            const responseData = await response.json();
            if (!response.ok || !responseData.success) throw new Error(responseData.message || `HTTP ${response.status}`);
            setStatus("success");
            setMessage("Your issue has been submitted successfully.");
            doAction("alpaca.issueSubmitted", responseData.issue, responseData.statusId);
            setTimeout(closeModal, 1500);
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
            lineNumber: 133,
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
            lineNumber: 145,
            columnNumber: 9
        },
        __self: undefined
    }, status === "success" || status === "error" ? /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 160,
            columnNumber: 15
        },
        __self: undefined
    }, message), /*#__PURE__*/ React.createElement(Button, {
        variant: "primary",
        onClick: closeModal,
        ref: closeBtnRef,
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 161,
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
            lineNumber: 167,
            columnNumber: 15
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("div", {
        className: "small-wrapper",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 176,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(CheckboxControl, {
        id: "alpaca-include-context",
        checked: includeContext,
        onChange: (val)=>setIncludeContext(val),
        label: "Include full context with report?",
        help: "Always do this, unless you are sure it is not relevant",
        disabled: status === "submitting",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 177,
            columnNumber: 17
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-actions",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 187,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        variant: "primary",
        onClick: submitIssue,
        disabled: status === "submitting",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 188,
            columnNumber: 17
        },
        __self: undefined
    }, status === "submitting" ? /*#__PURE__*/ React.createElement(Spinner, {
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 193,
            columnNumber: 46
        },
        __self: undefined
    }) : "Submit"), /*#__PURE__*/ React.createElement(Button, {
        variant: "secondary",
        onClick: closeModal,
        disabled: status === "submitting",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 195,
            columnNumber: 17
        },
        __self: undefined
    }, "Cancel")))));
};
exports.default = AlpacaModal;

},{"./snapdom-handler.js":"4FHYR","./utils/test-logger.js":"e3DQN","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4FHYR":[function(require,module,exports,__globalThis) {
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

},{}],"e3DQN":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "useTestLogger", ()=>useTestLogger);
const { useEffect } = wp.element;
const useTestLogger = (enable)=>{
    useEffect(()=>{
        if (!enable) return;
        const logStatusChange = (movedItem, sourceContainerTitle, destinationContainerTitle)=>{
            console.log(`Item "${movedItem.content}" moved from "${sourceContainerTitle}" to "${destinationContainerTitle}"`);
        };
        const logAssigneesChange = (issueId, assignees)=>{
            console.log(`Assignees changed for issue ${issueId}:`, assignees);
        };
        const logAssigneesUpdated = (assignees)=>{
            console.log("Global assignees list updated:", assignees);
        };
        const logIssueSubmitted = (issue, statusId)=>{
            console.log(`Issue submitted:`, issue, `with status ID:`, statusId);
        };
        const logChecklistItemUpdated = (oldLabel, newLabel)=>{
            if (!oldLabel) console.log(`Checklist item created: ${newLabel}`);
            else console.log(`Checklist item updated from "${oldLabel}" to "${newLabel}"`);
        };
        const logCommentPosted = (comment)=>{
            console.log(`Comment posted:`, comment);
        };
        const logCommentUpdated = (comment)=>{
            console.log(`Comment updated:`, comment);
        };
        const logCommentDeleted = (comment)=>{
            console.log(`Comment deleted:`, comment);
        };
        const logIssueDeleted = (issueId)=>{
            console.log(`Issue ${issueId} deleted`);
        };
        wp.hooks.addAction("alpaca.statusChanged", "alpaca/test", logStatusChange);
        wp.hooks.addAction("alpaca.issueAssigneesChanged", "alpaca/test", logAssigneesChange);
        wp.hooks.addAction("alpaca.allAssigneesUpdated", "alpaca/test", logAssigneesUpdated);
        wp.hooks.addAction("alpaca.issueSubmitted", "alpaca/test", logIssueSubmitted);
        wp.hooks.addAction("alpaca.checklistItemUpdated", "alpaca/test", logChecklistItemUpdated);
        wp.hooks.addAction("alpaca.commentPosted", "alpaca/test", logCommentPosted);
        wp.hooks.addAction("alpaca.commentUpdated", "alpaca/test", logCommentUpdated);
        wp.hooks.addAction("alpaca.commentDeleted", "alpaca/test", logCommentDeleted);
        wp.hooks.addAction("alpaca.issueDeleted", "alpaca/test", logIssueDeleted);
        return ()=>{
            wp.hooks.removeAction("alpaca.statusChanged", "alpaca/test");
            wp.hooks.removeAction("alpaca.issueAssigneesChanged", "alpaca/test");
            wp.hooks.removeAction("alpaca.allAssigneesUpdated", "alpaca/test");
            wp.hooks.removeAction("alpaca.issueSubmitted", "alpaca/test");
            wp.hooks.removeAction("alpaca.checklistItemUpdated", "alpaca/test");
            wp.hooks.removeAction("alpaca.commentPosted", "alpaca/test");
            wp.hooks.removeAction("alpaca.commentUpdated", "alpaca/test");
            wp.hooks.removeAction("alpaca.commentDeleted", "alpaca/test");
            wp.hooks.removeAction("alpaca.issueDeleted", "alpaca/test");
        };
    }, [
        enable
    ]);
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"aIYcP":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _statusManager = require("./components/StatusManager");
var _statusManagerDefault = parcelHelpers.interopDefault(_statusManager);
var _defaultStatusSelector = require("./components/DefaultStatusSelector");
var _defaultStatusSelectorDefault = parcelHelpers.interopDefault(_defaultStatusSelector);
var _enableTestLogsControl = require("./components/EnableTestLogsControl");
var _enableTestLogsControlDefault = parcelHelpers.interopDefault(_enableTestLogsControl);
const { useState, useEffect, useCallback } = wp.element;
const AlpacaSettings = ()=>{
    const [statuses, setStatuses] = useState([]);
    const [currentStatuses, setCurrentStatuses] = useState([]); // Track current order
    const [defaultStatusId, setDefaultStatusId] = useState(""); // Track default status
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchStatuses = useCallback(()=>{
        setIsLoading(true);
        wp.apiFetch({
            path: "/alpaca/v1/statuses"
        }).then((data)=>{
            setStatuses(data);
            setCurrentStatuses(data); // Initialize current order
            setIsLoading(false);
        }).catch((err)=>{
            setError(err.message);
            setIsLoading(false);
        });
    }, []);
    useEffect(()=>{
        fetchStatuses();
    }, [
        fetchStatuses
    ]);
    // Handle when StatusManager reorders items
    const handleStatusesOrderChange = useCallback((newOrder)=>{
        setCurrentStatuses(newOrder);
    }, []);
    // Handle when DefaultStatusSelector changes the default
    const handleDefaultStatusChange = useCallback((newDefaultId)=>{
        setDefaultStatusId(newDefaultId);
    }, []);
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement((0, _statusManagerDefault.default), {
        statuses: statuses,
        fetchStatuses: fetchStatuses,
        isLoading: isLoading,
        error: error,
        onStatusesChange: handleStatusesOrderChange,
        defaultStatusId: defaultStatusId,
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 43,
            columnNumber: 7
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("hr", {
        style: {
            marginTop: "2rem"
        },
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 51,
            columnNumber: 7
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("h3", {
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 53,
            columnNumber: 7
        },
        __self: undefined
    }, "Settings"), /*#__PURE__*/ React.createElement("table", {
        className: "form-table",
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 55,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tbody", {
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 56,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _defaultStatusSelectorDefault.default), {
        statuses: currentStatuses,
        onDefaultChange: handleDefaultStatusChange,
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 57,
            columnNumber: 11
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement((0, _enableTestLogsControlDefault.default), {
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 61,
            columnNumber: 11
        },
        __self: undefined
    }))));
};
exports.default = AlpacaSettings;

},{"./components/StatusManager":"4cgN2","./components/DefaultStatusSelector":"8A2rp","./components/EnableTestLogsControl":"7kyCE","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4cgN2":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _pragmaticDragAndDropReactBeautifulDndMigration = require("@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration");
var _dragHandleIcon = require("./icons/DragHandleIcon");
var _dragHandleIconDefault = parcelHelpers.interopDefault(_dragHandleIcon);
const { useState, useEffect, useRef } = wp.element;
const { Button, Spinner, Modal, TextControl } = wp.components;
const StatusManager = ({ statuses, fetchStatuses, isLoading, error, onStatusesChange, defaultStatusId })=>{
    const [statusToDelete, setStatusToDelete] = useState(null);
    const [localStatuses, setLocalStatuses] = useState(statuses);
    const [isUpdatingScores, setIsUpdatingScores] = useState(false);
    useEffect(()=>{
        setLocalStatuses(statuses);
    }, [
        statuses
    ]);
    // Notify parent when local order changes
    useEffect(()=>{
        if (onStatusesChange) onStatusesChange(localStatuses);
    }, [
        localStatuses,
        onStatusesChange
    ]);
    // Recalculate term_scores based on order and default status
    const recalculateScores = async (statusesArray, defaultId)=>{
        if (!defaultId) return; // No default selected, skip scoring
        setIsUpdatingScores(true);
        try {
            const defaultIndex = statusesArray.findIndex((s)=>s.term_id.toString() === defaultId);
            if (defaultIndex === -1) return; // Default status not found
            // Calculate scores relative to default status
            const scoreUpdates = statusesArray.map((status, index)=>{
                const score = index - defaultIndex; // Default gets 0, above get negative, below get positive
                return {
                    id: status.term_id,
                    score: score
                };
            });
            // Update all scores via API
            await Promise.all(scoreUpdates.map((update)=>wp.apiFetch({
                    path: `/alpaca/v1/status/${update.id}`,
                    method: "POST",
                    data: {
                        term_score: update.score
                    }
                })));
            // Refresh the statuses to get updated scores
            fetchStatuses();
        } catch (err) {
            console.error("Error updating term scores:", err);
            alert("Error updating status order: " + err.message);
        } finally{
            setIsUpdatingScores(false);
        }
    };
    const handleDragEnd = (result)=>{
        if (!result.destination) return;
        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        if (sourceIndex === destinationIndex) return;
        const newStatuses = Array.from(localStatuses);
        const [reorderedItem] = newStatuses.splice(sourceIndex, 1);
        newStatuses.splice(destinationIndex, 0, reorderedItem);
        setLocalStatuses(newStatuses);
        // Recalculate scores when order changes
        if (defaultStatusId) recalculateScores(newStatuses, defaultStatusId);
    };
    const handleRename = (id, newName)=>{
        wp.apiFetch({
            path: `/alpaca/v1/status/${id}`,
            method: "POST",
            data: {
                name: newName
            }
        }).then(()=>fetchStatuses()).catch((err)=>{
            console.error("Error renaming status:", err);
            alert("Error renaming status: " + err.message);
        });
    };
    const handleDelete = (id)=>{
        const status = localStatuses.find((s)=>s.term_id === id);
        if (status) setStatusToDelete(status);
    };
    const cancelDelete = ()=>{
        setStatusToDelete(null);
    };
    const performDelete = ()=>{
        if (!statusToDelete) return;
        const { term_id: id } = statusToDelete;
        setStatusToDelete(null); // Close modal immediately
        wp.apiFetch({
            path: `/wp/v2/status/${id}?force=true`,
            method: "DELETE"
        }).then(()=>fetchStatuses()).catch((err)=>{
            console.error("Error deleting status:", err);
            alert("Error deleting status: " + err.message);
        });
    };
    const handleAddStatus = ()=>{
        const newName = prompt("Enter the name for the new status:");
        if (!newName || !newName.trim()) return;
        const maxScore = localStatuses.reduce((max, s)=>Math.max(max, parseInt(s.term_score, 10) || 0), 0);
        wp.apiFetch({
            path: `/wp/v2/status`,
            method: "POST",
            data: {
                name: newName,
                meta: {
                    term_score: maxScore + 10
                }
            }
        }).then(()=>fetchStatuses()).catch((err)=>{
            console.error("Error adding status:", err);
            alert("Error adding status: " + err.message);
        });
    };
    if (isLoading) return /*#__PURE__*/ React.createElement(Spinner, {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 156,
            columnNumber: 25
        },
        __self: undefined
    });
    if (error) return /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 157,
            columnNumber: 21
        },
        __self: undefined
    }, "Error: ", error);
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("h2", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 161,
            columnNumber: 7
        },
        __self: undefined
    }, "Status Manager"), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-status-manager",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 162,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "status-grid",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 163,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "status-grid-header",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 165,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "status-grid-cell",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 166,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("strong", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 167,
            columnNumber: 15
        },
        __self: undefined
    }, "Name")), /*#__PURE__*/ React.createElement("div", {
        className: "status-grid-cell actions-cell",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 169,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("strong", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 170,
            columnNumber: 15
        },
        __self: undefined
    }, "Actions"))), /*#__PURE__*/ React.createElement((0, _pragmaticDragAndDropReactBeautifulDndMigration.DragDropContext), {
        onDragEnd: handleDragEnd,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 175,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _pragmaticDragAndDropReactBeautifulDndMigration.Droppable), {
        droppableId: "status-list",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 176,
            columnNumber: 13
        },
        __self: undefined
    }, (provided)=>/*#__PURE__*/ React.createElement("div", {
            ...provided.droppableProps,
            ref: provided.innerRef,
            className: "status-grid-body",
            __source: {
                fileName: "src/components/StatusManager.jsx",
                lineNumber: 178,
                columnNumber: 17
            },
            __self: undefined
        }, localStatuses.map((status, index)=>/*#__PURE__*/ React.createElement((0, _pragmaticDragAndDropReactBeautifulDndMigration.Draggable), {
                key: status.term_id.toString(),
                draggableId: status.term_id.toString(),
                index: index,
                __source: {
                    fileName: "src/components/StatusManager.jsx",
                    lineNumber: 184,
                    columnNumber: 21
                },
                __self: undefined
            }, (provided, snapshot)=>/*#__PURE__*/ React.createElement(StatusRow, {
                    ref: provided.innerRef,
                    ...provided.draggableProps,
                    dragHandleProps: provided.dragHandleProps,
                    status: status,
                    onRename: handleRename,
                    onDelete: handleDelete,
                    isDragging: snapshot.isDragging,
                    __source: {
                        fileName: "src/components/StatusManager.jsx",
                        lineNumber: 190,
                        columnNumber: 25
                    },
                    __self: undefined
                }))), provided.placeholder, " ")))), /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 210,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        onClick: handleAddStatus,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 211,
            columnNumber: 11
        },
        __self: undefined
    }, "New Status")), statusToDelete && /*#__PURE__*/ React.createElement(Modal, {
        title: "Delete Status?",
        onRequestClose: cancelDelete,
        className: "alpaca-modal",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 217,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 222,
            columnNumber: 13
        },
        __self: undefined
    }, 'Are you sure you want to delete the status "', /*#__PURE__*/ React.createElement("strong", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 224,
            columnNumber: 15
        },
        __self: undefined
    }, statusToDelete.name), '"? This cannot be undone.'), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-actions",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 226,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        variant: "primary",
        isDestructive: true,
        onClick: performDelete,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 227,
            columnNumber: 15
        },
        __self: undefined
    }, "Delete"), /*#__PURE__*/ React.createElement(Button, {
        isSecondary: true,
        onClick: cancelDelete,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 230,
            columnNumber: 15
        },
        __self: undefined
    }, "Cancel")))));
};
// StatusRow using grid cell display
const StatusRow = React.forwardRef(({ status, onRename, onDelete, isDragging, dragHandleProps, ...props }, ref)=>{
    const [isRenaming, setIsRenaming] = useState(false);
    const [name, setName] = useState(status.name);
    const inputRef = useRef(null);
    useEffect(()=>{
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [
        isRenaming
    ]);
    const handleStartRename = ()=>{
        setIsRenaming(true);
    };
    const handleCancelRename = ()=>{
        setIsRenaming(false);
        setName(status.name);
    };
    const handleSaveRename = ()=>{
        setIsRenaming(false);
        if (name.trim() && name !== status.name) onRename(status.term_id, name);
        else setName(status.name);
    };
    const handleKeyDown = (event)=>{
        if (event.key === "Enter") handleSaveRename();
        else if (event.key === "Escape") handleCancelRename();
    };
    return /*#__PURE__*/ React.createElement("div", {
        ref: ref,
        ...props,
        className: `status-grid-row ${isDragging ? "is-dragging" : ""}`,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 285,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "status-grid-cell",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 290,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "status-row-content",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 291,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        ...dragHandleProps,
        className: "drag-handle",
        title: "Drag to reorder",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 292,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _dragHandleIconDefault.default), {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 297,
            columnNumber: 15
        },
        __self: undefined
    })), isRenaming ? /*#__PURE__*/ React.createElement(TextControl, {
        ref: inputRef,
        value: name,
        onChange: setName,
        onBlur: handleSaveRename,
        onKeyDown: handleKeyDown,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 300,
            columnNumber: 15
        },
        __self: undefined
    }) : /*#__PURE__*/ React.createElement(Button, {
        isTertiary: true,
        icon: "edit",
        iconPosition: "right",
        className: "",
        onClick: handleStartRename,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 308,
            columnNumber: 15
        },
        __self: undefined
    }, status.name))), /*#__PURE__*/ React.createElement("div", {
        className: "status-grid-cell actions-cell",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 320,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        icon: "trash",
        label: "Delete",
        onClick: ()=>onDelete(status.term_id),
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 321,
            columnNumber: 11
        },
        __self: undefined
    })));
});
exports.default = StatusManager;

},{"@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration":"iD7mF","./icons/DragHandleIcon":"lhUj1","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"iD7mF":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "DragDropContext", ()=>(0, _dragDropContext.DragDropContext));
parcelHelpers.export(exports, "Draggable", ()=>(0, _draggable.Draggable));
parcelHelpers.export(exports, "Droppable", ()=>(0, _droppable.Droppable));
parcelHelpers.export(exports, "resetServerContext", ()=>(0, _resetServerContext.resetServerContext)) /**
 * Reason: The eslint rule is incorrectly reporting that `react-beautiful-dnd`
 * is required as a dependency, when only its types are being exported.
 */  // eslint-disable-next-line import/no-extraneous-dependencies
;
var _dragDropContext = require("./drag-drop-context");
var _draggable = require("./draggable");
var _droppable = require("./droppable");
var _resetServerContext = require("./reset-server-context");

},{"./drag-drop-context":"gn2Ms","./draggable":"bry8a","./droppable":"aCCG7","./reset-server-context":false,"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gn2Ms":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "resetServerContext", ()=>resetServerContext);
parcelHelpers.export(exports, "DragDropContext", ()=>DragDropContext);
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
var _react = require("react");
var _reactDefault = parcelHelpers.interopDefault(_react);
var _useCapturedDimensions = require("../hooks/use-captured-dimensions");
var _useCleanupFn = require("../hooks/use-cleanup-fn");
var _attributes = require("../utils/attributes");
var _findDragHandle = require("../utils/find-drag-handle");
var _getClosestPositionedElement = require("../utils/get-closest-positioned-element");
var _cancelDrag = require("./cancel-drag");
var _draggableLocation = require("./draggable-location");
var _droppableRegistry = require("./droppable-registry");
var _errorBoundary = require("./error-boundary");
var _getDestination = require("./get-destination");
var _useHiddenTextElement = require("./hooks/use-hidden-text-element");
var _useHiddenTextElementDefault = parcelHelpers.interopDefault(_useHiddenTextElement);
var _useKeyboardControls = require("./hooks/use-keyboard-controls");
var _usePointerControls = require("./hooks/use-pointer-controls");
var _useStyleMarshal = require("./hooks/use-style-marshal");
var _useStyleMarshalDefault = parcelHelpers.interopDefault(_useStyleMarshal);
var _internalContext = require("./internal-context");
var _lifecycleContext = require("./lifecycle-context");
var _liveRegion = require("./live-region");
var _rbdInvariant = require("./rbd-invariant");
var _screenReader = require("./screen-reader");
var _useScheduler = require("./use-scheduler");
/**
 * The instance count is used for selectors when querying the document.
 *
 * Ideally, in the future, this can be removed completely.
 */ var instanceCount = 0;
function resetServerContext() {
    instanceCount = 0;
}
function getContextId() {
    return "".concat(instanceCount++);
}
function getOffset(args) {
    var offsetElement = (0, _getClosestPositionedElement.getClosestPositionedElement)(args);
    return {
        top: offsetElement.offsetTop,
        left: offsetElement.offsetLeft
    };
}
function DragDropContext(_ref) {
    var children = _ref.children, _ref$dragHandleUsageI = _ref.dragHandleUsageInstructions, dragHandleUsageInstructions = _ref$dragHandleUsageI === void 0 ? (0, _screenReader.defaultDragHandleUsageInstructions) : _ref$dragHandleUsageI, nonce = _ref.nonce, onBeforeCapture = _ref.onBeforeCapture, onBeforeDragStart = _ref.onBeforeDragStart, onDragStart = _ref.onDragStart, onDragUpdate = _ref.onDragUpdate, onDragEnd = _ref.onDragEnd;
    var _useState = (0, _react.useState)(getContextId), _useState2 = (0, _slicedToArrayDefault.default)(_useState, 1), contextId = _useState2[0];
    (0, _useHiddenTextElementDefault.default)({
        contextId: contextId,
        text: dragHandleUsageInstructions
    });
    var lifecycle = (0, _lifecycleContext.useLifecycle)();
    var _useScheduler1 = (0, _useScheduler.useScheduler)(), schedule = _useScheduler1.schedule, flush = _useScheduler1.flush;
    var dragStateRef = (0, _react.useRef)({
        isDragging: false
    });
    var getDragState = (0, _react.useCallback)(function() {
        return dragStateRef.current;
    }, []);
    var droppableRegistry = (0, _droppableRegistry.useDroppableRegistry)();
    var getClosestEnabledDraggableLocation = (0, _react.useCallback)(function(_ref2) {
        var droppableId = _ref2.droppableId;
        var droppable = droppableRegistry.getEntry({
            droppableId: droppableId
        });
        while(droppable !== null && droppable.isDropDisabled){
            var _droppable = droppable, parentDroppableId = _droppable.parentDroppableId;
            droppable = parentDroppableId ? droppableRegistry.getEntry({
                droppableId: parentDroppableId
            }) : null;
        }
        if (droppable === null) return null;
        return {
            droppableId: droppable.droppableId,
            index: 0
        };
    }, [
        droppableRegistry
    ]);
    (0, _react.useEffect)(function() {
        /**
     * If there is a drag when the context unmounts, cancel it.
     */ return function() {
            var _getDragState = getDragState(), isDragging = _getDragState.isDragging;
            if (isDragging) (0, _cancelDrag.cancelPointerDrag)();
        };
    }, [
        getDragState
    ]);
    var updateDrag = (0, _react.useCallback)(function(_ref3) {
        var targetLocation = _ref3.targetLocation, _ref3$isImmediate = _ref3.isImmediate, isImmediate = _ref3$isImmediate === void 0 ? false : _ref3$isImmediate;
        if (!dragStateRef.current.isDragging) /**
       * If there is no ongoing drag, then don't do anything.
       *
       * This should never occur, but treating it as a noop is more
       * reasonable than an invariant.
       */ return;
        var _dragStateRef$current = dragStateRef.current, prevDestination = _dragStateRef$current.prevDestination, draggableId = _dragStateRef$current.draggableId, type = _dragStateRef$current.type, sourceLocation = _dragStateRef$current.sourceLocation;
        /**
     * Computes where it would actually move to
     */ var nextDestination = (0, _getDestination.getActualDestination)({
            start: sourceLocation,
            target: targetLocation
        });
        if ((0, _draggableLocation.isSameLocation)(prevDestination, nextDestination)) return;
        Object.assign(dragStateRef.current, {
            prevDestination: nextDestination,
            sourceLocation: sourceLocation,
            targetLocation: targetLocation
        });
        var update = {
            mode: dragStateRef.current.mode,
            draggableId: draggableId,
            type: type,
            source: sourceLocation,
            destination: nextDestination,
            combine: null // not supported by migration layer
        };
        var droppable = targetLocation ? droppableRegistry.getEntry({
            droppableId: targetLocation.droppableId
        }) : null;
        /**
     * This event exists solely to ensure that the drop indicator updates
     * before the drag preview.
     */ lifecycle.dispatch('onPrePendingDragUpdate', {
            update: update,
            targetLocation: targetLocation
        });
        lifecycle.dispatch('onPendingDragUpdate', {
            update: update,
            targetLocation: targetLocation,
            droppable: droppable
        });
        function dispatchConsumerLifecycleEvent() {
            var _getProvided = (0, _screenReader.getProvided)('onDragUpdate', update), provided = _getProvided.provided, getMessage = _getProvided.getMessage;
            onDragUpdate === null || onDragUpdate === void 0 || onDragUpdate(update, provided);
            (0, _liveRegion.announce)(getMessage());
        }
        if (isImmediate) dispatchConsumerLifecycleEvent();
        else schedule(dispatchConsumerLifecycleEvent);
    }, [
        droppableRegistry,
        lifecycle,
        onDragUpdate,
        schedule
    ]);
    var startDrag = (0, _react.useCallback)(function(_ref4) {
        var draggableId = _ref4.draggableId, type = _ref4.type, getSourceLocation = _ref4.getSourceLocation, sourceElement = _ref4.sourceElement, mode = _ref4.mode;
        if (dragStateRef.current.isDragging) /**
       * If there is already an ongoing drag, then don't do anything.
       *
       * This should never occur, but treating it as a noop is more
       * reasonable than an invariant.
       */ return;
        var before = {
            draggableId: draggableId,
            mode: mode
        };
        // This is called in `onDragStart` rather than `onGenerateDragPreview`
        // to avoid a browser bug. Some DOM manipulations can cancel
        // the drag if they happen early in the drag.
        // <https://bugs.chromium.org/p/chromium/issues/detail?id=674882>
        onBeforeCapture === null || onBeforeCapture === void 0 || onBeforeCapture(before);
        var start = {
            mode: mode,
            draggableId: draggableId,
            type: type,
            source: getSourceLocation()
        };
        /**
     * If the active element is a drag handle, then
     * we want to restore focus to it after the drag.
     *
     * This matches the behavior of `react-beautiful-dnd`.
     */ var _document = document, activeElement = _document.activeElement;
        var dragHandleDraggableId = activeElement instanceof HTMLElement && activeElement.hasAttribute((0, _attributes.attributes).dragHandle.draggableId) ? (0, _attributes.getAttribute)(activeElement, (0, _attributes.attributes).dragHandle.draggableId) : null;
        var droppableId = start.source.droppableId;
        var droppable = droppableRegistry.getEntry({
            droppableId: droppableId
        });
        (0, _rbdInvariant.rbdInvariant)(droppable, "should have entry for droppable '".concat(droppableId, "'"));
        dragStateRef.current = {
            isDragging: true,
            mode: mode,
            draggableDimensions: (0, _useCapturedDimensions.getDraggableDimensions)(sourceElement),
            restoreFocusTo: dragHandleDraggableId,
            draggableId: draggableId,
            type: type,
            prevDestination: start.source,
            sourceLocation: start.source,
            targetLocation: start.source,
            draggableInitialOffsetInSourceDroppable: getOffset({
                element: sourceElement,
                mode: droppable.mode
            })
        };
        onBeforeDragStart === null || onBeforeDragStart === void 0 || onBeforeDragStart(start);
        /**
     * This is used to signal to <Draggable> and <Droppable> elements
     * to update their state.
     *
     * This must be synchronous so that they have updated their state
     * by the time that `DragStart` is published.
     */ lifecycle.dispatch('onPendingDragStart', {
            start: start,
            droppable: droppable
        });
        // rbd's `onDragStart` is called in the next event loop (via `setTimeout`)
        //
        // We can safely assume that the React state updates have occurred by
        // now, and that the updated `snapshot` has been provided.
        // <https://twitter.com/alexandereardon/status/1585784101885263872>
        schedule(function() {
            var start = {
                mode: mode,
                draggableId: draggableId,
                type: type,
                source: getSourceLocation()
            };
            var _getProvided2 = (0, _screenReader.getProvided)('onDragStart', start), provided = _getProvided2.provided, getMessage = _getProvided2.getMessage;
            onDragStart === null || onDragStart === void 0 || onDragStart(start, provided);
            (0, _liveRegion.announce)(getMessage());
            /**
       * If the droppable is initially disabled, then we publish an
       * immediate `DragUpdate` with a new non-disabled destination.
       *
       * This is typically `destination === null` but can be a parent
       * droppable if there are nested droppables.
       *
       * `react-beautiful-dnd` does this for mouse drags,
       * but not for keyboard drags. This is likely a bug, and the migration
       * layer will publish an update for all types of drags.
       *
       * This is scheduled so that state changes that occurred in the
       * rbd `onDragStart` will have taken effect. That is,
       * a synchronous `setIsDropDisabled(true)` call in the consumer's
       * `onDragStart` should result in an immediate update here.
       */ schedule(function() {
                var droppableId = start.source.droppableId;
                var droppable = droppableRegistry.getEntry({
                    droppableId: droppableId
                });
                if (droppable !== null && droppable !== void 0 && droppable.isDropDisabled) {
                    var targetLocation = getClosestEnabledDraggableLocation({
                        droppableId: droppableId
                    });
                    updateDrag({
                        targetLocation: targetLocation,
                        isImmediate: true
                    });
                }
            });
        });
    }, [
        droppableRegistry,
        getClosestEnabledDraggableLocation,
        lifecycle,
        onBeforeCapture,
        onBeforeDragStart,
        onDragStart,
        schedule,
        updateDrag
    ]);
    var keyboardCleanupManager = (0, _useCleanupFn.useCleanupFn)();
    var stopDrag = (0, _react.useCallback)(function(_ref5) {
        var reason = _ref5.reason;
        if (!dragStateRef.current.isDragging) /**
       * If there is no ongoing drag, then don't do anything.
       *
       * This should never occur, but treating it as a noop is more
       * reasonable than an invariant.
       */ return;
        keyboardCleanupManager.runCleanupFn();
        /**
     * If this is a cancel, then an update to a null
     * destination will be made. (Unless it is already null)
     *
     * This is different to `react-beautiful-dnd` and exists
     * to standardize behavior between mouse and keyboard drags.
     *
     * This is required because of a behavior in native drag and
     * drop, where a `dragend` will fire exit events on every
     * drop target you are over. This results in an unavoidable
     * null destination update for mouse drags.
     */ if (reason === 'CANCEL') updateDrag({
            targetLocation: null
        });
        var _dragStateRef$current2 = dragStateRef.current, mode = _dragStateRef$current2.mode, restoreFocusTo = _dragStateRef$current2.restoreFocusTo, sourceLocation = _dragStateRef$current2.sourceLocation, targetLocation = _dragStateRef$current2.targetLocation, type = _dragStateRef$current2.type, draggableId = _dragStateRef$current2.draggableId;
        dragStateRef.current = {
            isDragging: false
        };
        flush();
        var destination = (0, _getDestination.getActualDestination)({
            start: sourceLocation,
            target: targetLocation
        });
        var result = {
            // We are saying all null destination drops count as a CANCEL
            reason: destination === null ? 'CANCEL' : 'DROP',
            type: type,
            source: sourceLocation,
            destination: destination,
            mode: mode,
            draggableId: draggableId,
            combine: null // not supported by migration layer
        };
        /**
     * Tells <Draggable> instances to cleanup.
     */ lifecycle.dispatch('onBeforeDragEnd', {
            draggableId: draggableId
        });
        var _getProvided3 = (0, _screenReader.getProvided)('onDragEnd', result), provided = _getProvided3.provided, getMessage = _getProvided3.getMessage;
        onDragEnd(result, provided);
        (0, _liveRegion.announce)(getMessage());
        if (restoreFocusTo) /**
       * The `requestAnimationFrame` matches `react-beautiful-dnd`.
       *
       * It is required to wait for React state updates to have taken effect.
       * Otherwise we might try to focus an element that no longer exists.
       */ requestAnimationFrame(function() {
            var dragHandle = (0, _findDragHandle.findDragHandle)({
                contextId: contextId,
                draggableId: draggableId
            });
            if (!dragHandle) return;
            dragHandle.focus();
        });
    }, [
        contextId,
        flush,
        keyboardCleanupManager,
        lifecycle,
        onDragEnd,
        updateDrag
    ]);
    var dragController = (0, _react.useMemo)(function() {
        return {
            getDragState: getDragState,
            startDrag: startDrag,
            updateDrag: updateDrag,
            stopDrag: stopDrag
        };
    }, [
        getDragState,
        startDrag,
        stopDrag,
        updateDrag
    ]);
    (0, _usePointerControls.usePointerControls)({
        dragController: dragController,
        contextId: contextId
    });
    var _useKeyboardControls1 = (0, _useKeyboardControls.useKeyboardControls)({
        dragController: dragController,
        droppableRegistry: droppableRegistry,
        contextId: contextId,
        setKeyboardCleanupFn: keyboardCleanupManager.setCleanupFn
    }), startKeyboardDrag = _useKeyboardControls1.startKeyboardDrag;
    /**
   * If a droppable becomes disabled during a drag, then a new destination
   * should be found and published in a `DragUpdate`.
   */ var onDroppableUpdate = (0, _react.useCallback)(function(entry) {
        var _dragState$targetLoca;
        var dragState = dragStateRef.current;
        if (!dragState.isDragging) return;
        if (!entry.isDropDisabled) return;
        if (entry.droppableId !== ((_dragState$targetLoca = dragState.targetLocation) === null || _dragState$targetLoca === void 0 ? void 0 : _dragState$targetLoca.droppableId)) return;
        var targetLocation = getClosestEnabledDraggableLocation({
            droppableId: entry.droppableId
        });
        updateDrag({
            targetLocation: targetLocation
        });
    }, [
        getClosestEnabledDraggableLocation,
        updateDrag
    ]);
    droppableRegistry.setUpdateListener(onDroppableUpdate);
    (0, _useStyleMarshalDefault.default)({
        contextId: contextId,
        nonce: nonce
    });
    return /*#__PURE__*/ (0, _reactDefault.default).createElement((0, _errorBoundary.ErrorBoundary), {
        contextId: contextId,
        dragController: dragController
    }, /*#__PURE__*/ (0, _reactDefault.default).createElement((0, _lifecycleContext.LifecycleContextProvider), {
        lifecycle: lifecycle
    }, /*#__PURE__*/ (0, _reactDefault.default).createElement((0, _internalContext.DragDropContextProvider), {
        contextId: contextId,
        getDragState: getDragState,
        startKeyboardDrag: startKeyboardDrag,
        droppableRegistry: droppableRegistry
    }, children)));
}

},{"@babel/runtime/helpers/slicedToArray":"6AJmz","react":"f39IF","../hooks/use-captured-dimensions":"guEId","../hooks/use-cleanup-fn":"lAG2A","../utils/attributes":"ckBmU","../utils/find-drag-handle":"hTk1K","../utils/get-closest-positioned-element":"5yfbQ","./cancel-drag":"g0Z4o","./draggable-location":"alMHr","./droppable-registry":"1kuZB","./error-boundary":"lGDWH","./get-destination":"5fbtJ","./hooks/use-hidden-text-element":"7NaCi","./hooks/use-keyboard-controls":"6F9yG","./hooks/use-pointer-controls":"4udX0","./hooks/use-style-marshal":"jHSrm","./internal-context":"8SB2G","./lifecycle-context":"6NaFx","./live-region":"7WqNO","./rbd-invariant":"gHZ28","./screen-reader":"fKeXi","./use-scheduler":"72NXx","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"6AJmz":[function(require,module,exports,__globalThis) {
var arrayWithHoles = require("a3af206dbd14b1b5");
var iterableToArrayLimit = require("c109e0e3b1a7ef05");
var unsupportedIterableToArray = require("6782568c4383bd49");
var nonIterableRest = require("1e06d43f4bd6e532");
function _slicedToArray(r, e) {
    return arrayWithHoles(r) || iterableToArrayLimit(r, e) || unsupportedIterableToArray(r, e) || nonIterableRest();
}
module.exports = _slicedToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"a3af206dbd14b1b5":"5CPOx","c109e0e3b1a7ef05":"2B9nq","6782568c4383bd49":"cFxnT","1e06d43f4bd6e532":"9O5RF"}],"5CPOx":[function(require,module,exports,__globalThis) {
function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
}
module.exports = _arrayWithHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"2B9nq":[function(require,module,exports,__globalThis) {
function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
        var e, n, i, u, a = [], f = !0, o = !1;
        try {
            if (i = (t = t.call(r)).next, 0 === l) {
                if (Object(t) !== t) return;
                f = !1;
            } else for(; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
        } catch (r) {
            o = !0, n = r;
        } finally{
            try {
                if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
            } finally{
                if (o) throw n;
            }
        }
        return a;
    }
}
module.exports = _iterableToArrayLimit, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"cFxnT":[function(require,module,exports,__globalThis) {
var arrayLikeToArray = require("f8ccc0353f5f3746");
function _unsupportedIterableToArray(r, a) {
    if (r) {
        if ("string" == typeof r) return arrayLikeToArray(r, a);
        var t = ({}).toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? arrayLikeToArray(r, a) : void 0;
    }
}
module.exports = _unsupportedIterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"f8ccc0353f5f3746":"2QyYi"}],"2QyYi":[function(require,module,exports,__globalThis) {
function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for(var e = 0, n = Array(a); e < a; e++)n[e] = r[e];
    return n;
}
module.exports = _arrayLikeToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"9O5RF":[function(require,module,exports,__globalThis) {
function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
module.exports = _nonIterableRest, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"f39IF":[function(require,module,exports,__globalThis) {
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
parcelHelpers.export(exports, "Fragment", ()=>Fragment);
parcelHelpers.export(exports, "useInsertionEffect", ()=>useInsertionEffect);
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
const Fragment = wp.element.Fragment;
const useInsertionEffect = wp.element.useLayoutEffect;
exports.default = wp.element; // default export is the whole wp.element

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"guEId":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getDraggableDimensions", ()=>getDraggableDimensions);
/**
 * Returns the captured dimensions of the item being dragged.
 */ parcelHelpers.export(exports, "useDraggableDimensions", ()=>useDraggableDimensions);
var _internalContext = require("../drag-drop-context/internal-context");
function getDraggableDimensions(element) {
    var _window$getComputedSt = window.getComputedStyle(element), margin = _window$getComputedSt.margin;
    var rect = element.getBoundingClientRect();
    return {
        margin: margin,
        rect: rect
    };
}
function useDraggableDimensions() {
    var _useDragDropContext = (0, _internalContext.useDragDropContext)(), getDragState = _useDragDropContext.getDragState;
    var dragState = getDragState();
    if (!dragState.isDragging) return null;
    return dragState.draggableDimensions;
}

},{"../drag-drop-context/internal-context":"8SB2G","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"8SB2G":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "useDragDropContext", ()=>useDragDropContext);
parcelHelpers.export(exports, "DragDropContextProvider", ()=>DragDropContextProvider);
var _react = require("react");
var _reactDefault = parcelHelpers.interopDefault(_react);
var _rbdInvariant = require("./rbd-invariant");
var DragDropContext = /*#__PURE__*/ (0, _react.createContext)(null);
function useDragDropContext() {
    var value = (0, _react.useContext)(DragDropContext);
    (0, _rbdInvariant.rbdInvariant)(value !== null, 'Unable to find DragDropContext context');
    return value;
}
function DragDropContextProvider(_ref) {
    var children = _ref.children, contextId = _ref.contextId, getDragState = _ref.getDragState, startKeyboardDrag = _ref.startKeyboardDrag, droppableRegistry = _ref.droppableRegistry;
    var value = (0, _react.useMemo)(function() {
        return {
            contextId: contextId,
            getDragState: getDragState,
            startKeyboardDrag: startKeyboardDrag,
            droppableRegistry: droppableRegistry
        };
    }, [
        contextId,
        getDragState,
        startKeyboardDrag,
        droppableRegistry
    ]);
    return /*#__PURE__*/ (0, _reactDefault.default).createElement(DragDropContext.Provider, {
        value: value
    }, children);
}

},{"react":"f39IF","./rbd-invariant":"gHZ28","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gHZ28":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "RbdInvariant", ()=>RbdInvariant);
// A copy-paste of tiny-invariant but with a custom error type
// Throw an error if the condition fails
parcelHelpers.export(exports, "rbdInvariant", ()=>rbdInvariant);
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");
var _classCallCheckDefault = parcelHelpers.interopDefault(_classCallCheck);
var _createClass = require("@babel/runtime/helpers/createClass");
var _createClassDefault = parcelHelpers.interopDefault(_createClass);
var _possibleConstructorReturn = require("@babel/runtime/helpers/possibleConstructorReturn");
var _possibleConstructorReturnDefault = parcelHelpers.interopDefault(_possibleConstructorReturn);
var _getPrototypeOf = require("@babel/runtime/helpers/getPrototypeOf");
var _getPrototypeOfDefault = parcelHelpers.interopDefault(_getPrototypeOf);
var _inherits = require("@babel/runtime/helpers/inherits");
var _inheritsDefault = parcelHelpers.interopDefault(_inherits);
var _wrapNativeSuper = require("@babel/runtime/helpers/wrapNativeSuper");
var _wrapNativeSuperDefault = parcelHelpers.interopDefault(_wrapNativeSuper);
function _callSuper(t, o, e) {
    return o = (0, _getPrototypeOfDefault.default)(o), (0, _possibleConstructorReturnDefault.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOfDefault.default)(t).constructor) : o.apply(t, e));
}
function _isNativeReflectConstruct() {
    try {
        var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
    } catch (t) {}
    return (_isNativeReflectConstruct = function _isNativeReflectConstruct() {
        return !!t;
    })();
}
var isProduction = false;
var prefix = 'Invariant failed';
var RbdInvariant = /*#__PURE__*/ function(_Error) {
    function RbdInvariant(message) {
        var _this;
        (0, _classCallCheckDefault.default)(this, RbdInvariant);
        _this = _callSuper(this, RbdInvariant);
        _this.message = message;
        return _this;
    }
    (0, _inheritsDefault.default)(RbdInvariant, _Error);
    return (0, _createClassDefault.default)(RbdInvariant, [
        {
            key: "toString",
            value: function toString() {
                return this.message;
            }
        }
    ]);
}(/*#__PURE__*/ (0, _wrapNativeSuperDefault.default)(Error));
function rbdInvariant(condition, message) {
    if (condition) return;
    if (isProduction) // In production we strip the message but still throw
    throw new RbdInvariant(prefix);
    else // When not in production we allow the message to pass through
    // *This block will be removed in production builds*
    throw new RbdInvariant("".concat(prefix, ": ").concat(message || ''));
}

},{"@babel/runtime/helpers/classCallCheck":"3nRml","@babel/runtime/helpers/createClass":"2yzPp","@babel/runtime/helpers/possibleConstructorReturn":"cW3L5","@babel/runtime/helpers/getPrototypeOf":"gWrBy","@babel/runtime/helpers/inherits":"bYd1U","@babel/runtime/helpers/wrapNativeSuper":"9vvYY","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"3nRml":[function(require,module,exports,__globalThis) {
function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"2yzPp":[function(require,module,exports,__globalThis) {
var toPropertyKey = require("b03a9e1e96a7e901");
function _defineProperties(e, r) {
    for(var t = 0; t < r.length; t++){
        var o = r[t];
        o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, toPropertyKey(o.key), o);
    }
}
function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
        writable: !1
    }), e;
}
module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"b03a9e1e96a7e901":"5P3X5"}],"5P3X5":[function(require,module,exports,__globalThis) {
var _typeof = require("a14bd529aa4ac1cd")["default"];
var toPrimitive = require("2713647ce51d8c75");
function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
}
module.exports = toPropertyKey, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"a14bd529aa4ac1cd":"jgQjt","2713647ce51d8c75":"eJCHQ"}],"jgQjt":[function(require,module,exports,__globalThis) {
function _typeof(o) {
    "@babel/helpers - typeof";
    return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
        return typeof o;
    } : function(o) {
        return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof(o);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"eJCHQ":[function(require,module,exports,__globalThis) {
var _typeof = require("e0211298897b2d31")["default"];
function toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != _typeof(i)) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
module.exports = toPrimitive, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"e0211298897b2d31":"jgQjt"}],"cW3L5":[function(require,module,exports,__globalThis) {
var _typeof = require("52fa942c15a57b36")["default"];
var assertThisInitialized = require("ca3744a9acc8b6f9");
function _possibleConstructorReturn(t, e) {
    if (e && ("object" == _typeof(e) || "function" == typeof e)) return e;
    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
    return assertThisInitialized(t);
}
module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"52fa942c15a57b36":"jgQjt","ca3744a9acc8b6f9":"1mVba"}],"1mVba":[function(require,module,exports,__globalThis) {
function _assertThisInitialized(e) {
    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e;
}
module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"gWrBy":[function(require,module,exports,__globalThis) {
function _getPrototypeOf(t) {
    return module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t) {
        return t.__proto__ || Object.getPrototypeOf(t);
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _getPrototypeOf(t);
}
module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"bYd1U":[function(require,module,exports,__globalThis) {
var setPrototypeOf = require("f41396146170672b");
function _inherits(t, e) {
    if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
    t.prototype = Object.create(e && e.prototype, {
        constructor: {
            value: t,
            writable: !0,
            configurable: !0
        }
    }), Object.defineProperty(t, "prototype", {
        writable: !1
    }), e && setPrototypeOf(t, e);
}
module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"f41396146170672b":"bblYu"}],"bblYu":[function(require,module,exports,__globalThis) {
function _setPrototypeOf(t, e) {
    return module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t, e) {
        return t.__proto__ = e, t;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _setPrototypeOf(t, e);
}
module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"9vvYY":[function(require,module,exports,__globalThis) {
var getPrototypeOf = require("a346c83e6efb58c8");
var setPrototypeOf = require("287bb8a1bf78a47d");
var isNativeFunction = require("60adf368fae4949a");
var construct = require("7d55b0033bd2218c");
function _wrapNativeSuper(t) {
    var r = "function" == typeof Map ? new Map() : void 0;
    return module.exports = _wrapNativeSuper = function _wrapNativeSuper(t) {
        if (null === t || !isNativeFunction(t)) return t;
        if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function");
        if (void 0 !== r) {
            if (r.has(t)) return r.get(t);
            r.set(t, Wrapper);
        }
        function Wrapper() {
            return construct(t, arguments, getPrototypeOf(this).constructor);
        }
        return Wrapper.prototype = Object.create(t.prototype, {
            constructor: {
                value: Wrapper,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), setPrototypeOf(Wrapper, t);
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _wrapNativeSuper(t);
}
module.exports = _wrapNativeSuper, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"a346c83e6efb58c8":"gWrBy","287bb8a1bf78a47d":"bblYu","60adf368fae4949a":"fUxK1","7d55b0033bd2218c":"bh8Gs"}],"fUxK1":[function(require,module,exports,__globalThis) {
function _isNativeFunction(t) {
    try {
        return -1 !== Function.toString.call(t).indexOf("[native code]");
    } catch (n) {
        return "function" == typeof t;
    }
}
module.exports = _isNativeFunction, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"bh8Gs":[function(require,module,exports,__globalThis) {
var isNativeReflectConstruct = require("bed39adab0c7e5fa");
var setPrototypeOf = require("36754938673a8dd8");
function _construct(t, e, r) {
    if (isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
    var o = [
        null
    ];
    o.push.apply(o, e);
    var p = new (t.bind.apply(t, o))();
    return r && setPrototypeOf(p, r.prototype), p;
}
module.exports = _construct, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"bed39adab0c7e5fa":"8rnjo","36754938673a8dd8":"bblYu"}],"8rnjo":[function(require,module,exports,__globalThis) {
function _isNativeReflectConstruct() {
    try {
        var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
    } catch (t) {}
    return (module.exports = _isNativeReflectConstruct = function _isNativeReflectConstruct() {
        return !!t;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
}
module.exports = _isNativeReflectConstruct, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"lAG2A":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "useCleanupFn", ()=>useCleanupFn);
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
var _react = require("react");
var noop = function noop() {};
function createCleanupManager() {
    var cleanupFn = noop;
    var setCleanupFn = function setCleanupFn(newCleanupFn) {
        cleanupFn = newCleanupFn;
    };
    var runCleanupFn = function runCleanupFn() {
        cleanupFn();
        cleanupFn = noop;
    };
    return {
        setCleanupFn: setCleanupFn,
        runCleanupFn: runCleanupFn
    };
}
function useCleanupFn() {
    var _useState = (0, _react.useState)(createCleanupManager), _useState2 = (0, _slicedToArrayDefault.default)(_useState, 1), cleanupManager = _useState2[0];
    /**
   * Run the cleanup function on unmount.
   */ (0, _react.useEffect)(function() {
        return cleanupManager.runCleanupFn;
    }, [
        cleanupManager.runCleanupFn
    ]);
    return cleanupManager;
}

},{"@babel/runtime/helpers/slicedToArray":"6AJmz","react":"f39IF","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"ckBmU":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "attributes", ()=>attributes);
parcelHelpers.export(exports, "customAttributes", ()=>customAttributes);
parcelHelpers.export(exports, "getAttribute", ()=>getAttribute);
parcelHelpers.export(exports, "setAttributes", ()=>setAttributes);
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
var _rbdInvariant = require("../drag-drop-context/rbd-invariant");
var attributes = {
    draggable: {
        contextId: 'data-rbd-draggable-context-id',
        id: 'data-rbd-draggable-id'
    },
    dragHandle: {
        contextId: 'data-rbd-drag-handle-context-id',
        draggableId: 'data-rbd-drag-handle-draggable-id'
    },
    droppable: {
        contextId: 'data-rbd-droppable-context-id',
        id: 'data-rbd-droppable-id'
    },
    placeholder: {
        contextId: 'data-rbd-placeholder-context-id'
    }
};
var customAttributes = {
    draggable: {
        droppableId: 'data-rbd-draggable-droppable-id',
        index: 'data-rbd-draggable-index'
    },
    dropIndicator: 'data-rbd-drop-indicator',
    droppable: {
        direction: 'data-rbd-droppable-direction',
        type: 'data-rbd-droppable-type'
    }
};
function getAttribute(element, attribute) {
    var value = element.getAttribute(attribute);
    (0, _rbdInvariant.rbdInvariant)(value !== null, "Expected '".concat(attribute, "' to be present"));
    return value;
}
function setAttributes(element, attributes) {
    for(var _i = 0, _Object$entries = Object.entries(attributes); _i < _Object$entries.length; _i++){
        var _Object$entries$_i = (0, _slicedToArrayDefault.default)(_Object$entries[_i], 2), key = _Object$entries$_i[0], value = _Object$entries$_i[1];
        element.setAttribute(key, value);
    }
    return function() {
        for(var _i2 = 0, _Object$keys = Object.keys(attributes); _i2 < _Object$keys.length; _i2++){
            var _key = _Object$keys[_i2];
            element.removeAttribute(_key);
        }
    };
}

},{"@babel/runtime/helpers/slicedToArray":"6AJmz","../drag-drop-context/rbd-invariant":"gHZ28","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"hTk1K":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Obtains the `HTMLElement` with the data attribute passed down through
 * `provided.dragHandleProps`
 */ parcelHelpers.export(exports, "findDragHandle", ()=>findDragHandle);
var _attributes = require("./attributes");
var _findElement = require("./find-element");
function findDragHandle(_ref) {
    var contextId = _ref.contextId, draggableId = _ref.draggableId;
    // Otherwise the drag handle is a descendant.
    return (0, _findElement.findElement)({
        attribute: (0, _attributes.attributes).dragHandle.contextId,
        value: contextId
    }, {
        attribute: (0, _attributes.attributes).dragHandle.draggableId,
        value: draggableId
    });
}

},{"./attributes":"ckBmU","./find-element":"jmXiO","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"jmXiO":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Queries an element based on the provided selector fragments.
 */ parcelHelpers.export(exports, "findElement", ()=>findElement);
parcelHelpers.export(exports, "findElementAll", ()=>findElementAll);
/**
 * Queries an element, ensuring it exists.
 */ parcelHelpers.export(exports, "getElement", ()=>getElement);
var _rbdInvariant = require("../drag-drop-context/rbd-invariant");
/**
 * Each fragment consists of an attribute name, with an optional value.
 */ /**
 * Joins selector fragments into a single selector.
 *
 * @example
 * getSelector(
 *   // If we care about the value of the attribute
 *   { attribute: 'my-attribute', value: 'my-value' },
 *   // If we only care about existence of the attribute
 *   { attribute: 'another-attribute' },
 * ) === '[my-attribute="my-value"][another-attribute]'
 */ function getSelector() {
    for(var _len = arguments.length, fragments = new Array(_len), _key = 0; _key < _len; _key++)fragments[_key] = arguments[_key];
    var parts = fragments.map(function(_ref) {
        var attribute = _ref.attribute, value = _ref.value;
        if (value) // `CSS.escape` is widely supported, the lint rule is wrong.
        // It avoids problems caused by some values which are not valid in
        // selectors.
        return "[".concat(attribute, "=\"").concat(CSS.escape(value), "\"]");
        return "[".concat(attribute, "]");
    });
    return parts.join('');
}
function findElement() {
    var selector = getSelector.apply(void 0, arguments);
    return document.querySelector(selector);
}
function findElementAll() {
    var selector = getSelector.apply(void 0, arguments);
    return Array.from(document.querySelectorAll(selector));
}
function getElement() {
    var result = findElement.apply(void 0, arguments);
    (0, _rbdInvariant.rbdInvariant)(result, 'There is a matching HTMLElement for selector ' + getSelector.apply(void 0, arguments));
    return result;
}

},{"../drag-drop-context/rbd-invariant":"gHZ28","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"5yfbQ":[function(require,module,exports,__globalThis) {
/**
 * Returns the closest element with `position: absolute` or `null` if none found.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Returns the closest element that is offset relative to the scroll container.
 */ parcelHelpers.export(exports, "getClosestPositionedElement", ()=>getClosestPositionedElement);
function getClosestAbsolutePositionedElement(element) {
    var _getComputedStyle = getComputedStyle(element), position = _getComputedStyle.position;
    if (position === 'absolute') return element;
    var parentElement = element.parentElement;
    if (parentElement instanceof HTMLElement) return getClosestAbsolutePositionedElement(parentElement);
    return null;
}
function getClosestPositionedElement(_ref) {
    var _getClosestAbsolutePo;
    var element = _ref.element, mode = _ref.mode;
    /**
   * We use the element directly for standard lists,
   * because we assume it is positioned in the flow.
   */ if (mode === 'standard') return element;
    /**
   * For virtual lists we use the closest element with `position: absolute`,
   * as this is how virtualization libraries offset elements.
   */ return (_getClosestAbsolutePo = getClosestAbsolutePositionedElement(element)) !== null && _getClosestAbsolutePo !== void 0 ? _getClosestAbsolutePo : element;
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"g0Z4o":[function(require,module,exports,__globalThis) {
/**
 * Cancels the active drag, if there is one.
 *
 * This only affects pdnd's tracking, not the browser's dragging.
 *
 * This means if you drag out of the browser and back in,
 * an external adapter could pick it up as a new drag.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "cancelPointerDrag", ()=>cancelPointerDrag);
function cancelPointerDrag() {
    window.dispatchEvent(new DragEvent('dragend'));
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"alMHr":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Derives a `DraggableLocation` (`react-beautiful-dnd`)
 * from a `DragLocation` (`@atlaskit/pragmatic-drag-and-drop`).
 */ parcelHelpers.export(exports, "getDraggableLocation", ()=>getDraggableLocation);
/**
 * Checks if two `DraggableLocation` values are equivalent.
 */ parcelHelpers.export(exports, "isSameLocation", ()=>isSameLocation);
var _objectWithoutProperties = require("@babel/runtime/helpers/objectWithoutProperties");
var _objectWithoutPropertiesDefault = parcelHelpers.interopDefault(_objectWithoutProperties);
var _closestEdge = require("@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge");
var _data = require("../draggable/data");
var _data1 = require("../droppable/data");
var _attributes = require("../utils/attributes");
var _findAllDraggables = require("../utils/find-all-draggables");
var _excluded = [
    "droppableId",
    "getIndex"
], _excluded2 = [
    "contextId",
    "droppableId"
];
/**
 * Derives the `DraggableLocation` of a `<Draggable>`.
 *
 * Accounts for which edge is being hovered over.
 */ function getDraggableLocationFromDraggableData(_ref) {
    var droppableId = _ref.droppableId, getIndex = _ref.getIndex, data = (0, _objectWithoutPropertiesDefault.default)(_ref, _excluded);
    /**
   * The index that the draggable is currently occupying.
   */ var index = getIndex();
    var closestEdge = (0, _closestEdge.extractClosestEdge)(/**
   * TypeScript doesn't like this without casting.
   *
   * The IDE doesn't have an issue, but if you try to build it then
   * there will be an error.
   */ data);
    /**
   * Whether the user is hovering over the second half of the draggable.
   *
   * For a vertical list it is the bottom half,
   * while for a horizontal list it is the right half.
   */ var isForwardEdge = closestEdge === 'bottom' || closestEdge === 'right';
    if (isForwardEdge) /**
     * If hovering over the 'forward' half of the draggable,
     * then the user is targeting the index after the draggable.
     */ index += 1;
    return {
        droppableId: droppableId,
        index: index
    };
}
/**
 * Derives the `DraggableLocation` of a `<Droppable>`.
 *
 * This corresponds to the first or last index of the list,
 * depending on where the user is hovering.
 */ function getDraggableLocationFromDroppableData(_ref2) {
    var contextId = _ref2.contextId, droppableId = _ref2.droppableId, data = (0, _objectWithoutPropertiesDefault.default)(_ref2, _excluded2);
    var draggables = (0, _findAllDraggables.findAllDraggables)({
        contextId: contextId,
        droppableId: droppableId
    });
    /**
   * If there are no draggables, then the index should be 0
   */ if (draggables.length === 0) return {
        droppableId: droppableId,
        index: 0
    };
    var closestEdge = (0, _closestEdge.extractClosestEdge)(data);
    /**
   * Whether the user is closer to the start of the droppable.
   *
   * For a vertical list it is the top half,
   * while for a horizontal list it is the left half.
   */ var isCloserToStart = closestEdge === 'top' || closestEdge === 'left';
    if (isCloserToStart) /**
     * If the user is closer to the start of the list, we will target the
     * first (0th) index.
     */ return {
        droppableId: droppableId,
        index: 0
    };
    /**
   * We don't just take the index of the last draggable,
   * because portal-ing can lead to the DOM order not matching indexes.
   */ var biggestIndex = draggables.reduce(function(max, draggable) {
        var draggableIndex = parseInt((0, _attributes.getAttribute)(draggable, (0, _attributes.customAttributes).draggable.index), 10);
        return Math.max(max, draggableIndex);
    }, 0);
    return {
        droppableId: droppableId,
        index: biggestIndex + 1
    };
}
function getDraggableLocation(location) {
    var dropTargets = location.dropTargets;
    // If there are no drop targets then there is no destination.
    if (dropTargets.length === 0) return null;
    // Obtains the innermost drop target.
    var target = dropTargets[0];
    // If the target is a draggable we can extract its index.
    if ((0, _data.isDraggableData)(target.data)) return getDraggableLocationFromDraggableData(target.data);
    // If the target is a droppable, there is no index to extract.
    // We default to the end of the droppable.
    if ((0, _data1.isDroppableData)(target.data)) return getDraggableLocationFromDroppableData(target.data);
    // The target is not from the migration layer.
    return null;
}
function isSameLocation(a, b) {
    if ((a === null || a === void 0 ? void 0 : a.droppableId) !== (b === null || b === void 0 ? void 0 : b.droppableId)) return false;
    if ((a === null || a === void 0 ? void 0 : a.index) !== (b === null || b === void 0 ? void 0 : b.index)) return false;
    return true;
}

},{"@babel/runtime/helpers/objectWithoutProperties":"lte4p","@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge":"3uEYc","../draggable/data":"6qWMC","../droppable/data":"iSg7i","../utils/attributes":"ckBmU","../utils/find-all-draggables":"iTmr1","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"lte4p":[function(require,module,exports,__globalThis) {
var objectWithoutPropertiesLoose = require("424c8dc91f0a14f9");
function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o, r, i = objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
        var n = Object.getOwnPropertySymbols(e);
        for(r = 0; r < n.length; r++)o = n[r], -1 === t.indexOf(o) && ({}).propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
}
module.exports = _objectWithoutProperties, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"424c8dc91f0a14f9":"hvCCX"}],"hvCCX":[function(require,module,exports,__globalThis) {
function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for(var n in r)if (({}).hasOwnProperty.call(r, n)) {
        if (-1 !== e.indexOf(n)) continue;
        t[n] = r[n];
    }
    return t;
}
module.exports = _objectWithoutPropertiesLoose, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"3uEYc":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Adds a unique `Symbol` to the `userData` object. Use with `extractClosestEdge()` for type safe lookups.
 */ parcelHelpers.export(exports, "attachClosestEdge", ()=>attachClosestEdge);
/**
 * Returns the value added by `attachClosestEdge()` to the `userData` object. It will return `null` if there is no value.
 */ parcelHelpers.export(exports, "extractClosestEdge", ()=>extractClosestEdge);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            (0, _definePropertyDefault.default)(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
// re-exporting type to make it easy to use
var getDistanceToEdge = {
    top: function top(rect, client) {
        return Math.abs(client.y - rect.top);
    },
    right: function right(rect, client) {
        return Math.abs(rect.right - client.x);
    },
    bottom: function bottom(rect, client) {
        return Math.abs(rect.bottom - client.y);
    },
    left: function left(rect, client) {
        return Math.abs(client.x - rect.left);
    }
};
// using a symbol so we can guarantee a key with a unique value
var uniqueKey = Symbol('closestEdge');
function attachClosestEdge(userData, _ref) {
    var _entries$sort$0$edge, _entries$sort$;
    var element = _ref.element, input = _ref.input, allowedEdges = _ref.allowedEdges;
    var client = {
        x: input.clientX,
        y: input.clientY
    };
    // I tried caching the result of `getBoundingClientRect()` for a single
    // frame in order to improve performance.
    // However, on measurement I saw no improvement. So no longer caching
    var rect = element.getBoundingClientRect();
    var entries = allowedEdges.map(function(edge) {
        return {
            edge: edge,
            value: getDistanceToEdge[edge](rect, client)
        };
    });
    // edge can be `null` when `allowedEdges` is []
    var addClosestEdge = (_entries$sort$0$edge = (_entries$sort$ = entries.sort(function(a, b) {
        return a.value - b.value;
    })[0]) === null || _entries$sort$ === void 0 ? void 0 : _entries$sort$.edge) !== null && _entries$sort$0$edge !== void 0 ? _entries$sort$0$edge : null;
    return _objectSpread(_objectSpread({}, userData), {}, (0, _definePropertyDefault.default)({}, uniqueKey, addClosestEdge));
}
function extractClosestEdge(userData) {
    var _ref2;
    return (_ref2 = userData[uniqueKey]) !== null && _ref2 !== void 0 ? _ref2 : null;
}

},{"@babel/runtime/helpers/defineProperty":"4x6r7","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4x6r7":[function(require,module,exports,__globalThis) {
var toPropertyKey = require("29ac19868e7f119");
function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"29ac19868e7f119":"5P3X5"}],"6qWMC":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Data that is attached to drags. The same data is used for the `draggable()`
 * and `dropTargetForElements()` calls related to a `<Draggable>` instance.
 */ /**
 * Checks if the passed data satisfies `DraggableData` using the private symbol.
 */ parcelHelpers.export(exports, "isDraggableData", ()=>isDraggableData);
/**
 * Adds the private symbol to the passed data.
 *
 * The symbol allows us to quickly check if an object satisfies `DraggableData`.
 */ parcelHelpers.export(exports, "useDraggableData", ()=>useDraggableData);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
var _react = require("react");
/**
 * Private symbol that is intentionally not exported from this file.
 */ var privateKey = Symbol('DraggableData');
function isDraggableData(data) {
    return data[privateKey] === true;
}
function useDraggableData(_ref) {
    var draggableId = _ref.draggableId, droppableId = _ref.droppableId, getIndex = _ref.getIndex, contextId = _ref.contextId, type = _ref.type;
    return (0, _react.useMemo)(function() {
        return (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({}, privateKey, true), "draggableId", draggableId), "droppableId", droppableId), "getIndex", getIndex), "contextId", contextId), "type", type);
    }, [
        draggableId,
        droppableId,
        getIndex,
        contextId,
        type
    ]);
}

},{"@babel/runtime/helpers/defineProperty":"4x6r7","react":"f39IF","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"iSg7i":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Data that is attached to drags.
 */ /**
 * Checks if the passed data satisfies `DroppableData` using the private symbol.
 */ parcelHelpers.export(exports, "isDroppableData", ()=>isDroppableData);
/**
 * Adds the private symbol to the passed data.
 *
 * The symbol allows us to quickly check if an object satisfies `DroppableData`.
 */ parcelHelpers.export(exports, "useDroppableData", ()=>useDroppableData);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
var _react = require("react");
/**
 * Private symbol that is intentionally not exported from this file.
 */ var privateKey = Symbol('DroppableData');
function isDroppableData(data) {
    return data[privateKey] === true;
}
function useDroppableData(_ref) {
    var contextId = _ref.contextId, droppableId = _ref.droppableId, getIsDropDisabled = _ref.getIsDropDisabled;
    return (0, _react.useMemo)(function() {
        return (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({}, privateKey, true), "contextId", contextId), "droppableId", droppableId), "getIsDropDisabled", getIsDropDisabled);
    }, [
        contextId,
        droppableId,
        getIsDropDisabled
    ]);
}

},{"@babel/runtime/helpers/defineProperty":"4x6r7","react":"f39IF","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"iTmr1":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "findAllDraggables", ()=>findAllDraggables);
var _attributes = require("./attributes");
var _findElement = require("./find-element");
function findAllDraggables(_ref) {
    var droppableId = _ref.droppableId, contextId = _ref.contextId;
    return (0, _findElement.findElementAll)({
        attribute: (0, _attributes.attributes).draggable.contextId,
        value: contextId
    }, {
        attribute: (0, _attributes.customAttributes).draggable.droppableId,
        value: droppableId
    });
}

},{"./attributes":"ckBmU","./find-element":"jmXiO","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1kuZB":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "useDroppableRegistry", ()=>useDroppableRegistry);
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
var _react = require("react");
function createDroppableRegistry() {
    var droppableMap = new Map();
    var getEntry = function getEntry(_ref) {
        var _droppableMap$get;
        var droppableId = _ref.droppableId;
        return (_droppableMap$get = droppableMap.get(droppableId)) !== null && _droppableMap$get !== void 0 ? _droppableMap$get : null;
    };
    var updateListener = null;
    var setUpdateListener = function setUpdateListener(listener) {
        updateListener = listener;
    };
    var register = function register(entry) {
        var _updateListener;
        droppableMap.set(entry.droppableId, entry);
        (_updateListener = updateListener) === null || _updateListener === void 0 || _updateListener(entry);
        return function() {
            droppableMap.delete(entry.droppableId);
        };
    };
    return {
        getEntry: getEntry,
        register: register,
        setUpdateListener: setUpdateListener
    };
}
function useDroppableRegistry() {
    var _useState = (0, _react.useState)(createDroppableRegistry), _useState2 = (0, _slicedToArrayDefault.default)(_useState, 1), droppableRegistry = _useState2[0];
    return droppableRegistry;
}

},{"@babel/runtime/helpers/slicedToArray":"6AJmz","react":"f39IF","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"lGDWH":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "ErrorBoundary", ()=>ErrorBoundary);
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");
var _classCallCheckDefault = parcelHelpers.interopDefault(_classCallCheck);
var _createClass = require("@babel/runtime/helpers/createClass");
var _createClassDefault = parcelHelpers.interopDefault(_createClass);
var _possibleConstructorReturn = require("@babel/runtime/helpers/possibleConstructorReturn");
var _possibleConstructorReturnDefault = parcelHelpers.interopDefault(_possibleConstructorReturn);
var _getPrototypeOf = require("@babel/runtime/helpers/getPrototypeOf");
var _getPrototypeOfDefault = parcelHelpers.interopDefault(_getPrototypeOf);
var _inherits = require("@babel/runtime/helpers/inherits");
var _inheritsDefault = parcelHelpers.interopDefault(_inherits);
var _react = require("react");
var _reactDefault = parcelHelpers.interopDefault(_react);
var _bindEventListener = require("bind-event-listener");
var _combine = require("@atlaskit/pragmatic-drag-and-drop/combine");
var _adapter = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var _devWarning = require("../dev-warning");
var _cancelDrag = require("./cancel-drag");
var _rbdInvariant = require("./rbd-invariant");
function _callSuper(t, o, e) {
    return o = (0, _getPrototypeOfDefault.default)(o), (0, _possibleConstructorReturnDefault.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOfDefault.default)(t).constructor) : o.apply(t, e));
}
function _isNativeReflectConstruct() {
    try {
        var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
    } catch (t) {}
    return (_isNativeReflectConstruct = function _isNativeReflectConstruct() {
        return !!t;
    })();
}
/**
 * This component holds the actual error boundary logic.
 */ function ErrorBoundaryInner(_ref) {
    var children = _ref.children, dragController = _ref.dragController;
    var isDraggingRef = (0, _react.useRef)(false);
    var handleWindowError = (0, _react.useCallback)(function(event) {
        var dragState = dragController.getDragState();
        if (!dragState.isDragging) return;
        if (dragState.mode === 'FLUID') (0, _cancelDrag.cancelPointerDrag)();
        if (dragState.mode === 'SNAP') dragController.stopDrag({
            reason: 'CANCEL'
        });
        (0, _devWarning.warning)("\n          An error was caught by our window 'error' event listener while a drag was occurring.\n          The active drag has been aborted.\n        ");
        var err = event.error;
        if (err instanceof (0, _rbdInvariant.RbdInvariant)) {
            // Marking the event as dealt with.
            // This will prevent any 'uncaught' error warnings in the console
            event.preventDefault();
            (0, _devWarning.error)(err.message);
        }
    }, [
        dragController
    ]);
    (0, _react.useEffect)(function() {
        return (0, _combine.combine)((0, _adapter.monitorForElements)({
            onDragStart: function onDragStart() {
                isDraggingRef.current = true;
            },
            onDrop: function onDrop() {
                isDraggingRef.current = false;
            }
        }), // @ts-expect-error - type narrowing isn't working on the error param
        (0, _bindEventListener.bind)(window, {
            type: 'error',
            listener: handleWindowError
        }));
    }, [
        handleWindowError
    ]);
    return children;
}
var ErrorBoundary = /*#__PURE__*/ function(_React$Component) {
    function ErrorBoundary() {
        (0, _classCallCheckDefault.default)(this, ErrorBoundary);
        return _callSuper(this, ErrorBoundary, arguments);
    }
    (0, _inheritsDefault.default)(ErrorBoundary, _React$Component);
    return (0, _createClassDefault.default)(ErrorBoundary, [
        {
            key: "componentDidCatch",
            value: function componentDidCatch(err) {
                if (err instanceof (0, _rbdInvariant.RbdInvariant)) {
                    (0, _devWarning.error)(err.message);
                    return;
                }
                // throwing error for other error boundaries
                throw err;
            }
        },
        {
            key: "render",
            value: function render() {
                return /*#__PURE__*/ (0, _reactDefault.default).createElement(ErrorBoundaryInner, {
                    contextId: this.props.contextId,
                    dragController: this.props.dragController
                }, this.props.children);
            }
        }
    ], [
        {
            key: "getDerivedStateFromError",
            value: function getDerivedStateFromError() {
            // Intentionally blank, because this method needs to be defined
            }
        }
    ]);
}((0, _reactDefault.default).Component);

},{"@babel/runtime/helpers/classCallCheck":"3nRml","@babel/runtime/helpers/createClass":"2yzPp","@babel/runtime/helpers/possibleConstructorReturn":"cW3L5","@babel/runtime/helpers/getPrototypeOf":"gWrBy","@babel/runtime/helpers/inherits":"bYd1U","react":"f39IF","bind-event-listener":"4KK82","@atlaskit/pragmatic-drag-and-drop/combine":"6avx6","@atlaskit/pragmatic-drag-and-drop/element/adapter":"3xAZN","../dev-warning":"lA7oL","./cancel-drag":"g0Z4o","./rbd-invariant":"gHZ28","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4KK82":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.bindAll = exports.bind = void 0;
var bind_1 = require("8202606026c980e2");
Object.defineProperty(exports, "bind", {
    enumerable: true,
    get: function() {
        return bind_1.bind;
    }
});
var bind_all_1 = require("bbc7be63587375dc");
Object.defineProperty(exports, "bindAll", {
    enumerable: true,
    get: function() {
        return bind_all_1.bindAll;
    }
});

},{"8202606026c980e2":"jb5fS","bbc7be63587375dc":"hToiN"}],"jb5fS":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.bind = void 0;
function bind(target, _a) {
    var type = _a.type, listener = _a.listener, options = _a.options;
    target.addEventListener(type, listener, options);
    return function unbind() {
        target.removeEventListener(type, listener, options);
    };
}
exports.bind = bind;

},{}],"hToiN":[function(require,module,exports,__globalThis) {
"use strict";
var __assign = this && this.__assign || function() {
    __assign = Object.assign || function(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.bindAll = void 0;
var bind_1 = require("f7b0c436af93bbf9");
function toOptions(value) {
    if (typeof value === 'undefined') return undefined;
    if (typeof value === 'boolean') return {
        capture: value
    };
    return value;
}
function getBinding(original, sharedOptions) {
    if (sharedOptions == null) return original;
    var binding = __assign(__assign({}, original), {
        options: __assign(__assign({}, toOptions(sharedOptions)), toOptions(original.options))
    });
    return binding;
}
function bindAll(target, bindings, sharedOptions) {
    var unbinds = bindings.map(function(original) {
        var binding = getBinding(original, sharedOptions);
        return (0, bind_1.bind)(target, binding);
    });
    return function unbindAll() {
        unbinds.forEach(function(unbind) {
            return unbind();
        });
    };
}
exports.bindAll = bindAll;

},{"f7b0c436af93bbf9":"jb5fS"}],"6avx6":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "combine", ()=>(0, _combine.combine));
var _combine = require("../public-utils/combine");

},{"../public-utils/combine":"6Jv8H","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"6Jv8H":[function(require,module,exports,__globalThis) {
/** Create a new combined function that will call all the provided functions */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "combine", ()=>combine);
function combine() {
    for(var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++)fns[_key] = arguments[_key];
    return function cleanup() {
        fns.forEach(function(fn) {
            return fn();
        });
    };
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"3xAZN":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "draggable", ()=>(0, _elementAdapter.draggable)) // Payload for the draggable being dragged
;
parcelHelpers.export(exports, "dropTargetForElements", ()=>(0, _elementAdapter.dropTargetForElements));
parcelHelpers.export(exports, "monitorForElements", ()=>(0, _elementAdapter.monitorForElements));
var _elementAdapter = require("../../adapter/element-adapter");

},{"../../adapter/element-adapter":"jlEOT","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"jlEOT":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "dropTargetForElements", ()=>dropTargetForElements);
parcelHelpers.export(exports, "monitorForElements", ()=>monitorForElements);
parcelHelpers.export(exports, "draggable", ()=>draggable) /** Common event payload for all events */  /** A map containing payloads for all events */  /** Common event payload for all drop target events */  /** A map containing payloads for all events on drop targets */  /** Arguments given to all feedback functions (eg `canDrag()`) on for a `draggable()` */  /** Arguments given to all feedback functions (eg `canDrop()`) on a `dropTargetForElements()` */  /** Arguments given to all monitor feedback functions (eg `canMonitor()`) for a `monitorForElements` */ ;
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
var _bindEventListener = require("bind-event-listener");
var _getElementFromPointWithoutHoneyPot = require("../honey-pot-fix/get-element-from-point-without-honey-pot");
var _makeHoneyPotFix = require("../honey-pot-fix/make-honey-pot-fix");
var _makeAdapter = require("../make-adapter/make-adapter");
var _combine = require("../public-utils/combine");
var _once = require("../public-utils/once");
var _addAttribute = require("../util/add-attribute");
var _android = require("../util/android");
var _getInput = require("../util/get-input");
var _textMediaType = require("../util/media-types/text-media-type");
var _urlMediaType = require("../util/media-types/url-media-type");
var _elementAdapterNativeDataKey = require("./element-adapter-native-data-key");
var draggableRegistry = new WeakMap();
function addToRegistry(args) {
    draggableRegistry.set(args.element, args);
    return function cleanup() {
        draggableRegistry.delete(args.element);
    };
}
var honeyPotFix = (0, _makeHoneyPotFix.makeHoneyPotFix)();
var adapter = (0, _makeAdapter.makeAdapter)({
    typeKey: 'element',
    defaultDropEffect: 'move',
    mount: function mount(api) {
        /**  Binding event listeners the `document` rather than `window` so that
     * this adapter always gets preference over the text adapter.
     * `document` is the first `EventTarget` under `window`
     * https://twitter.com/alexandereardon/status/1604658588311465985
     */ return (0, _combine.combine)(honeyPotFix.bindEvents(), (0, _bindEventListener.bind)(document, {
            type: 'dragstart',
            listener: function listener(event) {
                var _entry$dragHandle, _entry$getInitialData, _entry$getInitialData2, _entry$dragHandle2, _entry$getInitialData3, _entry$getInitialData4;
                if (!api.canStart(event)) return;
                // If the "dragstart" event is cancelled, then a drag won't start
                // There will be no further drag operation events (eg no "dragend" event)
                if (event.defaultPrevented) return;
                // Technically `dataTransfer` can be `null` according to the types
                // But that behaviour does not seem to appear in the spec.
                // If there is not `dataTransfer`, we can assume something is wrong and not
                // start a drag
                if (!event.dataTransfer) {
                    // eslint-disable-next-line no-console
                    console.warn("\n              It appears as though you have are not testing DragEvents correctly.\n\n              - If you are unit testing, ensure you have polyfilled DragEvent.\n              - If you are browser testing, ensure you are dispatching drag events correctly.\n\n              Please see our testing guides for more information:\n              https://atlassian.design/components/pragmatic-drag-and-drop/core-package/testing\n            ".replace(/ {2}/g, ''));
                    return;
                }
                // the closest parent that is a draggable element will be marked as
                // the `event.target` for the event
                var target = event.target;
                // this source is only for elements
                // Note: only HTMLElements can have the "draggable" attribute
                if (!(target instanceof HTMLElement)) return null;
                // see if the thing being dragged is owned by us
                var entry = draggableRegistry.get(target);
                // no matching element found
                // → dragging an element with `draggable="true"` that is not controlled by us
                if (!entry) return null;
                /**
         * A text selection drag _can_ have the `draggable` element be
         * the `event.target` if the user is dragging the text selection
         * from the `draggable`.
         *
         * To know if the `draggable` is being dragged, we look at whether any
         * `"text/plain"` data is being dragged. If it is, then a text selection
         * drag is occurring.
         *
         * This behaviour has been validated on:
         *
         * - Chrome@128 on Android@14
         * - Chrome@128 on iOS@17.6.1
         * - Chrome@128 on Windows@11
         * - Chrome@128 on MacOS@14.6.1
         * - Firefox@129 on Windows@11 (not possible for user to select text in a draggable)
         * - Firefox@129 on MacOS@14.6.1 (not possible for user to select text in a draggable)
         *
         * Note: Could usually just use: `event.dataTransfer.types.includes(textMediaType)`
         * but unfortunately ProseMirror is always setting `""` as the dragged text
         *
         * Note: Unfortunately editor is (heavily) leaning on the current functionality today
         * and unwinding it will be a decent amount of effort. So for now, a text selection
         * where the `event.target` is a `draggable` element will still trigger the
         * element adapter.
         *
         * // Future state:
         * if(event.dataTransfer.getData(textMediaType)) {
         * 	return;
         * }
         *
         */ var input = (0, _getInput.getInput)(event);
                var feedback = {
                    element: entry.element,
                    dragHandle: (_entry$dragHandle = entry.dragHandle) !== null && _entry$dragHandle !== void 0 ? _entry$dragHandle : null,
                    input: input
                };
                // Check: does the draggable want to allow dragging?
                if (entry.canDrag && !entry.canDrag(feedback)) {
                    // cancel drag operation if we cannot drag
                    event.preventDefault();
                    return null;
                }
                // Check: is there a drag handle and is the user using it?
                if (entry.dragHandle) {
                    // technically don't need this util, but just being
                    // consistent with how we look up what is under the users
                    // cursor.
                    var over = (0, _getElementFromPointWithoutHoneyPot.getElementFromPointWithoutHoneypot)({
                        x: input.clientX,
                        y: input.clientY
                    });
                    // if we are not dragging from the drag handle (or something inside the drag handle)
                    // then we will cancel the active drag
                    if (!entry.dragHandle.contains(over)) {
                        event.preventDefault();
                        return null;
                    }
                }
                /**
         *  **Goal**
         *  Pass information to other applications
         *
         * **Approach**
         *  Put data into the native data store
         *
         *  **What about the native adapter?**
         *  When the element adapter puts native data into the native data store
         *  the native adapter is not triggered in the current window,
         *  but a native adapter in an external window _can_ be triggered
         *
         *  **Why bake this into core?**
         *  This functionality could be pulled out and exposed inside of
         *  `onGenerateDragPreview`. But decided to make it a part of the
         *  base API as it felt like a common enough use case and ended
         *  up being a similar amount of code to include this function as
         *  it was to expose the hook for it
         */ var nativeData = (_entry$getInitialData = (_entry$getInitialData2 = entry.getInitialDataForExternal) === null || _entry$getInitialData2 === void 0 ? void 0 : _entry$getInitialData2.call(entry, feedback)) !== null && _entry$getInitialData !== void 0 ? _entry$getInitialData : null;
                if (nativeData) for(var _i = 0, _Object$entries = Object.entries(nativeData); _i < _Object$entries.length; _i++){
                    var _Object$entries$_i = (0, _slicedToArrayDefault.default)(_Object$entries[_i], 2), key = _Object$entries$_i[0], data = _Object$entries$_i[1];
                    event.dataTransfer.setData(key, data !== null && data !== void 0 ? data : '');
                }
                /**
         *  📱 For Android devices, a drag operation will not start unless
         * "text/plain" or "text/uri-list" data exists in the native data store
         * https://twitter.com/alexandereardon/status/1732189803754713424
         *
         * Tested on:
         * Device: Google Pixel 5
         * Android version: 14 (November 5, 2023)
         * Chrome version: 120.0
         */ if ((0, _android.isAndroid)() && !event.dataTransfer.types.includes((0, _textMediaType.textMediaType)) && !event.dataTransfer.types.includes((0, _urlMediaType.URLMediaType))) event.dataTransfer.setData((0, _textMediaType.textMediaType), (0, _android.androidFallbackText));
                /**
         * 1. Must set any media type for `iOS15` to work
         * 2. We are also doing adding data so that the native adapter
         * can know that the element adapter has handled this drag
         *
         * We used to wrap this `setData()` in a `try/catch` for Firefox,
         * but it looks like that was not needed.
         *
         * Tested using: https://codesandbox.io/s/checking-firefox-throw-behaviour-on-dragstart-qt8h4f
         *
         * - ✅ Firefox@70.0 (Oct 2019) on macOS Sonoma
         * - ✅ Firefox@70.0 (Oct 2019) on macOS Big Sur
         * - ✅ Firefox@70.0 (Oct 2019) on Windows 10
         *
         * // just checking a few more combinations to be super safe
         *
         * - ✅ Chrome@78 (Oct 2019) on macOS Big Sur
         * - ✅ Chrome@78 (Oct 2019) on Windows 10
         * - ✅ Safari@14.1 on macOS Big Sur
         */ event.dataTransfer.setData((0, _elementAdapterNativeDataKey.elementAdapterNativeDataKey), '');
                var payload = {
                    element: entry.element,
                    dragHandle: (_entry$dragHandle2 = entry.dragHandle) !== null && _entry$dragHandle2 !== void 0 ? _entry$dragHandle2 : null,
                    data: (_entry$getInitialData3 = (_entry$getInitialData4 = entry.getInitialData) === null || _entry$getInitialData4 === void 0 ? void 0 : _entry$getInitialData4.call(entry, feedback)) !== null && _entry$getInitialData3 !== void 0 ? _entry$getInitialData3 : {}
                };
                var dragType = {
                    type: 'element',
                    payload: payload,
                    startedFrom: 'internal'
                };
                api.start({
                    event: event,
                    dragType: dragType
                });
            }
        }));
    },
    dispatchEventToSource: function dispatchEventToSource(_ref) {
        var _draggableRegistry$ge, _draggableRegistry$ge2;
        var eventName = _ref.eventName, payload = _ref.payload;
        // During a drag operation, a draggable can be:
        // - remounted with different functions
        // - removed completely
        // So we need to get the latest entry from the registry in order
        // to call the latest event functions
        (_draggableRegistry$ge = draggableRegistry.get(payload.source.element)) === null || _draggableRegistry$ge === void 0 || (_draggableRegistry$ge2 = _draggableRegistry$ge[eventName]) === null || _draggableRegistry$ge2 === void 0 || _draggableRegistry$ge2.call(_draggableRegistry$ge, // I cannot seem to get the types right here.
        // TS doesn't seem to like that one event can need `nativeSetDragImage`
        // @ts-expect-error
        payload);
    },
    onPostDispatch: honeyPotFix.getOnPostDispatch()
});
var dropTargetForElements = adapter.dropTarget;
var monitorForElements = adapter.monitor;
function draggable(args) {
    if (args.dragHandle && !args.element.contains(args.dragHandle)) // eslint-disable-next-line no-console
    console.warn('Drag handle element must be contained in draggable element', {
        element: args.element,
        dragHandle: args.dragHandle
    });
    var existing = draggableRegistry.get(args.element);
    if (existing) // eslint-disable-next-line no-console
    console.warn('You have already registered a `draggable` on the same element', {
        existing: existing,
        proposed: args
    });
    var cleanup = (0, _combine.combine)(// making the draggable register the adapter rather than drop targets
    // this is because you *must* have a draggable element to start a drag
    // but you _might_ not have any drop targets immediately
    // (You might create drop targets async)
    adapter.registerUsage(), addToRegistry(args), (0, _addAttribute.addAttribute)(args.element, {
        attribute: 'draggable',
        value: 'true'
    }));
    // Wrapping in `once` to prevent unexpected side effects if consumers call
    // the clean up function multiple times.
    return (0, _once.once)(cleanup);
}

},{"@babel/runtime/helpers/slicedToArray":"6AJmz","bind-event-listener":"4KK82","../honey-pot-fix/get-element-from-point-without-honey-pot":"guBim","../honey-pot-fix/make-honey-pot-fix":"lOoGL","../make-adapter/make-adapter":"11Hyo","../public-utils/combine":"6Jv8H","../public-utils/once":"givnC","../util/add-attribute":"fo9xu","../util/android":"g8Y2K","../util/get-input":"buIUM","../util/media-types/text-media-type":"6h7IL","../util/media-types/url-media-type":"h6AzT","./element-adapter-native-data-key":"lh6LV","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"guBim":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getElementFromPointWithoutHoneypot", ()=>getElementFromPointWithoutHoneypot);
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
var _isHoneyPotElement = require("./is-honey-pot-element");
function getElementFromPointWithoutHoneypot(client) {
    // eslint-disable-next-line no-restricted-syntax
    var _document$elementsFro = document.elementsFromPoint(client.x, client.y), _document$elementsFro2 = (0, _slicedToArrayDefault.default)(_document$elementsFro, 2), top = _document$elementsFro2[0], second = _document$elementsFro2[1];
    if (!top) return null;
    if ((0, _isHoneyPotElement.isHoneyPotElement)(top)) return second !== null && second !== void 0 ? second : null;
    return top;
}

},{"@babel/runtime/helpers/slicedToArray":"6AJmz","./is-honey-pot-element":"gSOX9","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gSOX9":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "isHoneyPotElement", ()=>isHoneyPotElement);
var _honeyPotDataAttribute = require("./honey-pot-data-attribute");
function isHoneyPotElement(target) {
    return target instanceof Element && target.hasAttribute((0, _honeyPotDataAttribute.honeyPotDataAttribute));
}

},{"./honey-pot-data-attribute":"kcte8","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"kcte8":[function(require,module,exports,__globalThis) {
// pulling this into a separate file so adapter(s) that don't
// need the honey pot can pay as little as possible for it.
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "honeyPotDataAttribute", ()=>honeyPotDataAttribute);
var honeyPotDataAttribute = 'data-pdnd-honey-pot';

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"lOoGL":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "makeHoneyPotFix", ()=>makeHoneyPotFix);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
var _bindEventListener = require("bind-event-listener");
var _maxZIndex = require("../util/max-z-index");
var _honeyPotDataAttribute = require("./honey-pot-data-attribute");
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            (0, _definePropertyDefault.default)(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
var honeyPotSize = 2;
var halfHoneyPotSize = honeyPotSize / 2;
/**
 * `clientX` and `clientY` can be in sub pixels (eg `2.332`)
 * However, browser hitbox testing is commonly do to the closest pixel.
 *
 * → https://issues.chromium.org/issues/40940531
 *
 * To be sure that the honey pot will be over the `client` position,
 * we `.floor()` `clientX` and`clientY` and then make it `2px` in size.
 **/ function floorToClosestPixel(point) {
    return {
        x: Math.floor(point.x),
        y: Math.floor(point.y)
    };
}
/**
 * We want to make sure the honey pot sits around the users position.
 * This seemed to be the most resilient while testing.
 */ function pullBackByHalfHoneyPotSize(point) {
    return {
        x: point.x - halfHoneyPotSize,
        y: point.y - halfHoneyPotSize
    };
}
/**
 * Prevent the honey pot from changing the window size.
 * This is super unlikely to occur, but just being safe.
 */ function preventGoingBackwardsOffScreen(point) {
    return {
        x: Math.max(point.x, 0),
        y: Math.max(point.y, 0)
    };
}
/**
 * Prevent the honey pot from changing the window size.
 * This is super unlikely to occur, but just being safe.
 */ function preventGoingForwardsOffScreen(point) {
    return {
        x: Math.min(point.x, window.innerWidth - honeyPotSize),
        y: Math.min(point.y, window.innerHeight - honeyPotSize)
    };
}
/**
 * Create a `2x2` `DOMRect` around the `client` position
 */ function getHoneyPotRectFor(_ref) {
    var client = _ref.client;
    var point = preventGoingForwardsOffScreen(preventGoingBackwardsOffScreen(pullBackByHalfHoneyPotSize(floorToClosestPixel(client))));
    // When debugging, it is helpful to
    // make this element a bit bigger
    return DOMRect.fromRect({
        x: point.x,
        y: point.y,
        width: honeyPotSize,
        height: honeyPotSize
    });
}
function getRectStyles(_ref2) {
    var clientRect = _ref2.clientRect;
    return {
        left: "".concat(clientRect.left, "px"),
        top: "".concat(clientRect.top, "px"),
        width: "".concat(clientRect.width, "px"),
        height: "".concat(clientRect.height, "px")
    };
}
function isWithin(_ref3) {
    var client = _ref3.client, clientRect = _ref3.clientRect;
    return(// is within horizontal bounds
    client.x >= clientRect.x && client.x <= clientRect.x + clientRect.width && // is within vertical bounds
    client.y >= clientRect.y && client.y <= clientRect.y + clientRect.height);
}
/**
 * The honey pot fix is designed to get around a painful bug in all browsers.
 *
 * [Overview](https://www.youtube.com/watch?v=udE9qbFTeQg)
 *
 * **Background**
 *
 * When a drag starts, browsers incorrectly think that the users pointer is
 * still depressed where the drag started. Any element that goes under this position
 * will be entered into, causing `"mouseenter"` events and `":hover"` styles to be applied.
 *
 * _This is a violation of the spec_
 *
 * > "From the moment that the user agent is to initiate the drag-and-drop operation,
 * > until the end 	of the drag-and-drop operation, device input events
 * > (e.g. mouse and keyboard events) must be suppressed."
 * >
 * > - https://html.spec.whatwg.org/multipage/dnd.html#drag-and-drop-processing-model
 *
 * _Some impacts_
 *
 * - `":hover"` styles being applied where they shouldn't (looks messy)
 * - components such as tooltips responding to `"mouseenter"` can show during a drag,
 *   and on an element the user isn't even over
 *
 * Bug: https://issues.chromium.org/issues/41129937
 *
 * **Honey pot fix**
 *
 * 1. Create an element where the browser thinks the depressed pointer is
 *    to absorb the incorrect pointer events
 * 2. Remove that element when it is no longer needed
 */ function mountHoneyPot(_ref4) {
    var initial = _ref4.initial;
    var element = document.createElement('div');
    element.setAttribute((0, _honeyPotDataAttribute.honeyPotDataAttribute), 'true');
    // can shift during the drag thanks to Firefox
    var clientRect = getHoneyPotRectFor({
        client: initial
    });
    Object.assign(element.style, _objectSpread(_objectSpread({
        // Setting a background color explicitly to avoid any inherited styles.
        // Looks like this could be `opacity: 0`, but worried that _might_
        // cause the element to be ignored on some platforms.
        // When debugging, set backgroundColor to something like "red".
        backgroundColor: 'transparent',
        position: 'fixed',
        // Being explicit to avoid inheriting styles
        padding: 0,
        margin: 0,
        boxSizing: 'border-box'
    }, getRectStyles({
        clientRect: clientRect
    })), {}, {
        // We want this element to absorb pointer events,
        // it's kind of the whole point 😉
        pointerEvents: 'auto',
        // Want to make sure the honey pot is top of everything else.
        // Don't need to worry about native drag previews, as they will
        // have been rendered (and removed) before the honey pot is rendered
        zIndex: (0, _maxZIndex.maxZIndex)
    }));
    document.body.appendChild(element);
    /**
   *  🦊 In firefox we can get `"pointermove"` events after the drag
   * has started, which is a spec violation.
   * The final `"pointermove"` will reveal where the "depressed" position
   * is for our honey pot fix.
   */ var unbindPointerMove = (0, _bindEventListener.bind)(window, {
        type: 'pointermove',
        listener: function listener(event) {
            var client = {
                x: event.clientX,
                y: event.clientY
            };
            clientRect = getHoneyPotRectFor({
                client: client
            });
            Object.assign(element.style, getRectStyles({
                clientRect: clientRect
            }));
        },
        // using capture so we are less likely to be impacted by event stopping
        options: {
            capture: true
        }
    });
    return function finish(_ref5) {
        var current = _ref5.current;
        // Don't need this any more
        unbindPointerMove();
        // If the user is hover the honey pot, we remove it
        // so that the user can continue to interact with the page normally.
        if (isWithin({
            client: current,
            clientRect: clientRect
        })) {
            element.remove();
            return;
        }
        function cleanup() {
            unbindPostDragEvents();
            element.remove();
        }
        var unbindPostDragEvents = (0, _bindEventListener.bindAll)(window, [
            {
                type: 'pointerdown',
                listener: cleanup
            },
            {
                type: 'pointermove',
                listener: cleanup
            },
            {
                type: 'focusin',
                listener: cleanup
            },
            {
                type: 'focusout',
                listener: cleanup
            },
            // a 'pointerdown' should happen before 'dragstart', but just being super safe
            {
                type: 'dragstart',
                listener: cleanup
            },
            // if the user has dragged something out of the window
            // and then is dragging something back into the window
            // the first events we will see are "dragenter" (and then "dragover").
            // So if we see any of these we need to clear the post drag fix.
            {
                type: 'dragenter',
                listener: cleanup
            },
            {
                type: 'dragover',
                listener: cleanup
            }
        ], {
            // Using `capture` so less likely to be impacted by other code stopping events
            capture: true
        });
    };
}
function makeHoneyPotFix() {
    var latestPointerMove = null;
    function bindEvents() {
        // For sanity, only collecting this value from when events are first bound.
        // This prevents the case where a super old "pointermove" could be used
        // from a prior interaction.
        latestPointerMove = null;
        return (0, _bindEventListener.bind)(window, {
            type: 'pointermove',
            listener: function listener(event) {
                latestPointerMove = {
                    x: event.clientX,
                    y: event.clientY
                };
            },
            // listening for pointer move in capture phase
            // so we are less likely to be impacted by events being stopped.
            options: {
                capture: true
            }
        });
    }
    function getOnPostDispatch() {
        var finish = null;
        return function onPostEvent(_ref6) {
            var eventName = _ref6.eventName, payload = _ref6.payload;
            // We are adding the honey pot `onDragStart` so we don't
            // impact the creation of the native drag preview.
            if (eventName === 'onDragStart') {
                var input = payload.location.initial.input;
                // Sometimes there will be no latest "pointermove" (eg iOS).
                // In which case, we use the start position of the drag.
                var initial = latestPointerMove !== null && latestPointerMove !== void 0 ? latestPointerMove : {
                    x: input.clientX,
                    y: input.clientY
                };
                // Don't need to defensively call `finish()` as `onDrop` from
                // one interaction is guaranteed to be called before `onDragStart`
                // of the next.
                finish = mountHoneyPot({
                    initial: initial
                });
            }
            if (eventName === 'onDrop') {
                var _finish;
                var _input = payload.location.current.input;
                (_finish = finish) === null || _finish === void 0 || _finish({
                    current: {
                        x: _input.clientX,
                        y: _input.clientY
                    }
                });
                finish = null;
                // this interaction is finished, we want to use
                // the latest "pointermove" for each interaction
                latestPointerMove = null;
            }
        };
    }
    return {
        bindEvents: bindEvents,
        getOnPostDispatch: getOnPostDispatch
    };
}

},{"@babel/runtime/helpers/defineProperty":"4x6r7","bind-event-listener":"4KK82","../util/max-z-index":"lUNnq","./honey-pot-data-attribute":"kcte8","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"lUNnq":[function(require,module,exports,__globalThis) {
// Maximum possible z-index
// https://stackoverflow.com/questions/491052/minimum-and-maximum-value-of-z-index
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "maxZIndex", ()=>maxZIndex);
var maxZIndex = 2147483647;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"11Hyo":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "makeAdapter", ()=>makeAdapter);
var _lifecycleManager = require("../ledger/lifecycle-manager");
var _usageLedger = require("../ledger/usage-ledger");
var _makeDropTarget = require("./make-drop-target");
var _makeMonitor = require("./make-monitor");
function makeAdapter(_ref) {
    var typeKey = _ref.typeKey, mount = _ref.mount, dispatchEventToSource = _ref.dispatchEventToSource, onPostDispatch = _ref.onPostDispatch, defaultDropEffect = _ref.defaultDropEffect;
    var monitorAPI = (0, _makeMonitor.makeMonitor)();
    var dropTargetAPI = (0, _makeDropTarget.makeDropTarget)({
        typeKey: typeKey,
        defaultDropEffect: defaultDropEffect
    });
    function dispatchEvent(args) {
        // 1. forward the event to source
        dispatchEventToSource === null || dispatchEventToSource === void 0 || dispatchEventToSource(args);
        // 2. forward the event to relevant dropTargets
        dropTargetAPI.dispatchEvent(args);
        // 3. forward event to monitors
        monitorAPI.dispatchEvent(args);
        // 4. post consumer dispatch (used for honey pot fix)
        onPostDispatch === null || onPostDispatch === void 0 || onPostDispatch(args);
    }
    function start(_ref2) {
        var event = _ref2.event, dragType = _ref2.dragType;
        (0, _lifecycleManager.lifecycle).start({
            event: event,
            dragType: dragType,
            getDropTargetsOver: dropTargetAPI.getIsOver,
            dispatchEvent: dispatchEvent
        });
    }
    function registerUsage() {
        function mountAdapter() {
            var api = {
                canStart: (0, _lifecycleManager.lifecycle).canStart,
                start: start
            };
            return mount(api);
        }
        return (0, _usageLedger.register)({
            typeKey: typeKey,
            mount: mountAdapter
        });
    }
    return {
        registerUsage: registerUsage,
        dropTarget: dropTargetAPI.dropTargetForConsumers,
        monitor: monitorAPI.monitorForConsumers
    };
}

},{"../ledger/lifecycle-manager":"fuuGt","../ledger/usage-ledger":"hakvf","./make-drop-target":"8fWHr","./make-monitor":"8ovWA","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fuuGt":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "lifecycle", ()=>lifecycle);
var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");
var _toConsumableArrayDefault = parcelHelpers.interopDefault(_toConsumableArray);
var _bindEventListener = require("bind-event-listener");
var _getElementFromPointWithoutHoneyPot = require("../honey-pot-fix/get-element-from-point-without-honey-pot");
var _isHoneyPotElement = require("../honey-pot-fix/is-honey-pot-element");
var _isLeavingWindow = require("../util/changing-window/is-leaving-window");
var _detectBrokenDrag = require("../util/detect-broken-drag");
var _getInput = require("../util/get-input");
var _dispatchConsumerEvent = require("./dispatch-consumer-event");
var globalState = {
    isActive: false
};
function canStart() {
    return !globalState.isActive;
}
function getNativeSetDragImage(event) {
    if (event.dataTransfer) // need to use `.bind` as `setDragImage` is required
    // to be run with `event.dataTransfer` as the "this" context
    return event.dataTransfer.setDragImage.bind(event.dataTransfer);
    return null;
}
function hasHierarchyChanged(_ref) {
    var current = _ref.current, next = _ref.next;
    if (current.length !== next.length) return true;
    // not checking stickiness, data or dropEffect,
    // just whether the hierarchy has changed
    for(var i = 0; i < current.length; i++){
        if (current[i].element !== next[i].element) return true;
    }
    return false;
}
function start(_ref2) {
    var event = _ref2.event, dragType = _ref2.dragType, getDropTargetsOver = _ref2.getDropTargetsOver, dispatchEvent = _ref2.dispatchEvent;
    if (!canStart()) return;
    var initial = getStartLocation({
        event: event,
        dragType: dragType,
        getDropTargetsOver: getDropTargetsOver
    });
    globalState.isActive = true;
    var state = {
        current: initial
    };
    // Setting initial drop effect for the drag
    setDropEffectOnEvent({
        event: event,
        current: initial.dropTargets
    });
    var dispatch = (0, _dispatchConsumerEvent.makeDispatch)({
        source: dragType.payload,
        dispatchEvent: dispatchEvent,
        initial: initial
    });
    function updateState(next) {
        // only looking at whether hierarchy has changed to determine whether something as 'changed'
        var hasChanged = hasHierarchyChanged({
            current: state.current.dropTargets,
            next: next.dropTargets
        });
        // Always updating the state to include latest data, dropEffect and stickiness
        // Only updating consumers if the hierarchy has changed in some way
        // Consumers can get the latest data by using `onDrag`
        state.current = next;
        if (hasChanged) dispatch.dragUpdate({
            current: state.current
        });
    }
    function onUpdateEvent(event) {
        var input = (0, _getInput.getInput)(event);
        // If we are over the honey pot, we need to get the element
        // that the user would have been over if not for the honey pot
        var target = (0, _isHoneyPotElement.isHoneyPotElement)(event.target) ? (0, _getElementFromPointWithoutHoneyPot.getElementFromPointWithoutHoneypot)({
            x: input.clientX,
            y: input.clientY
        }) : event.target;
        var nextDropTargets = getDropTargetsOver({
            target: target,
            input: input,
            source: dragType.payload,
            current: state.current.dropTargets
        });
        if (nextDropTargets.length) {
            // 🩸 must call `event.preventDefault()` to allow a browser drop to occur
            event.preventDefault();
            setDropEffectOnEvent({
                event: event,
                current: nextDropTargets
            });
        }
        updateState({
            dropTargets: nextDropTargets,
            input: input
        });
    }
    function cancel() {
        // The spec behaviour is that when a drag is cancelled, or when dropping on no drop targets,
        // a "dragleave" event is fired on the active drop target before a "dragend" event.
        // We are replicating that behaviour in `cancel` if there are any active drop targets to
        // ensure consistent behaviour.
        //
        // Note: When cancelling, or dropping on no drop targets, a "dragleave" event
        // will have already cleared the dropTargets to `[]` (as that particular "dragleave" has a `relatedTarget` of `null`)
        if (state.current.dropTargets.length) updateState({
            dropTargets: [],
            input: state.current.input
        });
        dispatch.drop({
            current: state.current,
            updatedSourcePayload: null
        });
        finish();
    }
    function finish() {
        globalState.isActive = false;
        unbindEvents();
    }
    var unbindEvents = (0, _bindEventListener.bindAll)(window, [
        {
            // 👋 Note: we are repurposing the `dragover` event as our `drag` event
            // this is because firefox does not publish pointer coordinates during
            // a `drag` event, but does for every other type of drag event
            // `dragover` fires on all elements that are being dragged over
            // Because we are binding to `window` - our `dragover` is effectively the same as a `drag`
            // 🦊😤
            type: 'dragover',
            listener: function listener(event) {
                // We need to regularly calculate the drop targets in order to allow:
                //  - dynamic `canDrop()` checks
                //  - rapid updating `getData()` calls to attach data in response to user input (eg for edge detection)
                // Sadly we cannot schedule inspecting changes resulting from this event
                // we need to be able to conditionally cancel the event with `event.preventDefault()`
                // to enable the correct native drop experience.
                // 1. check to see if anything has changed
                onUpdateEvent(event);
                // 2. let consumers know a move has occurred
                // This will include the latest 'input' values
                dispatch.drag({
                    current: state.current
                });
            }
        },
        {
            type: 'dragenter',
            listener: onUpdateEvent
        },
        {
            type: 'dragleave',
            listener: function listener(event) {
                if (!(0, _isLeavingWindow.isLeavingWindow)({
                    dragLeave: event
                })) return;
                /**
       * At this point we don't know if a drag is being cancelled,
       * or if a drag is leaving the `window`.
       *
       * Both have:
       *   1. "dragleave" (with `relatedTarget: null`)
       *   2. "dragend" (a "dragend" can occur when outside the `window`)
       *
       * **Clearing drop targets**
       *
       * For either case we are clearing the the drop targets
       *
       * - cancelling: we clear drop targets in `"dragend"` anyway
       * - leaving the `window`: we clear the drop targets (to clear stickiness)
       *
       * **Leaving the window and finishing the drag**
       *
       * _internal drags_
       *
       * - The drag continues when the user is outside the `window`
       *   and can resume if the user drags back over the `window`,
       *   or end when the user drops in an external `window`.
       * - We will get a `"dragend"`, or we can listen for other
       *   events to determine the drag is finished when the user re-enters the `window`).
       *
       * _external drags_
       *
       * - We conclude the drag operation.
       * - We have no idea if the user will drag back over the `window`,
       *   or if the drag ends elsewhere.
       * - We will create a new drag if the user re-enters the `window`.
       *
       * **Not updating `input`**
       *
       * 🐛 Bug[Chrome] the final `"dragleave"` has default input values (eg `clientX == 0`)
       * Workaround: intentionally not updating `input` in "dragleave"
       * rather than the users current input values
       * - [Conversation](https://twitter.com/alexandereardon/status/1642697633864241152)
       * - [Bug](https://bugs.chromium.org/p/chromium/issues/detail?id=1429937)
       **/ updateState({
                    input: state.current.input,
                    dropTargets: []
                });
                if (dragType.startedFrom === 'external') cancel();
            }
        },
        {
            // A "drop" can only happen if the browser allowed the drop
            type: 'drop',
            listener: function listener(event) {
                // Capture the final input.
                // We are capturing the final `input` for the
                // most accurate honey pot experience
                state.current = {
                    dropTargets: state.current.dropTargets,
                    input: (0, _getInput.getInput)(event)
                };
                /** If there are no drop targets, then we will get
       * a "drop" event if:
       * - `preventUnhandled()` is being used
       * - there is an unmanaged drop target (eg another library)
       * In these cases, it's up to the consumer
       * to handle the drop if it's not over one of our drop targets
       * - `preventUnhandled()` will cancel the "drop"
       * - unmanaged drop targets can handle the "drop" how they want to
       * We won't call `event.preventDefault()` in this call path */ if (!state.current.dropTargets.length) {
                    cancel();
                    return;
                }
                event.preventDefault();
                // applying the latest drop effect to the event
                setDropEffectOnEvent({
                    event: event,
                    current: state.current.dropTargets
                });
                dispatch.drop({
                    current: state.current,
                    // When dropping something native, we need to extract the latest
                    // `.items` from the "drop" event as it is now accessible
                    updatedSourcePayload: dragType.type === 'external' ? dragType.getDropPayload(event) : null
                });
                finish();
            }
        },
        {
            // "dragend" fires when on the drag source (eg a draggable element)
            // when the drag is finished.
            // "dragend" will fire after "drop" (if there was a successful drop)
            // "dragend" does not fire if the draggable source has been removed during the drag
            // or for external drag sources (eg files)
            // This "dragend" listener will not fire if there was a successful drop
            // as we will have already removed the event listener
            type: 'dragend',
            listener: function listener(event) {
                // In firefox, the position of the "dragend" event can
                // be a bit different to the last "dragover" event.
                // Updating the input so we can get the best possible
                // information for the honey pot.
                state.current = {
                    dropTargets: state.current.dropTargets,
                    input: (0, _getInput.getInput)(event)
                };
                cancel();
            }
        }
    ].concat((0, _toConsumableArrayDefault.default)((0, _detectBrokenDrag.getBindingsForBrokenDrags)({
        onDragEnd: cancel
    }))), // Once we have started a managed drag operation it is important that we see / own all drag events
    // We got one adoption bug pop up where some code was stopping (`event.stopPropagation()`)
    // all "drop" events in the bubble phase on the `document.body`.
    // This meant that we never saw the "drop" event.
    {
        capture: true
    });
    dispatch.start({
        nativeSetDragImage: getNativeSetDragImage(event)
    });
}
function setDropEffectOnEvent(_ref3) {
    var _current$;
    var event = _ref3.event, current = _ref3.current;
    // setting the `dropEffect` to be the innerMost drop targets dropEffect
    var innerMost = (_current$ = current[0]) === null || _current$ === void 0 ? void 0 : _current$.dropEffect;
    if (innerMost != null && event.dataTransfer) event.dataTransfer.dropEffect = innerMost;
}
function getStartLocation(_ref4) {
    var event = _ref4.event, dragType = _ref4.dragType, getDropTargetsOver = _ref4.getDropTargetsOver;
    var input = (0, _getInput.getInput)(event);
    // When dragging from outside of the browser,
    // the drag is not being sourced from any local drop targets
    if (dragType.startedFrom === 'external') return {
        input: input,
        dropTargets: []
    };
    var dropTargets = getDropTargetsOver({
        input: input,
        source: dragType.payload,
        target: event.target,
        current: []
    });
    return {
        input: input,
        dropTargets: dropTargets
    };
}
var lifecycle = {
    canStart: canStart,
    start: start
};

},{"@babel/runtime/helpers/toConsumableArray":"bCb5n","bind-event-listener":"4KK82","../honey-pot-fix/get-element-from-point-without-honey-pot":"guBim","../honey-pot-fix/is-honey-pot-element":"gSOX9","../util/changing-window/is-leaving-window":"7fzsy","../util/detect-broken-drag":"gUV8w","../util/get-input":"buIUM","./dispatch-consumer-event":"3p2ll","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"bCb5n":[function(require,module,exports,__globalThis) {
var arrayWithoutHoles = require("80b438c8f11ca70e");
var iterableToArray = require("4f1268a27b81f1fd");
var unsupportedIterableToArray = require("bfa7725fe5f724b");
var nonIterableSpread = require("24ae2b6222a85da6");
function _toConsumableArray(r) {
    return arrayWithoutHoles(r) || iterableToArray(r) || unsupportedIterableToArray(r) || nonIterableSpread();
}
module.exports = _toConsumableArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"80b438c8f11ca70e":"3Xl6v","4f1268a27b81f1fd":"02b3Z","bfa7725fe5f724b":"cFxnT","24ae2b6222a85da6":"aejXd"}],"3Xl6v":[function(require,module,exports,__globalThis) {
var arrayLikeToArray = require("d3a23041cb0f1512");
function _arrayWithoutHoles(r) {
    if (Array.isArray(r)) return arrayLikeToArray(r);
}
module.exports = _arrayWithoutHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{"d3a23041cb0f1512":"2QyYi"}],"02b3Z":[function(require,module,exports,__globalThis) {
function _iterableToArray(r) {
    if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
module.exports = _iterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"aejXd":[function(require,module,exports,__globalThis) {
function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
module.exports = _nonIterableSpread, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"7fzsy":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "isLeavingWindow", ()=>isLeavingWindow);
var _isFirefox = require("../is-firefox");
var _isSafari = require("../is-safari");
var _countEventsForSafari = require("./count-events-for-safari");
var _isFromAnotherWindow = require("./is-from-another-window");
function isLeavingWindow(_ref) {
    var dragLeave = _ref.dragLeave;
    var type = dragLeave.type, relatedTarget = dragLeave.relatedTarget;
    if (type !== 'dragleave') return false;
    if ((0, _isSafari.isSafari)()) return (0, _countEventsForSafari.isLeavingWindowInSafari)({
        dragLeave: dragLeave
    });
    // Standard check: if going to `null` we are leaving the `window`
    if (relatedTarget == null) return true;
    /**
   * 🦊 Exception: `iframe` in Firefox (`125.0`)
   *
   * Case 1: parent `window` → child `iframe`
   * `dragLeave.relatedTarget` is element _inside_ the child `iframe`
   * (foreign element)
   *
   * Case 2: child `iframe` → parent `window`
   * `dragLeave.relatedTarget` is the `iframe` in the parent `window`
   * (foreign element)
   */ if ((0, _isFirefox.isFirefox)()) return (0, _isFromAnotherWindow.isFromAnotherWindow)(relatedTarget);
    /**
   * 🌏 Exception: `iframe` in Chrome (`124.0`)
   *
   * Case 1: parent `window` → child `iframe`
   * `dragLeave.relatedTarget` is the `iframe` in the parent `window`
   *
   * Case 2: child `iframe` → parent `window`
   * `dragLeave.relatedTarget` is `null` *(standard check)*
   */ // Case 2
    // Using `instanceof` check as the element will be in the same `window`
    return relatedTarget instanceof HTMLIFrameElement;
}

},{"../is-firefox":"d5Xzn","../is-safari":"bLYXQ","./count-events-for-safari":"jVFVj","./is-from-another-window":"8y8Lr","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"d5Xzn":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "isFirefox", ()=>isFirefox);
var _once = require("../public-utils/once");
var isFirefox = (0, _once.once)(function isFirefox() {
    return navigator.userAgent.includes('Firefox');
});

},{"../public-utils/once":"givnC","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"givnC":[function(require,module,exports,__globalThis) {
/** Provide a function that you only ever want to be called a single time */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "once", ()=>once);
function once(fn) {
    var cache = null;
    return function wrapped() {
        if (!cache) {
            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++)args[_key] = arguments[_key];
            var result = fn.apply(this, args);
            cache = {
                result: result
            };
        }
        return cache.result;
    };
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"bLYXQ":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "isSafari", ()=>isSafari);
var _once = require("../public-utils/once");
var isSafari = (0, _once.once)(function isSafari() {
    var _navigator = navigator, userAgent = _navigator.userAgent;
    return userAgent.includes('AppleWebKit') && !userAgent.includes('Chrome');
});

},{"../public-utils/once":"givnC","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"jVFVj":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "isEnteringWindowInSafari", ()=>isEnteringWindowInSafari);
parcelHelpers.export(exports, "isLeavingWindowInSafari", ()=>isLeavingWindowInSafari);
var _bindEventListener = require("bind-event-listener");
var _isSafari = require("../is-safari");
/* For "dragenter" events, the browser should set `relatedTarget` to the previous element.
 * For external drag operations, our first "dragenter" event should have a `event.relatedTarget` of `null`.
 *
 *  Unfortunately in Safari `event.relatedTarget` is *always* set to `null`
 *  Safari bug: https://bugs.webkit.org/show_bug.cgi?id=242627
 *  To work around this we count "dragenter" and "dragleave" events */ // Using symbols for event properties so we don't clash with
// anything on the `event` object
var symbols = {
    isLeavingWindow: Symbol('leaving'),
    isEnteringWindow: Symbol('entering')
};
function isEnteringWindowInSafari(_ref) {
    var dragEnter = _ref.dragEnter;
    if (!(0, _isSafari.isSafari)()) return false;
    return dragEnter.hasOwnProperty(symbols.isEnteringWindow);
}
function isLeavingWindowInSafari(_ref2) {
    var dragLeave = _ref2.dragLeave;
    if (!(0, _isSafari.isSafari)()) return false;
    return dragLeave.hasOwnProperty(symbols.isLeavingWindow);
}
(function fixSafari() {
    // Don't do anything when server side rendering
    if (typeof window === 'undefined') return;
    if (!(0, _isSafari.isSafari)()) return;
    function getInitialState() {
        return {
            enterCount: 0,
            isOverWindow: false
        };
    }
    var state = getInitialState();
    function resetState() {
        state = getInitialState();
    }
    // These event listeners are bound _forever_ and _never_ removed
    // We don't bother cleaning up these event listeners (for now)
    // as this workaround is only for Safari
    // This is how the event count works:
    //
    // lift (+1 enterCount)
    // - dragstart(draggable) [enterCount: 0]
    // - dragenter(draggable) [enterCount: 1]
    // leaving draggable (+0 enterCount)
    // - dragenter(document.body) [enterCount: 2]
    // - dragleave(draggable) [enterCount: 1]
    // leaving window (-1 enterCount)
    // - dragleave(document.body) [enterCount: 0] {leaving the window}
    // Things to note:
    // - dragenter and dragleave bubble
    // - the first dragenter when entering a window might not be on `window`
    //   - it could be on an element that is pressed up against the window
    //   - (so we cannot rely on `event.target` values)
    (0, _bindEventListener.bindAll)(window, [
        {
            type: 'dragstart',
            listener: function listener() {
                state.enterCount = 0;
                // drag start occurs in the source window
                state.isOverWindow = true;
            // When a drag first starts it will also trigger a "dragenter" on the draggable element
            }
        },
        {
            type: 'drop',
            listener: resetState
        },
        {
            type: 'dragend',
            listener: resetState
        },
        {
            type: 'dragenter',
            listener: function listener(event) {
                if (!state.isOverWindow && state.enterCount === 0) // Patching the `event` object
                // The `event` object is shared with all event listeners for the event
                // @ts-expect-error: adding property to the event object
                event[symbols.isEnteringWindow] = true;
                state.isOverWindow = true;
                state.enterCount++;
            }
        },
        {
            type: 'dragleave',
            listener: function listener(event) {
                state.enterCount--;
                if (state.isOverWindow && state.enterCount === 0) {
                    // Patching the `event` object as it is shared with all event listeners
                    // The `event` object is shared with all event listeners for the event
                    // @ts-expect-error: adding property to the event object
                    event[symbols.isLeavingWindow] = true;
                    state.isOverWindow = false;
                }
            }
        }
    ], // using `capture: true` so that adding event listeners
    // in bubble phase will have the correct symbols
    {
        capture: true
    });
})();

},{"bind-event-listener":"4KK82","../is-safari":"bLYXQ","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"8y8Lr":[function(require,module,exports,__globalThis) {
/**
 * Does the `EventTarget` look like a `Node` based on "duck typing".
 *
 * Helpful when the `Node` might be outside of the current document
 * so we cannot to an `target instanceof Node` check.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Is an `EventTarget` a `Node` from another `window`?
 */ parcelHelpers.export(exports, "isFromAnotherWindow", ()=>isFromAnotherWindow);
function isNodeLike(target) {
    return 'nodeName' in target;
}
function isFromAnotherWindow(eventTarget) {
    return isNodeLike(eventTarget) && eventTarget.ownerDocument !== document;
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gUV8w":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getBindingsForBrokenDrags", ()=>getBindingsForBrokenDrags);
function getBindingsForBrokenDrags(_ref) {
    var onDragEnd = _ref.onDragEnd;
    return [
        // ## Detecting drag ending for removed draggables
        //
        // If a draggable element is removed during a drag and the user drops:
        // 1. if over a valid drop target: we get a "drop" event to know the drag is finished
        // 2. if not over a valid drop target (or cancelled): we get nothing
        // The "dragend" event will not fire on the source draggable if it has been
        // removed from the DOM.
        // So we need to figure out if a drag operation has finished by looking at other events
        // We can do this by looking at other events
        // ### First detection: "pointermove" events
        // 1. "pointermove" events cannot fire during a drag and drop operation
        // according to the spec. So if we get a "pointermove" it means that
        // the drag and drop operations has finished. So if we get a "pointermove"
        // we know that the drag is over
        // 2. 🦊😤 Drag and drop operations are _supposed_ to suppress
        // other pointer events. However, firefox will allow a few
        // pointer event to get through after a drag starts.
        // The most I've seen is 3
        {
            type: 'pointermove',
            listener: function() {
                var callCount = 0;
                return function listener() {
                    // Using 20 as it is far bigger than the most observed (3)
                    if (callCount < 20) {
                        callCount++;
                        return;
                    }
                    onDragEnd();
                };
            }()
        },
        // ### Second detection: "pointerdown" events
        // If we receive this event then we know that a drag operation has finished
        // and potentially another one is about to start.
        // Note: `pointerdown` fires on all browsers / platforms before "dragstart"
        {
            type: 'pointerdown',
            listener: onDragEnd
        }
    ];
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"buIUM":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getInput", ()=>getInput);
function getInput(event) {
    return {
        altKey: event.altKey,
        button: event.button,
        buttons: event.buttons,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        clientX: event.clientX,
        clientY: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY
    };
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"3p2ll":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "makeDispatch", ()=>makeDispatch);
var _rafSchd = require("raf-schd");
var _rafSchdDefault = parcelHelpers.interopDefault(_rafSchd);
var scheduleOnDrag = (0, _rafSchdDefault.default)(function(fn) {
    return fn();
});
var dragStart = function() {
    var scheduled = null;
    function schedule(fn) {
        var frameId = requestAnimationFrame(function() {
            scheduled = null;
            fn();
        });
        scheduled = {
            frameId: frameId,
            fn: fn
        };
    }
    function flush() {
        if (scheduled) {
            cancelAnimationFrame(scheduled.frameId);
            scheduled.fn();
            scheduled = null;
        }
    }
    return {
        schedule: schedule,
        flush: flush
    };
}();
function makeDispatch(_ref) {
    var source = _ref.source, initial = _ref.initial, dispatchEvent = _ref.dispatchEvent;
    var previous = {
        dropTargets: []
    };
    function safeDispatch(args) {
        dispatchEvent(args);
        previous = {
            dropTargets: args.payload.location.current.dropTargets
        };
    }
    var dispatch = {
        start: function start(_ref2) {
            var nativeSetDragImage = _ref2.nativeSetDragImage;
            // Ensuring that both `onGenerateDragPreview` and `onDragStart` get the same location.
            // We do this so that `previous` is`[]` in `onDragStart` (which is logical)
            var location = {
                current: initial,
                previous: previous,
                initial: initial
            };
            // a `onGenerateDragPreview` does _not_ add another entry for `previous`
            // onDragPreview
            safeDispatch({
                eventName: 'onGenerateDragPreview',
                payload: {
                    source: source,
                    location: location,
                    nativeSetDragImage: nativeSetDragImage
                }
            });
            dragStart.schedule(function() {
                safeDispatch({
                    eventName: 'onDragStart',
                    payload: {
                        source: source,
                        location: location
                    }
                });
            });
        },
        dragUpdate: function dragUpdate(_ref3) {
            var current = _ref3.current;
            dragStart.flush();
            scheduleOnDrag.cancel();
            safeDispatch({
                eventName: 'onDropTargetChange',
                payload: {
                    source: source,
                    location: {
                        initial: initial,
                        previous: previous,
                        current: current
                    }
                }
            });
        },
        drag: function drag(_ref4) {
            var current = _ref4.current;
            scheduleOnDrag(function() {
                dragStart.flush();
                var location = {
                    initial: initial,
                    previous: previous,
                    current: current
                };
                safeDispatch({
                    eventName: 'onDrag',
                    payload: {
                        source: source,
                        location: location
                    }
                });
            });
        },
        drop: function drop(_ref5) {
            var current = _ref5.current, updatedSourcePayload = _ref5.updatedSourcePayload;
            dragStart.flush();
            scheduleOnDrag.cancel();
            safeDispatch({
                eventName: 'onDrop',
                payload: {
                    source: updatedSourcePayload !== null && updatedSourcePayload !== void 0 ? updatedSourcePayload : source,
                    location: {
                        current: current,
                        previous: previous,
                        initial: initial
                    }
                }
            });
        }
    };
    return dispatch;
}

},{"raf-schd":"k6uDM","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"k6uDM":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var rafSchd = function rafSchd(fn) {
    var lastArgs = [];
    var frameId = null;
    var wrapperFn = function wrapperFn() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++)args[_key] = arguments[_key];
        lastArgs = args;
        if (frameId) return;
        frameId = requestAnimationFrame(function() {
            frameId = null;
            fn.apply(void 0, lastArgs);
        });
    };
    wrapperFn.cancel = function() {
        if (!frameId) return;
        cancelAnimationFrame(frameId);
        frameId = null;
    };
    return wrapperFn;
};
exports.default = rafSchd;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"hakvf":[function(require,module,exports,__globalThis) {
// Extending `Map` to allow us to link Key and Values together
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "register", ()=>register);
var ledger = new Map();
function registerUsage(_ref) {
    var typeKey = _ref.typeKey, mount = _ref.mount;
    var entry = ledger.get(typeKey);
    if (entry) {
        entry.usageCount++;
        return entry;
    }
    var initial = {
        typeKey: typeKey,
        unmount: mount(),
        usageCount: 1
    };
    ledger.set(typeKey, initial);
    return initial;
}
function register(args) {
    var entry = registerUsage(args);
    return function unregister() {
        entry.usageCount--;
        if (entry.usageCount > 0) return;
        // Only a single usage left, remove it
        entry.unmount();
        ledger.delete(args.typeKey);
    };
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"8fWHr":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "makeDropTarget", ()=>makeDropTarget);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");
var _toConsumableArrayDefault = parcelHelpers.interopDefault(_toConsumableArray);
var _combine = require("../public-utils/combine");
var _once = require("../public-utils/once");
var _addAttribute = require("../util/add-attribute");
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            (0, _definePropertyDefault.default)(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
function _createForOfIteratorHelper(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (!t) {
        if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
            t && (r = t);
            var _n = 0, F = function F() {};
            return {
                s: F,
                n: function n() {
                    return _n >= r.length ? {
                        done: !0
                    } : {
                        done: !1,
                        value: r[_n++]
                    };
                },
                e: function e(r) {
                    throw r;
                },
                f: F
            };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o, a = !0, u = !1;
    return {
        s: function s() {
            t = t.call(r);
        },
        n: function n() {
            var r = t.next();
            return a = r.done, r;
        },
        e: function e(r) {
            u = !0, o = r;
        },
        f: function f() {
            try {
                a || null == t.return || t.return();
            } finally{
                if (u) throw o;
            }
        }
    };
}
function _unsupportedIterableToArray(r, a) {
    if (r) {
        if ("string" == typeof r) return _arrayLikeToArray(r, a);
        var t = ({}).toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
}
function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for(var e = 0, n = Array(a); e < a; e++)n[e] = r[e];
    return n;
}
function copyReverse(array) {
    return array.slice(0).reverse();
}
function makeDropTarget(_ref) {
    var typeKey = _ref.typeKey, defaultDropEffect = _ref.defaultDropEffect;
    var registry = new WeakMap();
    var dropTargetDataAtt = "data-drop-target-for-".concat(typeKey);
    var dropTargetSelector = "[".concat(dropTargetDataAtt, "]");
    function addToRegistry(args) {
        registry.set(args.element, args);
        return function() {
            return registry.delete(args.element);
        };
    }
    function dropTargetForConsumers(args) {
        var existing = registry.get(args.element);
        if (existing) // eslint-disable-next-line no-console
        console.warn("You have already registered a [".concat(typeKey, "] dropTarget on the same element"), {
            existing: existing,
            proposed: args
        });
        if (args.element instanceof HTMLIFrameElement) // eslint-disable-next-line no-console
        console.warn("\n            We recommend not registering <iframe> elements as drop targets\n            as it can result in some strange browser event ordering.\n          " // Removing newlines and excessive whitespace
        .replace(/\s{2,}/g, ' ').trim());
        var cleanup = (0, _combine.combine)((0, _addAttribute.addAttribute)(args.element, {
            attribute: dropTargetDataAtt,
            value: 'true'
        }), addToRegistry(args));
        // Wrapping in `once` to prevent unexpected side effects if consumers call
        // the clean up function multiple times.
        return (0, _once.once)(cleanup);
    }
    function getActualDropTargets(_ref2) {
        var _args$getData, _args$getData2, _args$getDropEffect, _args$getDropEffect2;
        var source = _ref2.source, target = _ref2.target, input = _ref2.input, _ref2$result = _ref2.result, result = _ref2$result === void 0 ? [] : _ref2$result;
        if (target == null) return result;
        if (!(target instanceof Element)) {
            // For "text-selection" drags, the original `target`
            // is not an `Element`, so we need to start looking from
            // the parent element
            if (target instanceof Node) return getActualDropTargets({
                source: source,
                target: target.parentElement,
                input: input,
                result: result
            });
            // not sure what we are working with,
            // so we can exit.
            return result;
        }
        var closest = target.closest(dropTargetSelector);
        // Cannot find anything else
        if (closest == null) return result;
        var args = registry.get(closest);
        // error: something had a dropTargetSelector but we could not
        // find a match. For now, failing silently
        if (args == null) return result;
        var feedback = {
            input: input,
            source: source,
            element: args.element
        };
        // if dropping is not allowed, skip this drop target
        // and continue looking up the DOM tree
        if (args.canDrop && !args.canDrop(feedback)) return getActualDropTargets({
            source: source,
            target: args.element.parentElement,
            input: input,
            result: result
        });
        // calculate our new record
        var data = (_args$getData = (_args$getData2 = args.getData) === null || _args$getData2 === void 0 ? void 0 : _args$getData2.call(args, feedback)) !== null && _args$getData !== void 0 ? _args$getData : {};
        var dropEffect = (_args$getDropEffect = (_args$getDropEffect2 = args.getDropEffect) === null || _args$getDropEffect2 === void 0 ? void 0 : _args$getDropEffect2.call(args, feedback)) !== null && _args$getDropEffect !== void 0 ? _args$getDropEffect : defaultDropEffect;
        var record = {
            data: data,
            element: args.element,
            dropEffect: dropEffect,
            // we are collecting _actual_ drop targets, so these are
            // being applied _not_ due to stickiness
            isActiveDueToStickiness: false
        };
        return getActualDropTargets({
            source: source,
            target: args.element.parentElement,
            input: input,
            // Using bubble ordering. Same ordering as `event.getPath()`
            result: [].concat((0, _toConsumableArrayDefault.default)(result), [
                record
            ])
        });
    }
    function notifyCurrent(_ref3) {
        var eventName = _ref3.eventName, payload = _ref3.payload;
        var _iterator = _createForOfIteratorHelper(payload.location.current.dropTargets), _step;
        try {
            for(_iterator.s(); !(_step = _iterator.n()).done;){
                var _entry$eventName;
                var record = _step.value;
                var entry = registry.get(record.element);
                var args = _objectSpread(_objectSpread({}, payload), {}, {
                    self: record
                });
                entry === null || entry === void 0 || (_entry$eventName = entry[eventName]) === null || _entry$eventName === void 0 || _entry$eventName.call(entry, // I cannot seem to get the types right here.
                // TS doesn't seem to like that one event can need `nativeSetDragImage`
                // @ts-expect-error
                args);
            }
        } catch (err) {
            _iterator.e(err);
        } finally{
            _iterator.f();
        }
    }
    var actions = {
        onGenerateDragPreview: notifyCurrent,
        onDrag: notifyCurrent,
        onDragStart: notifyCurrent,
        onDrop: notifyCurrent,
        onDropTargetChange: function onDropTargetChange(_ref4) {
            var payload = _ref4.payload;
            var isCurrent = new Set(payload.location.current.dropTargets.map(function(record) {
                return record.element;
            }));
            var visited = new Set();
            var _iterator2 = _createForOfIteratorHelper(payload.location.previous.dropTargets), _step2;
            try {
                for(_iterator2.s(); !(_step2 = _iterator2.n()).done;){
                    var _entry$onDropTargetCh;
                    var record = _step2.value;
                    visited.add(record.element);
                    var entry = registry.get(record.element);
                    var isOver = isCurrent.has(record.element);
                    var args = _objectSpread(_objectSpread({}, payload), {}, {
                        self: record
                    });
                    entry === null || entry === void 0 || (_entry$onDropTargetCh = entry.onDropTargetChange) === null || _entry$onDropTargetCh === void 0 || _entry$onDropTargetCh.call(entry, args);
                    // if we cannot find the drop target in the current array, then it has been left
                    if (!isOver) {
                        var _entry$onDragLeave;
                        entry === null || entry === void 0 || (_entry$onDragLeave = entry.onDragLeave) === null || _entry$onDragLeave === void 0 || _entry$onDragLeave.call(entry, args);
                    }
                }
            } catch (err) {
                _iterator2.e(err);
            } finally{
                _iterator2.f();
            }
            var _iterator3 = _createForOfIteratorHelper(payload.location.current.dropTargets), _step3;
            try {
                for(_iterator3.s(); !(_step3 = _iterator3.n()).done;){
                    var _entry$onDropTargetCh2, _entry$onDragEnter;
                    var _record = _step3.value;
                    // already published an update to this drop target
                    if (visited.has(_record.element)) continue;
                    // at this point we have a new drop target that is being entered into
                    var _args = _objectSpread(_objectSpread({}, payload), {}, {
                        self: _record
                    });
                    var _entry = registry.get(_record.element);
                    _entry === null || _entry === void 0 || (_entry$onDropTargetCh2 = _entry.onDropTargetChange) === null || _entry$onDropTargetCh2 === void 0 || _entry$onDropTargetCh2.call(_entry, _args);
                    _entry === null || _entry === void 0 || (_entry$onDragEnter = _entry.onDragEnter) === null || _entry$onDragEnter === void 0 || _entry$onDragEnter.call(_entry, _args);
                }
            } catch (err) {
                _iterator3.e(err);
            } finally{
                _iterator3.f();
            }
        }
    };
    function dispatchEvent(args) {
        actions[args.eventName](args);
    }
    function getIsOver(_ref5) {
        var source = _ref5.source, target = _ref5.target, input = _ref5.input, current = _ref5.current;
        var actual = getActualDropTargets({
            source: source,
            target: target,
            input: input
        });
        // stickiness is only relevant when we have less
        // drop targets than we did before
        if (actual.length >= current.length) return actual;
        // less 'actual' drop targets than before,
        // we need to see if 'stickiness' applies
        // An old drop target will continue to be dropped on if:
        // 1. it has the same parent
        // 2. nothing exists in it's previous index
        var lastCaptureOrdered = copyReverse(current);
        var actualCaptureOrdered = copyReverse(actual);
        var resultCaptureOrdered = [];
        for(var index = 0; index < lastCaptureOrdered.length; index++){
            var _argsForLast$getIsSti;
            var last = lastCaptureOrdered[index];
            var fresh = actualCaptureOrdered[index];
            // if a record is in the new index -> use that
            // it will have the latest data + dropEffect
            if (fresh != null) {
                resultCaptureOrdered.push(fresh);
                continue;
            }
            // At this point we have no drop target in the old spot
            // Check to see if we can use a previous sticky drop target
            // The "parent" is the one inside of `resultCaptureOrdered`
            // (the parent might be a drop target that was sticky)
            var parent = resultCaptureOrdered[index - 1];
            var lastParent = lastCaptureOrdered[index - 1];
            // Stickiness is based on parent relationships, so if the parent relationship has change
            // then we can stop our search
            if ((parent === null || parent === void 0 ? void 0 : parent.element) !== (lastParent === null || lastParent === void 0 ? void 0 : lastParent.element)) break;
            // We need to check whether the old drop target can still be dropped on
            var argsForLast = registry.get(last.element);
            // We cannot drop on a drop target that is no longer mounted
            if (!argsForLast) break;
            var feedback = {
                input: input,
                source: source,
                element: argsForLast.element
            };
            // We cannot drop on a drop target that no longer allows being dropped on
            if (argsForLast.canDrop && !argsForLast.canDrop(feedback)) break;
            // We cannot drop on a drop target that is no longer sticky
            if (!((_argsForLast$getIsSti = argsForLast.getIsSticky) !== null && _argsForLast$getIsSti !== void 0 && _argsForLast$getIsSti.call(argsForLast, feedback))) break;
            // Note: intentionally not recollecting `getData()` or `getDropEffect()`
            // Previous values for `data` and `dropEffect` will be borrowed
            // This is to prevent things like the 'closest edge' changing when
            // no longer over a drop target.
            // We could change our mind on this behaviour in the future
            resultCaptureOrdered.push(_objectSpread(_objectSpread({}, last), {}, {
                // making it clear to consumers this drop target is active due to stickiness
                isActiveDueToStickiness: true
            }));
        }
        // return bubble ordered result
        return copyReverse(resultCaptureOrdered);
    }
    return {
        dropTargetForConsumers: dropTargetForConsumers,
        getIsOver: getIsOver,
        dispatchEvent: dispatchEvent
    };
}

},{"@babel/runtime/helpers/defineProperty":"4x6r7","@babel/runtime/helpers/toConsumableArray":"bCb5n","../public-utils/combine":"6Jv8H","../public-utils/once":"givnC","../util/add-attribute":"fo9xu","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fo9xu":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "addAttribute", ()=>addAttribute);
function addAttribute(element, _ref) {
    var attribute = _ref.attribute, value = _ref.value;
    element.setAttribute(attribute, value);
    return function() {
        return element.removeAttribute(attribute);
    };
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"8ovWA":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "makeMonitor", ()=>makeMonitor);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
var _once = require("../public-utils/once");
function _createForOfIteratorHelper(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (!t) {
        if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
            t && (r = t);
            var _n = 0, F = function F() {};
            return {
                s: F,
                n: function n() {
                    return _n >= r.length ? {
                        done: !0
                    } : {
                        done: !1,
                        value: r[_n++]
                    };
                },
                e: function e(r) {
                    throw r;
                },
                f: F
            };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o, a = !0, u = !1;
    return {
        s: function s() {
            t = t.call(r);
        },
        n: function n() {
            var r = t.next();
            return a = r.done, r;
        },
        e: function e(r) {
            u = !0, o = r;
        },
        f: function f() {
            try {
                a || null == t.return || t.return();
            } finally{
                if (u) throw o;
            }
        }
    };
}
function _unsupportedIterableToArray(r, a) {
    if (r) {
        if ("string" == typeof r) return _arrayLikeToArray(r, a);
        var t = ({}).toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
}
function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for(var e = 0, n = Array(a); e < a; e++)n[e] = r[e];
    return n;
}
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            (0, _definePropertyDefault.default)(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
function makeMonitor() {
    var registry = new Set();
    var dragging = null;
    function tryAddToActive(monitor) {
        if (!dragging) return;
        // Monitor is allowed to monitor events if:
        // 1. It has no `canMonitor` function (default is that a monitor can listen to everything)
        // 2. `canMonitor` returns true
        if (!monitor.canMonitor || monitor.canMonitor(dragging.canMonitorArgs)) dragging.active.add(monitor);
    }
    function monitorForConsumers(args) {
        // We are giving each `args` a new reference so that you
        // can create multiple monitors with the same `args`.
        var entry = _objectSpread({}, args);
        registry.add(entry);
        // if there is an active drag we need to see if this new monitor is relevant
        tryAddToActive(entry);
        function cleanup() {
            registry.delete(entry);
            // We need to stop publishing events during a drag to this monitor!
            if (dragging) dragging.active.delete(entry);
        }
        // Wrapping in `once` to prevent unexpected side effects if consumers call
        // the clean up function multiple times.
        return (0, _once.once)(cleanup);
    }
    function dispatchEvent(_ref) {
        var eventName = _ref.eventName, payload = _ref.payload;
        if (eventName === 'onGenerateDragPreview') {
            dragging = {
                canMonitorArgs: {
                    initial: payload.location.initial,
                    source: payload.source
                },
                active: new Set()
            };
            var _iterator = _createForOfIteratorHelper(registry), _step;
            try {
                for(_iterator.s(); !(_step = _iterator.n()).done;){
                    var monitor = _step.value;
                    tryAddToActive(monitor);
                }
            } catch (err) {
                _iterator.e(err);
            } finally{
                _iterator.f();
            }
        }
        // This should never happen.
        if (!dragging) return;
        // Creating an array from the set _before_ iterating
        // This is so that monitors added during the current event will not be called.
        // This behaviour matches native EventTargets where an event listener
        // cannot add another event listener during an active event to the same
        // event target in the same event (for us we have a single global event target)
        var active = Array.from(dragging.active);
        for(var _i = 0, _active = active; _i < _active.length; _i++){
            var _monitor = _active[_i];
            // A monitor can be removed by another monitor during an event.
            // We need to check that the monitor is still registered before calling it
            if (dragging.active.has(_monitor)) {
                var _monitor$eventName;
                // @ts-expect-error: I cannot get this type working!
                (_monitor$eventName = _monitor[eventName]) === null || _monitor$eventName === void 0 || _monitor$eventName.call(_monitor, payload);
            }
        }
        if (eventName === 'onDrop') {
            dragging.active.clear();
            dragging = null;
        }
    }
    return {
        dispatchEvent: dispatchEvent,
        monitorForConsumers: monitorForConsumers
    };
}

},{"@babel/runtime/helpers/defineProperty":"4x6r7","../public-utils/once":"givnC","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"g8Y2K":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "isAndroid", ()=>isAndroid);
parcelHelpers.export(exports, "androidFallbackText", ()=>androidFallbackText);
var _once = require("../public-utils/once");
var isAndroid = (0, _once.once)(function isAndroid() {
    return navigator.userAgent.toLocaleLowerCase().includes('android');
});
var androidFallbackText = 'pdnd:android-fallback';

},{"../public-utils/once":"givnC","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"6h7IL":[function(require,module,exports,__globalThis) {
// Why we put the media types in their own files:
//
// - we are not putting them all in one file as not all adapters need all types
// - we are not putting them in the external helpers as some things just need the
//   types and not the external functions code
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "textMediaType", ()=>textMediaType);
var textMediaType = 'text/plain';

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"h6AzT":[function(require,module,exports,__globalThis) {
// Why we put the media types in their own files:
//
// - we are not putting them all in one file as not all adapters need all types
// - we are not putting them in the external helpers as some things just need the
//   types and not the external functions code
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "URLMediaType", ()=>URLMediaType);
var URLMediaType = 'text/uri-list';

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"lh6LV":[function(require,module,exports,__globalThis) {
/**
 * This key has been pulled into a separate module
 * so that the external adapter does not need to import
 * the element adapter
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "elementAdapterNativeDataKey", ()=>elementAdapterNativeDataKey);
var elementAdapterNativeDataKey = 'application/vnd.pdnd';

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"lA7oL":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "log", ()=>log);
parcelHelpers.export(exports, "warning", ()=>warning);
parcelHelpers.export(exports, "error", ()=>error);
var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");
var _toConsumableArrayDefault = parcelHelpers.interopDefault(_toConsumableArray);
// This file has been copied from `react-beautiful-dnd`
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/src/dev-warning.js>
function noop() {}
var log = /**
* An Immediately Invoked Function Expression (IIFE) is used to enable
* dead code elimination while also only having to evaluate these
* declarations once.
*/ function() {
    var isDisabledFlag = '__react-beautiful-dnd-disable-dev-warnings';
    // not replacing newlines (which \s does)
    var spacesAndTabs = /[ \t]{2,}/g;
    var lineStartWithSpaces = /^[ \t]*/gm;
    // using .trim() to clear the any newlines before the first text and after last text
    var clean = function clean(value) {
        return value.replace(spacesAndTabs, ' ').replace(lineStartWithSpaces, '').trim();
    };
    var getDevMessage = function getDevMessage(message) {
        return clean("\n          %creact-beautiful-dnd\n          \n          %c".concat(clean(message), "\n          \n          %c\uD83D\uDC77\u200D This is a development only message. It will be removed in production builds.\n        "));
    };
    var getFormattedMessage = function getFormattedMessage(message) {
        return [
            getDevMessage(message),
            // title (green400)
            'color: #00C584; font-size: 1.2em; font-weight: bold;',
            // message
            'line-height: 1.5',
            // footer (purple300)
            'color: #723874;'
        ];
    };
    return function log(type, message) {
        var _console;
        // manual opt out of warnings
        // @ts-expect-error
        if (typeof window !== 'undefined' && window[isDisabledFlag]) return;
        // eslint-disable-next-line no-console
        (_console = console)[type].apply(_console, (0, _toConsumableArrayDefault.default)(getFormattedMessage(message)));
    };
}();
var warning = log.bind(null, 'warn');
var error = log.bind(null, 'error');

},{"@babel/runtime/helpers/toConsumableArray":"bCb5n","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"5fbtJ":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Calculates the actual destination of an item based on its start location
 * and target location.
 *
 * The actual destination may not be the same as the target location.
 * An item moving to a higher index in the same list introduces an
 * off-by-one error that this function accounts for.
 */ parcelHelpers.export(exports, "getActualDestination", ()=>getActualDestination);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            (0, _definePropertyDefault.default)(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
function getActualDestination(_ref) {
    var start = _ref.start, target = _ref.target;
    if (target === null) return null;
    /**
   * When reordering an item to an index greater than its current index
   * in the same list, then the target index needs adjustment.
   *
   * This is to account for the item itself moving, which would cause a shift.
   */ var isSameList = start.droppableId === target.droppableId;
    var isMovingForward = target.index > start.index;
    var shouldAdjust = isSameList && isMovingForward;
    /**
   * A clone is returned, even though it is the same value.
   * This is because the returned object might be mutated.
   */ if (!shouldAdjust) return _objectSpread({}, target);
    return _objectSpread(_objectSpread({}, target), {}, {
        index: target.index - 1
    });
}

},{"@babel/runtime/helpers/defineProperty":"4x6r7","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"7NaCi":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getHiddenTextElementId", ()=>getHiddenTextElementId);
parcelHelpers.export(exports, "default", ()=>useHiddenTextElement);
var _react = require("react");
function getHiddenTextElementId(contextId) {
    return "rbd-lift-instruction-".concat(contextId);
}
function useHiddenTextElement(_ref) {
    var contextId = _ref.contextId, text = _ref.text;
    (0, _react.useEffect)(function() {
        var id = getHiddenTextElementId(contextId);
        var el = document.createElement('div');
        // identifier
        el.id = id;
        // add the description text
        el.textContent = text;
        // Using `display: none` prevent screen readers from reading this element in the document flow
        // This element is used as a `aria-labelledby` reference for *other elements* and will be read out for those
        Object.assign(el.style, {
            display: 'none'
        });
        // Add to body
        document.body.appendChild(el);
        return function unmount() {
            // Remove from body
            el.remove();
        };
    }, [
        contextId,
        text
    ]);
}

},{"react":"f39IF","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"6F9yG":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "useKeyboardControls", ()=>useKeyboardControls);
var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");
var _toConsumableArrayDefault = parcelHelpers.interopDefault(_toConsumableArray);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
var _react = require("react");
var _bindEventListener = require("bind-event-listener");
var _attributes = require("../../utils/attributes");
var _findClosestScrollContainer = require("../../utils/find-closest-scroll-container");
var _findElement = require("../../utils/find-element");
var _getBestCrossAxisDroppable = require("../../utils/get-best-cross-axis-droppable");
var _getElementByDraggableLocation = require("../../utils/get-element-by-draggable-location");
var _draggableLocation = require("../draggable-location");
var _getDestination = require("../get-destination");
var _rbdInvariant = require("../rbd-invariant");
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            (0, _definePropertyDefault.default)(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
/**
 * Finds the element's scroll container and scrolls it to the top.
 *
 * This is used for cross-axis drags to provide a consistent starting point
 * in the list.
 *
 * The behavior differs to `react-beautiful-dnd` which would find the
 * index closest to the current visual position. That was not preserved for
 * performance cost reasons.
 */ function scrollToTop(element) {
    var scrollContainer = (0, _findClosestScrollContainer.findClosestScrollContainer)(element);
    if (!scrollContainer) return;
    scrollContainer.scrollTo(0, 0);
}
var moveHandlers = {
    mainAxis: {
        prev: function prev(event, _ref) {
            var dragController = _ref.dragController;
            /**
       * Preventing default to stop scrolling caused by arrow key press.
       */ event.preventDefault();
            var dragState = dragController.getDragState();
            (0, _rbdInvariant.rbdInvariant)(dragState.isDragging);
            var sourceLocation = dragState.sourceLocation, targetLocation = dragState.targetLocation;
            if (!targetLocation) return;
            if (targetLocation.index === 0) return;
            var nextLocation = _objectSpread(_objectSpread({}, targetLocation), {}, {
                index: targetLocation.index - 1
            });
            var nextDestination = (0, _getDestination.getActualDestination)({
                start: sourceLocation,
                target: nextLocation
            });
            /**
       * There are two target indexes that correspond to a drop in the source location:
       *
       * 1. source.index      (before the source, but after previous item)
       * 2. source.index + 1  (after the source, but before next item)
       *
       * We decrement by 2 when going over the source location,
       * so the user only perceives one of these indexes.
       */ if ((0, _draggableLocation.isSameLocation)(sourceLocation, nextDestination)) nextLocation.index = targetLocation.index - 2;
            dragController.updateDrag({
                targetLocation: nextLocation
            });
        },
        next: function next(event, _ref2) {
            var dragController = _ref2.dragController, contextId = _ref2.contextId;
            /**
       * Preventing default to stop scrolling caused by arrow key press.
       */ event.preventDefault();
            var dragState = dragController.getDragState();
            (0, _rbdInvariant.rbdInvariant)(dragState.isDragging);
            var sourceLocation = dragState.sourceLocation, targetLocation = dragState.targetLocation;
            if (!targetLocation) return;
            /**
       * Checks if we can move to the next position.
       *
       * Reasoning: if there is already a draggable with the current index,
       * then it is a possible target.
       */ var element = (0, _getElementByDraggableLocation.getElementByDraggableLocation)(contextId, targetLocation);
            /**
       * This check is for virtual lists, and is a special case.
       *
       * When dragging, the element will unmount and we won't be able to find
       * the element for that index.
       *
       * This means for virtual lists, the normal check (element check) will fail.
       */ var isSame = (0, _draggableLocation.isSameLocation)(sourceLocation, targetLocation);
            if (!isSame && !element) return;
            var nextLocation = _objectSpread(_objectSpread({}, targetLocation), {}, {
                index: targetLocation.index + 1
            });
            var nextDestination = (0, _getDestination.getActualDestination)({
                start: sourceLocation,
                target: nextLocation
            });
            /**
       * There are two target indexes that correspond to a drop in the source location:
       *
       * 1. source.index      (before the source, but after previous item)
       * 2. source.index + 1  (after the source, but before next item)
       *
       * We increment by 2 when going over the source location,
       * so the user only perceives one of these indexes.
       */ if ((0, _draggableLocation.isSameLocation)(sourceLocation, nextDestination)) nextLocation.index = targetLocation.index + 2;
            dragController.updateDrag({
                targetLocation: nextLocation
            });
        }
    },
    crossAxis: {
        prev: function prev(event, _ref3) {
            var dragController = _ref3.dragController, droppableRegistry = _ref3.droppableRegistry, contextId = _ref3.contextId;
            /**
       * Preventing default to stop scrolling caused by arrow key press.
       */ event.preventDefault();
            var dragState = dragController.getDragState();
            (0, _rbdInvariant.rbdInvariant)(dragState.isDragging);
            var targetLocation = dragState.targetLocation, type = dragState.type;
            if (!targetLocation) return;
            var before = (0, _getBestCrossAxisDroppable.getBestCrossAxisDroppable)({
                droppableId: targetLocation.droppableId,
                type: type,
                isMovingForward: false,
                contextId: contextId,
                droppableRegistry: droppableRegistry
            });
            if (!before) return;
            scrollToTop(before);
            var nextLocation = {
                droppableId: (0, _attributes.getAttribute)(before, (0, _attributes.attributes).droppable.id),
                index: 0
            };
            dragController.updateDrag({
                targetLocation: nextLocation
            });
        },
        next: function next(event, _ref4) {
            var dragController = _ref4.dragController, droppableRegistry = _ref4.droppableRegistry, contextId = _ref4.contextId;
            /**
       * Preventing default to stop scrolling caused by arrow key press.
       */ event.preventDefault();
            var dragState = dragController.getDragState();
            (0, _rbdInvariant.rbdInvariant)(dragState.isDragging);
            var targetLocation = dragState.targetLocation, type = dragState.type;
            if (!targetLocation) return;
            var after = (0, _getBestCrossAxisDroppable.getBestCrossAxisDroppable)({
                droppableId: targetLocation.droppableId,
                type: type,
                isMovingForward: true,
                contextId: contextId,
                droppableRegistry: droppableRegistry
            });
            if (!after) return;
            scrollToTop(after);
            var nextLocation = {
                droppableId: (0, _attributes.getAttribute)(after, (0, _attributes.attributes).droppable.id),
                index: 0
            };
            dragController.updateDrag({
                targetLocation: nextLocation
            });
        }
    }
};
function preventDefault(event) {
    event.preventDefault();
}
/**
 * These keys mostly have their default behavior prevented to stop scrolling.
 *
 * The tab key is prevented to lock focus in place.
 */ var commonKeyHandlers = {
    PageUp: preventDefault,
    PageDown: preventDefault,
    Home: preventDefault,
    End: preventDefault,
    Enter: preventDefault,
    Tab: preventDefault
};
/**
 * Maps actions to keys.
 */ var keyHandlers = {
    vertical: _objectSpread(_objectSpread({}, commonKeyHandlers), {}, {
        ArrowUp: moveHandlers.mainAxis.prev,
        ArrowDown: moveHandlers.mainAxis.next,
        ArrowLeft: moveHandlers.crossAxis.prev,
        ArrowRight: moveHandlers.crossAxis.next
    }),
    horizontal: _objectSpread(_objectSpread({}, commonKeyHandlers), {}, {
        ArrowUp: moveHandlers.crossAxis.prev,
        ArrowDown: moveHandlers.crossAxis.next,
        ArrowLeft: moveHandlers.mainAxis.prev,
        ArrowRight: moveHandlers.mainAxis.next
    })
};
function useKeyboardControls(_ref5) {
    var dragController = _ref5.dragController, droppableRegistry = _ref5.droppableRegistry, contextId = _ref5.contextId, setKeyboardCleanupFn = _ref5.setKeyboardCleanupFn;
    var startKeyboardDrag = (0, _react.useCallback)(function(_ref6) {
        var startEvent = _ref6.event, draggableId = _ref6.draggableId, type = _ref6.type, getSourceLocation = _ref6.getSourceLocation, sourceElement = _ref6.sourceElement;
        dragController.startDrag({
            draggableId: draggableId,
            type: type,
            getSourceLocation: getSourceLocation,
            sourceElement: sourceElement,
            mode: 'SNAP'
        });
        var sourceLocation = getSourceLocation();
        var droppable = (0, _findElement.getElement)({
            attribute: (0, _attributes.attributes).droppable.id,
            value: sourceLocation.droppableId
        });
        var direction = (0, _attributes.getAttribute)(droppable, (0, _attributes.customAttributes).droppable.direction);
        (0, _rbdInvariant.rbdInvariant)(direction === 'vertical' || direction === 'horizontal');
        function cancelDrag() {
            dragController.stopDrag({
                reason: 'CANCEL'
            });
        }
        /**
     * All of these events should cancel the drag.
     *
     * These events were taken from `react-beautiful-dnd`.
     */ var cancelBindings = [
            'mousedown',
            'mouseup',
            'click',
            'touchstart',
            'resize',
            'wheel',
            'visibilitychange'
        ].map(function(type) {
            return {
                type: type,
                listener: cancelDrag
            };
        });
        var cleanupFn = (0, _bindEventListener.bindAll)(window, [
            {
                type: 'keydown',
                listener: function listener(event) {
                    var _keyHandlers$directio, _keyHandlers$directio2;
                    /**
         * Ignores the keydown event which triggered the drag start,
         * so it doesn't trigger an immediate drop.
         */ if (event === startEvent) return;
                    var _dragController$getDr = dragController.getDragState(), isDragging = _dragController$getDr.isDragging;
                    if (!isDragging) return;
                    if (event.key === ' ') {
                        event.preventDefault();
                        dragController.stopDrag({
                            reason: 'DROP'
                        });
                        return;
                    }
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        dragController.stopDrag({
                            reason: 'CANCEL'
                        });
                        return;
                    }
                    (_keyHandlers$directio = (_keyHandlers$directio2 = keyHandlers[direction])[event.key]) === null || _keyHandlers$directio === void 0 || _keyHandlers$directio.call(_keyHandlers$directio2, event, {
                        dragController: dragController,
                        droppableRegistry: droppableRegistry,
                        contextId: contextId
                    });
                }
            }
        ].concat((0, _toConsumableArrayDefault.default)(cancelBindings)));
        setKeyboardCleanupFn(cleanupFn);
    }, [
        contextId,
        dragController,
        droppableRegistry,
        setKeyboardCleanupFn
    ]);
    return {
        startKeyboardDrag: startKeyboardDrag
    };
}

},{"@babel/runtime/helpers/toConsumableArray":"bCb5n","@babel/runtime/helpers/defineProperty":"4x6r7","react":"f39IF","bind-event-listener":"4KK82","../../utils/attributes":"ckBmU","../../utils/find-closest-scroll-container":"dEXoH","../../utils/find-element":"jmXiO","../../utils/get-best-cross-axis-droppable":"ajmoB","../../utils/get-element-by-draggable-location":"gbjba","../draggable-location":"alMHr","../get-destination":"5fbtJ","../rbd-invariant":"gHZ28","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"dEXoH":[function(require,module,exports,__globalThis) {
/**
 * Ported from `react-beautiful-dnd`
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "findClosestScrollContainer", ()=>findClosestScrollContainer);
function findClosestScrollContainer(element) {
    var _getComputedStyle = getComputedStyle(element), overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
    if (overflowX === 'scroll' || overflowX === 'auto' || overflowY === 'scroll' || overflowY === 'auto') return element;
    var parentElement = element.parentElement;
    if (parentElement === null) return null;
    return findClosestScrollContainer(parentElement);
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"ajmoB":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * This is similar to the function of the same name in `react-beautiful-dnd`.
 *
 * Many of the checks from rbd are removed though, such as visibility checks.
 */ parcelHelpers.export(exports, "getBestCrossAxisDroppable", ()=>getBestCrossAxisDroppable);
var _attributes = require("./attributes");
var _findElement = require("./find-element");
function getDroppablesOfType(_ref) {
    var contextId = _ref.contextId, type = _ref.type;
    return (0, _findElement.findElementAll)({
        attribute: (0, _attributes.attributes).droppable.contextId,
        value: contextId
    }, {
        attribute: (0, _attributes.customAttributes).droppable.type,
        value: type
    });
}
function getBestCrossAxisDroppable(_ref2) {
    var droppableId = _ref2.droppableId, type = _ref2.type, isMovingForward = _ref2.isMovingForward, contextId = _ref2.contextId, droppableRegistry = _ref2.droppableRegistry;
    var droppables = getDroppablesOfType({
        contextId: contextId,
        type: type
    });
    var currentIndex = droppables.findIndex(function(element) {
        return (0, _attributes.getAttribute)(element, (0, _attributes.attributes).droppable.id) === droppableId;
    });
    var candidates = droppables.filter(function(_, index) {
        /**
     * We are following the DOM order of the droppables,
     * so keep only those that are before/after the current.
     */ if (isMovingForward) return index > currentIndex;
        return index < currentIndex;
    }).filter(function(element) {
        /**
     * Filter out the disabled droppables.
     */ var droppableId = (0, _attributes.getAttribute)(element, (0, _attributes.attributes).droppable.id);
        var entry = droppableRegistry.getEntry({
            droppableId: droppableId
        });
        var isValidCandidate = entry && !entry.isDropDisabled;
        return isValidCandidate;
    });
    /**
   * If we're moving forward then take the first candidate,
   * if moving backwards take the last candidate
   * (because it is closest to where the current is).
   *
   * Using `.at()` provides a safer type, making us handle the `undefined` case.
   */ var bestCandidate = isMovingForward ? candidates.at(0) : candidates.at(-1);
    return bestCandidate !== null && bestCandidate !== void 0 ? bestCandidate : null;
}

},{"./attributes":"ckBmU","./find-element":"jmXiO","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gbjba":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getElementByDraggableLocation", ()=>getElementByDraggableLocation);
var _attributes = require("./attributes");
var _findElement = require("./find-element");
function getElementByDraggableLocation(contextId, location) {
    if (!location) return null;
    return (0, _findElement.findElement)({
        attribute: (0, _attributes.attributes).draggable.contextId,
        value: contextId
    }, {
        attribute: (0, _attributes.customAttributes).draggable.droppableId,
        value: location.droppableId
    }, {
        attribute: (0, _attributes.customAttributes).draggable.index,
        value: String(location.index)
    });
}

},{"./attributes":"ckBmU","./find-element":"jmXiO","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4udX0":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Sets up listeners for pointer dragging.
 */ parcelHelpers.export(exports, "usePointerControls", ()=>usePointerControls);
var _react = require("react");
var _pragmaticDragAndDropReactBeautifulDndAutoscroll = require("@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-autoscroll");
var _adapter = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var _preventUnhandled = require("@atlaskit/pragmatic-drag-and-drop/prevent-unhandled");
var _data = require("../../draggable/data");
var _data1 = require("../../droppable/data");
var _draggableLocation = require("../draggable-location");
var _rbdInvariant = require("../rbd-invariant");
function usePointerControls(_ref) {
    var dragController = _ref.dragController, contextId = _ref.contextId;
    var updatePointerDrag = (0, _react.useCallback)(function(location) {
        dragController.updateDrag({
            targetLocation: (0, _draggableLocation.getDraggableLocation)(location.current)
        });
    }, [
        dragController
    ]);
    (0, _react.useEffect)(function() {
        return (0, _adapter.monitorForElements)({
            canMonitor: function canMonitor(_ref2) {
                var initial = _ref2.initial, source = _ref2.source;
                if (!(0, _data.isDraggableData)(source.data)) // not dragging something from the migration layer
                // we should not monitor it
                return false;
                var isValidDraggable = source.data.contextId === contextId;
                if (!isValidDraggable) return false;
                var droppable = initial.dropTargets.find(function(target) {
                    return (0, _data1.isDroppableData)(target.data);
                });
                if (!droppable) /**
           * There may be no droppable in the `dropTargets` if it is disabled.
           *
           * This is still valid.
           */ return true;
                var isValidDroppable = droppable.data.contextId === contextId;
                return isValidDroppable;
            },
            onDragStart: function onDragStart(_ref3) {
                var location = _ref3.location, source = _ref3.source;
                (0, _pragmaticDragAndDropReactBeautifulDndAutoscroll.autoScroller).start({
                    input: location.current.input
                });
                /**
         * We use `preventUnhandled` because we are rendering a custom drag
         * preview.
         */ (0, _preventUnhandled.preventUnhandled).start();
                var data = source.data;
                (0, _rbdInvariant.rbdInvariant)((0, _data.isDraggableData)(data));
                var draggableId = data.draggableId, droppableId = data.droppableId, getIndex = data.getIndex, type = data.type;
                dragController.startDrag({
                    draggableId: draggableId,
                    type: type,
                    getSourceLocation: function getSourceLocation() {
                        return {
                            droppableId: droppableId,
                            index: getIndex()
                        };
                    },
                    sourceElement: source.element,
                    mode: 'FLUID'
                });
            },
            onDrag: function onDrag(_ref4) {
                var location = _ref4.location;
                (0, _pragmaticDragAndDropReactBeautifulDndAutoscroll.autoScroller).updateInput({
                    input: location.current.input
                });
                updatePointerDrag(location);
            },
            onDropTargetChange: function onDropTargetChange(_ref5) {
                var location = _ref5.location;
                updatePointerDrag(location);
            },
            onDrop: function onDrop() {
                (0, _pragmaticDragAndDropReactBeautifulDndAutoscroll.autoScroller).stop();
                (0, _preventUnhandled.preventUnhandled).stop();
                dragController.stopDrag({
                    reason: 'DROP'
                });
            }
        });
    }, [
        dragController,
        contextId,
        updatePointerDrag
    ]);
}

},{"react":"f39IF","@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-autoscroll":"8UUTM","@atlaskit/pragmatic-drag-and-drop/element/adapter":"3xAZN","@atlaskit/pragmatic-drag-and-drop/prevent-unhandled":"czz1K","../../draggable/data":"6qWMC","../../droppable/data":"iSg7i","../draggable-location":"alMHr","../rbd-invariant":"gHZ28","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"8UUTM":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "createAutoScroller", ()=>createAutoScroller);
parcelHelpers.export(exports, "autoScroller", ()=>autoScroller);
var _scroll = require("./internal/scroll");
var scrollElement = function scrollElement(element, change) {
    element.scrollBy(change.x, change.y);
};
var scrollWindow = function scrollWindow(change) {
    window.scrollBy(change.x, change.y);
};
var createAutoScroller = function createAutoScroller() {
    var dragging = null;
    function tryScroll(fakeScrollCallback) {
        if (dragging == null) return;
        (0, _scroll.scroll)({
            input: dragging.latestInput,
            dragStartTime: dragging.dragStartTime,
            shouldUseTimeDampening: dragging.shouldUseTimeDampening,
            behavior: dragging.behavior,
            scrollElement: fakeScrollCallback !== null && fakeScrollCallback !== void 0 ? fakeScrollCallback : scrollElement,
            scrollWindow: fakeScrollCallback !== null && fakeScrollCallback !== void 0 ? fakeScrollCallback : scrollWindow
        });
    }
    // Every animation frame use the latest user input to scroll
    // We do this loop manually rather than in response to `onDrag`
    // events as `onDrag` can drop to 50-100ms between events when
    // the user is not actively moving their pointer
    function loop() {
        if (!dragging) return;
        dragging.loopFrameId = requestAnimationFrame(function() {
            tryScroll();
            loop();
        });
    }
    var start = function start(_ref) {
        var input = _ref.input, _ref$behavior = _ref.behavior, behavior = _ref$behavior === void 0 ? 'window-then-container' : _ref$behavior;
        var dragStartTime = Date.now();
        dragging = {
            dragStartTime: dragStartTime,
            latestInput: input,
            loopFrameId: null,
            shouldUseTimeDampening: false,
            behavior: behavior
        };
        // we only use time dampening when auto scrolling starts on lift.
        var fakeScrollCallback = function fakeScrollCallback() {
            if (dragging) dragging.shouldUseTimeDampening = true;
        };
        tryScroll(fakeScrollCallback);
        loop();
    };
    function updateInput(_ref2) {
        var input = _ref2.input;
        if (!dragging) return;
        dragging.latestInput = input;
    }
    var stop = function stop() {
        // can be called defensively
        if (!dragging) return;
        if (dragging.loopFrameId) cancelAnimationFrame(dragging.loopFrameId);
        dragging = null;
    };
    return {
        start: start,
        updateInput: updateInput,
        stop: stop
    };
};
var autoScroller = createAutoScroller();

},{"./internal/scroll":"4M7rp","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4M7rp":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "scroll", ()=>scroll);
var _getElementFromPointWithoutHoneyPot = require("@atlaskit/pragmatic-drag-and-drop/private/get-element-from-point-without-honey-pot");
var _getClosestScrollableElement = require("./get-closest-scrollable-element");
var _getScrollable = require("./get-scrollable");
var _getScrollableScrollChange = require("./get-scrollable-scroll-change");
var _getScrollableScrollChangeDefault = parcelHelpers.interopDefault(_getScrollableScrollChange);
var _getWindowScrollChange = require("./get-window-scroll-change");
var _getWindowScrollChangeDefault = parcelHelpers.interopDefault(_getWindowScrollChange);
var _getViewport = require("./window/get-viewport");
var _getViewportDefault = parcelHelpers.interopDefault(_getViewport);
var scroll = function scroll(_ref) {
    var input = _ref.input, dragStartTime = _ref.dragStartTime, shouldUseTimeDampening = _ref.shouldUseTimeDampening, scrollElement = _ref.scrollElement, scrollWindow = _ref.scrollWindow, behavior = _ref.behavior;
    var tryScrollWindow = function tryScrollWindow() {
        var viewport = (0, _getViewportDefault.default)();
        var windowScrollChange = (0, _getWindowScrollChangeDefault.default)({
            dragStartTime: dragStartTime,
            viewport: viewport,
            center: {
                x: input.clientX + viewport.scroll.current.x,
                y: input.clientY + viewport.scroll.current.y
            },
            shouldUseTimeDampening: shouldUseTimeDampening
        });
        if (windowScrollChange) {
            scrollWindow(windowScrollChange);
            return true;
        }
        return false;
    };
    var tryScrollContainer = function tryScrollContainer() {
        var over = (0, _getElementFromPointWithoutHoneyPot.getElementFromPointWithoutHoneypot)({
            x: input.clientX,
            y: input.clientY
        });
        var closestScrollable = (0, _getClosestScrollableElement.getClosestScrollableElement)(over);
        if (!closestScrollable) return false;
        var scrollable = (0, _getScrollable.getScrollable)({
            closestScrollable: closestScrollable
        });
        var scrollableScrollChange = (0, _getScrollableScrollChangeDefault.default)({
            dragStartTime: dragStartTime,
            scrollable: scrollable,
            center: {
                x: input.clientX,
                y: input.clientY
            },
            shouldUseTimeDampening: shouldUseTimeDampening
        });
        if (scrollableScrollChange) {
            scrollElement(closestScrollable, scrollableScrollChange);
            return true;
        }
        return false;
    };
    if (behavior === 'container-only') tryScrollContainer();
    if (behavior === 'window-only') tryScrollWindow();
    if (behavior === 'container-then-window') tryScrollContainer() || tryScrollWindow();
    if (behavior === 'window-then-container') tryScrollWindow() || tryScrollContainer();
};

},{"@atlaskit/pragmatic-drag-and-drop/private/get-element-from-point-without-honey-pot":"hkYWI","./get-closest-scrollable-element":"bAhn9","./get-scrollable":"ba9ok","./get-scrollable-scroll-change":"15ge6","./get-window-scroll-change":"8XQn7","./window/get-viewport":"2c87d","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"hkYWI":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getElementFromPointWithoutHoneypot", ()=>(0, _getElementFromPointWithoutHoneyPot.getElementFromPointWithoutHoneypot));
var _getElementFromPointWithoutHoneyPot = require("../../honey-pot-fix/get-element-from-point-without-honey-pot");

},{"../../honey-pot-fix/get-element-from-point-without-honey-pot":"guBim","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"bAhn9":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getClosestScrollableElement", ()=>_getClosestScrollableElement);
var isEqual = function isEqual(base) {
    return function(value) {
        return base === value;
    };
};
var isScroll = isEqual('scroll');
var isAuto = isEqual('auto');
var isEither = function isEither(overflow, fn) {
    return fn(overflow.overflowX) || fn(overflow.overflowY);
};
var isElementScrollable = function isElementScrollable(el) {
    var style = window.getComputedStyle(el);
    var overflow = {
        overflowX: style.overflowX,
        overflowY: style.overflowY
    };
    return isEither(overflow, isScroll) || isEither(overflow, isAuto);
};
var _getClosestScrollableElement = function getClosestScrollableElement(el) {
    // cannot do anything else!
    if (!el) return null;
    // not allowing us to go higher then body
    if (el === document.body || el === document.documentElement) return null;
    if (!isElementScrollable(el)) // keep recursing
    return _getClosestScrollableElement(el.parentElement);
    // success!
    return el;
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"ba9ok":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getScrollable", ()=>getScrollable);
var _cssBoxModel = require("css-box-model");
var getScrollable = function getScrollable(_ref) {
    var closestScrollable = _ref.closestScrollable;
    var rect = closestScrollable.getBoundingClientRect();
    var scrollPosition = {
        x: closestScrollable.scrollLeft,
        y: closestScrollable.scrollTop
    };
    return {
        container: (0, _cssBoxModel.getRect)(rect),
        scroll: {
            current: scrollPosition,
            max: {
                x: closestScrollable.scrollWidth - closestScrollable.clientWidth,
                y: closestScrollable.scrollHeight - closestScrollable.clientHeight
            }
        }
    };
};

},{"css-box-model":"353vO","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"353vO":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "calculateBox", ()=>calculateBox);
parcelHelpers.export(exports, "createBox", ()=>createBox);
parcelHelpers.export(exports, "expand", ()=>expand);
parcelHelpers.export(exports, "getBox", ()=>getBox);
parcelHelpers.export(exports, "getRect", ()=>getRect);
parcelHelpers.export(exports, "offset", ()=>offset);
parcelHelpers.export(exports, "shrink", ()=>shrink);
parcelHelpers.export(exports, "withScroll", ()=>withScroll);
var _tinyInvariant = require("tiny-invariant");
var _tinyInvariantDefault = parcelHelpers.interopDefault(_tinyInvariant);
var getRect = function getRect(_ref) {
    var top = _ref.top, right = _ref.right, bottom = _ref.bottom, left = _ref.left;
    var width = right - left;
    var height = bottom - top;
    var rect = {
        top: top,
        right: right,
        bottom: bottom,
        left: left,
        width: width,
        height: height,
        x: left,
        y: top,
        center: {
            x: (right + left) / 2,
            y: (bottom + top) / 2
        }
    };
    return rect;
};
var expand = function expand(target, expandBy) {
    return {
        top: target.top - expandBy.top,
        left: target.left - expandBy.left,
        bottom: target.bottom + expandBy.bottom,
        right: target.right + expandBy.right
    };
};
var shrink = function shrink(target, shrinkBy) {
    return {
        top: target.top + shrinkBy.top,
        left: target.left + shrinkBy.left,
        bottom: target.bottom - shrinkBy.bottom,
        right: target.right - shrinkBy.right
    };
};
var shift = function shift(target, shiftBy) {
    return {
        top: target.top + shiftBy.y,
        left: target.left + shiftBy.x,
        bottom: target.bottom + shiftBy.y,
        right: target.right + shiftBy.x
    };
};
var noSpacing = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
};
var createBox = function createBox(_ref2) {
    var borderBox = _ref2.borderBox, _ref2$margin = _ref2.margin, margin = _ref2$margin === void 0 ? noSpacing : _ref2$margin, _ref2$border = _ref2.border, border = _ref2$border === void 0 ? noSpacing : _ref2$border, _ref2$padding = _ref2.padding, padding = _ref2$padding === void 0 ? noSpacing : _ref2$padding;
    var marginBox = getRect(expand(borderBox, margin));
    var paddingBox = getRect(shrink(borderBox, border));
    var contentBox = getRect(shrink(paddingBox, padding));
    return {
        marginBox: marginBox,
        borderBox: getRect(borderBox),
        paddingBox: paddingBox,
        contentBox: contentBox,
        margin: margin,
        border: border,
        padding: padding
    };
};
var parse = function parse(raw) {
    var value = raw.slice(0, -2);
    var suffix = raw.slice(-2);
    if (suffix !== 'px') return 0;
    var result = Number(value);
    !!isNaN(result) && (0, _tinyInvariantDefault.default)(false, "Could not parse value [raw: " + raw + ", without suffix: " + value + "]");
    return result;
};
var getWindowScroll = function getWindowScroll() {
    return {
        x: window.pageXOffset,
        y: window.pageYOffset
    };
};
var offset = function offset(original, change) {
    var borderBox = original.borderBox, border = original.border, margin = original.margin, padding = original.padding;
    var shifted = shift(borderBox, change);
    return createBox({
        borderBox: shifted,
        border: border,
        margin: margin,
        padding: padding
    });
};
var withScroll = function withScroll(original, scroll) {
    if (scroll === void 0) scroll = getWindowScroll();
    return offset(original, scroll);
};
var calculateBox = function calculateBox(borderBox, styles) {
    var margin = {
        top: parse(styles.marginTop),
        right: parse(styles.marginRight),
        bottom: parse(styles.marginBottom),
        left: parse(styles.marginLeft)
    };
    var padding = {
        top: parse(styles.paddingTop),
        right: parse(styles.paddingRight),
        bottom: parse(styles.paddingBottom),
        left: parse(styles.paddingLeft)
    };
    var border = {
        top: parse(styles.borderTopWidth),
        right: parse(styles.borderRightWidth),
        bottom: parse(styles.borderBottomWidth),
        left: parse(styles.borderLeftWidth)
    };
    return createBox({
        borderBox: borderBox,
        margin: margin,
        padding: padding,
        border: border
    });
};
var getBox = function getBox(el) {
    var borderBox = el.getBoundingClientRect();
    var styles = window.getComputedStyle(el);
    return calculateBox(borderBox, styles);
};

},{"tiny-invariant":"fnIPv","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fnIPv":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "default", ()=>invariant);
var isProduction = false;
var prefix = 'Invariant failed';
function invariant(condition, message) {
    if (condition) return;
    if (isProduction) throw new Error(prefix);
    var provided = typeof message === 'function' ? message() : message;
    var value = provided ? "".concat(prefix, ": ").concat(provided) : prefix;
    throw new Error(value);
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"15ge6":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _canScroll = require("./can-scroll");
var _getScroll = require("./get-scroll");
var _getScrollDefault = parcelHelpers.interopDefault(_getScroll);
exports.default = function(_ref) {
    var scrollable = _ref.scrollable, center = _ref.center, dragStartTime = _ref.dragStartTime, shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var scroll = (0, _getScrollDefault.default)({
        dragStartTime: dragStartTime,
        container: scrollable.container,
        center: center,
        shouldUseTimeDampening: shouldUseTimeDampening
    });
    return scroll && (0, _canScroll.canScrollScrollable)(scrollable, scroll) ? scroll : null;
};

},{"./can-scroll":"iBdOU","./get-scroll":"hce0L","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"iBdOU":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getOverlap", ()=>getOverlap);
parcelHelpers.export(exports, "canPartiallyScroll", ()=>canPartiallyScroll);
parcelHelpers.export(exports, "canScrollWindow", ()=>canScrollWindow);
parcelHelpers.export(exports, "getWindowOverlap", ()=>getWindowOverlap);
parcelHelpers.export(exports, "canScrollScrollable", ()=>canScrollScrollable);
parcelHelpers.export(exports, "getScrollableOverlap", ()=>getScrollableOverlap);
var _position = require("./position");
var smallestSigned = (0, _position.apply)(function(value) {
    if (value === 0) return 0;
    return value > 0 ? 1 : -1;
});
var getOverlap = function() {
    var getRemainder = function getRemainder(target, max) {
        if (target < 0) return target;
        if (target > max) return target - max;
        return 0;
    };
    return function(_ref) {
        var current = _ref.current, max = _ref.max, change = _ref.change;
        var targetScroll = (0, _position.add)(current, change);
        var overlap = {
            x: getRemainder(targetScroll.x, max.x),
            y: getRemainder(targetScroll.y, max.y)
        };
        if ((0, _position.isEqual)(overlap, (0, _position.origin))) return null;
        return overlap;
    };
}();
var canPartiallyScroll = function canPartiallyScroll(_ref2) {
    var rawMax = _ref2.max, current = _ref2.current, change = _ref2.change;
    // It is possible for the max scroll to be greater than the current scroll
    // when there are scrollbars on the cross axis. We adjust for this by
    // increasing the max scroll point if needed
    // This will allow movements backwards even if the current scroll is greater than the max scroll
    var max = {
        x: Math.max(current.x, rawMax.x),
        y: Math.max(current.y, rawMax.y)
    };
    // Only need to be able to move the smallest amount in the desired direction
    var smallestChange = smallestSigned(change);
    var overlap = getOverlap({
        max: max,
        current: current,
        change: smallestChange
    });
    // no overlap at all - we can move there!
    if (!overlap) return true;
    // if there was an x value, but there is no x overlap - then we can scroll on the x!
    if (smallestChange.x !== 0 && overlap.x === 0) return true;
    // if there was an y value, but there is no y overlap - then we can scroll on the y!
    if (smallestChange.y !== 0 && overlap.y === 0) return true;
    return false;
};
var canScrollWindow = function canScrollWindow(viewport, change) {
    return canPartiallyScroll({
        current: viewport.scroll.current,
        max: viewport.scroll.max,
        change: change
    });
};
var getWindowOverlap = function getWindowOverlap(viewport, change) {
    if (!canScrollWindow(viewport, change)) return null;
    var max = viewport.scroll.max;
    var current = viewport.scroll.current;
    return getOverlap({
        current: current,
        max: max,
        change: change
    });
};
var canScrollScrollable = function canScrollScrollable(scrollable, change) {
    return canPartiallyScroll({
        current: scrollable.scroll.current,
        max: scrollable.scroll.max,
        change: change
    });
};
var getScrollableOverlap = function getScrollableOverlap(scrollable, change) {
    if (!canScrollScrollable(scrollable, change)) return null;
    return getOverlap({
        current: scrollable.scroll.current,
        max: scrollable.scroll.max,
        change: change
    });
};

},{"./position":"laOpQ","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"laOpQ":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "origin", ()=>origin);
parcelHelpers.export(exports, "apply", ()=>apply);
parcelHelpers.export(exports, "isEqual", ()=>isEqual);
parcelHelpers.export(exports, "add", ()=>add);
parcelHelpers.export(exports, "subtract", ()=>subtract);
var origin = {
    x: 0,
    y: 0
};
var apply = function apply(fn) {
    return function(point) {
        return {
            x: fn(point.x),
            y: fn(point.y)
        };
    };
};
var isEqual = function isEqual(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
};
var add = function add(point1, point2) {
    return {
        x: point1.x + point2.x,
        y: point1.y + point2.y
    };
};
var subtract = function subtract(point1, point2) {
    return {
        x: point1.x - point2.x,
        y: point1.y - point2.y
    };
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"hce0L":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _constants = require("../constants");
var _position = require("../position");
var _getScrollOnAxis = require("./get-scroll-on-axis");
var _getScrollOnAxisDefault = parcelHelpers.interopDefault(_getScrollOnAxis);
// will replace -0 and replace with +0
var clean = (0, _position.apply)(function(value) {
    return value === 0 ? 0 : value;
});
exports.default = function(_ref) {
    var dragStartTime = _ref.dragStartTime, container = _ref.container, center = _ref.center, shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    // get distance to each edge
    var distanceToEdges = {
        top: center.y - container.top,
        right: container.right - center.x,
        bottom: container.bottom - center.y,
        left: center.x - container.left
    };
    // 1. Figure out which x,y values are the best target
    // 2. Can the container scroll in that direction at all?
    // If no for both directions, then return null
    // 3. Is the center close enough to a edge to start a drag?
    // 4. Based on the distance, calculate the speed at which a scroll should occur
    // The lower distance value the faster the scroll should be.
    // Maximum speed value should be hit before the distance is 0
    // Negative values to not continue to increase the speed
    var y = (0, _getScrollOnAxisDefault.default)({
        container: container,
        distanceToEdges: distanceToEdges,
        dragStartTime: dragStartTime,
        axis: (0, _constants.vertical),
        shouldUseTimeDampening: shouldUseTimeDampening
    });
    var x = (0, _getScrollOnAxisDefault.default)({
        container: container,
        distanceToEdges: distanceToEdges,
        dragStartTime: dragStartTime,
        axis: (0, _constants.horizontal),
        shouldUseTimeDampening: shouldUseTimeDampening
    });
    var required = clean({
        x: x,
        y: y
    });
    // nothing required
    if ((0, _position.isEqual)(required, (0, _position.origin))) return null;
    return required;
};

},{"../constants":"9c6fJ","../position":"laOpQ","./get-scroll-on-axis":"d4Y3q","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"9c6fJ":[function(require,module,exports,__globalThis) {
// A scroll event will only be triggered when there is a value of at least 1px change
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "minScroll", ()=>minScroll);
parcelHelpers.export(exports, "vertical", ()=>vertical);
parcelHelpers.export(exports, "horizontal", ()=>horizontal);
parcelHelpers.export(exports, "defaultAllowedAxis", ()=>defaultAllowedAxis);
var minScroll = 1;
var vertical = {
    direction: 'vertical',
    start: 'top',
    end: 'bottom',
    size: 'height',
    scrollAxis: 'scrollTop'
};
var horizontal = {
    direction: 'horizontal',
    start: 'left',
    end: 'right',
    size: 'width',
    scrollAxis: 'scrollLeft'
};
var defaultAllowedAxis = [
    horizontal.direction,
    vertical.direction
];

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"d4Y3q":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _getDistanceThresholds = require("./get-distance-thresholds");
var _getDistanceThresholdsDefault = parcelHelpers.interopDefault(_getDistanceThresholds);
var _getValue = require("./get-value");
var _getValueDefault = parcelHelpers.interopDefault(_getValue);
exports.default = function(_ref) {
    var container = _ref.container, distanceToEdges = _ref.distanceToEdges, dragStartTime = _ref.dragStartTime, axis = _ref.axis, shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var thresholds = (0, _getDistanceThresholdsDefault.default)(container, axis);
    var isCloserToEnd = distanceToEdges[axis.end] < distanceToEdges[axis.start];
    if (isCloserToEnd) return (0, _getValueDefault.default)({
        distanceToEdge: distanceToEdges[axis.end],
        thresholds: thresholds,
        dragStartTime: dragStartTime,
        shouldUseTimeDampening: shouldUseTimeDampening
    });
    return -1 * (0, _getValueDefault.default)({
        distanceToEdge: distanceToEdges[axis.start],
        thresholds: thresholds,
        dragStartTime: dragStartTime,
        shouldUseTimeDampening: shouldUseTimeDampening
    });
};

},{"./get-distance-thresholds":"iZjFU","./get-value":"6QJnk","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"iZjFU":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getDistanceThresholds", ()=>getDistanceThresholds);
var _config = require("../../config");
var _configDefault = parcelHelpers.interopDefault(_config);
var getDistanceThresholds = function getDistanceThresholds(container, axis) {
    var startScrollingFrom = container[axis.size] * (0, _configDefault.default).startFromPercentage;
    var maxScrollValueAt = container[axis.size] * (0, _configDefault.default).maxScrollAtPercentage;
    var thresholds = {
        startScrollingFrom: startScrollingFrom,
        maxScrollValueAt: maxScrollValueAt
    };
    return thresholds;
};
exports.default = getDistanceThresholds;

},{"../../config":"6oKPe","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"6oKPe":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
// Values used to control how the fluid auto scroll feels
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var config = {
    // percentage distance from edge of container:
    startFromPercentage: 0.25,
    maxScrollAtPercentage: 0.05,
    // pixels per frame
    maxPixelScroll: 28,
    // A function used to ease a percentage value
    // A simple linear function would be: (percentage) => percentage;
    // percentage is between 0 and 1
    // result must be between 0 and 1
    ease: function ease(percentage) {
        return Math.pow(percentage, 2);
    },
    durationDampening: {
        // ms: how long to dampen the speed of an auto scroll from the start of a drag
        stopDampeningAt: 1200,
        // ms: when to start accelerating the reduction of duration dampening
        accelerateAt: 360
    }
};
exports.default = config;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"6QJnk":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getValue", ()=>getValue);
var _constants = require("../../constants");
var _dampenValueByTime = require("./dampen-value-by-time");
var _getValueFromDistance = require("./get-value-from-distance");
var getValue = function getValue(_ref) {
    var distanceToEdge = _ref.distanceToEdge, thresholds = _ref.thresholds, dragStartTime = _ref.dragStartTime, shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var scroll = (0, _getValueFromDistance.getValueFromDistance)(distanceToEdge, thresholds);
    // not enough distance to trigger a minimum scroll
    // we can bail here
    if (scroll === 0) return 0;
    // Dampen an auto scroll speed based on duration of drag
    if (!shouldUseTimeDampening) return scroll;
    // Once we know an auto scroll should occur based on distance,
    // we must let at least 1px through to trigger a scroll event an
    // another auto scroll call
    return Math.max((0, _dampenValueByTime.dampenValueByTime)(scroll, dragStartTime), (0, _constants.minScroll));
};
exports.default = getValue;

},{"../../constants":"9c6fJ","./dampen-value-by-time":"27UHG","./get-value-from-distance":"fqLEa","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"27UHG":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "dampenValueByTime", ()=>dampenValueByTime);
var _config = require("../../config");
var _configDefault = parcelHelpers.interopDefault(_config);
var _constants = require("../../constants");
var _getPercentage = require("../../get-percentage");
var accelerateAt = (0, _configDefault.default).durationDampening.accelerateAt;
var stopAt = (0, _configDefault.default).durationDampening.stopDampeningAt;
var dampenValueByTime = function dampenValueByTime(proposedScroll, dragStartTime) {
    var startOfRange = dragStartTime;
    var endOfRange = stopAt;
    var now = Date.now();
    var runTime = now - startOfRange;
    // we have finished the time dampening period
    if (runTime >= stopAt) return proposedScroll;
    // Up to this point we know there is a proposed scroll
    // but we have not reached our accelerate point
    // Return the minimum amount of scroll
    if (runTime < accelerateAt) return 0, _constants.minScroll;
    var betweenAccelerateAtAndStopAtPercentage = (0, _getPercentage.getPercentage)({
        startOfRange: accelerateAt,
        endOfRange: endOfRange,
        current: runTime
    });
    var scroll = proposedScroll * (0, _configDefault.default).ease(betweenAccelerateAtAndStopAtPercentage);
    return Math.ceil(scroll);
};

},{"../../config":"6oKPe","../../constants":"9c6fJ","../../get-percentage":"ga5s2","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"ga5s2":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getPercentage", ()=>getPercentage);
var getPercentage = function getPercentage(_ref) {
    var startOfRange = _ref.startOfRange, endOfRange = _ref.endOfRange, current = _ref.current;
    var range = endOfRange - startOfRange;
    if (range === 0) /**
     * Detected distance range of 0 in the auto scroller
     * This is unexpected and would cause a divide by 0 issue.
     * Not allowing an auto scroll
     */ return 0;
    var currentInRange = current - startOfRange;
    var percentage = currentInRange / range;
    return percentage;
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fqLEa":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getValueFromDistance", ()=>getValueFromDistance);
var _config = require("../../config");
var _configDefault = parcelHelpers.interopDefault(_config);
var _constants = require("../../constants");
var _getPercentage = require("../../get-percentage");
var getValueFromDistance = function getValueFromDistance(distanceToEdge, thresholds) {
    /*
   // This function only looks at the distance to one edge
   // Example: looking at bottom edge
   |----------------------------------|
   |                                  |
   |                                  |
   |                                  |
   |                                  |
   |                                  | => no scroll in this range
   |                                  |
   |                                  |
   |  startScrollingFrom (eg 100px)   |
   |                                  |
   |                                  | => increased scroll value the closer to maxScrollValueAt
   |  maxScrollValueAt (eg 10px)      |
   |                                  | => max scroll value in this range
   |----------------------------------|
   */ // too far away to auto scroll
    if (distanceToEdge > thresholds.startScrollingFrom) return 0;
    // use max speed when on or over boundary
    if (distanceToEdge <= thresholds.maxScrollValueAt) return (0, _configDefault.default).maxPixelScroll;
    // when just going on the boundary return the minimum integer
    if (distanceToEdge === thresholds.startScrollingFrom) return 0, _constants.minScroll;
    // to get the % past startScrollingFrom we will calculate
    // the % the value is from maxScrollValueAt and then invert it
    var percentageFromMaxScrollValueAt = (0, _getPercentage.getPercentage)({
        startOfRange: thresholds.maxScrollValueAt,
        endOfRange: thresholds.startScrollingFrom,
        current: distanceToEdge
    });
    var percentageFromStartScrollingFrom = 1 - percentageFromMaxScrollValueAt;
    var scroll = (0, _configDefault.default).maxPixelScroll * (0, _configDefault.default).ease(percentageFromStartScrollingFrom);
    // scroll will always be a positive integer
    return Math.ceil(scroll);
};

},{"../../config":"6oKPe","../../constants":"9c6fJ","../../get-percentage":"ga5s2","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"8XQn7":[function(require,module,exports,__globalThis) {
// Source: https://github.com/atlassian/react-beautiful-dnd
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _canScroll = require("./can-scroll");
var _getScroll = require("./get-scroll");
var _getScrollDefault = parcelHelpers.interopDefault(_getScroll);
exports.default = function(_ref) {
    var viewport = _ref.viewport, center = _ref.center, dragStartTime = _ref.dragStartTime, shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var scroll = (0, _getScrollDefault.default)({
        dragStartTime: dragStartTime,
        container: viewport.container,
        center: center,
        shouldUseTimeDampening: shouldUseTimeDampening
    });
    return scroll && (0, _canScroll.canScrollWindow)(viewport, scroll) ? scroll : null;
};

},{"./can-scroll":"iBdOU","./get-scroll":"hce0L","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"2c87d":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _cssBoxModel = require("css-box-model");
var _getMaxWindowScroll = require("./get-max-window-scroll");
var _getMaxWindowScrollDefault = parcelHelpers.interopDefault(_getMaxWindowScroll);
var _getWindowScroll = require("./get-window-scroll");
var _getWindowScrollDefault = parcelHelpers.interopDefault(_getWindowScroll);
exports.default = function() {
    var scroll = (0, _getWindowScrollDefault.default)();
    var maxScroll = (0, _getMaxWindowScrollDefault.default)();
    var top = scroll.y;
    var left = scroll.x;
    // window.innerHeight: includes scrollbars (not what we want)
    // document.clientHeight gives us the correct value when using the html5 doctype
    var doc = document.documentElement;
    // Using these values as they do not consider scrollbars
    // padding box, without scrollbar
    var width = doc.clientWidth;
    var height = doc.clientHeight;
    // Computed
    var right = left + width;
    var bottom = top + height;
    var container = (0, _cssBoxModel.getRect)({
        top: top,
        left: left,
        right: right,
        bottom: bottom
    });
    var viewport = {
        container: container,
        scroll: {
            current: scroll,
            max: maxScroll
        }
    };
    return viewport;
};

},{"css-box-model":"353vO","./get-max-window-scroll":"72niM","./get-window-scroll":"44vc9","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"72niM":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _getMaxScroll = require("../get-max-scroll");
var _getMaxScrollDefault = parcelHelpers.interopDefault(_getMaxScroll);
exports.default = function() {
    var doc = document.documentElement;
    var maxScroll = (0, _getMaxScrollDefault.default)({
        // unclipped padding box, with scrollbar
        scrollHeight: doc.scrollHeight,
        scrollWidth: doc.scrollWidth,
        // clipped padding box, without scrollbar
        width: doc.clientWidth,
        height: doc.clientHeight
    });
    return maxScroll;
};

},{"../get-max-scroll":"kWa57","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"kWa57":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _position = require("./position");
exports.default = function(_ref) {
    var scrollHeight = _ref.scrollHeight, scrollWidth = _ref.scrollWidth, height = _ref.height, width = _ref.width;
    var maxScroll = (0, _position.subtract)(// full size
    {
        x: scrollWidth,
        y: scrollHeight
    }, // viewport size
    {
        x: width,
        y: height
    });
    var adjustedMaxScroll = {
        x: Math.max(0, maxScroll.x),
        y: Math.max(0, maxScroll.y)
    };
    return adjustedMaxScroll;
};

},{"./position":"laOpQ","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"44vc9":[function(require,module,exports,__globalThis) {
// The browsers update document.documentElement.scrollTop and window.pageYOffset
// differently as the window scrolls.
// Webkit
// documentElement.scrollTop: no update. Stays at 0
// window.pageYOffset: updates to whole number
// Chrome
// documentElement.scrollTop: update with fractional value
// window.pageYOffset: update with fractional value
// FireFox
// documentElement.scrollTop: updates to whole number
// window.pageYOffset: updates to whole number
// IE11 (same as firefox)
// documentElement.scrollTop: updates to whole number
// window.pageYOffset: updates to whole number
// Edge (same as webkit)
// documentElement.scrollTop: no update. Stays at 0
// window.pageYOffset: updates to whole number
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
exports.default = function() {
    return {
        x: window.pageXOffset,
        y: window.pageYOffset
    };
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"czz1K":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "preventUnhandled", ()=>(0, _preventUnhandled.preventUnhandled));
var _preventUnhandled = require("../public-utils/prevent-unhandled");

},{"../public-utils/prevent-unhandled":"cHRkV","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"cHRkV":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "preventUnhandled", ()=>preventUnhandled);
var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");
var _toConsumableArrayDefault = parcelHelpers.interopDefault(_toConsumableArray);
var _bindEventListener = require("bind-event-listener");
var _detectBrokenDrag = require("../util/detect-broken-drag");
function acceptDrop(event) {
    // if the event is already prevented the event we don't need to do anything
    if (event.defaultPrevented) return;
    // Using "move" as the drop effect as that uses the standard
    // cursor. Doing this so the user doesn't think they are dropping
    // on the page
    // Note: using "none" will not allow a "drop" to occur, so we are using "move"
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    // cancel the default browser behaviour
    // doing this will tell the browser that we have handled the drop
    event.preventDefault();
}
var unbindEvents = null;
/**
 * Block drag operations outside of `@atlaskit/pragmatic-drag-and-drop`
 */ function start() {
    cleanup();
    unbindEvents = (0, _bindEventListener.bindAll)(window, [
        {
            type: 'dragover',
            listener: acceptDrop
        },
        {
            type: 'dragenter',
            listener: acceptDrop
        },
        {
            type: 'drop',
            listener: function listener(event) {
                // our lifecycle manager already prevents events, but just being super safe
                event.preventDefault();
                // not setting dropEffect, as `drop.dropEffect` has already been published to the user
                // (lifecycle-manager binds events in the capture phase)
                // we don't need to wait for "dragend", and "dragend" might not even happen,
                // such as when the draggable has been removed during a drag.
                cleanup();
            }
        },
        {
            type: 'dragend',
            listener: cleanup
        }
    ].concat((0, _toConsumableArrayDefault.default)((0, _detectBrokenDrag.getBindingsForBrokenDrags)({
        onDragEnd: cleanup
    }))), // being clear that these are added in the bubble phase
    {
        capture: false
    });
}
function cleanup() {
    var _unbindEvents;
    (_unbindEvents = unbindEvents) === null || _unbindEvents === void 0 || _unbindEvents();
    unbindEvents = null;
}
/**
 * TODO: for next major, we could look at do the following:
 *
 * ```diff
 * - preventUnhandled.start();
 * - preventUnhandled.stop();
 * + const stop = preventUnhandled();
 * ```
 */ function stop() {
    var _window$event;
    /**
   * if `stop()` is called in a `"drop"` event, then `event.preventDefault()` won't be called.
   * Our `"drop"` listener calls `event.preventDefault()` for handled drop events
   * ("drop" events caused by dropping over a drop target)
   * `preventUnhandled()` causes every element to become a drop target (according to the browser)
   *
   * To opt out of the default behaviour for a `"drop"` event, we need to make sure
   * that we cancel it.
   *
   * The `"drop"` event listener in core is in the `capture` phase, so people calling
   * `preventUnhandled.stop()` in `onDrop()` will remove the `"drop"` event listener in this
   * file before it has the chance to cancel the event.
   *
   * Being sneaky and using the `window.event` global to sniff out the current event
   */ if (((_window$event = window.event) === null || _window$event === void 0 ? void 0 : _window$event.type) === 'drop') {
        var _window$event2;
        (_window$event2 = window.event) === null || _window$event2 === void 0 || _window$event2.preventDefault();
    }
    cleanup();
}
var preventUnhandled = {
    start: start,
    stop: stop
};

},{"@babel/runtime/helpers/toConsumableArray":"bCb5n","bind-event-listener":"4KK82","../util/detect-broken-drag":"gUV8w","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"jHSrm":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Returns the rule string for drag handle styles.
 */ parcelHelpers.export(exports, "getDragHandleRuleString", ()=>getDragHandleRuleString);
parcelHelpers.export(exports, "default", ()=>useStyleMarshal);
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
/**
 * This is a vastly simplified version of the style marshal in `react-beautiful-dnd`.
 *
 * Most of the styles have been removed, as they are not required for native dragging.
 * They were only required in `react-beautiful-dnd` because it emulated dragging.
 */ var _useIsomorphicLayoutEffect = require("../../hooks/use-isomorphic-layout-effect");
var _attributes = require("../../utils/attributes");
/**
 * Used to uniquely identify the style element.
 */ var styleContextIdAttribute = 'data-rbd-style-context-id';
/**
 * Returns the CSS string for the rule with the given selector and style
 * declarations.
 */ function getRuleString(_ref) {
    var selector = _ref.selector, styles = _ref.styles;
    var concatString = Object.entries(styles).map(function(_ref2) {
        var _ref3 = (0, _slicedToArrayDefault.default)(_ref2, 2), property = _ref3[0], value = _ref3[1];
        return "".concat(property, ": ").concat(value, ";");
    }).join(' ');
    return "".concat(selector, " { ").concat(concatString, " }");
}
function getDragHandleRuleString(contextId) {
    var selector = "[".concat((0, _attributes.attributes).dragHandle.contextId, "=\"").concat(contextId, "\"]");
    var styles = {
        /**
     * Indicates the element is draggable.
     *
     * Although this is always applied, it will not be visible during drags
     * because the browser will override the cursor.
     */ cursor: 'grab',
        /**
     * Improves the UX when dragging links on iOS.
     *
     * Without this a preview of the link will open. Although it is still
     * draggable, it is inconsistent with `react-beautiful-dnd`.
     */ '-webkit-touch-callout': 'none'
    };
    return getRuleString({
        selector: selector,
        styles: styles
    });
}
function createStyleEl(_ref4) {
    var contextId = _ref4.contextId, nonce = _ref4.nonce;
    var el = document.createElement('style');
    if (nonce) el.setAttribute('nonce', nonce);
    el.setAttribute(styleContextIdAttribute, contextId);
    document.head.appendChild(el);
    return el;
}
function createStyleManager(_ref5) {
    var contextId = _ref5.contextId, nonce = _ref5.nonce;
    var el = createStyleEl({
        contextId: contextId,
        nonce: nonce
    });
    /**
   * Inject the style content.
   */ el.textContent = getDragHandleRuleString(contextId);
    return function cleanup() {
        el.remove();
    };
}
function useStyleMarshal(_ref6) {
    var contextId = _ref6.contextId, nonce = _ref6.nonce;
    (0, _useIsomorphicLayoutEffect.useLayoutEffect)(function() {
        return createStyleManager({
            contextId: contextId,
            nonce: nonce
        });
    }, [
        contextId,
        nonce
    ]);
}

},{"@babel/runtime/helpers/slicedToArray":"6AJmz","../../hooks/use-isomorphic-layout-effect":"dQmso","../../utils/attributes":"ckBmU","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"dQmso":[function(require,module,exports,__globalThis) {
/**
 * Avoids a warning being printed during SSR.
 *
 * See article for further information:
 * <https://medium.com/@alexandereardon/uselayouteffect-and-ssr-192986cdcf7a>
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Ensure the name used in components is useLayoutEffect
parcelHelpers.export(exports, "useLayoutEffect", ()=>useIsomorphicLayoutEffect);
var _react = require("react");
var useIsomorphicLayoutEffect = typeof window !== 'undefined' ? (0, _react.useLayoutEffect) : (0, _react.useEffect);

},{"react":"f39IF","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"6NaFx":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Creates a new lifecycle manager, returning methods for interfacing with it.
 */ parcelHelpers.export(exports, "useLifecycle", ()=>useLifecycle);
parcelHelpers.export(exports, "LifecycleContextProvider", ()=>LifecycleContextProvider);
parcelHelpers.export(exports, "useMonitorForLifecycle", ()=>useMonitorForLifecycle);
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
/**
 * The lifecycle methods owned by this provided are used to align internal
 * timings with those of the rbd lifecycle.
 *
 * The events are intentionally distinct to those exposed by rbd to avoid
 * any confusion around whether events are fired internally or externally
 * first.
 */ var _react = require("react");
var _reactDefault = parcelHelpers.interopDefault(_react);
var _combine = require("@atlaskit/pragmatic-drag-and-drop/combine");
var _batchUpdatesForReact16 = require("../utils/batch-updates-for-react-16");
var _rbdInvariant = require("./rbd-invariant");
function _createForOfIteratorHelper(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (!t) {
        if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
            t && (r = t);
            var _n = 0, F = function F() {};
            return {
                s: F,
                n: function n() {
                    return _n >= r.length ? {
                        done: !0
                    } : {
                        done: !1,
                        value: r[_n++]
                    };
                },
                e: function e(r) {
                    throw r;
                },
                f: F
            };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o, a = !0, u = !1;
    return {
        s: function s() {
            t = t.call(r);
        },
        n: function n() {
            var r = t.next();
            return a = r.done, r;
        },
        e: function e(r) {
            u = !0, o = r;
        },
        f: function f() {
            try {
                a || null == t.return || t.return();
            } finally{
                if (u) throw o;
            }
        }
    };
}
function _unsupportedIterableToArray(r, a) {
    if (r) {
        if ("string" == typeof r) return _arrayLikeToArray(r, a);
        var t = ({}).toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
}
function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for(var e = 0, n = Array(a); e < a; e++)n[e] = r[e];
    return n;
}
/**
 * The data associated with each type of lifecycle event.
 */ function createRegistry() {
    return {
        onPendingDragStart: [],
        onPrePendingDragUpdate: [],
        onPendingDragUpdate: [],
        onBeforeDragEnd: []
    };
}
function createLifecycleManager() {
    var registry = createRegistry();
    var addResponder = function addResponder(event, responder) {
        registry[event].push(responder);
        return function() {
            // @ts-expect-error - type narrowing issues
            registry[event] = registry[event].filter(function(value) {
                return value !== responder;
            });
        };
    };
    var dispatch = function dispatch(event, data) {
        (0, _batchUpdatesForReact16.batchUpdatesForReact16)(function() {
            var _iterator = _createForOfIteratorHelper(registry[event]), _step;
            try {
                for(_iterator.s(); !(_step = _iterator.n()).done;){
                    var _responder = _step.value;
                    _responder(data);
                }
            } catch (err) {
                _iterator.e(err);
            } finally{
                _iterator.f();
            }
        });
    };
    return {
        addResponder: addResponder,
        dispatch: dispatch
    };
}
function useLifecycle() {
    var _useState = (0, _react.useState)(createLifecycleManager), _useState2 = (0, _slicedToArrayDefault.default)(_useState, 1), lifecycleManager = _useState2[0];
    return lifecycleManager;
}
var LifecycleContext = /*#__PURE__*/ (0, _react.createContext)(null);
function LifecycleContextProvider(_ref) {
    var children = _ref.children, lifecycle = _ref.lifecycle;
    /**
   * Allows for `<Draggable>` and `<Droppable>` instances to know about the
   * lifecycle timings.
   *
   * Designed to have a similar API to the pdnd monitors.
   */ var monitorForLifecycle = (0, _react.useCallback)(function(responders) {
        var cleanupFns = [];
        for(var _i = 0, _Object$entries = Object.entries(responders); _i < _Object$entries.length; _i++){
            var entry = _Object$entries[_i];
            var _ref2 = entry, _ref3 = (0, _slicedToArrayDefault.default)(_ref2, 2), _event = _ref3[0], _responder2 = _ref3[1];
            cleanupFns.push(lifecycle.addResponder(_event, _responder2));
        }
        return (0, _combine.combine).apply(void 0, cleanupFns);
    }, [
        lifecycle
    ]);
    return /*#__PURE__*/ (0, _reactDefault.default).createElement(LifecycleContext.Provider, {
        value: monitorForLifecycle
    }, children);
}
function useMonitorForLifecycle() {
    var monitorForLifecycle = (0, _react.useContext)(LifecycleContext);
    (0, _rbdInvariant.rbdInvariant)(monitorForLifecycle !== null, 'useLifecycle() should only be called inside of a <DragDropContext />');
    return monitorForLifecycle;
}

},{"@babel/runtime/helpers/slicedToArray":"6AJmz","react":"f39IF","@atlaskit/pragmatic-drag-and-drop/combine":"6avx6","../utils/batch-updates-for-react-16":"9TfdT","./rbd-invariant":"gHZ28","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"9TfdT":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "batchUpdatesForReact16", ()=>batchUpdatesForReact16);
var _reactDom = require("react-dom");
var schedule = function() {
    /**
   * We only want to do this manual batching for version 16 of React.
   *
   * Version 18 will automatically batch updates.
   */ if (// `unstable_batchedUpdates` is defined in all currently supported versions
    // but could be removed in the future.
    // This check is defensive and not currently necessary.
    typeof (0, _reactDom.unstable_batchedUpdates) === 'function' && // The version export was only introduced in `react-dom@16.13.0`
    // but we need to support `react-dom@^16.8.0`
    // so we need to handle when the version is `undefined`
    (typeof (0, _reactDom.version) === 'undefined' || (0, _reactDom.version).startsWith('16'))) return 0, _reactDom.unstable_batchedUpdates;
    // Relying on react@18 to do automatic batching
    return function(callback) {
        return callback();
    };
}();
function batchUpdatesForReact16(callback) {
    schedule(callback);
}

},{"react-dom":"fc7O8","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fc7O8":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "render", ()=>render);
parcelHelpers.export(exports, "createPortal", ()=>createPortal);
parcelHelpers.export(exports, "unstable_batchedUpdates", ()=>unstable_batchedUpdates);
parcelHelpers.export(exports, "version", ()=>version);
const { render, createPortal } = wp.element;
const unstable_batchedUpdates = wp.element.unstable_batchedUpdates || function(fn, ...args) {
    // naive fallback: just call fn synchronously (no batching)
    return fn(...args);
};
const version = '18.2.0';
exports.default = {
    render,
    createPortal,
    unstable_batchedUpdates,
    version
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"7WqNO":[function(require,module,exports,__globalThis) {
/**
 * This is defined in the migration package instead of using `@atlaskit/pragmatic-drag-and-drop-live-region`
 * because RBD-style dragging has different needs to the alternative flows of PDND.
 *
 * RBD can make a lot of announcements in a short period, so delaying messages is not feasible.
 * RBD also maintains focus while dragging, so messages being skipped is less of a concern.
 *
 * `@atlaskit/pragmatic-drag-and-drop-live-region` has been tailored for PDND-specific alternative flows,
 * where focus usually changes around the time `announce()` is called. So in `@atlaskit/pragmatic-drag-and-drop-live-region`
 * messages have delays to avoid them being skipped.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Announces the provided message to assistive technology.
 */ parcelHelpers.export(exports, "announce", ()=>announce);
/**
 * Removes the created live region. If there is no live region this is a no-op.
 */ parcelHelpers.export(exports, "cleanup", ()=>cleanup);
var node = null;
var size = '1px';
var visuallyHiddenStyles = {
    // Standard visually hidden styles.
    // Copied from our VisuallyHidden (react) package.
    width: size,
    height: size,
    padding: '0',
    position: 'absolute',
    border: '0',
    clip: "rect(".concat(size, ", ").concat(size, ", ").concat(size, ", ").concat(size, ")"),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    // Pulling upwards slightly to prevent the page
    // from growing when appended to a body that contains
    // an element with height:100%
    marginTop: "-".concat(size),
    // Just being safe and letting this element not interfere with hitboxes
    pointerEvents: 'none'
};
/**
 * Creates a live region node, appends it to the body, and returns it.
 */ function createNode() {
    var node = document.createElement('div');
    node.setAttribute('role', 'alert');
    Object.assign(node.style, visuallyHiddenStyles);
    document.body.append(node);
    return node;
}
/**
 * Returns the live region node, creating one if necessary.
 */ function getNode() {
    if (node === null) node = createNode();
    return node;
}
function announce(message) {
    var node = getNode();
    node.textContent = message;
}
function cleanup() {
    var _node;
    (_node = node) === null || _node === void 0 || _node.remove();
    node = null;
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fKeXi":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "defaultMessage", ()=>defaultMessage);
parcelHelpers.export(exports, "getDefaultMessage", ()=>getDefaultMessage);
parcelHelpers.export(exports, "getProvided", ()=>getProvided);
parcelHelpers.export(exports, "defaultDragHandleUsageInstructions", ()=>defaultDragHandleUsageInstructions);
var _devWarning = require("../dev-warning");
function getPosition(location) {
    return location.index + 1;
}
var defaultMessage = {
    onDragStart: function onDragStart(_ref) {
        var source = _ref.source;
        var startPosition = getPosition(source);
        return "You have lifted an item in position ".concat(startPosition, ".");
    },
    onDragUpdate: function onDragUpdate(_ref2) {
        var source = _ref2.source, destination = _ref2.destination;
        if (!destination) return 'You are currently not dragging over a droppable area.';
        var startPosition = getPosition(source);
        var endPosition = getPosition(destination);
        var isSameList = source.droppableId === destination.droppableId;
        if (isSameList) return "You have moved the item from position ".concat(startPosition, " to position ").concat(endPosition, ".");
        return "You have moved the item from position ".concat(startPosition, " in list ").concat(source.droppableId, " to list ").concat(destination.droppableId, " in position ").concat(endPosition, ".");
    },
    onDragEnd: function onDragEnd(_ref3) {
        var source = _ref3.source, destination = _ref3.destination, reason = _ref3.reason;
        var startPosition = getPosition(source);
        if (reason === 'CANCEL') return "Movement cancelled. The item has returned to its starting position of ".concat(startPosition, ".");
        if (!destination) return "The item has been dropped while not over a droppable location. The item has returned to its starting position of ".concat(startPosition, ".");
        var endPosition = getPosition(destination);
        var isSameList = source.droppableId === destination.droppableId;
        if (isSameList) return "You have dropped the item. It has moved from position ".concat(startPosition, " to ").concat(endPosition, ".");
        return "You have dropped the item. It has moved from position ".concat(startPosition, " in list ").concat(source.droppableId, " to position ").concat(endPosition, " in list ").concat(destination.droppableId, ".");
    }
};
function getDefaultMessage(event, data) {
    // @ts-expect-error - narrowing issue
    return defaultMessage[event](data);
}
function getProvided(event, data) {
    /**
   * The custom message to be used.
   */ var userMessage = null;
    /**
   * Whether the message has been read yet.
   *
   * After it has been read, the user can no longer override it.
   */ var hasExpired = false;
    var provided = {
        /**
     * Used to capture custom messages for screen readers.
     *
     * Does not announce directly, but exposes the message that should be
     * announced. This may or may not be the default message.
     */ announce: function announce(message) {
            if (userMessage) (0, _devWarning.warning)('Announcement already made. Not making a second announcement');
            if (hasExpired) (0, _devWarning.warning)("\n            Announcements cannot be made asynchronously.\n            Default message has already been announced.\n          ");
            userMessage = message;
        }
    };
    /**
   * Returns the message that should be announced.
   */ function getMessage() {
        hasExpired = true;
        return userMessage !== null && userMessage !== void 0 ? userMessage : getDefaultMessage(event, data);
    }
    return {
        provided: provided,
        getMessage: getMessage
    };
}
var defaultDragHandleUsageInstructions = "\n  Press space bar to start a drag.\n  When dragging you can use the arrow keys to move the item around and escape to cancel.\n  Some screen readers may require you to be in focus mode or to use your pass through key\n";

},{"../dev-warning":"lA7oL","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"72NXx":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Used to schedule callbacks inside of a `setTimeout(fn, 0)`.
 *
 * This is used to match the behavior and timings of `react-beautiful-dnd`.
 */ parcelHelpers.export(exports, "useScheduler", ()=>useScheduler);
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
var _react = require("react");
var _batchUpdatesForReact16 = require("../utils/batch-updates-for-react-16");
var idleQueue = {
    status: 'idle'
};
function createScheduler() {
    var queue = idleQueue;
    var schedule = function schedule(callback) {
        /**
     * If the queue is currently idle (no update scheduled) then
     * we should call `setTimeout` to schedule an update.
     */ if (queue.status === 'idle') queue = {
            status: 'pending',
            timeoutId: setTimeout(flush, 0),
            items: []
        };
        queue.items.push(callback);
    };
    var flush = function flush() {
        if (queue.status === 'idle') return;
        /**
     * Clearing the timeout optimistically in case `flush` was called directly.
     */ clearTimeout(queue.timeoutId);
        /**
     * A shallow copy is used so that updates which queue further updates
     * are not batched together. This is to more closely match rbd.
     */ var items = Array.from(queue.items);
        /**
     * The queue is made idle so it is ready to schedule further updates.
     */ queue = idleQueue;
        /**
     * Scheduled callbacks are batched.
     *
     * The batching is more evident when the page is running more slowly.
     */ (0, _batchUpdatesForReact16.batchUpdatesForReact16)(function() {
            items.forEach(function(callback) {
                return callback();
            });
        });
    };
    return {
        schedule: schedule,
        flush: flush
    };
}
function useScheduler() {
    var _useState = (0, _react.useState)(createScheduler), _useState2 = (0, _slicedToArrayDefault.default)(_useState, 1), scheduler = _useState2[0];
    return scheduler;
}

},{"@babel/runtime/helpers/slicedToArray":"6AJmz","react":"f39IF","../utils/batch-updates-for-react-16":"9TfdT","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"bry8a":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Draggable", ()=>Draggable);
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
var _react = require("react");
var _reactDefault = parcelHelpers.interopDefault(_react);
var _bindEventListener = require("bind-event-listener");
var _tinyInvariant = require("tiny-invariant");
var _tinyInvariantDefault = parcelHelpers.interopDefault(_tinyInvariant);
var _combine = require("@atlaskit/pragmatic-drag-and-drop/combine");
var _adapter = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var _disableNativeDragPreview = require("@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview");
var _getElementFromPointWithoutHoneyPot = require("@atlaskit/pragmatic-drag-and-drop/private/get-element-from-point-without-honey-pot");
var _useHiddenTextElement = require("../drag-drop-context/hooks/use-hidden-text-element");
var _internalContext = require("../drag-drop-context/internal-context");
var _lifecycleContext = require("../drag-drop-context/lifecycle-context");
var _rbdInvariant = require("../drag-drop-context/rbd-invariant");
var _droppableContext = require("../droppable/droppable-context");
var _useCapturedDimensions = require("../hooks/use-captured-dimensions");
var _useCleanupFn = require("../hooks/use-cleanup-fn");
var _useDropTargetForDraggable = require("../hooks/use-drop-target-for-draggable");
var _useKeyboardContext = require("../hooks/use-keyboard-context");
var _attributes = require("../utils/attributes");
var _findDragHandle = require("../utils/find-drag-handle");
var _findDropIndicator = require("../utils/find-drop-indicator");
var _findPlaceholder = require("../utils/find-placeholder");
var _useStable = require("../utils/use-stable");
var _data = require("./data");
var _getDraggableProvidedStyle = require("./get-draggable-provided-style");
var _isEventInInteractiveElement = require("./is-event-in-interactive-element");
var _isEventInInteractiveElementDefault = parcelHelpers.interopDefault(_isEventInInteractiveElement);
var _placeholder = require("./placeholder");
var _state = require("./state");
var _useDraggableStateSnapshot = require("./use-draggable-state-snapshot");
var noop = function noop() {};
function Draggable(_ref) {
    var children = _ref.children, draggableId = _ref.draggableId, index = _ref.index, _ref$isDragDisabled = _ref.isDragDisabled, isDragDisabled = _ref$isDragDisabled === void 0 ? false : _ref$isDragDisabled, _ref$disableInteracti = _ref.disableInteractiveElementBlocking, disableInteractiveElementBlocking = _ref$disableInteracti === void 0 ? false : _ref$disableInteracti;
    var _useDroppableContext = (0, _droppableContext.useDroppableContext)(), direction = _useDroppableContext.direction, droppableId = _useDroppableContext.droppableId, type = _useDroppableContext.type, mode = _useDroppableContext.mode;
    var _useDragDropContext = (0, _internalContext.useDragDropContext)(), contextId = _useDragDropContext.contextId, getDragState = _useDragDropContext.getDragState;
    var elementRef = (0, _react.useRef)(null);
    var dragHandleRef = (0, _react.useRef)(null);
    var _useCleanupFn1 = (0, _useCleanupFn.useCleanupFn)(), setCleanupFn = _useCleanupFn1.setCleanupFn, runCleanupFn = _useCleanupFn1.runCleanupFn;
    var setElement = (0, _react.useCallback)(function(element) {
        if (elementRef.current) /**
       * Call the `setAttribute` clean up if the element changes
       */ runCleanupFn();
        if (element) {
            /**
       * The migration layer attaches some additional data attributes.
       *
       * These are required for querying elements in the DOM.
       *
       * These are not applied through render props, to avoid changing the type
       * interface of the migration layer.
       */ var cleanupFn = (0, _attributes.setAttributes)(element, (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({}, (0, _attributes.customAttributes).draggable.droppableId, droppableId), (0, _attributes.customAttributes).draggable.index, String(index)));
            setCleanupFn(cleanupFn);
        }
        elementRef.current = element;
        dragHandleRef.current = (0, _findDragHandle.findDragHandle)({
            contextId: contextId,
            draggableId: draggableId
        });
    }, [
        contextId,
        draggableId,
        droppableId,
        index,
        runCleanupFn,
        setCleanupFn
    ]);
    var getIndex = (0, _useStable.useStable)(index);
    var _useReducer = (0, _react.useReducer)((0, _state.reducer), (0, _state.idleState)), _useReducer2 = (0, _slicedToArrayDefault.default)(_useReducer, 2), state = _useReducer2[0], dispatch = _useReducer2[1];
    var data = (0, _data.useDraggableData)({
        draggableId: draggableId,
        droppableId: droppableId,
        getIndex: getIndex,
        contextId: contextId,
        type: type
    });
    var isDragging = state.type === 'dragging';
    var isHiding = state.type === 'hiding';
    var _useDroppableContext2 = (0, _droppableContext.useDroppableContext)(), shouldRenderCloneWhileDragging = _useDroppableContext2.shouldRenderCloneWhileDragging, isDropDisabled = _useDroppableContext2.isDropDisabled;
    var monitorForLifecycle = (0, _lifecycleContext.useMonitorForLifecycle)();
    var _useKeyboardContext1 = (0, _useKeyboardContext.useKeyboardContext)(), startKeyboardDrag = _useKeyboardContext1.startKeyboardDrag;
    /**
   * Binds the `keydown` listener to the drag handle which handles starting
   * keyboard drags.
   */ (0, _react.useEffect)(function() {
        if (state.type !== 'idle') return;
        if (isDragDisabled) return;
        var element = elementRef.current;
        (0, _tinyInvariantDefault.default)(element instanceof HTMLElement);
        var dragHandle = dragHandleRef.current;
        (0, _tinyInvariantDefault.default)(dragHandle instanceof HTMLElement);
        return (0, _bindEventListener.bindAll)(dragHandle, [
            {
                type: 'keydown',
                listener: function listener(event) {
                    if (event.key === ' ') {
                        if (event.defaultPrevented) return;
                        if (!disableInteractiveElementBlocking && (0, _isEventInInteractiveElementDefault.default)(element, event)) return;
                        // Only prevent default if we are consuming it
                        event.preventDefault();
                        startKeyboardDrag({
                            event: event,
                            draggableId: draggableId,
                            type: type,
                            getSourceLocation: function getSourceLocation() {
                                return {
                                    droppableId: droppableId,
                                    index: getIndex()
                                };
                            },
                            sourceElement: element
                        });
                    }
                }
            }
        ]);
    }, [
        disableInteractiveElementBlocking,
        draggableId,
        droppableId,
        getIndex,
        isDragDisabled,
        startKeyboardDrag,
        state.type,
        type
    ]);
    /**
   * Sets up the pdnd draggable.
   */ (0, _react.useEffect)(function() {
        if (isHiding) /**
       * If we render a clone, then we need to unmount the original element.
       *
       * Because of this, `elementRef.current` will become `null` and we will
       * no longer have a valid `element` reference.
       *
       * In this case, not having a valid `element` is expected,
       * instead of being an error.
       */ return;
        if (isDragDisabled) return;
        var element = elementRef.current;
        (0, _rbdInvariant.rbdInvariant)(element instanceof HTMLElement);
        var dragHandle = dragHandleRef.current;
        (0, _rbdInvariant.rbdInvariant)(dragHandle instanceof HTMLElement);
        return (0, _adapter.draggable)({
            canDrag: function canDrag(_ref2) {
                var input = _ref2.input;
                /**
         * Do not start a drag if any modifier key is pressed.
         * This matches the behavior of `react-beautiful-dnd`.
         */ if (input.ctrlKey || input.metaKey || input.shiftKey || input.altKey) return false;
                /**
         * To align with `react-beautiful-dnd` we are blocking drags
         * on interactive elements, unless the `disableInteractiveElementBlocking`
         * prop is provided.
         */ if (!disableInteractiveElementBlocking) {
                    var elementUnderPointer = (0, _getElementFromPointWithoutHoneyPot.getElementFromPointWithoutHoneypot)({
                        x: input.clientX,
                        y: input.clientY
                    });
                    return !(0, _isEventInInteractiveElement.isAnInteractiveElement)(dragHandle, elementUnderPointer);
                }
                return !isDragging;
            },
            element: element,
            dragHandle: dragHandle,
            getInitialData: function getInitialData() {
                return data;
            },
            onGenerateDragPreview: (0, _disableNativeDragPreview.disableNativeDragPreview)
        });
    }, [
        data,
        disableInteractiveElementBlocking,
        isDragDisabled,
        isDragging,
        isHiding
    ]);
    var hasPlaceholder = state.type !== 'idle' && mode === 'standard';
    var placeholderRef = (0, _react.useRef)(null);
    (0, _useDropTargetForDraggable.useDropTargetForDraggable)({
        /**
     * Swapping the drop target to the placeholder is important
     * to ensure that hovering over where the item was won't result in a
     * drop at the end of the list.
     */ elementRef: hasPlaceholder ? placeholderRef : elementRef,
        data: data,
        direction: direction,
        contextId: contextId,
        isDropDisabled: isDropDisabled,
        type: type
    });
    var isMountedRef = (0, _react.useRef)(true);
    (0, _react.useEffect)(function() {
        /**
     * React 18 strict mode will re-run effects in development mode.
     * https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-effects-in-development
     *
     * Setting the ref value to `true` again in the effect to avoid the value staying `false` incorrectly after
     * the first cleanup.
     */ isMountedRef.current = true;
        return function() {
            isMountedRef.current = false;
        };
    }, []);
    /**
   * If the draggable (re)mounts while it is being dragged (via a clone),
   * then it should hide itself.
   */ (0, _react.useEffect)(function() {
        var dragState = getDragState();
        /**
     * If the draggable is not using a clone, then it doesn't need to be hidden.
     */ if (!shouldRenderCloneWhileDragging) return;
        /**
     * If there is no ongoing drag, then it doesn't need to be hidden.
     */ if (!dragState.isDragging) return;
        /**
     * Only the draggable being dragged (via a clone) needs to be hidden.
     */ if (dragState.draggableId !== data.draggableId) return;
        dispatch({
            type: 'START_HIDING',
            payload: {
                mode: dragState.mode
            }
        });
    }, [
        data.draggableId,
        getDragState,
        shouldRenderCloneWhileDragging
    ]);
    var draggableDimensions = (0, _useCapturedDimensions.useDraggableDimensions)();
    (0, _react.useEffect)(function() {
        /**
     * If the draggable should render a clone while dragging,
     * then it doesn't need to track any state, and it should be hidden.
     */ if (shouldRenderCloneWhileDragging) return monitorForLifecycle({
            onPendingDragStart: function onPendingDragStart(_ref3) {
                var start = _ref3.start;
                if (data.draggableId !== start.draggableId) return;
                dispatch({
                    type: 'START_HIDING',
                    payload: {
                        mode: start.mode
                    }
                });
            },
            onBeforeDragEnd: function onBeforeDragEnd(_ref4) {
                var draggableId = _ref4.draggableId;
                if (draggableId !== data.draggableId) return;
                dispatch({
                    type: 'STOP_HIDING'
                });
            }
        });
        /**
     * Drag events need to be monitored independently because the original
     * element can be unmounted for two (valid) reasons.
     *
     * The original element can be unmounted during the drag for two reasons:
     *
     * 1. A `renderClone` method has been provided to the containing
     *    `<Droppable />` element. In this case the element is unmounted so
     *    that it is not visible while the clone is.
     *
     * 2. The user portals the element while it is being dragged. This would
     *    result in the original `HTMLElement` being unmounted.
     */ return (0, _combine.combine)(monitorForLifecycle({
            onPendingDragStart: function onPendingDragStart(_ref5) {
                var start = _ref5.start, droppable = _ref5.droppable;
                if (data.draggableId !== start.draggableId) return;
                if (start.mode === 'FLUID') return dispatch({
                    type: 'START_POINTER_DRAG',
                    payload: {
                        start: start
                    }
                });
                if (start.mode === 'SNAP') {
                    var dragState = getDragState();
                    (0, _rbdInvariant.rbdInvariant)(dragState.isDragging && dragState.draggableDimensions);
                    return dispatch({
                        type: 'START_KEYBOARD_DRAG',
                        payload: {
                            start: start,
                            draggableDimensions: dragState.draggableDimensions,
                            droppable: droppable
                        }
                    });
                }
            },
            onPendingDragUpdate: function onPendingDragUpdate(_ref6) {
                var update = _ref6.update, droppable = _ref6.droppable;
                if (data.draggableId !== update.draggableId) return;
                dispatch({
                    type: 'UPDATE_DRAG',
                    payload: {
                        update: update
                    }
                });
                if (update.mode === 'SNAP') /**
           * Updating the position in a microtask to resolve timing issues.
           *
           * When doing cross-axis dragging, the drop indicator in the new
           * droppable will mount and update in a `onPendingDragUpdate` too.
           *
           * The microtask ensures that the indicator will have updated by
           * the time this runs, so the preview will have the correct
           * location of the indicator.
           */ queueMicrotask(function() {
                    /**
             * Because this update occurs in a microtask, we need to check
             * that the drag is still happening.
             *
             * If it has ended we should not try to update the preview.
             */ var dragState = getDragState();
                    if (!dragState.isDragging) return;
                    /**
             * The placeholder might not exist if its associated
             * draggable unmounts in a virtual list.
             */ var placeholder = (0, _findPlaceholder.findPlaceholder)(contextId);
                    var placeholderRect = placeholder ? placeholder.getBoundingClientRect() : null;
                    /**
             * The drop indicator might not exist if the current target
             * is null
             */ var dropIndicator = (0, _findDropIndicator.findDropIndicator)();
                    var dropIndicatorRect = dropIndicator ? dropIndicator.getBoundingClientRect() : null;
                    dispatch({
                        type: 'UPDATE_KEYBOARD_PREVIEW',
                        payload: {
                            update: update,
                            draggableDimensions: draggableDimensions,
                            droppable: droppable,
                            placeholderRect: placeholderRect,
                            dropIndicatorRect: dropIndicatorRect
                        }
                    });
                });
            },
            onBeforeDragEnd: function onBeforeDragEnd(_ref7) {
                var draggableId = _ref7.draggableId;
                if (draggableId !== data.draggableId) return;
                (0, _rbdInvariant.rbdInvariant)(isMountedRef.current, 'isMounted onBeforeDragEnd');
                dispatch({
                    type: 'DROP'
                });
            }
        }), (0, _adapter.monitorForElements)({
            canMonitor: function canMonitor(_ref8) {
                var source = _ref8.source;
                if (!(0, _data.isDraggableData)(source.data)) // not dragging something from the migration layer
                // we should not monitor it
                return false;
                return source.data.contextId === data.contextId && source.data.draggableId === data.draggableId;
            },
            onDrag: function onDrag(_ref9) {
                var location = _ref9.location;
                dispatch({
                    type: 'UPDATE_POINTER_PREVIEW',
                    payload: {
                        pointerLocation: location
                    }
                });
            }
        }));
    }, [
        data.draggableId,
        data.contextId,
        monitorForLifecycle,
        shouldRenderCloneWhileDragging,
        direction,
        contextId,
        draggableDimensions,
        getDragState
    ]);
    var provided = (0, _react.useMemo)(function() {
        return {
            draggableProps: (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({}, (0, _attributes.attributes).draggable.contextId, contextId), (0, _attributes.attributes).draggable.id, draggableId), "style", (0, _getDraggableProvidedStyle.getDraggableProvidedStyle)({
                draggableDimensions: draggableDimensions,
                draggableState: state
            })),
            dragHandleProps: (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({
                role: 'button',
                'aria-describedby': (0, _useHiddenTextElement.getHiddenTextElementId)(contextId)
            }, (0, _attributes.attributes).dragHandle.contextId, contextId), (0, _attributes.attributes).dragHandle.draggableId, draggableId), "tabIndex", 0), "draggable", false), "onDragStart", noop),
            innerRef: setElement
        };
    }, [
        contextId,
        draggableId,
        draggableDimensions,
        state,
        setElement
    ]);
    var snapshot = (0, _useDraggableStateSnapshot.useDraggableStateSnapshot)({
        draggingOver: state.draggingOver,
        isClone: false,
        isDragging: isDragging,
        mode: isDragging ? state.mode : null
    });
    var rubric = (0, _react.useMemo)(function() {
        return {
            draggableId: draggableId,
            type: type,
            source: {
                droppableId: droppableId,
                index: index
            }
        };
    }, [
        draggableId,
        droppableId,
        index,
        type
    ]);
    return /*#__PURE__*/ (0, _reactDefault.default).createElement((0, _reactDefault.default).Fragment, null, isHiding ? null : children(provided, snapshot, rubric), hasPlaceholder && /*#__PURE__*/ (0, _reactDefault.default).createElement((0, _placeholder.Placeholder), {
        ref: placeholderRef
    }));
}

},{"@babel/runtime/helpers/slicedToArray":"6AJmz","@babel/runtime/helpers/defineProperty":"4x6r7","react":"f39IF","bind-event-listener":"4KK82","tiny-invariant":"fnIPv","@atlaskit/pragmatic-drag-and-drop/combine":"6avx6","@atlaskit/pragmatic-drag-and-drop/element/adapter":"3xAZN","@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview":"UfDP2","@atlaskit/pragmatic-drag-and-drop/private/get-element-from-point-without-honey-pot":"hkYWI","../drag-drop-context/hooks/use-hidden-text-element":"7NaCi","../drag-drop-context/internal-context":"8SB2G","../drag-drop-context/lifecycle-context":"6NaFx","../drag-drop-context/rbd-invariant":"gHZ28","../droppable/droppable-context":"gvWJJ","../hooks/use-captured-dimensions":"guEId","../hooks/use-cleanup-fn":"lAG2A","../hooks/use-drop-target-for-draggable":"eTJ7k","../hooks/use-keyboard-context":"6Ehdd","../utils/attributes":"ckBmU","../utils/find-drag-handle":"hTk1K","../utils/find-drop-indicator":"4wb4R","../utils/find-placeholder":"9KplE","../utils/use-stable":"6ybZi","./data":"6qWMC","./get-draggable-provided-style":"fyLQA","./is-event-in-interactive-element":"2Omjp","./placeholder":"30Upc","./state":"56j6z","./use-draggable-state-snapshot":"eUASm","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"UfDP2":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "disableNativeDragPreview", ()=>(0, _disableNativeDragPreview.disableNativeDragPreview));
var _disableNativeDragPreview = require("../../public-utils/element/disable-native-drag-preview");

},{"../../public-utils/element/disable-native-drag-preview":"5YH5o","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"5YH5o":[function(require,module,exports,__globalThis) {
// In order to disable the native drag preview you can
// use `event.dataTransfer.setDragImage()` to set a small
// invisible image as the drag preview.
// There are alternative techniques,
// (eg setting opacity to in onGenerateDragPreview and then 1 in onDragStart)
// but the technique in this file worked best across browsers and platforms
// Here we are preloading the image so that it is ready for the first drag.
// Even though the image is base64 encoded, the browser queues an async task
// to decode the image. The image needs to be decoded before it can be used
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "disableNativeDragPreview", ()=>disableNativeDragPreview);
var tinyTransparentImage = function() {
    // SSR safe
    if (typeof window === 'undefined') return null;
    // Image generated by: https://png-pixel.com/
    // It is a 1x1 transparent gif
    // It is the smallest possible transparent image we could find that works on all platforms
    // Note: using an encoded SVG would be nicer code, but it doesn't work on iOS
    var img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    return img;
}();
function disableNativeDragPreview(_ref) {
    var nativeSetDragImage = _ref.nativeSetDragImage;
    if (nativeSetDragImage && tinyTransparentImage) nativeSetDragImage(tinyTransparentImage, 0, 0);
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gvWJJ":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "DroppableContextProvider", ()=>DroppableContextProvider);
/**
 * Intended for use by `<Draggable>` instances.
 */ parcelHelpers.export(exports, "useDroppableContext", ()=>useDroppableContext);
/**
 * Returns the `droppableId` of the parent droppable, if there is one.
 *
 * Intended for use only by `<Droppable>` instances.
 */ parcelHelpers.export(exports, "useParentDroppableId", ()=>useParentDroppableId);
var _react = require("react");
var _rbdInvariant = require("../drag-drop-context/rbd-invariant");
var DroppableContext = /*#__PURE__*/ (0, _react.createContext)(null);
var DroppableContextProvider = DroppableContext.Provider;
function useDroppableContext() {
    var value = (0, _react.useContext)(DroppableContext);
    (0, _rbdInvariant.rbdInvariant)(value, 'Missing <Droppable /> parent');
    return value;
}
function useParentDroppableId() {
    var parentDroppable = (0, _react.useContext)(DroppableContext);
    if (!parentDroppable) return null;
    return parentDroppable.droppableId;
}

},{"react":"f39IF","../drag-drop-context/rbd-invariant":"gHZ28","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"eTJ7k":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "useDropTargetForDraggable", ()=>useDropTargetForDraggable);
var _react = require("react");
var _closestEdge = require("@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge");
var _adapter = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var _rbdInvariant = require("../drag-drop-context/rbd-invariant");
var _data = require("../draggable/data");
function useDropTargetForDraggable(_ref) {
    var elementRef = _ref.elementRef, data = _ref.data, direction = _ref.direction, contextId = _ref.contextId, isDropDisabled = _ref.isDropDisabled, type = _ref.type;
    (0, _react.useEffect)(function() {
        var element = elementRef.current;
        (0, _rbdInvariant.rbdInvariant)(element instanceof HTMLElement);
        return (0, _adapter.dropTargetForElements)({
            element: element,
            getIsSticky: function getIsSticky() {
                return true;
            },
            canDrop: function canDrop(_ref2) {
                var source = _ref2.source;
                if (!(0, _data.isDraggableData)(source.data)) // not dragging something from the migration layer
                // we should not allow dropping
                return false;
                if (isDropDisabled) return false;
                return source.data.type === type && source.data.contextId === contextId;
            },
            getData: function getData(_ref3) {
                var input = _ref3.input;
                return (0, _closestEdge.attachClosestEdge)(data, {
                    element: element,
                    input: input,
                    allowedEdges: direction === 'vertical' ? [
                        'top',
                        'bottom'
                    ] : [
                        'left',
                        'right'
                    ]
                });
            }
        });
    }, [
        data,
        direction,
        contextId,
        isDropDisabled,
        type,
        elementRef
    ]);
}

},{"react":"f39IF","@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge":"3uEYc","@atlaskit/pragmatic-drag-and-drop/element/adapter":"3xAZN","../drag-drop-context/rbd-invariant":"gHZ28","../draggable/data":"6qWMC","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"6Ehdd":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "useKeyboardContext", ()=>useKeyboardContext);
var _internalContext = require("../drag-drop-context/internal-context");
function useKeyboardContext() {
    var _useDragDropContext = (0, _internalContext.useDragDropContext)(), startKeyboardDrag = _useDragDropContext.startKeyboardDrag;
    return {
        startKeyboardDrag: startKeyboardDrag
    };
}

},{"../drag-drop-context/internal-context":"8SB2G","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4wb4R":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "findDropIndicator", ()=>findDropIndicator);
var _attributes = require("./attributes");
var _findElement = require("./find-element");
function findDropIndicator() {
    return (0, _findElement.findElement)({
        attribute: (0, _attributes.customAttributes).dropIndicator
    });
}

},{"./attributes":"ckBmU","./find-element":"jmXiO","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"9KplE":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "findPlaceholder", ()=>findPlaceholder);
var _attributes = require("./attributes");
var _findElement = require("./find-element");
function findPlaceholder(contextId) {
    return (0, _findElement.findElement)({
        attribute: (0, _attributes.attributes).placeholder.contextId,
        value: contextId
    });
}

},{"./attributes":"ckBmU","./find-element":"jmXiO","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"6ybZi":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Allows access to a changing value in a stable way.
 */ parcelHelpers.export(exports, "useStable", ()=>useStable);
var _react = require("react");
function useStable(value) {
    var ref = (0, _react.useRef)(value);
    (0, _react.useEffect)(function() {
        ref.current = value;
    }, [
        value
    ]);
    var getValue = (0, _react.useCallback)(function() {
        return ref.current;
    }, []);
    return getValue;
}

},{"react":"f39IF","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fyLQA":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "notDraggingStyle", ()=>notDraggingStyle);
/**
 * Returns the styles which should be provided to the draggable via the
 * `draggableProps` API.
 */ parcelHelpers.export(exports, "getDraggableProvidedStyle", ()=>getDraggableProvidedStyle);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
var _constants = require("./constants");
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            (0, _definePropertyDefault.default)(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
var notDraggingStyle = {
    transform: undefined,
    transition: undefined
};
var baseDraggingStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    boxSizing: 'border-box',
    transition: 'none',
    zIndex: (0, _constants.zIndex).dragging,
    /**
   * This transparency is intended to allow for better visibility of
   * drop indicators.
   */ opacity: 0.75,
    pointerEvents: 'none'
};
/**
 * Provides the drag preview styles based on the current drag state.
 */ function getDraggingStyle(_ref) {
    var draggableDimensions = _ref.draggableDimensions, previewOffset = _ref.previewOffset;
    var rect = draggableDimensions.rect;
    var translateX = rect.left + previewOffset.x;
    var translateY = rect.top + previewOffset.y;
    var isAtOrigin = translateX === 0 && translateY === 0;
    return _objectSpread(_objectSpread({}, baseDraggingStyle), {}, {
        transform: isAtOrigin ? undefined : "translate(".concat(translateX, "px, ").concat(translateY, "px)"),
        width: rect.width,
        height: rect.height
    });
}
function getDraggableProvidedStyle(_ref2) {
    var draggableDimensions = _ref2.draggableDimensions, draggableState = _ref2.draggableState;
    if (draggableState.type !== 'dragging' || !draggableState.previewOffset || !draggableDimensions) return notDraggingStyle;
    return getDraggingStyle({
        draggableDimensions: draggableDimensions,
        previewOffset: draggableState.previewOffset
    });
}

},{"@babel/runtime/helpers/defineProperty":"4x6r7","./constants":"3CwHw","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"3CwHw":[function(require,module,exports,__globalThis) {
/**
 * This value was copied from `react-beautiful-dnd`
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "zIndex", ()=>zIndex);
parcelHelpers.export(exports, "keyboardPreviewCrossAxisOffset", ()=>keyboardPreviewCrossAxisOffset);
var zIndex = {
    dragging: 5000
};
var keyboardPreviewCrossAxisOffset = 24;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"2Omjp":[function(require,module,exports,__globalThis) {
/**
 * This file is ported almost exactly from `react-beautiful-dnd`.
 *
 * In `react-beautiful-dnd` it is relevant to all drags,
 * but in the migration layer it is only relevant to keyboard drags.
 *
 * This is because now the browser is responsible for determining when a
 * pointer drag can occur.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "interactiveTagNames", ()=>interactiveTagNames);
parcelHelpers.export(exports, "isAnInteractiveElement", ()=>isAnInteractiveElement);
parcelHelpers.export(exports, "default", ()=>isEventInInteractiveElement);
var interactiveTagNames = {
    input: true,
    button: true,
    textarea: true,
    select: true,
    option: true,
    optgroup: true,
    video: true,
    audio: true
};
function isAnInteractiveElement(parent, current) {
    if (current == null) return false;
    // Most interactive elements cannot have children. However, some can such as 'button'.
    // See 'Permitted content' on https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button
    // Rather than having two different functions we can consolidate our checks into this single
    // function to keep things simple.
    // There is no harm checking if the parent has an interactive tag name even if it cannot have
    // any children. We need to perform this loop anyway to check for the contenteditable attribute
    var hasAnInteractiveTag = Boolean(interactiveTagNames[current.tagName.toLowerCase()]);
    if (hasAnInteractiveTag) return true;
    // contenteditable="true" or contenteditable="" are valid ways
    // of creating a contenteditable container
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
    var attribute = current.getAttribute('contenteditable');
    if (attribute === 'true' || attribute === '') return true;
    // nothing more can be done and no results found
    if (current === parent) return false;
    // recursion to check parent
    return isAnInteractiveElement(parent, current.parentElement);
}
function isEventInInteractiveElement(draggable, event) {
    var target = event.target;
    if (!(target instanceof HTMLElement)) return false;
    return isAnInteractiveElement(draggable, target);
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"30Upc":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Placeholder", ()=>Placeholder);
var _extends = require("@babel/runtime/helpers/extends");
var _extendsDefault = parcelHelpers.interopDefault(_extends);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
var _react = require("react");
var _reactDefault = parcelHelpers.interopDefault(_react);
var _internalContext = require("../drag-drop-context/internal-context");
var _useCapturedDimensions = require("../hooks/use-captured-dimensions");
var _attributes = require("../utils/attributes");
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            (0, _definePropertyDefault.default)(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
var Placeholder = /*#__PURE__*/ (0, _react.memo)(/*#__PURE__*/ (0, _react.forwardRef)(function Placeholder(_ref, ref) {
    var styleProp = _ref.style;
    var dimensions = (0, _useCapturedDimensions.useDraggableDimensions)();
    var _useDragDropContext = (0, _internalContext.useDragDropContext)(), contextId = _useDragDropContext.contextId;
    var dataAttributes = (0, _definePropertyDefault.default)({}, (0, _attributes.attributes).placeholder.contextId, contextId);
    var style = (0, _react.useMemo)(function() {
        if (!dimensions) return;
        var margin = dimensions.margin, rect = dimensions.rect;
        return _objectSpread({
            boxSizing: 'border-box',
            width: rect.width,
            height: rect.height,
            margin: margin
        }, styleProp);
    }, [
        dimensions,
        styleProp
    ]);
    // eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
    return /*#__PURE__*/ (0, _reactDefault.default).createElement("div", (0, _extendsDefault.default)({
        ref: ref,
        style: style
    }, dataAttributes));
}));

},{"@babel/runtime/helpers/extends":"vw3vn","@babel/runtime/helpers/defineProperty":"4x6r7","react":"f39IF","../drag-drop-context/internal-context":"8SB2G","../hooks/use-captured-dimensions":"guEId","../utils/attributes":"ckBmU","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"vw3vn":[function(require,module,exports,__globalThis) {
function _extends() {
    return module.exports = _extends = Object.assign ? Object.assign.bind() : function(n) {
        for(var e = 1; e < arguments.length; e++){
            var t = arguments[e];
            for(var r in t)({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
        }
        return n;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _extends.apply(null, arguments);
}
module.exports = _extends, module.exports.__esModule = true, module.exports["default"] = module.exports;

},{}],"56j6z":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "idleState", ()=>idleState);
parcelHelpers.export(exports, "reducer", ()=>reducer);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
/**
 * All state for the Draggable in one place.
 *
 * This avoids rerenders (caused by unbatched state updates),
 * but also keeps state logic together.
 */ var _draggableLocation = require("../drag-drop-context/draggable-location");
var _rbdInvariant = require("../drag-drop-context/rbd-invariant");
var _constants = require("../droppable/drop-indicator/constants");
var _constants1 = require("./constants");
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            (0, _definePropertyDefault.default)(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
var idleState = {
    type: 'idle',
    draggingOver: null
};
function getHidingState(mode) {
    return {
        type: 'hiding',
        draggingOver: null,
        mode: mode
    };
}
var getKeyboardPreviewOffset = {
    initial: function initial(_ref) {
        var direction = _ref.direction;
        /**
     * The initial offset doesn't use a base offset,
     * as no scrolling should have ocurred yet.
     */ var _directionMapping$dir = (0, _constants.directionMapping)[direction], mainAxis = _directionMapping$dir.mainAxis, crossAxis = _directionMapping$dir.crossAxis;
        return (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({}, mainAxis.name, 0), crossAxis.name, (0, _constants1.keyboardPreviewCrossAxisOffset));
    },
    home: function home(_ref3) {
        var direction = _ref3.droppable.direction, placeholderRect = _ref3.placeholderRect, draggableDimensions = _ref3.draggableDimensions;
        (0, _rbdInvariant.rbdInvariant)(placeholderRect, 'the placeholder should exist if in home position');
        /**
     * This base offset will result in the preview being over the placeholder
     * (same x and y coordinates).
     *
     * Consider this as `currentPosition - initialPosition` to find an offset.
     *
     * The `placeholderRect` is the **current** viewport-relative position of the
     * gap where the draggable originated from.
     *
     * The `draggableDimensions.rect` is the **initial** viewport-relative position
     * of the draggable.
     */ var baseOffset = {
            x: placeholderRect.x - draggableDimensions.rect.x,
            y: placeholderRect.y - draggableDimensions.rect.y
        };
        var _directionMapping$dir2 = (0, _constants.directionMapping)[direction], mainAxis = _directionMapping$dir2.mainAxis, crossAxis = _directionMapping$dir2.crossAxis;
        return (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({}, mainAxis.name, baseOffset[mainAxis.name]), crossAxis.name, baseOffset[crossAxis.name] + (0, _constants1.keyboardPreviewCrossAxisOffset));
    },
    away: function away(_ref5) {
        var direction = _ref5.droppable.direction, dropIndicatorRect = _ref5.dropIndicatorRect, draggableDimensions = _ref5.draggableDimensions;
        (0, _rbdInvariant.rbdInvariant)(dropIndicatorRect, 'the drop indicator should exist if in away position');
        /**
     * This base offset will result in the preview being over the drop indicator
     * (same x and y coordinates).
     *
     * Consider this as `currentPosition - initialPosition` to find an offset.
     *
     * The `dropIndicatorRect` is the **current** viewport-relative position of the
     * drop indicator.
     *
     * The `draggableDimensions.rect` is the **initial** viewport-relative position
     * of the draggable.
     */ var baseOffset = {
            x: dropIndicatorRect.x - draggableDimensions.rect.x,
            y: dropIndicatorRect.y - draggableDimensions.rect.y
        };
        var _directionMapping$dir3 = (0, _constants.directionMapping)[direction], mainAxis = _directionMapping$dir3.mainAxis, crossAxis = _directionMapping$dir3.crossAxis;
        return (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({}, mainAxis.name, baseOffset[mainAxis.name] - 0.5 * draggableDimensions.rect[mainAxis.style.length]), crossAxis.name, baseOffset[crossAxis.name] + (0, _constants1.keyboardPreviewCrossAxisOffset));
    }
};
/**
 * Determines the offset for the drag preview for keyboard drags.
 *
 * Unlike mouse drags, during which the drag preview follows the cursor,
 * the drag preview will follow the drop indicator for keyboard drags.
 */ function updateKeyboardPreview(state, _ref7) {
    var _update$destination;
    var update = _ref7.update, droppable = _ref7.droppable, draggableDimensions = _ref7.draggableDimensions, placeholderRect = _ref7.placeholderRect, dropIndicatorRect = _ref7.dropIndicatorRect;
    if (!droppable || !draggableDimensions) return state;
    var data = {
        droppable: droppable,
        draggableDimensions: draggableDimensions,
        placeholderRect: placeholderRect,
        dropIndicatorRect: dropIndicatorRect
    };
    var isHome = (0, _draggableLocation.isSameLocation)(update.source, (_update$destination = update.destination) !== null && _update$destination !== void 0 ? _update$destination : null);
    var previewOffset = isHome ? getKeyboardPreviewOffset.home(data) : getKeyboardPreviewOffset.away(data);
    if (!previewOffset) return state;
    return _objectSpread(_objectSpread({}, state), {}, {
        previewOffset: previewOffset
    });
}
function startDrag(state, _ref8) {
    var start = _ref8.start, previewOffset = _ref8.previewOffset;
    (0, _rbdInvariant.rbdInvariant)(state.type === 'idle', 'The draggable is idle.');
    var draggingOver = start.source.droppableId;
    var nextState = {
        type: 'dragging',
        draggingOver: draggingOver,
        location: null,
        start: start.source,
        draggableId: start.draggableId,
        mode: start.mode,
        previewOffset: previewOffset
    };
    return nextState;
}
function reducer(state, action) {
    if (action.type === 'START_POINTER_DRAG') return startDrag(state, _objectSpread(_objectSpread({}, action.payload), {}, {
        previewOffset: {
            x: 0,
            y: 0
        }
    }));
    if (action.type === 'START_KEYBOARD_DRAG') {
        var _action$payload = action.payload, draggableDimensions = _action$payload.draggableDimensions, droppable = _action$payload.droppable;
        return startDrag(state, _objectSpread(_objectSpread({}, action.payload), {}, {
            previewOffset: getKeyboardPreviewOffset.initial({
                draggableDimensions: draggableDimensions,
                direction: droppable.direction
            })
        }));
    }
    if (action.type === 'UPDATE_DRAG') {
        (0, _rbdInvariant.rbdInvariant)(state.type === 'dragging', 'The draggable is dragging.');
        var update = action.payload.update;
        var draggingOver = update.destination ? update.destination.droppableId : null;
        if (draggingOver === state.draggingOver) // Save on an unnecessary rerender
        return state;
        var nextState = _objectSpread(_objectSpread({}, state), {}, {
            draggingOver: draggingOver
        });
        return nextState;
    }
    if (action.type === 'UPDATE_POINTER_PREVIEW') {
        (0, _rbdInvariant.rbdInvariant)(state.type === 'dragging', 'The draggable is dragging.');
        var pointerLocation = action.payload.pointerLocation;
        var _nextState = _objectSpread(_objectSpread({}, state), {}, {
            previewOffset: {
                x: pointerLocation.current.input.clientX - pointerLocation.initial.input.clientX,
                y: pointerLocation.current.input.clientY - pointerLocation.initial.input.clientY
            }
        });
        return _nextState;
    }
    if (action.type === 'UPDATE_KEYBOARD_PREVIEW') {
        (0, _rbdInvariant.rbdInvariant)(state.type === 'dragging', 'The draggable is dragging.');
        if (state.type !== 'dragging') return state;
        var _nextState2 = updateKeyboardPreview(state, action.payload);
        return _nextState2;
    }
    if (action.type === 'DROP') {
        (0, _rbdInvariant.rbdInvariant)(state.type === 'dragging', 'The draggable is dragging.');
        return idleState;
    }
    if (action.type === 'START_HIDING') {
        (0, _rbdInvariant.rbdInvariant)(state.type === 'idle' || state.type === 'hiding');
        return getHidingState(action.payload.mode);
    }
    if (action.type === 'STOP_HIDING') {
        (0, _rbdInvariant.rbdInvariant)(state.type === 'hiding');
        return idleState;
    }
    return state;
}

},{"@babel/runtime/helpers/defineProperty":"4x6r7","../drag-drop-context/draggable-location":"alMHr","../drag-drop-context/rbd-invariant":"gHZ28","../droppable/drop-indicator/constants":"1iZVB","./constants":"3CwHw","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1iZVB":[function(require,module,exports,__globalThis) {
/**
 * Maps directions to different JS/CSS properties.
 *
 * Allows logic which changes with the direction to be written only once.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "directionMapping", ()=>directionMapping);
parcelHelpers.export(exports, "lineThickness", ()=>lineThickness);
parcelHelpers.export(exports, "lineOffset", ()=>lineOffset);
var directionMapping = {
    vertical: {
        mainAxis: {
            name: 'y',
            offset: 'offsetTop',
            length: 'offsetHeight',
            scrollOffset: 'scrollTop',
            forwardEdge: 'bottom',
            overflow: 'overflowY',
            style: {
                length: 'height',
                transform: 'translateY'
            }
        },
        crossAxis: {
            name: 'x',
            offset: 'offsetLeft',
            length: 'offsetWidth',
            style: {
                length: 'width',
                offset: 'left'
            }
        }
    },
    horizontal: {
        mainAxis: {
            name: 'x',
            offset: 'offsetLeft',
            length: 'offsetWidth',
            scrollOffset: 'scrollLeft',
            forwardEdge: 'right',
            overflow: 'overflowX',
            style: {
                length: 'width',
                transform: 'translateX'
            }
        },
        crossAxis: {
            name: 'y',
            offset: 'offsetTop',
            length: 'offsetHeight',
            style: {
                length: 'height',
                offset: 'top'
            }
        }
    }
};
var lineThickness = 2;
var lineOffset = lineThickness / 2;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"eUASm":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "useDraggableStateSnapshot", ()=>useDraggableStateSnapshot);
var _react = require("react");
function useDraggableStateSnapshot(_ref) {
    var draggingOver = _ref.draggingOver, isClone = _ref.isClone, isDragging = _ref.isDragging, mode = _ref.mode;
    return (0, _react.useMemo)(function() {
        return {
            isClone: isClone,
            isDragging: isDragging,
            draggingOver: draggingOver,
            mode: mode,
            /**
       * The properties below are fixed in the migration layer,
       * because they are not supported.
       *
       * Animation and combination were intentionally removed.
       */ isDropAnimating: false,
            dropAnimation: null,
            combineWith: null,
            combineTargetFor: null
        };
    }, [
        draggingOver,
        isClone,
        isDragging,
        mode
    ]);
}

},{"react":"f39IF","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"aCCG7":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Droppable", ()=>Droppable);
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
var _react = require("react");
var _reactDefault = parcelHelpers.interopDefault(_react);
var _reactDom = require("react-dom");
var _tinyInvariant = require("tiny-invariant");
var _tinyInvariantDefault = parcelHelpers.interopDefault(_tinyInvariant);
var _closestEdge = require("@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge");
var _combine = require("@atlaskit/pragmatic-drag-and-drop/combine");
var _adapter = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var _internalContext = require("../drag-drop-context/internal-context");
var _lifecycleContext = require("../drag-drop-context/lifecycle-context");
var _data = require("../draggable/data");
var _useIsomorphicLayoutEffect = require("../hooks/use-isomorphic-layout-effect");
var _attributes = require("../utils/attributes");
var _useStable = require("../utils/use-stable");
var _data1 = require("./data");
var _draggableClone = require("./draggable-clone");
var _dropIndicator = require("./drop-indicator");
var _droppableContext = require("./droppable-context");
var _state = require("./state");
var _virtualPlaceholder = require("./virtual-placeholder");
function Droppable(_ref) {
    var children = _ref.children, droppableId = _ref.droppableId, _ref$type = _ref.type, type = _ref$type === void 0 ? 'DEFAULT' : _ref$type, _ref$direction = _ref.direction, direction = _ref$direction === void 0 ? 'vertical' : _ref$direction, _ref$mode = _ref.mode, mode = _ref$mode === void 0 ? 'standard' : _ref$mode, renderClone = _ref.renderClone, getContainerForClone = _ref.getContainerForClone, _ref$isDropDisabled = _ref.isDropDisabled, isDropDisabled = _ref$isDropDisabled === void 0 ? false : _ref$isDropDisabled;
    var getIsDropDisabled = (0, _useStable.useStable)(isDropDisabled);
    var _useDragDropContext = (0, _internalContext.useDragDropContext)(), contextId = _useDragDropContext.contextId, droppableRegistry = _useDragDropContext.droppableRegistry;
    var data = (0, _data1.useDroppableData)({
        contextId: contextId,
        droppableId: droppableId,
        getIsDropDisabled: getIsDropDisabled
    });
    var elementRef = (0, _react.useRef)(null);
    var setElement = (0, _react.useCallback)(function(element) {
        if (element) (0, _attributes.setAttributes)(element, (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({}, (0, _attributes.customAttributes).droppable.type, type), (0, _attributes.customAttributes).droppable.direction, direction), (0, _attributes.attributes).droppable.id, droppableId), (0, _attributes.attributes).droppable.contextId, contextId));
        elementRef.current = element;
    }, [
        contextId,
        direction,
        droppableId,
        type
    ]);
    var _useReducer = (0, _react.useReducer)((0, _state.reducer), (0, _state.idleState)), _useReducer2 = (0, _slicedToArrayDefault.default)(_useReducer, 2), state = _useReducer2[0], dispatch = _useReducer2[1];
    var draggingFromThisWith = state.draggingFromThisWith, draggingOverWith = state.draggingOverWith, isDraggingOver = state.isDraggingOver;
    var parentDroppableId = (0, _droppableContext.useParentDroppableId)();
    (0, _react.useEffect)(function() {
        var element = elementRef.current;
        (0, _tinyInvariantDefault.default)(element instanceof HTMLElement, 'innerRef must provide an `HTMLElement`');
        return (0, _combine.combine)(droppableRegistry.register({
            droppableId: droppableId,
            type: type,
            isDropDisabled: isDropDisabled,
            parentDroppableId: parentDroppableId,
            element: element,
            direction: direction,
            mode: mode
        }), (0, _adapter.dropTargetForElements)({
            element: element,
            getData: function getData(_ref2) {
                var input = _ref2.input;
                return (0, _closestEdge.attachClosestEdge)(data, {
                    element: element,
                    input: input,
                    allowedEdges: direction === 'vertical' ? [
                        'top',
                        'bottom'
                    ] : [
                        'left',
                        'right'
                    ]
                });
            },
            canDrop: function canDrop(_ref3) {
                var source = _ref3.source;
                if (!(0, _data.isDraggableData)(source.data)) // not dragging something from the migration layer
                // we should not allow dropping
                return false;
                if (isDropDisabled) return false;
                return source.data.contextId === contextId && source.data.type === type;
            },
            onDragLeave: function onDragLeave() {
                dispatch({
                    type: 'DRAG_CLEAR'
                });
            }
        }));
    }, [
        data,
        droppableId,
        contextId,
        isDropDisabled,
        type,
        droppableRegistry,
        parentDroppableId,
        direction,
        mode
    ]);
    var monitorForLifecycle = (0, _lifecycleContext.useMonitorForLifecycle)();
    (0, _react.useEffect)(function() {
        function isEventRelevant(data) {
            var _data$destination;
            /**
       * If the draggable is of a different type to this droppable,
       * then we can ignore it.
       */ var isSameType = data.type === type;
            var isOverAfterUpdate = ((_data$destination = data.destination) === null || _data$destination === void 0 ? void 0 : _data$destination.droppableId) === droppableId;
            var isDragEnter = !isDraggingOver && isOverAfterUpdate;
            var isDragLeave = isDraggingOver && !isOverAfterUpdate;
            /**
       * A droppable will only have a meaningful state update if the user is entering or exiting it.
       */ var isDragEnterOrLeave = isDragEnter || isDragLeave;
            return isSameType && isDragEnterOrLeave;
        }
        return monitorForLifecycle({
            onPendingDragStart: function onPendingDragStart(_ref4) {
                var start = _ref4.start;
                if (!isEventRelevant({
                    destination: start.source,
                    type: start.type
                })) return;
                dispatch({
                    type: 'DRAG_START',
                    payload: {
                        droppableId: droppableId,
                        start: start
                    }
                });
            },
            onPendingDragUpdate: function onPendingDragUpdate(_ref5) {
                var update = _ref5.update;
                if (!isEventRelevant(update)) return;
                dispatch({
                    type: 'DRAG_UPDATE',
                    payload: {
                        droppableId: droppableId,
                        update: update
                    }
                });
            },
            onBeforeDragEnd: function onBeforeDragEnd() {
                /**
         * This is safe to call optimistically as it uses a stable idle state.
         *
         * If the droppable is already idle, it will not rerender.
         */ dispatch({
                    type: 'DRAG_CLEAR'
                });
            }
        });
    }, [
        droppableId,
        isDraggingOver,
        monitorForLifecycle,
        type
    ]);
    var dropIndicator = (0, _react.useMemo)(function() {
        if (!isDraggingOver) return null;
        return /*#__PURE__*/ (0, _reactDefault.default).createElement((0, _dropIndicator.DropIndicator), {
            direction: direction,
            mode: mode
        });
    }, [
        direction,
        isDraggingOver,
        mode
    ]);
    var provided = (0, _react.useMemo)(function() {
        return {
            innerRef: setElement,
            droppableProps: (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({}, (0, _attributes.attributes).droppable.contextId, contextId), (0, _attributes.attributes).droppable.id, droppableId),
            /**
       * We only provide a drop indicator as the placeholder for
       * non-virtual lists. Otherwise it is portalled in.
       */ placeholder: mode === 'standard' ? dropIndicator : null
        };
    }, [
        contextId,
        dropIndicator,
        droppableId,
        mode,
        setElement
    ]);
    var snapshot = (0, _react.useMemo)(function() {
        return {
            draggingFromThisWith: draggingFromThisWith,
            draggingOverWith: draggingOverWith,
            isDraggingOver: isDraggingOver,
            isUsingPlaceholder: isDraggingOver
        };
    }, [
        draggingFromThisWith,
        draggingOverWith,
        isDraggingOver
    ]);
    var element = elementRef.current;
    var shouldPortalDropIndicator = isDraggingOver && mode === 'virtual' && element;
    /**
   * Assumes that the ref points to the scroll container.
   */ (0, _useIsomorphicLayoutEffect.useLayoutEffect)(function() {
        if (!shouldPortalDropIndicator) return;
        var _window$getComputedSt = window.getComputedStyle(element), position = _window$getComputedSt.position;
        if (position !== 'static') return;
        var prevStyle = element.style.position;
        element.style.position = 'relative';
        return function() {
            element.style.position = prevStyle;
        };
    }, [
        element,
        shouldPortalDropIndicator
    ]);
    /**
   * Used to disable the dragging style for the real draggable.
   */ var shouldRenderCloneWhileDragging = Boolean(renderClone);
    var contextValue = (0, _react.useMemo)(function() {
        return {
            direction: direction,
            droppableId: droppableId,
            shouldRenderCloneWhileDragging: shouldRenderCloneWhileDragging,
            isDropDisabled: isDropDisabled,
            type: type,
            mode: mode
        };
    }, [
        direction,
        droppableId,
        shouldRenderCloneWhileDragging,
        isDropDisabled,
        type,
        mode
    ]);
    /**
   * For virtual lists we portal a placeholder in when dragging from the list.
   *
   * This is because `<Draggable />`'s can be unmounted at any time, so we
   * cannot rely on rendering the placeholder as a sibling.
   */ var shouldPortalPlaceholder = draggingFromThisWith && mode === 'virtual' && element;
    return /*#__PURE__*/ (0, _reactDefault.default).createElement((0, _droppableContext.DroppableContextProvider), {
        value: contextValue
    }, children(provided, snapshot), shouldPortalDropIndicator && /*#__PURE__*/ (0, _reactDom.createPortal)(dropIndicator, element), shouldPortalPlaceholder && /*#__PURE__*/ (0, _reactDom.createPortal)(/*#__PURE__*/ (0, _reactDefault.default).createElement((0, _virtualPlaceholder.VirtualPlaceholder), {
        droppableId: droppableId,
        draggableId: draggingFromThisWith,
        type: type,
        direction: direction,
        isDropDisabled: isDropDisabled
    }), element), renderClone && /*#__PURE__*/ (0, _reactDefault.default).createElement((0, _draggableClone.DraggableClone), {
        droppableId: droppableId,
        type: type,
        getContainerForClone: getContainerForClone
    }, renderClone));
}

},{"@babel/runtime/helpers/slicedToArray":"6AJmz","@babel/runtime/helpers/defineProperty":"4x6r7","react":"f39IF","react-dom":"fc7O8","tiny-invariant":"fnIPv","@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge":"3uEYc","@atlaskit/pragmatic-drag-and-drop/combine":"6avx6","@atlaskit/pragmatic-drag-and-drop/element/adapter":"3xAZN","../drag-drop-context/internal-context":"8SB2G","../drag-drop-context/lifecycle-context":"6NaFx","../draggable/data":"6qWMC","../hooks/use-isomorphic-layout-effect":"dQmso","../utils/attributes":"ckBmU","../utils/use-stable":"6ybZi","./data":"iSg7i","./draggable-clone":"3I9ks","./drop-indicator":"2QMpz","./droppable-context":"gvWJJ","./state":"bP1CL","./virtual-placeholder":"2qoru","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"3I9ks":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Wrapper that is always rendered if there is a `renderClone` function.
 *
 * It sets up a monitor, and needs to observe the entire lifecycle.
 */ parcelHelpers.export(exports, "DraggableClone", ()=>DraggableClone);
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
var _react = require("react");
var _reactDefault = parcelHelpers.interopDefault(_react);
var _reactDom = require("react-dom");
var _combine = require("@atlaskit/pragmatic-drag-and-drop/combine");
var _adapter = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var _useHiddenTextElement = require("../drag-drop-context/hooks/use-hidden-text-element");
var _internalContext = require("../drag-drop-context/internal-context");
var _lifecycleContext = require("../drag-drop-context/lifecycle-context");
var _rbdInvariant = require("../drag-drop-context/rbd-invariant");
var _data = require("../draggable/data");
var _getDraggableProvidedStyle = require("../draggable/get-draggable-provided-style");
var _state = require("../draggable/state");
var _useDraggableStateSnapshot = require("../draggable/use-draggable-state-snapshot");
var _useCapturedDimensions = require("../hooks/use-captured-dimensions");
var _attributes = require("../utils/attributes");
var _findDragHandle = require("../utils/find-drag-handle");
var _findDropIndicator = require("../utils/find-drop-indicator");
var _findPlaceholder = require("../utils/find-placeholder");
function getBody() {
    return document.body;
}
/**
 * Calls the `renderClone` function.
 *
 * Only rendered during drags.
 */ function DraggableCloneInner(_ref) {
    var children = _ref.children, droppableId = _ref.droppableId, type = _ref.type, draggableId = _ref.draggableId, index = _ref.index, draggingOver = _ref.draggingOver, style = _ref.style, _ref$getContainerForC = _ref.getContainerForClone, getContainerForClone = _ref$getContainerForC === void 0 ? getBody : _ref$getContainerForC, mode = _ref.mode;
    var _useDragDropContext = (0, _internalContext.useDragDropContext)(), contextId = _useDragDropContext.contextId;
    /**
   * The handle should maintain focus during a drag,
   * if it had focus before the drag started.
   */ var focusDragHandle = (0, _react.useCallback)(function(element) {
        if (!element) return;
        var dragHandle = (0, _findDragHandle.findDragHandle)({
            contextId: contextId,
            draggableId: draggableId
        });
        dragHandle === null || dragHandle === void 0 || dragHandle.focus();
    }, [
        contextId,
        draggableId
    ]);
    var provided = (0, _react.useMemo)(function() {
        return {
            innerRef: focusDragHandle,
            draggableProps: (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({}, (0, _attributes.attributes).draggable.contextId, contextId), (0, _attributes.attributes).draggable.id, draggableId), "style", style),
            dragHandleProps: (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({
                role: 'button',
                'aria-describedby': (0, _useHiddenTextElement.getHiddenTextElementId)(contextId)
            }, (0, _attributes.attributes).dragHandle.contextId, contextId), (0, _attributes.attributes).dragHandle.draggableId, draggableId), "tabIndex", 0), "draggable", false), "onDragStart", function onDragStart() {})
        };
    }, [
        contextId,
        draggableId,
        focusDragHandle,
        style
    ]);
    var snapshot = (0, _useDraggableStateSnapshot.useDraggableStateSnapshot)({
        draggingOver: draggingOver,
        isClone: true,
        isDragging: true,
        mode: mode
    });
    var rubric = (0, _react.useMemo)(function() {
        return {
            draggableId: draggableId,
            type: type,
            source: {
                droppableId: droppableId,
                index: index
            }
        };
    }, [
        draggableId,
        droppableId,
        index,
        type
    ]);
    return /*#__PURE__*/ (0, _reactDom.createPortal)(children(provided, snapshot, rubric), getContainerForClone());
}
function DraggableClone(_ref2) {
    var children = _ref2.children, droppableId = _ref2.droppableId, type = _ref2.type, getContainerForClone = _ref2.getContainerForClone;
    var _useDragDropContext2 = (0, _internalContext.useDragDropContext)(), contextId = _useDragDropContext2.contextId, getDragState = _useDragDropContext2.getDragState;
    var draggableDimensions = (0, _useCapturedDimensions.useDraggableDimensions)();
    var _useReducer = (0, _react.useReducer)((0, _state.reducer), (0, _state.idleState)), _useReducer2 = (0, _slicedToArrayDefault.default)(_useReducer, 2), state = _useReducer2[0], dispatch = _useReducer2[1];
    var monitorForLifecycle = (0, _lifecycleContext.useMonitorForLifecycle)();
    (0, _react.useEffect)(function() {
        return (0, _combine.combine)(monitorForLifecycle({
            onPendingDragStart: function onPendingDragStart(_ref3) {
                var start = _ref3.start, droppable = _ref3.droppable;
                if (droppableId !== start.source.droppableId) return;
                if (start.mode === 'FLUID') return dispatch({
                    type: 'START_POINTER_DRAG',
                    payload: {
                        start: start
                    }
                });
                if (start.mode === 'SNAP') {
                    var dragState = getDragState();
                    (0, _rbdInvariant.rbdInvariant)(dragState.isDragging && dragState.draggableDimensions);
                    return dispatch({
                        type: 'START_KEYBOARD_DRAG',
                        payload: {
                            start: start,
                            draggableDimensions: dragState.draggableDimensions,
                            droppable: droppable
                        }
                    });
                }
            },
            onPendingDragUpdate: function onPendingDragUpdate(_ref4) {
                var update = _ref4.update, droppable = _ref4.droppable;
                if (state.type !== 'dragging') return;
                if (state.draggableId !== update.draggableId) return;
                dispatch({
                    type: 'UPDATE_DRAG',
                    payload: {
                        update: update
                    }
                });
                if (update.mode === 'SNAP') /**
           * Updating the position in a microtask to resolve timing issues.
           *
           * When doing cross-axis dragging, the drop indicator in the new
           * droppable will mount and update in a `onPendingDragUpdate` too.
           *
           * The microtask ensures that the indicator will have updated by
           * the time this runs, so the preview will have the correct
           * location of the indicator.
           */ queueMicrotask(function() {
                    /**
             * Because this update occurs in a microtask, we need to check
             * that the drag is still happening.
             *
             * If it has ended we should not try to update the preview.
             */ var dragState = getDragState();
                    if (!dragState.isDragging) return;
                    /**
             * The placeholder might not exist if its associated
             * draggable unmounts in a virtual list.
             */ var placeholder = (0, _findPlaceholder.findPlaceholder)(contextId);
                    var placeholderRect = placeholder ? placeholder.getBoundingClientRect() : null;
                    /**
             * The drop indicator might not exist if the current target
             * is null
             */ var dropIndicator = (0, _findDropIndicator.findDropIndicator)();
                    var dropIndicatorRect = dropIndicator ? dropIndicator.getBoundingClientRect() : null;
                    dispatch({
                        type: 'UPDATE_KEYBOARD_PREVIEW',
                        payload: {
                            update: update,
                            draggableDimensions: draggableDimensions,
                            droppable: droppable,
                            placeholderRect: placeholderRect,
                            dropIndicatorRect: dropIndicatorRect
                        }
                    });
                });
            },
            onBeforeDragEnd: function onBeforeDragEnd(_ref5) {
                var draggableId = _ref5.draggableId;
                if (state.type !== 'dragging') return;
                if (draggableId !== state.draggableId) return;
                dispatch({
                    type: 'DROP'
                });
            }
        }), (0, _adapter.monitorForElements)({
            canMonitor: function canMonitor(_ref6) {
                var source = _ref6.source;
                if (!(0, _data.isDraggableData)(source.data)) // not dragging something from the migration layer
                // we should not monitor it
                return false;
                return source.data.contextId === contextId && source.data.droppableId === droppableId;
            },
            onDrag: function onDrag(_ref7) {
                var location = _ref7.location;
                dispatch({
                    type: 'UPDATE_POINTER_PREVIEW',
                    payload: {
                        pointerLocation: location
                    }
                });
            }
        }));
    }, [
        droppableId,
        contextId,
        monitorForLifecycle,
        state,
        draggableDimensions,
        getDragState
    ]);
    if (state.type !== 'dragging') return null;
    var style = (0, _getDraggableProvidedStyle.getDraggableProvidedStyle)({
        draggableDimensions: draggableDimensions,
        draggableState: state
    });
    return /*#__PURE__*/ (0, _reactDefault.default).createElement(DraggableCloneInner, {
        droppableId: droppableId,
        type: type,
        draggableId: state.draggableId,
        index: state.start.index,
        draggingOver: state.draggingOver,
        mode: state.mode,
        style: style,
        getContainerForClone: getContainerForClone
    }, children);
}

},{"@babel/runtime/helpers/slicedToArray":"6AJmz","@babel/runtime/helpers/defineProperty":"4x6r7","react":"f39IF","react-dom":"fc7O8","@atlaskit/pragmatic-drag-and-drop/combine":"6avx6","@atlaskit/pragmatic-drag-and-drop/element/adapter":"3xAZN","../drag-drop-context/hooks/use-hidden-text-element":"7NaCi","../drag-drop-context/internal-context":"8SB2G","../drag-drop-context/lifecycle-context":"6NaFx","../drag-drop-context/rbd-invariant":"gHZ28","../draggable/data":"6qWMC","../draggable/get-draggable-provided-style":"fyLQA","../draggable/state":"56j6z","../draggable/use-draggable-state-snapshot":"eUASm","../hooks/use-captured-dimensions":"guEId","../utils/attributes":"ckBmU","../utils/find-drag-handle":"hTk1K","../utils/find-drop-indicator":"4wb4R","../utils/find-placeholder":"9KplE","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"2QMpz":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "DropIndicator", ()=>DropIndicator);
var _extends = require("@babel/runtime/helpers/extends");
var _extendsDefault = parcelHelpers.interopDefault(_extends);
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _slicedToArrayDefault = parcelHelpers.interopDefault(_slicedToArray);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
/**
 * @jsxRuntime classic
 * @jsx jsx
 */ var _react = require("react");
// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
var _react1 = require("@emotion/react");
var _draggableLocation = require("../../drag-drop-context/draggable-location");
var _getDestination = require("../../drag-drop-context/get-destination");
var _internalContext = require("../../drag-drop-context/internal-context");
var _lifecycleContext = require("../../drag-drop-context/lifecycle-context");
var _rbdInvariant = require("../../drag-drop-context/rbd-invariant");
var _attributes = require("../../utils/attributes");
var _constants = require("./constants");
var _getDimensions = require("./get-dimensions");
var scrollMarginTop = (0, _constants.lineThickness) + 2 * (0, _constants.lineOffset);
var baseStyles = (0, _react1.css)({
    background: "var(--ds-border-brand, #0C66E4)",
    /**
   * Ensures that when the indicator is scrolled into view there is visual
   * space around it.
   *
   * Otherwise it will hug the edge of the container and be hard to see.
   */ // eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
    scrollMarginTop: scrollMarginTop,
    /**
   * The bottom margin needs to be slightly bigger for the gap to look
   * the same visually.
   *
   * It's unclear why, this was found through testing.
   */ // eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values, @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
    scrollMarginBottom: scrollMarginTop + (0, _constants.lineOffset)
});
/**
 * For virtual lists, the indicator might not be a sibling of the contents.
 * This can lead to issues like wrapping.
 *
 * This style 'resets' it so that there is a consistent initial position.
 */ var virtualStyles = (0, _react1.css)({
    position: 'absolute',
    top: 0,
    left: 0
});
/**
 * When targeting the source location, we hide the drop indicator.
 * But it should still be scrolled to, so we only want to hide it visually,
 * instead of not rendering it.
 */ var visuallyHiddenStyles = (0, _react1.css)({
    opacity: 0
});
var directionStyles = {
    horizontal: (0, _react1.css)({
        // eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
        width: (0, _constants.lineThickness),
        height: '100%',
        // eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values, @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
        marginLeft: -(0, _constants.lineThickness)
    }),
    vertical: (0, _react1.css)({
        width: '100%',
        // eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
        height: (0, _constants.lineThickness),
        // eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values, @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
        marginTop: -(0, _constants.lineThickness)
    })
};
function getDynamicStyles(_ref) {
    var direction = _ref.direction, dimensions = _ref.dimensions, indicatorOffset = _ref.indicatorOffset;
    if (dimensions === null) /**
     * We hide the indicator initially until dimensions can be taken.
     */ return {
        opacity: 0
    };
    var _directionMapping$dir = (0, _constants.directionMapping)[direction], mainAxis = _directionMapping$dir.mainAxis, crossAxis = _directionMapping$dir.crossAxis;
    return (0, _definePropertyDefault.default)((0, _definePropertyDefault.default)({
        transform: "".concat(mainAxis.style.transform, "(").concat(dimensions.mainAxis.offset - indicatorOffset, "px)")
    }, crossAxis.style.length, dimensions.crossAxis.length), crossAxis.style.offset, dimensions.crossAxis.offset);
}
var dropIndicatorData = (0, _definePropertyDefault.default)({}, (0, _attributes.customAttributes).dropIndicator, '');
var DropIndicator = function DropIndicator(_ref3) {
    var direction = _ref3.direction, mode = _ref3.mode;
    var _useDragDropContext = (0, _internalContext.useDragDropContext)(), contextId = _useDragDropContext.contextId, getDragState = _useDragDropContext.getDragState;
    var ref = (0, _react.useRef)(null);
    var _useState = (0, _react.useState)(null), _useState2 = (0, _slicedToArrayDefault.default)(_useState, 2), dimensions = _useState2[0], setDimensions = _useState2[1];
    var _useState3 = (0, _react.useState)(false), _useState4 = (0, _slicedToArrayDefault.default)(_useState3, 2), isHidden = _useState4[0], setIsHidden = _useState4[1];
    var monitorForLifecycle = (0, _lifecycleContext.useMonitorForLifecycle)();
    var updateIndicator = (0, _react.useCallback)(function(_ref4) {
        var targetLocation = _ref4.targetLocation, source = _ref4.source, destination = _ref4.destination;
        if (!targetLocation) return setDimensions(null);
        var isInHomeLocation = (0, _draggableLocation.isSameLocation)(source, destination);
        /**
     * Determines if the drop indicator should be hidden.
     *
     * This is desired when the current drop target would not change the position
     * of the draggable.
     */ setIsHidden(isInHomeLocation);
        return setDimensions((0, _getDimensions.getIndicatorSizeAndOffset)({
            targetLocation: targetLocation,
            isInHomeLocation: isInHomeLocation,
            direction: direction,
            mode: mode,
            contextId: contextId
        }));
    }, [
        contextId,
        direction,
        mode
    ]);
    /**
   * This is in a `useLayoutEffect` for immediacy.
   *
   * When mounting (cross-axis movement) the indicator should update into
   * its correct position right away, so that the drag preview can be placed
   * correctly.
   */ (0, _react.useLayoutEffect)(function() {
        var dragState = getDragState();
        if (!dragState.isDragging) return;
        /**
     * If the indicator is only just mounting then it needs an immediate
     * update to have it appear in the correct position.
     */ var targetLocation = dragState.targetLocation, sourceLocation = dragState.sourceLocation;
        var destination = (0, _getDestination.getActualDestination)({
            start: sourceLocation,
            target: targetLocation
        });
        updateIndicator({
            targetLocation: targetLocation,
            destination: destination,
            source: sourceLocation
        });
        return monitorForLifecycle({
            onPrePendingDragUpdate: function onPrePendingDragUpdate(_ref5) {
                var update = _ref5.update, targetLocation = _ref5.targetLocation;
                var _update$destination = update.destination, destination = _update$destination === void 0 ? null : _update$destination, source = update.source;
                updateIndicator({
                    targetLocation: targetLocation,
                    source: source,
                    destination: destination
                });
            }
        });
    }, [
        contextId,
        direction,
        getDragState,
        mode,
        monitorForLifecycle,
        updateIndicator
    ]);
    /**
   * Scroll the indicator into view.
   *
   * This is in a `useLayoutEffect` for immediacy.
   * Otherwise the keyboard drag preview can appear in the wrong (old) location.
   */ (0, _react.useLayoutEffect)(function() {
        if (dimensions === null) return;
        /**
     * If we are doing a mouse drag,
     * then we don't want to scroll to the indicator.
     *
     * Otherwise, it will conflict with the auto-scroll addon.
     */ var dragState = getDragState();
        if (!dragState.isDragging || dragState.mode !== 'SNAP') return;
        var element = ref.current;
        (0, _rbdInvariant.rbdInvariant)(element instanceof HTMLElement);
        element.scrollIntoView({
            block: 'nearest'
        });
    }, [
        dimensions,
        getDragState
    ]);
    var mainAxis = (0, _constants.directionMapping)[direction].mainAxis;
    var indicatorOffset = ref.current ? ref.current[mainAxis.offset] : 0;
    var dynamicStyles = getDynamicStyles({
        direction: direction,
        dimensions: dimensions,
        indicatorOffset: indicatorOffset
    });
    var isVirtual = mode === 'virtual';
    return (0, _react1.jsx)("div", (0, _extendsDefault.default)({
        ref: ref,
        css: [
            baseStyles,
            directionStyles[direction],
            isVirtual && virtualStyles,
            isHidden && visuallyHiddenStyles
        ],
        style: dynamicStyles
    }, dropIndicatorData));
};

},{"@babel/runtime/helpers/extends":"vw3vn","@babel/runtime/helpers/slicedToArray":"6AJmz","@babel/runtime/helpers/defineProperty":"4x6r7","react":"f39IF","@emotion/react":"300Ie","../../drag-drop-context/draggable-location":"alMHr","../../drag-drop-context/get-destination":"5fbtJ","../../drag-drop-context/internal-context":"8SB2G","../../drag-drop-context/lifecycle-context":"6NaFx","../../drag-drop-context/rbd-invariant":"gHZ28","../../utils/attributes":"ckBmU","./constants":"1iZVB","./get-dimensions":"97Rpq","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"300Ie":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "CacheProvider", ()=>(0, _emotionElementD59E098FEsmJs.C));
parcelHelpers.export(exports, "ThemeContext", ()=>(0, _emotionElementD59E098FEsmJs.T));
parcelHelpers.export(exports, "ThemeProvider", ()=>(0, _emotionElementD59E098FEsmJs.b));
parcelHelpers.export(exports, "__unsafe_useEmotionCache", ()=>(0, _emotionElementD59E098FEsmJs._));
parcelHelpers.export(exports, "useTheme", ()=>(0, _emotionElementD59E098FEsmJs.u));
parcelHelpers.export(exports, "withEmotionCache", ()=>(0, _emotionElementD59E098FEsmJs.w));
parcelHelpers.export(exports, "withTheme", ()=>(0, _emotionElementD59E098FEsmJs.d));
parcelHelpers.export(exports, "ClassNames", ()=>ClassNames);
parcelHelpers.export(exports, "Global", ()=>Global);
parcelHelpers.export(exports, "createElement", ()=>jsx);
parcelHelpers.export(exports, "css", ()=>css);
parcelHelpers.export(exports, "jsx", ()=>jsx);
parcelHelpers.export(exports, "keyframes", ()=>keyframes);
var _emotionElementD59E098FEsmJs = require("./emotion-element-d59e098f.esm.js");
var _react = require("react");
var _utils = require("@emotion/utils");
var _useInsertionEffectWithFallbacks = require("@emotion/use-insertion-effect-with-fallbacks");
var _serialize = require("@emotion/serialize");
var _cache = require("@emotion/cache");
var _extends = require("@babel/runtime/helpers/extends");
var _weakMemoize = require("@emotion/weak-memoize");
var _emotionReactIsolatedHnrsEsmJs = require("../_isolated-hnrs/dist/emotion-react-_isolated-hnrs.esm.js");
var _hoistNonReactStatics = require("hoist-non-react-statics");
var jsx = function jsx(type, props) {
    // eslint-disable-next-line prefer-rest-params
    var args = arguments;
    if (props == null || !(0, _emotionElementD59E098FEsmJs.h).call(props, 'css')) return _react.createElement.apply(undefined, args);
    var argsLength = args.length;
    var createElementArgArray = new Array(argsLength);
    createElementArgArray[0] = (0, _emotionElementD59E098FEsmJs.E);
    createElementArgArray[1] = (0, _emotionElementD59E098FEsmJs.c)(type, props);
    for(var i = 2; i < argsLength; i++)createElementArgArray[i] = args[i];
    return _react.createElement.apply(null, createElementArgArray);
};
(function(_jsx) {
    var JSX;
    JSX || (JSX = _jsx.JSX || (_jsx.JSX = {}));
})(jsx || (jsx = {}));
// initial render from browser, insertBefore context.sheet.tags[0] or if a style hasn't been inserted there yet, appendChild
// initial client-side render from SSR, use place of hydrating tag
var Global = /* #__PURE__ */ (0, _emotionElementD59E098FEsmJs.w)(function(props, cache) {
    var styles = props.styles;
    var serialized = (0, _serialize.serializeStyles)([
        styles
    ], undefined, _react.useContext((0, _emotionElementD59E098FEsmJs.T)));
    if (!(0, _emotionElementD59E098FEsmJs.i)) {
        var _ref;
        var serializedNames = serialized.name;
        var serializedStyles = serialized.styles;
        var next = serialized.next;
        while(next !== undefined){
            serializedNames += ' ' + next.name;
            serializedStyles += next.styles;
            next = next.next;
        }
        var shouldCache = cache.compat === true;
        var rules = cache.insert("", {
            name: serializedNames,
            styles: serializedStyles
        }, cache.sheet, shouldCache);
        if (shouldCache) return null;
        return /*#__PURE__*/ _react.createElement("style", (_ref = {}, _ref["data-emotion"] = cache.key + "-global " + serializedNames, _ref.dangerouslySetInnerHTML = {
            __html: rules
        }, _ref.nonce = cache.sheet.nonce, _ref));
    } // yes, i know these hooks are used conditionally
    // but it is based on a constant that will never change at runtime
    // it's effectively like having two implementations and switching them out
    // so it's not actually breaking anything
    var sheetRef = _react.useRef();
    (0, _useInsertionEffectWithFallbacks.useInsertionEffectWithLayoutFallback)(function() {
        var key = cache.key + "-global"; // use case of https://github.com/emotion-js/emotion/issues/2675
        var sheet = new cache.sheet.constructor({
            key: key,
            nonce: cache.sheet.nonce,
            container: cache.sheet.container,
            speedy: cache.sheet.isSpeedy
        });
        var rehydrating = false;
        var node = document.querySelector("style[data-emotion=\"" + key + " " + serialized.name + "\"]");
        if (cache.sheet.tags.length) sheet.before = cache.sheet.tags[0];
        if (node !== null) {
            rehydrating = true; // clear the hash so this node won't be recognizable as rehydratable by other <Global/>s
            node.setAttribute('data-emotion', key);
            sheet.hydrate([
                node
            ]);
        }
        sheetRef.current = [
            sheet,
            rehydrating
        ];
        return function() {
            sheet.flush();
        };
    }, [
        cache
    ]);
    (0, _useInsertionEffectWithFallbacks.useInsertionEffectWithLayoutFallback)(function() {
        var sheetRefCurrent = sheetRef.current;
        var sheet = sheetRefCurrent[0], rehydrating = sheetRefCurrent[1];
        if (rehydrating) {
            sheetRefCurrent[1] = false;
            return;
        }
        if (serialized.next !== undefined) // insert keyframes
        (0, _utils.insertStyles)(cache, serialized.next, true);
        if (sheet.tags.length) {
            // if this doesn't exist then it will be null so the style element will be appended
            var element = sheet.tags[sheet.tags.length - 1].nextElementSibling;
            sheet.before = element;
            sheet.flush();
        }
        cache.insert("", serialized, sheet, false);
    }, [
        cache,
        serialized.name
    ]);
    return null;
});
function css() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++)args[_key] = arguments[_key];
    return (0, _serialize.serializeStyles)(args);
}
function keyframes() {
    var insertable = css.apply(void 0, arguments);
    var name = "animation-" + insertable.name;
    return {
        name: name,
        styles: "@keyframes " + name + "{" + insertable.styles + "}",
        anim: 1,
        toString: function toString() {
            return "_EMO_" + this.name + "_" + this.styles + "_EMO_";
        }
    };
}
var classnames = function classnames(args) {
    var len = args.length;
    var i = 0;
    var cls = '';
    for(; i < len; i++){
        var arg = args[i];
        if (arg == null) continue;
        var toAdd = void 0;
        switch(typeof arg){
            case 'boolean':
                break;
            case 'object':
                if (Array.isArray(arg)) toAdd = classnames(arg);
                else {
                    toAdd = '';
                    for(var k in arg)if (arg[k] && k) {
                        toAdd && (toAdd += ' ');
                        toAdd += k;
                    }
                }
                break;
            default:
                toAdd = arg;
        }
        if (toAdd) {
            cls && (cls += ' ');
            cls += toAdd;
        }
    }
    return cls;
};
function merge(registered, css, className) {
    var registeredStyles = [];
    var rawClassName = (0, _utils.getRegisteredStyles)(registered, registeredStyles, className);
    if (registeredStyles.length < 2) return className;
    return rawClassName + css(registeredStyles);
}
var Insertion = function Insertion(_ref) {
    var cache = _ref.cache, serializedArr = _ref.serializedArr;
    var rules = (0, _useInsertionEffectWithFallbacks.useInsertionEffectAlwaysWithSyncFallback)(function() {
        var rules = '';
        for(var i = 0; i < serializedArr.length; i++){
            var res = (0, _utils.insertStyles)(cache, serializedArr[i], false);
            if (!(0, _emotionElementD59E098FEsmJs.i) && res !== undefined) rules += res;
        }
        if (!(0, _emotionElementD59E098FEsmJs.i)) return rules;
    });
    if (!(0, _emotionElementD59E098FEsmJs.i) && rules.length !== 0) {
        var _ref2;
        return /*#__PURE__*/ _react.createElement("style", (_ref2 = {}, _ref2["data-emotion"] = cache.key + " " + serializedArr.map(function(serialized) {
            return serialized.name;
        }).join(' '), _ref2.dangerouslySetInnerHTML = {
            __html: rules
        }, _ref2.nonce = cache.sheet.nonce, _ref2));
    }
    return null;
};
var ClassNames = /* #__PURE__ */ (0, _emotionElementD59E098FEsmJs.w)(function(props, cache) {
    var hasRendered = false;
    var serializedArr = [];
    var css = function css() {
        if (hasRendered && (0, _emotionElementD59E098FEsmJs.a)) throw new Error('css can only be used during render');
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++)args[_key] = arguments[_key];
        var serialized = (0, _serialize.serializeStyles)(args, cache.registered);
        serializedArr.push(serialized); // registration has to happen here as the result of this might get consumed by `cx`
        (0, _utils.registerStyles)(cache, serialized, false);
        return cache.key + "-" + serialized.name;
    };
    var cx = function cx() {
        if (hasRendered && (0, _emotionElementD59E098FEsmJs.a)) throw new Error('cx can only be used during render');
        for(var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++)args[_key2] = arguments[_key2];
        return merge(cache.registered, css, classnames(args));
    };
    var content = {
        css: css,
        cx: cx,
        theme: _react.useContext((0, _emotionElementD59E098FEsmJs.T))
    };
    var ele = props.children(content);
    hasRendered = true;
    return /*#__PURE__*/ _react.createElement(_react.Fragment, null, /*#__PURE__*/ _react.createElement(Insertion, {
        cache: cache,
        serializedArr: serializedArr
    }), ele);
});

},{"./emotion-element-d59e098f.esm.js":"e1SYK","react":"f39IF","@emotion/utils":"c0WGz","@emotion/use-insertion-effect-with-fallbacks":"56SGE","@emotion/serialize":"ho3Gw","@emotion/cache":"fhTtD","@babel/runtime/helpers/extends":"vw3vn","@emotion/weak-memoize":"grJxk","../_isolated-hnrs/dist/emotion-react-_isolated-hnrs.esm.js":"4TRa1","hoist-non-react-statics":"1GfsB","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"e1SYK":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "C", ()=>CacheProvider);
parcelHelpers.export(exports, "E", ()=>Emotion$1);
parcelHelpers.export(exports, "T", ()=>ThemeContext);
parcelHelpers.export(exports, "_", ()=>__unsafe_useEmotionCache);
parcelHelpers.export(exports, "a", ()=>isDevelopment);
parcelHelpers.export(exports, "b", ()=>ThemeProvider);
parcelHelpers.export(exports, "c", ()=>createEmotionProps);
parcelHelpers.export(exports, "d", ()=>withTheme);
parcelHelpers.export(exports, "h", ()=>hasOwn);
parcelHelpers.export(exports, "i", ()=>isBrowser);
parcelHelpers.export(exports, "u", ()=>useTheme);
parcelHelpers.export(exports, "w", ()=>withEmotionCache);
var _react = require("react");
var _cache = require("@emotion/cache");
var _cacheDefault = parcelHelpers.interopDefault(_cache);
var _extends = require("@babel/runtime/helpers/esm/extends");
var _extendsDefault = parcelHelpers.interopDefault(_extends);
var _weakMemoize = require("@emotion/weak-memoize");
var _weakMemoizeDefault = parcelHelpers.interopDefault(_weakMemoize);
var _emotionReactIsolatedHnrsEsmJs = require("../_isolated-hnrs/dist/emotion-react-_isolated-hnrs.esm.js");
var _emotionReactIsolatedHnrsEsmJsDefault = parcelHelpers.interopDefault(_emotionReactIsolatedHnrsEsmJs);
var _utils = require("@emotion/utils");
var _serialize = require("@emotion/serialize");
var _useInsertionEffectWithFallbacks = require("@emotion/use-insertion-effect-with-fallbacks");
var isDevelopment = false;
var isBrowser = typeof document !== 'undefined';
var EmotionCacheContext = /* #__PURE__ */ _react.createContext(// because this module is primarily intended for the browser and node
// but it's also required in react native and similar environments sometimes
// and we could have a special build just for that
// but this is much easier and the native packages
// might use a different theme context in the future anyway
typeof HTMLElement !== 'undefined' ? /* #__PURE__ */ (0, _cacheDefault.default)({
    key: 'css'
}) : null);
var CacheProvider = EmotionCacheContext.Provider;
var __unsafe_useEmotionCache = function useEmotionCache() {
    return (0, _react.useContext)(EmotionCacheContext);
};
var withEmotionCache = function withEmotionCache(func) {
    return /*#__PURE__*/ (0, _react.forwardRef)(function(props, ref) {
        // the cache will never be null in the browser
        var cache = (0, _react.useContext)(EmotionCacheContext);
        return func(props, cache, ref);
    });
};
if (!isBrowser) withEmotionCache = function withEmotionCache(func) {
    return function(props) {
        var cache = (0, _react.useContext)(EmotionCacheContext);
        if (cache === null) {
            // yes, we're potentially creating this on every render
            // it doesn't actually matter though since it's only on the server
            // so there will only every be a single render
            // that could change in the future because of suspense and etc. but for now,
            // this works and i don't want to optimise for a future thing that we aren't sure about
            cache = (0, _cacheDefault.default)({
                key: 'css'
            });
            return /*#__PURE__*/ _react.createElement(EmotionCacheContext.Provider, {
                value: cache
            }, func(props, cache));
        } else return func(props, cache);
    };
};
var ThemeContext = /* #__PURE__ */ _react.createContext({});
var useTheme = function useTheme() {
    return _react.useContext(ThemeContext);
};
var getTheme = function getTheme(outerTheme, theme) {
    if (typeof theme === 'function') {
        var mergedTheme = theme(outerTheme);
        return mergedTheme;
    }
    return (0, _extendsDefault.default)({}, outerTheme, theme);
};
var createCacheWithTheme = /* #__PURE__ */ (0, _weakMemoizeDefault.default)(function(outerTheme) {
    return (0, _weakMemoizeDefault.default)(function(theme) {
        return getTheme(outerTheme, theme);
    });
});
var ThemeProvider = function ThemeProvider(props) {
    var theme = _react.useContext(ThemeContext);
    if (props.theme !== theme) theme = createCacheWithTheme(theme)(props.theme);
    return /*#__PURE__*/ _react.createElement(ThemeContext.Provider, {
        value: theme
    }, props.children);
};
function withTheme(Component) {
    var componentName = Component.displayName || Component.name || 'Component';
    var WithTheme = /*#__PURE__*/ _react.forwardRef(function render(props, ref) {
        var theme = _react.useContext(ThemeContext);
        return /*#__PURE__*/ _react.createElement(Component, (0, _extendsDefault.default)({
            theme: theme,
            ref: ref
        }, props));
    });
    WithTheme.displayName = "WithTheme(" + componentName + ")";
    return (0, _emotionReactIsolatedHnrsEsmJsDefault.default)(WithTheme, Component);
}
var hasOwn = {}.hasOwnProperty;
var typePropName = '__EMOTION_TYPE_PLEASE_DO_NOT_USE__';
var createEmotionProps = function createEmotionProps(type, props) {
    var newProps = {};
    for(var _key in props)if (hasOwn.call(props, _key)) newProps[_key] = props[_key];
    newProps[typePropName] = type; // Runtime labeling is an opt-in feature because:
    return newProps;
};
var Insertion = function Insertion(_ref) {
    var cache = _ref.cache, serialized = _ref.serialized, isStringTag = _ref.isStringTag;
    (0, _utils.registerStyles)(cache, serialized, isStringTag);
    var rules = (0, _useInsertionEffectWithFallbacks.useInsertionEffectAlwaysWithSyncFallback)(function() {
        return (0, _utils.insertStyles)(cache, serialized, isStringTag);
    });
    if (!isBrowser && rules !== undefined) {
        var _ref2;
        var serializedNames = serialized.name;
        var next = serialized.next;
        while(next !== undefined){
            serializedNames += ' ' + next.name;
            next = next.next;
        }
        return /*#__PURE__*/ _react.createElement("style", (_ref2 = {}, _ref2["data-emotion"] = cache.key + " " + serializedNames, _ref2.dangerouslySetInnerHTML = {
            __html: rules
        }, _ref2.nonce = cache.sheet.nonce, _ref2));
    }
    return null;
};
var Emotion = /* #__PURE__ */ withEmotionCache(function(props, cache, ref) {
    var cssProp = props.css; // so that using `css` from `emotion` and passing the result to the css prop works
    // not passing the registered cache to serializeStyles because it would
    // make certain babel optimisations not possible
    if (typeof cssProp === 'string' && cache.registered[cssProp] !== undefined) cssProp = cache.registered[cssProp];
    var WrappedComponent = props[typePropName];
    var registeredStyles = [
        cssProp
    ];
    var className = '';
    if (typeof props.className === 'string') className = (0, _utils.getRegisteredStyles)(cache.registered, registeredStyles, props.className);
    else if (props.className != null) className = props.className + " ";
    var serialized = (0, _serialize.serializeStyles)(registeredStyles, undefined, _react.useContext(ThemeContext));
    className += cache.key + "-" + serialized.name;
    var newProps = {};
    for(var _key2 in props)if (hasOwn.call(props, _key2) && _key2 !== 'css' && _key2 !== typePropName && !isDevelopment) newProps[_key2] = props[_key2];
    newProps.className = className;
    if (ref) newProps.ref = ref;
    return /*#__PURE__*/ _react.createElement(_react.Fragment, null, /*#__PURE__*/ _react.createElement(Insertion, {
        cache: cache,
        serialized: serialized,
        isStringTag: typeof WrappedComponent === 'string'
    }), /*#__PURE__*/ _react.createElement(WrappedComponent, newProps));
});
var Emotion$1 = Emotion;

},{"react":"f39IF","@emotion/cache":"fhTtD","@babel/runtime/helpers/esm/extends":"fTBFS","@emotion/weak-memoize":"grJxk","../_isolated-hnrs/dist/emotion-react-_isolated-hnrs.esm.js":"4TRa1","@emotion/utils":"c0WGz","@emotion/serialize":"ho3Gw","@emotion/use-insertion-effect-with-fallbacks":"56SGE","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fhTtD":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "default", ()=>createCache);
var _sheet = require("@emotion/sheet");
var _stylis = require("stylis");
var _weakMemoize = require("@emotion/weak-memoize");
var _weakMemoizeDefault = parcelHelpers.interopDefault(_weakMemoize);
var _memoize = require("@emotion/memoize");
var _memoizeDefault = parcelHelpers.interopDefault(_memoize);
var isBrowser = typeof document !== 'undefined';
var identifierWithPointTracking = function identifierWithPointTracking(begin, points, index) {
    var previous = 0;
    var character = 0;
    while(true){
        previous = character;
        character = (0, _stylis.peek)(); // &\f
        if (previous === 38 && character === 12) points[index] = 1;
        if ((0, _stylis.token)(character)) break;
        (0, _stylis.next)();
    }
    return (0, _stylis.slice)(begin, (0, _stylis.position));
};
var toRules = function toRules(parsed, points) {
    // pretend we've started with a comma
    var index = -1;
    var character = 44;
    do switch((0, _stylis.token)(character)){
        case 0:
            // &\f
            if (character === 38 && (0, _stylis.peek)() === 12) // this is not 100% correct, we don't account for literal sequences here - like for example quoted strings
            // stylis inserts \f after & to know when & where it should replace this sequence with the context selector
            // and when it should just concatenate the outer and inner selectors
            // it's very unlikely for this sequence to actually appear in a different context, so we just leverage this fact here
            points[index] = 1;
            parsed[index] += identifierWithPointTracking((0, _stylis.position) - 1, points, index);
            break;
        case 2:
            parsed[index] += (0, _stylis.delimit)(character);
            break;
        case 4:
            // comma
            if (character === 44) {
                // colon
                parsed[++index] = (0, _stylis.peek)() === 58 ? '&\f' : '';
                points[index] = parsed[index].length;
                break;
            }
        // fallthrough
        default:
            parsed[index] += (0, _stylis.from)(character);
    }
    while (character = (0, _stylis.next)());
    return parsed;
};
var getRules = function getRules(value, points) {
    return (0, _stylis.dealloc)(toRules((0, _stylis.alloc)(value), points));
}; // WeakSet would be more appropriate, but only WeakMap is supported in IE11
var fixedElements = /* #__PURE__ */ new WeakMap();
var compat = function compat(element) {
    if (element.type !== 'rule' || !element.parent || // positive .length indicates that this rule contains pseudo
    // negative .length indicates that this rule has been already prefixed
    element.length < 1) return;
    var value = element.value;
    var parent = element.parent;
    var isImplicitRule = element.column === parent.column && element.line === parent.line;
    while(parent.type !== 'rule'){
        parent = parent.parent;
        if (!parent) return;
    } // short-circuit for the simplest case
    if (element.props.length === 1 && value.charCodeAt(0) !== 58 && !fixedElements.get(parent)) return;
     // if this is an implicitly inserted rule (the one eagerly inserted at the each new nested level)
    // then the props has already been manipulated beforehand as they that array is shared between it and its "rule parent"
    if (isImplicitRule) return;
    fixedElements.set(element, true);
    var points = [];
    var rules = getRules(value, points);
    var parentRules = parent.props;
    for(var i = 0, k = 0; i < rules.length; i++)for(var j = 0; j < parentRules.length; j++, k++)element.props[k] = points[i] ? rules[i].replace(/&\f/g, parentRules[j]) : parentRules[j] + " " + rules[i];
};
var removeLabel = function removeLabel(element) {
    if (element.type === 'decl') {
        var value = element.value;
        if (value.charCodeAt(0) === 108 && // charcode for b
        value.charCodeAt(2) === 98) {
            // this ignores label
            element["return"] = '';
            element.value = '';
        }
    }
};
/* eslint-disable no-fallthrough */ function prefix(value, length) {
    switch((0, _stylis.hash)(value, length)){
        // color-adjust
        case 5103:
            return (0, _stylis.WEBKIT) + 'print-' + value + value;
        // animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
        case 5737:
        case 4201:
        case 3177:
        case 3433:
        case 1641:
        case 4457:
        case 2921:
        case 5572:
        case 6356:
        case 5844:
        case 3191:
        case 6645:
        case 3005:
        case 6391:
        case 5879:
        case 5623:
        case 6135:
        case 4599:
        case 4855:
        case 4215:
        case 6389:
        case 5109:
        case 5365:
        case 5621:
        case 3829:
            return (0, _stylis.WEBKIT) + value + value;
        // appearance, user-select, transform, hyphens, text-size-adjust
        case 5349:
        case 4246:
        case 4810:
        case 6968:
        case 2756:
            return (0, _stylis.WEBKIT) + value + (0, _stylis.MOZ) + value + (0, _stylis.MS) + value + value;
        // flex, flex-direction
        case 6828:
        case 4268:
            return (0, _stylis.WEBKIT) + value + (0, _stylis.MS) + value + value;
        // order
        case 6165:
            return (0, _stylis.WEBKIT) + value + (0, _stylis.MS) + 'flex-' + value + value;
        // align-items
        case 5187:
            return (0, _stylis.WEBKIT) + value + (0, _stylis.replace)(value, /(\w+).+(:[^]+)/, (0, _stylis.WEBKIT) + 'box-$1$2' + (0, _stylis.MS) + 'flex-$1$2') + value;
        // align-self
        case 5443:
            return (0, _stylis.WEBKIT) + value + (0, _stylis.MS) + 'flex-item-' + (0, _stylis.replace)(value, /flex-|-self/, '') + value;
        // align-content
        case 4675:
            return (0, _stylis.WEBKIT) + value + (0, _stylis.MS) + 'flex-line-pack' + (0, _stylis.replace)(value, /align-content|flex-|-self/, '') + value;
        // flex-shrink
        case 5548:
            return (0, _stylis.WEBKIT) + value + (0, _stylis.MS) + (0, _stylis.replace)(value, 'shrink', 'negative') + value;
        // flex-basis
        case 5292:
            return (0, _stylis.WEBKIT) + value + (0, _stylis.MS) + (0, _stylis.replace)(value, 'basis', 'preferred-size') + value;
        // flex-grow
        case 6060:
            return (0, _stylis.WEBKIT) + 'box-' + (0, _stylis.replace)(value, '-grow', '') + (0, _stylis.WEBKIT) + value + (0, _stylis.MS) + (0, _stylis.replace)(value, 'grow', 'positive') + value;
        // transition
        case 4554:
            return (0, _stylis.WEBKIT) + (0, _stylis.replace)(value, /([^-])(transform)/g, '$1' + (0, _stylis.WEBKIT) + '$2') + value;
        // cursor
        case 6187:
            return (0, _stylis.replace)((0, _stylis.replace)((0, _stylis.replace)(value, /(zoom-|grab)/, (0, _stylis.WEBKIT) + '$1'), /(image-set)/, (0, _stylis.WEBKIT) + '$1'), value, '') + value;
        // background, background-image
        case 5495:
        case 3959:
            return (0, _stylis.replace)(value, /(image-set\([^]*)/, (0, _stylis.WEBKIT) + '$1' + '$`$1');
        // justify-content
        case 4968:
            return (0, _stylis.replace)((0, _stylis.replace)(value, /(.+:)(flex-)?(.*)/, (0, _stylis.WEBKIT) + 'box-pack:$3' + (0, _stylis.MS) + 'flex-pack:$3'), /s.+-b[^;]+/, 'justify') + (0, _stylis.WEBKIT) + value + value;
        // (margin|padding)-inline-(start|end)
        case 4095:
        case 3583:
        case 4068:
        case 2532:
            return (0, _stylis.replace)(value, /(.+)-inline(.+)/, (0, _stylis.WEBKIT) + '$1$2') + value;
        // (min|max)?(width|height|inline-size|block-size)
        case 8116:
        case 7059:
        case 5753:
        case 5535:
        case 5445:
        case 5701:
        case 4933:
        case 4677:
        case 5533:
        case 5789:
        case 5021:
        case 4765:
            // stretch, max-content, min-content, fill-available
            if ((0, _stylis.strlen)(value) - 1 - length > 6) switch((0, _stylis.charat)(value, length + 1)){
                // (m)ax-content, (m)in-content
                case 109:
                    // -
                    if ((0, _stylis.charat)(value, length + 4) !== 45) break;
                // (f)ill-available, (f)it-content
                case 102:
                    return (0, _stylis.replace)(value, /(.+:)(.+)-([^]+)/, '$1' + (0, _stylis.WEBKIT) + '$2-$3' + '$1' + (0, _stylis.MOZ) + ((0, _stylis.charat)(value, length + 3) == 108 ? '$3' : '$2-$3')) + value;
                // (s)tretch
                case 115:
                    return ~(0, _stylis.indexof)(value, 'stretch') ? prefix((0, _stylis.replace)(value, 'stretch', 'fill-available'), length) + value : value;
            }
            break;
        // position: sticky
        case 4949:
            // (s)ticky?
            if ((0, _stylis.charat)(value, length + 1) !== 115) break;
        // display: (flex|inline-flex)
        case 6444:
            switch((0, _stylis.charat)(value, (0, _stylis.strlen)(value) - 3 - (~(0, _stylis.indexof)(value, '!important') && 10))){
                // stic(k)y
                case 107:
                    return (0, _stylis.replace)(value, ':', ':' + (0, _stylis.WEBKIT)) + value;
                // (inline-)?fl(e)x
                case 101:
                    return (0, _stylis.replace)(value, /(.+:)([^;!]+)(;|!.+)?/, '$1' + (0, _stylis.WEBKIT) + ((0, _stylis.charat)(value, 14) === 45 ? 'inline-' : '') + 'box$3' + '$1' + (0, _stylis.WEBKIT) + '$2$3' + '$1' + (0, _stylis.MS) + '$2box$3') + value;
            }
            break;
        // writing-mode
        case 5936:
            switch((0, _stylis.charat)(value, length + 11)){
                // vertical-l(r)
                case 114:
                    return (0, _stylis.WEBKIT) + value + (0, _stylis.MS) + (0, _stylis.replace)(value, /[svh]\w+-[tblr]{2}/, 'tb') + value;
                // vertical-r(l)
                case 108:
                    return (0, _stylis.WEBKIT) + value + (0, _stylis.MS) + (0, _stylis.replace)(value, /[svh]\w+-[tblr]{2}/, 'tb-rl') + value;
                // horizontal(-)tb
                case 45:
                    return (0, _stylis.WEBKIT) + value + (0, _stylis.MS) + (0, _stylis.replace)(value, /[svh]\w+-[tblr]{2}/, 'lr') + value;
            }
            return (0, _stylis.WEBKIT) + value + (0, _stylis.MS) + value + value;
    }
    return value;
}
var prefixer = function prefixer(element, index, children, callback) {
    if (element.length > -1) {
        if (!element["return"]) switch(element.type){
            case 0, _stylis.DECLARATION:
                element["return"] = prefix(element.value, element.length);
                break;
            case 0, _stylis.KEYFRAMES:
                return (0, _stylis.serialize)([
                    (0, _stylis.copy)(element, {
                        value: (0, _stylis.replace)(element.value, '@', '@' + (0, _stylis.WEBKIT))
                    })
                ], callback);
            case 0, _stylis.RULESET:
                if (element.length) return (0, _stylis.combine)(element.props, function(value) {
                    switch((0, _stylis.match)(value, /(::plac\w+|:read-\w+)/)){
                        // :read-(only|write)
                        case ':read-only':
                        case ':read-write':
                            return (0, _stylis.serialize)([
                                (0, _stylis.copy)(element, {
                                    props: [
                                        (0, _stylis.replace)(value, /:(read-\w+)/, ':' + (0, _stylis.MOZ) + '$1')
                                    ]
                                })
                            ], callback);
                        // :placeholder
                        case '::placeholder':
                            return (0, _stylis.serialize)([
                                (0, _stylis.copy)(element, {
                                    props: [
                                        (0, _stylis.replace)(value, /:(plac\w+)/, ':' + (0, _stylis.WEBKIT) + 'input-$1')
                                    ]
                                }),
                                (0, _stylis.copy)(element, {
                                    props: [
                                        (0, _stylis.replace)(value, /:(plac\w+)/, ':' + (0, _stylis.MOZ) + '$1')
                                    ]
                                }),
                                (0, _stylis.copy)(element, {
                                    props: [
                                        (0, _stylis.replace)(value, /:(plac\w+)/, (0, _stylis.MS) + 'input-$1')
                                    ]
                                })
                            ], callback);
                    }
                    return '';
                });
        }
    }
};
var getServerStylisCache = isBrowser ? undefined : (0, _weakMemoizeDefault.default)(function() {
    return (0, _memoizeDefault.default)(function() {
        return {};
    });
});
var defaultStylisPlugins = [
    prefixer
];
var createCache = function createCache(options) {
    var key = options.key;
    if (isBrowser && key === 'css') {
        var ssrStyles = document.querySelectorAll("style[data-emotion]:not([data-s])"); // get SSRed styles out of the way of React's hydration
        // document.head is a safe place to move them to(though note document.head is not necessarily the last place they will be)
        // note this very very intentionally targets all style elements regardless of the key to ensure
        // that creating a cache works inside of render of a React component
        Array.prototype.forEach.call(ssrStyles, function(node) {
            // we want to only move elements which have a space in the data-emotion attribute value
            // because that indicates that it is an Emotion 11 server-side rendered style elements
            // while we will already ignore Emotion 11 client-side inserted styles because of the :not([data-s]) part in the selector
            // Emotion 10 client-side inserted styles did not have data-s (but importantly did not have a space in their data-emotion attributes)
            // so checking for the space ensures that loading Emotion 11 after Emotion 10 has inserted some styles
            // will not result in the Emotion 10 styles being destroyed
            var dataEmotionAttribute = node.getAttribute('data-emotion');
            if (dataEmotionAttribute.indexOf(' ') === -1) return;
            document.head.appendChild(node);
            node.setAttribute('data-s', '');
        });
    }
    var stylisPlugins = options.stylisPlugins || defaultStylisPlugins;
    var inserted = {};
    var container;
    var nodesToHydrate = [];
    if (isBrowser) {
        container = options.container || document.head;
        Array.prototype.forEach.call(// means that the style elements we're looking at are only Emotion 11 server-rendered style elements
        document.querySelectorAll("style[data-emotion^=\"" + key + " \"]"), function(node) {
            var attrib = node.getAttribute("data-emotion").split(' ');
            for(var i = 1; i < attrib.length; i++)inserted[attrib[i]] = true;
            nodesToHydrate.push(node);
        });
    }
    var _insert;
    var omnipresentPlugins = [
        compat,
        removeLabel
    ];
    if (!getServerStylisCache) {
        var currentSheet;
        var finalizingPlugins = [
            (0, _stylis.stringify),
            (0, _stylis.rulesheet)(function(rule) {
                currentSheet.insert(rule);
            })
        ];
        var serializer = (0, _stylis.middleware)(omnipresentPlugins.concat(stylisPlugins, finalizingPlugins));
        var stylis = function stylis(styles) {
            return (0, _stylis.serialize)((0, _stylis.compile)(styles), serializer);
        };
        _insert = function insert(selector, serialized, sheet, shouldCache) {
            currentSheet = sheet;
            stylis(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);
            if (shouldCache) cache.inserted[serialized.name] = true;
        };
    } else {
        var _finalizingPlugins = [
            (0, _stylis.stringify)
        ];
        var _serializer = (0, _stylis.middleware)(omnipresentPlugins.concat(stylisPlugins, _finalizingPlugins));
        var _stylis1 = function _stylis1(styles) {
            return (0, _stylis.serialize)((0, _stylis.compile)(styles), _serializer);
        };
        var serverStylisCache = getServerStylisCache(stylisPlugins)(key);
        var getRules = function getRules(selector, serialized) {
            var name = serialized.name;
            if (serverStylisCache[name] === undefined) serverStylisCache[name] = _stylis1(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);
            return serverStylisCache[name];
        };
        _insert = function _insert(selector, serialized, sheet, shouldCache) {
            var name = serialized.name;
            var rules = getRules(selector, serialized);
            if (cache.compat === undefined) {
                // in regular mode, we don't set the styles on the inserted cache
                // since we don't need to and that would be wasting memory
                // we return them so that they are rendered in a style tag
                if (shouldCache) cache.inserted[name] = true;
                return rules;
            } else {
                // in compat mode, we put the styles on the inserted cache so
                // that emotion-server can pull out the styles
                // except when we don't want to cache it which was in Global but now
                // is nowhere but we don't want to do a major right now
                // and just in case we're going to leave the case here
                // it's also not affecting client side bundle size
                // so it's really not a big deal
                if (shouldCache) cache.inserted[name] = rules;
                else return rules;
            }
        };
    }
    var cache = {
        key: key,
        sheet: new (0, _sheet.StyleSheet)({
            key: key,
            container: container,
            nonce: options.nonce,
            speedy: options.speedy,
            prepend: options.prepend,
            insertionPoint: options.insertionPoint
        }),
        nonce: options.nonce,
        inserted: inserted,
        registered: {},
        insert: _insert
    };
    cache.sheet.hydrate(nodesToHydrate);
    return cache;
};

},{"@emotion/sheet":"at9S5","stylis":"bMCXt","@emotion/weak-memoize":"grJxk","@emotion/memoize":"2vzJd","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"at9S5":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "StyleSheet", ()=>StyleSheet);
var isDevelopment = false;
/*

Based off glamor's StyleSheet, thanks Sunil ❤️

high performance StyleSheet for css-in-js systems

- uses multiple style tags behind the scenes for millions of rules
- uses `insertRule` for appending in production for *much* faster performance

// usage

import { StyleSheet } from '@emotion/sheet'

let styleSheet = new StyleSheet({ key: '', container: document.head })

styleSheet.insert('#box { border: 1px solid red; }')
- appends a css rule into the stylesheet

styleSheet.flush()
- empties the stylesheet of all its contents

*/ function sheetForTag(tag) {
    if (tag.sheet) return tag.sheet;
     // this weirdness brought to you by firefox
    /* istanbul ignore next */ for(var i = 0; i < document.styleSheets.length; i++){
        if (document.styleSheets[i].ownerNode === tag) return document.styleSheets[i];
    } // this function should always return with a value
    // TS can't understand it though so we make it stop complaining here
    return undefined;
}
function createStyleElement(options) {
    var tag = document.createElement('style');
    tag.setAttribute('data-emotion', options.key);
    if (options.nonce !== undefined) tag.setAttribute('nonce', options.nonce);
    tag.appendChild(document.createTextNode(''));
    tag.setAttribute('data-s', '');
    return tag;
}
var StyleSheet = /*#__PURE__*/ function() {
    // Using Node instead of HTMLElement since container may be a ShadowRoot
    function StyleSheet(options) {
        var _this = this;
        this._insertTag = function(tag) {
            var before;
            if (_this.tags.length === 0) {
                if (_this.insertionPoint) before = _this.insertionPoint.nextSibling;
                else if (_this.prepend) before = _this.container.firstChild;
                else before = _this.before;
            } else before = _this.tags[_this.tags.length - 1].nextSibling;
            _this.container.insertBefore(tag, before);
            _this.tags.push(tag);
        };
        this.isSpeedy = options.speedy === undefined ? !isDevelopment : options.speedy;
        this.tags = [];
        this.ctr = 0;
        this.nonce = options.nonce; // key is the value of the data-emotion attribute, it's used to identify different sheets
        this.key = options.key;
        this.container = options.container;
        this.prepend = options.prepend;
        this.insertionPoint = options.insertionPoint;
        this.before = null;
    }
    var _proto = StyleSheet.prototype;
    _proto.hydrate = function hydrate(nodes) {
        nodes.forEach(this._insertTag);
    };
    _proto.insert = function insert(rule) {
        // the max length is how many rules we have per style tag, it's 65000 in speedy mode
        // it's 1 in dev because we insert source maps that map a single rule to a location
        // and you can only have one source map per style tag
        if (this.ctr % (this.isSpeedy ? 65000 : 1) === 0) this._insertTag(createStyleElement(this));
        var tag = this.tags[this.tags.length - 1];
        if (this.isSpeedy) {
            var sheet = sheetForTag(tag);
            try {
                // this is the ultrafast version, works across browsers
                // the big drawback is that the css won't be editable in devtools
                sheet.insertRule(rule, sheet.cssRules.length);
            } catch (e) {}
        } else tag.appendChild(document.createTextNode(rule));
        this.ctr++;
    };
    _proto.flush = function flush() {
        this.tags.forEach(function(tag) {
            var _tag$parentNode;
            return (_tag$parentNode = tag.parentNode) == null ? void 0 : _tag$parentNode.removeChild(tag);
        });
        this.tags = [];
        this.ctr = 0;
    };
    return StyleSheet;
}();

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"bMCXt":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "CHARSET", ()=>f);
parcelHelpers.export(exports, "COMMENT", ()=>n);
parcelHelpers.export(exports, "COUNTER_STYLE", ()=>w);
parcelHelpers.export(exports, "DECLARATION", ()=>s);
parcelHelpers.export(exports, "DOCUMENT", ()=>v);
parcelHelpers.export(exports, "FONT_FACE", ()=>b);
parcelHelpers.export(exports, "FONT_FEATURE_VALUES", ()=>d);
parcelHelpers.export(exports, "IMPORT", ()=>i);
parcelHelpers.export(exports, "KEYFRAMES", ()=>h);
parcelHelpers.export(exports, "LAYER", ()=>$);
parcelHelpers.export(exports, "MEDIA", ()=>u);
parcelHelpers.export(exports, "MOZ", ()=>r);
parcelHelpers.export(exports, "MS", ()=>e);
parcelHelpers.export(exports, "NAMESPACE", ()=>p);
parcelHelpers.export(exports, "PAGE", ()=>t);
parcelHelpers.export(exports, "RULESET", ()=>c);
parcelHelpers.export(exports, "SUPPORTS", ()=>l);
parcelHelpers.export(exports, "VIEWPORT", ()=>o);
parcelHelpers.export(exports, "WEBKIT", ()=>a);
parcelHelpers.export(exports, "abs", ()=>g);
parcelHelpers.export(exports, "alloc", ()=>V);
parcelHelpers.export(exports, "append", ()=>q);
parcelHelpers.export(exports, "assign", ()=>m);
parcelHelpers.export(exports, "caret", ()=>R);
parcelHelpers.export(exports, "char", ()=>L);
parcelHelpers.export(exports, "character", ()=>H);
parcelHelpers.export(exports, "characters", ()=>I);
parcelHelpers.export(exports, "charat", ()=>O);
parcelHelpers.export(exports, "column", ()=>E);
parcelHelpers.export(exports, "combine", ()=>B);
parcelHelpers.export(exports, "comment", ()=>ue);
parcelHelpers.export(exports, "commenter", ()=>ae);
parcelHelpers.export(exports, "compile", ()=>ce);
parcelHelpers.export(exports, "copy", ()=>K);
parcelHelpers.export(exports, "dealloc", ()=>W);
parcelHelpers.export(exports, "declaration", ()=>ie);
parcelHelpers.export(exports, "delimit", ()=>X);
parcelHelpers.export(exports, "delimiter", ()=>re);
parcelHelpers.export(exports, "escaping", ()=>ee);
parcelHelpers.export(exports, "from", ()=>k);
parcelHelpers.export(exports, "hash", ()=>x);
parcelHelpers.export(exports, "identifier", ()=>ne);
parcelHelpers.export(exports, "indexof", ()=>C);
parcelHelpers.export(exports, "length", ()=>F);
parcelHelpers.export(exports, "line", ()=>D);
parcelHelpers.export(exports, "match", ()=>j);
parcelHelpers.export(exports, "middleware", ()=>ve);
parcelHelpers.export(exports, "namespace", ()=>be);
parcelHelpers.export(exports, "next", ()=>P);
parcelHelpers.export(exports, "node", ()=>J);
parcelHelpers.export(exports, "parse", ()=>se);
parcelHelpers.export(exports, "peek", ()=>Q);
parcelHelpers.export(exports, "position", ()=>G);
parcelHelpers.export(exports, "prefix", ()=>fe);
parcelHelpers.export(exports, "prefixer", ()=>he);
parcelHelpers.export(exports, "prev", ()=>N);
parcelHelpers.export(exports, "replace", ()=>z);
parcelHelpers.export(exports, "ruleset", ()=>te);
parcelHelpers.export(exports, "rulesheet", ()=>pe);
parcelHelpers.export(exports, "serialize", ()=>oe);
parcelHelpers.export(exports, "sizeof", ()=>S);
parcelHelpers.export(exports, "slice", ()=>T);
parcelHelpers.export(exports, "stringify", ()=>le);
parcelHelpers.export(exports, "strlen", ()=>M);
parcelHelpers.export(exports, "substr", ()=>A);
parcelHelpers.export(exports, "token", ()=>U);
parcelHelpers.export(exports, "tokenize", ()=>Y);
parcelHelpers.export(exports, "tokenizer", ()=>_);
parcelHelpers.export(exports, "trim", ()=>y);
parcelHelpers.export(exports, "whitespace", ()=>Z);
var e = "-ms-";
var r = "-moz-";
var a = "-webkit-";
var n = "comm";
var c = "rule";
var s = "decl";
var t = "@page";
var u = "@media";
var i = "@import";
var f = "@charset";
var o = "@viewport";
var l = "@supports";
var v = "@document";
var p = "@namespace";
var h = "@keyframes";
var b = "@font-face";
var w = "@counter-style";
var d = "@font-feature-values";
var $ = "@layer";
var g = Math.abs;
var k = String.fromCharCode;
var m = Object.assign;
function x(e, r) {
    return O(e, 0) ^ 45 ? (((r << 2 ^ O(e, 0)) << 2 ^ O(e, 1)) << 2 ^ O(e, 2)) << 2 ^ O(e, 3) : 0;
}
function y(e) {
    return e.trim();
}
function j(e, r) {
    return (e = r.exec(e)) ? e[0] : e;
}
function z(e, r, a) {
    return e.replace(r, a);
}
function C(e, r) {
    return e.indexOf(r);
}
function O(e, r) {
    return e.charCodeAt(r) | 0;
}
function A(e, r, a) {
    return e.slice(r, a);
}
function M(e) {
    return e.length;
}
function S(e) {
    return e.length;
}
function q(e, r) {
    return r.push(e), e;
}
function B(e, r) {
    return e.map(r).join("");
}
var D = 1;
var E = 1;
var F = 0;
var G = 0;
var H = 0;
var I = "";
function J(e, r, a, n, c, s, t) {
    return {
        value: e,
        root: r,
        parent: a,
        type: n,
        props: c,
        children: s,
        line: D,
        column: E,
        length: t,
        return: ""
    };
}
function K(e, r) {
    return m(J("", null, null, "", null, null, 0), e, {
        length: -e.length
    }, r);
}
function L() {
    return H;
}
function N() {
    H = G > 0 ? O(I, --G) : 0;
    if (E--, H === 10) E = 1, D--;
    return H;
}
function P() {
    H = G < F ? O(I, G++) : 0;
    if (E++, H === 10) E = 1, D++;
    return H;
}
function Q() {
    return O(I, G);
}
function R() {
    return G;
}
function T(e, r) {
    return A(I, e, r);
}
function U(e) {
    switch(e){
        case 0:
        case 9:
        case 10:
        case 13:
        case 32:
            return 5;
        case 33:
        case 43:
        case 44:
        case 47:
        case 62:
        case 64:
        case 126:
        case 59:
        case 123:
        case 125:
            return 4;
        case 58:
            return 3;
        case 34:
        case 39:
        case 40:
        case 91:
            return 2;
        case 41:
        case 93:
            return 1;
    }
    return 0;
}
function V(e) {
    return D = E = 1, F = M(I = e), G = 0, [];
}
function W(e) {
    return I = "", e;
}
function X(e) {
    return y(T(G - 1, re(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function Y(e) {
    return W(_(V(e)));
}
function Z(e) {
    while(H = Q())if (H < 33) P();
    else break;
    return U(e) > 2 || U(H) > 3 ? "" : " ";
}
function _(e) {
    while(P())switch(U(H)){
        case 0:
            q(ne(G - 1), e);
            break;
        case 2:
            q(X(H), e);
            break;
        default:
            q(k(H), e);
    }
    return e;
}
function ee(e, r) {
    while(--r && P())if (H < 48 || H > 102 || H > 57 && H < 65 || H > 70 && H < 97) break;
    return T(e, R() + (r < 6 && Q() == 32 && P() == 32));
}
function re(e) {
    while(P())switch(H){
        case e:
            return G;
        case 34:
        case 39:
            if (e !== 34 && e !== 39) re(H);
            break;
        case 40:
            if (e === 41) re(e);
            break;
        case 92:
            P();
            break;
    }
    return G;
}
function ae(e, r) {
    while(P())if (e + H === 57) break;
    else if (e + H === 84 && Q() === 47) break;
    return "/*" + T(r, G - 1) + "*" + k(e === 47 ? e : P());
}
function ne(e) {
    while(!U(Q()))P();
    return T(e, G);
}
function ce(e) {
    return W(se("", null, null, null, [
        ""
    ], e = V(e), 0, [
        0
    ], e));
}
function se(e, r, a, n, c, s, t, u, i) {
    var f = 0;
    var o = 0;
    var l = t;
    var v = 0;
    var p = 0;
    var h = 0;
    var b = 1;
    var w = 1;
    var d = 1;
    var $ = 0;
    var g = "";
    var m = c;
    var x = s;
    var y = n;
    var j = g;
    while(w)switch(h = $, $ = P()){
        case 40:
            if (h != 108 && O(j, l - 1) == 58) {
                if (C(j += z(X($), "&", "&\f"), "&\f") != -1) d = -1;
                break;
            }
        case 34:
        case 39:
        case 91:
            j += X($);
            break;
        case 9:
        case 10:
        case 13:
        case 32:
            j += Z(h);
            break;
        case 92:
            j += ee(R() - 1, 7);
            continue;
        case 47:
            switch(Q()){
                case 42:
                case 47:
                    q(ue(ae(P(), R()), r, a), i);
                    break;
                default:
                    j += "/";
            }
            break;
        case 123 * b:
            u[f++] = M(j) * d;
        case 125 * b:
        case 59:
        case 0:
            switch($){
                case 0:
                case 125:
                    w = 0;
                case 59 + o:
                    if (d == -1) j = z(j, /\f/g, "");
                    if (p > 0 && M(j) - l) q(p > 32 ? ie(j + ";", n, a, l - 1) : ie(z(j, " ", "") + ";", n, a, l - 2), i);
                    break;
                case 59:
                    j += ";";
                default:
                    q(y = te(j, r, a, f, o, c, u, g, m = [], x = [], l), s);
                    if ($ === 123) {
                        if (o === 0) se(j, r, y, y, m, s, l, u, x);
                        else switch(v === 99 && O(j, 3) === 110 ? 100 : v){
                            case 100:
                            case 108:
                            case 109:
                            case 115:
                                se(e, y, y, n && q(te(e, y, y, 0, 0, c, u, g, c, m = [], l), x), c, x, l, u, n ? m : x);
                                break;
                            default:
                                se(j, y, y, y, [
                                    ""
                                ], x, 0, u, x);
                        }
                    }
            }
            f = o = p = 0, b = d = 1, g = j = "", l = t;
            break;
        case 58:
            l = 1 + M(j), p = h;
        default:
            if (b < 1) {
                if ($ == 123) --b;
                else if ($ == 125 && b++ == 0 && N() == 125) continue;
            }
            switch(j += k($), $ * b){
                case 38:
                    d = o > 0 ? 1 : (j += "\f", -1);
                    break;
                case 44:
                    u[f++] = (M(j) - 1) * d, d = 1;
                    break;
                case 64:
                    if (Q() === 45) j += X(P());
                    v = Q(), o = l = M(g = j += ne(R())), $++;
                    break;
                case 45:
                    if (h === 45 && M(j) == 2) b = 0;
            }
    }
    return s;
}
function te(e, r, a, n, s, t, u, i, f, o, l) {
    var v = s - 1;
    var p = s === 0 ? t : [
        ""
    ];
    var h = S(p);
    for(var b = 0, w = 0, d = 0; b < n; ++b)for(var $ = 0, k = A(e, v + 1, v = g(w = u[b])), m = e; $ < h; ++$)if (m = y(w > 0 ? p[$] + " " + k : z(k, /&\f/g, p[$]))) f[d++] = m;
    return J(e, r, a, s === 0 ? c : i, f, o, l);
}
function ue(e, r, a) {
    return J(e, r, a, n, k(L()), A(e, 2, -2), 0);
}
function ie(e, r, a, n) {
    return J(e, r, a, s, A(e, 0, n), A(e, n + 1, -1), n);
}
function fe(n, c, s) {
    switch(x(n, c)){
        case 5103:
            return a + "print-" + n + n;
        case 5737:
        case 4201:
        case 3177:
        case 3433:
        case 1641:
        case 4457:
        case 2921:
        case 5572:
        case 6356:
        case 5844:
        case 3191:
        case 6645:
        case 3005:
        case 6391:
        case 5879:
        case 5623:
        case 6135:
        case 4599:
        case 4855:
        case 4215:
        case 6389:
        case 5109:
        case 5365:
        case 5621:
        case 3829:
            return a + n + n;
        case 4789:
            return r + n + n;
        case 5349:
        case 4246:
        case 4810:
        case 6968:
        case 2756:
            return a + n + r + n + e + n + n;
        case 5936:
            switch(O(n, c + 11)){
                case 114:
                    return a + n + e + z(n, /[svh]\w+-[tblr]{2}/, "tb") + n;
                case 108:
                    return a + n + e + z(n, /[svh]\w+-[tblr]{2}/, "tb-rl") + n;
                case 45:
                    return a + n + e + z(n, /[svh]\w+-[tblr]{2}/, "lr") + n;
            }
        case 6828:
        case 4268:
        case 2903:
            return a + n + e + n + n;
        case 6165:
            return a + n + e + "flex-" + n + n;
        case 5187:
            return a + n + z(n, /(\w+).+(:[^]+)/, a + "box-$1$2" + e + "flex-$1$2") + n;
        case 5443:
            return a + n + e + "flex-item-" + z(n, /flex-|-self/g, "") + (!j(n, /flex-|baseline/) ? e + "grid-row-" + z(n, /flex-|-self/g, "") : "") + n;
        case 4675:
            return a + n + e + "flex-line-pack" + z(n, /align-content|flex-|-self/g, "") + n;
        case 5548:
            return a + n + e + z(n, "shrink", "negative") + n;
        case 5292:
            return a + n + e + z(n, "basis", "preferred-size") + n;
        case 6060:
            return a + "box-" + z(n, "-grow", "") + a + n + e + z(n, "grow", "positive") + n;
        case 4554:
            return a + z(n, /([^-])(transform)/g, "$1" + a + "$2") + n;
        case 6187:
            return z(z(z(n, /(zoom-|grab)/, a + "$1"), /(image-set)/, a + "$1"), n, "") + n;
        case 5495:
        case 3959:
            return z(n, /(image-set\([^]*)/, a + "$1" + "$`$1");
        case 4968:
            return z(z(n, /(.+:)(flex-)?(.*)/, a + "box-pack:$3" + e + "flex-pack:$3"), /s.+-b[^;]+/, "justify") + a + n + n;
        case 4200:
            if (!j(n, /flex-|baseline/)) return e + "grid-column-align" + A(n, c) + n;
            break;
        case 2592:
        case 3360:
            return e + z(n, "template-", "") + n;
        case 4384:
        case 3616:
            if (s && s.some(function(e, r) {
                return c = r, j(e.props, /grid-\w+-end/);
            })) return ~C(n + (s = s[c].value), "span") ? n : e + z(n, "-start", "") + n + e + "grid-row-span:" + (~C(s, "span") ? j(s, /\d+/) : +j(s, /\d+/) - +j(n, /\d+/)) + ";";
            return e + z(n, "-start", "") + n;
        case 4896:
        case 4128:
            return s && s.some(function(e) {
                return j(e.props, /grid-\w+-start/);
            }) ? n : e + z(z(n, "-end", "-span"), "span ", "") + n;
        case 4095:
        case 3583:
        case 4068:
        case 2532:
            return z(n, /(.+)-inline(.+)/, a + "$1$2") + n;
        case 8116:
        case 7059:
        case 5753:
        case 5535:
        case 5445:
        case 5701:
        case 4933:
        case 4677:
        case 5533:
        case 5789:
        case 5021:
        case 4765:
            if (M(n) - 1 - c > 6) switch(O(n, c + 1)){
                case 109:
                    if (O(n, c + 4) !== 45) break;
                case 102:
                    return z(n, /(.+:)(.+)-([^]+)/, "$1" + a + "$2-$3" + "$1" + r + (O(n, c + 3) == 108 ? "$3" : "$2-$3")) + n;
                case 115:
                    return ~C(n, "stretch") ? fe(z(n, "stretch", "fill-available"), c, s) + n : n;
            }
            break;
        case 5152:
        case 5920:
            return z(n, /(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/, function(r, a, c, s, t, u, i) {
                return e + a + ":" + c + i + (s ? e + a + "-span:" + (t ? u : +u - +c) + i : "") + n;
            });
        case 4949:
            if (O(n, c + 6) === 121) return z(n, ":", ":" + a) + n;
            break;
        case 6444:
            switch(O(n, O(n, 14) === 45 ? 18 : 11)){
                case 120:
                    return z(n, /(.+:)([^;\s!]+)(;|(\s+)?!.+)?/, "$1" + a + (O(n, 14) === 45 ? "inline-" : "") + "box$3" + "$1" + a + "$2$3" + "$1" + e + "$2box$3") + n;
                case 100:
                    return z(n, ":", ":" + e) + n;
            }
            break;
        case 5719:
        case 2647:
        case 2135:
        case 3927:
        case 2391:
            return z(n, "scroll-", "scroll-snap-") + n;
    }
    return n;
}
function oe(e, r) {
    var a = "";
    var n = S(e);
    for(var c = 0; c < n; c++)a += r(e[c], c, e, r) || "";
    return a;
}
function le(e, r, a, t) {
    switch(e.type){
        case $:
            if (e.children.length) break;
        case i:
        case s:
            return e.return = e.return || e.value;
        case n:
            return "";
        case h:
            return e.return = e.value + "{" + oe(e.children, t) + "}";
        case c:
            e.value = e.props.join(",");
    }
    return M(a = oe(e.children, t)) ? e.return = e.value + "{" + a + "}" : "";
}
function ve(e) {
    var r = S(e);
    return function(a, n, c, s) {
        var t = "";
        for(var u = 0; u < r; u++)t += e[u](a, n, c, s) || "";
        return t;
    };
}
function pe(e) {
    return function(r) {
        if (!r.root) {
            if (r = r.return) e(r);
        }
    };
}
function he(n, t, u, i) {
    if (n.length > -1) {
        if (!n.return) switch(n.type){
            case s:
                n.return = fe(n.value, n.length, u);
                return;
            case h:
                return oe([
                    K(n, {
                        value: z(n.value, "@", "@" + a)
                    })
                ], i);
            case c:
                if (n.length) return B(n.props, function(c) {
                    switch(j(c, /(::plac\w+|:read-\w+)/)){
                        case ":read-only":
                        case ":read-write":
                            return oe([
                                K(n, {
                                    props: [
                                        z(c, /:(read-\w+)/, ":" + r + "$1")
                                    ]
                                })
                            ], i);
                        case "::placeholder":
                            return oe([
                                K(n, {
                                    props: [
                                        z(c, /:(plac\w+)/, ":" + a + "input-$1")
                                    ]
                                }),
                                K(n, {
                                    props: [
                                        z(c, /:(plac\w+)/, ":" + r + "$1")
                                    ]
                                }),
                                K(n, {
                                    props: [
                                        z(c, /:(plac\w+)/, e + "input-$1")
                                    ]
                                })
                            ], i);
                    }
                    return "";
                });
        }
    }
}
function be(e) {
    switch(e.type){
        case c:
            e.props = e.props.map(function(r) {
                return B(Y(r), function(r, a, n) {
                    switch(O(r, 0)){
                        case 12:
                            return A(r, 1, M(r));
                        case 0:
                        case 40:
                        case 43:
                        case 62:
                        case 126:
                            return r;
                        case 58:
                            if (n[++a] === "global") n[a] = "", n[++a] = "\f" + A(n[a], a = 1, -1);
                        case 32:
                            return a === 1 ? "" : r;
                        default:
                            switch(a){
                                case 0:
                                    e = r;
                                    return S(n) > 1 ? "" : r;
                                case a = S(n) - 1:
                                case 2:
                                    return a === 2 ? r + e + e : r + e;
                                default:
                                    return r;
                            }
                    }
                });
            });
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"grJxk":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "default", ()=>weakMemoize);
var weakMemoize = function weakMemoize(func) {
    var cache = new WeakMap();
    return function(arg) {
        if (cache.has(arg)) // Use non-null assertion because we just checked that the cache `has` it
        // This allows us to remove `undefined` from the return value
        return cache.get(arg);
        var ret = func(arg);
        cache.set(arg, ret);
        return ret;
    };
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"2vzJd":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "default", ()=>memoize);
function memoize(fn) {
    var cache = Object.create(null);
    return function(arg) {
        if (cache[arg] === undefined) cache[arg] = fn(arg);
        return cache[arg];
    };
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fTBFS":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "default", ()=>_extends);
function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
        for(var e = 1; e < arguments.length; e++){
            var t = arguments[e];
            for(var r in t)({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
        }
        return n;
    }, _extends.apply(null, arguments);
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4TRa1":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "default", ()=>hoistNonReactStatics);
var _hoistNonReactStatics = require("hoist-non-react-statics");
var _hoistNonReactStaticsDefault = parcelHelpers.interopDefault(_hoistNonReactStatics);
// this file isolates this package that is not tree-shakeable
// and if this module doesn't actually contain any logic of its own
// then Rollup just use 'hoist-non-react-statics' directly in other chunks
var hoistNonReactStatics = function(targetComponent, sourceComponent) {
    return (0, _hoistNonReactStaticsDefault.default)(targetComponent, sourceComponent);
};

},{"hoist-non-react-statics":"1GfsB","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1GfsB":[function(require,module,exports,__globalThis) {
'use strict';
var reactIs = require("c03b486d83967636");
/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */ var REACT_STATICS = {
    childContextTypes: true,
    contextType: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    getDerivedStateFromError: true,
    getDerivedStateFromProps: true,
    mixins: true,
    propTypes: true,
    type: true
};
var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    callee: true,
    arguments: true,
    arity: true
};
var FORWARD_REF_STATICS = {
    '$$typeof': true,
    render: true,
    defaultProps: true,
    displayName: true,
    propTypes: true
};
var MEMO_STATICS = {
    '$$typeof': true,
    compare: true,
    defaultProps: true,
    displayName: true,
    propTypes: true,
    type: true
};
var TYPE_STATICS = {};
TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;
function getStatics(component) {
    // React v16.11 and below
    if (reactIs.isMemo(component)) return MEMO_STATICS;
     // React v16.12 and above
    return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
}
var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = Object.prototype;
function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
    if (typeof sourceComponent !== 'string') {
        // don't hoist over string (html) components
        if (objectPrototype) {
            var inheritedComponent = getPrototypeOf(sourceComponent);
            if (inheritedComponent && inheritedComponent !== objectPrototype) hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
        }
        var keys = getOwnPropertyNames(sourceComponent);
        if (getOwnPropertySymbols) keys = keys.concat(getOwnPropertySymbols(sourceComponent));
        var targetStatics = getStatics(targetComponent);
        var sourceStatics = getStatics(sourceComponent);
        for(var i = 0; i < keys.length; ++i){
            var key = keys[i];
            if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
                var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
                try {
                    // Avoid failures from read-only properties
                    defineProperty(targetComponent, key, descriptor);
                } catch (e) {}
            }
        }
    }
    return targetComponent;
}
module.exports = hoistNonReactStatics;

},{"c03b486d83967636":"7EuwB"}],"7EuwB":[function(require,module,exports,__globalThis) {
'use strict';
module.exports = require("2255125a8e8b1051");

},{"2255125a8e8b1051":"5DsXl"}],"5DsXl":[function(require,module,exports,__globalThis) {
/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 'use strict';
(function() {
    'use strict';
    // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
    // nor polyfill, then a plain number is used for performance.
    var hasSymbol = typeof Symbol === 'function' && Symbol.for;
    var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
    var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
    var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
    var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
    var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
    var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
    var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
    // (unstable) APIs that have been removed. Can we remove the symbols?
    var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
    var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
    var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
    var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
    var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
    var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
    var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
    var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
    var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
    var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
    var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;
    function isValidElementType(type) {
        return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
        type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
    }
    function typeOf(object) {
        if (typeof object === 'object' && object !== null) {
            var $$typeof = object.$$typeof;
            switch($$typeof){
                case REACT_ELEMENT_TYPE:
                    var type = object.type;
                    switch(type){
                        case REACT_ASYNC_MODE_TYPE:
                        case REACT_CONCURRENT_MODE_TYPE:
                        case REACT_FRAGMENT_TYPE:
                        case REACT_PROFILER_TYPE:
                        case REACT_STRICT_MODE_TYPE:
                        case REACT_SUSPENSE_TYPE:
                            return type;
                        default:
                            var $$typeofType = type && type.$$typeof;
                            switch($$typeofType){
                                case REACT_CONTEXT_TYPE:
                                case REACT_FORWARD_REF_TYPE:
                                case REACT_LAZY_TYPE:
                                case REACT_MEMO_TYPE:
                                case REACT_PROVIDER_TYPE:
                                    return $$typeofType;
                                default:
                                    return $$typeof;
                            }
                    }
                case REACT_PORTAL_TYPE:
                    return $$typeof;
            }
        }
        return undefined;
    } // AsyncMode is deprecated along with isAsyncMode
    var AsyncMode = REACT_ASYNC_MODE_TYPE;
    var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
    var ContextConsumer = REACT_CONTEXT_TYPE;
    var ContextProvider = REACT_PROVIDER_TYPE;
    var Element = REACT_ELEMENT_TYPE;
    var ForwardRef = REACT_FORWARD_REF_TYPE;
    var Fragment = REACT_FRAGMENT_TYPE;
    var Lazy = REACT_LAZY_TYPE;
    var Memo = REACT_MEMO_TYPE;
    var Portal = REACT_PORTAL_TYPE;
    var Profiler = REACT_PROFILER_TYPE;
    var StrictMode = REACT_STRICT_MODE_TYPE;
    var Suspense = REACT_SUSPENSE_TYPE;
    var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated
    function isAsyncMode(object) {
        if (!hasWarnedAboutDeprecatedIsAsyncMode) {
            hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint
            console['warn']("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.");
        }
        return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
    }
    function isConcurrentMode(object) {
        return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
    }
    function isContextConsumer(object) {
        return typeOf(object) === REACT_CONTEXT_TYPE;
    }
    function isContextProvider(object) {
        return typeOf(object) === REACT_PROVIDER_TYPE;
    }
    function isElement(object) {
        return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function isForwardRef(object) {
        return typeOf(object) === REACT_FORWARD_REF_TYPE;
    }
    function isFragment(object) {
        return typeOf(object) === REACT_FRAGMENT_TYPE;
    }
    function isLazy(object) {
        return typeOf(object) === REACT_LAZY_TYPE;
    }
    function isMemo(object) {
        return typeOf(object) === REACT_MEMO_TYPE;
    }
    function isPortal(object) {
        return typeOf(object) === REACT_PORTAL_TYPE;
    }
    function isProfiler(object) {
        return typeOf(object) === REACT_PROFILER_TYPE;
    }
    function isStrictMode(object) {
        return typeOf(object) === REACT_STRICT_MODE_TYPE;
    }
    function isSuspense(object) {
        return typeOf(object) === REACT_SUSPENSE_TYPE;
    }
    exports.AsyncMode = AsyncMode;
    exports.ConcurrentMode = ConcurrentMode;
    exports.ContextConsumer = ContextConsumer;
    exports.ContextProvider = ContextProvider;
    exports.Element = Element;
    exports.ForwardRef = ForwardRef;
    exports.Fragment = Fragment;
    exports.Lazy = Lazy;
    exports.Memo = Memo;
    exports.Portal = Portal;
    exports.Profiler = Profiler;
    exports.StrictMode = StrictMode;
    exports.Suspense = Suspense;
    exports.isAsyncMode = isAsyncMode;
    exports.isConcurrentMode = isConcurrentMode;
    exports.isContextConsumer = isContextConsumer;
    exports.isContextProvider = isContextProvider;
    exports.isElement = isElement;
    exports.isForwardRef = isForwardRef;
    exports.isFragment = isFragment;
    exports.isLazy = isLazy;
    exports.isMemo = isMemo;
    exports.isPortal = isPortal;
    exports.isProfiler = isProfiler;
    exports.isStrictMode = isStrictMode;
    exports.isSuspense = isSuspense;
    exports.isValidElementType = isValidElementType;
    exports.typeOf = typeOf;
})();

},{}],"c0WGz":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getRegisteredStyles", ()=>getRegisteredStyles);
parcelHelpers.export(exports, "insertStyles", ()=>insertStyles);
parcelHelpers.export(exports, "registerStyles", ()=>registerStyles);
var isBrowser = typeof document !== 'undefined';
function getRegisteredStyles(registered, registeredStyles, classNames) {
    var rawClassName = '';
    classNames.split(' ').forEach(function(className) {
        if (registered[className] !== undefined) registeredStyles.push(registered[className] + ";");
        else if (className) rawClassName += className + " ";
    });
    return rawClassName;
}
var registerStyles = function registerStyles(cache, serialized, isStringTag) {
    var className = cache.key + "-" + serialized.name;
    if (// class name could be used further down
    // the tree but if it's a string tag, we know it won't
    // so we don't have to add it to registered cache.
    // this improves memory usage since we can avoid storing the whole style string
    (isStringTag === false || // we need to always store it if we're in compat mode and
    // in node since emotion-server relies on whether a style is in
    // the registered cache to know whether a style is global or not
    // also, note that this check will be dead code eliminated in the browser
    isBrowser === false && cache.compat !== undefined) && cache.registered[className] === undefined) cache.registered[className] = serialized.styles;
};
var insertStyles = function insertStyles(cache, serialized, isStringTag) {
    registerStyles(cache, serialized, isStringTag);
    var className = cache.key + "-" + serialized.name;
    if (cache.inserted[serialized.name] === undefined) {
        var stylesForSSR = '';
        var current = serialized;
        do {
            var maybeStyles = cache.insert(serialized === current ? "." + className : '', current, cache.sheet, true);
            if (!isBrowser && maybeStyles !== undefined) stylesForSSR += maybeStyles;
            current = current.next;
        }while (current !== undefined);
        if (!isBrowser && stylesForSSR.length !== 0) return stylesForSSR;
    }
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"ho3Gw":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "serializeStyles", ()=>serializeStyles);
var _hash = require("@emotion/hash");
var _hashDefault = parcelHelpers.interopDefault(_hash);
var _unitless = require("@emotion/unitless");
var _unitlessDefault = parcelHelpers.interopDefault(_unitless);
var _memoize = require("@emotion/memoize");
var _memoizeDefault = parcelHelpers.interopDefault(_memoize);
var isDevelopment = false;
var hyphenateRegex = /[A-Z]|^ms/g;
var animationRegex = /_EMO_([^_]+?)_([^]*?)_EMO_/g;
var isCustomProperty = function isCustomProperty(property) {
    return property.charCodeAt(1) === 45;
};
var isProcessableValue = function isProcessableValue(value) {
    return value != null && typeof value !== 'boolean';
};
var processStyleName = /* #__PURE__ */ (0, _memoizeDefault.default)(function(styleName) {
    return isCustomProperty(styleName) ? styleName : styleName.replace(hyphenateRegex, '-$&').toLowerCase();
});
var processStyleValue = function processStyleValue(key, value) {
    switch(key){
        case 'animation':
        case 'animationName':
            if (typeof value === 'string') return value.replace(animationRegex, function(match, p1, p2) {
                cursor = {
                    name: p1,
                    styles: p2,
                    next: cursor
                };
                return p1;
            });
    }
    if ((0, _unitlessDefault.default)[key] !== 1 && !isCustomProperty(key) && typeof value === 'number' && value !== 0) return value + 'px';
    return value;
};
var noComponentSelectorMessage = "Component selectors can only be used in conjunction with @emotion/babel-plugin, the swc Emotion plugin, or another Emotion-aware compiler transform.";
function handleInterpolation(mergedProps, registered, interpolation) {
    if (interpolation == null) return '';
    var componentSelector = interpolation;
    if (componentSelector.__emotion_styles !== undefined) return componentSelector;
    switch(typeof interpolation){
        case 'boolean':
            return '';
        case 'object':
            var keyframes = interpolation;
            if (keyframes.anim === 1) {
                cursor = {
                    name: keyframes.name,
                    styles: keyframes.styles,
                    next: cursor
                };
                return keyframes.name;
            }
            var serializedStyles = interpolation;
            if (serializedStyles.styles !== undefined) {
                var next = serializedStyles.next;
                if (next !== undefined) // not the most efficient thing ever but this is a pretty rare case
                // and there will be very few iterations of this generally
                while(next !== undefined){
                    cursor = {
                        name: next.name,
                        styles: next.styles,
                        next: cursor
                    };
                    next = next.next;
                }
                var styles = serializedStyles.styles + ";";
                return styles;
            }
            return createStringFromObject(mergedProps, registered, interpolation);
        case 'function':
            if (mergedProps !== undefined) {
                var previousCursor = cursor;
                var result = interpolation(mergedProps);
                cursor = previousCursor;
                return handleInterpolation(mergedProps, registered, result);
            }
            break;
    } // finalize string values (regular strings and functions interpolated into css calls)
    var asString = interpolation;
    if (registered == null) return asString;
    var cached = registered[asString];
    return cached !== undefined ? cached : asString;
}
function createStringFromObject(mergedProps, registered, obj) {
    var string = '';
    if (Array.isArray(obj)) for(var i = 0; i < obj.length; i++)string += handleInterpolation(mergedProps, registered, obj[i]) + ";";
    else for(var key in obj){
        var value = obj[key];
        if (typeof value !== 'object') {
            var asString = value;
            if (registered != null && registered[asString] !== undefined) string += key + "{" + registered[asString] + "}";
            else if (isProcessableValue(asString)) string += processStyleName(key) + ":" + processStyleValue(key, asString) + ";";
        } else {
            if (key === 'NO_COMPONENT_SELECTOR' && isDevelopment) throw new Error(noComponentSelectorMessage);
            if (Array.isArray(value) && typeof value[0] === 'string' && (registered == null || registered[value[0]] === undefined)) {
                for(var _i = 0; _i < value.length; _i++)if (isProcessableValue(value[_i])) string += processStyleName(key) + ":" + processStyleValue(key, value[_i]) + ";";
            } else {
                var interpolated = handleInterpolation(mergedProps, registered, value);
                switch(key){
                    case 'animation':
                    case 'animationName':
                        string += processStyleName(key) + ":" + interpolated + ";";
                        break;
                    default:
                        string += key + "{" + interpolated + "}";
                }
            }
        }
    }
    return string;
}
var labelPattern = /label:\s*([^\s;{]+)\s*(;|$)/g; // this is the cursor for keyframes
// keyframes are stored on the SerializedStyles object as a linked list
var cursor;
function serializeStyles(args, registered, mergedProps) {
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && args[0].styles !== undefined) return args[0];
    var stringMode = true;
    var styles = '';
    cursor = undefined;
    var strings = args[0];
    if (strings == null || strings.raw === undefined) {
        stringMode = false;
        styles += handleInterpolation(mergedProps, registered, strings);
    } else {
        var asTemplateStringsArr = strings;
        styles += asTemplateStringsArr[0];
    } // we start at 1 since we've already handled the first arg
    for(var i = 1; i < args.length; i++){
        styles += handleInterpolation(mergedProps, registered, args[i]);
        if (stringMode) {
            var templateStringsArr = strings;
            styles += templateStringsArr[i];
        }
    } // using a global regex with .exec is stateful so lastIndex has to be reset each time
    labelPattern.lastIndex = 0;
    var identifierName = '';
    var match; // https://esbench.com/bench/5b809c2cf2949800a0f61fb5
    while((match = labelPattern.exec(styles)) !== null)identifierName += '-' + match[1];
    var name = (0, _hashDefault.default)(styles) + identifierName;
    return {
        name: name,
        styles: styles,
        next: cursor
    };
}

},{"@emotion/hash":"clggK","@emotion/unitless":"2Tu84","@emotion/memoize":"2vzJd","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"clggK":[function(require,module,exports,__globalThis) {
/* eslint-disable */ // Inspired by https://github.com/garycourt/murmurhash-js
// Ported from https://github.com/aappleby/smhasher/blob/61a0530f28277f2e850bfc39600ce61d02b518de/src/MurmurHash2.cpp#L37-L86
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "default", ()=>murmur2);
function murmur2(str) {
    // 'm' and 'r' are mixing constants generated offline.
    // They're not really 'magic', they just happen to work well.
    // const m = 0x5bd1e995;
    // const r = 24;
    // Initialize the hash
    var h = 0; // Mix 4 bytes at a time into the hash
    var k, i = 0, len = str.length;
    for(; len >= 4; ++i, len -= 4){
        k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;
        k = /* Math.imul(k, m): */ (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16);
        k ^= /* k >>> r: */ k >>> 24;
        h = /* Math.imul(k, m): */ (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16) ^ /* Math.imul(h, m): */ (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
    } // Handle the last few bytes of the input array
    switch(len){
        case 3:
            h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
        case 2:
            h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
        case 1:
            h ^= str.charCodeAt(i) & 0xff;
            h = /* Math.imul(h, m): */ (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
    } // Do a few final mixes of the hash to ensure the last few
    // bytes are well-incorporated.
    h ^= h >>> 13;
    h = /* Math.imul(h, m): */ (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
    return ((h ^ h >>> 15) >>> 0).toString(36);
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"2Tu84":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "default", ()=>unitlessKeys);
var unitlessKeys = {
    animationIterationCount: 1,
    aspectRatio: 1,
    borderImageOutset: 1,
    borderImageSlice: 1,
    borderImageWidth: 1,
    boxFlex: 1,
    boxFlexGroup: 1,
    boxOrdinalGroup: 1,
    columnCount: 1,
    columns: 1,
    flex: 1,
    flexGrow: 1,
    flexPositive: 1,
    flexShrink: 1,
    flexNegative: 1,
    flexOrder: 1,
    gridRow: 1,
    gridRowEnd: 1,
    gridRowSpan: 1,
    gridRowStart: 1,
    gridColumn: 1,
    gridColumnEnd: 1,
    gridColumnSpan: 1,
    gridColumnStart: 1,
    msGridRow: 1,
    msGridRowSpan: 1,
    msGridColumn: 1,
    msGridColumnSpan: 1,
    fontWeight: 1,
    lineHeight: 1,
    opacity: 1,
    order: 1,
    orphans: 1,
    scale: 1,
    tabSize: 1,
    widows: 1,
    zIndex: 1,
    zoom: 1,
    WebkitLineClamp: 1,
    // SVG-related properties
    fillOpacity: 1,
    floodOpacity: 1,
    stopOpacity: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
    strokeMiterlimit: 1,
    strokeOpacity: 1,
    strokeWidth: 1
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"56SGE":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "useInsertionEffectAlwaysWithSyncFallback", ()=>useInsertionEffectAlwaysWithSyncFallback);
parcelHelpers.export(exports, "useInsertionEffectWithLayoutFallback", ()=>useInsertionEffectWithLayoutFallback);
var _react = require("react");
var isBrowser = typeof document !== 'undefined';
var syncFallback = function syncFallback(create) {
    return create();
};
var useInsertionEffect = _react["useInsertionEffect"] ? _react["useInsertionEffect"] : false;
var useInsertionEffectAlwaysWithSyncFallback = !isBrowser ? syncFallback : useInsertionEffect || syncFallback;
var useInsertionEffectWithLayoutFallback = useInsertionEffect || _react.useLayoutEffect;

},{"react":"f39IF","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"97Rpq":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getIndicatorSizeAndOffset", ()=>getIndicatorSizeAndOffset);
var _attributes = require("../../utils/attributes");
var _findClosestScrollContainer = require("../../utils/find-closest-scroll-container");
var _findElement = require("../../utils/find-element");
var _findPlaceholder = require("../../utils/find-placeholder");
var _getClosestPositionedElement = require("../../utils/get-closest-positioned-element");
var _getElementByDraggableLocation = require("../../utils/get-element-by-draggable-location");
var _gap = require("../gap");
var _constants = require("./constants");
/**
 * Returns the dimensions for a drop indicator either before or after a
 * draggable.
 *
 * `isForwardEdge` determines whether it is before or after.
 */ function measureDraggable(_ref) {
    var element = _ref.element, isForwardEdge = _ref.isForwardEdge, mode = _ref.mode, direction = _ref.direction, contextId = _ref.contextId;
    var _directionMapping$dir = (0, _constants.directionMapping)[direction], mainAxis = _directionMapping$dir.mainAxis, crossAxis = _directionMapping$dir.crossAxis;
    var offsetElement = (0, _getClosestPositionedElement.getClosestPositionedElement)({
        element: element,
        mode: mode
    });
    var gapOffset = (0, _gap.getGapOffset)({
        element: element,
        where: isForwardEdge ? 'after' : 'before',
        direction: direction,
        contextId: contextId
    });
    var baseOffset = offsetElement[mainAxis.offset] - (0, _constants.lineOffset);
    var mainAxisOffset = isForwardEdge ? baseOffset + element[mainAxis.length] : baseOffset;
    return {
        mainAxis: {
            offset: mainAxisOffset + gapOffset
        },
        crossAxis: {
            offset: offsetElement[crossAxis.offset],
            length: offsetElement[crossAxis.length]
        }
    };
}
/**
 * This will return an indicator size and offset corresponding to a line
 * through the middle of the placeholder.
 *
 * The reason this is a special case, instead of just falling back to the
 * standard positioning logic, is to avoid measuring the drag preview.
 */ function measurePlaceholder(_ref2) {
    var element = _ref2.element, direction = _ref2.direction;
    var _directionMapping$dir2 = (0, _constants.directionMapping)[direction], mainAxis = _directionMapping$dir2.mainAxis, crossAxis = _directionMapping$dir2.crossAxis;
    /**
   * This function measures against the `element` directly instead of an
   * `offsetElement` because:
   * - For standard lists, that is already the behavior.
   * - For virtual lists, we know that the `element` is being absolutely
   *   positioned (and not an ancestor).
   */ var baseOffset = element[mainAxis.offset] - (0, _constants.lineOffset);
    var mainAxisOffset = baseOffset + element[mainAxis.length] / 2;
    return {
        mainAxis: {
            offset: mainAxisOffset
        },
        crossAxis: {
            offset: element[crossAxis.offset],
            length: element[crossAxis.length]
        }
    };
}
function getDroppableOffset(_ref3) {
    var element = _ref3.element, direction = _ref3.direction;
    var mainAxis = (0, _constants.directionMapping)[direction].mainAxis;
    var scrollContainer = (0, _findClosestScrollContainer.findClosestScrollContainer)(element);
    if (!scrollContainer) return 0;
    /**
   * If the scroll container has static positioning,
   * then we need to add the scroll container's offset as well.
   */ var _getComputedStyle = getComputedStyle(scrollContainer), position = _getComputedStyle.position;
    if (position !== 'static') return 0;
    return scrollContainer[mainAxis.offset];
}
/**
 * Returns the dimensions for a drop indicator in an empty list.
 */ function measureDroppable(_ref4) {
    var droppableId = _ref4.droppableId, direction = _ref4.direction;
    var element = (0, _findElement.getElement)({
        attribute: (0, _attributes.attributes).droppable.id,
        value: droppableId
    });
    var mainAxisOffset = getDroppableOffset({
        element: element,
        direction: direction
    });
    return {
        mainAxis: {
            offset: mainAxisOffset
        },
        crossAxis: {
            offset: 0,
            length: '100%'
        }
    };
}
function getIndicatorSizeAndOffset(_ref5) {
    var targetLocation = _ref5.targetLocation, isInHomeLocation = _ref5.isInHomeLocation, direction = _ref5.direction, mode = _ref5.mode, contextId = _ref5.contextId;
    if (isInHomeLocation) {
        /**
     * If we are in the home location (source === destination) then the
     * indicator is centered in the placeholder.
     *
     * It isn't visible, but is used to scroll to.
     *
     * This is a special case, because the standard logic will not work
     * correctly when measuring the drag preview,
     * which occurs when in the home location.
     *
     * This is because the drag preview:
     *
     * 1. Has `position: fixed; top: 0; left: 0;` so its `offsetTop` and `offsetLeft`
     *    will always be `0`, which result in the indicator being at the start of the list.
     * 2. Is in the wrong location anyway.
     *
     * `measurePlaceholder()` is specifically designed for this case.
     */ var _element = (0, _findPlaceholder.findPlaceholder)(contextId);
        if (!_element) return null;
        return measurePlaceholder({
            element: _element,
            direction: direction
        });
    }
    if (targetLocation.index === 0) {
        /**
     * If the target is the 0th index, there are two situations:
     *
     * 1. Targeting an empty list
     * 2. Targeting before the first item in the list
     */ var _element2 = (0, _getElementByDraggableLocation.getElementByDraggableLocation)(contextId, targetLocation);
        if (!_element2) /**
       * If there's no element in the location, it is because the list is empty.
       * In this case, we measure the droppable itself to draw the indicator.
       */ return measureDroppable({
            droppableId: targetLocation.droppableId,
            direction: direction
        });
        /**
     * Otherwise, there is a reference element we can use to measure.
     */ return measureDraggable({
            element: _element2,
            // `false` because the line is before the item
            isForwardEdge: false,
            mode: mode,
            direction: direction,
            contextId: contextId
        });
    }
    /**
   * Otherwise, for any other index, we can measure the draggable above where
   * we would be dropping.
   */ var element = (0, _getElementByDraggableLocation.getElementByDraggableLocation)(contextId, {
        droppableId: targetLocation.droppableId,
        // subtracting one because it is the draggable above
        index: targetLocation.index - 1
    });
    if (!element) return null;
    return measureDraggable({
        element: element,
        // `true` because the line is after the item
        isForwardEdge: true,
        mode: mode,
        direction: direction,
        contextId: contextId
    });
}

},{"../../utils/attributes":"ckBmU","../../utils/find-closest-scroll-container":"dEXoH","../../utils/find-element":"jmXiO","../../utils/find-placeholder":"9KplE","../../utils/get-closest-positioned-element":"5yfbQ","../../utils/get-element-by-draggable-location":"gbjba","../gap":"827GA","./constants":"1iZVB","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"827GA":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * ASSUMPTIONS:
 * - Adjacent `<Draggable>` items are visually adjacent.
 * - If there is an adjacent element, it is rendered.
 */ parcelHelpers.export(exports, "calculateGap", ()=>calculateGap);
parcelHelpers.export(exports, "getGapOffset", ()=>getGapOffset);
var _rbdInvariant = require("../../drag-drop-context/rbd-invariant");
var _attributes = require("../../utils/attributes");
var _getElementByDraggableLocation = require("../../utils/get-element-by-draggable-location");
var _getDistance = require("./get-distance");
function getDroppableId(element) {
    return (0, _attributes.getAttribute)(element, (0, _attributes.customAttributes).draggable.droppableId);
}
function getIndex(element) {
    var value = (0, _attributes.getAttribute)(element, (0, _attributes.customAttributes).draggable.index);
    var index = parseInt(value);
    (0, _rbdInvariant.rbdInvariant)(Number.isInteger(index), "invalid index: '".concat(index, "' is not an integer"));
    return index;
}
function calculateGap(_ref) {
    var element = _ref.element, where = _ref.where, direction = _ref.direction, contextId = _ref.contextId;
    var droppableId = getDroppableId(element);
    var index = getIndex(element);
    var indexBefore = index - 1;
    var indexAfter = index + 1;
    var isBefore = where === 'before';
    var adjacentElement = (0, _getElementByDraggableLocation.getElementByDraggableLocation)(contextId, {
        droppableId: droppableId,
        index: isBefore ? indexBefore : indexAfter
    });
    if (adjacentElement === null) {
        /**
     * If there is no adjacent element, we can guess based on margins.
     */ var _getComputedStyle = getComputedStyle(element), marginTop = _getComputedStyle.marginTop, marginRight = _getComputedStyle.marginRight, marginBottom = _getComputedStyle.marginBottom, marginLeft = _getComputedStyle.marginLeft;
        if (direction === 'horizontal') return parseFloat(marginLeft) + parseFloat(marginRight);
        return parseFloat(marginTop) + parseFloat(marginBottom);
    }
    var distance = (0, _getDistance.getDistance)({
        direction: direction,
        a: element.getBoundingClientRect(),
        b: adjacentElement.getBoundingClientRect()
    });
    return distance;
}
function getGapOffset(_ref2) {
    var element = _ref2.element, where = _ref2.where, direction = _ref2.direction, contextId = _ref2.contextId;
    var gap = calculateGap({
        element: element,
        where: where,
        direction: direction,
        contextId: contextId
    });
    if (where === 'before') return -gap / 2;
    return gap / 2;
}

},{"../../drag-drop-context/rbd-invariant":"gHZ28","../../utils/attributes":"ckBmU","../../utils/get-element-by-draggable-location":"gbjba","./get-distance":"fGwtc","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fGwtc":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Computes the distance between two `DOMRect` instances.
 *
 * This is the shortest distance from the end of one to the start of the next.
 */ parcelHelpers.export(exports, "getDistance", ()=>getDistance);
var directionMapping = {
    horizontal: {
        rect: {
            start: 'left',
            end: 'right'
        }
    },
    vertical: {
        rect: {
            start: 'top',
            end: 'bottom'
        }
    }
};
function getDistance(_ref) {
    var a = _ref.a, b = _ref.b, direction = _ref.direction;
    var rect = directionMapping[direction].rect;
    return Math.max(a[rect.start], b[rect.start]) - Math.min(a[rect.end], b[rect.end]);
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"bP1CL":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "idleState", ()=>idleState);
parcelHelpers.export(exports, "reducer", ()=>reducer);
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _definePropertyDefault = parcelHelpers.interopDefault(_defineProperty);
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            (0, _definePropertyDefault.default)(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
var idleState = {
    draggingFromThisWith: null,
    draggingOverWith: null,
    isDraggingOver: false
};
function reducer(state, action) {
    if (action.type === 'DRAG_START') {
        var _action$payload = action.payload, droppableId = _action$payload.droppableId, start = _action$payload.start;
        var draggableId = start.draggableId, source = start.source;
        var isDraggingOver = source.droppableId === droppableId;
        var draggingOverWith = isDraggingOver ? draggableId : null;
        var isDraggingFrom = source.droppableId === droppableId;
        var draggingFromThisWith = isDraggingFrom ? draggableId : null;
        return _objectSpread(_objectSpread({}, state), {}, {
            isDraggingOver: isDraggingOver,
            draggingFromThisWith: draggingFromThisWith,
            draggingOverWith: draggingOverWith
        });
    }
    if (action.type === 'DRAG_UPDATE') {
        var _action$payload2 = action.payload, _droppableId = _action$payload2.droppableId, update = _action$payload2.update;
        var _update$destination = update.destination, destination = _update$destination === void 0 ? null : _update$destination, _draggableId = update.draggableId, _source = update.source;
        var _isDraggingOver = (destination === null || destination === void 0 ? void 0 : destination.droppableId) === _droppableId;
        var _draggingOverWith = _isDraggingOver ? _draggableId : null;
        var _isDraggingFrom = _source.droppableId === _droppableId;
        var _draggingFromThisWith = _isDraggingFrom ? _draggableId : null;
        return _objectSpread(_objectSpread({}, state), {}, {
            isDraggingOver: _isDraggingOver,
            draggingFromThisWith: _draggingFromThisWith,
            draggingOverWith: _draggingOverWith
        });
    }
    if (action.type === 'DRAG_CLEAR') return idleState;
    return state;
}

},{"@babel/runtime/helpers/defineProperty":"4x6r7","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"2qoru":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * The virtual placeholder exists specifically for virtual lists,
 * to ensure that the injected placeholder is correctly positioned.
 *
 * Standard placeholders are rendered as siblings, and do not need explicit
 * positioning.
 *
 * Because virtual placeholders are injected through a portal, they need to be
 * absolutely positioned so that they cover the gap left by the dragging item.
 *
 * This placeholder is important because it acts as the drop target for the
 * dragging item.
 */ parcelHelpers.export(exports, "VirtualPlaceholder", ()=>VirtualPlaceholder);
var _react = require("react");
var _reactDefault = parcelHelpers.interopDefault(_react);
var _internalContext = require("../drag-drop-context/internal-context");
var _rbdInvariant = require("../drag-drop-context/rbd-invariant");
var _data = require("../draggable/data");
var _placeholder = require("../draggable/placeholder");
var _useDropTargetForDraggable = require("../hooks/use-drop-target-for-draggable");
function VirtualPlaceholder(_ref) {
    var draggableId = _ref.draggableId, droppableId = _ref.droppableId, type = _ref.type, direction = _ref.direction, isDropDisabled = _ref.isDropDisabled;
    var ref = (0, _react.useRef)(null);
    var _useDragDropContext = (0, _internalContext.useDragDropContext)(), contextId = _useDragDropContext.contextId, getDragState = _useDragDropContext.getDragState;
    var dragState = getDragState();
    (0, _rbdInvariant.rbdInvariant)(dragState.isDragging, 'The virtual placeholder should only be rendered during a drag');
    var getIndex = (0, _react.useCallback)(function() {
        return dragState.sourceLocation.index;
    }, [
        dragState.sourceLocation.index
    ]);
    var data = (0, _data.useDraggableData)({
        draggableId: draggableId,
        droppableId: droppableId,
        getIndex: getIndex,
        contextId: contextId,
        type: type
    });
    /**
   * This sets up the drop target for the dragging item.
   */ (0, _useDropTargetForDraggable.useDropTargetForDraggable)({
        elementRef: ref,
        data: data,
        direction: direction,
        contextId: contextId,
        isDropDisabled: isDropDisabled,
        type: type
    });
    var style = (0, _react.useMemo)(function() {
        return {
            position: 'absolute',
            top: dragState.draggableInitialOffsetInSourceDroppable.top,
            left: dragState.draggableInitialOffsetInSourceDroppable.left,
            margin: 0
        };
    }, [
        dragState.draggableInitialOffsetInSourceDroppable.left,
        dragState.draggableInitialOffsetInSourceDroppable.top
    ]);
    // eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
    return /*#__PURE__*/ (0, _reactDefault.default).createElement((0, _placeholder.Placeholder), {
        ref: ref,
        style: style
    });
}

},{"react":"f39IF","../drag-drop-context/internal-context":"8SB2G","../drag-drop-context/rbd-invariant":"gHZ28","../draggable/data":"6qWMC","../draggable/placeholder":"30Upc","../hooks/use-drop-target-for-draggable":"eTJ7k","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"lhUj1":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const DragHandleIcon = (props)=>/*#__PURE__*/ React.createElement("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 16 16",
        fill: "currentColor",
        xmlns: "http://www.w3.org/2000/svg",
        style: {
            verticalAlign: "middle"
        },
        ...props,
        __source: {
            fileName: "src/components/icons/DragHandleIcon.jsx",
            lineNumber: 2,
            columnNumber: 3
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("circle", {
        cx: "4",
        cy: "3",
        r: "1.5",
        __source: {
            fileName: "src/components/icons/DragHandleIcon.jsx",
            lineNumber: 11,
            columnNumber: 5
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("circle", {
        cx: "8",
        cy: "3",
        r: "1.5",
        __source: {
            fileName: "src/components/icons/DragHandleIcon.jsx",
            lineNumber: 12,
            columnNumber: 5
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("circle", {
        cx: "4",
        cy: "8",
        r: "1.5",
        __source: {
            fileName: "src/components/icons/DragHandleIcon.jsx",
            lineNumber: 13,
            columnNumber: 5
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("circle", {
        cx: "8",
        cy: "8",
        r: "1.5",
        __source: {
            fileName: "src/components/icons/DragHandleIcon.jsx",
            lineNumber: 14,
            columnNumber: 5
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("circle", {
        cx: "4",
        cy: "13",
        r: "1.5",
        __source: {
            fileName: "src/components/icons/DragHandleIcon.jsx",
            lineNumber: 15,
            columnNumber: 5
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("circle", {
        cx: "8",
        cy: "13",
        r: "1.5",
        __source: {
            fileName: "src/components/icons/DragHandleIcon.jsx",
            lineNumber: 16,
            columnNumber: 5
        },
        __self: undefined
    }));
exports.default = DragHandleIcon;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"8A2rp":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const { useState, useEffect, useCallback, useMemo } = wp.element;
const { SelectControl, Spinner } = wp.components;
const DefaultStatusSelector = ({ statuses, onDefaultChange })=>{
    const [defaultStatus, setDefaultStatus] = useState("");
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const fetchOption = useCallback(()=>{
        setIsFetching(true);
        wp.apiFetch({
            path: "/alpaca/v1/options/default_status"
        }).then((option)=>{
            const value = option.value ? option.value.toString() : "";
            setDefaultStatus(value);
            // Notify parent of the initial value
            if (onDefaultChange) onDefaultChange(value);
        }).catch((err)=>{
            console.error("Error fetching data:", err);
            setError("Could not load default status settings.");
        }).finally(()=>{
            setIsFetching(false);
        });
    }, []);
    useEffect(()=>{
        fetchOption();
    }, [
        fetchOption
    ]);
    const handleStatusChange = (newValue)=>{
        setIsSaving(true);
        setDefaultStatus(newValue);
        // Notify parent of the change
        if (onDefaultChange) onDefaultChange(newValue);
        wp.apiFetch({
            path: "/alpaca/v1/options/default_status",
            method: "POST",
            data: {
                value: newValue
            }
        }).catch((err)=>{
            console.error("Error saving default status:", err);
            alert("Error saving setting: " + err.message);
            fetchOption(); // Revert on error
        }).finally(()=>{
            setIsSaving(false);
        });
    };
    // Memoize status options to ensure they update when statuses order changes
    const statusOptions = useMemo(()=>[
            {
                label: "Select a default status...",
                value: ""
            },
            ...statuses.map((status)=>({
                    label: status.name,
                    value: status.term_id.toString()
                }))
        ], [
        statuses
    ]);
    if (error) return /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 74,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 75,
            columnNumber: 9
        },
        __self: undefined
    }, "Default Status for New Issues"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 76,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        className: "alpaca-error",
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 77,
            columnNumber: 11
        },
        __self: undefined
    }, error)));
    return /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 84,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 85,
            columnNumber: 7
        },
        __self: undefined
    }, "Default Status for New Issues"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 86,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(SelectControl, {
        label: "Default Status",
        hideLabelFromVision: true,
        value: defaultStatus,
        options: statusOptions,
        onChange: handleStatusChange,
        disabled: isSaving || isFetching,
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 87,
            columnNumber: 9
        },
        __self: undefined
    }), (isFetching || isSaving) && /*#__PURE__*/ React.createElement(Spinner, {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 95,
            columnNumber: 38
        },
        __self: undefined
    })));
};
exports.default = DefaultStatusSelector;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"7kyCE":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const { useState, useEffect, useCallback } = wp.element;
const { CheckboxControl, Spinner } = wp.components;
const EnableTestLogsControl = ()=>{
    const [isEnabled, setIsEnabled] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const fetchOption = useCallback(()=>{
        setIsFetching(true);
        wp.apiFetch({
            path: "/wp/v2/settings"
        }).then((settings)=>{
            setIsEnabled(settings.alpaca_enable_test_logs === "1");
        }).finally(()=>setIsFetching(false));
    }, []);
    useEffect(()=>{
        fetchOption();
    }, [
        fetchOption
    ]);
    const handleChange = (value)=>{
        setIsSaving(true);
        setIsEnabled(value);
        wp.apiFetch({
            path: "/wp/v2/settings",
            method: "POST",
            data: {
                alpaca_enable_test_logs: value ? "1" : "0"
            }
        }).then(()=>{
            wp.hooks.doAction("alpaca.enableTestLogsChanged", value);
        }).finally(()=>setIsSaving(false));
    };
    return /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/EnableTestLogsControl.jsx",
            lineNumber: 37,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        __source: {
            fileName: "src/components/EnableTestLogsControl.jsx",
            lineNumber: 38,
            columnNumber: 7
        },
        __self: undefined
    }, "Debugging"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/EnableTestLogsControl.jsx",
            lineNumber: 39,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(CheckboxControl, {
        label: "Enable Browser Console Messages",
        checked: isEnabled,
        onChange: handleChange,
        disabled: isFetching || isSaving,
        __source: {
            fileName: "src/components/EnableTestLogsControl.jsx",
            lineNumber: 40,
            columnNumber: 9
        },
        __self: undefined
    }), (isFetching || isSaving) && /*#__PURE__*/ React.createElement(Spinner, {
        __source: {
            fileName: "src/components/EnableTestLogsControl.jsx",
            lineNumber: 46,
            columnNumber: 38
        },
        __self: undefined
    })));
};
exports.default = EnableTestLogsControl;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"WrED9":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "WatchlistContext", ()=>WatchlistContext);
parcelHelpers.export(exports, "WatchlistProvider", ()=>WatchlistProvider);
parcelHelpers.export(exports, "useWatchlist", ()=>useWatchlist);
const { createContext, useState, useEffect, useContext, useCallback } = wp.element;
const WatchlistContext = createContext();
const WatchlistProvider = ({ children })=>{
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchWatchlist = useCallback(async ()=>{
        try {
            const response = await wp.apiFetch({
                path: "/alpaca/v1/watchlist"
            });
            if (response.success && Array.isArray(response.watchlist)) setWatchlist(response.watchlist);
        } catch (error) {
            console.error("Error fetching watchlist:", error);
        } finally{
            setLoading(false);
        }
    }, []);
    useEffect(()=>{
        fetchWatchlist();
    }, [
        fetchWatchlist
    ]);
    const toggleWatch = useCallback(async (issueId)=>{
        const numericId = Number(issueId);
        const currentWatchlist = watchlist;
        // Optimistically update the UI
        const newWatchlist = currentWatchlist.includes(numericId) ? currentWatchlist.filter((id)=>id !== numericId) : [
            ...currentWatchlist,
            numericId
        ];
        setWatchlist(newWatchlist);
        // Then send the request to the server
        try {
            const response = await wp.apiFetch({
                path: "/alpaca/v1/watchlist",
                method: "POST",
                data: {
                    issue_id: numericId
                }
            });
            // If the server response is different, update the state again to ensure consistency
            if (response.success && Array.isArray(response.watchlist)) setWatchlist(response.watchlist);
        } catch (error) {
            console.error("Error updating watchlist:", error);
            // If the API call fails, revert the optimistic update
            setWatchlist(currentWatchlist);
        }
    }, [
        watchlist
    ]);
    const isWatched = (issueId)=>{
        return watchlist.includes(Number(issueId));
    };
    const value = {
        watchlist,
        loading,
        toggleWatch,
        isWatched
    };
    return /*#__PURE__*/ React.createElement(WatchlistContext.Provider, {
        value: value,
        __source: {
            fileName: "src/context/WatchlistContext.jsx",
            lineNumber: 66,
            columnNumber: 5
        },
        __self: undefined
    }, children);
};
const useWatchlist = ()=>{
    return useContext(WatchlistContext);
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"h1t0l":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "AlpacaBoard", ()=>(0, _boardFrame.AlpacaBoard));
parcelHelpers.export(exports, "AlpacaBoardControls", ()=>(0, _boardFrame.AlpacaBoardControls));
var _boardFrame = require("./components/BoardFrame");

},{"./components/BoardFrame":"5N5Bs","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"5N5Bs":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "AlpacaBoard", ()=>AlpacaBoard);
parcelHelpers.export(exports, "AlpacaBoardControls", ()=>AlpacaBoardControls);
var _boardMain = require("./BoardMain");
var _boardMainDefault = parcelHelpers.interopDefault(_boardMain);
var _cookies = require("../utils/cookies");
var _userApi = require("../services/userApi");
const { useState, useEffect, useRef, useCallback } = wp.element;
const { Popover, Button, ComboboxControl, MenuGroup, MenuItem } = wp.components;
function AlpacaBoard() {
    return /*#__PURE__*/ React.createElement((0, _boardMainDefault.default), {
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 8,
            columnNumber: 10
        },
        __self: this
    });
}
function AlpacaBoardControls() {
    const [allAssignees, setAllAssignees] = useState([]);
    const [filteredAssignee, setFilteredAssignee] = useState("");
    const [showStarredOnly, setShowStarredOnly] = useState(false);
    const [deadlineFilter, setDeadlineFilter] = useState("none");
    // --- Load assignee data on mount ---
    useEffect(()=>{
        // If window.alpacaAssignees is not available (meaning BoardMain is not present),
        // fetch assignees directly.
        if (typeof window.alpacaAssignees === 'undefined' || window.alpacaAssignees.length === 0) (0, _userApi.fetchAllAssignees)().then(setAllAssignees);
        else // Initial load from window.alpacaAssignees if available
        setAllAssignees(window.alpacaAssignees);
        const handleAssigneesUpdated = (assigneesArray)=>{
            if (assigneesArray && Array.isArray(assigneesArray)) setAllAssignees([
                ...assigneesArray
            ]);
        };
        wp.hooks.addAction("alpaca.allAssigneesUpdated", "alpaca/boardframe", handleAssigneesUpdated);
        return ()=>{
            wp.hooks.removeAction("alpaca.allAssigneesUpdated", "alpaca/boardframe");
        };
    }, []);
    // --- Unified filtering logic ---
    useEffect(()=>{
        const boardElement = document.querySelector("#alpaca-board");
        if (!boardElement) return;
        const items = boardElement.querySelectorAll(".alpaca-item");
        const deadlineConditions = {
            today: (d)=>d === 0,
            week: (d)=>d >= 0 && d <= 7,
            late: (d)=>d < 0
        };
        items.forEach((item)=>{
            let isVisible = true;
            // Assignee filter
            if (filteredAssignee) {
                const matchesByDataAssignee = item.hasAttribute(`data-assignee-${filteredAssignee}`);
                const matchesByList = (item.dataset.assignees || "").split(" ").includes(filteredAssignee);
                if (!matchesByDataAssignee && !matchesByList) isVisible = false;
            }
            // Starred filter
            if (showStarredOnly && !item.classList.contains("is-watched")) isVisible = false;
            // Deadline filter
            const diffDays = parseInt(item.dataset.diffDays, 10);
            const deadlineCheck = deadlineConditions[deadlineFilter];
            const matchesDeadline = !isNaN(diffDays) && deadlineCheck && deadlineCheck(diffDays);
            if (deadlineFilter !== "none" && !matchesDeadline) isVisible = false;
            // Apply filter result
            item.classList.toggle("is-filtered-out", !isVisible);
            // Highlight deadline matches
            item.classList.remove("item-highlight");
            if (isVisible && deadlineFilter !== "none" && matchesDeadline) item.classList.add("item-highlight");
        });
    }, [
        filteredAssignee,
        showStarredOnly,
        deadlineFilter
    ]);
    // --- Reset assignee filter if invalid ---
    useEffect(()=>{
        if (filteredAssignee && allAssignees.length > 0) {
            const isStillPresent = allAssignees.some((assignee)=>assignee.id.toString() === filteredAssignee);
            if (!isStillPresent) setFilteredAssignee("");
        }
    }, [
        allAssignees,
        filteredAssignee
    ]);
    // --- Build assignee options for combobox ---
    const assigneeOptions = (allAssignees || []).filter((assignee)=>assignee && assignee.id).map((assignee)=>({
            value: assignee.id.toString(),
            label: assignee.display_name || assignee.slug || "Unnamed"
        }));
    if (typeof alpacaUserData === "undefined" || !alpacaUserData.currentUserId) return null; // Don't render if we don't know the current user
    // --- Popover state ---
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const popoverAnchorRef = useRef();
    const popoverContentRef = useRef();
    const togglePopover = useCallback(()=>{
        setIsPopoverOpen((prev)=>!prev);
    }, []);
    const onClosePopover = ()=>{
        setIsPopoverOpen(false);
    };
    // --- Click outside detection for popover ---
    useEffect(()=>{
        const handleClickOutside = (event)=>{
            if (isPopoverOpen && popoverAnchorRef.current && !popoverAnchorRef.current.contains(event.target) && popoverContentRef.current && !popoverContentRef.current.contains(event.target)) onClosePopover();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return ()=>{
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [
        isPopoverOpen
    ]);
    // --- Handlers ---
    const handleShowStarredOnlyChange = ()=>{
        setShowStarredOnly(!showStarredOnly);
        setFilteredAssignee("");
        setDeadlineFilter("none");
    };
    const handleFilteredAssigneeChange = (value)=>{
        setFilteredAssignee(value);
        setShowStarredOnly(false);
        setDeadlineFilter("none");
    };
    const handleDeadlineFilterChange = (value)=>{
        setDeadlineFilter(value);
        setShowStarredOnly(false);
        setFilteredAssignee("");
    };
    // --- Render ---
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-board-controls",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 182,
            columnNumber: 5
        },
        __self: this
    }, /*#__PURE__*/ React.createElement(Button, {
        ref: popoverAnchorRef,
        onClick: togglePopover,
        isSecondary: true,
        label: "Open Filters",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 183,
            columnNumber: 7
        },
        __self: this
    }, "Open Filters"), isPopoverOpen && /*#__PURE__*/ React.createElement(Popover, {
        anchor: popoverAnchorRef.current,
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 192,
            columnNumber: 9
        },
        __self: this
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-control-popover",
        ref: popoverContentRef,
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 193,
            columnNumber: 11
        },
        __self: this
    }, /*#__PURE__*/ React.createElement(MenuGroup, {
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 194,
            columnNumber: 13
        },
        __self: this
    }, /*#__PURE__*/ React.createElement(MenuItem, {
        onClick: ()=>{
            setFilteredAssignee("");
            setShowStarredOnly(false);
            setDeadlineFilter("none");
        },
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 195,
            columnNumber: 15
        },
        __self: this
    }, "Show All Items"), /*#__PURE__*/ React.createElement(MenuItem, {
        onClick: handleShowStarredOnlyChange,
        icon: showStarredOnly ? "star-filled" : "star-empty",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 204,
            columnNumber: 15
        },
        __self: this
    }, "Starred Items")), /*#__PURE__*/ React.createElement(MenuGroup, {
        label: "Filter by Assignee",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 211,
            columnNumber: 13
        },
        __self: this
    }, /*#__PURE__*/ React.createElement(MenuItem, {
        onClick: ()=>handleFilteredAssigneeChange(alpacaUserData.currentUserId.toString()),
        icon: filteredAssignee === alpacaUserData.currentUserId.toString() ? "yes" : "",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 212,
            columnNumber: 15
        },
        __self: this
    }, "Assigned to me"), /*#__PURE__*/ React.createElement(ComboboxControl, {
        value: filteredAssignee,
        onChange: handleFilteredAssigneeChange,
        options: assigneeOptions,
        className: "alpaca-control",
        placeholder: "Search for a user",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 226,
            columnNumber: 15
        },
        __self: this
    })), /*#__PURE__*/ React.createElement(MenuGroup, {
        label: "Deadlines",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 234,
            columnNumber: 13
        },
        __self: this
    }, /*#__PURE__*/ React.createElement(MenuItem, {
        onClick: ()=>handleDeadlineFilterChange("today"),
        icon: deadlineFilter === "today" ? "yes" : "",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 235,
            columnNumber: 15
        },
        __self: this
    }, "Today"), /*#__PURE__*/ React.createElement(MenuItem, {
        onClick: ()=>handleDeadlineFilterChange("week"),
        icon: deadlineFilter === "week" ? "yes" : "",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 241,
            columnNumber: 15
        },
        __self: this
    }, "Next 7 days"), /*#__PURE__*/ React.createElement(MenuItem, {
        onClick: ()=>handleDeadlineFilterChange("late"),
        icon: deadlineFilter === "late" ? "yes" : "",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 247,
            columnNumber: 15
        },
        __self: this
    }, "Overdue")))));
}

},{"./BoardMain":"1nh76","../utils/cookies":"4qoXW","../services/userApi":"rt0I0","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1nh76":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _pragmaticDragAndDropReactBeautifulDndMigration = require("@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration");
var _issue = require("./issue");
var _issueDefault = parcelHelpers.interopDefault(_issue);
var _item = require("./Item");
var _itemDefault = parcelHelpers.interopDefault(_item);
var _container = require("./Container");
var _containerDefault = parcelHelpers.interopDefault(_container);
var _cookies = require("../utils/cookies");
var _data = require("../utils/data");
var _useUser = require("../hooks/useUser");
var _issueApi = require("../services/issueApi");
const { useState, useRef, useEffect, useCallback } = wp.element;
const { decodeEntities } = wp.htmlEntities;
/**
 * Main board component.
 */ function Board() {
    const [containers, setContainers] = useState(()=>{
        if (typeof alpacaBoardData !== "undefined") return (0, _data.transformDataForBoard)(alpacaBoardData);
        return [];
    });
    const [selectedItem, setSelectedItem] = useState(null);
    const triggerRef = useRef(null);
    const [needsSave, setNeedsSave] = useState(false);
    const [hiddenContainerIds, setHiddenContainerIds] = useState(()=>{
        const cookie = (0, _cookies.getCookie)("alpaca_hidden_containers");
        return cookie ? cookie.split(",").filter(Boolean) : [];
    });
    // Effect to update cookie when hiddenContainerIds changes
    useEffect(()=>{
        (0, _cookies.setCookie)("alpaca_hidden_containers", hiddenContainerIds.join(","), 365);
    }, [
        hiddenContainerIds
    ]);
    const handleToggleHidden = (containerId)=>{
        setHiddenContainerIds((prev)=>{
            const newIds = new Set(prev);
            if (newIds.has(containerId)) newIds.delete(containerId);
            else newIds.add(containerId);
            return Array.from(newIds);
        });
    };
    // 🔹 Handle renaming a container
    const handleRenameContainer = (containerId, newTitle)=>{
        const original = containers;
        const updated = containers.map((c)=>c.id === containerId ? {
                ...c,
                title: newTitle
            } : c);
        setContainers(updated);
        // Persist via REST API
        wp.apiFetch({
            path: `/alpaca/v1/status/${containerId}`,
            method: "POST",
            data: {
                name: newTitle
            }
        }).catch((err)=>{
            console.error("Error renaming container:", err);
            setContainers(original); // revert on failure
        });
    };
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
    async function handleDragEnd(result) {
        const { source, destination, draggableId } = result;
        if (!destination) {
            console.log("No destination, returning.");
            return;
        }
        const sourceContainer = findContainerById(source.droppableId);
        const destinationContainer = findContainerById(destination.droppableId);
        if (sourceContainer.id === destinationContainer.id) {
            const items = Array.from(sourceContainer.items);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);
            setContainers((prev)=>prev.map((c)=>c.id === sourceContainer.id ? {
                        ...c,
                        items: items
                    } : c));
        } else {
            const sourceItems = Array.from(sourceContainer.items);
            const destItems = Array.from(destinationContainer.items);
            const [movedItem] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, movedItem);
            setContainers((prev)=>prev.map((c)=>{
                    if (c.id === sourceContainer.id) return {
                        ...c,
                        items: sourceItems
                    };
                    else if (c.id === destinationContainer.id) return {
                        ...c,
                        items: destItems
                    };
                    else return c;
                }));
            wp.hooks.doAction("alpaca.statusChanged", movedItem, sourceContainer.title, destinationContainer.title);
        }
        (0, _data.saveBoardOrder)();
        const movedItemId = parseInt(draggableId, 10);
        const newStatusTermId = parseInt(destination.droppableId, 10);
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
        }).catch((err)=>{
            console.error("Error updating issue:", err);
        });
    }
    const handleItemClick = (event, itemId)=>{
        triggerRef.current = event.currentTarget;
        event.currentTarget.blur();
        const item = getItemById(itemId);
        setSelectedItem(item);
    };
    const handleCommentCountChange = useCallback((issueId, newCount)=>{
        setContainers((prevContainers)=>prevContainers.map((container)=>{
                const itemIndex = container.items.findIndex((item)=>item.id === issueId.toString());
                if (itemIndex === -1) return container;
                const newItems = [
                    ...container.items
                ];
                newItems[itemIndex] = {
                    ...newItems[itemIndex],
                    comment_count: newCount
                };
                return {
                    ...container,
                    items: newItems
                };
            }));
    }, []);
    useEffect(()=>{
        const handleCommentCountChanged = (data)=>{
            const { issueId, newCount } = data;
            handleCommentCountChange(issueId, newCount);
        };
        wp.hooks.addAction("alpaca.commentCountChanged", "alpaca/boardmain", handleCommentCountChanged);
        return ()=>{
            wp.hooks.removeAction("alpaca.commentCountChanged", "alpaca/boardmain");
        };
    }, [
        handleCommentCountChange
    ]);
    const moveAllItemsToNextContainer = (sourceContainerId)=>{
        const containersCopy = containers.map((c)=>({
                ...c,
                items: [
                    ...c.items
                ]
            }));
        const sourceIndex = containersCopy.findIndex((c)=>c.id === sourceContainerId);
        if (sourceIndex === -1 || sourceIndex >= containersCopy.length - 1) return;
        const sourceContainer = containersCopy[sourceIndex];
        const nextContainer = containersCopy[sourceIndex + 1];
        const itemsToMove = [
            ...sourceContainer.items
        ];
        if (itemsToMove.length === 0) return;
        sourceContainer.items = [];
        nextContainer.items.push(...itemsToMove);
        itemsToMove.forEach((item)=>{
            wp.hooks.doAction("alpaca.statusChanged", item, sourceContainer.title, nextContainer.title);
            wp.apiFetch({
                path: `/issue/v1/update/${item.id}`,
                method: "POST",
                data: {
                    taxonomies: {
                        status: [
                            parseInt(nextContainer.id, 10)
                        ]
                    }
                }
            }).catch((err)=>console.error(`Error updating issue ${item.id}:`, err));
        });
        setContainers(containersCopy);
        setNeedsSave(true);
    };
    const handleDeleteAll = (containerId)=>{
        const originalContainers = containers;
        const containerToDeleteFrom = containers.find((c)=>c.id === containerId);
        if (!containerToDeleteFrom) {
            console.warn(`Container with ID ${containerId} not found.`);
            return;
        }
        const itemsToDelete = containerToDeleteFrom.items.map((item)=>item.id);
        // Optimistically update UI
        setContainers((prevContainers)=>prevContainers.map((c)=>c.id === containerId ? {
                    ...c,
                    items: []
                } : c));
        // API call to delete all issues in the container
        Promise.all(itemsToDelete.map((issueId)=>wp.apiFetch({
                path: `/issue/v1/delete/${issueId}`,
                method: "DELETE"
            }))).catch((err)=>{
            console.error(`Error deleting issues from container ${containerId}:`, err);
            setContainers(originalContainers); // Revert UI on error
        });
    };
    const handleAssigneesChange = async (issueId, newAssignees)=>{
        const enrichedAssignees = await Promise.all(newAssignees.map(async (assignee)=>{
            if (assignee && assignee.id && !assignee.display_name) try {
                const fullUser = await (0, _useUser.getUser)(assignee.id);
                return {
                    ...assignee,
                    display_name: fullUser.name,
                    slug: fullUser.slug
                };
            } catch (error) {
                console.error(`Error fetching user data for ID ${assignee.id}:`, error);
                return assignee;
            }
            return assignee;
        }));
        setContainers((prevContainers)=>prevContainers.map((container)=>{
                const itemIndex = container.items.findIndex((item)=>item.id === issueId.toString());
                if (itemIndex === -1) return container;
                const newItems = [
                    ...container.items
                ];
                newItems[itemIndex] = {
                    ...newItems[itemIndex],
                    assignees: enrichedAssignees
                };
                return {
                    ...container,
                    items: newItems
                };
            }));
        wp.hooks.doAction("alpaca.issueAssigneesChanged", issueId, enrichedAssignees);
    };
    const handleDeadlineChange = useCallback((issueId, newDeadline)=>{
        setContainers((prevContainers)=>prevContainers.map((container)=>{
                const itemIndex = container.items.findIndex((item)=>item.id === issueId.toString());
                if (itemIndex === -1) return container;
                const newItems = [
                    ...container.items
                ];
                newItems[itemIndex] = {
                    ...newItems[itemIndex],
                    meta: {
                        ...newItems[itemIndex].meta,
                        deadline: newDeadline ? [
                            newDeadline
                        ] : null
                    }
                };
                return {
                    ...container,
                    items: newItems
                };
            }));
    }, []);
    const handleStatusChange = useCallback((issueId, newStatusTerm)=>{
        setContainers((prevContainers)=>{
            const newContainers = prevContainers.map((container)=>({
                    ...container,
                    items: [
                        ...container.items
                    ]
                }));
            let movedItem = null;
            let oldContainerId = null;
            // Find the item and remove it from its current container
            for (const container of newContainers){
                const itemIndex = container.items.findIndex((item)=>item.id === issueId.toString());
                if (itemIndex !== -1) {
                    movedItem = container.items.splice(itemIndex, 1)[0];
                    oldContainerId = container.id;
                    break;
                }
            }
            if (movedItem) {
                // Update the item's status taxonomy
                movedItem.taxonomies = {
                    ...movedItem.taxonomies,
                    status: [
                        newStatusTerm
                    ]
                };
                // Add the item to the new container
                const targetContainer = newContainers.find((container)=>container.id === newStatusTerm.term_id.toString());
                if (targetContainer) {
                    targetContainer.items.push(movedItem);
                    const sourceContainer = prevContainers.find((c)=>c.id === oldContainerId);
                    if (sourceContainer) wp.hooks.doAction("alpaca.statusChanged", movedItem, sourceContainer.title, targetContainer.title);
                }
            }
            return newContainers;
        });
        setNeedsSave(true);
    }, []);
    const handleIssueTitleChange = useCallback((issueId, newTitle)=>{
        setContainers((prevContainers)=>prevContainers.map((container)=>{
                const itemIndex = container.items.findIndex((item)=>item.id === issueId.toString());
                if (itemIndex === -1) return container;
                const newItems = [
                    ...container.items
                ];
                newItems[itemIndex] = {
                    ...newItems[itemIndex],
                    content: newTitle
                };
                return {
                    ...container,
                    items: newItems
                };
            }));
    }, []);
    const closeModal = ()=>{
        setSelectedItem(null);
    };
    const handleDeleteIssue = (issueId)=>{
        // Optimistically remove the issue from the UI
        const originalContainers = containers;
        const newContainers = containers.map((c)=>({
                ...c,
                items: c.items.filter((item)=>item.id !== issueId.toString())
            }));
        setContainers(newContainers);
        closeModal();
        wp.apiFetch({
            path: `/issue/v1/delete/${issueId}`,
            method: "DELETE"
        }).then(()=>{
            wp.hooks.doAction("alpaca.issueDeleted", issueId);
        }).catch((err)=>{
            // Revert if the delete fails
            console.error("Error deleting issue:", err);
            setContainers(originalContainers);
        });
    };
    useEffect(()=>{
        if (!selectedItem && triggerRef.current) triggerRef.current.focus();
    }, [
        selectedItem
    ]);
    useEffect(()=>{
        if (needsSave) {
            (0, _data.saveBoardOrder)();
            setNeedsSave(false);
        }
    }, [
        needsSave,
        containers
    ]);
    useEffect(()=>{
        const handleIssueSubmitted = (issue, statusId)=>{
            if (!issue || !statusId) return;
            setContainers((prevContainers)=>{
                const newContainers = [
                    ...prevContainers
                ];
                const targetContainer = newContainers.find((c)=>c.id === statusId.toString());
                if (targetContainer) targetContainer.items.unshift({
                    id: issue.id.toString(),
                    content: decodeEntities(issue.title),
                    author_name: issue.author_name,
                    author_img: issue.author_img,
                    assignees: [],
                    comment_count: issue.comment_count ?? 0
                });
                return newContainers;
            });
            setNeedsSave(true);
        };
        wp.hooks.addAction("alpaca.issueSubmitted", "alpaca/boardmain", handleIssueSubmitted);
        return ()=>{
            wp.hooks.removeAction("alpaca.issueSubmitted", "alpaca/boardmain");
        };
    }, []);
    useEffect(()=>{
        const allAssignees = new Map();
        containers.forEach((container)=>{
            container.items.forEach((item)=>{
                if (item.assignees && Array.isArray(item.assignees)) item.assignees.forEach((assignee)=>{
                    if (assignee && assignee.id) {
                        const assigneeId = assignee.id.toString();
                        const existing = allAssignees.get(assigneeId);
                        if (!existing || !existing.display_name && assignee.display_name) allAssignees.set(assigneeId, assignee);
                    }
                });
            });
        });
        const assigneesArray = Array.from(allAssignees.values());
        wp.hooks.doAction("alpaca.allAssigneesUpdated", assigneesArray);
    }, [
        containers
    ]);
    return /*#__PURE__*/ React.createElement((0, _pragmaticDragAndDropReactBeautifulDndMigration.DragDropContext), {
        onDragEnd: handleDragEnd,
        __source: {
            fileName: "src/components/BoardMain.jsx",
            lineNumber: 535,
            columnNumber: 5
        },
        __self: this
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-wrap",
        __source: {
            fileName: "src/components/BoardMain.jsx",
            lineNumber: 536,
            columnNumber: 7
        },
        __self: this
    }, containers.map((container, index)=>/*#__PURE__*/ React.createElement((0, _containerDefault.default), {
            key: container.id,
            id: container.id,
            title: container.title,
            items: container.items,
            onItemClick: handleItemClick,
            onMoveAllToNext: moveAllItemsToNextContainer,
            isLastContainer: index === containers.length - 1,
            isHidden: hiddenContainerIds.includes(container.id),
            onToggleHidden: handleToggleHidden,
            onRename: handleRenameContainer,
            onDeleteAll: handleDeleteAll,
            __source: {
                fileName: "src/components/BoardMain.jsx",
                lineNumber: 538,
                columnNumber: 11
            },
            __self: this
        }))), /*#__PURE__*/ React.createElement((0, _issueDefault.default), {
        issueId: selectedItem?.id,
        isOpen: !!selectedItem,
        onClose: closeModal,
        onDelete: handleDeleteIssue,
        triggerRef: triggerRef,
        onAssigneesChange: handleAssigneesChange,
        onDeadlineChange: handleDeadlineChange,
        onStatusChange: handleStatusChange,
        onIssueTitleChange: handleIssueTitleChange,
        __source: {
            fileName: "src/components/BoardMain.jsx",
            lineNumber: 554,
            columnNumber: 7
        },
        __self: this
    }));
}
exports.default = Board;

},{"@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration":"iD7mF","./issue":"l6q71","./Item":"2yEr4","./Container":"QNfzH","../utils/cookies":"4qoXW","../utils/data":"j8lWA","../hooks/useUser":"7ZWZh","../services/issueApi":"bebt9","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"l6q71":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _commentingJsx = require("./commenting.jsx");
var _commentingJsxDefault = parcelHelpers.interopDefault(_commentingJsx);
var _checklistJsx = require("./issue/checklist.jsx");
var _checklistJsxDefault = parcelHelpers.interopDefault(_checklistJsx);
var _commentsJs = require("../utils/comments.js");
var _tabsConfig = require("../utils/tabsConfig");
var _useIssueData = require("../hooks/useIssueData");
var _useIssueDataDefault = parcelHelpers.interopDefault(_useIssueData);
var _useUserManagement = require("../hooks/useUserManagement");
var _useUserManagementDefault = parcelHelpers.interopDefault(_useUserManagement);
var _useLoadingStates = require("../hooks/useLoadingStates");
var _useLoadingStatesDefault = parcelHelpers.interopDefault(_useLoadingStates);
var _assigneeUtils = require("../utils/assigneeUtils");
var _checklistUtils = require("../utils/checklistUtils");
var _issueApi = require("../services/issueApi");
var _assigneeSelector = require("./issue/AssigneeSelector");
var _assigneeSelectorDefault = parcelHelpers.interopDefault(_assigneeSelector);
var _deadlineControl = require("./issue/DeadlineControl");
var _deadlineControlDefault = parcelHelpers.interopDefault(_deadlineControl);
var _jsonTable = require("./issue/JsonTable");
var _jsonTableDefault = parcelHelpers.interopDefault(_jsonTable);
var _reportTab = require("./issue/ReportTab");
var _reportTabDefault = parcelHelpers.interopDefault(_reportTab);
var _tabContent = require("./issue/TabContent");
var _tabContentDefault = parcelHelpers.interopDefault(_tabContent);
var _lightbox = require("./issue/Lightbox");
var _lightboxDefault = parcelHelpers.interopDefault(_lightbox);
const { useState, useEffect, useRef, useMemo, useCallback } = wp.element;
const { useDebounce } = wp.compose;
const { Modal, TabPanel, Button, Tooltip } = wp.components;
const { decodeEntities } = wp.htmlEntities;
const { date } = wp;
const datesettings = wp.date.getSettings();
// Custom hooks
// Memoized components
const AlpacaIssue = ({ issueId, isOpen, onClose, onDelete, triggerRef, onAssigneesChange, onDeadlineChange, createIssueComment, generateAssigneeChangeComment, onStatusChange, onIssueTitleChange })=>{
    const { issueDetails, setIssueDetails, isLoadingDetails, error, refetchData } = (0, _useIssueDataDefault.default)(issueId, isOpen);
    const { allUsers, allUserObjects, userMap } = (0, _useUserManagementDefault.default)();
    const { loadingStates, setLoading } = (0, _useLoadingStatesDefault.default)();
    const [assignees, setAssignees] = useState([]);
    const [commentRefreshKey, setCommentRefreshKey] = useState(0);
    const [deadline, setDeadline] = useState(null);
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const [checklistItems, setChecklistItems] = useState([]);
    const [allStatuses, setAllStatuses] = useState([]);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const titleInputRef = useRef(null);
    const [notificationMessage, setNotificationMessage] = useState(null);
    const showNotification = (message, type = "error")=>{
        setNotificationMessage({
            message,
            type
        });
        setTimeout(()=>setNotificationMessage(null), 5000); // Clear after 5 seconds
    };
    useEffect(()=>{
        (0, _issueApi.fetchStatuses)().then(setAllStatuses).catch((err)=>{
            console.error("Error fetching statuses:", err);
            showNotification("Failed to load statuses.", "error");
        });
    }, []);
    useEffect(()=>{
        if (isEditingTitle && titleInputRef.current) titleInputRef.current.focus();
    }, [
        isEditingTitle
    ]);
    // Memoized values
    const assigneeObjects = useMemo(()=>allUserObjects.filter((u)=>assignees.includes(u.name) || assignees.includes(u.slug)), [
        allUserObjects,
        assignees
    ]);
    const tabsConfig = (0, _tabsConfig.getTabsConfig)(issueDetails);
    // Debounced API calls
    const updateAssignees = useCallback(async (issueId, slugs, newAssignees, added, removed)=>{
        // Added added, removed
        await (0, _issueApi.updateIssue)(issueId, {
            taxonomies: {
                assignee: slugs
            }
        }).then(()=>{
            if (typeof onAssigneesChange === "function") {
                const assigneeObjects = allUserObjects.filter((u)=>newAssignees.includes(u.name) || newAssignees.includes(u.slug));
                onAssigneesChange(issueId, assigneeObjects);
            }
            refetchData();
            // Moved from handleAssigneeChange
            added.forEach((assignee)=>{
                const user = allUserObjects.find((u)=>u.name === assignee);
                wp.hooks.doAction("alpaca.assigneeChanged", issueDetails, user, true);
            });
            removed.forEach((assignee)=>{
                const user = allUserObjects.find((u)=>u.name === assignee);
                wp.hooks.doAction("alpaca.assigneeChanged", issueDetails, user, false);
            });
        }).catch((error)=>{
            console.error("updateAssignees: updateIssue failed:", error);
            showNotification("Failed to update assignees.", "error");
        }).finally(()=>setLoading("assignees", false));
    }, [
        onAssigneesChange,
        refetchData,
        setLoading,
        allUserObjects,
        issueDetails
    ] // Added issueDetails
    );
    const updateDeadline = useCallback(async (issueId, newDate)=>{
        setLoading("deadline", true);
        try {
            await (0, _issueApi.updateIssue)(issueId, {
                meta: {
                    deadline: newDate
                }
            });
            if (typeof onDeadlineChange === "function") onDeadlineChange(issueId, newDate);
        } catch (error) {
            console.error("Failed to update deadline:", error);
            showNotification("Failed to update deadline.", "error");
        } finally{
            setLoading("deadline", false);
        }
    }, [
        onDeadlineChange,
        setLoading,
        showNotification
    ]);
    // Process issue details when they change
    useEffect(()=>{
        if (issueDetails && issueDetails.success && allUserObjects.length > 0) {
            setDeadline(issueDetails.meta.deadline || null);
            // Handle checklist
            if (issueDetails.meta.checklist) {
                const parsedChecklist = (0, _checklistUtils.parseChecklist)(issueDetails.meta.checklist);
                if (Array.isArray(parsedChecklist)) setChecklistItems(parsedChecklist);
            } else setChecklistItems([]);
            // Handle assignees
            if (issueDetails.taxonomies && issueDetails.taxonomies.assignee && Array.isArray(issueDetails.taxonomies.assignee)) {
                const assigneeNames = issueDetails.taxonomies.assignee.map((t)=>{
                    const userObject = allUserObjects.find((user)=>user.slug === t.slug);
                    return userObject ? userObject.name : t.name;
                });
                setAssignees(assigneeNames);
            } else setAssignees([]);
        }
    }, [
        issueDetails,
        allUserObjects
    ]);
    // Event handlers
    const handleAssigneeChange = useCallback(async (newAssignees)=>{
        const oldAssignees = [
            ...assignees
        ];
        const { added, removed } = (0, _assigneeUtils.processAssigneeChanges)(oldAssignees, newAssignees);
        setAssignees(newAssignees);
        const slugs = newAssignees.map((a)=>userMap[a] || a);
        setLoading("assignees", true);
        updateAssignees(issueId, slugs, newAssignees, added, removed); // Added added, removed
    }, [
        assignees,
        allUserObjects,
        issueDetails,
        issueId,
        userMap,
        updateAssignees,
        setLoading
    ]);
    const handleDeadlineChange = useCallback((newDate)=>{
        setDeadline(newDate);
        updateDeadline(issueId, newDate);
    }, [
        issueId,
        updateDeadline
    ]);
    const handleDeadlineClear = useCallback(()=>{
        setDeadline(null);
        setLoading("deadline", true);
        (0, _issueApi.updateIssue)(issueId, {
            meta: {
                deadline: ""
            }
        }).then(()=>{
            if (typeof onDeadlineChange === "function") onDeadlineChange(issueId, null);
        }).finally(()=>setLoading("deadline", false));
    }, [
        issueId,
        onDeadlineChange,
        setLoading
    ]);
    const handleScreenshotDelete = useCallback(()=>{
        setLoading("screenshot", true);
        (0, _issueApi.updateIssue)(issueId, {
            meta: {
                screenshot: ""
            }
        }).then(()=>{
            setIssueDetails((prev)=>({
                    ...prev,
                    meta: {
                        ...prev.meta,
                        screenshot: ""
                    }
                }));
        }).finally(()=>setLoading("screenshot", false));
    }, [
        issueId,
        setIssueDetails,
        setLoading
    ]);
    const handleLightboxClose = useCallback(()=>{
        setLightboxSrc(null);
    }, []);
    const handleProgressIssue = useCallback(async ()=>{
        if (!issueDetails || !allStatuses.length) return;
        const currentStatusTerm = issueDetails.taxonomies?.status?.[0];
        if (!currentStatusTerm) return;
        const currentIndex = allStatuses.findIndex((s)=>s.term_id === currentStatusTerm.term_id);
        if (currentIndex === -1 || currentIndex === allStatuses.length - 1) // Already the last status or not found
        return;
        const nextStatus = allStatuses[currentIndex + 1];
        setLoading("status", true);
        try {
            await (0, _issueApi.updateIssue)(issueId, {
                taxonomies: {
                    status: [
                        nextStatus.term_id
                    ]
                }
            });
            // Update local state to reflect the change
            setIssueDetails((prev)=>({
                    ...prev,
                    taxonomies: {
                        ...prev.taxonomies,
                        status: [
                            nextStatus
                        ]
                    }
                }));
            // Notify parent component about the status change
            if (typeof onStatusChange === "function") onStatusChange(issueId, nextStatus);
        } catch (error) {
            showNotification("Failed to progress issue status.", "error");
        } finally{
            setLoading("status", false);
        }
    }, [
        issueDetails,
        allStatuses,
        issueId,
        setIssueDetails,
        setLoading
    ]);
    const handleTitleSave = useCallback(async ()=>{
        if (editedTitle === decodeEntities(issueDetails.post_data.post_content)) {
            setIsEditingTitle(false);
            return;
        }
        setLoading("title", true);
        try {
            await (0, _issueApi.updateIssue)(issueId, {
                content: editedTitle,
                title: editedTitle
            });
            setIssueDetails((prev)=>({
                    ...prev,
                    post_data: {
                        ...prev.post_data,
                        post_content: editedTitle,
                        post_title: editedTitle
                    }
                }));
            if (typeof onIssueTitleChange === "function") onIssueTitleChange(issueId, editedTitle);
        } catch (error) {
            showNotification("Failed to update issue title.", "error");
        } finally{
            setLoading("title", false);
            setIsEditingTitle(false);
        }
    }, [
        editedTitle,
        issueDetails,
        issueId,
        setIssueDetails,
        setLoading,
        onIssueTitleChange
    ]);
    const currentStatus = issueDetails?.taxonomies?.status?.[0];
    const isLastStatus = useMemo(()=>{
        if (!currentStatus || !allStatuses.length) return true;
        const currentIndex = allStatuses.findIndex((s)=>s.term_id === currentStatus.term_id);
        return currentIndex === allStatuses.length - 1;
    }, [
        currentStatus,
        allStatuses
    ]);
    if (!isOpen) return null;
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(Modal, {
        size: "large",
        onRequestClose: onClose,
        className: "alpaca-details-modal",
        headerActions: /*#__PURE__*/ React.createElement(React.Fragment, null, !isLastStatus && /*#__PURE__*/ React.createElement(Tooltip, {
            text: "Progress issue to next status",
            __source: {
                fileName: "src/components/issue.jsx",
                lineNumber: 373,
                columnNumber: 15
            }
        }, /*#__PURE__*/ React.createElement(Button, {
            type: "button",
            className: "components-button has-icon",
            onClick: handleProgressIssue,
            disabled: loadingStates.status,
            __source: {
                fileName: "src/components/issue.jsx",
                lineNumber: 374,
                columnNumber: 17
            }
        }, /*#__PURE__*/ React.createElement("span", {
            className: "dashicons dashicons-arrow-right-alt",
            __source: {
                fileName: "src/components/issue.jsx",
                lineNumber: 380,
                columnNumber: 19
            }
        }))), /*#__PURE__*/ React.createElement(Tooltip, {
            text: "Trash issue",
            __source: {
                fileName: "src/components/issue.jsx",
                lineNumber: 384,
                columnNumber: 13
            }
        }, /*#__PURE__*/ React.createElement(Button, {
            type: "button",
            className: "alpaca-modal-delete-button components-button has-icon",
            isDestructive: true,
            onClick: ()=>{
                if (window.confirm("Are you sure you want to trash this issue?")) onDelete(issueId);
            },
            __source: {
                fileName: "src/components/issue.jsx",
                lineNumber: 385,
                columnNumber: 15
            }
        }, /*#__PURE__*/ React.createElement("span", {
            className: "dashicons dashicons-trash",
            __source: {
                fileName: "src/components/issue.jsx",
                lineNumber: 397,
                columnNumber: 17
            }
        })))),
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 366,
            columnNumber: 7
        },
        __self: undefined
    }, error && /*#__PURE__*/ React.createElement("div", {
        className: "notice notice-error",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 404,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 405,
            columnNumber: 13
        },
        __self: undefined
    }, error), /*#__PURE__*/ React.createElement(Button, {
        onClick: refetchData,
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 406,
            columnNumber: 13
        },
        __self: undefined
    }, "Retry")), notificationMessage && /*#__PURE__*/ React.createElement("div", {
        className: `notice notice-${notificationMessage.type}`,
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 411,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 412,
            columnNumber: 13
        },
        __self: undefined
    }, notificationMessage.message)), isLoadingDetails ? /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 417,
            columnNumber: 11
        },
        __self: undefined
    }, "Loading...") : issueDetails && issueDetails.success ? /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-details",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 419,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-main column",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 420,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-slug",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 421,
            columnNumber: 15
        },
        __self: undefined
    }, issueDetails.post_data.post_name), isEditingTitle ? /*#__PURE__*/ React.createElement("input", {
        type: "text",
        className: "alpaca-issue-title-input",
        value: editedTitle,
        onChange: (e)=>setEditedTitle(e.target.value),
        onBlur: handleTitleSave,
        onKeyDown: (e)=>{
            if (e.key === "Enter") handleTitleSave();
        },
        disabled: loadingStates.title,
        ref: titleInputRef,
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 425,
            columnNumber: 17
        },
        __self: undefined
    }) : /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-title-wrapper",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 440,
            columnNumber: 17
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("h3", {
        className: "alpaca-issue-title",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 441,
            columnNumber: 19
        },
        __self: undefined
    }, decodeEntities(issueDetails.post_data.post_content)), /*#__PURE__*/ React.createElement(Tooltip, {
        text: "Edit title",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 444,
            columnNumber: 19
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        className: "alpaca-edit-title-button",
        icon: "edit",
        onClick: ()=>{
            setIsEditingTitle(true);
            setEditedTitle(decodeEntities(issueDetails.post_data.post_content));
        },
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 445,
            columnNumber: 21
        },
        __self: undefined
    }))), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-main-controls",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 458,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _assigneeSelectorDefault.default), {
        assignees: assignees,
        allUsers: allUsers,
        onChange: handleAssigneeChange,
        isLoading: loadingStates.assignees,
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 459,
            columnNumber: 17
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement((0, _deadlineControlDefault.default), {
        deadline: deadline,
        onChange: handleDeadlineChange,
        onClear: handleDeadlineClear,
        isLoading: loadingStates.deadline,
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 466,
            columnNumber: 17
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement((0, _checklistJsxDefault.default), {
        issueId: issueId,
        initialChecklistItems: checklistItems,
        isSaving: loadingStates.assignees || loadingStates.deadline,
        setIsSaving: (value)=>setLoading("checklist", value),
        setCommentRefreshKey: setCommentRefreshKey,
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 474,
            columnNumber: 15
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(TabPanel, {
        className: "alpaca-issue-tabs",
        initialTabName: "comments",
        tabs: tabsConfig,
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 482,
            columnNumber: 15
        },
        __self: undefined
    }, (tab)=>/*#__PURE__*/ React.createElement((0, _tabContentDefault.default), {
            tab: tab,
            issueDetails: issueDetails,
            issueId: issueId,
            commentRefreshKey: commentRefreshKey,
            onScreenshotDelete: handleScreenshotDelete,
            loadingStates: loadingStates,
            onScreenshotClick: setLightboxSrc,
            __source: {
                fileName: "src/components/issue.jsx",
                lineNumber: 488,
                columnNumber: 19
            },
            __self: undefined
        })))) : /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 502,
            columnNumber: 11
        },
        __self: undefined
    }, issueDetails?.message || "Could not load issue details.")), lightboxSrc && /*#__PURE__*/ React.createElement((0, _lightboxDefault.default), {
        src: lightboxSrc,
        onClose: handleLightboxClose,
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 507,
            columnNumber: 9
        },
        __self: undefined
    }));
};
exports.default = AlpacaIssue;

},{"./commenting.jsx":"321JG","./issue/checklist.jsx":"iTYG6","../utils/comments.js":"hPhNI","../utils/tabsConfig":"kaOzJ","../hooks/useIssueData":"5IBQX","../hooks/useUserManagement":"7BGvE","../hooks/useLoadingStates":"haQEY","../utils/assigneeUtils":"9o8NF","../utils/checklistUtils":"h8W9N","../services/issueApi":"bebt9","./issue/AssigneeSelector":"lBLYZ","./issue/DeadlineControl":"63IRX","./issue/JsonTable":"jh4NY","./issue/ReportTab":"f6zxb","./issue/TabContent":"14ymM","./issue/Lightbox":"krnYi","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"321JG":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _useUser = require("../hooks/useUser");
var _issueApi = require("../services/issueApi");
var _user = require("./User");
var _userDefault = parcelHelpers.interopDefault(_user);
var _marked = require("marked");
const { useState, useEffect, useRef, useCallback } = wp.element;
const { TextareaControl, Button, Spinner, Modal } = wp.components;
const Commenting = ({ issueId, commentRefreshKey })=>{
    const [comments, setComments] = useState([]);
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const editingRef = useRef(null);
    const [deleteCommentId, setDeleteCommentId] = useState(null); // New state for modal
    useEffect(()=>{
        (0, _useUser.getUser)().then((user)=>{
            setCurrentUser(user);
        });
    }, []);
    const fetchComments = useCallback(()=>{
        if (!issueId) return;
        setIsLoadingComments(true);
        setError(null);
        wp.apiFetch({
            path: `/wp/v2/comments?post=${issueId}&per_page=-1&orderby=date&order=desc&comment_type=issuecomment&show_hidden_comments=1&context=edit`
        }).then((fetchedComments)=>{
            setComments(fetchedComments);
        }).catch((err)=>{
            console.error("Error fetching comments:", err);
            setError("Could not load comments.");
        }).finally(()=>setIsLoadingComments(false));
    }, [
        issueId
    ]);
    useEffect(()=>{
        fetchComments();
    }, [
        fetchComments,
        commentRefreshKey
    ]);
    useEffect(()=>{
        const handleCommentCountChanged = (data)=>{
            const { issueId: eventIssueId } = data;
            if (eventIssueId.toString() === issueId.toString()) fetchComments();
        };
        wp.hooks.addAction("alpaca.commentCountChanged", "alpaca/commenting", handleCommentCountChanged);
        return ()=>{
            wp.hooks.removeAction("alpaca.commentCountChanged", "alpaca/commenting");
        };
    }, [
        issueId,
        fetchComments
    ]);
    useEffect(()=>{
        if (editingRef.current) editingRef.current.focus();
    }, [
        editingCommentId
    ]);
    const stripHtml = (html)=>{
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    };
    const handleCommentSubmit = ()=>{
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        wp.apiFetch({
            path: `/wp/v2/comments`,
            method: "POST",
            data: {
                content: newComment,
                post: issueId,
                comment_type: "issuecomment",
                status: "approve"
            }
        }).then((newlyCreatedComment)=>{
            setNewComment("");
            fetchComments();
            wp.hooks.doAction("alpaca.commentPosted", newlyCreatedComment); // New doAction
            // Dispatch event to update comment count
            const postId = newlyCreatedComment.post;
            (0, _issueApi.fetchIssueCommentCount)(postId).then((response)=>{
                if (response && typeof response.comment_count !== "undefined") wp.hooks.doAction("alpaca.commentCountChanged", {
                    issueId: postId.toString(),
                    newCount: response.comment_count
                });
            }).catch((err)=>{
                console.error("Error fetching updated comment count after adding:", err);
            });
        }).catch((err)=>{
            console.error(err);
            alert(`Failed to submit comment: ${err.message || "Unknown error"}`);
        }).finally(()=>setIsSubmitting(false));
    };
    const startEditing = (comment)=>{
        setEditingCommentId(comment.id);
        setEditingContent(comment.content.raw || stripHtml(comment.content.rendered));
    };
    const cancelEditing = ()=>{
        setEditingCommentId(null);
        setEditingContent("");
    };
    const saveEdit = (commentId)=>{
        if (!editingContent.trim()) return;
        setIsSubmitting(true);
        wp.apiFetch({
            path: `/wp/v2/comments/${commentId}`,
            method: "POST",
            data: {
                content: editingContent
            }
        }).then((updatedComment)=>{
            // Add updatedComment parameter
            setEditingCommentId(null);
            setEditingContent("");
            fetchComments();
            wp.hooks.doAction("alpaca.commentUpdated", updatedComment); // New doAction
        }).catch((err)=>{
            console.error(err);
            alert(`Failed to update comment: ${err.message || "Unknown error"}`);
        }).finally(()=>setIsSubmitting(false));
    };
    const confirmDeleteComment = (commentId)=>{
        setDeleteCommentId(commentId);
    };
    const cancelDelete = ()=>setDeleteCommentId(null);
    const deleteComment = ()=>{
        if (!deleteCommentId) return;
        wp.apiFetch({
            path: `/wp/v2/comments/${deleteCommentId}`,
            method: "DELETE",
            data: {
                force: true
            }
        }).then((deletedComment)=>{
            fetchComments();
            setDeleteCommentId(null);
            wp.hooks.doAction("alpaca.commentDeleted", deletedComment); // New doAction
            // Dispatch event to update comment count
            // The deletedComment object contains the post ID
            const postId = deletedComment.previous.post;
            (0, _issueApi.fetchIssueCommentCount)(postId).then((response)=>{
                if (response && typeof response.comment_count !== "undefined") wp.hooks.doAction("alpaca.commentCountChanged", {
                    issueId: postId.toString(),
                    newCount: response.comment_count
                });
            }).catch((err)=>{
                console.error("Error fetching updated comment count:", err);
            });
        }).catch((err)=>{
            console.error(err);
            alert(`Failed to delete comment: ${err.message || "Unknown error"}`);
        });
    };
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("div", {
        id: "alpaca-comments",
        className: "alpaca-comments-timeline",
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 204,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-timeline-item",
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 205,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-timeline-marker",
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 206,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _userDefault.default), {
        user: currentUser,
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 207,
            columnNumber: 13
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment-form",
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 210,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(TextareaControl, {
        placeholder: "Add a comment...",
        value: newComment,
        onChange: setNewComment,
        disabled: isSubmitting,
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 211,
            columnNumber: 13
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        onClick: handleCommentSubmit,
        disabled: isSubmitting,
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 217,
            columnNumber: 13
        },
        __self: undefined
    }, isSubmitting ? "Submitting..." : "Submit Comment"))), isLoadingComments && /*#__PURE__*/ React.createElement(Spinner, {
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 227,
            columnNumber: 31
        },
        __self: undefined
    }), error && /*#__PURE__*/ React.createElement("p", {
        className: "alpaca-error",
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 228,
            columnNumber: 19
        },
        __self: undefined
    }, error), !isLoadingComments && !error && comments.length === 0 && /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 230,
            columnNumber: 11
        },
        __self: undefined
    }, "No comments yet."), !isLoadingComments && comments.map((comment)=>/*#__PURE__*/ React.createElement("div", {
            className: "alpaca-timeline-item",
            key: comment.id,
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 235,
                columnNumber: 13
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("div", {
            className: "alpaca-timeline-marker",
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 236,
                columnNumber: 15
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement((0, _userDefault.default), {
            user: {
                ...comment.author_meta,
                name: comment.author_name,
                avatar: comment.author_avatar_urls[96]
            },
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 237,
                columnNumber: 17
            },
            __self: undefined
        })), /*#__PURE__*/ React.createElement("div", {
            className: "alpaca-timeline-content",
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 245,
                columnNumber: 15
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("div", {
            className: "alpaca-comment-header",
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 246,
                columnNumber: 17
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("div", {
            className: "alpaca-comment-date",
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 247,
                columnNumber: 19
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("small", {
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 248,
                columnNumber: 21
            },
            __self: undefined
        }, new Date(comment.date).toLocaleString())), /*#__PURE__*/ React.createElement("div", {
            className: "alpaca-comment-buttons",
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 250,
                columnNumber: 19
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement(Button, {
            label: "Edit",
            showTooltip: "true",
            icon: "edit",
            onClick: ()=>{
                startEditing(comment);
            },
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 251,
                columnNumber: 21
            },
            __self: undefined
        }), /*#__PURE__*/ React.createElement(Button, {
            icon: "trash",
            label: "Delete",
            showTooltip: "true",
            className: "button-link-delete",
            onClick: ()=>{
                confirmDeleteComment(comment.id);
            },
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 259,
                columnNumber: 21
            },
            __self: undefined
        }))), /*#__PURE__*/ React.createElement("div", {
            className: "alpaca-comment-body",
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 270,
                columnNumber: 17
            },
            __self: undefined
        }, editingCommentId === comment.id ? /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(TextareaControl, {
            value: editingContent,
            onChange: setEditingContent,
            ref: editingRef,
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 273,
                columnNumber: 23
            },
            __self: undefined
        }), /*#__PURE__*/ React.createElement(Button, {
            isPrimary: true,
            onClick: ()=>saveEdit(comment.id),
            disabled: isSubmitting,
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 278,
                columnNumber: 23
            },
            __self: undefined
        }, "Save"), /*#__PURE__*/ React.createElement(Button, {
            onClick: cancelEditing,
            disabled: isSubmitting,
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 285,
                columnNumber: 23
            },
            __self: undefined
        }, "Cancel")) : /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("div", {
            className: "alpaca-comment-content",
            dangerouslySetInnerHTML: {
                __html: comment.content.raw ? (0, _marked.marked)(comment.content.raw) : comment.content.rendered
            },
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 291,
                columnNumber: 23
            },
            __self: undefined
        })))))), deleteCommentId && /*#__PURE__*/ React.createElement(Modal, {
        title: "Delete Comment?",
        onRequestClose: cancelDelete,
        className: "alpaca-modal",
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 308,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 313,
            columnNumber: 13
        },
        __self: undefined
    }, "Are you sure you want to delete this comment?"), /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        onClick: deleteComment,
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 314,
            columnNumber: 13
        },
        __self: undefined
    }, "Delete"), /*#__PURE__*/ React.createElement(Button, {
        onClick: cancelDelete,
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 317,
            columnNumber: 13
        },
        __self: undefined
    }, "Cancel"))));
};
exports.default = Commenting;

},{"../hooks/useUser":"7ZWZh","../services/issueApi":"bebt9","./User":"enwL1","marked":"4duqf","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"7ZWZh":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getUser", ()=>getUser);
parcelHelpers.export(exports, "getUsers", ()=>getUsers);
parcelHelpers.export(exports, "useUser", ()=>useUser);
parcelHelpers.export(exports, "generateAssigneeSpan", ()=>generateAssigneeSpan);
const { useState, useEffect } = wp.element;
const cache = new Map();
async function getUser(id = 'me') {
    if (cache.has(id)) return cache.get(id);
    const user = await wp.apiFetch({
        path: `/wp/v2/users/${id}`
    });
    cache.set(id, user);
    return user;
}
async function getUsers(ids) {
    const users = await Promise.all(ids.map(getUser));
    return users;
}
const useUser = (user)=>{
    const [userData, setUserData] = useState(typeof user === "object" ? user : null);
    const [loading, setLoading] = useState(typeof user === "number" || typeof user === "string" && !isNaN(user));
    useEffect(()=>{
        if (typeof user === "number" || typeof user === "string" && !isNaN(user)) {
            const userId = parseInt(user, 10);
            setLoading(true);
            getUser(userId).then(setUserData).catch((err)=>{
                console.error("Error fetching user:", err);
                setUserData(null);
            }).finally(()=>setLoading(false));
        } else if (typeof user === "object") {
            setUserData(user);
            setLoading(false);
        } else {
            setUserData(null);
            setLoading(false);
        }
    }, [
        user
    ]);
    return {
        user: userData,
        loading
    };
};
const generateAssigneeSpan = (user)=>{
    if (!user) return "";
    const avatarAttr = user.avatar ? ` data-avatar="${user.avatar}"` : "";
    return `<span class="alpaca-status-assignee" data-userid="${user.id}"${avatarAttr}>${user.name}</span>`;
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"bebt9":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchIssue", ()=>fetchIssue);
parcelHelpers.export(exports, "updateIssue", ()=>updateIssue);
parcelHelpers.export(exports, "fetchStatuses", ()=>fetchStatuses);
parcelHelpers.export(exports, "fetchUsers", ()=>fetchUsers);
parcelHelpers.export(exports, "fetchIssueCommentCount", ()=>fetchIssueCommentCount);
const fetchIssue = (id)=>wp.apiFetch({
        path: `/issue/v1/get/${id}`
    });
const updateIssue = (id, data)=>{
    return wp.apiFetch({
        path: `/issue/v1/update/${id}`,
        method: "POST",
        data
    });
};
const fetchStatuses = ()=>wp.apiFetch({
        path: "/alpaca/v1/statuses"
    });
const fetchUsers = ()=>wp.apiFetch({
        path: "/alpaca/v1/users"
    });
const fetchIssueCommentCount = (id)=>{
    return wp.apiFetch({
        path: `/issue/v1/comment-count/${id}`
    });
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"enwL1":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _useUser = require("../hooks/useUser");
const { useMemo } = wp.element;
const User = ({ user: userProp })=>{
    const { user, loading } = (0, _useUser.useUser)(userProp);
    const { userName, avatarUrl } = useMemo(()=>{
        if (!user) return {
            userName: null,
            avatarUrl: null
        };
        const { name, avatar, display_name, avatar_urls } = user;
        const userName = display_name || name;
        const avatarUrl = avatar || avatar_urls && avatar_urls[96];
        return {
            userName,
            avatarUrl
        };
    }, [
        user
    ]);
    if (loading) return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user",
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 15,
            columnNumber: 23
        },
        __self: undefined
    }, "Loading...");
    if (!user) return null;
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user",
        title: userName,
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 19,
            columnNumber: 5
        },
        __self: undefined
    }, avatarUrl && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user-avatar",
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 21,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("img", {
        src: avatarUrl,
        alt: `Avatar of ${userName}`,
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 22,
            columnNumber: 11
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user-name",
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 25,
            columnNumber: 7
        },
        __self: undefined
    }, userName));
};
exports.default = User;

},{"../hooks/useUser":"7ZWZh","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4duqf":[function(require,module,exports,__globalThis) {
/**
 * marked v16.2.0 - a markdown parser
 * Copyright (c) 2011-2025, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */ /**
 * DO NOT EDIT THIS FILE
 * The code in this file is generated from files in ./src/
 */ (function(g, f) {
    module.exports = f();
})(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : this, function() {
    var exports = {};
    var __exports = exports;
    var module1 = {
        exports
    };
    "use strict";
    var H = Object.defineProperty;
    var be = Object.getOwnPropertyDescriptor;
    var Re = Object.getOwnPropertyNames;
    var Oe = Object.prototype.hasOwnProperty;
    var Te = (a, e)=>{
        for(var t in e)H(a, t, {
            get: e[t],
            enumerable: !0
        });
    }, we = (a, e, t, n)=>{
        if (e && typeof e == "object" || typeof e == "function") for (let r of Re(e))!Oe.call(a, r) && r !== t && H(a, r, {
            get: ()=>e[r],
            enumerable: !(n = be(e, r)) || n.enumerable
        });
        return a;
    };
    var ye = (a)=>we(H({}, "__esModule", {
            value: !0
        }), a);
    var dt = {};
    Te(dt, {
        Hooks: ()=>$,
        Lexer: ()=>x,
        Marked: ()=>A,
        Parser: ()=>b,
        Renderer: ()=>P,
        TextRenderer: ()=>S,
        Tokenizer: ()=>y,
        defaults: ()=>O,
        getDefaults: ()=>_,
        lexer: ()=>ht,
        marked: ()=>d,
        options: ()=>it,
        parse: ()=>pt,
        parseInline: ()=>ut,
        parser: ()=>ct,
        setOptions: ()=>ot,
        use: ()=>at,
        walkTokens: ()=>lt
    });
    module1.exports = ye(dt);
    function _() {
        return {
            async: !1,
            breaks: !1,
            extensions: null,
            gfm: !0,
            hooks: null,
            pedantic: !1,
            renderer: null,
            silent: !1,
            tokenizer: null,
            walkTokens: null
        };
    }
    var O = _();
    function N(a) {
        O = a;
    }
    var C = {
        exec: ()=>null
    };
    function h(a, e = "") {
        let t = typeof a == "string" ? a : a.source, n = {
            replace: (r, i)=>{
                let s = typeof i == "string" ? i : i.source;
                return s = s.replace(m.caret, "$1"), t = t.replace(r, s), n;
            },
            getRegex: ()=>new RegExp(t, e)
        };
        return n;
    }
    var m = {
        codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
        outputLinkReplace: /\\([\[\]])/g,
        indentCodeCompensation: /^(\s+)(?:```)/,
        beginningSpace: /^\s+/,
        endingHash: /#$/,
        startingSpaceChar: /^ /,
        endingSpaceChar: / $/,
        nonSpaceChar: /[^ ]/,
        newLineCharGlobal: /\n/g,
        tabCharGlobal: /\t/g,
        multipleSpaceGlobal: /\s+/g,
        blankLine: /^[ \t]*$/,
        doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
        blockquoteStart: /^ {0,3}>/,
        blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
        blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
        listReplaceTabs: /^\t+/,
        listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
        listIsTask: /^\[[ xX]\] /,
        listReplaceTask: /^\[[ xX]\] +/,
        anyLine: /\n.*\n/,
        hrefBrackets: /^<(.*)>$/,
        tableDelimiter: /[:|]/,
        tableAlignChars: /^\||\| *$/g,
        tableRowBlankLine: /\n[ \t]*$/,
        tableAlignRight: /^ *-+: *$/,
        tableAlignCenter: /^ *:-+: *$/,
        tableAlignLeft: /^ *:-+ *$/,
        startATag: /^<a /i,
        endATag: /^<\/a>/i,
        startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
        endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
        startAngleBracket: /^</,
        endAngleBracket: />$/,
        pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
        unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
        escapeTest: /[&<>"']/,
        escapeReplace: /[&<>"']/g,
        escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
        escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
        unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,
        caret: /(^|[^\[])\^/g,
        percentDecode: /%25/g,
        findPipe: /\|/g,
        splitPipe: / \|/,
        slashPipe: /\\\|/g,
        carriageReturn: /\r\n|\r/g,
        spaceLine: /^ +$/gm,
        notSpaceStart: /^\S*/,
        endingNewline: /\n$/,
        listItemRegex: (a)=>new RegExp(`^( {0,3}${a})((?:[	 ][^\\n]*)?(?:\\n|$))`),
        nextBulletRegex: (a)=>new RegExp(`^ {0,${Math.min(3, a - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
        hrRegex: (a)=>new RegExp(`^ {0,${Math.min(3, a - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
        fencesBeginRegex: (a)=>new RegExp(`^ {0,${Math.min(3, a - 1)}}(?:\`\`\`|~~~)`),
        headingBeginRegex: (a)=>new RegExp(`^ {0,${Math.min(3, a - 1)}}#`),
        htmlBeginRegex: (a)=>new RegExp(`^ {0,${Math.min(3, a - 1)}}<(?:[a-z].*>|!--)`, "i")
    }, Pe = /^(?:[ \t]*(?:\n|$))+/, Se = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, $e = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, I = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, _e = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, F = /(?:[*+-]|\d{1,9}[.)])/, ie = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, oe = h(ie).replace(/bull/g, F).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Le = h(ie).replace(/bull/g, F).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Q = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, Me = /^[^\n]+/, U = /(?!\s*\])(?:\\.|[^\[\]\\])+/, ze = h(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", U).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Ae = h(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, F).getRegex(), v = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", K = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Ee = h("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", K).replace("tag", v).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), ae = h(Q).replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex(), Ce = h(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", ae).getRegex(), W = {
        blockquote: Ce,
        code: Se,
        def: ze,
        fences: $e,
        heading: _e,
        hr: I,
        html: Ee,
        lheading: oe,
        list: Ae,
        newline: Pe,
        paragraph: ae,
        table: C,
        text: Me
    }, se = h("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex(), Ie = {
        ...W,
        lheading: Le,
        table: se,
        paragraph: h(Q).replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", se).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex()
    }, Be = {
        ...W,
        html: h(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", K).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
        heading: /^(#{1,6})(.*)(?:\n+|$)/,
        fences: C,
        lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
        paragraph: h(Q).replace("hr", I).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", oe).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
    }, qe = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, ve = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, le = /^( {2,}|\\)\n(?!\s*$)/, De = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, D = /[\p{P}\p{S}]/u, X = /[\s\p{P}\p{S}]/u, ue = /[^\s\p{P}\p{S}]/u, Ze = h(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, X).getRegex(), pe = /(?!~)[\p{P}\p{S}]/u, Ge = /(?!~)[\s\p{P}\p{S}]/u, He = /(?:[^\s\p{P}\p{S}]|~)/u, Ne = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<(?! )[^<>]*?>/g, ce = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, je = h(ce, "u").replace(/punct/g, D).getRegex(), Fe = h(ce, "u").replace(/punct/g, pe).getRegex(), he = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Qe = h(he, "gu").replace(/notPunctSpace/g, ue).replace(/punctSpace/g, X).replace(/punct/g, D).getRegex(), Ue = h(he, "gu").replace(/notPunctSpace/g, He).replace(/punctSpace/g, Ge).replace(/punct/g, pe).getRegex(), Ke = h("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, ue).replace(/punctSpace/g, X).replace(/punct/g, D).getRegex(), We = h(/\\(punct)/, "gu").replace(/punct/g, D).getRegex(), Xe = h(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Je = h(K).replace("(?:-->|$)", "-->").getRegex(), Ve = h("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", Je).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), q = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, Ye = h(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", q).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), de = h(/^!?\[(label)\]\[(ref)\]/).replace("label", q).replace("ref", U).getRegex(), ke = h(/^!?\[(ref)\](?:\[\])?/).replace("ref", U).getRegex(), et = h("reflink|nolink(?!\\()", "g").replace("reflink", de).replace("nolink", ke).getRegex(), J = {
        _backpedal: C,
        anyPunctuation: We,
        autolink: Xe,
        blockSkip: Ne,
        br: le,
        code: ve,
        del: C,
        emStrongLDelim: je,
        emStrongRDelimAst: Qe,
        emStrongRDelimUnd: Ke,
        escape: qe,
        link: Ye,
        nolink: ke,
        punctuation: Ze,
        reflink: de,
        reflinkSearch: et,
        tag: Ve,
        text: De,
        url: C
    }, tt = {
        ...J,
        link: h(/^!?\[(label)\]\((.*?)\)/).replace("label", q).getRegex(),
        reflink: h(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", q).getRegex()
    }, j = {
        ...J,
        emStrongRDelimAst: Ue,
        emStrongLDelim: Fe,
        url: h(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
        _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
        del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
        text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
    }, nt = {
        ...j,
        br: h(le).replace("{2,}", "*").getRegex(),
        text: h(j.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
    }, B = {
        normal: W,
        gfm: Ie,
        pedantic: Be
    }, M = {
        normal: J,
        gfm: j,
        breaks: nt,
        pedantic: tt
    };
    var rt = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }, ge = (a)=>rt[a];
    function w(a, e) {
        if (e) {
            if (m.escapeTest.test(a)) return a.replace(m.escapeReplace, ge);
        } else if (m.escapeTestNoEncode.test(a)) return a.replace(m.escapeReplaceNoEncode, ge);
        return a;
    }
    function V(a) {
        try {
            a = encodeURI(a).replace(m.percentDecode, "%");
        } catch  {
            return null;
        }
        return a;
    }
    function Y(a, e) {
        let t = a.replace(m.findPipe, (i, s, o)=>{
            let l = !1, u = s;
            for(; --u >= 0 && o[u] === "\\";)l = !l;
            return l ? "|" : " |";
        }), n = t.split(m.splitPipe), r = 0;
        if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e) {
            if (n.length > e) n.splice(e);
            else for(; n.length < e;)n.push("");
        }
        for(; r < n.length; r++)n[r] = n[r].trim().replace(m.slashPipe, "|");
        return n;
    }
    function z(a, e, t) {
        let n = a.length;
        if (n === 0) return "";
        let r = 0;
        for(; r < n;){
            let i = a.charAt(n - r - 1);
            if (i === e && !t) r++;
            else if (i !== e && t) r++;
            else break;
        }
        return a.slice(0, n - r);
    }
    function fe(a, e) {
        if (a.indexOf(e[1]) === -1) return -1;
        let t = 0;
        for(let n = 0; n < a.length; n++)if (a[n] === "\\") n++;
        else if (a[n] === e[0]) t++;
        else if (a[n] === e[1] && (t--, t < 0)) return n;
        return t > 0 ? -2 : -1;
    }
    function me(a, e, t, n, r) {
        let i = e.href, s = e.title || null, o = a[1].replace(r.other.outputLinkReplace, "$1");
        n.state.inLink = !0;
        let l = {
            type: a[0].charAt(0) === "!" ? "image" : "link",
            raw: t,
            href: i,
            title: s,
            text: o,
            tokens: n.inlineTokens(o)
        };
        return n.state.inLink = !1, l;
    }
    function st(a, e, t) {
        let n = a.match(t.other.indentCodeCompensation);
        if (n === null) return e;
        let r = n[1];
        return e.split(`
`).map((i)=>{
            let s = i.match(t.other.beginningSpace);
            if (s === null) return i;
            let [o] = s;
            return o.length >= r.length ? i.slice(r.length) : i;
        }).join(`
`);
    }
    var y = class {
        options;
        rules;
        lexer;
        constructor(e){
            this.options = e || O;
        }
        space(e) {
            let t = this.rules.block.newline.exec(e);
            if (t && t[0].length > 0) return {
                type: "space",
                raw: t[0]
            };
        }
        code(e) {
            let t = this.rules.block.code.exec(e);
            if (t) {
                let n = t[0].replace(this.rules.other.codeRemoveIndent, "");
                return {
                    type: "code",
                    raw: t[0],
                    codeBlockStyle: "indented",
                    text: this.options.pedantic ? n : z(n, `
`)
                };
            }
        }
        fences(e) {
            let t = this.rules.block.fences.exec(e);
            if (t) {
                let n = t[0], r = st(n, t[3] || "", this.rules);
                return {
                    type: "code",
                    raw: n,
                    lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2],
                    text: r
                };
            }
        }
        heading(e) {
            let t = this.rules.block.heading.exec(e);
            if (t) {
                let n = t[2].trim();
                if (this.rules.other.endingHash.test(n)) {
                    let r = z(n, "#");
                    (this.options.pedantic || !r || this.rules.other.endingSpaceChar.test(r)) && (n = r.trim());
                }
                return {
                    type: "heading",
                    raw: t[0],
                    depth: t[1].length,
                    text: n,
                    tokens: this.lexer.inline(n)
                };
            }
        }
        hr(e) {
            let t = this.rules.block.hr.exec(e);
            if (t) return {
                type: "hr",
                raw: z(t[0], `
`)
            };
        }
        blockquote(e) {
            let t = this.rules.block.blockquote.exec(e);
            if (t) {
                let n = z(t[0], `
`).split(`
`), r = "", i = "", s = [];
                for(; n.length > 0;){
                    let o = !1, l = [], u;
                    for(u = 0; u < n.length; u++)if (this.rules.other.blockquoteStart.test(n[u])) l.push(n[u]), o = !0;
                    else if (!o) l.push(n[u]);
                    else break;
                    n = n.slice(u);
                    let p = l.join(`
`), c = p.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
                    r = r ? `${r}
${p}` : p, i = i ? `${i}
${c}` : c;
                    let f = this.lexer.state.top;
                    if (this.lexer.state.top = !0, this.lexer.blockTokens(c, s, !0), this.lexer.state.top = f, n.length === 0) break;
                    let k = s.at(-1);
                    if (k?.type === "code") break;
                    if (k?.type === "blockquote") {
                        let R = k, g = R.raw + `
` + n.join(`
`), T = this.blockquote(g);
                        s[s.length - 1] = T, r = r.substring(0, r.length - R.raw.length) + T.raw, i = i.substring(0, i.length - R.text.length) + T.text;
                        break;
                    } else if (k?.type === "list") {
                        let R = k, g = R.raw + `
` + n.join(`
`), T = this.list(g);
                        s[s.length - 1] = T, r = r.substring(0, r.length - k.raw.length) + T.raw, i = i.substring(0, i.length - R.raw.length) + T.raw, n = g.substring(s.at(-1).raw.length).split(`
`);
                        continue;
                    }
                }
                return {
                    type: "blockquote",
                    raw: r,
                    tokens: s,
                    text: i
                };
            }
        }
        list(e) {
            let t = this.rules.block.list.exec(e);
            if (t) {
                let n = t[1].trim(), r = n.length > 1, i = {
                    type: "list",
                    raw: "",
                    ordered: r,
                    start: r ? +n.slice(0, -1) : "",
                    loose: !1,
                    items: []
                };
                n = r ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = r ? n : "[*+-]");
                let s = this.rules.other.listItemRegex(n), o = !1;
                for(; e;){
                    let u = !1, p = "", c = "";
                    if (!(t = s.exec(e)) || this.rules.block.hr.test(e)) break;
                    p = t[0], e = e.substring(p.length);
                    let f = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (Z)=>" ".repeat(3 * Z.length)), k = e.split(`
`, 1)[0], R = !f.trim(), g = 0;
                    if (this.options.pedantic ? (g = 2, c = f.trimStart()) : R ? g = t[1].length + 1 : (g = t[2].search(this.rules.other.nonSpaceChar), g = g > 4 ? 1 : g, c = f.slice(g), g += t[1].length), R && this.rules.other.blankLine.test(k) && (p += k + `
`, e = e.substring(k.length + 1), u = !0), !u) {
                        let Z = this.rules.other.nextBulletRegex(g), te = this.rules.other.hrRegex(g), ne = this.rules.other.fencesBeginRegex(g), re = this.rules.other.headingBeginRegex(g), xe = this.rules.other.htmlBeginRegex(g);
                        for(; e;){
                            let G = e.split(`
`, 1)[0], E;
                            if (k = G, this.options.pedantic ? (k = k.replace(this.rules.other.listReplaceNesting, "  "), E = k) : E = k.replace(this.rules.other.tabCharGlobal, "    "), ne.test(k) || re.test(k) || xe.test(k) || Z.test(k) || te.test(k)) break;
                            if (E.search(this.rules.other.nonSpaceChar) >= g || !k.trim()) c += `
` + E.slice(g);
                            else {
                                if (R || f.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ne.test(f) || re.test(f) || te.test(f)) break;
                                c += `
` + k;
                            }
                            !R && !k.trim() && (R = !0), p += G + `
`, e = e.substring(G.length + 1), f = E.slice(g);
                        }
                    }
                    i.loose || (o ? i.loose = !0 : this.rules.other.doubleBlankLine.test(p) && (o = !0));
                    let T = null, ee;
                    this.options.gfm && (T = this.rules.other.listIsTask.exec(c), T && (ee = T[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), i.items.push({
                        type: "list_item",
                        raw: p,
                        task: !!T,
                        checked: ee,
                        loose: !1,
                        text: c,
                        tokens: []
                    }), i.raw += p;
                }
                let l = i.items.at(-1);
                if (l) l.raw = l.raw.trimEnd(), l.text = l.text.trimEnd();
                else return;
                i.raw = i.raw.trimEnd();
                for(let u = 0; u < i.items.length; u++)if (this.lexer.state.top = !1, i.items[u].tokens = this.lexer.blockTokens(i.items[u].text, []), !i.loose) {
                    let p = i.items[u].tokens.filter((f)=>f.type === "space"), c = p.length > 0 && p.some((f)=>this.rules.other.anyLine.test(f.raw));
                    i.loose = c;
                }
                if (i.loose) for(let u = 0; u < i.items.length; u++)i.items[u].loose = !0;
                return i;
            }
        }
        html(e) {
            let t = this.rules.block.html.exec(e);
            if (t) return {
                type: "html",
                block: !0,
                raw: t[0],
                pre: t[1] === "pre" || t[1] === "script" || t[1] === "style",
                text: t[0]
            };
        }
        def(e) {
            let t = this.rules.block.def.exec(e);
            if (t) {
                let n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), r = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", i = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
                return {
                    type: "def",
                    tag: n,
                    raw: t[0],
                    href: r,
                    title: i
                };
            }
        }
        table(e) {
            let t = this.rules.block.table.exec(e);
            if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
            let n = Y(t[1]), r = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), i = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], s = {
                type: "table",
                raw: t[0],
                header: [],
                align: [],
                rows: []
            };
            if (n.length === r.length) {
                for (let o of r)this.rules.other.tableAlignRight.test(o) ? s.align.push("right") : this.rules.other.tableAlignCenter.test(o) ? s.align.push("center") : this.rules.other.tableAlignLeft.test(o) ? s.align.push("left") : s.align.push(null);
                for(let o = 0; o < n.length; o++)s.header.push({
                    text: n[o],
                    tokens: this.lexer.inline(n[o]),
                    header: !0,
                    align: s.align[o]
                });
                for (let o of i)s.rows.push(Y(o, s.header.length).map((l, u)=>({
                        text: l,
                        tokens: this.lexer.inline(l),
                        header: !1,
                        align: s.align[u]
                    })));
                return s;
            }
        }
        lheading(e) {
            let t = this.rules.block.lheading.exec(e);
            if (t) return {
                type: "heading",
                raw: t[0],
                depth: t[2].charAt(0) === "=" ? 1 : 2,
                text: t[1],
                tokens: this.lexer.inline(t[1])
            };
        }
        paragraph(e) {
            let t = this.rules.block.paragraph.exec(e);
            if (t) {
                let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
                return {
                    type: "paragraph",
                    raw: t[0],
                    text: n,
                    tokens: this.lexer.inline(n)
                };
            }
        }
        text(e) {
            let t = this.rules.block.text.exec(e);
            if (t) return {
                type: "text",
                raw: t[0],
                text: t[0],
                tokens: this.lexer.inline(t[0])
            };
        }
        escape(e) {
            let t = this.rules.inline.escape.exec(e);
            if (t) return {
                type: "escape",
                raw: t[0],
                text: t[1]
            };
        }
        tag(e) {
            let t = this.rules.inline.tag.exec(e);
            if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = !1), {
                type: "html",
                raw: t[0],
                inLink: this.lexer.state.inLink,
                inRawBlock: this.lexer.state.inRawBlock,
                block: !1,
                text: t[0]
            };
        }
        link(e) {
            let t = this.rules.inline.link.exec(e);
            if (t) {
                let n = t[2].trim();
                if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
                    if (!this.rules.other.endAngleBracket.test(n)) return;
                    let s = z(n.slice(0, -1), "\\");
                    if ((n.length - s.length) % 2 === 0) return;
                } else {
                    let s = fe(t[2], "()");
                    if (s === -2) return;
                    if (s > -1) {
                        let l = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + s;
                        t[2] = t[2].substring(0, s), t[0] = t[0].substring(0, l).trim(), t[3] = "";
                    }
                }
                let r = t[2], i = "";
                if (this.options.pedantic) {
                    let s = this.rules.other.pedanticHrefTitle.exec(r);
                    s && (r = s[1], i = s[3]);
                } else i = t[3] ? t[3].slice(1, -1) : "";
                return r = r.trim(), this.rules.other.startAngleBracket.test(r) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? r = r.slice(1) : r = r.slice(1, -1)), me(t, {
                    href: r && r.replace(this.rules.inline.anyPunctuation, "$1"),
                    title: i && i.replace(this.rules.inline.anyPunctuation, "$1")
                }, t[0], this.lexer, this.rules);
            }
        }
        reflink(e, t) {
            let n;
            if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
                let r = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), i = t[r.toLowerCase()];
                if (!i) {
                    let s = n[0].charAt(0);
                    return {
                        type: "text",
                        raw: s,
                        text: s
                    };
                }
                return me(n, i, n[0], this.lexer, this.rules);
            }
        }
        emStrong(e, t, n = "") {
            let r = this.rules.inline.emStrongLDelim.exec(e);
            if (!r || r[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
            if (!(r[1] || r[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
                let s = [
                    ...r[0]
                ].length - 1, o, l, u = s, p = 0, c = r[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
                for(c.lastIndex = 0, t = t.slice(-1 * e.length + s); (r = c.exec(t)) != null;){
                    if (o = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !o) continue;
                    if (l = [
                        ...o
                    ].length, r[3] || r[4]) {
                        u += l;
                        continue;
                    } else if ((r[5] || r[6]) && s % 3 && !((s + l) % 3)) {
                        p += l;
                        continue;
                    }
                    if (u -= l, u > 0) continue;
                    l = Math.min(l, l + u + p);
                    let f = [
                        ...r[0]
                    ][0].length, k = e.slice(0, s + r.index + f + l);
                    if (Math.min(s, l) % 2) {
                        let g = k.slice(1, -1);
                        return {
                            type: "em",
                            raw: k,
                            text: g,
                            tokens: this.lexer.inlineTokens(g)
                        };
                    }
                    let R = k.slice(2, -2);
                    return {
                        type: "strong",
                        raw: k,
                        text: R,
                        tokens: this.lexer.inlineTokens(R)
                    };
                }
            }
        }
        codespan(e) {
            let t = this.rules.inline.code.exec(e);
            if (t) {
                let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), r = this.rules.other.nonSpaceChar.test(n), i = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
                return r && i && (n = n.substring(1, n.length - 1)), {
                    type: "codespan",
                    raw: t[0],
                    text: n
                };
            }
        }
        br(e) {
            let t = this.rules.inline.br.exec(e);
            if (t) return {
                type: "br",
                raw: t[0]
            };
        }
        del(e) {
            let t = this.rules.inline.del.exec(e);
            if (t) return {
                type: "del",
                raw: t[0],
                text: t[2],
                tokens: this.lexer.inlineTokens(t[2])
            };
        }
        autolink(e) {
            let t = this.rules.inline.autolink.exec(e);
            if (t) {
                let n, r;
                return t[2] === "@" ? (n = t[1], r = "mailto:" + n) : (n = t[1], r = n), {
                    type: "link",
                    raw: t[0],
                    text: n,
                    href: r,
                    tokens: [
                        {
                            type: "text",
                            raw: n,
                            text: n
                        }
                    ]
                };
            }
        }
        url(e) {
            let t;
            if (t = this.rules.inline.url.exec(e)) {
                let n, r;
                if (t[2] === "@") n = t[0], r = "mailto:" + n;
                else {
                    let i;
                    do i = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
                    while (i !== t[0]);
                    n = t[0], t[1] === "www." ? r = "http://" + t[0] : r = t[0];
                }
                return {
                    type: "link",
                    raw: t[0],
                    text: n,
                    href: r,
                    tokens: [
                        {
                            type: "text",
                            raw: n,
                            text: n
                        }
                    ]
                };
            }
        }
        inlineText(e) {
            let t = this.rules.inline.text.exec(e);
            if (t) {
                let n = this.lexer.state.inRawBlock;
                return {
                    type: "text",
                    raw: t[0],
                    text: t[0],
                    escaped: n
                };
            }
        }
    };
    var x = class a {
        tokens;
        options;
        state;
        tokenizer;
        inlineQueue;
        constructor(e){
            this.tokens = [], this.tokens.links = Object.create(null), this.options = e || O, this.options.tokenizer = this.options.tokenizer || new y, this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
                inLink: !1,
                inRawBlock: !1,
                top: !0
            };
            let t = {
                other: m,
                block: B.normal,
                inline: M.normal
            };
            this.options.pedantic ? (t.block = B.pedantic, t.inline = M.pedantic) : this.options.gfm && (t.block = B.gfm, this.options.breaks ? t.inline = M.breaks : t.inline = M.gfm), this.tokenizer.rules = t;
        }
        static get rules() {
            return {
                block: B,
                inline: M
            };
        }
        static lex(e, t) {
            return new a(t).lex(e);
        }
        static lexInline(e, t) {
            return new a(t).inlineTokens(e);
        }
        lex(e) {
            e = e.replace(m.carriageReturn, `
`), this.blockTokens(e, this.tokens);
            for(let t = 0; t < this.inlineQueue.length; t++){
                let n = this.inlineQueue[t];
                this.inlineTokens(n.src, n.tokens);
            }
            return this.inlineQueue = [], this.tokens;
        }
        blockTokens(e, t = [], n = !1) {
            for(this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, "")); e;){
                let r;
                if (this.options.extensions?.block?.some((s)=>(r = s.call({
                        lexer: this
                    }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), !0) : !1)) continue;
                if (r = this.tokenizer.space(e)) {
                    e = e.substring(r.raw.length);
                    let s = t.at(-1);
                    r.raw.length === 1 && s !== void 0 ? s.raw += `
` : t.push(r);
                    continue;
                }
                if (r = this.tokenizer.code(e)) {
                    e = e.substring(r.raw.length);
                    let s = t.at(-1);
                    s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.at(-1).src = s.text) : t.push(r);
                    continue;
                }
                if (r = this.tokenizer.fences(e)) {
                    e = e.substring(r.raw.length), t.push(r);
                    continue;
                }
                if (r = this.tokenizer.heading(e)) {
                    e = e.substring(r.raw.length), t.push(r);
                    continue;
                }
                if (r = this.tokenizer.hr(e)) {
                    e = e.substring(r.raw.length), t.push(r);
                    continue;
                }
                if (r = this.tokenizer.blockquote(e)) {
                    e = e.substring(r.raw.length), t.push(r);
                    continue;
                }
                if (r = this.tokenizer.list(e)) {
                    e = e.substring(r.raw.length), t.push(r);
                    continue;
                }
                if (r = this.tokenizer.html(e)) {
                    e = e.substring(r.raw.length), t.push(r);
                    continue;
                }
                if (r = this.tokenizer.def(e)) {
                    e = e.substring(r.raw.length);
                    let s = t.at(-1);
                    s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.raw, this.inlineQueue.at(-1).src = s.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = {
                        href: r.href,
                        title: r.title
                    }, t.push(r));
                    continue;
                }
                if (r = this.tokenizer.table(e)) {
                    e = e.substring(r.raw.length), t.push(r);
                    continue;
                }
                if (r = this.tokenizer.lheading(e)) {
                    e = e.substring(r.raw.length), t.push(r);
                    continue;
                }
                let i = e;
                if (this.options.extensions?.startBlock) {
                    let s = 1 / 0, o = e.slice(1), l;
                    this.options.extensions.startBlock.forEach((u)=>{
                        l = u.call({
                            lexer: this
                        }, o), typeof l == "number" && l >= 0 && (s = Math.min(s, l));
                    }), s < 1 / 0 && s >= 0 && (i = e.substring(0, s + 1));
                }
                if (this.state.top && (r = this.tokenizer.paragraph(i))) {
                    let s = t.at(-1);
                    n && s?.type === "paragraph" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r), n = i.length !== e.length, e = e.substring(r.raw.length);
                    continue;
                }
                if (r = this.tokenizer.text(e)) {
                    e = e.substring(r.raw.length);
                    let s = t.at(-1);
                    s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r);
                    continue;
                }
                if (e) {
                    let s = "Infinite loop on byte: " + e.charCodeAt(0);
                    if (this.options.silent) {
                        console.error(s);
                        break;
                    } else throw new Error(s);
                }
            }
            return this.state.top = !0, t;
        }
        inline(e, t = []) {
            return this.inlineQueue.push({
                src: e,
                tokens: t
            }), t;
        }
        inlineTokens(e, t = []) {
            let n = e, r = null;
            if (this.tokens.links) {
                let o = Object.keys(this.tokens.links);
                if (o.length > 0) for(; (r = this.tokenizer.rules.inline.reflinkSearch.exec(n)) != null;)o.includes(r[0].slice(r[0].lastIndexOf("[") + 1, -1)) && (n = n.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
            }
            for(; (r = this.tokenizer.rules.inline.anyPunctuation.exec(n)) != null;)n = n.slice(0, r.index) + "++" + n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
            for(; (r = this.tokenizer.rules.inline.blockSkip.exec(n)) != null;)n = n.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
            let i = !1, s = "";
            for(; e;){
                i || (s = ""), i = !1;
                let o;
                if (this.options.extensions?.inline?.some((u)=>(o = u.call({
                        lexer: this
                    }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), !0) : !1)) continue;
                if (o = this.tokenizer.escape(e)) {
                    e = e.substring(o.raw.length), t.push(o);
                    continue;
                }
                if (o = this.tokenizer.tag(e)) {
                    e = e.substring(o.raw.length), t.push(o);
                    continue;
                }
                if (o = this.tokenizer.link(e)) {
                    e = e.substring(o.raw.length), t.push(o);
                    continue;
                }
                if (o = this.tokenizer.reflink(e, this.tokens.links)) {
                    e = e.substring(o.raw.length);
                    let u = t.at(-1);
                    o.type === "text" && u?.type === "text" ? (u.raw += o.raw, u.text += o.text) : t.push(o);
                    continue;
                }
                if (o = this.tokenizer.emStrong(e, n, s)) {
                    e = e.substring(o.raw.length), t.push(o);
                    continue;
                }
                if (o = this.tokenizer.codespan(e)) {
                    e = e.substring(o.raw.length), t.push(o);
                    continue;
                }
                if (o = this.tokenizer.br(e)) {
                    e = e.substring(o.raw.length), t.push(o);
                    continue;
                }
                if (o = this.tokenizer.del(e)) {
                    e = e.substring(o.raw.length), t.push(o);
                    continue;
                }
                if (o = this.tokenizer.autolink(e)) {
                    e = e.substring(o.raw.length), t.push(o);
                    continue;
                }
                if (!this.state.inLink && (o = this.tokenizer.url(e))) {
                    e = e.substring(o.raw.length), t.push(o);
                    continue;
                }
                let l = e;
                if (this.options.extensions?.startInline) {
                    let u = 1 / 0, p = e.slice(1), c;
                    this.options.extensions.startInline.forEach((f)=>{
                        c = f.call({
                            lexer: this
                        }, p), typeof c == "number" && c >= 0 && (u = Math.min(u, c));
                    }), u < 1 / 0 && u >= 0 && (l = e.substring(0, u + 1));
                }
                if (o = this.tokenizer.inlineText(l)) {
                    e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (s = o.raw.slice(-1)), i = !0;
                    let u = t.at(-1);
                    u?.type === "text" ? (u.raw += o.raw, u.text += o.text) : t.push(o);
                    continue;
                }
                if (e) {
                    let u = "Infinite loop on byte: " + e.charCodeAt(0);
                    if (this.options.silent) {
                        console.error(u);
                        break;
                    } else throw new Error(u);
                }
            }
            return t;
        }
    };
    var P = class {
        options;
        parser;
        constructor(e){
            this.options = e || O;
        }
        space(e) {
            return "";
        }
        code({ text: e, lang: t, escaped: n }) {
            let r = (t || "").match(m.notSpaceStart)?.[0], i = e.replace(m.endingNewline, "") + `
`;
            return r ? '<pre><code class="language-' + w(r) + '">' + (n ? i : w(i, !0)) + `</code></pre>
` : "<pre><code>" + (n ? i : w(i, !0)) + `</code></pre>
`;
        }
        blockquote({ tokens: e }) {
            return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
        }
        html({ text: e }) {
            return e;
        }
        def(e) {
            return "";
        }
        heading({ tokens: e, depth: t }) {
            return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
        }
        hr(e) {
            return `<hr>
`;
        }
        list(e) {
            let t = e.ordered, n = e.start, r = "";
            for(let o = 0; o < e.items.length; o++){
                let l = e.items[o];
                r += this.listitem(l);
            }
            let i = t ? "ol" : "ul", s = t && n !== 1 ? ' start="' + n + '"' : "";
            return "<" + i + s + `>
` + r + "</" + i + `>
`;
        }
        listitem(e) {
            let t = "";
            if (e.task) {
                let n = this.checkbox({
                    checked: !!e.checked
                });
                e.loose ? e.tokens[0]?.type === "paragraph" ? (e.tokens[0].text = n + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = n + " " + w(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
                    type: "text",
                    raw: n + " ",
                    text: n + " ",
                    escaped: !0
                }) : t += n + " ";
            }
            return t += this.parser.parse(e.tokens, !!e.loose), `<li>${t}</li>
`;
        }
        checkbox({ checked: e }) {
            return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
        }
        paragraph({ tokens: e }) {
            return `<p>${this.parser.parseInline(e)}</p>
`;
        }
        table(e) {
            let t = "", n = "";
            for(let i = 0; i < e.header.length; i++)n += this.tablecell(e.header[i]);
            t += this.tablerow({
                text: n
            });
            let r = "";
            for(let i = 0; i < e.rows.length; i++){
                let s = e.rows[i];
                n = "";
                for(let o = 0; o < s.length; o++)n += this.tablecell(s[o]);
                r += this.tablerow({
                    text: n
                });
            }
            return r && (r = `<tbody>${r}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + r + `</table>
`;
        }
        tablerow({ text: e }) {
            return `<tr>
${e}</tr>
`;
        }
        tablecell(e) {
            let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
            return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
        }
        strong({ tokens: e }) {
            return `<strong>${this.parser.parseInline(e)}</strong>`;
        }
        em({ tokens: e }) {
            return `<em>${this.parser.parseInline(e)}</em>`;
        }
        codespan({ text: e }) {
            return `<code>${w(e, !0)}</code>`;
        }
        br(e) {
            return "<br>";
        }
        del({ tokens: e }) {
            return `<del>${this.parser.parseInline(e)}</del>`;
        }
        link({ href: e, title: t, tokens: n }) {
            let r = this.parser.parseInline(n), i = V(e);
            if (i === null) return r;
            e = i;
            let s = '<a href="' + e + '"';
            return t && (s += ' title="' + w(t) + '"'), s += ">" + r + "</a>", s;
        }
        image({ href: e, title: t, text: n, tokens: r }) {
            r && (n = this.parser.parseInline(r, this.parser.textRenderer));
            let i = V(e);
            if (i === null) return w(n);
            e = i;
            let s = `<img src="${e}" alt="${n}"`;
            return t && (s += ` title="${w(t)}"`), s += ">", s;
        }
        text(e) {
            return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : w(e.text);
        }
    };
    var S = class {
        strong({ text: e }) {
            return e;
        }
        em({ text: e }) {
            return e;
        }
        codespan({ text: e }) {
            return e;
        }
        del({ text: e }) {
            return e;
        }
        html({ text: e }) {
            return e;
        }
        text({ text: e }) {
            return e;
        }
        link({ text: e }) {
            return "" + e;
        }
        image({ text: e }) {
            return "" + e;
        }
        br() {
            return "";
        }
    };
    var b = class a {
        options;
        renderer;
        textRenderer;
        constructor(e){
            this.options = e || O, this.options.renderer = this.options.renderer || new P, this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new S;
        }
        static parse(e, t) {
            return new a(t).parse(e);
        }
        static parseInline(e, t) {
            return new a(t).parseInline(e);
        }
        parse(e, t = !0) {
            let n = "";
            for(let r = 0; r < e.length; r++){
                let i = e[r];
                if (this.options.extensions?.renderers?.[i.type]) {
                    let o = i, l = this.options.extensions.renderers[o.type].call({
                        parser: this
                    }, o);
                    if (l !== !1 || ![
                        "space",
                        "hr",
                        "heading",
                        "code",
                        "table",
                        "blockquote",
                        "list",
                        "html",
                        "def",
                        "paragraph",
                        "text"
                    ].includes(o.type)) {
                        n += l || "";
                        continue;
                    }
                }
                let s = i;
                switch(s.type){
                    case "space":
                        n += this.renderer.space(s);
                        continue;
                    case "hr":
                        n += this.renderer.hr(s);
                        continue;
                    case "heading":
                        n += this.renderer.heading(s);
                        continue;
                    case "code":
                        n += this.renderer.code(s);
                        continue;
                    case "table":
                        n += this.renderer.table(s);
                        continue;
                    case "blockquote":
                        n += this.renderer.blockquote(s);
                        continue;
                    case "list":
                        n += this.renderer.list(s);
                        continue;
                    case "html":
                        n += this.renderer.html(s);
                        continue;
                    case "def":
                        n += this.renderer.def(s);
                        continue;
                    case "paragraph":
                        n += this.renderer.paragraph(s);
                        continue;
                    case "text":
                        {
                            let o = s, l = this.renderer.text(o);
                            for(; r + 1 < e.length && e[r + 1].type === "text";)o = e[++r], l += `
` + this.renderer.text(o);
                            t ? n += this.renderer.paragraph({
                                type: "paragraph",
                                raw: l,
                                text: l,
                                tokens: [
                                    {
                                        type: "text",
                                        raw: l,
                                        text: l,
                                        escaped: !0
                                    }
                                ]
                            }) : n += l;
                            continue;
                        }
                    default:
                        {
                            let o = 'Token with "' + s.type + '" type was not found.';
                            if (this.options.silent) return console.error(o), "";
                            throw new Error(o);
                        }
                }
            }
            return n;
        }
        parseInline(e, t = this.renderer) {
            let n = "";
            for(let r = 0; r < e.length; r++){
                let i = e[r];
                if (this.options.extensions?.renderers?.[i.type]) {
                    let o = this.options.extensions.renderers[i.type].call({
                        parser: this
                    }, i);
                    if (o !== !1 || ![
                        "escape",
                        "html",
                        "link",
                        "image",
                        "strong",
                        "em",
                        "codespan",
                        "br",
                        "del",
                        "text"
                    ].includes(i.type)) {
                        n += o || "";
                        continue;
                    }
                }
                let s = i;
                switch(s.type){
                    case "escape":
                        n += t.text(s);
                        break;
                    case "html":
                        n += t.html(s);
                        break;
                    case "link":
                        n += t.link(s);
                        break;
                    case "image":
                        n += t.image(s);
                        break;
                    case "strong":
                        n += t.strong(s);
                        break;
                    case "em":
                        n += t.em(s);
                        break;
                    case "codespan":
                        n += t.codespan(s);
                        break;
                    case "br":
                        n += t.br(s);
                        break;
                    case "del":
                        n += t.del(s);
                        break;
                    case "text":
                        n += t.text(s);
                        break;
                    default:
                        {
                            let o = 'Token with "' + s.type + '" type was not found.';
                            if (this.options.silent) return console.error(o), "";
                            throw new Error(o);
                        }
                }
            }
            return n;
        }
    };
    var $ = class {
        options;
        block;
        constructor(e){
            this.options = e || O;
        }
        static passThroughHooks = new Set([
            "preprocess",
            "postprocess",
            "processAllTokens"
        ]);
        preprocess(e) {
            return e;
        }
        postprocess(e) {
            return e;
        }
        processAllTokens(e) {
            return e;
        }
        provideLexer() {
            return this.block ? x.lex : x.lexInline;
        }
        provideParser() {
            return this.block ? b.parse : b.parseInline;
        }
    };
    var A = class {
        defaults = _();
        options = this.setOptions;
        parse = this.parseMarkdown(!0);
        parseInline = this.parseMarkdown(!1);
        Parser = b;
        Renderer = P;
        TextRenderer = S;
        Lexer = x;
        Tokenizer = y;
        Hooks = $;
        constructor(...e){
            this.use(...e);
        }
        walkTokens(e, t) {
            let n = [];
            for (let r of e)switch(n = n.concat(t.call(this, r)), r.type){
                case "table":
                    {
                        let i = r;
                        for (let s of i.header)n = n.concat(this.walkTokens(s.tokens, t));
                        for (let s of i.rows)for (let o of s)n = n.concat(this.walkTokens(o.tokens, t));
                        break;
                    }
                case "list":
                    {
                        let i = r;
                        n = n.concat(this.walkTokens(i.items, t));
                        break;
                    }
                default:
                    {
                        let i = r;
                        this.defaults.extensions?.childTokens?.[i.type] ? this.defaults.extensions.childTokens[i.type].forEach((s)=>{
                            let o = i[s].flat(1 / 0);
                            n = n.concat(this.walkTokens(o, t));
                        }) : i.tokens && (n = n.concat(this.walkTokens(i.tokens, t)));
                    }
            }
            return n;
        }
        use(...e) {
            let t = this.defaults.extensions || {
                renderers: {},
                childTokens: {}
            };
            return e.forEach((n)=>{
                let r = {
                    ...n
                };
                if (r.async = this.defaults.async || r.async || !1, n.extensions && (n.extensions.forEach((i)=>{
                    if (!i.name) throw new Error("extension name required");
                    if ("renderer" in i) {
                        let s = t.renderers[i.name];
                        s ? t.renderers[i.name] = function(...o) {
                            let l = i.renderer.apply(this, o);
                            return l === !1 && (l = s.apply(this, o)), l;
                        } : t.renderers[i.name] = i.renderer;
                    }
                    if ("tokenizer" in i) {
                        if (!i.level || i.level !== "block" && i.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
                        let s = t[i.level];
                        s ? s.unshift(i.tokenizer) : t[i.level] = [
                            i.tokenizer
                        ], i.start && (i.level === "block" ? t.startBlock ? t.startBlock.push(i.start) : t.startBlock = [
                            i.start
                        ] : i.level === "inline" && (t.startInline ? t.startInline.push(i.start) : t.startInline = [
                            i.start
                        ]));
                    }
                    "childTokens" in i && i.childTokens && (t.childTokens[i.name] = i.childTokens);
                }), r.extensions = t), n.renderer) {
                    let i = this.defaults.renderer || new P(this.defaults);
                    for(let s in n.renderer){
                        if (!(s in i)) throw new Error(`renderer '${s}' does not exist`);
                        if ([
                            "options",
                            "parser"
                        ].includes(s)) continue;
                        let o = s, l = n.renderer[o], u = i[o];
                        i[o] = (...p)=>{
                            let c = l.apply(i, p);
                            return c === !1 && (c = u.apply(i, p)), c || "";
                        };
                    }
                    r.renderer = i;
                }
                if (n.tokenizer) {
                    let i = this.defaults.tokenizer || new y(this.defaults);
                    for(let s in n.tokenizer){
                        if (!(s in i)) throw new Error(`tokenizer '${s}' does not exist`);
                        if ([
                            "options",
                            "rules",
                            "lexer"
                        ].includes(s)) continue;
                        let o = s, l = n.tokenizer[o], u = i[o];
                        i[o] = (...p)=>{
                            let c = l.apply(i, p);
                            return c === !1 && (c = u.apply(i, p)), c;
                        };
                    }
                    r.tokenizer = i;
                }
                if (n.hooks) {
                    let i = this.defaults.hooks || new $;
                    for(let s in n.hooks){
                        if (!(s in i)) throw new Error(`hook '${s}' does not exist`);
                        if ([
                            "options",
                            "block"
                        ].includes(s)) continue;
                        let o = s, l = n.hooks[o], u = i[o];
                        $.passThroughHooks.has(s) ? i[o] = (p)=>{
                            if (this.defaults.async) return Promise.resolve(l.call(i, p)).then((f)=>u.call(i, f));
                            let c = l.call(i, p);
                            return u.call(i, c);
                        } : i[o] = (...p)=>{
                            let c = l.apply(i, p);
                            return c === !1 && (c = u.apply(i, p)), c;
                        };
                    }
                    r.hooks = i;
                }
                if (n.walkTokens) {
                    let i = this.defaults.walkTokens, s = n.walkTokens;
                    r.walkTokens = function(o) {
                        let l = [];
                        return l.push(s.call(this, o)), i && (l = l.concat(i.call(this, o))), l;
                    };
                }
                this.defaults = {
                    ...this.defaults,
                    ...r
                };
            }), this;
        }
        setOptions(e) {
            return this.defaults = {
                ...this.defaults,
                ...e
            }, this;
        }
        lexer(e, t) {
            return x.lex(e, t ?? this.defaults);
        }
        parser(e, t) {
            return b.parse(e, t ?? this.defaults);
        }
        parseMarkdown(e) {
            return (n, r)=>{
                let i = {
                    ...r
                }, s = {
                    ...this.defaults,
                    ...i
                }, o = this.onError(!!s.silent, !!s.async);
                if (this.defaults.async === !0 && i.async === !1) return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
                if (typeof n > "u" || n === null) return o(new Error("marked(): input parameter is undefined or null"));
                if (typeof n != "string") return o(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
                s.hooks && (s.hooks.options = s, s.hooks.block = e);
                let l = s.hooks ? s.hooks.provideLexer() : e ? x.lex : x.lexInline, u = s.hooks ? s.hooks.provideParser() : e ? b.parse : b.parseInline;
                if (s.async) return Promise.resolve(s.hooks ? s.hooks.preprocess(n) : n).then((p)=>l(p, s)).then((p)=>s.hooks ? s.hooks.processAllTokens(p) : p).then((p)=>s.walkTokens ? Promise.all(this.walkTokens(p, s.walkTokens)).then(()=>p) : p).then((p)=>u(p, s)).then((p)=>s.hooks ? s.hooks.postprocess(p) : p).catch(o);
                try {
                    s.hooks && (n = s.hooks.preprocess(n));
                    let p = l(n, s);
                    s.hooks && (p = s.hooks.processAllTokens(p)), s.walkTokens && this.walkTokens(p, s.walkTokens);
                    let c = u(p, s);
                    return s.hooks && (c = s.hooks.postprocess(c)), c;
                } catch (p) {
                    return o(p);
                }
            };
        }
        onError(e, t) {
            return (n)=>{
                if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
                    let r = "<p>An error occurred:</p><pre>" + w(n.message + "", !0) + "</pre>";
                    return t ? Promise.resolve(r) : r;
                }
                if (t) return Promise.reject(n);
                throw n;
            };
        }
    };
    var L = new A;
    function d(a, e) {
        return L.parse(a, e);
    }
    d.options = d.setOptions = function(a) {
        return L.setOptions(a), d.defaults = L.defaults, N(d.defaults), d;
    };
    d.getDefaults = _;
    d.defaults = O;
    d.use = function(...a) {
        return L.use(...a), d.defaults = L.defaults, N(d.defaults), d;
    };
    d.walkTokens = function(a, e) {
        return L.walkTokens(a, e);
    };
    d.parseInline = L.parseInline;
    d.Parser = b;
    d.parser = b.parse;
    d.Renderer = P;
    d.TextRenderer = S;
    d.Lexer = x;
    d.lexer = x.lex;
    d.Tokenizer = y;
    d.Hooks = $;
    d.parse = d;
    var it = d.options, ot = d.setOptions, at = d.use, lt = d.walkTokens, ut = d.parseInline, pt = d, ct = b.parse, ht = x.lex;
    if (__exports != exports) module1.exports = exports;
    return module1.exports;
});

},{}],"iTYG6":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _commentsJs = require("../../utils/comments.js");
var _pragmaticDragAndDropReactBeautifulDndMigration = require("@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration");
var _dragHandleIconJsx = require("../icons/DragHandleIcon.jsx");
var _dragHandleIconJsxDefault = parcelHelpers.interopDefault(_dragHandleIconJsx);
const { useState, useEffect, useRef, memo } = wp.element;
const { useSelect } = wp.data;
const { Button, BaseControl, CheckboxControl, TextControl } = wp.components;
const Checklist = memo(({ issueId, initialChecklistItems, isSaving, setIsSaving })=>{
    const [checklistItems, setChecklistItems] = useState(initialChecklistItems || []);
    const [activeIndex, setActiveIndex] = useState(null);
    const checklistContainerRef = useRef(null);
    const prevChecklistLength = useRef(checklistItems.length);
    const originalLabelRef = useRef(null);
    const { currentUser } = useSelect((select)=>({
            currentUser: select("core").getCurrentUser()
        }));
    const saveChecklist = (items)=>{
        setIsSaving(true);
        wp.apiFetch({
            path: `/issue/v1/checklist/${issueId}`,
            method: "POST",
            data: items
        }).finally(()=>setIsSaving(false));
    };
    const addChecklistItem = ()=>{
        const newItem = {
            id: Date.now(),
            label: "",
            checked: 0
        };
        setChecklistItems((prevItems)=>[
                ...prevItems,
                newItem
            ]);
    };
    const updateChecklistItemLabel = (index, newLabel)=>{
        const newItems = [
            ...checklistItems
        ];
        newItems[index].label = newLabel;
        setChecklistItems(newItems);
    };
    const toggleChecklistItem = (index)=>{
        const newItems = [
            ...checklistItems
        ];
        const currentItem = newItems[index];
        const isBeingChecked = currentItem.checked === 0;
        currentItem.checked = isBeingChecked ? currentUser.id : 0;
        setChecklistItems(newItems);
        saveChecklist(newItems);
        if (isBeingChecked) wp.hooks.doAction("alpaca.checklistItemChecked", issueId, currentItem, currentUser);
    };
    const deleteChecklistItem = (index)=>{
        const newItems = checklistItems.filter((_, i)=>i !== index);
        setChecklistItems(newItems);
        saveChecklist(newItems);
    };
    const handleDragEnd = (result)=>{
        const { destination, source } = result;
        if (!destination || destination.index === source.index) return;
        const newItems = Array.from(checklistItems);
        const [reorderedItem] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, reorderedItem);
        setChecklistItems(newItems);
        saveChecklist(newItems);
    };
    const handleChecklistItemKeyDown = (e, index)=>{
        if (e.key === "Enter") {
            e.preventDefault();
            addChecklistItem();
        }
    };
    const handleChecklistItemBlur = (index, oldLabel)=>{
        setActiveIndex(null);
        const item = checklistItems[index];
        const newLabel = item.label;
        if (newLabel.trim() === "") {
            const newItems = checklistItems.filter((_, i)=>i !== index);
            setChecklistItems(newItems);
            saveChecklist(newItems);
        } else {
            if (oldLabel !== newLabel) wp.hooks.doAction("alpaca.checklistItemUpdated", oldLabel, newLabel);
            saveChecklist(checklistItems);
        }
    };
    useEffect(()=>{
        if (checklistItems.length > prevChecklistLength.current) {
            if (checklistContainerRef.current) {
                const textInputs = checklistContainerRef.current.querySelectorAll(".components-text-control__input");
                if (textInputs.length > 0) {
                    const lastInput = textInputs[textInputs.length - 1];
                    if (lastInput) lastInput.focus();
                }
            }
        }
        prevChecklistLength.current = checklistItems.length;
    }, [
        checklistItems.length
    ]);
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-checklist-container",
        ref: checklistContainerRef,
        __source: {
            fileName: "src/components/issue/checklist.jsx",
            lineNumber: 128,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(BaseControl, {
        label: "Checklist",
        className: "alpaca-checklist-label",
        __source: {
            fileName: "src/components/issue/checklist.jsx",
            lineNumber: 129,
            columnNumber: 9
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement((0, _pragmaticDragAndDropReactBeautifulDndMigration.DragDropContext), {
        onDragEnd: handleDragEnd,
        __source: {
            fileName: "src/components/issue/checklist.jsx",
            lineNumber: 130,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _pragmaticDragAndDropReactBeautifulDndMigration.Droppable), {
        droppableId: "checklist",
        renderClone: (provided, snapshot, rubric)=>{
            const item = checklistItems[rubric.source.index];
            const index = rubric.source.index;
            return /*#__PURE__*/ React.createElement("div", {
                ref: provided.innerRef,
                ...provided.draggableProps,
                ...provided.dragHandleProps,
                className: `alpaca-checklist-item ${item.checked !== 0 ? "checked" : ""} alpaca-checklist-item--dragging`,
                style: {
                    ...provided.draggableProps.style,
                    left: 0,
                    // width: "100%",
                    boxSizing: "border-box"
                },
                __source: {
                    fileName: "src/components/issue/checklist.jsx",
                    lineNumber: 137,
                    columnNumber: 17
                }
            }, /*#__PURE__*/ React.createElement(CheckboxControl, {
                checked: item.checked !== 0,
                onChange: ()=>toggleChecklistItem(index),
                __source: {
                    fileName: "src/components/issue/checklist.jsx",
                    lineNumber: 151,
                    columnNumber: 19
                }
            }), /*#__PURE__*/ React.createElement(TextControl, {
                className: "alpaca-textinput",
                value: item.label,
                onChange: (newLabel)=>updateChecklistItemLabel(index, newLabel),
                onFocus: ()=>{
                    setActiveIndex(index);
                    originalLabelRef.current = item.label;
                },
                onBlur: ()=>handleChecklistItemBlur(index, originalLabelRef.current),
                placeholder: "Add an item...",
                __source: {
                    fileName: "src/components/issue/checklist.jsx",
                    lineNumber: 155,
                    columnNumber: 19
                }
            }), /*#__PURE__*/ React.createElement("div", {
                className: "alpaca-checklist-controls",
                __source: {
                    fileName: "src/components/issue/checklist.jsx",
                    lineNumber: 170,
                    columnNumber: 19
                }
            }, /*#__PURE__*/ React.createElement(Button, {
                icon: "trash",
                onClick: ()=>deleteChecklistItem(index),
                label: "Delete item",
                showTooltip: "true",
                __source: {
                    fileName: "src/components/issue/checklist.jsx",
                    lineNumber: 171,
                    columnNumber: 21
                }
            }), /*#__PURE__*/ React.createElement("div", {
                className: "alpaca-drag-handle",
                __source: {
                    fileName: "src/components/issue/checklist.jsx",
                    lineNumber: 177,
                    columnNumber: 21
                }
            }, /*#__PURE__*/ React.createElement((0, _dragHandleIconJsxDefault.default), {
                __source: {
                    fileName: "src/components/issue/checklist.jsx",
                    lineNumber: 178,
                    columnNumber: 23
                }
            }))));
        },
        __source: {
            fileName: "src/components/issue/checklist.jsx",
            lineNumber: 131,
            columnNumber: 11
        },
        __self: undefined
    }, (provided)=>/*#__PURE__*/ React.createElement("div", {
            className: "alpaca-checklist",
            ...provided.droppableProps,
            ref: provided.innerRef,
            __source: {
                fileName: "src/components/issue/checklist.jsx",
                lineNumber: 186,
                columnNumber: 15
            },
            __self: undefined
        }, checklistItems.map((item, index)=>/*#__PURE__*/ React.createElement((0, _pragmaticDragAndDropReactBeautifulDndMigration.Draggable), {
                key: item.id,
                draggableId: item.id.toString(),
                index: index,
                __source: {
                    fileName: "src/components/issue/checklist.jsx",
                    lineNumber: 192,
                    columnNumber: 19
                },
                __self: undefined
            }, (provided)=>/*#__PURE__*/ React.createElement("div", {
                    ref: provided.innerRef,
                    ...provided.draggableProps,
                    ...provided.dragHandleProps,
                    className: `alpaca-checklist-item ${item.checked !== 0 ? "checked" : ""} ${activeIndex === index ? "active" : ""}`,
                    __source: {
                        fileName: "src/components/issue/checklist.jsx",
                        lineNumber: 198,
                        columnNumber: 23
                    },
                    __self: undefined
                }, /*#__PURE__*/ React.createElement(CheckboxControl, {
                    checked: item.checked !== 0,
                    onChange: ()=>toggleChecklistItem(index),
                    __source: {
                        fileName: "src/components/issue/checklist.jsx",
                        lineNumber: 206,
                        columnNumber: 25
                    },
                    __self: undefined
                }), /*#__PURE__*/ React.createElement(TextControl, {
                    className: "alpaca-textinput",
                    value: item.label,
                    onChange: (newLabel)=>updateChecklistItemLabel(index, newLabel),
                    onFocus: ()=>{
                        setActiveIndex(index);
                        originalLabelRef.current = item.label;
                    },
                    onBlur: ()=>handleChecklistItemBlur(index, originalLabelRef.current),
                    onKeyDown: (e)=>handleChecklistItemKeyDown(e, index),
                    placeholder: "Add an item...",
                    __source: {
                        fileName: "src/components/issue/checklist.jsx",
                        lineNumber: 210,
                        columnNumber: 25
                    },
                    __self: undefined
                }), /*#__PURE__*/ React.createElement("div", {
                    className: "alpaca-checklist-controls",
                    __source: {
                        fileName: "src/components/issue/checklist.jsx",
                        lineNumber: 231,
                        columnNumber: 25
                    },
                    __self: undefined
                }, /*#__PURE__*/ React.createElement(Button, {
                    icon: "trash",
                    onClick: ()=>deleteChecklistItem(index),
                    label: "Delete item",
                    showTooltip: "true",
                    __source: {
                        fileName: "src/components/issue/checklist.jsx",
                        lineNumber: 232,
                        columnNumber: 27
                    },
                    __self: undefined
                }), /*#__PURE__*/ React.createElement("div", {
                    className: "alpaca-drag-handle",
                    __source: {
                        fileName: "src/components/issue/checklist.jsx",
                        lineNumber: 238,
                        columnNumber: 27
                    },
                    __self: undefined
                }, /*#__PURE__*/ React.createElement((0, _dragHandleIconJsxDefault.default), {
                    __source: {
                        fileName: "src/components/issue/checklist.jsx",
                        lineNumber: 239,
                        columnNumber: 29
                    },
                    __self: undefined
                })))))), provided.placeholder))), /*#__PURE__*/ React.createElement(Button, {
        variant: "secondary",
        icon: "plus",
        iconPosition: "left",
        onClick: addChecklistItem,
        __source: {
            fileName: "src/components/issue/checklist.jsx",
            lineNumber: 251,
            columnNumber: 9
        },
        __self: undefined
    }, "Add Checklist Item"));
});
exports.default = Checklist;

},{"../../utils/comments.js":"hPhNI","@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration":"iD7mF","../icons/DragHandleIcon.jsx":"lhUj1","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"hPhNI":[function(require,module,exports,__globalThis) {
/**
 * Generates HTML for an assignee span to be used in comments.
 * @param {object} user The user object for the assignee.
 * @returns {string} HTML string.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "generateAssigneeSpan", ()=>generateAssigneeSpan);
const generateAssigneeSpan = (user)=>{
    if (!user) return "";
    const avatarAttr = user.avatar ? ` data-avatar="${user.avatar}"` : "";
    return `<span class="alpaca-status-assignee" data-userid="${user.id}"${avatarAttr}>${user.name}</span>`;
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"kaOzJ":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getTabsConfig", ()=>getTabsConfig);
const getTabsConfig = (issueDetails)=>{
    return [
        {
            name: "comments",
            title: "Timeline",
            className: "comments"
        },
        {
            name: "report",
            title: "Report",
            className: "report"
        },
        ...issueDetails?.meta?.queriedObject && issueDetails.meta.queriedObject !== "null" ? [
            {
                name: "queriedobject",
                title: "Queried Object",
                className: "queried-object"
            }
        ] : [],
        ...issueDetails?.meta?.headers && issueDetails.meta.headers !== "null" ? [
            {
                name: "headers",
                title: "Headers",
                className: "headers"
            }
        ] : []
    ];
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"5IBQX":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _issueApi = require("../services/issueApi"); // Assuming this will be created
const { useState, useEffect, useCallback } = wp.element;
const useIssueData = (issueId, isOpen)=>{
    const [issueDetails, setIssueDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState(null);
    useEffect(()=>{
        if (issueId && isOpen) {
            setIsLoadingDetails(true);
            setError(null);
            (0, _issueApi.fetchIssue)(issueId).then((issueData)=>{
                setIssueDetails(issueData);
            }).catch((err)=>{
                console.error("Error fetching issue data:", err);
                setError("Failed to load issue details. Please try again.");
                setIssueDetails(null);
            }).finally(()=>{
                setIsLoadingDetails(false);
            });
        }
    }, [
        issueId,
        isOpen
    ]);
    const refetchData = useCallback(()=>{
        if (issueId && isOpen) {
            setIsLoadingDetails(true);
            setError(null);
            (0, _issueApi.fetchIssue)(issueId).then(setIssueDetails).catch((err)=>{
                console.error("Error refetching issue data:", err);
                setError("Failed to load issue details. Please try again.");
            }).finally(()=>setIsLoadingDetails(false));
        }
    }, [
        issueId,
        isOpen
    ]);
    return {
        issueDetails,
        setIssueDetails,
        isLoadingDetails,
        error,
        refetchData
    };
};
exports.default = useIssueData;

},{"../services/issueApi":"bebt9","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"7BGvE":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _issueApi = require("../services/issueApi"); // Assuming this will be created
const { useState, useEffect } = wp.element;
const useUserManagement = ()=>{
    const [allUsers, setAllUsers] = useState([]);
    const [allUserObjects, setAllUserObjects] = useState([]);
    const [userMap, setUserMap] = useState({});
    useEffect(()=>{
        (0, _issueApi.fetchUsers)().then((users)=>{
            const usersWithAvatar = users.map((u)=>({
                    ...u,
                    avatar: u.avatar_urls?.["48"] || u.avatar_urls?.["96"] || u.avatar_urls?.["24"] || ""
                }));
            const localUserMap = {};
            usersWithAvatar.forEach((u)=>{
                localUserMap[u.name] = u.slug;
                localUserMap[u.slug] = u.slug;
            });
            setUserMap(localUserMap);
            setAllUsers(usersWithAvatar.map((u)=>u.name));
            setAllUserObjects(usersWithAvatar);
        }).catch((err)=>{
            console.error("Error fetching users:", err);
        });
    }, []);
    return {
        allUsers,
        allUserObjects,
        userMap
    };
};
exports.default = useUserManagement;

},{"../services/issueApi":"bebt9","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"haQEY":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const { useState, useCallback } = wp.element;
const useLoadingStates = ()=>{
    const [loadingStates, setLoadingStates] = useState({
        assignees: false,
        deadline: false,
        screenshot: false,
        title: false
    });
    const setLoading = useCallback((key, value)=>{
        setLoadingStates((prev)=>({
                ...prev,
                [key]: value
            }));
    }, []);
    return {
        loadingStates,
        setLoading
    };
};
exports.default = useLoadingStates;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"9o8NF":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "processAssigneeChanges", ()=>processAssigneeChanges);
parcelHelpers.export(exports, "createAssigneeComments", ()=>createAssigneeComments);
const processAssigneeChanges = (oldAssignees, newAssignees)=>{
    const added = newAssignees.filter((name)=>!oldAssignees.includes(name));
    const removed = oldAssignees.filter((name)=>!newAssignees.includes(name));
    return {
        added,
        removed
    };
};
const createAssigneeComments = async (added, removed, allUserObjects, createComment, generateComment, issueId)=>{
    const commentPromises = [];
    added.forEach((name)=>{
        const user = allUserObjects.find((u)=>u.name === name);
        if (user) commentPromises.push(createComment(issueId, generateComment(user, true)));
    });
    removed.forEach((name)=>{
        const user = allUserObjects.find((u)=>u.name === name);
        if (user) commentPromises.push(createComment(issueId, generateComment(user, false)));
    });
    if (commentPromises.length > 0) return Promise.all(commentPromises);
    return Promise.resolve();
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"h8W9N":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "parseChecklist", ()=>parseChecklist);
const parseChecklist = (metaChecklist)=>{
    if (!metaChecklist) return [];
    try {
        return typeof metaChecklist === "string" ? JSON.parse(metaChecklist) : Array.isArray(metaChecklist) ? metaChecklist : [];
    } catch  {
        return [];
    }
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"lBLYZ":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const { FormTokenField } = wp.components;
const { memo } = wp.element;
const AssigneeSelector = memo(({ assignees, allUsers, onChange, isLoading })=>/*#__PURE__*/ React.createElement(FormTokenField, {
        label: "Assigned To",
        placeholder: "Nobody",
        value: assignees,
        suggestions: allUsers,
        onChange: onChange,
        disabled: isLoading,
        __source: {
            fileName: "src/components/issue/AssigneeSelector.jsx",
            lineNumber: 6,
            columnNumber: 5
        },
        __self: undefined
    }));
exports.default = AssigneeSelector;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"63IRX":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const { useState, useRef, memo } = wp.element;
const { BaseControl, Popover, DatePicker, Button } = wp.components;
const { date } = wp;
const datesettings = wp.date.getSettings();
const DeadlineControl = memo(({ deadline, onChange, onClear, isLoading })=>{
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const calendarButtonRef = useRef();
    return /*#__PURE__*/ React.createElement(BaseControl, {
        label: "Deadline",
        className: "alpaca-deadline-control",
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 12,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-deadline",
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 13,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-deadline-date",
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 14,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("input", {
        readOnly: true,
        type: "text",
        value: deadline ? date.format(datesettings.formats.date, deadline) : "No deadline set.",
        onClick: ()=>setIsEditingDeadline((prev)=>!prev),
        ref: calendarButtonRef,
        disabled: isLoading,
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 15,
            columnNumber: 11
        },
        __self: undefined
    })), isEditingDeadline && /*#__PURE__*/ React.createElement(Popover, {
        placement: "bottom-start",
        onClose: ()=>setIsEditingDeadline(false),
        anchor: calendarButtonRef.current,
        focusOnMount: false,
        className: "alpaca-deadline-popover",
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 30,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(DatePicker, {
        current: deadline,
        onChange: (newDate)=>{
            onChange(newDate);
            setIsEditingDeadline(false);
        },
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 37,
            columnNumber: 13
        },
        __self: undefined
    })), deadline && /*#__PURE__*/ React.createElement(Button, {
        icon: "trash",
        label: "Clear deadline",
        onClick: onClear,
        disabled: isLoading,
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 48,
            columnNumber: 11
        },
        __self: undefined
    })));
});
exports.default = DeadlineControl;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"jh4NY":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const { memo } = wp.element;
const JsonTable = memo(({ data })=>{
    if (!data) return null;
    let parsedData;
    try {
        parsedData = JSON.parse(data);
    } catch (e) {
        return /*#__PURE__*/ React.createElement("p", {
            __source: {
                fileName: "src/components/issue/JsonTable.jsx",
                lineNumber: 10,
                columnNumber: 12
            },
            __self: undefined
        }, "Error parsing JSON data");
    }
    return /*#__PURE__*/ React.createElement("table", {
        className: "alpaca-json-table widefat striped",
        style: {
            borderCollapse: "collapse",
            width: "100%"
        },
        __source: {
            fileName: "src/components/issue/JsonTable.jsx",
            lineNumber: 14,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tbody", {
        __source: {
            fileName: "src/components/issue/JsonTable.jsx",
            lineNumber: 18,
            columnNumber: 7
        },
        __self: undefined
    }, Object.entries(parsedData).map(([key, value])=>/*#__PURE__*/ React.createElement("tr", {
            key: key,
            __source: {
                fileName: "src/components/issue/JsonTable.jsx",
                lineNumber: 20,
                columnNumber: 11
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("th", {
            __source: {
                fileName: "src/components/issue/JsonTable.jsx",
                lineNumber: 21,
                columnNumber: 13
            },
            __self: undefined
        }, key), /*#__PURE__*/ React.createElement("td", {
            __source: {
                fileName: "src/components/issue/JsonTable.jsx",
                lineNumber: 22,
                columnNumber: 13
            },
            __self: undefined
        }, String(value))))));
});
exports.default = JsonTable;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"f6zxb":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const { memo } = wp.element;
const { Button } = wp.components;
const { date } = wp;
const datesettings = wp.date.getSettings();
const ReportTab = memo(({ issueDetails, onScreenshotDelete, isLoading, onScreenshotClick })=>/*#__PURE__*/ React.createElement("div", {
        className: "alpaca-report-tab",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 9,
            columnNumber: 5
        },
        __self: undefined
    }, issueDetails.meta.screenshot && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-screenshot-wrapper",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 11,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("img", {
        src: issueDetails.meta.screenshot,
        className: "alpaca-screenshot",
        alt: "Screenshot",
        style: {
            cursor: "zoom-in",
            maxWidth: "100%"
        },
        onClick: ()=>onScreenshotClick(issueDetails.meta.screenshot),
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 12,
            columnNumber: 11
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        disabled: isLoading,
        onClick: onScreenshotDelete,
        label: "Delete",
        showTooltip: "true",
        tooltipPosition: "middle left",
        icon: "trash",
        isDestructive: true,
        className: "alpaca-screenshot-delete",
        variant: "primary",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 19,
            columnNumber: 11
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("table", {
        className: "widefat striped",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 33,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tbody", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 34,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 35,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 36,
            columnNumber: 13
        },
        __self: undefined
    }, "Reported"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 37,
            columnNumber: 13
        },
        __self: undefined
    }, date.format(datesettings.formats.datetimeAbbreviated, new Date(issueDetails.post_data.post_date)))), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 44,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 45,
            columnNumber: 13
        },
        __self: undefined
    }, "Last edit"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 46,
            columnNumber: 13
        },
        __self: undefined
    }, date.format(datesettings.formats.datetimeAbbreviated, new Date(issueDetails.post_data.post_modified)))), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 53,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 54,
            columnNumber: 13
        },
        __self: undefined
    }, "URL"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 55,
            columnNumber: 13
        },
        __self: undefined
    }, issueDetails.meta.URL ? /*#__PURE__*/ React.createElement("a", {
        href: issueDetails.meta.URL,
        target: "_blank",
        rel: "noopener noreferrer",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 57,
            columnNumber: 17
        },
        __self: undefined
    }, issueDetails.meta.URL) : "N/A")), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 69,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 70,
            columnNumber: 13
        },
        __self: undefined
    }, "Screen"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 71,
            columnNumber: 13
        },
        __self: undefined
    }, issueDetails.meta.screenwidth && issueDetails.meta.screenheight ? `${issueDetails.meta.screenwidth} x ${issueDetails.meta.screenheight}` : "N/A")), Object.entries(issueDetails.taxonomies).filter(([taxonomy])=>taxonomy !== "assignee").map(([taxonomy, terms])=>/*#__PURE__*/ React.createElement("tr", {
            key: taxonomy,
            __source: {
                fileName: "src/components/issue/ReportTab.jsx",
                lineNumber: 80,
                columnNumber: 15
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("th", {
            style: {
                textTransform: "capitalize"
            },
            __source: {
                fileName: "src/components/issue/ReportTab.jsx",
                lineNumber: 81,
                columnNumber: 17
            },
            __self: undefined
        }, taxonomy), /*#__PURE__*/ React.createElement("td", {
            __source: {
                fileName: "src/components/issue/ReportTab.jsx",
                lineNumber: 82,
                columnNumber: 17
            },
            __self: undefined
        }, terms.map((term)=>term.name).join(", "))))))));
exports.default = ReportTab;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"14ymM":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _commentingJsx = require("../commenting.jsx");
var _commentingJsxDefault = parcelHelpers.interopDefault(_commentingJsx);
var _jsonTable = require("./JsonTable");
var _jsonTableDefault = parcelHelpers.interopDefault(_jsonTable);
var _reportTab = require("./ReportTab");
var _reportTabDefault = parcelHelpers.interopDefault(_reportTab);
const { memo } = wp.element;
const TabContent = memo(({ tab, issueDetails, issueId, commentRefreshKey, onScreenshotDelete, loadingStates, onScreenshotClick })=>{
    switch(tab.name){
        case "comments":
            return /*#__PURE__*/ React.createElement((0, _commentingJsxDefault.default), {
                issueId: issueId,
                commentRefreshKey: commentRefreshKey,
                __source: {
                    fileName: "src/components/issue/TabContent.jsx",
                    lineNumber: 19,
                    columnNumber: 11
                },
                __self: undefined
            });
        case "report":
            return /*#__PURE__*/ React.createElement((0, _reportTabDefault.default), {
                issueDetails: issueDetails,
                onScreenshotDelete: onScreenshotDelete,
                isLoading: loadingStates.screenshot,
                onScreenshotClick: onScreenshotClick,
                __source: {
                    fileName: "src/components/issue/TabContent.jsx",
                    lineNumber: 26,
                    columnNumber: 11
                },
                __self: undefined
            });
        case "queriedobject":
            return /*#__PURE__*/ React.createElement((0, _jsonTableDefault.default), {
                data: issueDetails.meta.queriedObject,
                __source: {
                    fileName: "src/components/issue/TabContent.jsx",
                    lineNumber: 34,
                    columnNumber: 16
                },
                __self: undefined
            });
        case "headers":
            return /*#__PURE__*/ React.createElement((0, _jsonTableDefault.default), {
                data: issueDetails.meta.headers,
                __source: {
                    fileName: "src/components/issue/TabContent.jsx",
                    lineNumber: 36,
                    columnNumber: 16
                },
                __self: undefined
            });
        default:
            return null;
    }
});
exports.default = TabContent;

},{"../commenting.jsx":"321JG","./JsonTable":"jh4NY","./ReportTab":"f6zxb","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"krnYi":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _reactDom = require("react-dom");
const { useEffect, memo } = wp.element;
const Lightbox = memo(({ src, onClose })=>{
    useEffect(()=>{
        const handleKeyDown = (e)=>{
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return ()=>document.removeEventListener("keydown", handleKeyDown);
    }, [
        onClose
    ]);
    return /*#__PURE__*/ (0, _reactDom.createPortal)(/*#__PURE__*/ React.createElement("div", {
        style: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999999999999
        },
        onClick: onClose,
        __source: {
            fileName: "src/components/issue/Lightbox.jsx",
            lineNumber: 14,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("img", {
        src: src,
        alt: "Enlarged screenshot",
        style: {
            maxWidth: "90%",
            maxHeight: "90%",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)"
        },
        __source: {
            fileName: "src/components/issue/Lightbox.jsx",
            lineNumber: 29,
            columnNumber: 7
        },
        __self: undefined
    })), document.body);
});
exports.default = Lightbox;

},{"react-dom":"fc7O8","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"2yEr4":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _watchlistContext = require("../context/WatchlistContext");
var _user = require("./User");
var _userDefault = parcelHelpers.interopDefault(_user);
const { forwardRef } = wp.element;
const { date } = wp;
const datesettings = wp.date.getSettings();
const Item = forwardRef(({ id, content, assignees = [], comment_count, meta, className, style, onClick, ...props }, ref)=>{
    const { isWatched, toggleWatch } = (0, _watchlistContext.useWatchlist)();
    const watched = isWatched(id);
    const assigneeDataAttributes = assignees.reduce((acc, assignee)=>{
        if (assignee && assignee.id) acc[`data-assignee-${assignee.id}`] = "";
        return acc;
    }, {});
    const watchedClass = watched ? "is-watched item-highlight" : "";
    const deadline = meta && meta.deadline && meta.deadline[0] ? new Date(meta.deadline[0]) : null;
    const isValidDeadline = deadline && !isNaN(deadline);
    const deadlineFormatted = new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric"
    }).format(deadline);
    let diffDays = null;
    if (isValidDeadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadline.setHours(0, 0, 0, 0);
        diffDays = Math.ceil((deadline - today) / 86400000);
    }
    const lateClass = diffDays < 0 ? "is-late" : "";
    return /*#__PURE__*/ React.createElement("div", {
        ref: ref,
        className: `${className} ${watchedClass} ${lateClass}`.trim(),
        style: style,
        "data-id": id,
        "data-days-left": diffDays,
        ...assigneeDataAttributes,
        ...props,
        onClick: onClick,
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 57,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-upper",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 67,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-content",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 68,
            columnNumber: 11
        },
        __self: undefined
    }, content), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-controls",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 69,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "dashicons dashicons-star-filled",
        onClick: (e)=>{
            e.stopPropagation();
            toggleWatch(id);
        },
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 70,
            columnNumber: 13
        },
        __self: undefined
    }))), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-meta",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 79,
            columnNumber: 9
        },
        __self: undefined
    }, assignees.length > 0 && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-assignees",
        "data-assignees": assignees.length,
        title: assignees.length === 1 ? assignees[0].display_name || assignees[0].name : assignees.map((a)=>a.display_name || a.name).join(", "),
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 81,
            columnNumber: 13
        },
        __self: undefined
    }, assignees.map((assignee)=>/*#__PURE__*/ React.createElement((0, _userDefault.default), {
            key: assignee.id,
            user: assignee,
            __source: {
                fileName: "src/components/Item.jsx",
                lineNumber: 91,
                columnNumber: 17
            },
            __self: undefined
        }))), typeof comment_count !== "undefined" && comment_count > 0 && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-comment-count has-dashicon",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 97,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("span", {
        className: "dashicons dashicons-admin-comments",
        "aria-hidden": "true",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 98,
            columnNumber: 15
        },
        __self: undefined
    }), comment_count), isValidDeadline && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-deadline",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 107,
            columnNumber: 13
        },
        __self: undefined
    }, diffDays > 0 ? deadlineFormatted : diffDays === 0 ? "Today" : diffDays === 1 ? "Tomorrow" : diffDays === -1 ? "Yesterday" : deadlineFormatted)));
});
exports.default = Item;

},{"../context/WatchlistContext":"WrED9","./User":"enwL1","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"QNfzH":[function(require,module,exports,__globalThis) {
var $parcel$ReactRefreshHelpers$2ee0 = require("@parcel/transformer-react-refresh-wrap/lib/helpers/helpers.js");
$parcel$ReactRefreshHelpers$2ee0.init();
var prevRefreshReg = globalThis.$RefreshReg$;
var prevRefreshSig = globalThis.$RefreshSig$;
$parcel$ReactRefreshHelpers$2ee0.prelude(module);

try {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _react = require("react");
var _pragmaticDragAndDropReactBeautifulDndMigration = require("@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration");
var _draggableItem = require("./DraggableItem");
var _draggableItemDefault = parcelHelpers.interopDefault(_draggableItem);
const { DropdownMenu, TextControl } = wp.components;
/**
 * Container component (delegates rename to parent via onRename).
 */ function Container({ id, title, items, onItemClick, onMoveAllToNext, onDeleteAll, isLastContainer, isHidden, onToggleHidden, onRename }) {
    const [isRenaming, setIsRenaming] = (0, _react.useState)(false);
    const [newTitle, setNewTitle] = (0, _react.useState)(title);
    const inputRef = (0, _react.useRef)(null);
    const hasItems = items.length > 0;
    // keep local input in sync if parent updates title
    (0, _react.useEffect)(()=>{
        setNewTitle(title);
    }, [
        title
    ]);
    // auto-select when input appears
    (0, _react.useEffect)(()=>{
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [
        isRenaming
    ]);
    const toggleHidden = ()=>{
        onToggleHidden(id);
    };
    const handleRename = ()=>{
        setIsRenaming(false);
        if (newTitle.trim() !== "" && newTitle !== title) {
            if (typeof onRename === "function") onRename(id, newTitle); // delegate to parent
            else console.warn("Container: onRename prop is missing or not a function. Rename not applied.");
        } else setNewTitle(title); // reset if unchanged or empty
    };
    const handleCancelRename = ()=>{
        setIsRenaming(false);
        setNewTitle(title); // reset to original
    };
    const handleKeyDown = (event)=>{
        if (event.key === "Enter") {
            event.preventDefault();
            handleRename();
        } else if (event.key === "Escape") {
            event.preventDefault();
            handleCancelRename();
        }
    };
    const menuControls = [
        {
            icon: "edit",
            title: "Rename",
            onClick: ()=>{
                setNewTitle(title); // ensure starting from current prop
                setIsRenaming(true);
            }
        },
        {
            icon: isHidden ? "visibility" : "hidden",
            title: isHidden ? "Expand Column" : "Collapse Column",
            onClick: toggleHidden
        }
    ];
    if (!isLastContainer) menuControls.push({
        icon: "arrow-right-alt",
        title: "Move All To Next Column",
        onClick: ()=>onMoveAllToNext(id),
        disabled: !hasItems
    });
    if (isLastContainer) menuControls.push({
        icon: "trash",
        title: "Delete All",
        onClick: ()=>onDeleteAll(id)
    });
    return /*#__PURE__*/ React.createElement("div", {
        className: `alpaca-container ${isHidden ? "hidden" : ""}`,
        "data-id": id,
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 107,
            columnNumber: 5
        },
        __self: this
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-container-header",
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 111,
            columnNumber: 7
        },
        __self: this
    }, isRenaming ? /*#__PURE__*/ React.createElement(TextControl, {
        className: "alpaca-container-title-input",
        value: newTitle,
        onChange: setNewTitle,
        onBlur: handleRename,
        onKeyDown: handleKeyDown,
        ref: inputRef,
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 113,
            columnNumber: 11
        },
        __self: this
    }) : /*#__PURE__*/ React.createElement("h2", {
        className: "alpaca-container-title",
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 122,
            columnNumber: 11
        },
        __self: this
    }, title, " ", /*#__PURE__*/ React.createElement("span", {
        className: "alpaca-item-count",
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 123,
            columnNumber: 21
        },
        __self: this
    }, items.length)), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-container-controls",
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 126,
            columnNumber: 9
        },
        __self: this
    }, /*#__PURE__*/ React.createElement(DropdownMenu, {
        icon: "menu",
        label: "Options",
        controls: menuControls,
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 127,
            columnNumber: 11
        },
        __self: this
    }))), /*#__PURE__*/ React.createElement((0, _pragmaticDragAndDropReactBeautifulDndMigration.Droppable), {
        droppableId: id,
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 130,
            columnNumber: 7
        },
        __self: this
    }, (provided, snapshot)=>/*#__PURE__*/ React.createElement("div", {
            ref: provided.innerRef,
            ...provided.droppableProps,
            className: `alpaca-items ${snapshot.isDraggingOver ? "dragging-over" : ""}`,
            __source: {
                fileName: "src/components/Container.jsx",
                lineNumber: 132,
                columnNumber: 11
            },
            __self: this
        }, hasItems ? items.map((item, index)=>/*#__PURE__*/ React.createElement((0, _draggableItemDefault.default), {
                className: "alpaca-item",
                key: item.id,
                id: item.id,
                index: index,
                content: item.content,
                assignees: item.assignees,
                comment_count: item.comment_count,
                meta: item.meta,
                onClick: onItemClick,
                __source: {
                    fileName: "src/components/Container.jsx",
                    lineNumber: 141,
                    columnNumber: 17
                },
                __self: this
            })) : /*#__PURE__*/ React.createElement("div", {
            className: "alpaca-item empty",
            __source: {
                fileName: "src/components/Container.jsx",
                lineNumber: 154,
                columnNumber: 15
            },
            __self: this
        }, "Drop items here"), provided.placeholder)));
}
exports.default = Container;

  $parcel$ReactRefreshHelpers$2ee0.postlude(module);
} finally {
  globalThis.$RefreshReg$ = prevRefreshReg;
  globalThis.$RefreshSig$ = prevRefreshSig;
}
},{"react":"f39IF","@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration":"iD7mF","./DraggableItem":"1yzcB","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","@parcel/transformer-react-refresh-wrap/lib/helpers/helpers.js":"km3Ru"}],"1yzcB":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _pragmaticDragAndDropReactBeautifulDndMigration = require("@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration");
var _item = require("./Item");
var _itemDefault = parcelHelpers.interopDefault(_item);
/**
 * Draggable item wrapper.
 */ function DraggableItem({ id, index, content, className, isDragDisabled = false, onClick, assignees = [], comment_count, meta }) {
    const handleClick = (event)=>{
        if (onClick) onClick(event, id);
    };
    return /*#__PURE__*/ React.createElement((0, _pragmaticDragAndDropReactBeautifulDndMigration.Draggable), {
        draggableId: id,
        index: index,
        isDragDisabled: isDragDisabled,
        __source: {
            fileName: "src/components/DraggableItem.jsx",
            lineNumber: 25,
            columnNumber: 5
        },
        __self: this
    }, (provided, snapshot)=>{
        const combinedStyle = {
            ...provided.draggableProps.style,
            ...snapshot.isDragging ? {
                opacity: 0.5
            } : {}
        };
        return /*#__PURE__*/ React.createElement((0, _itemDefault.default), {
            ref: provided.innerRef,
            ...provided.draggableProps,
            ...provided.dragHandleProps,
            id: id,
            content: content,
            assignees: assignees,
            comment_count: comment_count,
            meta: meta,
            className: `${className} ${snapshot.isDragging ? "dragging" : ""}`,
            onClick: handleClick,
            style: combinedStyle,
            __source: {
                fileName: "src/components/DraggableItem.jsx",
                lineNumber: 33,
                columnNumber: 11
            },
            __self: this
        });
    });
}
exports.default = DraggableItem;

},{"@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration":"iD7mF","./Item":"2yEr4","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"km3Ru":[function(require,module,exports,__globalThis) {
"use strict";
var Refresh = require("7422ead32dcc1e6b");
function debounce(func, delay) {
    {
        let timeout = undefined;
        let lastTime = 0;
        return function(args) {
            // Call immediately if last call was more than the delay ago.
            // Otherwise, set a timeout. This means the first call is fast
            // (for the common case of a single update), and subsequent updates
            // are batched.
            let now = Date.now();
            if (now - lastTime > delay) {
                lastTime = now;
                func.call(null, args);
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    timeout = undefined;
                    lastTime = Date.now();
                    func.call(null, args);
                }, delay);
            }
        };
    }
}
var enqueueUpdate = debounce(function() {
    Refresh.performReactRefresh();
}, 30);
module.exports.init = function() {
    if (!globalThis.$RefreshReg$) {
        Refresh.injectIntoGlobalHook(globalThis);
        globalThis.$RefreshReg$ = function() {};
        globalThis.$RefreshSig$ = function() {
            return function(type) {
                return type;
            };
        };
        if (typeof window !== 'undefined') {
            let ErrorOverlay = require("e4d875b7642f9496");
            ErrorOverlay.setEditorHandler(function(errorLocation) {
                let file = `${errorLocation.fileName}:${errorLocation.lineNumber || 1}:${errorLocation.colNumber || 1}`;
                fetch(module.bundle.devServer + `/__parcel_launch_editor?file=${encodeURIComponent(file)}`);
            });
            ErrorOverlay.startReportingRuntimeErrors({
                onError: function() {}
            });
            window.addEventListener('parcelhmraccept', ()=>{
                ErrorOverlay.dismissRuntimeErrors();
            });
        }
    }
};
// Everything below is either adapted or copied from
// https://github.com/facebook/metro/blob/61de16bd1edd7e738dd0311c89555a644023ab2d/packages/metro/src/lib/polyfills/require.js
// MIT License - Copyright (c) Facebook, Inc. and its affiliates.
module.exports.prelude = function(module1) {
    globalThis.$RefreshReg$ = function(type, id) {
        Refresh.register(type, module1.id + ' ' + id);
    };
    globalThis.$RefreshSig$ = Refresh.createSignatureFunctionForTransform;
};
module.exports.postlude = function(module1) {
    if (typeof window === 'undefined') return;
    if (isReactRefreshBoundary(module1.exports)) {
        registerExportsForReactRefresh(module1);
        if (module1.hot) {
            module1.hot.dispose(function(data) {
                if (Refresh.hasUnrecoverableErrors()) window.location.reload();
                data.prevExports = module1.exports;
            });
            module1.hot.accept(function(getParents) {
                var prevExports = module1.hot.data.prevExports;
                var nextExports = module1.exports;
                // Since we just executed the code for it, it's possible
                // that the new exports make it ineligible for being a boundary.
                var isNoLongerABoundary = !isReactRefreshBoundary(nextExports);
                // It can also become ineligible if its exports are incompatible
                // with the previous exports.
                // For example, if you add/remove/change exports, we'll want
                // to re-execute the importing modules, and force those components
                // to re-render. Similarly, if you convert a class component
                // to a function, we want to invalidate the boundary.
                var didInvalidate = shouldInvalidateReactRefreshBoundary(prevExports, nextExports);
                if (isNoLongerABoundary || didInvalidate) {
                    // We'll be conservative. The only case in which we won't do a full
                    // reload is if all parent modules are also refresh boundaries.
                    // In that case we'll add them to the current queue.
                    var parents = getParents();
                    if (parents.length === 0) {
                        // Looks like we bubbled to the root. Can't recover from that.
                        window.location.reload();
                        return;
                    }
                    return parents;
                }
                enqueueUpdate();
            });
        }
    }
};
function isReactRefreshBoundary(exports) {
    if (Refresh.isLikelyComponentType(exports)) return true;
    if (exports == null || typeof exports !== 'object') // Exit if we can't iterate over exports.
    return false;
    var hasExports = false;
    var areAllExportsComponents = true;
    let isESM = '__esModule' in exports;
    for(var key in exports){
        hasExports = true;
        if (key === '__esModule') continue;
        var desc = Object.getOwnPropertyDescriptor(exports, key);
        if (desc && desc.get && !isESM) // Don't invoke getters for CJS as they may have side effects.
        return false;
        var exportValue = exports[key];
        if (!Refresh.isLikelyComponentType(exportValue)) areAllExportsComponents = false;
    }
    return hasExports && areAllExportsComponents;
}
function shouldInvalidateReactRefreshBoundary(prevExports, nextExports) {
    var prevSignature = getRefreshBoundarySignature(prevExports);
    var nextSignature = getRefreshBoundarySignature(nextExports);
    if (prevSignature.length !== nextSignature.length) return true;
    for(var i = 0; i < nextSignature.length; i++){
        if (prevSignature[i] !== nextSignature[i]) return true;
    }
    return false;
}
// When this signature changes, it's unsafe to stop at this refresh boundary.
function getRefreshBoundarySignature(exports) {
    var signature = [];
    signature.push(Refresh.getFamilyByType(exports));
    if (exports == null || typeof exports !== 'object') // Exit if we can't iterate over exports.
    // (This is important for legacy environments.)
    return signature;
    let isESM = '__esModule' in exports;
    for(var key in exports){
        if (key === '__esModule') continue;
        var desc = Object.getOwnPropertyDescriptor(exports, key);
        if (desc && desc.get && !isESM) continue;
        var exportValue = exports[key];
        signature.push(key);
        signature.push(Refresh.getFamilyByType(exportValue));
    }
    return signature;
}
function registerExportsForReactRefresh(module1) {
    var exports = module1.exports, id = module1.id;
    Refresh.register(exports, id + ' %exports%');
    if (exports == null || typeof exports !== 'object') // Exit if we can't iterate over exports.
    // (This is important for legacy environments.)
    return;
    let isESM = '__esModule' in exports;
    for(var key in exports){
        var desc = Object.getOwnPropertyDescriptor(exports, key);
        if (desc && desc.get && !isESM) continue;
        var exportValue = exports[key];
        var typeID = id + ' %exports% ' + key;
        Refresh.register(exportValue, typeID);
    }
}

},{"7422ead32dcc1e6b":"786KC","e4d875b7642f9496":"cMO4r"}],"786KC":[function(require,module,exports,__globalThis) {
'use strict';
module.exports = require("96622d495519d4e");

},{"96622d495519d4e":"hdge7"}],"hdge7":[function(require,module,exports,__globalThis) {
/**
 * @license React
 * react-refresh-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
(function() {
    function computeFullKey(signature) {
        if (null !== signature.fullKey) return signature.fullKey;
        var fullKey = signature.ownKey;
        try {
            var hooks = signature.getCustomHooks();
        } catch (err) {
            return signature.forceReset = !0, signature.fullKey = fullKey;
        }
        for(var i = 0; i < hooks.length; i++){
            var hook = hooks[i];
            if ("function" !== typeof hook) return signature.forceReset = !0, signature.fullKey = fullKey;
            hook = allSignaturesByType.get(hook);
            if (void 0 !== hook) {
                var nestedHookKey = computeFullKey(hook);
                hook.forceReset && (signature.forceReset = !0);
                fullKey += "\n---\n" + nestedHookKey;
            }
        }
        return signature.fullKey = fullKey;
    }
    function resolveFamily(type) {
        return updatedFamiliesByType.get(type);
    }
    function cloneMap(map) {
        var clone = new Map();
        map.forEach(function(value, key) {
            clone.set(key, value);
        });
        return clone;
    }
    function cloneSet(set) {
        var clone = new Set();
        set.forEach(function(value) {
            clone.add(value);
        });
        return clone;
    }
    function getProperty(object, property) {
        try {
            return object[property];
        } catch (err) {}
    }
    function register(type, id) {
        if (!(null === type || "function" !== typeof type && "object" !== typeof type || allFamiliesByType.has(type))) {
            var family = allFamiliesByID.get(id);
            void 0 === family ? (family = {
                current: type
            }, allFamiliesByID.set(id, family)) : pendingUpdates.push([
                family,
                type
            ]);
            allFamiliesByType.set(type, family);
            if ("object" === typeof type && null !== type) switch(getProperty(type, "$$typeof")){
                case REACT_FORWARD_REF_TYPE:
                    register(type.render, id + "$render");
                    break;
                case REACT_MEMO_TYPE:
                    register(type.type, id + "$type");
            }
        }
    }
    function setSignature(type, key) {
        var forceReset = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : !1, getCustomHooks = 3 < arguments.length ? arguments[3] : void 0;
        allSignaturesByType.has(type) || allSignaturesByType.set(type, {
            forceReset: forceReset,
            ownKey: key,
            fullKey: null,
            getCustomHooks: getCustomHooks || function() {
                return [];
            }
        });
        if ("object" === typeof type && null !== type) switch(getProperty(type, "$$typeof")){
            case REACT_FORWARD_REF_TYPE:
                setSignature(type.render, key, forceReset, getCustomHooks);
                break;
            case REACT_MEMO_TYPE:
                setSignature(type.type, key, forceReset, getCustomHooks);
        }
    }
    function collectCustomHooksForSignature(type) {
        type = allSignaturesByType.get(type);
        void 0 !== type && computeFullKey(type);
    }
    var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_MEMO_TYPE = Symbol.for("react.memo"), PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map, allFamiliesByID = new Map(), allFamiliesByType = new PossiblyWeakMap(), allSignaturesByType = new PossiblyWeakMap(), updatedFamiliesByType = new PossiblyWeakMap(), pendingUpdates = [], helpersByRendererID = new Map(), helpersByRoot = new Map(), mountedRoots = new Set(), failedRoots = new Set(), rootElements = "function" === typeof WeakMap ? new WeakMap() : null, isPerformingRefresh = !1;
    exports._getMountedRootCount = function() {
        return mountedRoots.size;
    };
    exports.collectCustomHooksForSignature = collectCustomHooksForSignature;
    exports.createSignatureFunctionForTransform = function() {
        var savedType, hasCustomHooks, didCollectHooks = !1;
        return function(type, key, forceReset, getCustomHooks) {
            if ("string" === typeof key) return savedType || (savedType = type, hasCustomHooks = "function" === typeof getCustomHooks), null == type || "function" !== typeof type && "object" !== typeof type || setSignature(type, key, forceReset, getCustomHooks), type;
            !didCollectHooks && hasCustomHooks && (didCollectHooks = !0, collectCustomHooksForSignature(savedType));
        };
    };
    exports.getFamilyByID = function(id) {
        return allFamiliesByID.get(id);
    };
    exports.getFamilyByType = function(type) {
        return allFamiliesByType.get(type);
    };
    exports.hasUnrecoverableErrors = function() {
        return !1;
    };
    exports.injectIntoGlobalHook = function(globalObject) {
        var hook = globalObject.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (void 0 === hook) {
            var nextID = 0;
            globalObject.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook = {
                renderers: new Map(),
                supportsFiber: !0,
                inject: function() {
                    return nextID++;
                },
                onScheduleFiberRoot: function() {},
                onCommitFiberRoot: function() {},
                onCommitFiberUnmount: function() {}
            };
        }
        if (hook.isDisabled) console.warn("Something has shimmed the React DevTools global hook (__REACT_DEVTOOLS_GLOBAL_HOOK__). Fast Refresh is not compatible with this shim and will be disabled.");
        else {
            var oldInject = hook.inject;
            hook.inject = function(injected) {
                var id = oldInject.apply(this, arguments);
                "function" === typeof injected.scheduleRefresh && "function" === typeof injected.setRefreshHandler && helpersByRendererID.set(id, injected);
                return id;
            };
            hook.renderers.forEach(function(injected, id) {
                "function" === typeof injected.scheduleRefresh && "function" === typeof injected.setRefreshHandler && helpersByRendererID.set(id, injected);
            });
            var oldOnCommitFiberRoot = hook.onCommitFiberRoot, oldOnScheduleFiberRoot = hook.onScheduleFiberRoot || function() {};
            hook.onScheduleFiberRoot = function(id, root, children) {
                isPerformingRefresh || (failedRoots.delete(root), null !== rootElements && rootElements.set(root, children));
                return oldOnScheduleFiberRoot.apply(this, arguments);
            };
            hook.onCommitFiberRoot = function(id, root, maybePriorityLevel, didError) {
                var helpers = helpersByRendererID.get(id);
                if (void 0 !== helpers) {
                    helpersByRoot.set(root, helpers);
                    helpers = root.current;
                    var alternate = helpers.alternate;
                    null !== alternate ? (alternate = null != alternate.memoizedState && null != alternate.memoizedState.element && mountedRoots.has(root), helpers = null != helpers.memoizedState && null != helpers.memoizedState.element, !alternate && helpers ? (mountedRoots.add(root), failedRoots.delete(root)) : alternate && helpers || (alternate && !helpers ? (mountedRoots.delete(root), didError ? failedRoots.add(root) : helpersByRoot.delete(root)) : alternate || helpers || didError && failedRoots.add(root))) : mountedRoots.add(root);
                }
                return oldOnCommitFiberRoot.apply(this, arguments);
            };
        }
    };
    exports.isLikelyComponentType = function(type) {
        switch(typeof type){
            case "function":
                if (null != type.prototype) {
                    if (type.prototype.isReactComponent) return !0;
                    var ownNames = Object.getOwnPropertyNames(type.prototype);
                    if (1 < ownNames.length || "constructor" !== ownNames[0] || type.prototype.__proto__ !== Object.prototype) return !1;
                }
                type = type.name || type.displayName;
                return "string" === typeof type && /^[A-Z]/.test(type);
            case "object":
                if (null != type) switch(getProperty(type, "$$typeof")){
                    case REACT_FORWARD_REF_TYPE:
                    case REACT_MEMO_TYPE:
                        return !0;
                }
                return !1;
            default:
                return !1;
        }
    };
    exports.performReactRefresh = function() {
        if (0 === pendingUpdates.length || isPerformingRefresh) return null;
        isPerformingRefresh = !0;
        try {
            var staleFamilies = new Set(), updatedFamilies = new Set(), updates = pendingUpdates;
            pendingUpdates = [];
            updates.forEach(function(_ref) {
                var family = _ref[0];
                _ref = _ref[1];
                var prevType = family.current;
                updatedFamiliesByType.set(prevType, family);
                updatedFamiliesByType.set(_ref, family);
                family.current = _ref;
                prevType.prototype && prevType.prototype.isReactComponent || _ref.prototype && _ref.prototype.isReactComponent ? _ref = !1 : (prevType = allSignaturesByType.get(prevType), _ref = allSignaturesByType.get(_ref), _ref = void 0 === prevType && void 0 === _ref || void 0 !== prevType && void 0 !== _ref && computeFullKey(prevType) === computeFullKey(_ref) && !_ref.forceReset ? !0 : !1);
                _ref ? updatedFamilies.add(family) : staleFamilies.add(family);
            });
            var update = {
                updatedFamilies: updatedFamilies,
                staleFamilies: staleFamilies
            };
            helpersByRendererID.forEach(function(helpers) {
                helpers.setRefreshHandler(resolveFamily);
            });
            var didError = !1, firstError = null, failedRootsSnapshot = cloneSet(failedRoots), mountedRootsSnapshot = cloneSet(mountedRoots), helpersByRootSnapshot = cloneMap(helpersByRoot);
            failedRootsSnapshot.forEach(function(root) {
                var helpers = helpersByRootSnapshot.get(root);
                if (void 0 === helpers) throw Error("Could not find helpers for a root. This is a bug in React Refresh.");
                failedRoots.has(root);
                if (null !== rootElements && rootElements.has(root)) {
                    var element = rootElements.get(root);
                    try {
                        helpers.scheduleRoot(root, element);
                    } catch (err) {
                        didError || (didError = !0, firstError = err);
                    }
                }
            });
            mountedRootsSnapshot.forEach(function(root) {
                var helpers = helpersByRootSnapshot.get(root);
                if (void 0 === helpers) throw Error("Could not find helpers for a root. This is a bug in React Refresh.");
                mountedRoots.has(root);
                try {
                    helpers.scheduleRefresh(root, update);
                } catch (err) {
                    didError || (didError = !0, firstError = err);
                }
            });
            if (didError) throw firstError;
            return update;
        } finally{
            isPerformingRefresh = !1;
        }
    };
    exports.register = register;
    exports.setSignature = setSignature;
})();

},{}],"cMO4r":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "setEditorHandler", ()=>$da9882e673ac146b$export$25a22ac46f1bd016);
parcelHelpers.export(exports, "reportRuntimeError", ()=>$da9882e673ac146b$export$74e9101ce4078c0);
parcelHelpers.export(exports, "startReportingRuntimeErrors", ()=>$da9882e673ac146b$export$cda2c88a41631c16);
parcelHelpers.export(exports, "dismissRuntimeErrors", ()=>$da9882e673ac146b$export$1cfa6d161ca81bd9);
parcelHelpers.export(exports, "stopReportingRuntimeErrors", ()=>$da9882e673ac146b$export$25ba7d9a816639e7);
function $parcel$interopDefault(a) {
    return a && a.__esModule ? a.default : a;
}
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ /* eslint-env browser */ /* eslint-disable react/react-in-jsx-scope, no-console */ var $b6c7f0288a15c619$var$n, $b6c7f0288a15c619$export$41c562ebe57d11e2, $b6c7f0288a15c619$var$u, $b6c7f0288a15c619$export$a8257692ac88316c, $b6c7f0288a15c619$var$i, $b6c7f0288a15c619$var$r, $b6c7f0288a15c619$var$o, $b6c7f0288a15c619$var$e, $b6c7f0288a15c619$var$f, $b6c7f0288a15c619$var$c, $b6c7f0288a15c619$var$s, $b6c7f0288a15c619$var$a, $b6c7f0288a15c619$var$h, $b6c7f0288a15c619$var$p = {}, $b6c7f0288a15c619$var$y = [], $b6c7f0288a15c619$var$v = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, $b6c7f0288a15c619$var$w = Array.isArray;
function $b6c7f0288a15c619$var$d(n, l) {
    for(var u in l)n[u] = l[u];
    return n;
}
function $b6c7f0288a15c619$var$g(n) {
    n && n.parentNode && n.parentNode.removeChild(n);
}
function $b6c7f0288a15c619$export$c8a8987d4410bf2d(l, u, t) {
    var i, r, o, e = {};
    for(o in u)"key" == o ? i = u[o] : "ref" == o ? r = u[o] : e[o] = u[o];
    if (arguments.length > 2 && (e.children = arguments.length > 3 ? $b6c7f0288a15c619$var$n.call(arguments, 2) : t), "function" == typeof l && null != l.defaultProps) for(o in l.defaultProps)null == e[o] && (e[o] = l.defaultProps[o]);
    return $b6c7f0288a15c619$var$m(l, e, i, r, null);
}
function $b6c7f0288a15c619$var$m(n, t, i, r, o) {
    var e = {
        type: n,
        props: t,
        key: i,
        ref: r,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __c: null,
        constructor: void 0,
        __v: null == o ? ++$b6c7f0288a15c619$var$u : o,
        __i: -1,
        __u: 0
    };
    return null == o && null != $b6c7f0288a15c619$export$41c562ebe57d11e2.vnode && $b6c7f0288a15c619$export$41c562ebe57d11e2.vnode(e), e;
}
function $b6c7f0288a15c619$export$7d1e3a5e95ceca43() {
    return {
        current: null
    };
}
function $b6c7f0288a15c619$export$ffb0004e005737fa(n) {
    return n.children;
}
function $b6c7f0288a15c619$export$16fa2f45be04daa8(n, l) {
    this.props = n, this.context = l;
}
function $b6c7f0288a15c619$var$S(n, l) {
    if (null == l) return n.__ ? $b6c7f0288a15c619$var$S(n.__, n.__i + 1) : null;
    for(var u; l < n.__k.length; l++)if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
    return "function" == typeof n.type ? $b6c7f0288a15c619$var$S(n) : null;
}
function $b6c7f0288a15c619$var$C(n) {
    var l, u;
    if (null != (n = n.__) && null != n.__c) {
        for(n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++)if (null != (u = n.__k[l]) && null != u.__e) {
            n.__e = n.__c.base = u.__e;
            break;
        }
        return $b6c7f0288a15c619$var$C(n);
    }
}
function $b6c7f0288a15c619$var$M(n) {
    (!n.__d && (n.__d = !0) && $b6c7f0288a15c619$var$i.push(n) && !$b6c7f0288a15c619$var$$.__r++ || $b6c7f0288a15c619$var$r != $b6c7f0288a15c619$export$41c562ebe57d11e2.debounceRendering) && (($b6c7f0288a15c619$var$r = $b6c7f0288a15c619$export$41c562ebe57d11e2.debounceRendering) || $b6c7f0288a15c619$var$o)($b6c7f0288a15c619$var$$);
}
function $b6c7f0288a15c619$var$$() {
    for(var n, u, t, r, o, f, c, s = 1; $b6c7f0288a15c619$var$i.length;)$b6c7f0288a15c619$var$i.length > s && $b6c7f0288a15c619$var$i.sort($b6c7f0288a15c619$var$e), n = $b6c7f0288a15c619$var$i.shift(), s = $b6c7f0288a15c619$var$i.length, n.__d && (t = void 0, o = (r = (u = n).__v).__e, f = [], c = [], u.__P && ((t = $b6c7f0288a15c619$var$d({}, r)).__v = r.__v + 1, $b6c7f0288a15c619$export$41c562ebe57d11e2.vnode && $b6c7f0288a15c619$export$41c562ebe57d11e2.vnode(t), $b6c7f0288a15c619$var$O(u.__P, t, r, u.__n, u.__P.namespaceURI, 32 & r.__u ? [
        o
    ] : null, f, null == o ? $b6c7f0288a15c619$var$S(r) : o, !!(32 & r.__u), c), t.__v = r.__v, t.__.__k[t.__i] = t, $b6c7f0288a15c619$var$z(f, t, c), t.__e != o && $b6c7f0288a15c619$var$C(t)));
    $b6c7f0288a15c619$var$$.__r = 0;
}
function $b6c7f0288a15c619$var$I(n, l, u, t, i, r, o, e, f, c, s) {
    var a, h, v, w, d, g, _ = t && t.__k || $b6c7f0288a15c619$var$y, m = l.length;
    for(f = $b6c7f0288a15c619$var$P(u, l, _, f, m), a = 0; a < m; a++)null != (v = u.__k[a]) && (h = -1 == v.__i ? $b6c7f0288a15c619$var$p : _[v.__i] || $b6c7f0288a15c619$var$p, v.__i = a, g = $b6c7f0288a15c619$var$O(n, v, h, i, r, o, e, f, c, s), w = v.__e, v.ref && h.ref != v.ref && (h.ref && $b6c7f0288a15c619$var$q(h.ref, null, v), s.push(v.ref, v.__c || w, v)), null == d && null != w && (d = w), 4 & v.__u || h.__k === v.__k ? f = $b6c7f0288a15c619$var$A(v, f, n) : "function" == typeof v.type && void 0 !== g ? f = g : w && (f = w.nextSibling), v.__u &= -7);
    return u.__e = d, f;
}
function $b6c7f0288a15c619$var$P(n, l, u, t, i) {
    var r, o, e, f, c, s = u.length, a = s, h = 0;
    for(n.__k = new Array(i), r = 0; r < i; r++)null != (o = l[r]) && "boolean" != typeof o && "function" != typeof o ? (f = r + h, (o = n.__k[r] = "string" == typeof o || "number" == typeof o || "bigint" == typeof o || o.constructor == String ? $b6c7f0288a15c619$var$m(null, o, null, null, null) : $b6c7f0288a15c619$var$w(o) ? $b6c7f0288a15c619$var$m($b6c7f0288a15c619$export$ffb0004e005737fa, {
        children: o
    }, null, null, null) : null == o.constructor && o.__b > 0 ? $b6c7f0288a15c619$var$m(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v) : o).__ = n, o.__b = n.__b + 1, e = null, -1 != (c = o.__i = $b6c7f0288a15c619$var$L(o, u, f, a)) && (a--, (e = u[c]) && (e.__u |= 2)), null == e || null == e.__v ? (-1 == c && (i > s ? h-- : i < s && h++), "function" != typeof o.type && (o.__u |= 4)) : c != f && (c == f - 1 ? h-- : c == f + 1 ? h++ : (c > f ? h-- : h++, o.__u |= 4))) : n.__k[r] = null;
    if (a) for(r = 0; r < s; r++)null != (e = u[r]) && 0 == (2 & e.__u) && (e.__e == t && (t = $b6c7f0288a15c619$var$S(e)), $b6c7f0288a15c619$var$B(e, e));
    return t;
}
function $b6c7f0288a15c619$var$A(n, l, u) {
    var t, i;
    if ("function" == typeof n.type) {
        for(t = n.__k, i = 0; t && i < t.length; i++)t[i] && (t[i].__ = n, l = $b6c7f0288a15c619$var$A(t[i], l, u));
        return l;
    }
    n.__e != l && (l && n.type && !u.contains(l) && (l = $b6c7f0288a15c619$var$S(n)), u.insertBefore(n.__e, l || null), l = n.__e);
    do l = l && l.nextSibling;
    while (null != l && 8 == l.nodeType);
    return l;
}
function $b6c7f0288a15c619$export$47e4c5b300681277(n, l) {
    return l = l || [], null == n || "boolean" == typeof n || ($b6c7f0288a15c619$var$w(n) ? n.some(function(n) {
        $b6c7f0288a15c619$export$47e4c5b300681277(n, l);
    }) : l.push(n)), l;
}
function $b6c7f0288a15c619$var$L(n, l, u, t) {
    var i, r, o = n.key, e = n.type, f = l[u];
    if (null === f && null == n.key || f && o == f.key && e == f.type && 0 == (2 & f.__u)) return u;
    if (t > (null != f && 0 == (2 & f.__u) ? 1 : 0)) for(i = u - 1, r = u + 1; i >= 0 || r < l.length;){
        if (i >= 0) {
            if ((f = l[i]) && 0 == (2 & f.__u) && o == f.key && e == f.type) return i;
            i--;
        }
        if (r < l.length) {
            if ((f = l[r]) && 0 == (2 & f.__u) && o == f.key && e == f.type) return r;
            r++;
        }
    }
    return -1;
}
function $b6c7f0288a15c619$var$T(n, l, u) {
    "-" == l[0] ? n.setProperty(l, null == u ? "" : u) : n[l] = null == u ? "" : "number" != typeof u || $b6c7f0288a15c619$var$v.test(l) ? u : u + "px";
}
function $b6c7f0288a15c619$var$j(n, l, u, t, i) {
    var r;
    n: if ("style" == l) {
        if ("string" == typeof u) n.style.cssText = u;
        else {
            if ("string" == typeof t && (n.style.cssText = t = ""), t) for(l in t)u && l in u || $b6c7f0288a15c619$var$T(n.style, l, "");
            if (u) for(l in u)t && u[l] == t[l] || $b6c7f0288a15c619$var$T(n.style, l, u[l]);
        }
    } else if ("o" == l[0] && "n" == l[1]) r = l != (l = l.replace($b6c7f0288a15c619$var$f, "$1")), l = l.toLowerCase() in n || "onFocusOut" == l || "onFocusIn" == l ? l.toLowerCase().slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + r] = u, u ? t ? u.u = t.u : (u.u = $b6c7f0288a15c619$var$c, n.addEventListener(l, r ? $b6c7f0288a15c619$var$a : $b6c7f0288a15c619$var$s, r)) : n.removeEventListener(l, r ? $b6c7f0288a15c619$var$a : $b6c7f0288a15c619$var$s, r);
    else {
        if ("http://www.w3.org/2000/svg" == i) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if ("width" != l && "height" != l && "href" != l && "list" != l && "form" != l && "tabIndex" != l && "download" != l && "rowSpan" != l && "colSpan" != l && "role" != l && "popover" != l && l in n) try {
            n[l] = null == u ? "" : u;
            break n;
        } catch (n) {}
        "function" == typeof u || (null == u || !1 === u && "-" != l[4] ? n.removeAttribute(l) : n.setAttribute(l, "popover" == l && 1 == u ? "" : u));
    }
}
function $b6c7f0288a15c619$var$F(n) {
    return function(u) {
        if (this.l) {
            var t = this.l[u.type + n];
            if (null == u.t) u.t = $b6c7f0288a15c619$var$c++;
            else if (u.t < t.u) return;
            return t($b6c7f0288a15c619$export$41c562ebe57d11e2.event ? $b6c7f0288a15c619$export$41c562ebe57d11e2.event(u) : u);
        }
    };
}
function $b6c7f0288a15c619$var$O(n, u, t, i, r, o, e, f, c, s) {
    var a, h, p, y, v, _, m, b, S, C, M, $, P, A, H, L, T, j = u.type;
    if (null != u.constructor) return null;
    128 & t.__u && (c = !!(32 & t.__u), o = [
        f = u.__e = t.__e
    ]), (a = $b6c7f0288a15c619$export$41c562ebe57d11e2.__b) && a(u);
    n: if ("function" == typeof j) try {
        if (b = u.props, S = "prototype" in j && j.prototype.render, C = (a = j.contextType) && i[a.__c], M = a ? C ? C.props.value : a.__ : i, t.__c ? m = (h = u.__c = t.__c).__ = h.__E : (S ? u.__c = h = new j(b, M) : (u.__c = h = new $b6c7f0288a15c619$export$16fa2f45be04daa8(b, M), h.constructor = j, h.render = $b6c7f0288a15c619$var$D), C && C.sub(h), h.props = b, h.state || (h.state = {}), h.context = M, h.__n = i, p = h.__d = !0, h.__h = [], h._sb = []), S && null == h.__s && (h.__s = h.state), S && null != j.getDerivedStateFromProps && (h.__s == h.state && (h.__s = $b6c7f0288a15c619$var$d({}, h.__s)), $b6c7f0288a15c619$var$d(h.__s, j.getDerivedStateFromProps(b, h.__s))), y = h.props, v = h.state, h.__v = u, p) S && null == j.getDerivedStateFromProps && null != h.componentWillMount && h.componentWillMount(), S && null != h.componentDidMount && h.__h.push(h.componentDidMount);
        else {
            if (S && null == j.getDerivedStateFromProps && b !== y && null != h.componentWillReceiveProps && h.componentWillReceiveProps(b, M), !h.__e && null != h.shouldComponentUpdate && !1 === h.shouldComponentUpdate(b, h.__s, M) || u.__v == t.__v) {
                for(u.__v != t.__v && (h.props = b, h.state = h.__s, h.__d = !1), u.__e = t.__e, u.__k = t.__k, u.__k.some(function(n) {
                    n && (n.__ = u);
                }), $ = 0; $ < h._sb.length; $++)h.__h.push(h._sb[$]);
                h._sb = [], h.__h.length && e.push(h);
                break n;
            }
            null != h.componentWillUpdate && h.componentWillUpdate(b, h.__s, M), S && null != h.componentDidUpdate && h.__h.push(function() {
                h.componentDidUpdate(y, v, _);
            });
        }
        if (h.context = M, h.props = b, h.__P = n, h.__e = !1, P = $b6c7f0288a15c619$export$41c562ebe57d11e2.__r, A = 0, S) {
            for(h.state = h.__s, h.__d = !1, P && P(u), a = h.render(h.props, h.state, h.context), H = 0; H < h._sb.length; H++)h.__h.push(h._sb[H]);
            h._sb = [];
        } else do h.__d = !1, P && P(u), a = h.render(h.props, h.state, h.context), h.state = h.__s;
        while (h.__d && ++A < 25);
        h.state = h.__s, null != h.getChildContext && (i = $b6c7f0288a15c619$var$d($b6c7f0288a15c619$var$d({}, i), h.getChildContext())), S && !p && null != h.getSnapshotBeforeUpdate && (_ = h.getSnapshotBeforeUpdate(y, v)), L = a, null != a && a.type === $b6c7f0288a15c619$export$ffb0004e005737fa && null == a.key && (L = $b6c7f0288a15c619$var$N(a.props.children)), f = $b6c7f0288a15c619$var$I(n, $b6c7f0288a15c619$var$w(L) ? L : [
            L
        ], u, t, i, r, o, e, f, c, s), h.base = u.__e, u.__u &= -161, h.__h.length && e.push(h), m && (h.__E = h.__ = null);
    } catch (n) {
        if (u.__v = null, c || null != o) {
            if (n.then) {
                for(u.__u |= c ? 160 : 128; f && 8 == f.nodeType && f.nextSibling;)f = f.nextSibling;
                o[o.indexOf(f)] = null, u.__e = f;
            } else for(T = o.length; T--;)$b6c7f0288a15c619$var$g(o[T]);
        } else u.__e = t.__e, u.__k = t.__k;
        $b6c7f0288a15c619$export$41c562ebe57d11e2.__e(n, u, t);
    }
    else null == o && u.__v == t.__v ? (u.__k = t.__k, u.__e = t.__e) : f = u.__e = $b6c7f0288a15c619$var$V(t.__e, u, t, i, r, o, e, c, s);
    return (a = $b6c7f0288a15c619$export$41c562ebe57d11e2.diffed) && a(u), 128 & u.__u ? void 0 : f;
}
function $b6c7f0288a15c619$var$z(n, u, t) {
    for(var i = 0; i < t.length; i++)$b6c7f0288a15c619$var$q(t[i], t[++i], t[++i]);
    $b6c7f0288a15c619$export$41c562ebe57d11e2.__c && $b6c7f0288a15c619$export$41c562ebe57d11e2.__c(u, n), n.some(function(u) {
        try {
            n = u.__h, u.__h = [], n.some(function(n) {
                n.call(u);
            });
        } catch (n) {
            $b6c7f0288a15c619$export$41c562ebe57d11e2.__e(n, u.__v);
        }
    });
}
function $b6c7f0288a15c619$var$N(n) {
    return "object" != typeof n || null == n || n.__b && n.__b > 0 ? n : $b6c7f0288a15c619$var$w(n) ? n.map($b6c7f0288a15c619$var$N) : $b6c7f0288a15c619$var$d({}, n);
}
function $b6c7f0288a15c619$var$V(u, t, i, r, o, e, f, c, s) {
    var a, h, y, v, d, _, m, b = i.props, k = t.props, x = t.type;
    if ("svg" == x ? o = "http://www.w3.org/2000/svg" : "math" == x ? o = "http://www.w3.org/1998/Math/MathML" : o || (o = "http://www.w3.org/1999/xhtml"), null != e) {
        for(a = 0; a < e.length; a++)if ((d = e[a]) && "setAttribute" in d == !!x && (x ? d.localName == x : 3 == d.nodeType)) {
            u = d, e[a] = null;
            break;
        }
    }
    if (null == u) {
        if (null == x) return document.createTextNode(k);
        u = document.createElementNS(o, x, k.is && k), c && ($b6c7f0288a15c619$export$41c562ebe57d11e2.__m && $b6c7f0288a15c619$export$41c562ebe57d11e2.__m(t, e), c = !1), e = null;
    }
    if (null == x) b === k || c && u.data == k || (u.data = k);
    else {
        if (e = e && $b6c7f0288a15c619$var$n.call(u.childNodes), b = i.props || $b6c7f0288a15c619$var$p, !c && null != e) for(b = {}, a = 0; a < u.attributes.length; a++)b[(d = u.attributes[a]).name] = d.value;
        for(a in b)if (d = b[a], "children" == a) ;
        else if ("dangerouslySetInnerHTML" == a) y = d;
        else if (!(a in k)) {
            if ("value" == a && "defaultValue" in k || "checked" == a && "defaultChecked" in k) continue;
            $b6c7f0288a15c619$var$j(u, a, null, d, o);
        }
        for(a in k)d = k[a], "children" == a ? v = d : "dangerouslySetInnerHTML" == a ? h = d : "value" == a ? _ = d : "checked" == a ? m = d : c && "function" != typeof d || b[a] === d || $b6c7f0288a15c619$var$j(u, a, d, b[a], o);
        if (h) c || y && (h.__html == y.__html || h.__html == u.innerHTML) || (u.innerHTML = h.__html), t.__k = [];
        else if (y && (u.innerHTML = ""), $b6c7f0288a15c619$var$I("template" == t.type ? u.content : u, $b6c7f0288a15c619$var$w(v) ? v : [
            v
        ], t, i, r, "foreignObject" == x ? "http://www.w3.org/1999/xhtml" : o, e, f, e ? e[0] : i.__k && $b6c7f0288a15c619$var$S(i, 0), c, s), null != e) for(a = e.length; a--;)$b6c7f0288a15c619$var$g(e[a]);
        c || (a = "value", "progress" == x && null == _ ? u.removeAttribute("value") : null != _ && (_ !== u[a] || "progress" == x && !_ || "option" == x && _ != b[a]) && $b6c7f0288a15c619$var$j(u, a, _, b[a], o), a = "checked", null != m && m != u[a] && $b6c7f0288a15c619$var$j(u, a, m, b[a], o));
    }
    return u;
}
function $b6c7f0288a15c619$var$q(n, u, t) {
    try {
        if ("function" == typeof n) {
            var i = "function" == typeof n.__u;
            i && n.__u(), i && null == u || (n.__u = n(u));
        } else n.current = u;
    } catch (n) {
        $b6c7f0288a15c619$export$41c562ebe57d11e2.__e(n, t);
    }
}
function $b6c7f0288a15c619$var$B(n, u, t) {
    var i, r;
    if ($b6c7f0288a15c619$export$41c562ebe57d11e2.unmount && $b6c7f0288a15c619$export$41c562ebe57d11e2.unmount(n), (i = n.ref) && (i.current && i.current != n.__e || $b6c7f0288a15c619$var$q(i, null, u)), null != (i = n.__c)) {
        if (i.componentWillUnmount) try {
            i.componentWillUnmount();
        } catch (n) {
            $b6c7f0288a15c619$export$41c562ebe57d11e2.__e(n, u);
        }
        i.base = i.__P = null;
    }
    if (i = n.__k) for(r = 0; r < i.length; r++)i[r] && $b6c7f0288a15c619$var$B(i[r], u, t || "function" != typeof n.type);
    t || $b6c7f0288a15c619$var$g(n.__e), n.__c = n.__ = n.__e = void 0;
}
function $b6c7f0288a15c619$var$D(n, l, u) {
    return this.constructor(n, u);
}
function $b6c7f0288a15c619$export$b3890eb0ae9dca99(u, t, i) {
    var r, o, e, f;
    t == document && (t = document.documentElement), $b6c7f0288a15c619$export$41c562ebe57d11e2.__ && $b6c7f0288a15c619$export$41c562ebe57d11e2.__(u, t), o = (r = "function" == typeof i) ? null : i && i.__k || t.__k, e = [], f = [], $b6c7f0288a15c619$var$O(t, u = (!r && i || t).__k = $b6c7f0288a15c619$export$c8a8987d4410bf2d($b6c7f0288a15c619$export$ffb0004e005737fa, null, [
        u
    ]), o || $b6c7f0288a15c619$var$p, $b6c7f0288a15c619$var$p, t.namespaceURI, !r && i ? [
        i
    ] : o ? null : t.firstChild ? $b6c7f0288a15c619$var$n.call(t.childNodes) : null, e, !r && i ? i : o ? o.__e : t.firstChild, r, f), $b6c7f0288a15c619$var$z(e, u, f);
}
function $b6c7f0288a15c619$export$fa8d919ba61d84db(n, l) {
    $b6c7f0288a15c619$export$b3890eb0ae9dca99(n, l, $b6c7f0288a15c619$export$fa8d919ba61d84db);
}
function $b6c7f0288a15c619$export$e530037191fcd5d7(l, u, t) {
    var i, r, o, e, f = $b6c7f0288a15c619$var$d({}, l.props);
    for(o in l.type && l.type.defaultProps && (e = l.type.defaultProps), u)"key" == o ? i = u[o] : "ref" == o ? r = u[o] : f[o] = null == u[o] && null != e ? e[o] : u[o];
    return arguments.length > 2 && (f.children = arguments.length > 3 ? $b6c7f0288a15c619$var$n.call(arguments, 2) : t), $b6c7f0288a15c619$var$m(l.type, f, i || l.key, r || l.ref, null);
}
function $b6c7f0288a15c619$export$fd42f52fd3ae1109(n) {
    function l(n) {
        var u, t;
        return this.getChildContext || (u = new Set, (t = {})[l.__c] = this, this.getChildContext = function() {
            return t;
        }, this.componentWillUnmount = function() {
            u = null;
        }, this.shouldComponentUpdate = function(n) {
            this.props.value != n.value && u.forEach(function(n) {
                n.__e = !0, $b6c7f0288a15c619$var$M(n);
            });
        }, this.sub = function(n) {
            u.add(n);
            var l = n.componentWillUnmount;
            n.componentWillUnmount = function() {
                u && u.delete(n), l && l.call(n);
            };
        }), n.children;
    }
    return l.__c = "__cC" + $b6c7f0288a15c619$var$h++, l.__ = n, l.Provider = l.__l = (l.Consumer = function(n, l) {
        return n.children(l);
    }).contextType = l, l;
}
$b6c7f0288a15c619$var$n = $b6c7f0288a15c619$var$y.slice, $b6c7f0288a15c619$export$41c562ebe57d11e2 = {
    __e: function(n, l, u, t) {
        for(var i, r, o; l = l.__;)if ((i = l.__c) && !i.__) try {
            if ((r = i.constructor) && null != r.getDerivedStateFromError && (i.setState(r.getDerivedStateFromError(n)), o = i.__d), null != i.componentDidCatch && (i.componentDidCatch(n, t || {}), o = i.__d), o) return i.__E = i;
        } catch (l) {
            n = l;
        }
        throw n;
    }
}, $b6c7f0288a15c619$var$u = 0, $b6c7f0288a15c619$export$a8257692ac88316c = function(n) {
    return null != n && null == n.constructor;
}, $b6c7f0288a15c619$export$16fa2f45be04daa8.prototype.setState = function(n, l) {
    var u;
    u = null != this.__s && this.__s != this.state ? this.__s : this.__s = $b6c7f0288a15c619$var$d({}, this.state), "function" == typeof n && (n = n($b6c7f0288a15c619$var$d({}, u), this.props)), n && $b6c7f0288a15c619$var$d(u, n), null != n && this.__v && (l && this._sb.push(l), $b6c7f0288a15c619$var$M(this));
}, $b6c7f0288a15c619$export$16fa2f45be04daa8.prototype.forceUpdate = function(n) {
    this.__v && (this.__e = !0, n && this.__h.push(n), $b6c7f0288a15c619$var$M(this));
}, $b6c7f0288a15c619$export$16fa2f45be04daa8.prototype.render = $b6c7f0288a15c619$export$ffb0004e005737fa, $b6c7f0288a15c619$var$i = [], $b6c7f0288a15c619$var$o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, $b6c7f0288a15c619$var$e = function(n, l) {
    return n.__v.__b - l.__v.__b;
}, $b6c7f0288a15c619$var$$.__r = 0, $b6c7f0288a15c619$var$f = /(PointerCapture)$|Capture$/i, $b6c7f0288a15c619$var$c = 0, $b6c7f0288a15c619$var$s = $b6c7f0288a15c619$var$F(!1), $b6c7f0288a15c619$var$a = $b6c7f0288a15c619$var$F(!0), $b6c7f0288a15c619$var$h = 0;
var $23b7c1cb98b19658$var$t = /["&<]/;
function $23b7c1cb98b19658$var$n(r) {
    if (0 === r.length || !1 === $23b7c1cb98b19658$var$t.test(r)) return r;
    for(var e = 0, n = 0, o = "", f = ""; n < r.length; n++){
        switch(r.charCodeAt(n)){
            case 34:
                f = "&quot;";
                break;
            case 38:
                f = "&amp;";
                break;
            case 60:
                f = "&lt;";
                break;
            default:
                continue;
        }
        n !== e && (o += r.slice(e, n)), o += f, e = n + 1;
    }
    return n !== e && (o += r.slice(e, n)), o;
}
var $23b7c1cb98b19658$var$o = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, $23b7c1cb98b19658$var$f = 0, $23b7c1cb98b19658$var$i = Array.isArray;
function $23b7c1cb98b19658$export$34b9dba7ce09269b(e, t, n, o, i, u) {
    t || (t = {});
    var a, c, p = t;
    if ("ref" in p) for(c in p = {}, t)"ref" == c ? a = t[c] : p[c] = t[c];
    var l = {
        type: e,
        props: p,
        key: n,
        ref: a,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __c: null,
        constructor: void 0,
        __v: --$23b7c1cb98b19658$var$f,
        __i: -1,
        __u: 0,
        __source: i,
        __self: u
    };
    if ("function" == typeof e && (a = e.defaultProps)) for(c in a)void 0 === p[c] && (p[c] = a[c]);
    return $b6c7f0288a15c619$export$41c562ebe57d11e2.vnode && $b6c7f0288a15c619$export$41c562ebe57d11e2.vnode(l), l;
}
function $23b7c1cb98b19658$export$45700d561b2268ac(r) {
    var t = $23b7c1cb98b19658$export$34b9dba7ce09269b($b6c7f0288a15c619$export$ffb0004e005737fa, {
        tpl: r,
        exprs: [].slice.call(arguments, 1)
    });
    return t.key = t.__v, t;
}
var $23b7c1cb98b19658$var$c = {}, $23b7c1cb98b19658$var$p = /[A-Z]/g;
function $23b7c1cb98b19658$export$991f6ffe102e5bac(e, t) {
    if ($b6c7f0288a15c619$export$41c562ebe57d11e2.attr) {
        var f = $b6c7f0288a15c619$export$41c562ebe57d11e2.attr(e, t);
        if ("string" == typeof f) return f;
    }
    if ("ref" === e || "key" === e) return "";
    if ("style" === e && "object" == typeof t) {
        var i = "";
        for(var u in t){
            var a = t[u];
            if (null != a && "" !== a) {
                var l = "-" == u[0] ? u : $23b7c1cb98b19658$var$c[u] || ($23b7c1cb98b19658$var$c[u] = u.replace($23b7c1cb98b19658$var$p, "-$&").toLowerCase()), s = ";";
                "number" != typeof a || l.startsWith("--") || $23b7c1cb98b19658$var$o.test(l) || (s = "px;"), i = i + l + ":" + a + s;
            }
        }
        return e + '="' + i + '"';
    }
    return null == t || !1 === t || "function" == typeof t || "object" == typeof t ? "" : !0 === t ? e : e + '="' + $23b7c1cb98b19658$var$n(t) + '"';
}
function $23b7c1cb98b19658$export$40e96e718441efeb(r) {
    if (null == r || "boolean" == typeof r || "function" == typeof r) return null;
    if ("object" == typeof r) {
        if (void 0 === r.constructor) return r;
        if ($23b7c1cb98b19658$var$i(r)) {
            for(var e = 0; e < r.length; e++)r[e] = $23b7c1cb98b19658$export$40e96e718441efeb(r[e]);
            return r;
        }
    }
    return $23b7c1cb98b19658$var$n("" + r);
}
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ /* eslint-env browser */ /**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ let $883a43040cbd0629$var$boundErrorHandler = null;
function $883a43040cbd0629$var$errorHandler(callback, e) {
    // $FlowFixMe
    if (!e.error) return;
    // $FlowFixMe
    const { error: error } = e;
    if (error instanceof Error) callback(error);
    else // Look in your browser's devtools for more information
    callback(new Error(error));
}
function $883a43040cbd0629$export$6503ec6e8aabbaf(target, callback) {
    if ($883a43040cbd0629$var$boundErrorHandler !== null) return;
    $883a43040cbd0629$var$boundErrorHandler = $883a43040cbd0629$var$errorHandler.bind(undefined, callback);
    target.addEventListener('error', $883a43040cbd0629$var$boundErrorHandler);
}
function $883a43040cbd0629$export$d07f55d4c15c0440(target) {
    if ($883a43040cbd0629$var$boundErrorHandler === null) return;
    target.removeEventListener('error', $883a43040cbd0629$var$boundErrorHandler);
    $883a43040cbd0629$var$boundErrorHandler = null;
}
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ let $900f8c32b7484e20$var$boundRejectionHandler = null;
function $900f8c32b7484e20$var$rejectionHandler(callback, e) {
    if (e == null || e.reason == null) return callback(new Error('Unknown'));
    let { reason: reason } = e;
    if (reason instanceof Error) return callback(reason);
    // A non-error was rejected, we don't have a trace :(
    // Look in your browser's devtools for more information
    return callback(new Error(reason));
}
function $900f8c32b7484e20$export$6503ec6e8aabbaf(target, callback) {
    if ($900f8c32b7484e20$var$boundRejectionHandler !== null) return;
    $900f8c32b7484e20$var$boundRejectionHandler = $900f8c32b7484e20$var$rejectionHandler.bind(undefined, callback);
    // $FlowFixMe
    target.addEventListener('unhandledrejection', $900f8c32b7484e20$var$boundRejectionHandler);
}
function $900f8c32b7484e20$export$d07f55d4c15c0440(target) {
    if ($900f8c32b7484e20$var$boundRejectionHandler === null) return;
    // $FlowFixMe
    target.removeEventListener('unhandledrejection', $900f8c32b7484e20$var$boundRejectionHandler);
    $900f8c32b7484e20$var$boundRejectionHandler = null;
}
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ let $5f72ade198404e99$var$stackTraceRegistered = false;
// Default: https://docs.microsoft.com/en-us/scripting/javascript/reference/stacktracelimit-property-error-javascript
let $5f72ade198404e99$var$restoreStackTraceValue = 10;
const $5f72ade198404e99$var$MAX_STACK_LENGTH = 50;
function $5f72ade198404e99$export$6503ec6e8aabbaf(limit = $5f72ade198404e99$var$MAX_STACK_LENGTH) {
    if ($5f72ade198404e99$var$stackTraceRegistered) return;
    try {
        $5f72ade198404e99$var$restoreStackTraceValue = Error.stackTraceLimit;
        Error.stackTraceLimit = limit;
        $5f72ade198404e99$var$stackTraceRegistered = true;
    } catch (e) {
    // Not all browsers support this so we don't care if it errors
    }
}
function $5f72ade198404e99$export$d07f55d4c15c0440() {
    if (!$5f72ade198404e99$var$stackTraceRegistered) return;
    try {
        Error.stackTraceLimit = $5f72ade198404e99$var$restoreStackTraceValue;
        $5f72ade198404e99$var$stackTraceRegistered = false;
    } catch (e) {
    // Not all browsers support this so we don't care if it errors
    }
}
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ /**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ /**
 * A representation of a stack frame.
 */ class $d35756f426c25812$export$8949fddf10447898 {
    constructor(functionName = null, fileName = null, lineNumber = null, columnNumber = null, scriptCode = null, sourceFunctionName = null, sourceFileName = null, sourceLineNumber = null, sourceColumnNumber = null, sourceScriptCode = null){
        if (functionName && functionName.indexOf('Object.') === 0) functionName = functionName.slice(7);
        if (// https://github.com/facebook/create-react-app/issues/2097
        // Let's ignore a meaningless name we get for top-level modules.
        functionName === 'friendlySyntaxErrorLabel' || functionName === 'exports.__esModule' || functionName === '<anonymous>' || !functionName) functionName = null;
        this.functionName = functionName;
        this.fileName = fileName;
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;
        this._originalFunctionName = sourceFunctionName;
        this._originalFileName = sourceFileName;
        this._originalLineNumber = sourceLineNumber;
        this._originalColumnNumber = sourceColumnNumber;
        this._scriptCode = scriptCode;
        this._originalScriptCode = sourceScriptCode;
    }
    /**
   * Returns the name of this function.
   */ getFunctionName() {
        return this.functionName || '(anonymous function)';
    }
    /**
   * Returns the source of the frame.
   * This contains the file name, line number, and column number when available.
   */ getSource() {
        let str = '';
        if (this.fileName != null) str += this.fileName + ':';
        if (this.lineNumber != null) str += this.lineNumber + ':';
        if (this.columnNumber != null) str += this.columnNumber + ':';
        return str.slice(0, -1);
    }
    /**
   * Returns a pretty version of this stack frame.
   */ toString() {
        const functionName = this.getFunctionName();
        const source = this.getSource();
        return `${functionName}${source ? ` (${source})` : ``}`;
    }
}
var $d35756f426c25812$export$2e2bcd8739ae039 = $d35756f426c25812$export$8949fddf10447898;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ const $865b9ffc545cb441$var$regexExtractLocation = /\(?(.+?)(?::(\d+))?(?::(\d+))?\)?$/;
function $865b9ffc545cb441$var$extractLocation(token) {
    return $865b9ffc545cb441$var$regexExtractLocation.exec(token) // $FlowFixMe
    .slice(1).map((v)=>{
        const p = Number(v);
        if (!isNaN(p)) return p;
        return v;
    });
}
const $865b9ffc545cb441$var$regexValidFrame_Chrome = /^\s*(at|in)\s.+(:\d+)/;
const $865b9ffc545cb441$var$regexValidFrame_FireFox = /(^|@)\S+:\d+|.+line\s+\d+\s+>\s+(eval|Function).+/;
function $865b9ffc545cb441$var$parseStack(stack) {
    let frames = stack.filter((e)=>$865b9ffc545cb441$var$regexValidFrame_Chrome.test(e) || $865b9ffc545cb441$var$regexValidFrame_FireFox.test(e)).map((e)=>{
        if ($865b9ffc545cb441$var$regexValidFrame_FireFox.test(e)) {
            // Strip eval, we don't care about it
            let isEval = false;
            if (/ > (eval|Function)/.test(e)) {
                e = e.replace(/ line (\d+)(?: > eval line \d+)* > (eval|Function):\d+:\d+/g, ':$1');
                isEval = true;
            }
            const data = e.split(/[@]/g);
            const last = data.pop();
            return new $d35756f426c25812$export$2e2bcd8739ae039(data.join('@') || (isEval ? 'eval' : null), ...$865b9ffc545cb441$var$extractLocation(last));
        } else {
            // Strip eval, we don't care about it
            if (e.indexOf('(eval ') !== -1) e = e.replace(/(\(eval at [^()]*)|(\),.*$)/g, '');
            if (e.indexOf('(at ') !== -1) e = e.replace(/\(at /, '(');
            const data = e.trim().split(/\s+/g).slice(1);
            const last = data.pop();
            return new $d35756f426c25812$export$2e2bcd8739ae039(data.join(' ') || null, ...$865b9ffc545cb441$var$extractLocation(last));
        }
    });
    let index = frames.findIndex((frame)=>frame.getFunctionName().includes('react-stack-bottom-frame'));
    if (index >= 0) frames = frames.slice(0, index);
    return frames;
}
/**
 * Turns an <code>Error</code>, or similar object, into a set of <code>StackFrame</code>s.
 * @alias parse
 */ function $865b9ffc545cb441$export$98e6a39c04603d36(error) {
    if (error == null) throw new Error('You cannot pass a null object.');
    if (typeof error === 'string') return $865b9ffc545cb441$var$parseStack(error.split('\n'));
    if (Array.isArray(error)) return $865b9ffc545cb441$var$parseStack(error);
    if (typeof error.stack === 'string') return $865b9ffc545cb441$var$parseStack(error.stack.split('\n'));
    throw new Error('The error you provided does not contain a stack trace.');
}
var $865b9ffc545cb441$export$2e2bcd8739ae039 = $865b9ffc545cb441$export$98e6a39c04603d36;
/**
 * Enhances a set of <code>StackFrame</code>s with their original positions and code (when available).
 * @param {StackFrame[]} frames A set of <code>StackFrame</code>s which contain (generated) code positions.
 * @param {number} [contextLines=3] The number of lines to provide before and after the line specified in the <code>StackFrame</code>.
 */ async function $df495b51087c401c$export$35b6448019ed80b8(error, contextLines = 3) {
    const frames = $865b9ffc545cb441$export$98e6a39c04603d36(error);
    // $FlowFixMe
    let res = await fetch(module.bundle.devServer + '/__parcel_code_frame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contextLines: contextLines,
            frames: frames.map((f)=>({
                    fileName: f.fileName,
                    lineNumber: f.lineNumber,
                    columnNumber: f.columnNumber
                }))
        })
    });
    let json = await res.json();
    return json.map((f, i)=>new $d35756f426c25812$export$8949fddf10447898(frames[i].functionName, f.fileName, f.lineNumber, f.columnNumber, f.compiledLines, frames[i].functionName, f.sourceFileName, f.sourceLineNumber, f.sourceColumnNumber, f.sourceLines));
}
var $df495b51087c401c$export$2e2bcd8739ae039 = $df495b51087c401c$export$35b6448019ed80b8;
const $6d40ebe8356580e0$var$CONTEXT_SIZE = 3;
function $6d40ebe8356580e0$export$9123e6c9c0ac21ed(crash) {
    return (error, unhandledRejection = false)=>{
        $df495b51087c401c$export$2e2bcd8739ae039(error, $6d40ebe8356580e0$var$CONTEXT_SIZE).then((stackFrames)=>{
            if (stackFrames == null) return;
            crash({
                error: error,
                unhandledRejection: unhandledRejection,
                contextSize: $6d40ebe8356580e0$var$CONTEXT_SIZE,
                stackFrames: stackFrames
            });
        }).catch((e)=>{
            // eslint-disable-next-line no-console
            console.log('Could not get the stack frames of error:', e);
        });
    };
}
function $6d40ebe8356580e0$var$patchConsole(method, onError) {
    /* eslint-disable no-console */ let original = console[method];
    console[method] = (...args)=>{
        let error = null;
        if (typeof args[0] === 'string') {
            let format = args[0].match(/%[oOdisfc]/g);
            if (format) {
                let errorIndex = format.findIndex((match)=>match === '%o' || match === '%O');
                if (errorIndex < 0) errorIndex = format.findIndex((match)=>match === '%s');
                if (errorIndex >= 0) error = args[errorIndex + 1];
                else error = args[1];
                if (!(error instanceof Error)) {
                    let index = 1;
                    let message = args[0].replace(/%[oOdisfc]/g, (match)=>{
                        switch(match){
                            case '%s':
                                return String(args[index++]);
                            case '%f':
                                return parseFloat(args[index++]);
                            case '%d':
                            case '%i':
                                return parseInt(args[index++], 10);
                            case '%o':
                            case '%O':
                                if (args[index] instanceof Error) return String(args[index++]);
                                else return JSON.stringify(args[index++]);
                            case '%c':
                                index++;
                                return '';
                        }
                    });
                    error = new Error(message);
                }
            } else error = new Error(args[0]);
        } else error = args.find((arg)=>arg instanceof Error);
        if (error && !error.message.includes('[parcel]') && typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            // Attempt to append the React component stack
            // TODO: use React.captureOwnerStack once stable.
            let hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (hook.renderers instanceof Map) {
                for (let renderer of hook.renderers.values())if (typeof renderer?.currentDispatcherRef?.getCurrentStack === 'function') {
                    let stack = renderer.currentDispatcherRef.getCurrentStack();
                    if (stack) {
                        error.stack += stack;
                        break;
                    }
                }
            }
            onError(error);
        }
        original.apply(console, args);
    };
/* eslint-enable no-console */ }
function $6d40ebe8356580e0$export$38ec23daa6e8dcdf(crash) {
    const crashWithFramesRunTime = $6d40ebe8356580e0$export$9123e6c9c0ac21ed(crash);
    $883a43040cbd0629$export$6503ec6e8aabbaf(window, (error)=>crashWithFramesRunTime(error, false));
    $900f8c32b7484e20$export$6503ec6e8aabbaf(window, (error)=>crashWithFramesRunTime(error, true));
    $5f72ade198404e99$export$6503ec6e8aabbaf();
    $6d40ebe8356580e0$var$patchConsole('error', (error)=>crashWithFramesRunTime(error, false));
    return function() {
        $5f72ade198404e99$export$d07f55d4c15c0440();
        $900f8c32b7484e20$export$d07f55d4c15c0440(window);
        $883a43040cbd0629$export$d07f55d4c15c0440(window);
    };
}
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ /**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ /* eslint-env browser */ var $10ecac3e4062713a$var$t, $10ecac3e4062713a$var$r, $10ecac3e4062713a$var$u, $10ecac3e4062713a$var$i, $10ecac3e4062713a$var$o = 0, $10ecac3e4062713a$var$f = [], $10ecac3e4062713a$var$c = $b6c7f0288a15c619$export$41c562ebe57d11e2, $10ecac3e4062713a$var$e = $10ecac3e4062713a$var$c.__b, $10ecac3e4062713a$var$a = $10ecac3e4062713a$var$c.__r, $10ecac3e4062713a$var$v = $10ecac3e4062713a$var$c.diffed, $10ecac3e4062713a$var$l = $10ecac3e4062713a$var$c.__c, $10ecac3e4062713a$var$m = $10ecac3e4062713a$var$c.unmount, $10ecac3e4062713a$var$s = $10ecac3e4062713a$var$c.__;
function $10ecac3e4062713a$var$p(n, t) {
    $10ecac3e4062713a$var$c.__h && $10ecac3e4062713a$var$c.__h($10ecac3e4062713a$var$r, n, $10ecac3e4062713a$var$o || t), $10ecac3e4062713a$var$o = 0;
    var u = $10ecac3e4062713a$var$r.__H || ($10ecac3e4062713a$var$r.__H = {
        __: [],
        __h: []
    });
    return n >= u.__.length && u.__.push({}), u.__[n];
}
function $10ecac3e4062713a$export$60241385465d0a34(n) {
    return $10ecac3e4062713a$var$o = 1, $10ecac3e4062713a$export$13e3392192263954($10ecac3e4062713a$var$D, n);
}
function $10ecac3e4062713a$export$13e3392192263954(n, u, i) {
    var o = $10ecac3e4062713a$var$p($10ecac3e4062713a$var$t++, 2);
    if (o.t = n, !o.__c && (o.__ = [
        i ? i(u) : $10ecac3e4062713a$var$D(void 0, u),
        function(n) {
            var t = o.__N ? o.__N[0] : o.__[0], r = o.t(t, n);
            t !== r && (o.__N = [
                r,
                o.__[1]
            ], o.__c.setState({}));
        }
    ], o.__c = $10ecac3e4062713a$var$r, !$10ecac3e4062713a$var$r.__f)) {
        var f = function(n, t, r) {
            if (!o.__c.__H) return !0;
            var u = o.__c.__H.__.filter(function(n) {
                return !!n.__c;
            });
            if (u.every(function(n) {
                return !n.__N;
            })) return !c || c.call(this, n, t, r);
            var i = o.__c.props !== n;
            return u.forEach(function(n) {
                if (n.__N) {
                    var t = n.__[0];
                    n.__ = n.__N, n.__N = void 0, t !== n.__[0] && (i = !0);
                }
            }), c && c.call(this, n, t, r) || i;
        };
        $10ecac3e4062713a$var$r.__f = !0;
        var c = $10ecac3e4062713a$var$r.shouldComponentUpdate, e = $10ecac3e4062713a$var$r.componentWillUpdate;
        $10ecac3e4062713a$var$r.componentWillUpdate = function(n, t, r) {
            if (this.__e) {
                var u = c;
                c = void 0, f(n, t, r), c = u;
            }
            e && e.call(this, n, t, r);
        }, $10ecac3e4062713a$var$r.shouldComponentUpdate = f;
    }
    return o.__N || o.__;
}
function $10ecac3e4062713a$export$6d9c69b0de29b591(n, u) {
    var i = $10ecac3e4062713a$var$p($10ecac3e4062713a$var$t++, 3);
    !$10ecac3e4062713a$var$c.__s && $10ecac3e4062713a$var$C(i.__H, u) && (i.__ = n, i.u = u, $10ecac3e4062713a$var$r.__H.__h.push(i));
}
function $10ecac3e4062713a$export$e5c5a5f917a5871c(n, u) {
    var i = $10ecac3e4062713a$var$p($10ecac3e4062713a$var$t++, 4);
    !$10ecac3e4062713a$var$c.__s && $10ecac3e4062713a$var$C(i.__H, u) && (i.__ = n, i.u = u, $10ecac3e4062713a$var$r.__h.push(i));
}
function $10ecac3e4062713a$export$b8f5890fc79d6aca(n) {
    return $10ecac3e4062713a$var$o = 5, $10ecac3e4062713a$export$1538c33de8887b59(function() {
        return {
            current: n
        };
    }, []);
}
function $10ecac3e4062713a$export$d5a552a76deda3c2(n, t, r) {
    $10ecac3e4062713a$var$o = 6, $10ecac3e4062713a$export$e5c5a5f917a5871c(function() {
        if ("function" == typeof n) {
            var r = n(t());
            return function() {
                n(null), r && "function" == typeof r && r();
            };
        }
        if (n) return n.current = t(), function() {
            return n.current = null;
        };
    }, null == r ? r : r.concat(n));
}
function $10ecac3e4062713a$export$1538c33de8887b59(n, r) {
    var u = $10ecac3e4062713a$var$p($10ecac3e4062713a$var$t++, 7);
    return $10ecac3e4062713a$var$C(u.__H, r) && (u.__ = n(), u.__H = r, u.__h = n), u.__;
}
function $10ecac3e4062713a$export$35808ee640e87ca7(n, t) {
    return $10ecac3e4062713a$var$o = 8, $10ecac3e4062713a$export$1538c33de8887b59(function() {
        return n;
    }, t);
}
function $10ecac3e4062713a$export$fae74005e78b1a27(n) {
    var u = $10ecac3e4062713a$var$r.context[n.__c], i = $10ecac3e4062713a$var$p($10ecac3e4062713a$var$t++, 9);
    return i.c = n, u ? (null == i.__ && (i.__ = !0, u.sub($10ecac3e4062713a$var$r)), u.props.value) : n.__;
}
function $10ecac3e4062713a$export$dc8fbce3eb94dc1e(n, t) {
    $10ecac3e4062713a$var$c.useDebugValue && $10ecac3e4062713a$var$c.useDebugValue(t ? t(n) : n);
}
function $10ecac3e4062713a$export$c052f6604b7d51fe(n) {
    var u = $10ecac3e4062713a$var$p($10ecac3e4062713a$var$t++, 10), i = $10ecac3e4062713a$export$60241385465d0a34();
    return u.__ = n, $10ecac3e4062713a$var$r.componentDidCatch || ($10ecac3e4062713a$var$r.componentDidCatch = function(n, t) {
        u.__ && u.__(n, t), i[1](n);
    }), [
        i[0],
        function() {
            i[1](void 0);
        }
    ];
}
function $10ecac3e4062713a$export$f680877a34711e37() {
    var n = $10ecac3e4062713a$var$p($10ecac3e4062713a$var$t++, 11);
    if (!n.__) {
        for(var u = $10ecac3e4062713a$var$r.__v; null !== u && !u.__m && null !== u.__;)u = u.__;
        var i = u.__m || (u.__m = [
            0,
            0
        ]);
        n.__ = "P" + i[0] + "-" + i[1]++;
    }
    return n.__;
}
function $10ecac3e4062713a$var$j() {
    for(var n; n = $10ecac3e4062713a$var$f.shift();)if (n.__P && n.__H) try {
        n.__H.__h.forEach($10ecac3e4062713a$var$z), n.__H.__h.forEach($10ecac3e4062713a$var$B), n.__H.__h = [];
    } catch (t) {
        n.__H.__h = [], $10ecac3e4062713a$var$c.__e(t, n.__v);
    }
}
$10ecac3e4062713a$var$c.__b = function(n) {
    $10ecac3e4062713a$var$r = null, $10ecac3e4062713a$var$e && $10ecac3e4062713a$var$e(n);
}, $10ecac3e4062713a$var$c.__ = function(n, t) {
    n && t.__k && t.__k.__m && (n.__m = t.__k.__m), $10ecac3e4062713a$var$s && $10ecac3e4062713a$var$s(n, t);
}, $10ecac3e4062713a$var$c.__r = function(n) {
    $10ecac3e4062713a$var$a && $10ecac3e4062713a$var$a(n), $10ecac3e4062713a$var$t = 0;
    var i = ($10ecac3e4062713a$var$r = n.__c).__H;
    i && ($10ecac3e4062713a$var$u === $10ecac3e4062713a$var$r ? (i.__h = [], $10ecac3e4062713a$var$r.__h = [], i.__.forEach(function(n) {
        n.__N && (n.__ = n.__N), n.u = n.__N = void 0;
    })) : (i.__h.forEach($10ecac3e4062713a$var$z), i.__h.forEach($10ecac3e4062713a$var$B), i.__h = [], $10ecac3e4062713a$var$t = 0)), $10ecac3e4062713a$var$u = $10ecac3e4062713a$var$r;
}, $10ecac3e4062713a$var$c.diffed = function(n) {
    $10ecac3e4062713a$var$v && $10ecac3e4062713a$var$v(n);
    var t = n.__c;
    t && t.__H && (t.__H.__h.length && (1 !== $10ecac3e4062713a$var$f.push(t) && $10ecac3e4062713a$var$i === $10ecac3e4062713a$var$c.requestAnimationFrame || (($10ecac3e4062713a$var$i = $10ecac3e4062713a$var$c.requestAnimationFrame) || $10ecac3e4062713a$var$w)($10ecac3e4062713a$var$j)), t.__H.__.forEach(function(n) {
        n.u && (n.__H = n.u), n.u = void 0;
    })), $10ecac3e4062713a$var$u = $10ecac3e4062713a$var$r = null;
}, $10ecac3e4062713a$var$c.__c = function(n, t) {
    t.some(function(n) {
        try {
            n.__h.forEach($10ecac3e4062713a$var$z), n.__h = n.__h.filter(function(n) {
                return !n.__ || $10ecac3e4062713a$var$B(n);
            });
        } catch (r) {
            t.some(function(n) {
                n.__h && (n.__h = []);
            }), t = [], $10ecac3e4062713a$var$c.__e(r, n.__v);
        }
    }), $10ecac3e4062713a$var$l && $10ecac3e4062713a$var$l(n, t);
}, $10ecac3e4062713a$var$c.unmount = function(n) {
    $10ecac3e4062713a$var$m && $10ecac3e4062713a$var$m(n);
    var t, r = n.__c;
    r && r.__H && (r.__H.__.forEach(function(n) {
        try {
            $10ecac3e4062713a$var$z(n);
        } catch (n) {
            t = n;
        }
    }), r.__H = void 0, t && $10ecac3e4062713a$var$c.__e(t, r.__v));
};
var $10ecac3e4062713a$var$k = "function" == typeof requestAnimationFrame;
function $10ecac3e4062713a$var$w(n) {
    var t, r = function() {
        clearTimeout(u), $10ecac3e4062713a$var$k && cancelAnimationFrame(t), setTimeout(n);
    }, u = setTimeout(r, 100);
    $10ecac3e4062713a$var$k && (t = requestAnimationFrame(r));
}
function $10ecac3e4062713a$var$z(n) {
    var t = $10ecac3e4062713a$var$r, u = n.__c;
    "function" == typeof u && (n.__c = void 0, u()), $10ecac3e4062713a$var$r = t;
}
function $10ecac3e4062713a$var$B(n) {
    var t = $10ecac3e4062713a$var$r;
    n.__c = n.__(), $10ecac3e4062713a$var$r = t;
}
function $10ecac3e4062713a$var$C(n, t) {
    return !n || n.length !== t.length || t.some(function(t, r) {
        return t !== n[r];
    });
}
function $10ecac3e4062713a$var$D(n, t) {
    return "function" == typeof t ? t(n) : t;
}
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ const $74bb4be6e9b78681$export$f30cb9bc4f736419 = {
    // Colors for components styles
    background: 'white',
    color: 'black',
    headerColor: '#ce1126',
    primaryPreBackground: 'rgba(206, 17, 38, 0.05)',
    primaryPreColor: 'inherit',
    secondaryPreBackground: 'rgba(251, 245, 180, 0.3)',
    secondaryPreColor: 'inherit',
    footer: '#878e91',
    anchorColor: '#878e91',
    toggleBackground: 'transparent',
    toggleColor: '#878e91',
    closeColor: '#293238',
    navBackground: 'rgba(206, 17, 38, 0.05)',
    navArrow: '#ce1126',
    diffAdded: 'green',
    diffRemoved: '#ce1126',
    // Light color scheme inspired by https://chriskempson.github.io/base16/css/base16-github.css
    // base00: '#ffffff',
    base01: '#f5f5f5',
    // base02: '#c8c8fa',
    base03: '#6e6e6e',
    // base04: '#e8e8e8',
    base05: '#333333',
    // base06: '#ffffff',
    // base07: '#ffffff',
    base08: '#881280',
    // base09: '#0086b3',
    // base0A: '#795da3',
    base0B: '#1155cc',
    base0C: '#994500',
    // base0D: '#795da3',
    base0E: '#c80000'
};
const $74bb4be6e9b78681$export$3e936a8db52a10a0 = {
    // Colors for components styles
    background: '#353535',
    color: 'white',
    headerColor: '#e83b46',
    primaryPreBackground: 'rgba(206, 17, 38, 0.1)',
    primaryPreColor: '#fccfcf',
    secondaryPreBackground: 'rgba(251, 245, 180, 0.1)',
    secondaryPreColor: '#fbf5b4',
    footer: '#878e91',
    anchorColor: '#878e91',
    toggleBackground: 'transparent',
    toggleColor: '#878e91',
    closeColor: '#ffffff',
    navBackground: 'rgba(206, 17, 38, 0.2)',
    navArrow: '#ce1126',
    diffAdded: '#85e285',
    diffRemoved: '#ff5459',
    // Dark color scheme inspired by https://github.com/atom/base16-tomorrow-dark-theme/blob/master/styles/colors.less
    // base00: '#1d1f21',
    base01: '#282a2e',
    // base02: '#373b41',
    base03: '#969896',
    // base04: '#b4b7b4',
    base05: '#c5c8c6',
    // base06: '#e0e0e0',
    // base07: '#ffffff',
    base08: '#cc6666',
    // base09: '#de935f',
    // base0A: '#f0c674',
    base0B: '#b5bd68',
    base0C: '#8abeb7',
    // base0D: '#81a2be',
    base0E: '#b294bb'
};
const $74bb4be6e9b78681$export$bca14c5b3b88a9c9 = Object.fromEntries(Object.keys($74bb4be6e9b78681$export$f30cb9bc4f736419).map((key)=>[
        key,
        `light-dark(${$74bb4be6e9b78681$export$f30cb9bc4f736419[key]}, ${$74bb4be6e9b78681$export$3e936a8db52a10a0[key]})`
    ]));
const $74bb4be6e9b78681$export$7ef984671d1853d7 = {
    width: '100vw',
    height: '100vh',
    maxWidth: 'none',
    maxHeight: 'none',
    border: 0,
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    textAlign: 'center',
    backgroundColor: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.background,
    outline: 'none',
    colorScheme: 'light dark'
};
const $20d888b381d18c6c$var$overlayStyle = {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    height: '100%',
    width: '1024px',
    maxWidth: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    padding: '0.5rem',
    boxSizing: 'border-box',
    textAlign: 'left',
    fontFamily: 'Consolas, Menlo, monospace',
    fontSize: '11px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: 1.5,
    color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.color
};
function $20d888b381d18c6c$var$ErrorOverlay(props) {
    const { shortcutHandler: shortcutHandler } = props;
    $10ecac3e4062713a$export$6d9c69b0de29b591(()=>{
        const onKeyDown = (e)=>{
            if (shortcutHandler) shortcutHandler(e.key);
        };
        window.addEventListener('keydown', onKeyDown);
        return ()=>{
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [
        shortcutHandler
    ]);
    return $23b7c1cb98b19658$export$34b9dba7ce09269b("div", {
        style: $20d888b381d18c6c$var$overlayStyle,
        children: props.children
    });
}
var $20d888b381d18c6c$export$2e2bcd8739ae039 = $20d888b381d18c6c$var$ErrorOverlay;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ const $7aae0c9ea64fc08c$var$closeButtonStyle = {
    color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.closeColor,
    lineHeight: '1rem',
    fontSize: '1.5rem',
    padding: '1rem',
    cursor: 'pointer',
    position: 'absolute',
    right: 0,
    top: 0
};
function $7aae0c9ea64fc08c$var$CloseButton({ close: close }) {
    return $23b7c1cb98b19658$export$34b9dba7ce09269b("span", {
        title: "Click or press Escape to dismiss.",
        onClick: close,
        style: $7aae0c9ea64fc08c$var$closeButtonStyle,
        children: "\xd7"
    });
}
var $7aae0c9ea64fc08c$export$2e2bcd8739ae039 = $7aae0c9ea64fc08c$var$CloseButton;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ const $1adc179a826c5dd2$var$navigationBarStyle = {
    marginBottom: '0.5rem'
};
const $1adc179a826c5dd2$var$buttonContainerStyle = {
    marginRight: '1em'
};
const $1adc179a826c5dd2$var$_navButtonStyle = {
    border: 'none',
    borderRadius: '4px',
    padding: '3px 6px',
    cursor: 'pointer'
};
const $1adc179a826c5dd2$var$leftButtonStyle = {
    ...$1adc179a826c5dd2$var$_navButtonStyle,
    backgroundColor: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.navBackground,
    color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.navArrow,
    borderTopRightRadius: '0px',
    borderBottomRightRadius: '0px',
    marginRight: '1px'
};
const $1adc179a826c5dd2$var$rightButtonStyle = {
    ...$1adc179a826c5dd2$var$_navButtonStyle,
    backgroundColor: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.navBackground,
    color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.navArrow,
    borderTopLeftRadius: '0px',
    borderBottomLeftRadius: '0px'
};
function $1adc179a826c5dd2$var$NavigationBar(props) {
    const { currentError: currentError, totalErrors: totalErrors, previous: previous, next: next } = props;
    return $23b7c1cb98b19658$export$34b9dba7ce09269b("div", {
        style: $1adc179a826c5dd2$var$navigationBarStyle,
        children: [
            $23b7c1cb98b19658$export$34b9dba7ce09269b("span", {
                style: $1adc179a826c5dd2$var$buttonContainerStyle,
                children: [
                    $23b7c1cb98b19658$export$34b9dba7ce09269b("button", {
                        onClick: previous,
                        style: $1adc179a826c5dd2$var$leftButtonStyle,
                        children: "\u2190"
                    }),
                    $23b7c1cb98b19658$export$34b9dba7ce09269b("button", {
                        onClick: next,
                        style: $1adc179a826c5dd2$var$rightButtonStyle,
                        children: "\u2192"
                    })
                ]
            }),
            `${currentError} of ${totalErrors} errors on the page`
        ]
    });
}
var $1adc179a826c5dd2$export$2e2bcd8739ae039 = $1adc179a826c5dd2$var$NavigationBar;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ /**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ const $c306e3a42547c8c2$var$headerStyle = {
    fontSize: '2em',
    fontFamily: 'sans-serif',
    color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.headerColor,
    whiteSpace: 'pre-wrap',
    // Top bottom margin spaces header
    // Right margin revents overlap with close button
    margin: '0 2rem 0.75rem 0',
    flex: '0 0 auto'
};
function $c306e3a42547c8c2$var$Header(props) {
    return $23b7c1cb98b19658$export$34b9dba7ce09269b("div", {
        style: $c306e3a42547c8c2$var$headerStyle,
        children: props.headerText
    });
}
var $c306e3a42547c8c2$export$2e2bcd8739ae039 = $c306e3a42547c8c2$var$Header;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ /**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ /**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ const $97c30df7f5c364f7$var$_preStyle = {
    position: 'relative',
    display: 'block',
    padding: '0.5em',
    marginTop: '0.5em',
    marginBottom: '0.5em',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    borderRadius: '0.25rem'
};
const $97c30df7f5c364f7$var$codeStyle = {
    fontFamily: 'Consolas, Menlo, monospace'
};
function $97c30df7f5c364f7$var$CodeBlock({ main: main, codeHTML: codeHTML }) {
    const primaryPreStyle = {
        ...$97c30df7f5c364f7$var$_preStyle,
        backgroundColor: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.primaryPreBackground,
        color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.primaryPreColor
    };
    const secondaryPreStyle = {
        ...$97c30df7f5c364f7$var$_preStyle,
        backgroundColor: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.secondaryPreBackground,
        color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.secondaryPreColor
    };
    const preStyle = main ? primaryPreStyle : secondaryPreStyle;
    return $23b7c1cb98b19658$export$34b9dba7ce09269b("pre", {
        style: preStyle,
        children: $23b7c1cb98b19658$export$34b9dba7ce09269b("code", {
            style: $97c30df7f5c364f7$var$codeStyle,
            dangerouslySetInnerHTML: {
                __html: codeHTML
            }
        })
    });
}
var $97c30df7f5c364f7$export$2e2bcd8739ae039 = $97c30df7f5c364f7$var$CodeBlock;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ function $f78f50d61026cdc5$export$44b1e5ee7f53eae1(sourceFileName, sourceLineNumber, sourceColumnNumber, fileName, lineNumber, columnNumber, compiled) {
    let prettyURL;
    if (!compiled && sourceFileName && typeof sourceLineNumber === 'number') {
        // Remove everything up to the first /src/ or /node_modules/
        const trimMatch = /^[/|\\].*?[/|\\]((src|node_modules)[/|\\].*)/.exec(sourceFileName);
        if (trimMatch && trimMatch[1]) prettyURL = trimMatch[1];
        else prettyURL = sourceFileName;
        prettyURL += ':' + sourceLineNumber;
        // Note: we intentionally skip 0's because they're produced by cheap webpack maps
        if (sourceColumnNumber) prettyURL += ':' + sourceColumnNumber;
    } else if (fileName && typeof lineNumber === 'number') {
        prettyURL = fileName + ':' + lineNumber;
        // Note: we intentionally skip 0's because they're produced by cheap webpack maps
        if (columnNumber) prettyURL += ':' + columnNumber;
    } else prettyURL = 'unknown';
    return prettyURL.replace('webpack://', '.');
}
var $f78f50d61026cdc5$export$2e2bcd8739ae039 = $f78f50d61026cdc5$export$44b1e5ee7f53eae1;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var $cdea3ae92bef6910$exports = {};
'use strict';
$cdea3ae92bef6910$exports = $cdea3ae92bef6910$var$ansiHTML;
// Reference to https://github.com/sindresorhus/ansi-regex
var $cdea3ae92bef6910$var$_regANSI = /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/;
var $cdea3ae92bef6910$var$_defColors = {
    reset: [
        'fff',
        '000'
    ],
    black: '000',
    red: 'ff0000',
    green: '209805',
    yellow: 'e8bf03',
    blue: '0000ff',
    magenta: 'ff00ff',
    cyan: '00ffee',
    lightgrey: 'f0f0f0',
    darkgrey: '888'
};
var $cdea3ae92bef6910$var$_styles = {
    30: 'black',
    31: 'red',
    32: 'green',
    33: 'yellow',
    34: 'blue',
    35: 'magenta',
    36: 'cyan',
    37: 'lightgrey'
};
var $cdea3ae92bef6910$var$_openTags = {
    '1': 'font-weight:bold',
    '2': 'opacity:0.5',
    '3': '<i>',
    '4': '<u>',
    '8': 'display:none',
    '9': '<del>' // delete
};
var $cdea3ae92bef6910$var$_closeTags = {
    '23': '</i>',
    '24': '</u>',
    '29': '</del>' // reset delete
};
[
    0,
    21,
    22,
    27,
    28,
    39,
    49
].forEach(function(n) {
    $cdea3ae92bef6910$var$_closeTags[n] = '</span>';
});
/**
 * Converts text with ANSI color codes to HTML markup.
 * @param {String} text
 * @returns {*}
 */ function $cdea3ae92bef6910$var$ansiHTML(text) {
    // Returns the text if the string has no ANSI escape code.
    if (!$cdea3ae92bef6910$var$_regANSI.test(text)) return text;
    // Cache opened sequence.
    var ansiCodes = [];
    // Replace with markup.
    var ret = text.replace(/\033\[(\d+)m/g, function(match, seq) {
        var ot = $cdea3ae92bef6910$var$_openTags[seq];
        if (ot) {
            // If current sequence has been opened, close it.
            if (!!~ansiCodes.indexOf(seq)) {
                ansiCodes.pop();
                return '</span>';
            }
            // Open tag.
            ansiCodes.push(seq);
            return ot[0] === '<' ? ot : '<span style="' + ot + ';">';
        }
        var ct = $cdea3ae92bef6910$var$_closeTags[seq];
        if (ct) {
            // Pop sequence
            ansiCodes.pop();
            return ct;
        }
        return '';
    });
    // Make sure tags are closed.
    var l = ansiCodes.length;
    l > 0 && (ret += Array(l + 1).join('</span>'));
    return ret;
}
/**
 * Customize colors.
 * @param {Object} colors reference to _defColors
 */ $cdea3ae92bef6910$var$ansiHTML.setColors = function(colors) {
    if (typeof colors !== 'object') throw new Error('`colors` parameter must be an Object.');
    var _finalColors = {};
    for(var key in $cdea3ae92bef6910$var$_defColors){
        var hex = colors.hasOwnProperty(key) ? colors[key] : null;
        if (!hex) {
            _finalColors[key] = $cdea3ae92bef6910$var$_defColors[key];
            continue;
        }
        if ('reset' === key) {
            if (typeof hex === 'string') hex = [
                hex
            ];
            if (!Array.isArray(hex) || hex.length === 0 || hex.some(function(h) {
                return typeof h !== 'string';
            })) throw new Error('The value of `' + key + '` property must be an Array and each item could only be a hex string, e.g.: FF0000');
            var defHexColor = $cdea3ae92bef6910$var$_defColors[key];
            if (!hex[0]) hex[0] = defHexColor[0];
            if (hex.length === 1 || !hex[1]) {
                hex = [
                    hex[0]
                ];
                hex.push(defHexColor[1]);
            }
            hex = hex.slice(0, 2);
        } else if (typeof hex !== 'string') throw new Error('The value of `' + key + '` property must be a hex string, e.g.: FF0000');
        _finalColors[key] = hex;
    }
    $cdea3ae92bef6910$var$_setTags(_finalColors);
};
/**
 * Reset colors.
 */ $cdea3ae92bef6910$var$ansiHTML.reset = function() {
    $cdea3ae92bef6910$var$_setTags($cdea3ae92bef6910$var$_defColors);
};
/**
 * Expose tags, including open and close.
 * @type {Object}
 */ $cdea3ae92bef6910$var$ansiHTML.tags = {};
if (Object.defineProperty) {
    Object.defineProperty($cdea3ae92bef6910$var$ansiHTML.tags, 'open', {
        get: function() {
            return $cdea3ae92bef6910$var$_openTags;
        }
    });
    Object.defineProperty($cdea3ae92bef6910$var$ansiHTML.tags, 'close', {
        get: function() {
            return $cdea3ae92bef6910$var$_closeTags;
        }
    });
} else {
    $cdea3ae92bef6910$var$ansiHTML.tags.open = $cdea3ae92bef6910$var$_openTags;
    $cdea3ae92bef6910$var$ansiHTML.tags.close = $cdea3ae92bef6910$var$_closeTags;
}
function $cdea3ae92bef6910$var$_setTags(colors) {
    // reset all
    $cdea3ae92bef6910$var$_openTags['0'] = 'font-weight:normal;opacity:1;color:#' + colors.reset[0] + ';background:#' + colors.reset[1];
    // inverse
    $cdea3ae92bef6910$var$_openTags['7'] = 'color:#' + colors.reset[1] + ';background:#' + colors.reset[0];
    // dark grey
    $cdea3ae92bef6910$var$_openTags['90'] = 'color:#' + colors.darkgrey;
    for(var code in $cdea3ae92bef6910$var$_styles){
        var color = $cdea3ae92bef6910$var$_styles[code];
        var oriColor = colors[color] || '000';
        $cdea3ae92bef6910$var$_openTags[code] = 'color:#' + oriColor;
        code = parseInt(code);
        $cdea3ae92bef6910$var$_openTags[(code + 10).toString()] = 'background:#' + oriColor;
    }
}
$cdea3ae92bef6910$var$ansiHTML.reset();
// Map ANSI colors from what babel-code-frame uses to base16-github
// See: https://github.com/babel/babel/blob/e86f62b304d280d0bab52c38d61842b853848ba6/packages/babel-code-frame/src/index.js#L9-L22
const $b67e2a05a9c13039$var$colors = {
    reset: [
        $74bb4be6e9b78681$export$bca14c5b3b88a9c9.base05,
        'transparent'
    ],
    black: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.base05,
    red: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.base08 /* marker, bg-invalid */ ,
    green: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.base0B /* string */ ,
    yellow: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.base08 /* capitalized, jsx_tag, punctuator */ ,
    blue: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.base0C,
    magenta: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.base0C /* regex */ ,
    cyan: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.base0E /* keyword */ ,
    gray: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.base03 /* comment, gutter */ ,
    lightgrey: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.base01,
    darkgrey: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.base03
};
/*@__PURE__*/ $parcel$interopDefault($cdea3ae92bef6910$exports).setColors($b67e2a05a9c13039$var$colors);
// $FlowFixMe
for(let tag in /*@__PURE__*/ $parcel$interopDefault($cdea3ae92bef6910$exports).tags.open)/*@__PURE__*/ $parcel$interopDefault($cdea3ae92bef6910$exports).tags.open[tag] = /*@__PURE__*/ $parcel$interopDefault($cdea3ae92bef6910$exports).tags.open[tag].replace(/#light-dark/g, 'light-dark');
function $b67e2a05a9c13039$var$generateAnsiHTML(txt) {
    return /*@__PURE__*/ $parcel$interopDefault($cdea3ae92bef6910$exports)(txt.replace(/[&<>"']/g, (c)=>{
        switch(c){
            case '&':
                return '&amp';
            case '<':
                return '&lt;';
            case '>':
                return '&gt';
            case '"':
                return '&quot;';
            case "'":
                return '&#39;';
            default:
                return c;
        }
    }));
}
var $b67e2a05a9c13039$export$2e2bcd8739ae039 = $b67e2a05a9c13039$var$generateAnsiHTML;
const $e0e0fa52b83f95a9$var$linkStyle = {
    fontSize: '0.9em',
    marginBottom: '0.9em'
};
const $e0e0fa52b83f95a9$var$anchorStyle = {
    textDecoration: 'none',
    color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.anchorColor,
    cursor: 'pointer'
};
const $e0e0fa52b83f95a9$var$codeAnchorStyle = {
    cursor: 'pointer'
};
const $e0e0fa52b83f95a9$var$toggleStyle = {
    color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.toggleColor,
    cursor: 'pointer',
    border: 'none',
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.toggleBackground,
    fontFamily: 'Consolas, Menlo, monospace',
    fontSize: '1em',
    padding: '0px',
    lineHeight: '1.5'
};
function $e0e0fa52b83f95a9$var$StackFrame(props) {
    const { frame: frame, critical: critical, showCode: showCode } = props;
    const { fileName: fileName, lineNumber: lineNumber, columnNumber: columnNumber, _scriptCode: scriptLines, _originalFileName: sourceFileName, _originalLineNumber: sourceLineNumber, _originalColumnNumber: sourceColumnNumber, _originalScriptCode: sourceLines } = frame;
    const functionName = frame.getFunctionName();
    const [compiled, setCompiled] = $10ecac3e4062713a$export$60241385465d0a34(!sourceLines);
    const getErrorLocation = ()=>{
        const { _originalFileName: fileName, _originalLineNumber: lineNumber } = props.frame;
        // Unknown file
        if (!fileName) return null;
        // e.g. "/path-to-my-app/webpack/bootstrap eaddeb46b67d75e4dfc1"
        const isInternalWebpackBootstrapCode = fileName.trim().indexOf(' ') !== -1;
        if (isInternalWebpackBootstrapCode) return null;
        // Code is in a real file
        return {
            fileName: fileName,
            lineNumber: lineNumber || 1
        };
    };
    const editorHandler = ()=>{
        const errorLoc = getErrorLocation();
        if (!errorLoc) return;
        props.editorHandler?.(errorLoc);
    };
    const url = $f78f50d61026cdc5$export$44b1e5ee7f53eae1(sourceFileName, sourceLineNumber, sourceColumnNumber, fileName, lineNumber, columnNumber, compiled);
    let codeBlockProps = null;
    if (showCode) {
        if (compiled && scriptLines && scriptLines.length !== 0 && lineNumber != null) codeBlockProps = {
            codeHTML: $b67e2a05a9c13039$export$2e2bcd8739ae039(scriptLines),
            main: critical
        };
        else if (!compiled && sourceLines && sourceLines.length !== 0 && sourceLineNumber != null) codeBlockProps = {
            codeHTML: $b67e2a05a9c13039$export$2e2bcd8739ae039(sourceLines),
            main: critical
        };
    }
    const canOpenInEditor = getErrorLocation() !== null && props.editorHandler !== null;
    return $23b7c1cb98b19658$export$34b9dba7ce09269b("div", {
        children: [
            $23b7c1cb98b19658$export$34b9dba7ce09269b("div", {
                children: functionName
            }),
            $23b7c1cb98b19658$export$34b9dba7ce09269b("div", {
                style: $e0e0fa52b83f95a9$var$linkStyle,
                children: $23b7c1cb98b19658$export$34b9dba7ce09269b("span", {
                    role: "link",
                    style: canOpenInEditor ? $e0e0fa52b83f95a9$var$anchorStyle : null,
                    onClick: canOpenInEditor ? editorHandler : null,
                    onKeyDown: canOpenInEditor ? (e)=>{
                        if (e.key === 'Enter') editorHandler();
                    } : null,
                    tabIndex: canOpenInEditor ? '0' : null,
                    children: url
                })
            }),
            codeBlockProps && $23b7c1cb98b19658$export$34b9dba7ce09269b("div", {
                style: {
                    marginBottom: '1.5em'
                },
                children: [
                    $23b7c1cb98b19658$export$34b9dba7ce09269b("span", {
                        onClick: canOpenInEditor ? editorHandler : null,
                        style: canOpenInEditor ? $e0e0fa52b83f95a9$var$codeAnchorStyle : null,
                        children: $23b7c1cb98b19658$export$34b9dba7ce09269b($97c30df7f5c364f7$export$2e2bcd8739ae039, {
                            ...codeBlockProps
                        })
                    }),
                    scriptLines && sourceLines && $23b7c1cb98b19658$export$34b9dba7ce09269b("button", {
                        style: $e0e0fa52b83f95a9$var$toggleStyle,
                        onClick: ()=>{
                            setCompiled(!compiled);
                        },
                        children: 'View ' + (compiled ? 'source' : 'compiled')
                    })
                ]
            })
        ]
    });
}
var $e0e0fa52b83f95a9$export$2e2bcd8739ae039 = $e0e0fa52b83f95a9$var$StackFrame;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ const $9a1abb59f5d10ec8$var$_collapsibleStyle = {
    cursor: 'pointer',
    border: 'none',
    display: 'block',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'Consolas, Menlo, monospace',
    fontSize: '1em',
    padding: '0px',
    lineHeight: '1.5'
};
const $9a1abb59f5d10ec8$var$collapsibleCollapsedStyle = {
    ...$9a1abb59f5d10ec8$var$_collapsibleStyle,
    color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.color,
    background: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.background,
    marginBottom: '1.5em'
};
const $9a1abb59f5d10ec8$var$collapsibleExpandedStyle = {
    ...$9a1abb59f5d10ec8$var$_collapsibleStyle,
    color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.color,
    background: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.background,
    marginBottom: '0.6em'
};
function $9a1abb59f5d10ec8$var$Collapsible(props) {
    const [collapsed, setCollapsed] = $10ecac3e4062713a$export$60241385465d0a34(true);
    const toggleCollapsed = ()=>{
        setCollapsed(!collapsed);
    };
    const count = props.children.length;
    return $23b7c1cb98b19658$export$34b9dba7ce09269b("details", {
        open: !collapsed,
        onToggle: toggleCollapsed,
        children: [
            $23b7c1cb98b19658$export$34b9dba7ce09269b("summary", {
                style: collapsed ? $9a1abb59f5d10ec8$var$collapsibleCollapsedStyle : $9a1abb59f5d10ec8$var$collapsibleExpandedStyle,
                children: (collapsed ? "\u25B6" : "\u25BC") + ` ${count} stack frames were ` + (collapsed ? 'collapsed.' : 'expanded.')
            }),
            $23b7c1cb98b19658$export$34b9dba7ce09269b("div", {
                children: [
                    props.children,
                    $23b7c1cb98b19658$export$34b9dba7ce09269b("button", {
                        onClick: toggleCollapsed,
                        style: $9a1abb59f5d10ec8$var$collapsibleExpandedStyle,
                        children: `\u{25B2} ${count} stack frames were expanded.`
                    })
                ]
            })
        ]
    });
}
var $9a1abb59f5d10ec8$export$2e2bcd8739ae039 = $9a1abb59f5d10ec8$var$Collapsible;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ function $e95d7084caaf4e6d$export$723fa77eef12dd9f(sourceFileName, fileName) {
    return sourceFileName == null || sourceFileName === '' || sourceFileName.indexOf('~/') !== -1 || sourceFileName.indexOf('node_modules/') !== -1 || sourceFileName.indexOf('error-overlay') !== -1 || sourceFileName.trim().indexOf(' ') !== -1 || fileName == null || fileName === '';
}
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ function $a5027556d7003a42$export$64794fcb05cf0bcf(errorName) {
    switch(errorName){
        case 'EvalError':
        case 'InternalError':
        case 'RangeError':
        case 'ReferenceError':
        case 'SyntaxError':
        case 'TypeError':
        case 'URIError':
            return true;
        default:
            return false;
    }
}
var $a5027556d7003a42$export$2e2bcd8739ae039 = $a5027556d7003a42$export$64794fcb05cf0bcf;
const $5ee7d2edb790dd06$var$traceStyle = {
    fontSize: '1em',
    flex: '0 1 auto',
    minHeight: '0px',
    overflow: 'auto'
};
function $5ee7d2edb790dd06$var$StackTrace(props) {
    const { stackFrames: stackFrames, errorName: errorName, contextSize: contextSize, editorHandler: editorHandler } = props;
    const renderedFrames = [];
    let hasReachedAppCode = false, currentBundle = [], bundleCount = 0;
    stackFrames.forEach((frame, index)=>{
        const { fileName: fileName, _originalFileName: sourceFileName } = frame;
        const isInternalUrl = $e95d7084caaf4e6d$export$723fa77eef12dd9f(sourceFileName, fileName);
        const isThrownIntentionally = !$a5027556d7003a42$export$64794fcb05cf0bcf(errorName);
        const shouldCollapse = isInternalUrl && (isThrownIntentionally || hasReachedAppCode);
        if (!isInternalUrl) hasReachedAppCode = true;
        const frameEle = $23b7c1cb98b19658$export$34b9dba7ce09269b($e0e0fa52b83f95a9$export$2e2bcd8739ae039, {
            frame: frame,
            contextSize: contextSize,
            critical: index === 0,
            showCode: !shouldCollapse,
            editorHandler: editorHandler
        }, 'frame-' + index);
        const lastElement = index === stackFrames.length - 1;
        if (shouldCollapse) currentBundle.push(frameEle);
        if (!shouldCollapse || lastElement) {
            if (currentBundle.length === 1) renderedFrames.push(currentBundle[0]);
            else if (currentBundle.length > 1) {
                bundleCount++;
                renderedFrames.push($23b7c1cb98b19658$export$34b9dba7ce09269b($9a1abb59f5d10ec8$export$2e2bcd8739ae039, {
                    children: currentBundle
                }, 'bundle-' + bundleCount));
            }
            currentBundle = [];
        }
        if (!shouldCollapse) renderedFrames.push(frameEle);
    });
    return $23b7c1cb98b19658$export$34b9dba7ce09269b("div", {
        style: $5ee7d2edb790dd06$var$traceStyle,
        children: renderedFrames
    });
}
var $5ee7d2edb790dd06$export$2e2bcd8739ae039 = $5ee7d2edb790dd06$var$StackTrace;
const $2eeadf2892cff4e4$var$diffStyle = {
    backgroundColor: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.primaryPreBackground,
    color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.primaryPreColor,
    padding: '0.5em',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    borderRadius: '0.25rem'
};
function $2eeadf2892cff4e4$export$2e2bcd8739ae039({ diff: diff }) {
    let lines = diff.split('\n').flatMap((line, i)=>[
            $2eeadf2892cff4e4$var$formatLine(line, i),
            '\n'
        ]).slice(0, -1);
    return $23b7c1cb98b19658$export$34b9dba7ce09269b("pre", {
        style: $2eeadf2892cff4e4$var$diffStyle,
        children: lines
    });
}
function $2eeadf2892cff4e4$var$formatLine(line, index) {
    if (line.startsWith('+')) return $23b7c1cb98b19658$export$34b9dba7ce09269b("span", {
        style: {
            color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.diffAdded,
            fontWeight: 'bold'
        },
        children: line
    }, index);
    else if (line.startsWith('-') || line.startsWith('>')) return $23b7c1cb98b19658$export$34b9dba7ce09269b("span", {
        style: {
            color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.diffRemoved,
            fontWeight: 'bold'
        },
        children: line
    }, index);
    else return line;
}
const $4baa71cb4cecc0ea$var$wrapperStyle = {
    display: 'flex',
    flexDirection: 'column'
};
function $4baa71cb4cecc0ea$var$RuntimeError({ errorRecord: errorRecord, editorHandler: editorHandler }) {
    const { error: error, unhandledRejection: unhandledRejection, contextSize: contextSize, stackFrames: stackFrames } = errorRecord;
    const errorName = unhandledRejection ? 'Unhandled Rejection (' + error.name + ')' : error.name;
    // Make header prettier
    const message = error.message;
    let headerText = message.match(/^\w*:/) || !errorName ? message : errorName + ': ' + message;
    headerText = headerText // TODO: maybe remove this prefix from fbjs?
    // It's just scaring people
    .replace(/^Invariant Violation:\s*/, '') // This is not helpful either:
    .replace(/^Warning:\s*/, '') // Break the actionable part to the next line.
    // AFAIK React 16+ should already do this.
    .replace(' Check the render method', '\n\nCheck the render method').replace(' Check your code at', '\n\nCheck your code at');
    let link, diff;
    if (headerText.includes('https://react.dev/link/hydration-mismatch')) {
        [headerText, diff] = headerText.split('https://react.dev/link/hydration-mismatch');
        link = 'https://react.dev/link/hydration-mismatch';
    } else if (headerText.includes('This will cause a hydration error.')) {
        [headerText, diff] = headerText.split('This will cause a hydration error.');
        headerText += 'This will cause a hydration error.';
    }
    let lines = headerText.split('\n');
    return $23b7c1cb98b19658$export$34b9dba7ce09269b("div", {
        style: $4baa71cb4cecc0ea$var$wrapperStyle,
        children: [
            $23b7c1cb98b19658$export$34b9dba7ce09269b($c306e3a42547c8c2$export$2e2bcd8739ae039, {
                headerText: lines[0]
            }),
            $23b7c1cb98b19658$export$34b9dba7ce09269b("pre", {
                children: lines.slice(1).join('\n').trim()
            }),
            link && $23b7c1cb98b19658$export$34b9dba7ce09269b("div", {
                children: $23b7c1cb98b19658$export$34b9dba7ce09269b("a", {
                    href: link,
                    target: "_blank",
                    rel: "noreferrer",
                    children: link
                })
            }),
            diff && $23b7c1cb98b19658$export$34b9dba7ce09269b($2eeadf2892cff4e4$export$2e2bcd8739ae039, {
                diff: diff.trim()
            }),
            $23b7c1cb98b19658$export$34b9dba7ce09269b($5ee7d2edb790dd06$export$2e2bcd8739ae039, {
                stackFrames: stackFrames,
                errorName: errorName,
                contextSize: contextSize,
                editorHandler: editorHandler
            })
        ]
    });
}
var $4baa71cb4cecc0ea$export$2e2bcd8739ae039 = $4baa71cb4cecc0ea$var$RuntimeError;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ const $7606db210182b733$var$footerStyle = {
    fontFamily: 'sans-serif',
    color: $74bb4be6e9b78681$export$bca14c5b3b88a9c9.footer,
    marginTop: '0.5rem',
    flex: '0 0 auto'
};
function $7606db210182b733$var$Footer(props) {
    return $23b7c1cb98b19658$export$34b9dba7ce09269b("div", {
        style: $7606db210182b733$var$footerStyle,
        children: [
            props.line1,
            $23b7c1cb98b19658$export$34b9dba7ce09269b("br", {}),
            props.line2
        ]
    });
}
var $7606db210182b733$export$2e2bcd8739ae039 = $7606db210182b733$var$Footer;
function $d0eac8b125ed15e2$var$RuntimeErrorContainer(props) {
    const { errorRecords: errorRecords, close: close } = props;
    const totalErrors = errorRecords.length;
    let [currentIndex, setCurrentIndex] = $10ecac3e4062713a$export$60241385465d0a34(0);
    let previous = ()=>{
        setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : totalErrors - 1);
    };
    let next = ()=>{
        setCurrentIndex(currentIndex < totalErrors - 1 ? currentIndex + 1 : 0);
    };
    return $23b7c1cb98b19658$export$34b9dba7ce09269b($20d888b381d18c6c$export$2e2bcd8739ae039, {
        shortcutHandler: (key)=>{
            if (key === 'Escape') props.close();
            else if (key === 'ArrowLeft') previous();
            else if (key === 'ArrowRight') next();
        },
        children: [
            $23b7c1cb98b19658$export$34b9dba7ce09269b($7aae0c9ea64fc08c$export$2e2bcd8739ae039, {
                close: close
            }),
            totalErrors > 1 && $23b7c1cb98b19658$export$34b9dba7ce09269b($1adc179a826c5dd2$export$2e2bcd8739ae039, {
                currentError: currentIndex + 1,
                totalErrors: totalErrors,
                previous: previous,
                next: next
            }),
            $23b7c1cb98b19658$export$34b9dba7ce09269b($4baa71cb4cecc0ea$export$2e2bcd8739ae039, {
                errorRecord: errorRecords[currentIndex],
                editorHandler: props.editorHandler
            }),
            $23b7c1cb98b19658$export$34b9dba7ce09269b($7606db210182b733$export$2e2bcd8739ae039, {
                line1: "This screen is visible only in development. It will not appear if the app crashes in production.",
                line2: "Open your browser\u2019s developer console to further inspect this error.  Click the 'X' or hit ESC to dismiss this message."
            })
        ]
    });
}
var $d0eac8b125ed15e2$export$2e2bcd8739ae039 = $d0eac8b125ed15e2$var$RuntimeErrorContainer;
let $da9882e673ac146b$var$iframe = null;
let $da9882e673ac146b$var$editorHandler = null;
let $da9882e673ac146b$var$currentRuntimeErrorRecords = [];
let $da9882e673ac146b$var$stopListeningToRuntimeErrors = null;
function $da9882e673ac146b$export$25a22ac46f1bd016(handler) {
    $da9882e673ac146b$var$editorHandler = handler;
    if ($da9882e673ac146b$var$iframe) $da9882e673ac146b$var$update();
}
function $da9882e673ac146b$export$74e9101ce4078c0(error, options) {
    $6d40ebe8356580e0$export$9123e6c9c0ac21ed($da9882e673ac146b$var$handleRuntimeError(options))(error, false);
}
function $da9882e673ac146b$export$cda2c88a41631c16(options) {
    if ($da9882e673ac146b$var$stopListeningToRuntimeErrors !== null) throw new Error('Already listening');
    $da9882e673ac146b$var$stopListeningToRuntimeErrors = $6d40ebe8356580e0$export$38ec23daa6e8dcdf($da9882e673ac146b$var$handleRuntimeError(options));
}
const $da9882e673ac146b$var$handleRuntimeError = (options)=>(errorRecord)=>{
        try {
            if (typeof options.onError === 'function') options.onError.call(null);
        } finally{
            if ($da9882e673ac146b$var$currentRuntimeErrorRecords.some(({ error: error })=>error === errorRecord.error)) // This fixes https://github.com/facebook/create-react-app/issues/3011.
            // eslint-disable-next-line no-unsafe-finally
            return;
            $da9882e673ac146b$var$currentRuntimeErrorRecords = $da9882e673ac146b$var$currentRuntimeErrorRecords.concat([
                errorRecord
            ]);
            $da9882e673ac146b$var$update();
        }
    };
function $da9882e673ac146b$export$1cfa6d161ca81bd9() {
    $da9882e673ac146b$var$currentRuntimeErrorRecords = [];
    $da9882e673ac146b$var$update();
}
function $da9882e673ac146b$export$25ba7d9a816639e7() {
    if ($da9882e673ac146b$var$stopListeningToRuntimeErrors === null) throw new Error('Not currently listening');
    try {
        $da9882e673ac146b$var$stopListeningToRuntimeErrors();
    } finally{
        $da9882e673ac146b$var$stopListeningToRuntimeErrors = null;
    }
}
let $da9882e673ac146b$var$rootNode, $da9882e673ac146b$var$shadow;
function $da9882e673ac146b$var$update() {
    if (!$da9882e673ac146b$var$rootNode) {
        $da9882e673ac146b$var$rootNode = document.createElement('parcel-error-overlay');
        $da9882e673ac146b$var$shadow = $da9882e673ac146b$var$rootNode.attachShadow({
            mode: 'open'
        });
        if ($da9882e673ac146b$var$rootNode) document.body?.appendChild($da9882e673ac146b$var$rootNode);
    }
    if ($da9882e673ac146b$var$currentRuntimeErrorRecords.length > 0 && $da9882e673ac146b$var$shadow) $b6c7f0288a15c619$export$b3890eb0ae9dca99($23b7c1cb98b19658$export$34b9dba7ce09269b("dialog", {
        ref: (d)=>d?.showModal(),
        style: $74bb4be6e9b78681$export$7ef984671d1853d7,
        onClose: $da9882e673ac146b$export$1cfa6d161ca81bd9,
        children: $23b7c1cb98b19658$export$34b9dba7ce09269b($da9882e673ac146b$var$ErrorOverlay, {})
    }), $da9882e673ac146b$var$shadow);
    else {
        $da9882e673ac146b$var$rootNode?.remove();
        $da9882e673ac146b$var$rootNode = null;
    }
}
function $da9882e673ac146b$var$ErrorOverlay() {
    if ($da9882e673ac146b$var$currentRuntimeErrorRecords.length > 0) return $23b7c1cb98b19658$export$34b9dba7ce09269b($d0eac8b125ed15e2$export$2e2bcd8739ae039, {
        errorRecords: $da9882e673ac146b$var$currentRuntimeErrorRecords,
        close: $da9882e673ac146b$export$1cfa6d161ca81bd9,
        editorHandler: $da9882e673ac146b$var$editorHandler
    });
    return null;
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4qoXW":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "setCookie", ()=>setCookie);
parcelHelpers.export(exports, "getCookie", ()=>getCookie);
const setCookie = (name, value, days)=>{
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 86400000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
};
const getCookie = (name)=>{
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for(let i = 0; i < ca.length; i++){
        let c = ca[i];
        while(c.charAt(0) === " ")c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"j8lWA":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "transformDataForBoard", ()=>transformDataForBoard);
parcelHelpers.export(exports, "saveBoardOrder", ()=>saveBoardOrder);
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
                    assignees: issue.assignees || [],
                    comment_count: issue.comment_count,
                    meta: issue.meta
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"rt0I0":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchAllAssignees", ()=>fetchAllAssignees);
var _issueApi = require("./issueApi"); // Reusing existing fetchUsers
const fetchAllAssignees = async ()=>{
    const users = await (0, _issueApi.fetchUsers)();
    return users.map((user)=>({
            id: user.id.toString(),
            display_name: user.display_name || user.name,
            slug: user.slug,
            avatar: user.avatar_urls?.["96"] || user.avatar_urls?.["48"] || user.avatar_urls?.["24"] || ""
        }));
};

},{"./issueApi":"bebt9","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}]},["9iTdJ","d8Dch"], "d8Dch", "parcelRequire55a0", {}, null, null, "http://localhost:1234")

//# sourceMappingURL=index.js.map
