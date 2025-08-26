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
const { render } = wp.element;
if (document.querySelector("#wp-admin-bar-alpaca-menu")) render(/*#__PURE__*/ React.createElement((0, _modalJsxDefault.default), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 12,
        columnNumber: 5
    },
    __self: undefined
}), document.querySelector("#wp-admin-bar-alpaca-report"));
if (document.querySelector("#alpaca-settings")) render(/*#__PURE__*/ React.createElement((0, _settingsJsxDefault.default), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 18,
        columnNumber: 10
    },
    __self: undefined
}), document.querySelector("#alpaca-settings"));
if (document.querySelector("#alpaca-board")) render(/*#__PURE__*/ React.createElement((0, _boardJsx.AlpacaBoard), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 22,
        columnNumber: 10
    },
    __self: undefined
}), document.querySelector("#alpaca-board"));
if (document.querySelector("#alpaca-board-controls")) render(/*#__PURE__*/ React.createElement((0, _boardJsx.AlpacaBoardControls), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 27,
        columnNumber: 5
    },
    __self: undefined
}), document.querySelector("#alpaca-board-controls"));

},{"./alpaca.scss":"1ItKB","./apitest.js":"jb82X","./modal.jsx":"lBZco","./settings.jsx":"aIYcP","./board.jsx":"h1t0l","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1ItKB":[function() {},{}],"jb82X":[function(require,module,exports,__globalThis) {
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
const { useState, useRef, useEffect, useCallback } = wp.element;
const AlpacaModal = ()=>{
    const [isOpen, setOpen] = useState(false);
    const [severity, setSeverity] = useState("2");
    const [status, setStatus] = useState("idle"); // idle, submitting, success, error
    const [message, setMessage] = useState("");
    const [feedback, setFeedback] = useState("");
    const textareaRef = useRef(null);
    const closeBtnRef = useRef(null);
    const openModal = useCallback(()=>{
        setMessage("");
        setStatus("idle");
        setFeedback("");
        setOpen(true);
    }, []);
    const closeModal = ()=>{
        setOpen(false);
        setStatus("idle");
    };
    // Listen for a global event to open the modal
    useEffect(()=>{
        const handleOpen = ()=>openModal();
        document.addEventListener("alpaca:open-modal", handleOpen);
        return ()=>document.removeEventListener("alpaca:open-modal", handleOpen);
    }, [
        openModal
    ]);
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
            // If on the board page, dispatch an event to add the new issue
            if (document.getElementById("alpaca-board")) document.dispatchEvent(new CustomEvent("alpaca:issue-submitted", {
                detail: {
                    issue: responseData.issue,
                    statusId: responseData.statusId
                }
            }));
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
            lineNumber: 113,
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
            lineNumber: 125,
            columnNumber: 9
        },
        __self: undefined
    }, status === "success" || status === "error" ? /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 140,
            columnNumber: 15
        },
        __self: undefined
    }, message), /*#__PURE__*/ React.createElement(Button, {
        variant: "primary",
        onClick: closeModal,
        ref: closeBtnRef,
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 141,
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
            lineNumber: 147,
            columnNumber: 15
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("div", {
        className: "small-wrapper",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 156,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("small", {
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 157,
            columnNumber: 17
        },
        __self: undefined
    }, "Detailed technical information will also be shared with the development team.")), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-actions",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 163,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        variant: "primary",
        onClick: submitIssue,
        disabled: status === "submitting",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 164,
            columnNumber: 17
        },
        __self: undefined
    }, status === "submitting" ? /*#__PURE__*/ React.createElement(Spinner, {
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 169,
            columnNumber: 46
        },
        __self: undefined
    }) : "Submit"), /*#__PURE__*/ React.createElement(Button, {
        variant: "secondary",
        onClick: closeModal,
        disabled: status === "submitting",
        __source: {
            fileName: "src/modal.jsx",
            lineNumber: 171,
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
var _statusManager = require("./components/StatusManager");
var _statusManagerDefault = parcelHelpers.interopDefault(_statusManager);
var _defaultStatusSelector = require("./components/DefaultStatusSelector");
var _defaultStatusSelectorDefault = parcelHelpers.interopDefault(_defaultStatusSelector);
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
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("h2", {
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 42,
            columnNumber: 7
        },
        __self: undefined
    }, "Status Management"), /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 43,
            columnNumber: 7
        },
        __self: undefined
    }, "Define the statuses (columns) for your project board. Use the arrow buttons to reorder."), /*#__PURE__*/ React.createElement((0, _statusManagerDefault.default), {
        statuses: statuses,
        fetchStatuses: fetchStatuses,
        isLoading: isLoading,
        error: error,
        onStatusesChange: handleStatusesOrderChange,
        defaultStatusId: defaultStatusId,
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 47,
            columnNumber: 7
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("hr", {
        style: {
            marginTop: "2rem"
        },
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 55,
            columnNumber: 7
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement((0, _defaultStatusSelectorDefault.default), {
        statuses: currentStatuses,
        onDefaultChange: handleDefaultStatusChange,
        __source: {
            fileName: "src/settings.jsx",
            lineNumber: 56,
            columnNumber: 7
        },
        __self: undefined
    }));
};
exports.default = AlpacaSettings;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./components/StatusManager":"4cgN2","./components/DefaultStatusSelector":"8A2rp"}],"4cgN2":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const { useState, useEffect, useRef } = wp.element;
const { Button, Spinner, Modal, TextControl } = wp.components;
const StatusManager = ({ statuses, fetchStatuses, isLoading, error, onStatusesChange, defaultStatusId })=>{
    const [statusToDelete, setStatusToDelete] = useState(null);
    const [localStatuses, setLocalStatuses] = useState(statuses);
    const [isUpdatingScores, setIsUpdatingScores] = useState(false);
    // fix: table flashes when statuses move
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
    const handleMove = (id, direction)=>{
        const oldIndex = localStatuses.findIndex((s)=>s.term_id === id);
        if (oldIndex === -1) return;
        const newIndex = oldIndex + direction;
        if (newIndex < 0 || newIndex >= localStatuses.length) return;
        const newStatuses = [
            ...localStatuses
        ];
        const [movedItem] = newStatuses.splice(oldIndex, 1);
        newStatuses.splice(newIndex, 0, movedItem);
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
            lineNumber: 154,
            columnNumber: 25
        },
        __self: undefined
    });
    if (error) return /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 155,
            columnNumber: 21
        },
        __self: undefined
    }, "Error: ", error);
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-status-manager",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 158,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("table", {
        className: "wp-list-table widefat striped",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 159,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("thead", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 160,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 161,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 162,
            columnNumber: 13
        },
        __self: undefined
    }, "Name"), /*#__PURE__*/ React.createElement("th", {
        className: "alpaca-status-manager-actions",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 163,
            columnNumber: 13
        },
        __self: undefined
    }, "Actions"))), /*#__PURE__*/ React.createElement("tbody", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 166,
            columnNumber: 9
        },
        __self: undefined
    }, localStatuses.map((status, index)=>/*#__PURE__*/ React.createElement(StatusRow, {
            key: status.term_id,
            status: status,
            onRename: handleRename,
            onDelete: handleDelete,
            onMove: handleMove,
            isFirst: index === 0,
            isLast: index === localStatuses.length - 1,
            __source: {
                fileName: "src/components/StatusManager.jsx",
                lineNumber: 168,
                columnNumber: 13
            },
            __self: undefined
        })))), /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 181,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        onClick: handleAddStatus,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 182,
            columnNumber: 9
        },
        __self: undefined
    }, "New Status")), statusToDelete && /*#__PURE__*/ React.createElement(Modal, {
        title: "Delete Status?",
        onRequestClose: cancelDelete,
        className: "alpaca-modal",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 188,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 193,
            columnNumber: 11
        },
        __self: undefined
    }, 'Are you sure you want to delete the status "', /*#__PURE__*/ React.createElement("strong", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 195,
            columnNumber: 13
        },
        __self: undefined
    }, statusToDelete.name), '"? This cannot be undone.'), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-actions",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 197,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        variant: "primary",
        isDestructive: true,
        onClick: performDelete,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 198,
            columnNumber: 13
        },
        __self: undefined
    }, "Delete"), /*#__PURE__*/ React.createElement(Button, {
        isSecondary: true,
        onClick: cancelDelete,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 201,
            columnNumber: 13
        },
        __self: undefined
    }, "Cancel"))));
};
// Simple StatusRow component without drag-and-drop
const StatusRow = ({ status, onRename, onDelete, onMove, isFirst, isLast })=>{
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
    return /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 251,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("td", {
        className: "alpaca-status-manager-name",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 252,
            columnNumber: 7
        },
        __self: undefined
    }, isRenaming ? /*#__PURE__*/ React.createElement(TextControl, {
        ref: inputRef,
        value: name,
        onChange: setName,
        onBlur: handleSaveRename,
        onKeyDown: handleKeyDown,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 254,
            columnNumber: 11
        },
        __self: undefined
    }) : /*#__PURE__*/ React.createElement("button", {
        className: "button-link",
        onClick: handleStartRename,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 262,
            columnNumber: 11
        },
        __self: undefined
    }, status.name, " ", /*#__PURE__*/ React.createElement("span", {
        className: "dashicons dashicons-edit",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 263,
            columnNumber: 27
        },
        __self: undefined
    }))), /*#__PURE__*/ React.createElement("td", {
        className: "alpaca-status-manager-actions",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 267,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        icon: "arrow-up-alt2",
        label: "Move Up",
        onClick: ()=>onMove(status.term_id, -1),
        disabled: isFirst,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 268,
            columnNumber: 9
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        icon: "arrow-down-alt2",
        label: "Move Down",
        onClick: ()=>onMove(status.term_id, 1),
        disabled: isLast,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 274,
            columnNumber: 9
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        icon: "trash",
        label: "Delete",
        // isDestructive
        onClick: ()=>onDelete(status.term_id),
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 280,
            columnNumber: 9
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        icon: "hidden",
        label: "Toggle Visibility",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 286,
            columnNumber: 9
        },
        __self: undefined
    })));
};
// todo: option to make status (in)visible
exports.default = StatusManager;

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
    if (error) return /*#__PURE__*/ React.createElement("p", {
        className: "alpaca-error",
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 73,
            columnNumber: 12
        },
        __self: undefined
    }, error);
    return /*#__PURE__*/ React.createElement("div", {
        style: {
            marginTop: "2rem"
        },
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 77,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("h3", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 78,
            columnNumber: 7
        },
        __self: undefined
    }, "Default Status for New Issues"), /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 79,
            columnNumber: 7
        },
        __self: undefined
    }, "Choose which status new issues should be assigned to by default."), /*#__PURE__*/ React.createElement("div", {
        style: {
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 80,
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
            lineNumber: 81,
            columnNumber: 9
        },
        __self: undefined
    }), (isFetching || isSaving) && /*#__PURE__*/ React.createElement(Spinner, {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 89,
            columnNumber: 38
        },
        __self: undefined
    })));
};
exports.default = DefaultStatusSelector;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"h1t0l":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "AlpacaBoard", ()=>(0, _boardFrame.AlpacaBoard));
parcelHelpers.export(exports, "AlpacaBoardControls", ()=>(0, _boardFrame.AlpacaBoardControls));
var _boardFrame = require("./components/BoardFrame");

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./components/BoardFrame":"5N5Bs"}],"5N5Bs":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "AlpacaBoard", ()=>AlpacaBoard);
parcelHelpers.export(exports, "AlpacaBoardControls", ()=>AlpacaBoardControls);
var _boardMain = require("./BoardMain");
var _boardMainDefault = parcelHelpers.interopDefault(_boardMain);
var _cookies = require("../utils/cookies");
const { useState, useEffect } = wp.element;
const { __experimentalToggleGroupControl: ToggleGroupControl, __experimentalToggleGroupControlOption: ToggleGroupControlOption, ComboboxControl } = wp.components;
function AlpacaBoard() {
    return /*#__PURE__*/ React.createElement((0, _boardMainDefault.default), {
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 11,
            columnNumber: 10
        },
        __self: this
    });
}
function AlpacaBoardControls() {
    // Use a string state instead of a boolean
    const [filterIssues, setFilterIssues] = useState(()=>{
        return (0, _cookies.getCookie)("alpaca_filter_issues") || "all";
    });
    const [allAssignees, setAllAssignees] = useState([]);
    const [filteredAssignee, setFilteredAssignee] = useState("");
    useEffect(()=>{
        // On mount, check for assignee data that may have been set globally
        // to win a race condition with the event firing.
        if (window.alpacaAssignees && window.alpacaAssignees.length > 0) setAllAssignees(window.alpacaAssignees);
        const handleAssigneesUpdated = (event)=>{
            const { assignees } = event.detail;
            if (assignees && Array.isArray(assignees)) setAllAssignees([
                ...assignees
            ]);
        };
        document.addEventListener("alpaca:assignees-updated", handleAssigneesUpdated);
        return ()=>{
            document.removeEventListener("alpaca:assignees-updated", handleAssigneesUpdated);
        };
    }, []);
    // This effect generates and injects the CSS for assignee filtering.
    useEffect(()=>{
        if (allAssignees.length > 0) {
            const styleId = "alpaca-assignee-filter-styles";
            let styleElement = document.getElementById(styleId);
            if (!styleElement) {
                styleElement = document.createElement("style");
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }
            let rules = `
        [class*="assignee-filter-"] .alpaca-item {
          display: none;
        }
      `;
            allAssignees.forEach((assignee)=>{
                rules += `
          #alpaca-board.assignee-filter-${assignee.id} .alpaca-item[data-assignee-${assignee.id}] {
            display: block;
          }
        `;
            });
            styleElement.innerHTML = rules;
        }
    }, [
        allAssignees
    ]);
    const boardElement = document.querySelector("#alpaca-board");
    useEffect(()=>{
        (0, _cookies.setCookie)("alpaca_filter_issues", filterIssues, 365);
        if (boardElement) {
            // Remove any existing filter classes first
            boardElement.classList.remove("filter-all", "filter-mine", "filter-watchlist");
            // Add the selected filter class
            boardElement.classList.add(`filter-${filterIssues}`);
        }
    }, [
        filterIssues,
        boardElement
    ]);
    useEffect(()=>{
        if (boardElement) {
            // Remove previous assignee filters
            boardElement.className = boardElement.className.replace(/\s*assignee-filter-\S*/g, "");
            if (filteredAssignee) boardElement.classList.add(`assignee-filter-${filteredAssignee}`);
        }
    }, [
        filteredAssignee,
        boardElement
    ]);
    // Set initial class on mount
    useEffect(()=>{
        if (boardElement) boardElement.classList.add(`filter-${filterIssues}`);
    }, [
        boardElement
    ]);
    // Clear the assignee filter if the selected assignee is no longer valid.
    useEffect(()=>{
        if (filteredAssignee && allAssignees.length > 0) {
            const isFilteredAssigneeStillPresent = allAssignees.some((assignee)=>assignee.id.toString() === filteredAssignee);
            if (!isFilteredAssigneeStillPresent) setFilteredAssignee("");
        }
    }, [
        allAssignees,
        filteredAssignee
    ]);
    const assigneeOptions = (allAssignees || []).filter((assignee)=>assignee && assignee.id).map((assignee)=>({
            value: assignee.id.toString(),
            label: assignee.display_name || assignee.slug || "Unnamed"
        }));
    if (typeof alpacaUserData === "undefined" || !alpacaUserData.currentUserId) return null; // Don't render if we don't know the current user
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-board-controls",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 140,
            columnNumber: 5
        },
        __self: this
    }, /*#__PURE__*/ React.createElement(ToggleGroupControl, {
        className: "alpaca-board-filter",
        value: filterIssues,
        onChange: (value)=>setFilterIssues(value),
        isBlock: true,
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 141,
            columnNumber: 7
        },
        __self: this
    }, /*#__PURE__*/ React.createElement(ToggleGroupControlOption, {
        value: "all",
        label: "All Issues",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 147,
            columnNumber: 9
        },
        __self: this
    }), /*#__PURE__*/ React.createElement(ToggleGroupControlOption, {
        value: "mine",
        label: "Assigned to me",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 148,
            columnNumber: 9
        },
        __self: this
    }), /*#__PURE__*/ React.createElement(ToggleGroupControlOption, {
        value: "watchlist",
        label: "Starred",
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 149,
            columnNumber: 9
        },
        __self: this
    })), /*#__PURE__*/ React.createElement(ComboboxControl, {
        label: "Filter by Assignee",
        // value={filteredAssignee}
        onChange: setFilteredAssignee,
        options: assigneeOptions,
        __source: {
            fileName: "src/components/BoardFrame.jsx",
            lineNumber: 151,
            columnNumber: 7
        },
        __self: this
    }));
}

},{"../utils/cookies":"4qoXW","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./BoardMain":"1nh76"}],"4qoXW":[function(require,module,exports,__globalThis) {
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1nh76":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _core = require("@dnd-kit/core");
var _sortable = require("@dnd-kit/sortable");
var _issue = require("./issue");
var _issueDefault = parcelHelpers.interopDefault(_issue);
var _item = require("./Item");
var _itemDefault = parcelHelpers.interopDefault(_item);
var _container = require("./Container");
var _containerDefault = parcelHelpers.interopDefault(_container);
var _cookies = require("../utils/cookies");
var _data = require("../utils/data");
var _comments = require("../utils/comments");
const { useState, useRef, useEffect, useCallback } = wp.element;
/**
 * Main board component.
 */ function Board() {
    const [containers, setContainers] = useState(()=>{
        if (typeof alpacaBoardData !== "undefined") return (0, _data.transformDataForBoard)(alpacaBoardData);
        return [];
    });
    const sensors = (0, _core.useSensors)((0, _core.useSensor)((0, _core.PointerSensor), {
        activationConstraint: {
            distance: 5
        }
    }));
    const [activeId, setActiveId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const triggerRef = useRef(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [needsSave, setNeedsSave] = useState(false);
    const [originalContainerId, setOriginalContainerId] = useState(null);
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
    const createIssueComment = (issueId, commentContent)=>{
        return wp.apiFetch({
            path: `/wp/v2/comments`,
            method: "POST",
            data: {
                content: commentContent,
                post: issueId,
                comment_type: "issuecomment"
            }
        }).then(()=>{
            const item = getItemById(issueId);
            if (item && typeof item.comment_count !== "undefined") handleCommentCountChange(issueId, item.comment_count + 1);
        }).catch((err)=>{
            console.error("Error creating status change comment:", err);
            throw err;
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
    function handleDragStart(event) {
        const { active } = event;
        setActiveId(active.id);
        setDraggedItem(getItemById(active.id));
        const container = findContainerByItemId(active.id);
        if (container) setOriginalContainerId(container.id);
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
        if (over && originalContainerId) {
            const overContainer = findContainerByItemId(over.id) || findContainerById(over.id);
            if (overContainer && overContainer.id !== originalContainerId) {
                const originalContainer = findContainerById(originalContainerId);
                if (originalContainer) {
                    const commentContent = (0, _comments.generateStatusChangeComment)(originalContainer.title, overContainer.title);
                    createIssueComment(active.id, commentContent);
                }
            }
        }
        setActiveId(null);
        setDraggedItem(null);
        setOriginalContainerId(null);
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
        (0, _data.saveBoardOrder)();
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
    const onCommentCountChangeForIssue = useCallback((newCount)=>selectedItem?.id && handleCommentCountChange(selectedItem.id, newCount), [
        selectedItem,
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
        const commentContent = (0, _comments.generateStatusChangeComment)(sourceContainer.title, nextContainer.title);
        itemsToMove.forEach((item)=>{
            wp.apiFetch({
                path: `/wp/v2/comments`,
                method: "POST",
                data: {
                    content: commentContent,
                    post: item.id,
                    comment_type: "issuecomment"
                }
            }).catch((err)=>console.error(`Error creating status change comment for issue ${item.id}:`, err));
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
    const handleAssigneesChange = async (issueId, newAssignees)=>{
        const enrichedAssignees = await Promise.all(newAssignees.map(async (assignee)=>{
            if (assignee && assignee.id && !assignee.display_name) try {
                const fullUser = await wp.apiFetch({
                    path: `/wp/v2/users/${assignee.id}`
                });
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
    const closeModal = ()=>{
        setSelectedItem(null);
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
        const handleIssueSubmitted = (event)=>{
            const { issue, statusId } = event.detail;
            if (!issue || !statusId) return;
            setContainers((prevContainers)=>{
                const newContainers = [
                    ...prevContainers
                ];
                const targetContainer = newContainers.find((c)=>c.id === statusId.toString());
                if (targetContainer) targetContainer.items.unshift({
                    id: issue.id.toString(),
                    content: issue.title,
                    author_name: issue.author_name,
                    author_img: issue.author_img,
                    assignees: [],
                    comment_count: issue.comment_count ?? 0
                });
                return newContainers;
            });
            setNeedsSave(true);
        };
        document.addEventListener("alpaca:issue-submitted", handleIssueSubmitted);
        return ()=>document.removeEventListener("alpaca:issue-submitted", handleIssueSubmitted);
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
        window.alpacaAssignees = assigneesArray;
        const event = new CustomEvent("alpaca:assignees-updated", {
            detail: {
                assignees: assigneesArray
            }
        });
        document.dispatchEvent(event);
    }, [
        containers
    ]);
    return /*#__PURE__*/ React.createElement((0, _core.DndContext), {
        sensors: sensors,
        collisionDetection: (0, _core.closestCenter),
        onDragStart: handleDragStart,
        onDragOver: handleDragOver,
        onDragEnd: handleDragEnd,
        __source: {
            fileName: "src/components/BoardMain.jsx",
            lineNumber: 483,
            columnNumber: 5
        },
        __self: this
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-wrap",
        __source: {
            fileName: "src/components/BoardMain.jsx",
            lineNumber: 490,
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
            __source: {
                fileName: "src/components/BoardMain.jsx",
                lineNumber: 492,
                columnNumber: 11
            },
            __self: this
        }))), /*#__PURE__*/ React.createElement((0, _core.DragOverlay), {
        dropAnimation: null,
        __source: {
            fileName: "src/components/BoardMain.jsx",
            lineNumber: 506,
            columnNumber: 7
        },
        __self: this
    }, activeId && draggedItem ? /*#__PURE__*/ React.createElement((0, _itemDefault.default), {
        id: draggedItem.id,
        content: draggedItem.content,
        assignees: draggedItem.assignees,
        comment_count: draggedItem.comment_count,
        meta: draggedItem.meta,
        className: "alpaca-item-dragging",
        __source: {
            fileName: "src/components/BoardMain.jsx",
            lineNumber: 508,
            columnNumber: 11
        },
        __self: this
    }) : null), /*#__PURE__*/ React.createElement((0, _issueDefault.default), {
        issueId: selectedItem?.id,
        isOpen: !!selectedItem,
        onClose: closeModal,
        triggerRef: triggerRef,
        onCommentCountChange: onCommentCountChangeForIssue,
        onAssigneesChange: handleAssigneesChange,
        onDeadlineChange: handleDeadlineChange,
        createIssueComment: createIssueComment,
        generateAssigneeChangeComment: (0, _comments.generateAssigneeChangeComment),
        __source: {
            fileName: "src/components/BoardMain.jsx",
            lineNumber: 519,
            columnNumber: 7
        },
        __self: this
    }));
}
exports.default = Board;

},{"@dnd-kit/core":"do19q","@dnd-kit/sortable":"fw7EW","./Item":"2yEr4","./Container":"QNfzH","../utils/cookies":"4qoXW","../utils/data":"j8lWA","../utils/comments":"hPhNI","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./issue":"l6q71"}],"do19q":[function(require,module,exports,__globalThis) {
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

},{"react":"f39IF","@dnd-kit/core":"do19q","@dnd-kit/utilities":"a2exI","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"2yEr4":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _user = require("./User");
var _userDefault = parcelHelpers.interopDefault(_user);
const { forwardRef, useState, useEffect } = wp.element;
const Item = forwardRef(({ id, content, assignees = [], comment_count, meta, className, style, ...props }, ref)=>{
    const [isWatched, setIsWatched] = useState(false);
    useEffect(()=>{
        wp.apiFetch({
            path: "/alpaca/v1/watchlist"
        }).then((watchlist)=>{
            if (watchlist && Array.isArray(watchlist) && watchlist.includes(id)) setIsWatched(true);
        });
    }, [
        id
    ]);
    const toggleWatch = (e)=>{
        e.stopPropagation();
        wp.apiFetch({
            path: "/alpaca/v1/watchlist",
            method: "POST",
            data: {
                issue_id: id
            }
        }).then((response)=>{
            if (response.success) setIsWatched(response.watchlist.includes(id));
        });
    };
    const assigneeDataAttributes = assignees.reduce((acc, assignee)=>{
        if (assignee && assignee.id) acc[`data-assignee-${assignee.id}`] = "";
        return acc;
    }, {});
    const watchedClass = isWatched ? "is-watched" : "";
    const deadline = meta && meta.deadline && meta.deadline[0] ? new Date(meta.deadline[0]) : null;
    const isValidDeadline = deadline && !isNaN(deadline);
    let diffDays = null;
    if (isValidDeadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadline.setHours(0, 0, 0, 0);
        diffDays = Math.ceil((deadline - today) / 86400000);
    }
    return /*#__PURE__*/ React.createElement("div", {
        ref: ref,
        className: `${className} ${watchedClass}`,
        style: style,
        "data-id": id,
        ...assigneeDataAttributes,
        ...props,
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 65,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-upper",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 73,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-content",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 74,
            columnNumber: 11
        },
        __self: undefined
    }, content), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-controls",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 75,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "dashicons dashicons-star-filled",
        onClick: toggleWatch,
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 76,
            columnNumber: 13
        },
        __self: undefined
    }))), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-meta",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 82,
            columnNumber: 9
        },
        __self: undefined
    }, assignees.length > 0 && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-assignees",
        "data-assignees": assignees.length,
        title: assignees.length === 1 ? assignees[0].display_name || assignees[0].name : assignees.map((a)=>a.display_name || a.name).join(", "),
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 85,
            columnNumber: 13
        },
        __self: undefined
    }, assignees.map((assignee)=>/*#__PURE__*/ React.createElement((0, _userDefault.default), {
            key: assignee.id,
            user: assignee,
            __source: {
                fileName: "src/components/Item.jsx",
                lineNumber: 95,
                columnNumber: 17
            },
            __self: undefined
        }))), typeof comment_count !== "undefined" && comment_count > 0 && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-comment-count has-dashicon",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 102,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("span", {
        className: "dashicons dashicons-admin-comments",
        "aria-hidden": "true",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 103,
            columnNumber: 15
        },
        __self: undefined
    }), comment_count), isValidDeadline && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-deadline has-dashicon",
        "data-diff-days": diffDays,
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 113,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("span", {
        className: "dashicons dashicons-calendar",
        "aria-hidden": "true",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 117,
            columnNumber: 15
        },
        __self: undefined
    }), diffDays > 0 ? `${diffDays} day${diffDays > 1 ? "s" : ""} left` : diffDays === 0 ? "Today" : `${Math.abs(diffDays)} day${diffDays < -1 ? "s" : ""} ago`)));
});
exports.default = Item;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./User":"enwL1"}],"enwL1":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _usercache = require("../utils/usercache");
const { useState, useEffect } = wp.element;
const User = ({ user })=>{
    const [userData, setUserData] = useState(typeof user === "object" ? user : null);
    const [loading, setLoading] = useState(typeof user === "number");
    useEffect(()=>{
        if (typeof user === "number" || typeof user === "string" && !isNaN(user)) {
            const userId = parseInt(user, 10);
            setLoading(true);
            (0, _usercache.getUser)(userId).then(setUserData).catch((err)=>{
                console.error("Error fetching user:", err);
                setUserData(null);
            }).finally(()=>setLoading(false));
        } else if (typeof user === "object") setUserData(user);
        else setUserData(null);
    }, [
        user
    ]);
    if (loading) return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user",
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 31,
            columnNumber: 23
        },
        __self: undefined
    }, "Loading...");
    if (!userData) return null;
    const { name, avatar, display_name, avatar_urls } = userData;
    const userName = display_name || name;
    const avatarUrl = avatar || avatar_urls && avatar_urls[96];
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user",
        title: userName,
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 39,
            columnNumber: 5
        },
        __self: undefined
    }, avatarUrl && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user-avatar",
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 41,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("img", {
        src: avatarUrl,
        alt: `Avatar of ${userName}`,
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 42,
            columnNumber: 11
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user-name",
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 45,
            columnNumber: 7
        },
        __self: undefined
    }, userName));
};
exports.default = User;

},{"../utils/usercache":"gUv4D","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gUv4D":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getUser", ()=>getUser);
const cache = new Map();
async function getUser(id) {
    if (cache.has(id)) return cache.get(id);
    const user = await wp.apiFetch({
        path: `/wp/v2/users/${id}`
    });
    cache.set(id, user);
    return user;
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"QNfzH":[function(require,module,exports,__globalThis) {
var $parcel$ReactRefreshHelpers$2ee0 = require("@parcel/transformer-react-refresh-wrap/lib/helpers/helpers.js");
$parcel$ReactRefreshHelpers$2ee0.init();
var prevRefreshReg = globalThis.$RefreshReg$;
var prevRefreshSig = globalThis.$RefreshSig$;
$parcel$ReactRefreshHelpers$2ee0.prelude(module);

try {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _react = require("react");
var _sortable = require("@dnd-kit/sortable");
var _sortableItem = require("./SortableItem");
var _sortableItemDefault = parcelHelpers.interopDefault(_sortableItem);
const { DropdownMenu, TextControl } = wp.components;
/**
 * Container component (delegates rename to parent via onRename).
 */ function Container({ id, title, items, onItemClick, onMoveAllToNext, isLastContainer, isHidden, onToggleHidden, onRename }) {
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
        title: "Move all to next column",
        onClick: ()=>onMoveAllToNext(id),
        disabled: !hasItems
    });
    return /*#__PURE__*/ React.createElement("div", {
        className: `alpaca-container ${isHidden ? "hidden" : ""}`,
        "data-id": id,
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 101,
            columnNumber: 5
        },
        __self: this
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-container-header",
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 105,
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
            lineNumber: 107,
            columnNumber: 11
        },
        __self: this
    }) : /*#__PURE__*/ React.createElement("h2", {
        className: "alpaca-container-title",
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 116,
            columnNumber: 11
        },
        __self: this
    }, title, " ", /*#__PURE__*/ React.createElement("span", {
        className: "alpaca-item-count",
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 117,
            columnNumber: 21
        },
        __self: this
    }, items.length)), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-container-controls",
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 120,
            columnNumber: 9
        },
        __self: this
    }, /*#__PURE__*/ React.createElement(DropdownMenu, {
        icon: "menu",
        label: "Options",
        controls: menuControls,
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 121,
            columnNumber: 11
        },
        __self: this
    }))), /*#__PURE__*/ React.createElement((0, _sortable.SortableContext), {
        id: id,
        items: hasItems ? items.map((item)=>item.id) : [
            id
        ],
        strategy: (0, _sortable.verticalListSortingStrategy),
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 124,
            columnNumber: 7
        },
        __self: this
    }, hasItems ? items.map((item)=>/*#__PURE__*/ React.createElement((0, _sortableItemDefault.default), {
            className: "alpaca-item",
            key: item.id,
            id: item.id,
            content: item.content,
            assignees: item.assignees,
            comment_count: item.comment_count,
            meta: item.meta,
            onClick: onItemClick,
            __source: {
                fileName: "src/components/Container.jsx",
                lineNumber: 131,
                columnNumber: 13
            },
            __self: this
        })) : /*#__PURE__*/ React.createElement((0, _sortableItemDefault.default), {
        key: id,
        id: id,
        className: "alpaca-item empty",
        content: "Drop items here",
        isDragDisabled: true,
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 143,
            columnNumber: 11
        },
        __self: this
    })));
}
exports.default = Container;

  $parcel$ReactRefreshHelpers$2ee0.postlude(module);
} finally {
  globalThis.$RefreshReg$ = prevRefreshReg;
  globalThis.$RefreshSig$ = prevRefreshSig;
}
},{"@dnd-kit/sortable":"fw7EW","./SortableItem":"ji6pg","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","react":"f39IF","@parcel/transformer-react-refresh-wrap/lib/helpers/helpers.js":"km3Ru"}],"ji6pg":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _sortable = require("@dnd-kit/sortable");
var _utilities = require("@dnd-kit/utilities");
var _item = require("./Item");
var _itemDefault = parcelHelpers.interopDefault(_item);
/**
 * Sortable item component.
 */ function SortableItem({ id, content, className, isDragDisabled = false, onClick, assignees = [], comment_count, meta }) {
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
    return /*#__PURE__*/ React.createElement((0, _itemDefault.default), {
        ref: setNodeRef,
        id: id,
        content: content,
        assignees: assignees,
        comment_count: comment_count,
        meta: meta,
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
            fileName: "src/components/SortableItem.jsx",
            lineNumber: 46,
            columnNumber: 5
        },
        __self: this
    });
}
exports.default = SortableItem;

},{"@dnd-kit/sortable":"fw7EW","@dnd-kit/utilities":"a2exI","./Item":"2yEr4","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"km3Ru":[function(require,module,exports,__globalThis) {
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"hPhNI":[function(require,module,exports,__globalThis) {
/**
 * Generates HTML for an assignee span to be used in comments.
 * @param {object} user The user object for the assignee.
 * @returns {string} HTML string.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "generateAssigneeSpan", ()=>generateAssigneeSpan);
parcelHelpers.export(exports, "generateStatusChangeComment", ()=>generateStatusChangeComment);
parcelHelpers.export(exports, "generateAssigneeChangeComment", ()=>generateAssigneeChangeComment);
const generateAssigneeSpan = (user)=>{
    if (!user) return "";
    const avatarAttr = user.avatar ? ` data-avatar="${user.avatar}"` : "";
    return `<span class="alpaca-status-assignee" data-userid="${user.id}"${avatarAttr}>${user.name}</span>`;
};
/**
 * Generates HTML for a status change comment.
 * @param {string} fromStatus The title of the original status.
 * @param {string} toStatus The title of the new status.
 * @returns {string} HTML string.
 */ const generateStatusChangeComment = (fromStatus, toStatus)=>{
    return `Item moved from status <span class="alpaca-status-comment">${fromStatus}</span> to <span class="alpaca-status-comment">${toStatus}</span>`;
};
/**
 * Generates HTML for an assignee change comment.
 * @param {object} user The user object for the assignee.
 * @param {boolean} isAssigned True if the user was assigned, false if unassigned.
 * @returns {string} HTML string.
 */ const generateAssigneeChangeComment = (user, isAssigned)=>{
    const assigneeSpan = generateAssigneeSpan(user);
    if (isAssigned) return `${assigneeSpan} has been assigned to this issue.`;
    return `${assigneeSpan} is no longer assigned to this issue.`;
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"l6q71":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _commentingJsx = require("./commenting.jsx");
var _commentingJsxDefault = parcelHelpers.interopDefault(_commentingJsx);
var _user = require("./User");
var _userDefault = parcelHelpers.interopDefault(_user);
const { useState, useEffect, useRef } = wp.element;
const { Modal, FormTokenField, DatePicker, Popover, BaseControl } = wp.components;
const { decodeEntities } = wp.htmlEntities;
const { date } = wp;
const datesettings = wp.date.getSettings();
const AlpacaIssue = ({ issueId, isOpen, onClose, triggerRef, onCommentCountChange, onAssigneesChange, onDeadlineChange, createIssueComment, generateAssigneeChangeComment })=>{
    const [issueDetails, setIssueDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [allUsers, setAllUsers] = useState([]); // display names for suggestions
    const [allUserObjects, setAllUserObjects] = useState([]); // full user objects
    const [assignees, setAssignees] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [userMap, setUserMap] = useState({}); // Map display name -> slug
    const [commentRefreshKey, setCommentRefreshKey] = useState(0);
    const [deadline, setDeadline] = useState(null);
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const calendarButtonRef = useRef();
    // Fetch all users and issue details concurrently
    useEffect(()=>{
        if (issueId && isOpen) {
            setIsLoadingDetails(true);
            const usersPromise = wp.apiFetch({
                path: "/alpaca/v1/users"
            });
            const issuePromise = wp.apiFetch({
                path: `/issue/v1/get/${issueId}`
            });
            Promise.all([
                usersPromise,
                issuePromise
            ]).then(([users, issueData])=>{
                // 1. Process users first to build the map
                const usersWithAvatar = users.map((u)=>({
                        ...u,
                        avatar: u.avatar_urls?.["48"] || u.avatar_urls?.["96"] || u.avatar_urls?.["24"] || ""
                    }));
                const localUserMap = {};
                usersWithAvatar.forEach((u)=>{
                    localUserMap[u.name] = u.slug;
                    localUserMap[u.slug] = u.slug; // For reverse lookup if needed
                });
                setUserMap(localUserMap);
                setAllUsers(usersWithAvatar.map((u)=>u.name));
                setAllUserObjects(usersWithAvatar);
                // 2. Process issue details
                setIssueDetails(issueData);
                setDeadline(issueData.meta.deadline || null);
                // 3. Now that the user map is guaranteed to exist, populate assignees
                if (issueData.taxonomies && issueData.taxonomies.assignee && Array.isArray(issueData.taxonomies.assignee)) {
                    const assigneeNames = issueData.taxonomies.assignee.map((t)=>{
                        const userObject = usersWithAvatar.find((user)=>user.slug === t.slug);
                        return userObject ? userObject.name : t.name;
                    });
                    setAssignees(assigneeNames);
                } else setAssignees([]);
            }).catch((err)=>{
                console.error("Error fetching issue data:", err);
                setIssueDetails({
                    error: "Failed to load details."
                });
            }).finally(()=>{
                setIsLoadingDetails(false);
            });
        }
    }, [
        issueId,
        isOpen
    ]);
    if (!isOpen) return null;
    return /*#__PURE__*/ React.createElement(Modal, {
        size: "large",
        onRequestClose: onClose,
        className: "alpaca-details-modal",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 98,
            columnNumber: 5
        },
        __self: undefined
    }, isLoadingDetails ? /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 104,
            columnNumber: 9
        },
        __self: undefined
    }, "Loading...") : issueDetails && issueDetails.success ? /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-details",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 106,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-main column",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 107,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-slug",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 108,
            columnNumber: 13
        },
        __self: undefined
    }, issueDetails.post_data.post_name), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-identity",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 111,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-author",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 112,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _userDefault.default), {
        user: issueDetails.post_data.post_author,
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 113,
            columnNumber: 17
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("h3", {
        className: "alpaca-issue-title",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 115,
            columnNumber: 15
        },
        __self: undefined
    }, decodeEntities(issueDetails.post_data.post_title))), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-main-controls",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 119,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(FormTokenField, {
        label: "Assigned To",
        value: assignees,
        suggestions: allUsers,
        onChange: (newAssignees)=>{
            const oldAssignees = [
                ...assignees
            ];
            const added = newAssignees.filter((name)=>!oldAssignees.includes(name));
            const removed = oldAssignees.filter((name)=>!newAssignees.includes(name));
            if (createIssueComment && generateAssigneeChangeComment) {
                const commentPromises = [];
                added.forEach((name)=>{
                    const user = allUserObjects.find((u)=>u.name === name);
                    if (user) commentPromises.push(createIssueComment(issueId, generateAssigneeChangeComment(user, true)));
                });
                removed.forEach((name)=>{
                    const user = allUserObjects.find((u)=>u.name === name);
                    if (user) commentPromises.push(createIssueComment(issueId, generateAssigneeChangeComment(user, false)));
                });
                if (commentPromises.length > 0) Promise.all(commentPromises).then(()=>{
                    setCommentRefreshKey((prevKey)=>prevKey + 1);
                }).catch((err)=>{
                    console.error("Failed to create one or more assignee comments", err);
                });
            }
            setAssignees(newAssignees);
            const slugs = newAssignees.map((a)=>userMap[a] || a);
            setIsSaving(true);
            wp.apiFetch({
                path: `/issue/v1/update/${issueId}`,
                method: "POST",
                data: {
                    taxonomies: {
                        assignee: slugs
                    }
                }
            }).then(()=>{
                if (typeof onAssigneesChange === "function") {
                    const assigneeObjects = allUserObjects.filter((u)=>newAssignees.includes(u.name) || newAssignees.includes(u.slug));
                    onAssigneesChange(issueId, assigneeObjects);
                }
            }).finally(()=>setIsSaving(false));
        },
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 120,
            columnNumber: 15
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(BaseControl, {
        label: "Deadline",
        className: "alpaca-deadline-control",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 198,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-deadline",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 199,
            columnNumber: 17
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-deadline-date",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 200,
            columnNumber: 19
        },
        __self: undefined
    }, deadline ? date.format(datesettings.formats.date, deadline) : "No deadline set."), /*#__PURE__*/ React.createElement("button", {
        ref: calendarButtonRef,
        onClick: ()=>setIsEditingDeadline((prev)=>!prev),
        className: "button-link",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 206,
            columnNumber: 19
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("span", {
        className: "dashicons dashicons-calendar",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 211,
            columnNumber: 21
        },
        __self: undefined
    })), isEditingDeadline && /*#__PURE__*/ React.createElement(Popover, {
        placement: "bottom-start",
        onClose: ()=>setIsEditingDeadline(false),
        anchorRef: calendarButtonRef.current,
        focusOnMount: false,
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 215,
            columnNumber: 21
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(DatePicker, {
        current: deadline,
        onChange: (newDate)=>{
            setDeadline(newDate);
            setIsSaving(true);
            wp.apiFetch({
                path: `/issue/v1/update/${issueId}`,
                method: "POST",
                data: {
                    meta: {
                        deadline: newDate
                    }
                }
            }).then(()=>{
                if (typeof onDeadlineChange === "function") onDeadlineChange(issueId, newDate);
            }).finally(()=>{
                setIsSaving(false);
                setIsEditingDeadline(false);
            });
        },
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 221,
            columnNumber: 23
        },
        __self: undefined
    })), deadline && /*#__PURE__*/ React.createElement("button", {
        onClick: ()=>{
            setDeadline(null);
            setIsSaving(true);
            wp.apiFetch({
                path: `/issue/v1/update/${issueId}`,
                method: "POST",
                data: {
                    meta: {
                        deadline: ""
                    }
                }
            }).then(()=>{
                if (typeof onDeadlineChange === "function") onDeadlineChange(issueId, null);
            }).finally(()=>setIsSaving(false));
        },
        className: "button-link",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 248,
            columnNumber: 21
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("span", {
        className: "dashicons dashicons-trash",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 268,
            columnNumber: 23
        },
        __self: undefined
    }))))), /*#__PURE__*/ React.createElement((0, _commentingJsxDefault.default), {
        issueId: issueId,
        onCommentCountChange: onCommentCountChange,
        commentRefreshKey: commentRefreshKey,
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 274,
            columnNumber: 13
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-sidebar column",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 281,
            columnNumber: 11
        },
        __self: undefined
    }, issueDetails.meta.screenshot && /*#__PURE__*/ React.createElement("div", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 283,
            columnNumber: 15
        },
        __self: undefined
    }, " ", /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 285,
            columnNumber: 17
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("img", {
        src: issueDetails.meta.screenshot,
        className: "alpaca-screenshot",
        alt: "Screenshot",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 286,
            columnNumber: 19
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 292,
            columnNumber: 17
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("button", {
        type: "button",
        className: "button-link-delete",
        disabled: isSaving,
        onClick: ()=>{
            setIsSaving(true);
            wp.apiFetch({
                path: `/issue/v1/update/${issueId}`,
                method: "POST",
                data: {
                    meta: {
                        screenshot: ""
                    }
                }
            }).then(()=>{
                setIssueDetails((prev)=>({
                        ...prev,
                        meta: {
                            ...prev.meta,
                            screenshot: ""
                        }
                    }));
            }).finally(()=>setIsSaving(false));
        },
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 293,
            columnNumber: 19
        },
        __self: undefined
    }, "Delete"))), /*#__PURE__*/ React.createElement("table", {
        className: "",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 325,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tbody", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 326,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 327,
            columnNumber: 17
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 328,
            columnNumber: 19
        },
        __self: undefined
    }, "Reported"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 329,
            columnNumber: 19
        },
        __self: undefined
    }, date.format(datesettings.formats.datetimeAbbreviated, new Date(issueDetails.post_data.post_date)))), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 336,
            columnNumber: 17
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 337,
            columnNumber: 19
        },
        __self: undefined
    }, "Last edit"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 338,
            columnNumber: 19
        },
        __self: undefined
    }, date.format(datesettings.formats.datetimeAbbreviated, new Date(issueDetails.post_data.post_date)))), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 345,
            columnNumber: 17
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 346,
            columnNumber: 19
        },
        __self: undefined
    }, "URL"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 347,
            columnNumber: 19
        },
        __self: undefined
    }, issueDetails.meta.URL ? /*#__PURE__*/ React.createElement("a", {
        href: issueDetails.meta.URL,
        target: "_blank",
        rel: "noopener noreferrer",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 349,
            columnNumber: 23
        },
        __self: undefined
    }, issueDetails.meta.URL) : "N/A")), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 361,
            columnNumber: 17
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 362,
            columnNumber: 19
        },
        __self: undefined
    }, "Screen"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 363,
            columnNumber: 19
        },
        __self: undefined
    }, issueDetails.meta.screenwidth && issueDetails.meta.screenheight ? `${issueDetails.meta.screenwidth} x ${issueDetails.meta.screenheight}` : "N/A")), Object.entries(issueDetails.taxonomies).filter(([taxonomy])=>taxonomy !== "assignee").map(([taxonomy, terms])=>/*#__PURE__*/ React.createElement("tr", {
            key: taxonomy,
            __source: {
                fileName: "src/components/issue.jsx",
                lineNumber: 373,
                columnNumber: 21
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("th", {
            scope: "row",
            style: {
                textTransform: "capitalize"
            },
            __source: {
                fileName: "src/components/issue.jsx",
                lineNumber: 374,
                columnNumber: 23
            },
            __self: undefined
        }, taxonomy), /*#__PURE__*/ React.createElement("td", {
            __source: {
                fileName: "src/components/issue.jsx",
                lineNumber: 377,
                columnNumber: 23
            },
            __self: undefined
        }, terms.map((term)=>term.name).join(", ")))))))) : /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/issue.jsx",
            lineNumber: 385,
            columnNumber: 9
        },
        __self: undefined
    }, issueDetails?.message || "Could not load issue details."));
};
exports.default = AlpacaIssue;

},{"./commenting.jsx":"321JG","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./User":"enwL1"}],"321JG":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _user = require("./User");
var _userDefault = parcelHelpers.interopDefault(_user);
var _marked = require("marked");
const { useState, useEffect, useRef, useCallback } = wp.element;
const { TextareaControl, Button, Spinner, Modal } = wp.components;
const Commenting = ({ issueId, onCommentCountChange, commentRefreshKey })=>{
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
        wp.apiFetch({
            path: "/wp/v2/users/me"
        }).then((user)=>{
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
            if (onCommentCountChange) onCommentCountChange(fetchedComments.length);
        }).catch((err)=>{
            console.error("Error fetching comments:", err);
            setError("Could not load comments.");
        }).finally(()=>setIsLoadingComments(false));
    }, [
        issueId,
        onCommentCountChange
    ]);
    useEffect(()=>{
        fetchComments();
    }, [
        fetchComments,
        commentRefreshKey
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
                comment_type: "issuecomment"
            }
        }).then(()=>{
            setNewComment("");
            fetchComments();
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
        }).then(()=>{
            setEditingCommentId(null);
            setEditingContent("");
            fetchComments();
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
        }).then(()=>{
            fetchComments();
            setDeleteCommentId(null);
        }).catch((err)=>{
            console.error(err);
            alert(`Failed to delete comment: ${err.message || "Unknown error"}`);
        });
    };
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("div", {
        id: "alpaca-comments",
        className: "alpaca-grid",
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 144,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(TextareaControl, {
        placeholder: "Add a comment...",
        value: newComment,
        onChange: setNewComment,
        disabled: isSubmitting,
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 146,
            columnNumber: 9
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        onClick: handleCommentSubmit,
        disabled: isSubmitting,
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 152,
            columnNumber: 9
        },
        __self: undefined
    }, isSubmitting ? "Submitting..." : "Submit Comment"), isLoadingComments && /*#__PURE__*/ React.createElement(Spinner, {
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 156,
            columnNumber: 31
        },
        __self: undefined
    }), error && /*#__PURE__*/ React.createElement("p", {
        className: "alpaca-error",
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 157,
            columnNumber: 19
        },
        __self: undefined
    }, error), !isLoadingComments && !error && comments.length === 0 && /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 159,
            columnNumber: 11
        },
        __self: undefined
    }, "No comments yet."), !isLoadingComments && comments.map((comment)=>/*#__PURE__*/ React.createElement("div", {
            className: "alpaca-row",
            key: comment.id,
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 165,
                columnNumber: 13
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("div", {
            className: "alpaca-meta",
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 166,
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
                lineNumber: 167,
                columnNumber: 17
            },
            __self: undefined
        }), /*#__PURE__*/ React.createElement("span", {
            className: "alpaca-comment-date",
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 174,
                columnNumber: 17
            },
            __self: undefined
        }, new Date(comment.date).toLocaleString())), /*#__PURE__*/ React.createElement("div", {
            className: "alpaca-comment",
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 178,
                columnNumber: 15
            },
            __self: undefined
        }, editingCommentId === comment.id ? /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(TextareaControl, {
            value: editingContent,
            onChange: setEditingContent,
            ref: editingRef,
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 181,
                columnNumber: 21
            },
            __self: undefined
        }), /*#__PURE__*/ React.createElement(Button, {
            isPrimary: true,
            onClick: ()=>saveEdit(comment.id),
            disabled: isSubmitting,
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 186,
                columnNumber: 21
            },
            __self: undefined
        }, "Save"), /*#__PURE__*/ React.createElement(Button, {
            onClick: cancelEditing,
            disabled: isSubmitting,
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 193,
                columnNumber: 21
            },
            __self: undefined
        }, "Cancel")) : /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("div", {
            dangerouslySetInnerHTML: {
                __html: comment.content.raw ? (0, _marked.marked)(comment.content.raw) : comment.content.rendered
            },
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 199,
                columnNumber: 21
            },
            __self: undefined
        }), /*#__PURE__*/ React.createElement("div", {
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 206,
                columnNumber: 21
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("button", {
            onClick: ()=>startEditing(comment),
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 207,
                columnNumber: 23
            },
            __self: undefined
        }, "Edit"), " ", /*#__PURE__*/ React.createElement("button", {
            className: "button-link-delete",
            onClick: ()=>confirmDeleteComment(comment.id),
            __source: {
                fileName: "src/components/commenting.jsx",
                lineNumber: 210,
                columnNumber: 23
            },
            __self: undefined
        }, "Delete")))))), deleteCommentId && /*#__PURE__*/ React.createElement(Modal, {
        title: "Delete Comment?",
        onRequestClose: cancelDelete,
        className: "alpaca-modal",
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 225,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 230,
            columnNumber: 13
        },
        __self: undefined
    }, "Are you sure you want to delete this comment?"), /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        onClick: deleteComment,
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 231,
            columnNumber: 13
        },
        __self: undefined
    }, "Delete"), /*#__PURE__*/ React.createElement(Button, {
        onClick: cancelDelete,
        __source: {
            fileName: "src/components/commenting.jsx",
            lineNumber: 234,
            columnNumber: 13
        },
        __self: undefined
    }, "Cancel"))));
};
exports.default = Commenting;

},{"marked":"4duqf","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./User":"enwL1"}],"4duqf":[function(require,module,exports,__globalThis) {
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

},{}]},["9iTdJ","d8Dch"], "d8Dch", "parcelRequire55a0", {}, null, null, "http://localhost:1234")

//# sourceMappingURL=index.js.map
