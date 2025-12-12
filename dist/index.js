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
var _apiTestJs = require("./apiTest.js");
var _issueCommentHandlerJs = require("./utils/issueCommentHandler.js");
var _modalJsx = require("./Modal.jsx");
var _modalJsxDefault = parcelHelpers.interopDefault(_modalJsx);
var _settingsJsx = require("./Settings.jsx");
var _settingsJsxDefault = parcelHelpers.interopDefault(_settingsJsx);
var _watchlistContextJsx = require("./context/WatchlistContext.jsx");
var _boardJsx = require("./Board.jsx");
var _userApiJs = require("./services/userApi.js");
var _issueApiJs = require("./services/issueApi.js");
if (!window.alpaca) window.alpaca = {};
if (!window.alpaca.services) window.alpaca.services = {};
window.alpaca.services.userApi = {
    fetchAllAssignees: (0, _userApiJs.fetchAllAssignees)
};
window.alpaca.services.issueApi = {
    fetchIssue: (0, _issueApiJs.fetchIssue),
    updateIssue: (0, _issueApiJs.updateIssue),
    fetchStatuses: (0, _issueApiJs.fetchStatuses),
    fetchUsers: (0, _issueApiJs.fetchUsers),
    fetchIssueCommentCount: (0, _issueApiJs.fetchIssueCommentCount)
};
const { render } = wp.element;
if (document.querySelector('#wp-admin-bar-alpaca-menu')) render(/*#__PURE__*/ React.createElement((0, _modalJsxDefault.default), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 39,
        columnNumber: 5
    },
    __self: undefined
}), document.querySelector('#wp-admin-bar-alpaca-report'));
if (document.querySelector('#alpaca-settings-internal')) render(/*#__PURE__*/ React.createElement((0, _settingsJsxDefault.default), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 46,
        columnNumber: 5
    },
    __self: undefined
}), document.querySelector('#alpaca-settings-internal'));
if (document.querySelector('#alpaca-board')) render(/*#__PURE__*/ React.createElement((0, _watchlistContextJsx.WatchlistProvider), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 53,
        columnNumber: 5
    },
    __self: undefined
}, /*#__PURE__*/ React.createElement((0, _boardJsx.AlpacaBoard), {
    __source: {
        fileName: "src/index.jsx",
        lineNumber: 54,
        columnNumber: 7
    },
    __self: undefined
})), document.querySelector('#alpaca-board'));

},{"./alpaca.scss":"1ItKB","./apiTest.js":"fVegi","./utils/issueCommentHandler.js":"cSitV","./Modal.jsx":"d8SYv","./Settings.jsx":"cVQSK","./context/WatchlistContext.jsx":"WrED9","./Board.jsx":"ka7RA","./services/userApi.js":"rt0I0","./services/issueApi.js":"bebt9","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1ItKB":[function() {},{}],"fVegi":[function(require,module,exports,__globalThis) {
// --- Basic API Endpoint Tests ---
// To enable, set ALPACA_RUN_API_TESTS to true below.
// The results will be logged to your browser's developer console when the
// #alpaca-board element is on the page.
// You must be logged in with a user that has 'edit_posts' capabilities.
const ALPACA_RUN_API_TESTS = false;
if (ALPACA_RUN_API_TESTS && document.querySelector('#alpaca-board')) {
    const runApiTests = ()=>{
        // Helper function for making API requests
        const testEndpoint = (url, options, operation)=>{
            // Ensure wpApiSettings is available
            if (typeof wpApiSettings === 'undefined' || !wpApiSettings.root || !wpApiSettings.nonce) {
                console.error('wpApiSettings is not defined. Make sure "wp-api" is an enqueued dependency.');
                return;
            }
            fetch(url, options).then((response)=>{
                if (!response.ok) return response.text().then((text)=>{
                    throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
                });
                return response.json();
            }).then((data)=>// eslint-disable-next-line no-console
                console.log(`\u{2705} ${operation} SUCCESS:`, data)).catch((error)=>// eslint-disable-next-line no-console
                console.error(`\u{274C} ${operation} FAILED:`, error.message));
        };
        const nonceHeader = {
            'X-WP-Nonce': wpApiSettings.nonce
        };
        //const jsonHeaders = { ...nonceHeader, "Content-Type": "application/json" };
        // Test GET /alpaca/v1/board
        testEndpoint(`${wpApiSettings.root}alpaca/v1/board`, {
            method: 'GET',
            headers: nonceHeader
        }, 'GET /alpaca/v1/board');
    };
    // Wait for the DOM to be fully loaded to ensure wpApiSettings is available.
    document.addEventListener('DOMContentLoaded', runApiTests);
}

},{}],"cSitV":[function(require,module,exports,__globalThis) {
var _useUserJs = require("../hooks/useUser.js");
var _issueApiJs = require("../services/issueApi.js");
/**
 * Handles automatic commenting on issues, such as when an issue is created.
 * This script hooks into WordPress actions to add comments via the REST API.
 */ const { addAction, doAction } = wp.hooks;
const apiFetch = wp.apiFetch;
const postComment = async (issueOrId, content)=>{
    let postId;
    if (issueOrId && typeof issueOrId === 'object') // Prioritize issue.post_id if available (for full issue objects)
    // Otherwise, assume issue.id is the post ID (for simplified board items)
    postId = issueOrId.post_id || issueOrId.id;
    else // If issueOrId is not an object, assume it's already the post ID
    postId = issueOrId;
    if (!postId) {
        console.error('postComment: No valid post ID found for comment.', issueOrId);
        return;
    }
    try {
        await apiFetch({
            path: '/wp/v2/comments',
            method: 'POST',
            data: {
                post: postId,
                content,
                comment_type: 'issuecomment',
                status: 'approve',
                author_user_agent: 'audit'
            }
        }).then(async (newlyCreatedComment)=>{
            wp.hooks.doAction('alpaca.commentPosted', newlyCreatedComment);
            const response = await (0, _issueApiJs.fetchIssueCommentCount)(postId);
            if (response && typeof response.comment_count !== 'undefined') doAction('alpaca.commentCountChanged', {
                issueId: postId.toString(),
                newCount: response.comment_count
            });
        });
    } catch (error) {
        console.error('issueCommentHandler.js: Error adding comment:', error);
    }
};
addAction('alpaca.issueSubmitted', 'alpaca/addIssueComment', async (issue)=>{
    const currentUser = await (0, _useUserJs.getUser)();
    const commentContent = `Issue created by ${(0, _useUserJs.generateAssigneeSpan)(currentUser)}`;
    await postComment(issue, commentContent); // Pass issue object
});
addAction('alpaca.statusChanged', 'alpaca/addStatusChangeComment', async (issue, fromStatus, toStatus)=>{
    const commentContent = `Status changed from **${fromStatus}** to **${toStatus}**`;
    await postComment(issue, commentContent); // Pass issue object
});
addAction('alpaca.assigneeChanged', 'alpaca/addAssigneeChangeComment', async (issue, user, isAssigned)=>{
    const actionText = isAssigned ? 'assigned to' : 'unassigned from';
    const commentContent = `${(0, _useUserJs.generateAssigneeSpan)(user)} ${actionText} this issue`;
    await postComment(issue, commentContent); // Pass issue object
});

},{"../hooks/useUser.js":"7ZWZh","../services/issueApi.js":"bebt9"}],"7ZWZh":[function(require,module,exports,__globalThis) {
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
    const [userData, setUserData] = useState(typeof user === 'object' ? user : null);
    const [loading, setLoading] = useState(typeof user === 'number' || typeof user === 'string' && !isNaN(user));
    useEffect(()=>{
        if (typeof user === 'number' || typeof user === 'string' && !isNaN(user)) {
            const userId = parseInt(user, 10);
            setLoading(true);
            getUser(userId).then(setUserData).catch((err)=>{
                console.error('Error fetching user:', err);
                setUserData(null);
            }).finally(()=>setLoading(false));
        } else if (typeof user === 'object') {
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
    if (!user) return '';
    const avatarAttr = user.avatar ? ` data-avatar="${user.avatar}"` : '';
    const displayName = user.name || user.display_name || user.username || 'Unknown';
    return `<span class="alpaca-status-assignee" data-userid="${user.id}"${avatarAttr}>${displayName}</span>`;
};

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

},{}],"bebt9":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "fetchIssue", ()=>fetchIssue);
parcelHelpers.export(exports, "updateIssue", ()=>updateIssue);
parcelHelpers.export(exports, "fetchStatuses", ()=>fetchStatuses);
parcelHelpers.export(exports, "fetchUsers", ()=>fetchUsers);
parcelHelpers.export(exports, "fetchIssueCommentCount", ()=>fetchIssueCommentCount);
const fetchIssue = (id)=>wp.apiFetch({
        path: `/alpaca/v1/get/${id}`
    });
const updateIssue = (id, data)=>{
    return wp.apiFetch({
        path: `/alpaca/v1/update/${id}`,
        method: 'POST',
        data
    });
};
const fetchStatuses = ()=>wp.apiFetch({
        path: '/alpaca/v1/statuses'
    });
const fetchUsers = ()=>wp.apiFetch({
        path: '/alpaca/v1/users'
    });
const fetchIssueCommentCount = (id)=>{
    return wp.apiFetch({
        path: `/alpaca/v1/comment-count/${id}`
    });
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"d8SYv":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _snapdomHandlerJs = require("./snapdomHandler.js");
var _snapdomHandlerJsDefault = parcelHelpers.interopDefault(_snapdomHandlerJs);
var _testLoggerJs = require("./utils/testLogger.js");
const { Button, Modal, TextareaControl, Spinner, CheckboxControl } = wp.components;
const { doAction } = wp.hooks;
const { useState, useRef, useEffect, useCallback } = wp.element;
const AlpacaModal = ()=>{
    const [isOpen, setOpen] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [message, setMessage] = useState('');
    const [feedback, setFeedback] = useState('');
    const [includeContext, setIncludeContext] = useState(true); // <-- new state
    const textareaRef = useRef(null);
    const closeBtnRef = useRef(null);
    const [enableTestLogs, setEnableTestLogs] = useState(false);
    useEffect(()=>{
        wp.apiFetch({
            path: '/wp/v2/settings'
        }).then((settings)=>{
            setEnableTestLogs(settings.alpaca_enable_test_logs === '1');
        });
        const handleTestLogSettingChange = (value)=>{
            setEnableTestLogs(value);
        };
        wp.hooks.addAction('alpaca.enableTestLogsChanged', 'alpaca/modal', handleTestLogSettingChange);
        return ()=>{
            wp.hooks.removeAction('alpaca.enableTestLogsChanged', 'alpaca/modal');
        };
    }, []);
    (0, _testLoggerJs.useTestLogger)(enableTestLogs);
    const openModal = useCallback(()=>{
        setMessage('');
        setStatus('idle');
        setFeedback('');
        setIncludeContext(true); // reset to default each time modal opens
        setOpen(true);
    }, []);
    const closeModal = ()=>{
        setOpen(false);
        setStatus('idle');
    };
    // Listen for a global event to open the modal
    useEffect(()=>{
        const handleOpen = ()=>openModal();
        wp.hooks.addAction('alpaca.openModal', 'alpaca/modal', handleOpen);
        return ()=>wp.hooks.removeAction('alpaca.openModal', 'alpaca/modal');
    }, [
        openModal
    ]);
    // Focus textarea when modal opens
    useEffect(()=>{
        if (isOpen && status === 'idle' && textareaRef.current) setTimeout(()=>textareaRef.current.focus(), 10);
    }, [
        isOpen,
        status
    ]);
    // Focus close button on success or error
    useEffect(()=>{
        if ((status === 'success' || status === 'error') && closeBtnRef.current) setTimeout(()=>closeBtnRef.current.focus(), 10);
    }, [
        status
    ]);
    const submitIssue = async ()=>{
        setMessage('');
        try {
            const server = JSON.parse(atob(alpacaDataDump.env));
            setStatus('submitting');
            const screenshot = await (0, _snapdomHandlerJsDefault.default)();
            const submitted = {
                userinput: {
                    feedback,
                    includeContext
                },
                client: alpacaDataDump.device,
                screenshot,
                errors: alpacaDataDump.errors
            };
            const payload = {
                ...submitted,
                ...server
            };
            const response = await fetch(wpApiSettings.root + 'alpaca/v1/submit', {
                method: 'POST',
                credentials: 'include',
                headers: new Headers({
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': wpApiSettings.nonce
                }),
                body: JSON.stringify(payload)
            });
            const responseData = await response.json();
            if (!response.ok || !responseData.success) throw new Error(responseData.message || `HTTP ${response.status}`);
            setStatus('success');
            setMessage('Your issue has been submitted successfully.');
            doAction('alpaca.issueSubmitted', responseData.issue, responseData.statusId);
            setTimeout(closeModal, 1500);
        } catch (error) {
            console.error('Submission error:', error);
            setStatus('error');
            setMessage('There was an error submitting your issue. Please try again.');
        }
    };
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("button", {
        className: "ab-item",
        onClick: (e)=>{
            e.preventDefault();
            openModal();
        },
        style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
        },
        __source: {
            fileName: "src/Modal.jsx",
            lineNumber: 134,
            columnNumber: 7
        },
        __self: undefined
    }, "Report An Issue"), isOpen && /*#__PURE__*/ React.createElement(Modal, {
        size: "medium",
        className: "alpaca-modal",
        title: (()=>{
            if (status === 'success') return 'Issue Submitted';
            if (status === 'error') return 'Submission Failed';
            return 'Report An Issue';
        })(),
        onRequestClose: closeModal,
        isDismissible: false,
        __source: {
            fileName: "src/Modal.jsx",
            lineNumber: 151,
            columnNumber: 9
        },
        __self: undefined
    }, status === 'success' || status === 'error' ? /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/Modal.jsx",
            lineNumber: 164,
            columnNumber: 15
        },
        __self: undefined
    }, message), /*#__PURE__*/ React.createElement(Button, {
        variant: "primary",
        onClick: closeModal,
        ref: closeBtnRef,
        __source: {
            fileName: "src/Modal.jsx",
            lineNumber: 165,
            columnNumber: 15
        },
        __self: undefined
    }, "Close")) : /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(TextareaControl, {
        placeholder: "Describe the problem",
        id: "alpaca-modal-textarea",
        value: feedback,
        onChange: (value)=>setFeedback(value),
        disabled: status === 'submitting',
        ref: textareaRef,
        __source: {
            fileName: "src/Modal.jsx",
            lineNumber: 171,
            columnNumber: 15
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("div", {
        className: "small-wrapper",
        __source: {
            fileName: "src/Modal.jsx",
            lineNumber: 180,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(CheckboxControl, {
        id: "alpaca-include-context",
        checked: includeContext,
        onChange: (val)=>setIncludeContext(val),
        label: "Include full context with report?",
        help: "Always do this, unless you are sure it is not relevant",
        disabled: status === 'submitting',
        __source: {
            fileName: "src/Modal.jsx",
            lineNumber: 181,
            columnNumber: 17
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-actions",
        __source: {
            fileName: "src/Modal.jsx",
            lineNumber: 191,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        variant: "primary",
        onClick: submitIssue,
        disabled: status === 'submitting',
        __source: {
            fileName: "src/Modal.jsx",
            lineNumber: 192,
            columnNumber: 17
        },
        __self: undefined
    }, status === 'submitting' ? /*#__PURE__*/ React.createElement(Spinner, {
        __source: {
            fileName: "src/Modal.jsx",
            lineNumber: 197,
            columnNumber: 46
        },
        __self: undefined
    }) : 'Submit'), /*#__PURE__*/ React.createElement(Button, {
        variant: "secondary",
        onClick: closeModal,
        disabled: status === 'submitting',
        __source: {
            fileName: "src/Modal.jsx",
            lineNumber: 199,
            columnNumber: 17
        },
        __self: undefined
    }, "Cancel")))));
};
exports.default = AlpacaModal;

},{"./snapdomHandler.js":"6PWCm","./utils/testLogger.js":"1XDyd","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"6PWCm":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const handleSnapdomCapture = async ()=>{
    function hide_from_snapdom(selector) {
        const el = document.querySelector(selector);
        if (el) el.dataset.capture = 'exclude';
    }
    hide_from_snapdom('#wpadminbar');
    hide_from_snapdom('.components-modal__screen-overlay');
    // https://github.com/zumerlab/snapdom
    const canvas = await snapdom.toCanvas(document.body, {
        type: 'webp',
        embedFonts: true
    });
    // Calculate the visible area based on scroll position and viewport size
    const x = window.scrollX;
    const y = window.scrollY;
    const width = window.innerWidth;
    const height = window.innerHeight;
    // Create a new canvas to hold the cropped image
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const ctx = croppedCanvas.getContext('2d');
    // Draw the relevant portion of the original canvas onto the new canvas
    // ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
    // might want to exclude admin bar's 32px?
    ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
    // Get the Base64-encoded string from the canvas
    const base64String = croppedCanvas.toDataURL('image/webp', 0.5); // Set compression level
    // console.log(base64String);
    return base64String;
};
exports.default = handleSnapdomCapture;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1XDyd":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "useTestLogger", ()=>useTestLogger);
const { useEffect } = wp.element;
const useTestLogger = (enable)=>{
    useEffect(()=>{
        if (!enable) return;
        const logStatusChange = (movedItem, sourceContainerTitle, destinationContainerTitle)=>{
            // eslint-disable-next-line no-console
            console.log(`Item "${movedItem.content}" moved from "${sourceContainerTitle}" to "${destinationContainerTitle}"`);
        };
        const logAssigneesChange = (issueId, assignees)=>{
            // eslint-disable-next-line no-console
            console.log(`Assignees changed for issue ${issueId}:`, assignees);
        };
        const logAssigneesUpdated = (assignees)=>{
            // eslint-disable-next-line no-console
            console.log('Global assignees list updated:', assignees);
        };
        const logIssueSubmitted = (issue, statusId)=>{
            // eslint-disable-next-line no-console
            console.log(`Issue submitted:`, issue, `with status ID:`, statusId);
        };
        const logChecklistItemUpdated = (oldLabel, newLabel)=>{
            if (!oldLabel) // eslint-disable-next-line no-console
            console.log(`Checklist item created: ${newLabel}`);
            else // eslint-disable-next-line no-console
            console.log(`Checklist item updated from "${oldLabel}" to "${newLabel}"`);
        };
        const logCommentPosted = (comment)=>{
            // eslint-disable-next-line no-console
            console.log(`Comment posted:`, comment);
        };
        const logCommentUpdated = (comment)=>{
            // eslint-disable-next-line no-console
            console.log(`Comment updated:`, comment);
        };
        const logCommentDeleted = (comment)=>{
            // eslint-disable-next-line no-console
            console.log(`Comment deleted:`, comment);
        };
        const logIssueDeleted = (issueId)=>{
            // eslint-disable-next-line no-console
            console.log(`Issue ${issueId} deleted`);
        };
        wp.hooks.addAction('alpaca.statusChanged', 'alpaca/test', logStatusChange);
        wp.hooks.addAction('alpaca.issueAssigneesChanged', 'alpaca/test', logAssigneesChange);
        wp.hooks.addAction('alpaca.allAssigneesUpdated', 'alpaca/test', logAssigneesUpdated);
        wp.hooks.addAction('alpaca.issueSubmitted', 'alpaca/test', logIssueSubmitted);
        wp.hooks.addAction('alpaca.checklistItemUpdated', 'alpaca/test', logChecklistItemUpdated);
        wp.hooks.addAction('alpaca.commentPosted', 'alpaca/test', logCommentPosted);
        wp.hooks.addAction('alpaca.commentUpdated', 'alpaca/test', logCommentUpdated);
        wp.hooks.addAction('alpaca.commentDeleted', 'alpaca/test', logCommentDeleted);
        wp.hooks.addAction('alpaca.issueDeleted', 'alpaca/test', logIssueDeleted);
        const logCommentCountChanged = (data)=>{
            // eslint-disable-next-line no-console
            console.log(`Comment count changed:`, data);
        };
        wp.hooks.addAction('alpaca.commentCountChanged', 'alpaca/test', logCommentCountChanged);
        return ()=>{
            wp.hooks.removeAction('alpaca.statusChanged', 'alpaca/test');
            wp.hooks.removeAction('alpaca.issueAssigneesChanged', 'alpaca/test');
            wp.hooks.removeAction('alpaca.allAssigneesUpdated', 'alpaca/test');
            wp.hooks.removeAction('alpaca.issueSubmitted', 'alpaca/test');
            wp.hooks.removeAction('alpaca.checklistItemUpdated', 'alpaca/test');
            wp.hooks.removeAction('alpaca.commentPosted', 'alpaca/test');
            wp.hooks.removeAction('alpaca.commentUpdated', 'alpaca/test');
            wp.hooks.removeAction('alpaca.commentDeleted', 'alpaca/test');
            wp.hooks.removeAction('alpaca.issueDeleted', 'alpaca/test');
            wp.hooks.removeAction('alpaca.commentCountChanged', 'alpaca/test');
        };
    }, [
        enable
    ]);
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"cVQSK":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _statusManager = require("./components/StatusManager");
var _statusManagerDefault = parcelHelpers.interopDefault(_statusManager);
var _defaultStatusSelector = require("./components/DefaultStatusSelector");
var _defaultStatusSelectorDefault = parcelHelpers.interopDefault(_defaultStatusSelector);
var _enableTestLogsControl = require("./components/EnableTestLogsControl");
var _enableTestLogsControlDefault = parcelHelpers.interopDefault(_enableTestLogsControl);
var _webhookEndpointDisplay = require("./components/WebhookEndpointDisplay");
var _webhookEndpointDisplayDefault = parcelHelpers.interopDefault(_webhookEndpointDisplay);
var _webhookServiceKey = require("./components/WebhookServiceKey");
var _webhookServiceKeyDefault = parcelHelpers.interopDefault(_webhookServiceKey);
const { useState, useEffect, useCallback } = wp.element;
const AlpacaSettings = ()=>{
    const [statuses, setStatuses] = useState([]);
    const [currentStatuses, setCurrentStatuses] = useState([]); // Track current order
    const [defaultStatusId, setDefaultStatusId] = useState(''); // Track default status
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchStatuses = useCallback(()=>{
        setIsLoading(true);
        wp.apiFetch({
            path: '/alpaca/v1/statuses'
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
    const webhookServices = [
        'GitHub'
    ];
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-settings-wrap",
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 46,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _statusManagerDefault.default), {
        statuses: statuses,
        fetchStatuses: fetchStatuses,
        isLoading: isLoading,
        error: error,
        onStatusesChange: handleStatusesOrderChange,
        defaultStatusId: defaultStatusId,
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 47,
            columnNumber: 7
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("hr", {
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 56,
            columnNumber: 7
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("h3", {
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 58,
            columnNumber: 7
        },
        __self: undefined
    }, "Settings"), /*#__PURE__*/ React.createElement("table", {
        className: "form-table",
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 60,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tbody", {
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 61,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _defaultStatusSelectorDefault.default), {
        statuses: currentStatuses,
        onDefaultChange: handleDefaultStatusChange,
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 62,
            columnNumber: 11
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement((0, _enableTestLogsControlDefault.default), {
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 66,
            columnNumber: 11
        },
        __self: undefined
    }))), /*#__PURE__*/ React.createElement("hr", {
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 70,
            columnNumber: 7
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("h3", {
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 71,
            columnNumber: 7
        },
        __self: undefined
    }, "Webhooks"), /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 72,
            columnNumber: 7
        },
        __self: undefined
    }, "Some cloud services can send a message back to your website when a certain event occurs on their platform."), /*#__PURE__*/ React.createElement("table", {
        className: "form-table",
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 76,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tbody", {
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 77,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _webhookEndpointDisplayDefault.default), {
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 78,
            columnNumber: 11
        },
        __self: undefined
    }))), /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 81,
            columnNumber: 7
        },
        __self: undefined
    }, "Some services will ask you to supply a 'secret' for security purposes. Copy these random strings, and paste into the webhook creation screen."), /*#__PURE__*/ React.createElement("table", {
        className: "form-table",
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 86,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tbody", {
        __source: {
            fileName: "src/Settings.jsx",
            lineNumber: 87,
            columnNumber: 9
        },
        __self: undefined
    }, webhookServices.map((service)=>/*#__PURE__*/ React.createElement((0, _webhookServiceKeyDefault.default), {
            key: service,
            service: service,
            __source: {
                fileName: "src/Settings.jsx",
                lineNumber: 89,
                columnNumber: 13
            },
            __self: undefined
        })))));
};
exports.default = AlpacaSettings;

},{"./components/StatusManager":"4cgN2","./components/DefaultStatusSelector":"8A2rp","./components/EnableTestLogsControl":"7kyCE","./components/WebhookEndpointDisplay":"35eEo","./components/WebhookServiceKey":"bV1fE","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4cgN2":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
// Using native HTML5 drag/drop instead of Atlaskit
var _dragHandleIcon = require("./icons/DragHandleIcon");
var _dragHandleIconDefault = parcelHelpers.interopDefault(_dragHandleIcon);
var _issueApi = require("../services/issueApi");
const { useState, useEffect, useRef } = wp.element;
const { Button, Spinner, Modal, TextControl } = wp.components;
const StatusManager = ({ statuses, fetchStatuses: fetchStatusesCallback, isLoading, error, onStatusesChange, defaultStatusId })=>{
    const [statusToDelete, setStatusToDelete] = useState(null);
    const [localStatuses, setLocalStatuses] = useState(statuses);
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
    const listRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [dragOverStatus, setDragOverStatus] = useState(null);
    const [dragSourceIndex, setDragSourceIndex] = useState(null);
    // Recalculate term_scores based on order and default status
    const recalculateScores = async (statusesArray, defaultId)=>{
        if (!defaultId) return; // No default selected, skip scoring
        try {
            const defaultIndex = statusesArray.findIndex((s)=>s.term_id.toString() === defaultId);
            if (defaultIndex === -1) return; // Default status not found
            // Calculate scores relative to default status
            const scoreUpdates = statusesArray.map((status, index)=>{
                const score = index - defaultIndex; // Default gets 0, above get negative, below get positive
                return {
                    id: status.term_id,
                    score
                };
            });
            // Update all scores via API
            await Promise.all(scoreUpdates.map((update)=>wp.apiFetch({
                    path: `/alpaca/v1/status/${update.id}`,
                    method: 'POST',
                    data: {
                        term_score: update.score
                    }
                })));
            // Refresh the statuses to get updated scores
            fetchStatusesCallback();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Error updating term scores:', err);
        }
    };
    const handleReorder = (sourceIndex, destinationIndex)=>{
        if (sourceIndex === destinationIndex) return;
        const newStatuses = Array.from(localStatuses);
        const [reorderedItem] = newStatuses.splice(sourceIndex, 1);
        newStatuses.splice(destinationIndex, 0, reorderedItem);
        setLocalStatuses(newStatuses);
        // Recalculate scores when order changes
        if (defaultStatusId) recalculateScores(newStatuses, defaultStatusId);
    };
    const handleDragOver = (e)=>{
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
        // throttle dragover processing to avoid jank
        if (!handleDragOver._last || Date.now() - handleDragOver._last > 50) handleDragOver._last = Date.now();
        else return;
        // Read payload from dataTransfer or fallback global state
        let parsed = null;
        try {
            const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
            if (raw) parsed = JSON.parse(raw);
        } catch (err) {
            parsed = null;
        }
        if (!parsed && typeof window !== 'undefined') parsed = window.__alpacaDragState || null;
        if (parsed && typeof parsed.sourceIndex === 'number') {
            const dest = getDropIndex(e);
            setDragOverIndex(dest);
            // include status data if present
            setDragOverStatus(parsed.status || localStatuses[parsed.sourceIndex] || null);
            setDragSourceIndex(parsed.sourceIndex);
        } else {
            setDragOverIndex(null);
            setDragOverStatus(null);
            setDragSourceIndex(null);
        }
    };
    const handleDragLeave = (e)=>{
        if (listRef.current && !listRef.current.contains(e.relatedTarget)) setIsDragOver(false);
    };
    const getDropIndex = (e)=>{
        const el = listRef.current;
        if (!el) return localStatuses.length - 1;
        const children = Array.from(el.querySelectorAll('.status-grid-row'));
        for(let i = 0; i < children.length; i++){
            const rect = children[i].getBoundingClientRect();
            if (e.clientY < rect.top + rect.height / 2) return i;
        }
        return children.length - 1;
    };
    const handleDrop = (e)=>{
        e.preventDefault();
        setIsDragOver(false);
        // prefer dataTransfer payload, fallback to global state
        let parsed = null;
        try {
            const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
            if (raw) parsed = JSON.parse(raw);
        } catch (err) {
            parsed = null;
        }
        if (!parsed && typeof window !== 'undefined') parsed = window.__alpacaDragState || null;
        const sourceIndex = parsed && typeof parsed.sourceIndex === 'number' ? parsed.sourceIndex : null;
        const destIndex = getDropIndex(e);
        if (sourceIndex !== null) {
            // clear any preview state first
            setDragOverIndex(null);
            setDragOverStatus(null);
            handleReorder(sourceIndex, destIndex);
        }
        setDraggingIndex(null);
        setDragSourceIndex(null);
    };
    const handleRowDragStart = (e, index)=>{
        setDraggingIndex(index);
        const payload = {
            sourceIndex: index,
            status: localStatuses[index]
        };
        try {
            e.dataTransfer.setData('application/json', JSON.stringify(payload));
        } catch (err) {
        // ignore
        }
        // Fallback global drag state for dragover handlers
        try {
            window.__alpacaDragState = payload;
        } catch (err) {
        // ignore
        }
        // optional drag image
        // clone the full row (not just the handle) so the user sees a preview
        const rowEl = e.currentTarget && e.currentTarget.closest ? e.currentTarget.closest('.status-grid-row') : e.currentTarget;
        if (rowEl && e.dataTransfer && e.dataTransfer.setDragImage) {
            const original = rowEl;
            const clone = original.cloneNode(true);
            const rect = original.getBoundingClientRect();
            // Recursively copy computed styles so the clone preserves display (flex/grid)
            // and children styling to match the rendered row.
            const copyComputedStylesRecursive = (src, dest)=>{
                try {
                    const cs = window.getComputedStyle(src);
                    for(let i = 0; i < cs.length; i++){
                        const prop = cs[i];
                        dest.style.setProperty(prop, cs.getPropertyValue(prop), cs.getPropertyPriority(prop));
                    }
                } catch (err) {
                // ignore
                }
                const srcChildren = src.children || [];
                const destChildren = dest.children || [];
                for(let i = 0; i < srcChildren.length && i < destChildren.length; i++)copyComputedStylesRecursive(srcChildren[i], destChildren[i]);
            };
            copyComputedStylesRecursive(original, clone);
            clone.style.position = 'absolute';
            clone.style.top = '-10000px';
            clone.style.left = '-10000px';
            clone.style.width = `${rect.width}px`;
            clone.style.height = `${rect.height}px`;
            clone.style.margin = '0';
            clone.classList.add('alpaca-drag-clone');
            document.body.appendChild(clone);
            try {
                e.dataTransfer.setDragImage(clone, 10, 10);
            } catch (err) {
            // ignore
            }
            setTimeout(()=>{
                try {
                    document.body.removeChild(clone);
                } catch (err) {
                // ignore
                }
            }, 0);
        }
    };
    const handleRowDragEnd = ()=>{
        setDraggingIndex(null);
        try {
            delete window.__alpacaDragState;
        } catch (err) {
        // ignore
        }
    };
    const handleRename = (id, newName)=>{
        wp.apiFetch({
            path: `/alpaca/v1/status/${id}`,
            method: 'POST',
            data: {
                name: newName
            }
        }).then(()=>fetchStatusesCallback()).catch((err)=>{
            // eslint-disable-next-line no-console
            console.error('Error renaming status:', err);
        });
    };
    const handleDelete = (id)=>{
        const status = localStatuses.find((s)=>s.term_id === id);
        if (status) setStatusToDelete(status);
    };
    const cancelDelete = ()=>{
        setStatusToDelete(null);
    };
    const performDelete = async ()=>{
        if (!statusToDelete) return;
        const { term_id: id, name: oldStatusName } = statusToDelete;
        setStatusToDelete(null); // Close modal immediately
        try {
            // The localStatuses are already sorted by term_score
            const sortedStatuses = localStatuses;
            const deletedIndex = sortedStatuses.findIndex((s)=>s.term_id === id);
            if (deletedIndex === -1) throw new Error('Status to delete not found.');
            // Determine the new status ID
            let newStatusId = null;
            if (sortedStatuses.length > 1) {
                // If deleting the first status, assign to the next one
                if (deletedIndex === 0) newStatusId = sortedStatuses[1].term_id;
                else // Otherwise, assign to the previous one
                newStatusId = sortedStatuses[deletedIndex - 1].term_id;
            }
            const newStatus = localStatuses.find((s)=>s.term_id === newStatusId);
            const newStatusName = newStatus ? newStatus.name : 'Unknown';
            // Find all posts with the status to be deleted
            const issuesToUpdate = await wp.apiFetch({
                path: `/wp/v2/alpaca_issue?alpaca_status=${id}&per_page=-1`
            });
            // Re-categorize posts if a new status is determined
            if (newStatusId && issuesToUpdate.length > 0) {
                const updatePromises = issuesToUpdate.map((issue)=>{
                    return (0, _issueApi.updateIssue)(issue.id, {
                        taxonomies: {
                            status: [
                                newStatusId
                            ]
                        }
                    }).then(()=>{
                        wp.hooks.doAction('alpaca.statusChanged', issue, oldStatusName, newStatusName);
                    }).catch((err)=>{
                        // eslint-disable-next-line no-console
                        console.error(`Failed to update issue ${issue.id}:`, err);
                        return null; // Don't let one failure stop others
                    });
                });
                await Promise.all(updatePromises);
            }
            // Delete the status term
            await wp.apiFetch({
                path: `/wp/v2/alpaca_status/${id}?force=true`,
                method: 'DELETE'
            });
            // Refresh the statuses list
            fetchStatusesCallback();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Error during status deletion process:', err);
        }
    };
    const handleAddStatus = ()=>{
        // eslint-disable-next-line no-alert
        const newName = window.prompt('Enter the name for the new status:');
        if (!newName || !newName.trim()) return;
        const maxScore = localStatuses.reduce((max, s)=>Math.max(max, parseInt(s.term_score, 10) || 0), 0);
        wp.apiFetch({
            path: `/wp/v2/alpaca_status`,
            method: 'POST',
            data: {
                name: newName,
                meta: {
                    term_score: maxScore + 10
                }
            }
        }).then(()=>fetchStatusesCallback()).catch((err)=>{
            // eslint-disable-next-line no-console
            console.error('Error adding status:', err);
        });
    };
    if (isLoading) return /*#__PURE__*/ React.createElement(Spinner, {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 393,
            columnNumber: 25
        },
        __self: undefined
    });
    if (error) return /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 394,
            columnNumber: 21
        },
        __self: undefined
    }, "Error: ", error);
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("h2", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 398,
            columnNumber: 7
        },
        __self: undefined
    }, "Status Manager"), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-status-manager",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 399,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "status-grid",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 400,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "status-grid-header",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 402,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "status-grid-cell",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 403,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("strong", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 404,
            columnNumber: 15
        },
        __self: undefined
    }, "Name")), /*#__PURE__*/ React.createElement("div", {
        className: "status-grid-cell actions-cell",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 406,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("strong", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 407,
            columnNumber: 15
        },
        __self: undefined
    }, "Actions"))), /*#__PURE__*/ React.createElement("div", {
        ref: listRef,
        role: "list",
        className: `status-grid-body ${isDragOver ? 'dragging-over' : ''}`,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 412,
            columnNumber: 11
        },
        __self: undefined
    }, (()=>{
        if (dragOverStatus) {
            // build preview list: remove source index and insert placeholder at dragOverIndex
            let srcIndex = null;
            if (typeof dragSourceIndex === 'number') srcIndex = dragSourceIndex;
            else if (typeof draggingIndex === 'number') srcIndex = draggingIndex;
            const preview = [
                ...localStatuses
            ];
            if (srcIndex !== null) preview.splice(srcIndex, 1);
            const insertAt = Math.max(0, Math.min(preview.length, dragOverIndex === null || typeof dragOverIndex === 'undefined' ? preview.length : dragOverIndex));
            return /*#__PURE__*/ React.createElement(React.Fragment, null, preview.slice(0, insertAt).map((status, i)=>{
                const idx = i >= srcIndex ? i + 1 : i;
                const dh = {
                    draggable: true,
                    onDragStart: (e)=>handleRowDragStart(e, idx),
                    onDragEnd: handleRowDragEnd
                };
                return /*#__PURE__*/ React.createElement(StatusRow, {
                    key: status.term_id.toString(),
                    ref: null,
                    status: status,
                    onRename: handleRename,
                    onDelete: handleDelete,
                    isDragging: false,
                    dragHandleProps: dh,
                    draggable: true,
                    onDragStart: (e)=>handleRowDragStart(e, idx),
                    onDragEnd: handleRowDragEnd,
                    __source: {
                        fileName: "src/components/StatusManager.jsx",
                        lineNumber: 453,
                        columnNumber: 25
                    },
                    __self: undefined
                });
            }), /*#__PURE__*/ React.createElement("div", {
                className: "status-grid-row placeholder",
                key: "status-placeholder",
                __source: {
                    fileName: "src/components/StatusManager.jsx",
                    lineNumber: 468,
                    columnNumber: 21
                },
                __self: undefined
            }, /*#__PURE__*/ React.createElement("div", {
                className: "status-grid-cell",
                __source: {
                    fileName: "src/components/StatusManager.jsx",
                    lineNumber: 472,
                    columnNumber: 23
                },
                __self: undefined
            }, /*#__PURE__*/ React.createElement("div", {
                className: "status-row-content flexalign",
                __source: {
                    fileName: "src/components/StatusManager.jsx",
                    lineNumber: 473,
                    columnNumber: 25
                },
                __self: undefined
            }, /*#__PURE__*/ React.createElement("div", {
                className: "drag-handle flexalign",
                __source: {
                    fileName: "src/components/StatusManager.jsx",
                    lineNumber: 474,
                    columnNumber: 27
                },
                __self: undefined
            }), /*#__PURE__*/ React.createElement(Button, {
                isTertiary: true,
                className: "placeholder-label",
                __source: {
                    fileName: "src/components/StatusManager.jsx",
                    lineNumber: 475,
                    columnNumber: 27
                },
                __self: undefined
            }, dragOverStatus.name))), /*#__PURE__*/ React.createElement("div", {
                className: "status-grid-cell actions-cell",
                __source: {
                    fileName: "src/components/StatusManager.jsx",
                    lineNumber: 480,
                    columnNumber: 23
                },
                __self: undefined
            })), preview.slice(insertAt).map((status, i)=>{
                const idx = insertAt + i;
                const dh = {
                    draggable: true,
                    onDragStart: (e)=>handleRowDragStart(e, idx),
                    onDragEnd: handleRowDragEnd
                };
                return /*#__PURE__*/ React.createElement(StatusRow, {
                    key: status.term_id.toString(),
                    ref: null,
                    status: status,
                    onRename: handleRename,
                    onDelete: handleDelete,
                    isDragging: false,
                    dragHandleProps: dh,
                    draggable: true,
                    onDragStart: (e)=>handleRowDragStart(e, idx),
                    onDragEnd: handleRowDragEnd,
                    __source: {
                        fileName: "src/components/StatusManager.jsx",
                        lineNumber: 492,
                        columnNumber: 25
                    },
                    __self: undefined
                });
            }));
        }
        return localStatuses.map((status, index)=>/*#__PURE__*/ React.createElement(StatusRow, {
                key: status.term_id.toString(),
                ref: null,
                status: status,
                onRename: handleRename,
                onDelete: handleDelete,
                isDragging: draggingIndex === index,
                dragHandleProps: {
                    draggable: true,
                    onDragStart: (e)=>handleRowDragStart(e, index),
                    onDragEnd: handleRowDragEnd
                },
                draggable: true,
                onDragStart: (e)=>handleRowDragStart(e, index),
                onDragEnd: handleRowDragEnd,
                __source: {
                    fileName: "src/components/StatusManager.jsx",
                    lineNumber: 511,
                    columnNumber: 17
                },
                __self: undefined
            }));
    })())), /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 532,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        onClick: handleAddStatus,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 533,
            columnNumber: 11
        },
        __self: undefined
    }, "New Status")), statusToDelete && /*#__PURE__*/ React.createElement(Modal, {
        title: "Delete Status?",
        onRequestClose: cancelDelete,
        className: "alpaca-modal",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 539,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 544,
            columnNumber: 13
        },
        __self: undefined
    }, 'Are you sure you want to delete the status "', /*#__PURE__*/ React.createElement("strong", {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 546,
            columnNumber: 15
        },
        __self: undefined
    }, statusToDelete.name), '"? This cannot be undone.'), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-actions flexalign",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 549,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        variant: "primary",
        isDestructive: true,
        onClick: performDelete,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 550,
            columnNumber: 15
        },
        __self: undefined
    }, "Delete"), /*#__PURE__*/ React.createElement(Button, {
        isSecondary: true,
        onClick: cancelDelete,
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 553,
            columnNumber: 15
        },
        __self: undefined
    }, "Cancel")))));
};
StatusManager.propTypes = {
    statuses: (0, _propTypesDefault.default).arrayOf((0, _propTypesDefault.default).object).isRequired,
    fetchStatuses: (0, _propTypesDefault.default).func.isRequired,
    isLoading: (0, _propTypesDefault.default).bool,
    error: (0, _propTypesDefault.default).string,
    onStatusesChange: (0, _propTypesDefault.default).func,
    defaultStatusId: (0, _propTypesDefault.default).number
};
// StatusRow using grid cell display
const StatusRow = wp.element.forwardRef(({ status, onRename, onDelete, isDragging, dragHandleProps, ...props }, ref)=>{
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
        if (event.key === 'Enter') handleSaveRename();
        else if (event.key === 'Escape') handleCancelRename();
    };
    const handleProps = dragHandleProps || {};
    return /*#__PURE__*/ React.createElement("div", {
        ref: ref,
        ...props,
        className: `status-grid-row ${isDragging ? 'is-dragging' : ''}`,
        style: {
            opacity: isDragging ? 0.35 : 1
        },
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 619,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "status-grid-cell",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 625,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "status-row-content flexalign",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 626,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        ...handleProps,
        className: "drag-handle flexalign",
        title: "Drag to reorder",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 627,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _dragHandleIconDefault.default), {
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 632,
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
            lineNumber: 635,
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
            lineNumber: 643,
            columnNumber: 15
        },
        __self: undefined
    }, status.name))), /*#__PURE__*/ React.createElement("div", {
        className: "status-grid-cell actions-cell",
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 655,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        icon: "trash",
        label: "Delete",
        onClick: ()=>onDelete(status.term_id),
        __source: {
            fileName: "src/components/StatusManager.jsx",
            lineNumber: 656,
            columnNumber: 11
        },
        __self: undefined
    })));
});
StatusRow.displayName = 'StatusRow';
StatusRow.propTypes = {
    status: (0, _propTypesDefault.default).shape({
        term_id: (0, _propTypesDefault.default).number.isRequired,
        name: (0, _propTypesDefault.default).string.isRequired
    }).isRequired,
    onRename: (0, _propTypesDefault.default).func.isRequired,
    onDelete: (0, _propTypesDefault.default).func.isRequired,
    isDragging: (0, _propTypesDefault.default).bool,
    dragHandleProps: (0, _propTypesDefault.default).object
};
exports.default = StatusManager;

},{"prop-types":"7wKI2","./icons/DragHandleIcon":"lhUj1","../services/issueApi":"bebt9","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"7wKI2":[function(require,module,exports,__globalThis) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ReactIs = require("96e34ae03f5a2631");
// By explicitly using `prop-types` you are opting into new development behavior.
// http://fb.me/prop-types-in-prod
var throwOnDirectAccess = true;
module.exports = require("cb216452e2171041")(ReactIs.isElement, throwOnDirectAccess);

},{"96e34ae03f5a2631":"7EuwB","cb216452e2171041":"bBUgD"}],"7EuwB":[function(require,module,exports,__globalThis) {
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

},{}],"bBUgD":[function(require,module,exports,__globalThis) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 'use strict';
var ReactIs = require("c437388b089702c3");
var assign = require("c067a60101d8520c");
var ReactPropTypesSecret = require("74a0f89a70b9f3c2");
var has = require("18441b11647bc78");
var checkPropTypes = require("bec3f6ff89f0b072");
var printWarning = function() {};
printWarning = function(text) {
    var message = 'Warning: ' + text;
    if (typeof console !== 'undefined') console.error(message);
    try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
    } catch (x) {}
};
function emptyFunctionThatReturnsNull() {
    return null;
}
module.exports = function(isValidElement, throwOnDirectAccess) {
    /* global Symbol */ var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
    var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.
    /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */ function getIteratorFn(maybeIterable) {
        var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
        if (typeof iteratorFn === 'function') return iteratorFn;
    }
    /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */ var ANONYMOUS = '<<anonymous>>';
    // Important!
    // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
    var ReactPropTypes = {
        array: createPrimitiveTypeChecker('array'),
        bigint: createPrimitiveTypeChecker('bigint'),
        bool: createPrimitiveTypeChecker('boolean'),
        func: createPrimitiveTypeChecker('function'),
        number: createPrimitiveTypeChecker('number'),
        object: createPrimitiveTypeChecker('object'),
        string: createPrimitiveTypeChecker('string'),
        symbol: createPrimitiveTypeChecker('symbol'),
        any: createAnyTypeChecker(),
        arrayOf: createArrayOfTypeChecker,
        element: createElementTypeChecker(),
        elementType: createElementTypeTypeChecker(),
        instanceOf: createInstanceTypeChecker,
        node: createNodeChecker(),
        objectOf: createObjectOfTypeChecker,
        oneOf: createEnumTypeChecker,
        oneOfType: createUnionTypeChecker,
        shape: createShapeTypeChecker,
        exact: createStrictShapeTypeChecker
    };
    /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */ /*eslint-disable no-self-compare*/ function is(x, y) {
        // SameValue algorithm
        if (x === y) // Steps 1-5, 7-10
        // Steps 6.b-6.e: +0 != -0
        return x !== 0 || 1 / x === 1 / y;
        else // Step 6.a: NaN == NaN
        return x !== x && y !== y;
    }
    /*eslint-enable no-self-compare*/ /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */ function PropTypeError(message, data) {
        this.message = message;
        this.data = data && typeof data === 'object' ? data : {};
        this.stack = '';
    }
    // Make `instanceof Error` still work for returned errors.
    PropTypeError.prototype = Error.prototype;
    function createChainableTypeChecker(validate) {
        var manualPropTypeCallCache = {};
        var manualPropTypeWarningCount = 0;
        function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
            componentName = componentName || ANONYMOUS;
            propFullName = propFullName || propName;
            if (secret !== ReactPropTypesSecret) {
                if (throwOnDirectAccess) {
                    // New behavior only for users of `prop-types` package
                    var err = new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types");
                    err.name = 'Invariant Violation';
                    throw err;
                } else if (typeof console !== 'undefined') {
                    // Old behavior for people using React.PropTypes
                    var cacheKey = componentName + ':' + propName;
                    if (!manualPropTypeCallCache[cacheKey] && // Avoid spamming the console because they are often not actionable except for lib authors
                    manualPropTypeWarningCount < 3) {
                        printWarning("You are manually calling a React.PropTypes validation function for the `" + propFullName + '` prop on `' + componentName + '`. This is deprecated ' + 'and will throw in the standalone `prop-types` package. ' + 'You may be seeing this warning due to a third-party PropTypes ' + 'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.');
                        manualPropTypeCallCache[cacheKey] = true;
                        manualPropTypeWarningCount++;
                    }
                }
            }
            if (props[propName] == null) {
                if (isRequired) {
                    if (props[propName] === null) return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
                    return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
                }
                return null;
            } else return validate(props, propName, componentName, location, propFullName);
        }
        var chainedCheckType = checkType.bind(null, false);
        chainedCheckType.isRequired = checkType.bind(null, true);
        return chainedCheckType;
    }
    function createPrimitiveTypeChecker(expectedType) {
        function validate(props, propName, componentName, location, propFullName, secret) {
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== expectedType) {
                // `propValue` being instance of, say, date/regexp, pass the 'object'
                // check, but we can offer a more precise error message here rather than
                // 'of type `object`'.
                var preciseType = getPreciseType(propValue);
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'), {
                    expectedType: expectedType
                });
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createAnyTypeChecker() {
        return createChainableTypeChecker(emptyFunctionThatReturnsNull);
    }
    function createArrayOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
            if (typeof typeChecker !== 'function') return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
            var propValue = props[propName];
            if (!Array.isArray(propValue)) {
                var propType = getPropType(propValue);
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
            }
            for(var i = 0; i < propValue.length; i++){
                var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
                if (error instanceof Error) return error;
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createElementTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            if (!isValidElement(propValue)) {
                var propType = getPropType(propValue);
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createElementTypeTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            if (!ReactIs.isValidElementType(propValue)) {
                var propType = getPropType(propValue);
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createInstanceTypeChecker(expectedClass) {
        function validate(props, propName, componentName, location, propFullName) {
            if (!(props[propName] instanceof expectedClass)) {
                var expectedClassName = expectedClass.name || ANONYMOUS;
                var actualClassName = getClassName(props[propName]);
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createEnumTypeChecker(expectedValues) {
        if (!Array.isArray(expectedValues)) {
            {
                if (arguments.length > 1) printWarning('Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' + 'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).');
                else printWarning('Invalid argument supplied to oneOf, expected an array.');
            }
            return emptyFunctionThatReturnsNull;
        }
        function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            for(var i = 0; i < expectedValues.length; i++){
                if (is(propValue, expectedValues[i])) return null;
            }
            var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
                var type = getPreciseType(value);
                if (type === 'symbol') return String(value);
                return value;
            });
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
        }
        return createChainableTypeChecker(validate);
    }
    function createObjectOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
            if (typeof typeChecker !== 'function') return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== 'object') return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
            for(var key in propValue)if (has(propValue, key)) {
                var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
                if (error instanceof Error) return error;
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createUnionTypeChecker(arrayOfTypeCheckers) {
        if (!Array.isArray(arrayOfTypeCheckers)) {
            printWarning('Invalid argument supplied to oneOfType, expected an instance of array.');
            return emptyFunctionThatReturnsNull;
        }
        for(var i = 0; i < arrayOfTypeCheckers.length; i++){
            var checker = arrayOfTypeCheckers[i];
            if (typeof checker !== 'function') {
                printWarning("Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + getPostfixForTypeWarning(checker) + ' at index ' + i + '.');
                return emptyFunctionThatReturnsNull;
            }
        }
        function validate(props, propName, componentName, location, propFullName) {
            var expectedTypes = [];
            for(var i = 0; i < arrayOfTypeCheckers.length; i++){
                var checker = arrayOfTypeCheckers[i];
                var checkerResult = checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret);
                if (checkerResult == null) return null;
                if (checkerResult.data && has(checkerResult.data, 'expectedType')) expectedTypes.push(checkerResult.data.expectedType);
            }
            var expectedTypesMessage = expectedTypes.length > 0 ? ', expected one of type [' + expectedTypes.join(', ') + ']' : '';
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`' + expectedTypesMessage + '.'));
        }
        return createChainableTypeChecker(validate);
    }
    function createNodeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
            if (!isNode(props[propName])) return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function invalidValidatorError(componentName, location, propFullName, key, type) {
        return new PropTypeError((componentName || 'React class') + ': ' + location + ' type `' + propFullName + '.' + key + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + type + '`.');
    }
    function createShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== 'object') return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
            for(var key in shapeTypes){
                var checker = shapeTypes[key];
                if (typeof checker !== 'function') return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
                var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
                if (error) return error;
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createStrictShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== 'object') return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
            // We need to check all keys in case some are required but missing from props.
            var allKeys = assign({}, props[propName], shapeTypes);
            for(var key in allKeys){
                var checker = shapeTypes[key];
                if (has(shapeTypes, key) && typeof checker !== 'function') return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
                if (!checker) return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' + '\nBad object: ' + JSON.stringify(props[propName], null, '  ') + '\nValid keys: ' + JSON.stringify(Object.keys(shapeTypes), null, '  '));
                var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
                if (error) return error;
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function isNode(propValue) {
        switch(typeof propValue){
            case 'number':
            case 'string':
            case 'undefined':
                return true;
            case 'boolean':
                return !propValue;
            case 'object':
                if (Array.isArray(propValue)) return propValue.every(isNode);
                if (propValue === null || isValidElement(propValue)) return true;
                var iteratorFn = getIteratorFn(propValue);
                if (iteratorFn) {
                    var iterator = iteratorFn.call(propValue);
                    var step;
                    if (iteratorFn !== propValue.entries) while(!(step = iterator.next()).done){
                        if (!isNode(step.value)) return false;
                    }
                    else // Iterator will provide entry [k,v] tuples rather than values.
                    while(!(step = iterator.next()).done){
                        var entry = step.value;
                        if (entry) {
                            if (!isNode(entry[1])) return false;
                        }
                    }
                } else return false;
                return true;
            default:
                return false;
        }
    }
    function isSymbol(propType, propValue) {
        // Native Symbol.
        if (propType === 'symbol') return true;
        // falsy value can't be a Symbol
        if (!propValue) return false;
        // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
        if (propValue['@@toStringTag'] === 'Symbol') return true;
        // Fallback for non-spec compliant Symbols which are polyfilled.
        if (typeof Symbol === 'function' && propValue instanceof Symbol) return true;
        return false;
    }
    // Equivalent of `typeof` but with special handling for array and regexp.
    function getPropType(propValue) {
        var propType = typeof propValue;
        if (Array.isArray(propValue)) return 'array';
        if (propValue instanceof RegExp) // Old webkits (at least until Android 4.0) return 'function' rather than
        // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
        // passes PropTypes.object.
        return 'object';
        if (isSymbol(propType, propValue)) return 'symbol';
        return propType;
    }
    // This handles more types than `getPropType`. Only used for error messages.
    // See `createPrimitiveTypeChecker`.
    function getPreciseType(propValue) {
        if (typeof propValue === 'undefined' || propValue === null) return '' + propValue;
        var propType = getPropType(propValue);
        if (propType === 'object') {
            if (propValue instanceof Date) return 'date';
            else if (propValue instanceof RegExp) return 'regexp';
        }
        return propType;
    }
    // Returns a string that is postfixed to a warning about an invalid type.
    // For example, "undefined" or "of type array"
    function getPostfixForTypeWarning(value) {
        var type = getPreciseType(value);
        switch(type){
            case 'array':
            case 'object':
                return 'an ' + type;
            case 'boolean':
            case 'date':
            case 'regexp':
                return 'a ' + type;
            default:
                return type;
        }
    }
    // Returns class name of the object, if any.
    function getClassName(propValue) {
        if (!propValue.constructor || !propValue.constructor.name) return ANONYMOUS;
        return propValue.constructor.name;
    }
    ReactPropTypes.checkPropTypes = checkPropTypes;
    ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
    ReactPropTypes.PropTypes = ReactPropTypes;
    return ReactPropTypes;
};

},{"c437388b089702c3":"7EuwB","c067a60101d8520c":"7OXxh","74a0f89a70b9f3c2":"jZTZJ","18441b11647bc78":"fqKuf","bec3f6ff89f0b072":"5VwyJ"}],"7OXxh":[function(require,module,exports,__globalThis) {
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/ 'use strict';
/* eslint-disable no-unused-vars */ var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
function toObject(val) {
    if (val === null || val === undefined) throw new TypeError('Object.assign cannot be called with null or undefined');
    return Object(val);
}
function shouldUseNative() {
    try {
        if (!Object.assign) return false;
        // Detect buggy property enumeration order in older V8 versions.
        // https://bugs.chromium.org/p/v8/issues/detail?id=4118
        var test1 = new String('abc'); // eslint-disable-line no-new-wrappers
        test1[5] = 'de';
        if (Object.getOwnPropertyNames(test1)[0] === '5') return false;
        // https://bugs.chromium.org/p/v8/issues/detail?id=3056
        var test2 = {};
        for(var i = 0; i < 10; i++)test2['_' + String.fromCharCode(i)] = i;
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
            return test2[n];
        });
        if (order2.join('') !== '0123456789') return false;
        // https://bugs.chromium.org/p/v8/issues/detail?id=3056
        var test3 = {};
        'abcdefghijklmnopqrst'.split('').forEach(function(letter) {
            test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') return false;
        return true;
    } catch (err) {
        // We don't expect any of the above to throw, but better to be safe.
        return false;
    }
}
module.exports = shouldUseNative() ? Object.assign : function(target, source) {
    var from;
    var to = toObject(target);
    var symbols;
    for(var s = 1; s < arguments.length; s++){
        from = Object(arguments[s]);
        for(var key in from)if (hasOwnProperty.call(from, key)) to[key] = from[key];
        if (getOwnPropertySymbols) {
            symbols = getOwnPropertySymbols(from);
            for(var i = 0; i < symbols.length; i++)if (propIsEnumerable.call(from, symbols[i])) to[symbols[i]] = from[symbols[i]];
        }
    }
    return to;
};

},{}],"jZTZJ":[function(require,module,exports,__globalThis) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 'use strict';
var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
module.exports = ReactPropTypesSecret;

},{}],"fqKuf":[function(require,module,exports,__globalThis) {
module.exports = Function.call.bind(Object.prototype.hasOwnProperty);

},{}],"5VwyJ":[function(require,module,exports,__globalThis) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 'use strict';
var printWarning = function() {};
var ReactPropTypesSecret = require("24ba1e58d167a82c");
var loggedTypeFailures = {};
var has = require("898bc82f39d83f7c");
printWarning = function(text) {
    var message = 'Warning: ' + text;
    if (typeof console !== 'undefined') console.error(message);
    try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
    } catch (x) {}
};
/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */ function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
    for(var typeSpecName in typeSpecs)if (has(typeSpecs, typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
            // This is intentionally an invariant that gets caught. It's the same
            // behavior as without this statement except with a better message.
            if (typeof typeSpecs[typeSpecName] !== 'function') {
                var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
                err.name = 'Invariant Violation';
                throw err;
            }
            error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
            error = ex;
        }
        if (error && !(error instanceof Error)) printWarning((componentName || 'React class') + ': type specification of ' + location + ' `' + typeSpecName + '` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a ' + typeof error + '. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).');
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
            // Only monitor this failure once because there tends to be a lot of the
            // same error.
            loggedTypeFailures[error.message] = true;
            var stack = getStack ? getStack() : '';
            printWarning('Failed ' + location + ' type: ' + error.message + (stack != null ? stack : ''));
        }
    }
}
/**
 * Resets warning cache when testing.
 *
 * @private
 */ checkPropTypes.resetWarningCache = function() {
    loggedTypeFailures = {};
};
module.exports = checkPropTypes;

},{"24ba1e58d167a82c":"jZTZJ","898bc82f39d83f7c":"fqKuf"}],"lhUj1":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const DragHandleIcon = (props)=>/*#__PURE__*/ React.createElement("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 16 16",
        fill: "currentColor",
        xmlns: "http://www.w3.org/2000/svg",
        style: {
            verticalAlign: 'middle'
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
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
const { useState, useEffect, useCallback, useMemo } = wp.element;
const { SelectControl, Spinner } = wp.components;
const DefaultStatusSelector = ({ statuses, onDefaultChange })=>{
    const [defaultStatus, setDefaultStatus] = useState('');
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const fetchOption = useCallback(()=>{
        setIsFetching(true);
        wp.apiFetch({
            path: '/alpaca/v1/options/default_status'
        }).then((option)=>{
            const value = option.value ? option.value.toString() : '';
            setDefaultStatus(value);
            // Notify parent of the initial value
            if (onDefaultChange) onDefaultChange(value);
        }).catch((err)=>{
            // eslint-disable-next-line no-console
            console.error('Error fetching data:', err);
            setError('Could not load default status settings.');
        }).finally(()=>{
            setIsFetching(false);
        });
    }, [
        onDefaultChange
    ]);
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
            path: '/alpaca/v1/options/default_status',
            method: 'POST',
            data: {
                value: newValue
            }
        }).catch((err)=>{
            // eslint-disable-next-line no-console
            console.error('Error saving default status:', err);
            // TODO: Replace with WordPress notice API for better UX
            setError('Error saving setting: ' + err.message);
            fetchOption(); // Revert on error
        }).finally(()=>{
            setIsSaving(false);
        });
    };
    // Memoize status options to ensure they update when statuses order changes
    const statusOptions = useMemo(()=>[
            {
                label: 'Select a default status...',
                value: ''
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
            lineNumber: 78,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 79,
            columnNumber: 9
        },
        __self: undefined
    }, "Default Status for New Issues"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 80,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        className: "alpaca-error",
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 81,
            columnNumber: 11
        },
        __self: undefined
    }, error)));
    return /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 88,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 89,
            columnNumber: 7
        },
        __self: undefined
    }, "Default Status for New Issues"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 90,
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
            lineNumber: 91,
            columnNumber: 9
        },
        __self: undefined
    }), (isFetching || isSaving) && /*#__PURE__*/ React.createElement(Spinner, {
        __source: {
            fileName: "src/components/DefaultStatusSelector.jsx",
            lineNumber: 99,
            columnNumber: 38
        },
        __self: undefined
    })));
};
DefaultStatusSelector.propTypes = {
    statuses: (0, _propTypesDefault.default).arrayOf((0, _propTypesDefault.default).shape({
        name: (0, _propTypesDefault.default).string.isRequired,
        term_id: (0, _propTypesDefault.default).number.isRequired
    })).isRequired,
    onDefaultChange: (0, _propTypesDefault.default).func.isRequired
};
exports.default = DefaultStatusSelector;

},{"prop-types":"7wKI2","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"7kyCE":[function(require,module,exports,__globalThis) {
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
            path: '/wp/v2/settings'
        }).then((settings)=>{
            setIsEnabled(settings.alpaca_enable_test_logs === '1');
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
            path: '/wp/v2/settings',
            method: 'POST',
            data: {
                alpaca_enable_test_logs: value ? '1' : '0'
            }
        }).then(()=>{
            wp.hooks.doAction('alpaca.enableTestLogsChanged', value);
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"35eEo":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _useClipboard = require("../hooks/useClipboard");
const { Button } = wp.components;
const WebhookEndpointDisplay = ()=>{
    const { isClipboardSupported, copyToClipboard } = (0, _useClipboard.useClipboard)();
    // The wpApiSettings object is available globally in the WordPress admin
    const apiRoot = window.wpApiSettings?.root || '';
    const webhookUrl = `${apiRoot}alpaca/v1/webhook`;
    const handleCopy = ()=>{
        copyToClipboard(webhookUrl, // eslint-disable-next-line no-alert
        ()=>alert('Webhook URL copied to clipboard!'), (err)=>{
            console.error('Could not copy URL: ', err);
            // eslint-disable-next-line no-alert
            alert('Could not copy URL. Please copy it manually.');
        });
    };
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/WebhookEndpointDisplay.jsx",
            lineNumber: 27,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/WebhookEndpointDisplay.jsx",
            lineNumber: 28,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("label", {
        htmlFor: "webhook-url",
        __source: {
            fileName: "src/components/WebhookEndpointDisplay.jsx",
            lineNumber: 29,
            columnNumber: 11
        },
        __self: undefined
    }, "Payload URL")), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/WebhookEndpointDisplay.jsx",
            lineNumber: 31,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("input", {
        id: "webhook-url",
        type: "text",
        className: "regular-text",
        value: webhookUrl,
        readOnly: true,
        __source: {
            fileName: "src/components/WebhookEndpointDisplay.jsx",
            lineNumber: 32,
            columnNumber: 11
        },
        __self: undefined
    }), isClipboardSupported && /*#__PURE__*/ React.createElement(Button, {
        onClick: handleCopy,
        icon: "clipboard",
        __source: {
            fileName: "src/components/WebhookEndpointDisplay.jsx",
            lineNumber: 40,
            columnNumber: 13
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("p", {
        className: "description",
        __source: {
            fileName: "src/components/WebhookEndpointDisplay.jsx",
            lineNumber: 42,
            columnNumber: 11
        },
        __self: undefined
    }, "Tell supported services to send a payload to this URL"))));
};
exports.default = WebhookEndpointDisplay;

},{"../hooks/useClipboard":"d5nxh","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"d5nxh":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "useClipboard", ()=>useClipboard);
const { useState, useEffect } = wp.element;
const useClipboard = ()=>{
    const [isClipboardSupported, setIsClipboardSupported] = useState(false);
    useEffect(()=>{
        // The navigator object is only available in the browser.
        // We check for it to prevent errors during server-side rendering.
        if (typeof navigator !== 'undefined' && navigator.clipboard) setIsClipboardSupported(true);
    }, []);
    const copyToClipboard = (text, onSuccess, onError)=>{
        if (!isClipboardSupported) {
            if (onError) onError('Clipboard API not supported.');
            return;
        }
        navigator.clipboard.writeText(text).then(()=>{
            if (onSuccess) onSuccess();
        }).catch((err)=>{
            if (onError) onError(err);
        });
    };
    return {
        isClipboardSupported,
        copyToClipboard
    };
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"bV1fE":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _useClipboard = require("../hooks/useClipboard");
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
const { Button } = wp.components;
const { useState, useEffect, useCallback } = wp.element;
/**
 * WebhookServiceKey component for displaying and managing webhook service secrets.
 *
 * @param {Object} root0         - Props object
 * @param {string} root0.service - Service name
 * @return {JSX.Element} WebhookServiceKey component
 */ const WebhookServiceKey = ({ service })=>{
    const [secret, setSecret] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isClipboardSupported, copyToClipboard } = (0, _useClipboard.useClipboard)();
    const fetchSecret = useCallback(()=>{
        const serviceLowercase = service.toLowerCase();
        setIsLoading(true);
        wp.apiFetch({
            path: `/alpaca/v1/webhook/secret/${serviceLowercase}`
        }).then((data)=>{
            if (data.success && data.secret) setSecret(data.secret);
            else setError('Invalid data received from server.');
            setIsLoading(false);
        }).catch((err)=>{
            setError(err.message);
            setIsLoading(false);
        });
    }, [
        service
    ]);
    const handleRegenerate = ()=>{
        const serviceLowercase = service.toLowerCase();
        setIsLoading(true);
        wp.apiFetch({
            path: `/alpaca/v1/webhook/secret/${serviceLowercase}/regenerate`,
            method: 'POST'
        }).then((data)=>{
            if (data.success && data.secret) setSecret(data.secret);
            else setError('Could not regenerate secret.');
            setIsLoading(false);
        }).catch((err)=>{
            setError(err.message);
            setIsLoading(false);
        });
    };
    const handleCopy = ()=>{
        copyToClipboard(secret, // eslint-disable-next-line no-alert
        ()=>alert(`${service} secret copied to clipboard!`), (err)=>{
            console.error('Could not copy secret: ', err);
            // eslint-disable-next-line no-alert
            alert('Could not copy secret.');
        });
    };
    useEffect(()=>{
        fetchSecret();
    }, [
        fetchSecret
    ]);
    const serviceLowercase = service.toLowerCase();
    if (error) return /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/WebhookServiceKey.jsx",
            lineNumber: 80,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/WebhookServiceKey.jsx",
            lineNumber: 81,
            columnNumber: 9
        },
        __self: undefined
    }, service), /*#__PURE__*/ React.createElement("td", {
        style: {
            color: 'red'
        },
        __source: {
            fileName: "src/components/WebhookServiceKey.jsx",
            lineNumber: 82,
            columnNumber: 9
        },
        __self: undefined
    }, "Error: ", error));
    return /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/WebhookServiceKey.jsx",
            lineNumber: 88,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/WebhookServiceKey.jsx",
            lineNumber: 89,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("label", {
        htmlFor: `webhook-secret-${serviceLowercase}`,
        __source: {
            fileName: "src/components/WebhookServiceKey.jsx",
            lineNumber: 90,
            columnNumber: 9
        },
        __self: undefined
    }, service)), /*#__PURE__*/ React.createElement("td", {
        className: "alpaca-align-controls",
        __source: {
            fileName: "src/components/WebhookServiceKey.jsx",
            lineNumber: 92,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("input", {
        id: `webhook-secret-${serviceLowercase}`,
        type: "text",
        className: "regular-text",
        value: isLoading ? 'Loading...' : secret,
        readOnly: true,
        __source: {
            fileName: "src/components/WebhookServiceKey.jsx",
            lineNumber: 93,
            columnNumber: 9
        },
        __self: undefined
    }), isClipboardSupported && /*#__PURE__*/ React.createElement(Button, {
        onClick: handleCopy,
        disabled: isLoading,
        icon: "clipboard",
        __source: {
            fileName: "src/components/WebhookServiceKey.jsx",
            lineNumber: 101,
            columnNumber: 11
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        onClick: handleRegenerate,
        disabled: isLoading,
        icon: "update",
        label: "Regenerate",
        __source: {
            fileName: "src/components/WebhookServiceKey.jsx",
            lineNumber: 103,
            columnNumber: 9
        },
        __self: undefined
    })));
};
WebhookServiceKey.propTypes = {
    service: (0, _propTypesDefault.default).string.isRequired
};
exports.default = WebhookServiceKey;

},{"../hooks/useClipboard":"d5nxh","prop-types":"7wKI2","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"WrED9":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "WatchlistContext", ()=>WatchlistContext);
parcelHelpers.export(exports, "WatchlistProvider", ()=>WatchlistProvider);
parcelHelpers.export(exports, "useWatchlist", ()=>useWatchlist);
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
const { createContext, useState, useEffect, useContext, useCallback } = wp.element;
const WatchlistContext = createContext();
const WatchlistProvider = ({ children })=>{
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchWatchlist = useCallback(async ()=>{
        try {
            const response = await wp.apiFetch({
                path: '/alpaca/v1/watchlist'
            });
            if (response.success && Array.isArray(response.watchlist)) setWatchlist(response.watchlist);
        } catch (error) {
            console.error('Error fetching watchlist:', error);
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
                path: '/alpaca/v1/watchlist',
                method: 'POST',
                data: {
                    issue_id: numericId
                }
            });
            // If the server response is different, update the state again to ensure consistency
            if (response.success && Array.isArray(response.watchlist)) setWatchlist(response.watchlist);
        } catch (error) {
            console.error('Error updating watchlist:', error);
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
            lineNumber: 78,
            columnNumber: 5
        },
        __self: undefined
    }, children);
};
WatchlistProvider.propTypes = {
    children: (0, _propTypesDefault.default).node
};
const useWatchlist = ()=>{
    return useContext(WatchlistContext);
};

},{"prop-types":"7wKI2","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"ka7RA":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * Main board component.
 */ parcelHelpers.export(exports, "AlpacaBoard", ()=>AlpacaBoard);
// Replaced Atlaskit DragDropContext with native HTML5 drag/drop handlers
var _issue = require("./components/Issue");
var _issueDefault = parcelHelpers.interopDefault(_issue);
var _container = require("./components/Container");
var _containerDefault = parcelHelpers.interopDefault(_container);
var _cookies = require("./utils/cookies");
var _data = require("./utils/data");
var _useUser = require("./hooks/useUser");
var _issueApi = require("./services/issueApi");
const { useState, useRef, useEffect, useCallback } = wp.element;
const { decodeEntities } = wp.htmlEntities;
const { Button, Notice } = wp.components;
const { doAction } = wp.hooks;
function AlpacaBoard() {
    const [containers, setContainers] = useState(()=>{
        if (typeof window.alpacaBoardData !== 'undefined') return (0, _data.transformDataForBoard)(window.alpacaBoardData);
        return [];
    });
    const [selectedItem, setSelectedItem] = useState(null);
    const triggerRef = useRef(null);
    const [needsSave, setNeedsSave] = useState(false);
    const [hiddenContainerIds, setHiddenContainerIds] = useState(()=>{
        const cookie = (0, _cookies.getCookie)('alpaca_hidden_containers');
        return cookie ? cookie.split(',').filter(Boolean) : [];
    });
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreError, setRestoreError] = useState(null);
    // From BoardFrame.jsx
    useEffect(()=>{
        // Fire an action to allow other components to render into the controls area.
        doAction('alpaca_board_controls', '#alpaca-board-controls-mount');
    }, []);
    // Effect to update cookie when hiddenContainerIds changes
    useEffect(()=>{
        (0, _cookies.setCookie)('alpaca_hidden_containers', hiddenContainerIds.join(','), 365);
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
            method: 'POST',
            data: {
                name: newTitle
            }
        }).catch((err)=>{
            // eslint-disable-next-line no-console
            console.error('Error renaming container:', err);
            setContainers(original); // revert on failure
        });
    };
    function findContainerById(containerId) {
        return containers.find((c)=>c.id === containerId);
    }
    function getItemById(itemId) {
        for (const container of containers){
            const foundItem = container.items.find((item)=>item.id === itemId);
            if (foundItem) return foundItem;
        }
        return null;
    }
    // (Atlaskit handler removed; using native drop handlers and `handleItemDrop`)
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
                    commentCount: newCount
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
        wp.hooks.addAction('alpaca.commentCountChanged', 'alpaca/boardmain', handleCommentCountChanged);
        return ()=>{
            wp.hooks.removeAction('alpaca.commentCountChanged', 'alpaca/boardmain');
        };
    }, [
        handleCommentCountChange
    ]);
    const handleChecklistChange = useCallback((issueId, newChecklist)=>{
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
                        checklist: newChecklist
                    }
                };
                return {
                    ...container,
                    items: newItems
                };
            }));
    }, []);
    useEffect(()=>{
        const checklistChangedCallback = (data)=>{
            const { issueId, checklist } = data;
            handleChecklistChange(issueId, checklist);
        };
        wp.hooks.addAction('alpaca.checklistChanged', 'alpaca/boardmain', checklistChangedCallback);
        return ()=>{
            wp.hooks.removeAction('alpaca.checklistChanged', 'alpaca/boardmain');
        };
    }, [
        handleChecklistChange
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
            wp.hooks.doAction('alpaca.statusChanged', item, sourceContainer.title, nextContainer.title);
            (0, _issueApi.updateIssue)(item.id, {
                taxonomies: {
                    status: [
                        parseInt(nextContainer.id, 10)
                    ]
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
            // eslint-disable-next-line no-console
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
                path: `/alpaca/v1/delete/${issueId}`,
                method: 'DELETE'
            }))).catch((err)=>{
            // eslint-disable-next-line no-console
            console.error(`Error deleting issues from container ${containerId}:`, err);
            setContainers(originalContainers); // Revert UI on error
        });
    };
    const handleAssigneesChange = async (issueId, newAssignees)=>{
        const enrichedAssignees = await Promise.all(newAssignees.map(async (assignee)=>{
            if (assignee && assignee.id && !assignee.displayName) try {
                const fullUser = await (0, _useUser.getUser)(assignee.id);
                return {
                    ...assignee,
                    displayName: fullUser.name,
                    slug: fullUser.slug
                };
            } catch (error) {
                // eslint-disable-next-line no-console
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
        wp.hooks.doAction('alpaca.issueAssigneesChanged', issueId, enrichedAssignees);
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
                    if (sourceContainer) wp.hooks.doAction('alpaca.statusChanged', movedItem, sourceContainer.title, targetContainer.title);
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
    const handleRestoreDefaults = ()=>{
        setIsRestoring(true);
        setRestoreError(null);
        wp.apiFetch({
            path: '/alpaca/v1/statuses/restore-defaults',
            method: 'POST'
        }).then((response)=>{
            if (response.success) window.location.reload();
            else setRestoreError(response.message || 'Failed to restore default statuses.');
        }).catch((err)=>{
            // eslint-disable-next-line no-console
            console.error('Error restoring default statuses:', err);
            setRestoreError(err.message || 'An error occurred while restoring default statuses.');
        }).finally(()=>{
            setIsRestoring(false);
        });
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
            path: `/alpaca/v1/delete/${issueId}`,
            method: 'DELETE'
        }).then(()=>{
            wp.hooks.doAction('alpaca.issueDeleted', issueId);
        }).catch((err)=>{
            // Revert if the delete fails
            // eslint-disable-next-line no-console
            console.error('Error deleting issue:', err);
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
                    authorName: issue.author_name,
                    authorImg: issue.author_img,
                    assignees: [],
                    commentCount: issue.comment_count ?? 0,
                    meta: issue.meta || {}
                });
                return newContainers;
            });
            setNeedsSave(true);
        };
        wp.hooks.addAction('alpaca.issueSubmitted', 'alpaca/boardmain', handleIssueSubmitted);
        return ()=>{
            wp.hooks.removeAction('alpaca.issueSubmitted', 'alpaca/boardmain');
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
                        if (!existing || !existing.displayName && assignee.displayName) allAssignees.set(assigneeId, assignee);
                    }
                });
            });
        });
        const assigneesArray = Array.from(allAssignees.values());
        wp.hooks.doAction('alpaca.allAssigneesUpdated', assigneesArray);
    }, [
        containers
    ]);
    const hasNoStatuses = containers.length === 0;
    // Handler invoked by Containers when an item is dropped
    const handleItemDrop = (data)=>{
        // data: { itemId, sourceContainerId, sourceIndex, destinationContainerId, destinationIndex }
        const { //   itemId,
        sourceContainerId, sourceIndex, destinationContainerId, destinationIndex } = data;
        if (!destinationContainerId) return;
        const sourceContainer = findContainerById(sourceContainerId);
        const destinationContainer = findContainerById(destinationContainerId);
        if (!sourceContainer || !destinationContainer) return;
        if (sourceContainer.id === destinationContainer.id) {
            const items = Array.from(sourceContainer.items);
            const [reorderedItem] = items.splice(sourceIndex, 1);
            items.splice(destinationIndex, 0, reorderedItem);
            setContainers((prev)=>prev.map((c)=>c.id === sourceContainer.id ? {
                        ...c,
                        items
                    } : c));
        } else {
            const sourceItems = Array.from(sourceContainer.items);
            const destItems = Array.from(destinationContainer.items);
            const [movedItem] = sourceItems.splice(sourceIndex, 1);
            destItems.splice(destinationIndex, 0, movedItem);
            setContainers((prev)=>prev.map((c)=>{
                    if (c.id === sourceContainer.id) return {
                        ...c,
                        items: sourceItems
                    };
                    else if (c.id === destinationContainer.id) return {
                        ...c,
                        items: destItems
                    };
                    return c;
                }));
            wp.hooks.doAction('alpaca.statusChanged', movedItem, sourceContainer.title, destinationContainer.title);
            const movedItemId = parseInt(movedItem.id, 10);
            const newStatusTermId = parseInt(destinationContainer.id, 10);
            (0, _issueApi.updateIssue)(movedItemId, {
                taxonomies: {
                    status: [
                        newStatusTermId
                    ]
                }
            }).catch((err)=>{
                // eslint-disable-next-line no-console
                console.error('Error updating issue:', err);
            });
        }
        setNeedsSave(true);
    };
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("ul", {
        className: "subsubsub",
        __source: {
            fileName: "src/Board.jsx",
            lineNumber: 623,
            columnNumber: 7
        },
        __self: this
    }), /*#__PURE__*/ React.createElement("div", {
        id: "alpaca-board-controls-mount",
        __source: {
            fileName: "src/Board.jsx",
            lineNumber: 624,
            columnNumber: 7
        },
        __self: this
    }), hasNoStatuses ? /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-empty-state",
        __source: {
            fileName: "src/Board.jsx",
            lineNumber: 626,
            columnNumber: 9
        },
        __self: this
    }, /*#__PURE__*/ React.createElement(Notice, {
        status: "warning",
        isDismissible: false,
        __source: {
            fileName: "src/Board.jsx",
            lineNumber: 627,
            columnNumber: 11
        },
        __self: this
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/Board.jsx",
            lineNumber: 628,
            columnNumber: 13
        },
        __self: this
    }, /*#__PURE__*/ React.createElement("strong", {
        __source: {
            fileName: "src/Board.jsx",
            lineNumber: 629,
            columnNumber: 15
        },
        __self: this
    }, "Oh no! All your project statuses have disappeared.")), /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/Board.jsx",
            lineNumber: 633,
            columnNumber: 13
        },
        __self: this
    }, "Without statuses, you cannot view or manage issues on the board. Click the button below to restore the default statuses (Backlog, Inbox, In Progress, Done)."), /*#__PURE__*/ React.createElement(Button, {
        variant: "primary",
        onClick: handleRestoreDefaults,
        isBusy: isRestoring,
        disabled: isRestoring,
        __source: {
            fileName: "src/Board.jsx",
            lineNumber: 638,
            columnNumber: 13
        },
        __self: this
    }, isRestoring ? 'Restoring...' : 'Restore Default Statuses')), restoreError && /*#__PURE__*/ React.createElement(Notice, {
        status: "error",
        isDismissible: false,
        __source: {
            fileName: "src/Board.jsx",
            lineNumber: 648,
            columnNumber: 13
        },
        __self: this
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/Board.jsx",
            lineNumber: 649,
            columnNumber: 15
        },
        __self: this
    }, restoreError))) : /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-wrap",
        __source: {
            fileName: "src/Board.jsx",
            lineNumber: 654,
            columnNumber: 9
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
            onItemDrop: handleItemDrop,
            __source: {
                fileName: "src/Board.jsx",
                lineNumber: 656,
                columnNumber: 13
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
            fileName: "src/Board.jsx",
            lineNumber: 674,
            columnNumber: 7
        },
        __self: this
    }));
}
AlpacaBoard.displayName = 'AlpacaBoard';

},{"./components/Issue":"hkNZK","./components/Container":"QNfzH","./utils/cookies":"4qoXW","./utils/data":"j8lWA","./hooks/useUser":"7ZWZh","./services/issueApi":"bebt9","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"hkNZK":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
var _tabsConfig = require("../utils/tabsConfig");
var _useIssueData = require("../hooks/useIssueData");
var _useIssueDataDefault = parcelHelpers.interopDefault(_useIssueData);
var _useUserManagement = require("../hooks/useUserManagement");
var _useUserManagementDefault = parcelHelpers.interopDefault(_useUserManagement);
var _useLoadingStates = require("../hooks/useLoadingStates");
var _useLoadingStatesDefault = parcelHelpers.interopDefault(_useLoadingStates);
var _assigneeUtils = require("../utils/assigneeUtils");
var _issueApi = require("../services/issueApi");
var _assigneeSelector = require("./issue/AssigneeSelector");
var _assigneeSelectorDefault = parcelHelpers.interopDefault(_assigneeSelector);
var _deadlineControl = require("./issue/DeadlineControl");
var _deadlineControlDefault = parcelHelpers.interopDefault(_deadlineControl);
var _tabContent = require("./issue/TabContent");
var _tabContentDefault = parcelHelpers.interopDefault(_tabContent);
var _lightbox = require("./issue/Lightbox");
var _lightboxDefault = parcelHelpers.interopDefault(_lightbox);
var _errorsTab = require("./issue/ErrorsTab");
var _errorsTabDefault = parcelHelpers.interopDefault(_errorsTab);
var _user = require("./User");
var _userDefault = parcelHelpers.interopDefault(_user);
var _time = require("./Time");
var _timeDefault = parcelHelpers.interopDefault(_time);
const { useState, useEffect, useRef, useMemo, useCallback, memo } = wp.element;
const { Modal, TabPanel, Button, Tooltip, Dropdown, MenuGroup, MenuItem } = wp.components;
const { decodeEntities } = wp.htmlEntities;
// ----- Memoized rows -----
const AssigneeRow = memo(({ assignees, allUsers, onChange, isLoading })=>/*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 28,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 29,
            columnNumber: 7
        },
        __self: undefined
    }, "Assignees"), /*#__PURE__*/ React.createElement("td", {
        className: "flexalign",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 30,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _assigneeSelectorDefault.default), {
        assignees: assignees,
        allUsers: allUsers,
        onChange: onChange,
        isLoading: isLoading,
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 31,
            columnNumber: 9
        },
        __self: undefined
    }))), (prev, next)=>prev.isLoading === next.isLoading && prev.assignees.join(',') === next.assignees.join(',') && prev.allUsers.join(',') === next.allUsers.join(','));
const DeadlineRow = memo(({ deadline, onChange, onClear, isLoading })=>/*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 48,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 49,
            columnNumber: 7
        },
        __self: undefined
    }, "Due Date"), /*#__PURE__*/ React.createElement("td", {
        className: "flexalign",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 50,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _deadlineControlDefault.default), {
        deadline: deadline,
        onChange: onChange,
        onClear: onClear,
        isLoading: isLoading,
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 51,
            columnNumber: 9
        },
        __self: undefined
    }))), (prev, next)=>prev.isLoading === next.isLoading && prev.deadline === next.deadline);
const EditableTitle = memo(({ isEditing, title, onEditStart, onChange, onSave })=>{
    const inputRef = useRef(null);
    const wasEditingRef = useRef(false);
    useEffect(()=>{
        if (isEditing && !wasEditingRef.current && inputRef.current) {
            inputRef.current.textContent = title;
            inputRef.current.focus();
            const range = document.createRange();
            const sel = inputRef.current.ownerDocument.defaultView.getSelection();
            range.selectNodeContents(inputRef.current);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        wasEditingRef.current = isEditing;
    }, [
        isEditing,
        title
    ]);
    if (isEditing) return /*#__PURE__*/ React.createElement("div", {
        role: "textbox",
        "aria-label": "Edit issue title",
        tabIndex: 0,
        onKeyDown: (e)=>{
            if (e.key === 'Enter') {
                e.preventDefault();
                onSave();
            }
        },
        onBlur: onSave,
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 85,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("h3", {
        className: "alpaca-issue-title",
        contentEditable: true,
        suppressContentEditableWarning: true,
        ref: inputRef,
        onInput: (e)=>onChange(e.currentTarget.textContent),
        "aria-label": "Issue title",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 98,
            columnNumber: 11
        },
        __self: undefined
    }));
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-title-wrapper has-sidecontrols",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 111,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("h3", {
        className: "alpaca-issue-title",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 112,
            columnNumber: 9
        },
        __self: undefined
    }, title), /*#__PURE__*/ React.createElement("div", {
        className: "sidecontrols",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 113,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Tooltip, {
        text: "Edit title",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 114,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        className: "alpaca-edit-title-button",
        icon: "edit",
        onClick: onEditStart,
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 115,
            columnNumber: 13
        },
        __self: undefined
    }))));
}, (prev, next)=>prev.isEditing === next.isEditing && prev.title === next.title);
// ----- Main Component -----
const AlpacaIssue = ({ issueId, isOpen, onClose, onDelete, onAssigneesChange, onDeadlineChange, onStatusChange, onIssueTitleChange })=>{
    const { issueDetails, setIssueDetails, isLoadingDetails, error, refetchData } = (0, _useIssueDataDefault.default)(issueId, isOpen);
    const { allUsers, allUserObjects, userMap } = (0, _useUserManagementDefault.default)();
    const { loadingStates, setLoading } = (0, _useLoadingStatesDefault.default)();
    const [assignees, setAssignees] = useState([]);
    const [deadline, setDeadline] = useState(null);
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const [allStatuses, setAllStatuses] = useState([]);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [commentRefreshKey] = useState(0);
    const [notificationMessage, setNotificationMessage] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteScreenshotConfirm, setShowDeleteScreenshotConfirm] = useState(false);
    const showNotification = useCallback((message, type = 'error')=>{
        setNotificationMessage({
            message,
            type
        });
        setTimeout(()=>setNotificationMessage(null), 5000);
    }, []);
    // Fetch statuses
    useEffect(()=>{
        (0, _issueApi.fetchStatuses)().then(setAllStatuses).catch(()=>showNotification('Failed to load statuses.', 'error'));
    }, [
        showNotification
    ]);
    // Initialize issue data
    useEffect(()=>{
        if (issueDetails && issueDetails.success && allUserObjects.length > 0) {
            setDeadline(issueDetails.meta.deadline || null);
            // Assignees
            const assigneeNames = issueDetails.taxonomies?.assignee?.map((t)=>{
                const userObj = allUserObjects.find((u)=>u.slug === t.slug);
                return userObj ? userObj.name : t.name;
            }) || [];
            setAssignees(assigneeNames);
            // Title
            setEditedTitle(decodeEntities(issueDetails.post_data.post_content));
        }
    }, [
        issueDetails,
        allUserObjects
    ]);
    // Update assignees API call
    const updateAssignees = useCallback(async (updatedIssueId, slugs, newAssignees, added, removed)=>{
        setLoading('assignees', true);
        try {
            await (0, _issueApi.updateIssue)(updatedIssueId, {
                taxonomies: {
                    assignee: slugs
                }
            });
            if (typeof onAssigneesChange === 'function') {
                const selectedAssignees = allUserObjects.filter((u)=>newAssignees.includes(u.name) || newAssignees.includes(u.slug));
                onAssigneesChange(updatedIssueId, selectedAssignees);
            }
            added.forEach((name)=>{
                const user = allUserObjects.find((u)=>u.name === name);
                wp.hooks.doAction('alpaca.assigneeChanged', issueDetails, user, true);
            });
            removed.forEach((name)=>{
                const user = allUserObjects.find((u)=>u.name === name);
                wp.hooks.doAction('alpaca.assigneeChanged', issueDetails, user, false);
            });
        } catch (err) {
            console.error(err);
            showNotification('Failed to update assignees.', 'error');
        } finally{
            setLoading('assignees', false);
        }
    }, [
        allUserObjects,
        issueDetails,
        onAssigneesChange,
        setLoading,
        showNotification
    ]);
    // Process issue details when they change
    useEffect(()=>{
        if (issueDetails && issueDetails.success && allUserObjects.length > 0) {
            setDeadline(issueDetails.meta.alpaca_deadline || issueDetails.meta.deadline || null);
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
    const handleAssigneeChange = useCallback((newAssignees)=>{
        const oldAssignees = [
            ...assignees
        ];
        const { added, removed } = (0, _assigneeUtils.processAssigneeChanges)(oldAssignees, newAssignees);
        setAssignees(newAssignees);
        const slugs = newAssignees.map((a)=>userMap[a] || a);
        updateAssignees(issueId, slugs, newAssignees, added, removed);
    }, [
        assignees,
        issueId,
        updateAssignees,
        userMap
    ]);
    // Deadline handlers
    const handleDeadlineChange = useCallback((newDate)=>{
        setDeadline(newDate);
        setLoading('deadline', true);
        (0, _issueApi.updateIssue)(issueId, {
            meta: {
                deadline: newDate
            }
        }).then(()=>onDeadlineChange?.(issueId, newDate)).finally(()=>setLoading('deadline', false));
    }, [
        issueId,
        onDeadlineChange,
        setLoading
    ]);
    const handleDeadlineClear = useCallback(()=>{
        handleDeadlineChange(null);
    }, [
        handleDeadlineChange
    ]);
    // Lightbox
    const handleLightboxClose = useCallback(()=>setLightboxSrc(null), []);
    const confirmScreenshotDelete = useCallback(()=>{
        setShowDeleteScreenshotConfirm(true);
    }, []);
    const handleScreenshotDelete = useCallback(async ()=>{
        setShowDeleteScreenshotConfirm(false);
        setLoading('screenshot', true);
        try {
            await (0, _issueApi.updateIssue)(issueId, {
                meta: {
                    screenshot: ''
                }
            });
            // Update local state to remove screenshot
            setIssueDetails((prev)=>({
                    ...prev,
                    meta: {
                        ...prev.meta,
                        alpaca_screenshot: null,
                        screenshot: null
                    }
                }));
            showNotification('Screenshot deleted successfully.', 'success');
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Error deleting screenshot:', err);
            showNotification('Failed to delete screenshot.', 'error');
        } finally{
            setLoading('screenshot', false);
        }
    }, [
        issueId,
        setIssueDetails,
        setLoading,
        showNotification
    ]);
    // Status progression
    const handleProgressIssue = useCallback(async ()=>{
        if (!issueDetails || !allStatuses.length) return;
        const currentStatus = issueDetails.taxonomies?.status?.[0];
        if (!currentStatus) return;
        const currentIndex = allStatuses.findIndex((s)=>s.term_id === currentStatus.term_id);
        if (currentIndex === -1 || currentIndex === allStatuses.length - 1) return;
        const nextStatus = allStatuses[currentIndex + 1];
        setLoading('status', true);
        try {
            await (0, _issueApi.updateIssue)(issueId, {
                taxonomies: {
                    status: [
                        nextStatus.term_id
                    ]
                }
            });
            setIssueDetails((prev)=>({
                    ...prev,
                    taxonomies: {
                        ...prev.taxonomies,
                        status: [
                            nextStatus
                        ]
                    }
                }));
            onStatusChange?.(issueId, nextStatus);
        } catch (err) {
            showNotification('Failed to progress issue status.', 'error');
        } finally{
            setLoading('status', false);
        }
    }, [
        allStatuses,
        issueDetails,
        issueId,
        onStatusChange,
        setIssueDetails,
        setLoading,
        showNotification
    ]);
    // Title editing
    const handleTitleSave = useCallback(async ()=>{
        if (editedTitle === decodeEntities(issueDetails.post_data.post_content)) {
            setIsEditingTitle(false);
            return;
        }
        setLoading('title', true);
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
            onIssueTitleChange?.(issueId, editedTitle);
        } catch  {
            showNotification('Failed to update issue title.', 'error');
        } finally{
            setLoading('title', false);
            setIsEditingTitle(false);
        }
    }, [
        editedTitle,
        issueDetails,
        issueId,
        onIssueTitleChange,
        setIssueDetails,
        setLoading,
        showNotification
    ]);
    // Memoized stable props
    const stableUsers = useMemo(()=>allUsers, [
        allUsers
    ]);
    const stableAssignees = useMemo(()=>assignees, [
        assignees
    ]);
    const stableIsLoading = useMemo(()=>loadingStates.assignees, [
        loadingStates.assignees
    ]);
    const currentStatus = issueDetails?.taxonomies?.status?.[0];
    const isLastStatus = useMemo(()=>{
        if (!currentStatus || !allStatuses.length) return true;
        return allStatuses.findIndex((s)=>s.term_id === currentStatus.term_id) === allStatuses.length - 1;
    }, [
        currentStatus,
        allStatuses
    ]);
    if (!isOpen) return null;
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(Modal, {
        size: "fill",
        onRequestClose: onClose,
        className: "alpaca-details-modal",
        headerActions: /*#__PURE__*/ React.createElement(Dropdown, {
            popoverProps: {
                placement: 'bottom-end'
            },
            renderToggle: ({ onToggle })=>/*#__PURE__*/ React.createElement(Tooltip, {
                    text: "Options",
                    __source: {
                        fileName: "src/components/Issue.jsx",
                        lineNumber: 427,
                        columnNumber: 15
                    }
                }, /*#__PURE__*/ React.createElement(Button, {
                    className: "alpaca-modal-options-button components-button has-icon",
                    onClick: onToggle,
                    __source: {
                        fileName: "src/components/Issue.jsx",
                        lineNumber: 428,
                        columnNumber: 17
                    }
                }, /*#__PURE__*/ React.createElement("span", {
                    className: "dashicons dashicons-ellipsis",
                    __source: {
                        fileName: "src/components/Issue.jsx",
                        lineNumber: 432,
                        columnNumber: 19
                    }
                }))),
            renderContent: ()=>/*#__PURE__*/ React.createElement(MenuGroup, {
                    __source: {
                        fileName: "src/components/Issue.jsx",
                        lineNumber: 437,
                        columnNumber: 15
                    }
                }, !isLastStatus && /*#__PURE__*/ React.createElement(MenuItem, {
                    icon: "arrow-right-alt",
                    iconPosition: "left",
                    onClick: handleProgressIssue,
                    disabled: loadingStates.status,
                    __source: {
                        fileName: "src/components/Issue.jsx",
                        lineNumber: 439,
                        columnNumber: 19
                    }
                }, "Progress Issue"), /*#__PURE__*/ React.createElement(MenuItem, {
                    icon: "trash",
                    iconPosition: "left",
                    isDestructive: true,
                    onClick: ()=>setShowDeleteConfirm(true),
                    __source: {
                        fileName: "src/components/Issue.jsx",
                        lineNumber: 448,
                        columnNumber: 17
                    }
                }, "Trash Issue")),
            __source: {
                fileName: "src/components/Issue.jsx",
                lineNumber: 424,
                columnNumber: 11
            }
        }),
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 419,
            columnNumber: 7
        },
        __self: undefined
    }, error && /*#__PURE__*/ React.createElement("div", {
        className: "notice notice-error",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 462,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 463,
            columnNumber: 13
        },
        __self: undefined
    }, error), /*#__PURE__*/ React.createElement(Button, {
        onClick: refetchData,
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 464,
            columnNumber: 13
        },
        __self: undefined
    }, "Retry")), notificationMessage && /*#__PURE__*/ React.createElement("div", {
        className: `notice notice-${notificationMessage.type}`,
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 469,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 470,
            columnNumber: 13
        },
        __self: undefined
    }, notificationMessage.message)), isLoadingDetails && /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 474,
            columnNumber: 30
        },
        __self: undefined
    }, "Loading..."), !isLoadingDetails && issueDetails && issueDetails.success && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-details",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 476,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-main column",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 477,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(EditableTitle, {
        isEditing: isEditingTitle,
        title: editedTitle,
        onEditStart: ()=>setIsEditingTitle(true),
        onChange: setEditedTitle,
        onSave: handleTitleSave,
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 478,
            columnNumber: 15
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-issue-meta flexalign",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 486,
            columnNumber: 15
        },
        __self: undefined
    }, "Created by ", /*#__PURE__*/ React.createElement((0, _userDefault.default), {
        user: issueDetails.post_data.post_author,
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 487,
            columnNumber: 28
        },
        __self: undefined
    }), ' ', /*#__PURE__*/ React.createElement((0, _timeDefault.default), {
        value: issueDetails.post_data.post_date,
        type: "relative",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 488,
            columnNumber: 17
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("table", {
        className: "alpaca-issue-details",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 494,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tbody", {
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 495,
            columnNumber: 17
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 496,
            columnNumber: 19
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 497,
            columnNumber: 21
        },
        __self: undefined
    }, "Status"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 498,
            columnNumber: 21
        },
        __self: undefined
    }, currentStatus?.name || 'Unknown')), /*#__PURE__*/ React.createElement(DeadlineRow, {
        deadline: deadline,
        onChange: handleDeadlineChange,
        onClear: handleDeadlineClear,
        isLoading: loadingStates.deadline,
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 501,
            columnNumber: 19
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(AssigneeRow, {
        assignees: stableAssignees,
        allUsers: stableUsers,
        onChange: handleAssigneeChange,
        isLoading: stableIsLoading,
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 508,
            columnNumber: 19
        },
        __self: undefined
    }))), wp.hooks.applyFilters('alpaca.issue.abovetabs', null, {
        issueId,
        meta: issueDetails.meta
    }), /*#__PURE__*/ React.createElement(TabPanel, {
        className: "alpaca-issue-tabs",
        initialTabName: "comments",
        tabs: (0, _tabsConfig.getTabsConfig)(issueDetails),
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 524,
            columnNumber: 15
        },
        __self: undefined
    }, (tab)=>{
        if (tab.name === 'errors') return /*#__PURE__*/ React.createElement((0, _errorsTabDefault.default), {
            errorsJson: issueDetails.meta.alpaca_errors || issueDetails.meta.errors,
            __source: {
                fileName: "src/components/Issue.jsx",
                lineNumber: 532,
                columnNumber: 23
            },
            __self: undefined
        });
        return /*#__PURE__*/ React.createElement((0, _tabContentDefault.default), {
            tab: tab,
            issueDetails: issueDetails,
            issueId: issueId,
            commentRefreshKey: commentRefreshKey,
            onScreenshotDelete: confirmScreenshotDelete,
            loadingStates: loadingStates,
            onScreenshotClick: setLightboxSrc,
            __source: {
                fileName: "src/components/Issue.jsx",
                lineNumber: 541,
                columnNumber: 21
            },
            __self: undefined
        });
    }))), !isLoadingDetails && (!issueDetails || !issueDetails.success) && /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 557,
            columnNumber: 11
        },
        __self: undefined
    }, issueDetails?.message || 'Could not load issue details.'), showDeleteScreenshotConfirm && /*#__PURE__*/ React.createElement(Modal, {
        title: "Delete Screenshot?",
        onRequestClose: ()=>setShowDeleteScreenshotConfirm(false),
        className: "alpaca-modal",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 561,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 566,
            columnNumber: 13
        },
        __self: undefined
    }, "Are you sure you want to delete this screenshot?"), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-actions flexalign",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 567,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        onClick: handleScreenshotDelete,
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 568,
            columnNumber: 15
        },
        __self: undefined
    }, "Delete"), /*#__PURE__*/ React.createElement(Button, {
        onClick: ()=>setShowDeleteScreenshotConfirm(false),
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 571,
            columnNumber: 15
        },
        __self: undefined
    }, "Cancel")))), showDeleteConfirm && /*#__PURE__*/ React.createElement(Modal, {
        title: "Delete Issue?",
        onRequestClose: ()=>setShowDeleteConfirm(false),
        className: "alpaca-modal",
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 580,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 585,
            columnNumber: 11
        },
        __self: undefined
    }, "Are you sure you want to trash this issue?"), /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        isDestructive: true,
        onClick: ()=>{
            onDelete(issueId);
            setShowDeleteConfirm(false);
        },
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 586,
            columnNumber: 11
        },
        __self: undefined
    }, "Delete"), /*#__PURE__*/ React.createElement(Button, {
        onClick: ()=>setShowDeleteConfirm(false),
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 596,
            columnNumber: 11
        },
        __self: undefined
    }, "Cancel")), lightboxSrc && /*#__PURE__*/ React.createElement((0, _lightboxDefault.default), {
        src: lightboxSrc,
        onClose: handleLightboxClose,
        __source: {
            fileName: "src/components/Issue.jsx",
            lineNumber: 601,
            columnNumber: 9
        },
        __self: undefined
    }));
};
AlpacaIssue.propTypes = {
    issueId: (0, _propTypesDefault.default).string.isRequired,
    isOpen: (0, _propTypesDefault.default).bool.isRequired,
    onClose: (0, _propTypesDefault.default).func.isRequired,
    onDelete: (0, _propTypesDefault.default).func.isRequired,
    onAssigneesChange: (0, _propTypesDefault.default).func.isRequired,
    onDeadlineChange: (0, _propTypesDefault.default).func.isRequired,
    onStatusChange: (0, _propTypesDefault.default).func.isRequired,
    onIssueTitleChange: (0, _propTypesDefault.default).func.isRequired
};
exports.default = AlpacaIssue;

},{"prop-types":"7wKI2","../utils/tabsConfig":"kaOzJ","../hooks/useIssueData":"5IBQX","../hooks/useUserManagement":"7BGvE","../hooks/useLoadingStates":"haQEY","../utils/assigneeUtils":"9o8NF","../services/issueApi":"bebt9","./issue/AssigneeSelector":"lBLYZ","./issue/DeadlineControl":"63IRX","./issue/TabContent":"14ymM","./issue/Lightbox":"krnYi","./issue/ErrorsTab":"91Aqy","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./User":"enwL1","./Time":"fOW67"}],"kaOzJ":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getTabsConfig", ()=>getTabsConfig);
const getTabsConfig = (issueDetails)=>{
    return [
        {
            name: 'comments',
            title: 'Timeline',
            className: 'comments'
        },
        {
            name: 'report',
            title: 'Report',
            className: 'report'
        },
        ...issueDetails?.meta?.alpaca_queried_object && issueDetails.meta.alpaca_queried_object !== 'null' || issueDetails?.meta?.queriedObject && issueDetails.meta.queriedObject !== 'null' ? [
            {
                name: 'queriedobject',
                title: 'Queried Object',
                className: 'queried-object'
            }
        ] : [],
        ...issueDetails?.meta?.alpaca_headers && issueDetails.meta.alpaca_headers !== 'null' || issueDetails?.meta?.headers && issueDetails.meta.headers !== 'null' ? [
            {
                name: 'headers',
                title: 'Headers',
                className: 'headers'
            }
        ] : [],
        ...issueDetails?.meta?.alpaca_errors && issueDetails.meta.alpaca_errors.length > 2 || issueDetails?.meta?.errors && issueDetails.meta.errors.length > 2 ? [
            {
                name: 'errors',
                title: 'Errors',
                className: 'errors'
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
                console.error('Error fetching issue data:', err);
                setError('Failed to load issue details. Please try again.');
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
                console.error('Error refetching issue data:', err);
                setError('Failed to load issue details. Please try again.');
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
                    avatar: u.avatar_urls?.['48'] || u.avatar_urls?.['96'] || u.avatar_urls?.['24'] || ''
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
            console.error('Error fetching users:', err);
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"lBLYZ":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const { FormTokenField } = wp.components;
const { memo } = wp.element;
const AssigneeSelector = memo(({ assignees, allUsers, onChange, isLoading })=>/*#__PURE__*/ React.createElement(FormTokenField, {
        label: "",
        placeholder: "Enter username(s)",
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
    }), // Only re-render if these props actually change
(prev, next)=>prev.isLoading === next.isLoading && prev.assignees.join(',') === next.assignees.join(',') && prev.allUsers.join(',') === next.allUsers.join(','));
exports.default = AssigneeSelector;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"63IRX":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
const { useState, useRef, memo } = wp.element;
const { BaseControl, Popover, DatePicker, Button } = wp.components;
const { date } = wp;
const datesettings = wp.date.getSettings();
/**
 * DeadlineControl component for managing issue deadlines.
 *
 * @param {Object}   root0           - Props object
 * @param {string}   root0.deadline  - Deadline date string
 * @param {Function} root0.onChange  - Change handler
 * @param {Function} root0.onClear   - Clear handler
 * @param {boolean}  root0.isLoading - Loading state
 * @return {JSX.Element} DeadlineControl component
 */ const DeadlineControl = memo(({ deadline, onChange, onClear, isLoading })=>{
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const calendarButtonRef = useRef();
    return /*#__PURE__*/ React.createElement(BaseControl, {
        id: "alpaca-deadline-control",
        className: "alpaca-deadline-control",
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 24,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-deadline flexalign",
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 28,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        ref: calendarButtonRef,
        className: `alpaca-input alpaca-deadline-display ${deadline ? '' : 'placeholder'}`,
        onClick: ()=>setIsEditingDeadline((prev)=>!prev),
        contentEditable: false,
        role: "button",
        tabIndex: 0,
        onKeyDown: (e)=>{
            if (e.key === 'Enter' || e.key === ' ') {
                setIsEditingDeadline(true);
                e.preventDefault();
            }
        },
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 29,
            columnNumber: 9
        },
        __self: undefined
    }, deadline ? date.format(datesettings.formats.date, deadline) : 'Click to select a deadline'), isEditingDeadline && /*#__PURE__*/ React.createElement(Popover, {
        placement: "bottom-start",
        onClose: ()=>setIsEditingDeadline(false),
        anchor: calendarButtonRef.current,
        focusOnMount: true,
        className: "alpaca-deadline-popover",
        onFocusOutside: ()=>setIsEditingDeadline(false),
        onEscape: ()=>setIsEditingDeadline(false),
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 49,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(DatePicker, {
        currentDate: deadline,
        onChange: (newDate)=>{
            onChange(newDate);
            setIsEditingDeadline(false);
        },
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 58,
            columnNumber: 13
        },
        __self: undefined
    })), deadline && /*#__PURE__*/ React.createElement(Button, {
        icon: "trash",
        label: "Clear deadline",
        onClick: onClear,
        disabled: isLoading,
        className: "is-small",
        __source: {
            fileName: "src/components/issue/DeadlineControl.jsx",
            lineNumber: 69,
            columnNumber: 11
        },
        __self: undefined
    })));
});
DeadlineControl.propTypes = {
    deadline: (0, _propTypesDefault.default).string,
    onChange: (0, _propTypesDefault.default).func.isRequired,
    onClear: (0, _propTypesDefault.default).func.isRequired,
    isLoading: (0, _propTypesDefault.default).bool
};
DeadlineControl.displayName = 'DeadlineControl';
exports.default = DeadlineControl;

},{"prop-types":"7wKI2","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"14ymM":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _comment = require("../Comment");
var _commentDefault = parcelHelpers.interopDefault(_comment);
var _jsonTable = require("./JsonTable");
var _jsonTableDefault = parcelHelpers.interopDefault(_jsonTable);
var _reportTab = require("./ReportTab");
var _reportTabDefault = parcelHelpers.interopDefault(_reportTab);
const { memo } = wp.element;
const TabContent = memo(({ tab, issueDetails, issueId, commentRefreshKey, onScreenshotDelete, loadingStates, onScreenshotClick })=>{
    switch(tab.name){
        case 'comments':
            return /*#__PURE__*/ React.createElement((0, _commentDefault.default), {
                issueId: issueId,
                commentRefreshKey: commentRefreshKey,
                __source: {
                    fileName: "src/components/issue/TabContent.jsx",
                    lineNumber: 19,
                    columnNumber: 11
                },
                __self: undefined
            });
        case 'report':
            return /*#__PURE__*/ React.createElement((0, _reportTabDefault.default), {
                issueDetails: issueDetails,
                onScreenshotDelete: onScreenshotDelete,
                isLoading: loadingStates.screenshot,
                onScreenshotClick: onScreenshotClick,
                __source: {
                    fileName: "src/components/issue/TabContent.jsx",
                    lineNumber: 23,
                    columnNumber: 11
                },
                __self: undefined
            });
        case 'queriedobject':
            return /*#__PURE__*/ React.createElement((0, _jsonTableDefault.default), {
                data: issueDetails.meta.alpaca_queried_object || issueDetails.meta.queriedObject,
                __source: {
                    fileName: "src/components/issue/TabContent.jsx",
                    lineNumber: 32,
                    columnNumber: 11
                },
                __self: undefined
            });
        case 'headers':
            return /*#__PURE__*/ React.createElement((0, _jsonTableDefault.default), {
                data: issueDetails.meta.alpaca_headers || issueDetails.meta.headers,
                __source: {
                    fileName: "src/components/issue/TabContent.jsx",
                    lineNumber: 41,
                    columnNumber: 11
                },
                __self: undefined
            });
        case 'jserrors':
            return null;
        default:
            return null;
    }
});
exports.default = TabContent;

},{"../Comment":"9JOlw","./JsonTable":"jh4NY","./ReportTab":"f6zxb","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"9JOlw":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
var _useUser = require("../hooks/useUser");
var _issueApi = require("../services/issueApi");
var _user = require("./User");
var _userDefault = parcelHelpers.interopDefault(_user);
var _time = require("./Time");
var _timeDefault = parcelHelpers.interopDefault(_time);
var _cookies = require("../utils/cookies");
var _marked = require("marked");
const { useState, useEffect, useRef, useCallback, useMemo, memo } = wp.element;
const { TextareaControl, Button, Modal } = wp.components;
/**
 * Comment component for displaying individual comments.
 *
 * @param {Object}   props                      - Props object
 * @param {Object}   props.comment              - Comment data
 * @param {Function} props.startEditing         - Start editing function
 * @param {Function} props.confirmDeleteComment - Confirm delete function
 * @param {number}   props.editingCommentId     - Current editing comment ID
 * @param {string}   props.editingContent       - Editing content
 * @param {Function} props.setEditingContent    - Set editing content function
 * @param {Object}   props.editingRef           - Ref for editing textarea
 * @param {Function} props.saveEdit             - Save edit function
 * @param {Function} props.cancelEditing        - Cancel editing function
 * @param {boolean}  props.isSubmitting         - Is submitting flag
 * @return {JSX.Element} Comment component
 */ // --- Single Comment ---
const Comment = memo(({ comment, startEditing, confirmDeleteComment, editingCommentId, editingContent, setEditingContent, editingRef, saveEdit, cancelEditing, isSubmitting, currentUser })=>{
    const author = comment._embedded?.author?.[0] || currentUser || {
        name: 'Unknown'
    };
    const dataSource = comment.author_user_agent === 'audit' ? 'audit' : 'human';
    const isAudit = dataSource === 'audit';
    const processedContent = useMemo(()=>{
        return comment.content.raw ? (0, _marked.marked)(comment.content.raw) : comment.content.rendered;
    }, [
        comment.content.raw,
        comment.content.rendered
    ]);
    if (isAudit) // --- Audit Comment Layout ---
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-timeline-item",
        "data-source": dataSource,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 60,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-timeline-content",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 61,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment-header",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 62,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _userDefault.default), {
        user: author,
        showName: false,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 63,
            columnNumber: 15
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment-content",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 64,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        dangerouslySetInnerHTML: {
            __html: processedContent
        },
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 65,
            columnNumber: 17
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement((0, _timeDefault.default), {
        value: comment.date,
        type: "relative",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 66,
            columnNumber: 17
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment-buttons",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 68,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        icon: "trash",
        label: "Delete",
        showTooltip: true,
        className: "button-link-delete",
        onClick: ()=>confirmDeleteComment(comment.id),
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 69,
            columnNumber: 17
        },
        __self: undefined
    })))));
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-timeline-item",
        "data-source": dataSource,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 84,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-timeline-content",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 85,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment-header flexalign",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 86,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _userDefault.default), {
        user: author,
        showName: false,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 87,
            columnNumber: 13
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment-author",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 88,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("strong", {
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 89,
            columnNumber: 15
        },
        __self: undefined
    }, author.name)), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment-date",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 91,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _timeDefault.default), {
        value: comment.date,
        type: "relative",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 92,
            columnNumber: 15
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment-buttons",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 94,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        label: "Edit",
        showTooltip: true,
        icon: "edit",
        onClick: ()=>startEditing(comment),
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 95,
            columnNumber: 15
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        icon: "trash",
        label: "Delete",
        showTooltip: true,
        className: "button-link-delete",
        onClick: ()=>confirmDeleteComment(comment.id),
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 101,
            columnNumber: 15
        },
        __self: undefined
    }))), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment-body",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 110,
            columnNumber: 11
        },
        __self: undefined
    }, editingCommentId === comment.id ? /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(TextareaControl, {
        value: editingContent,
        onChange: setEditingContent,
        ref: editingRef,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 113,
            columnNumber: 17
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        onClick: ()=>saveEdit(comment.id),
        disabled: isSubmitting,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 118,
            columnNumber: 17
        },
        __self: undefined
    }, "Save"), /*#__PURE__*/ React.createElement(Button, {
        onClick: cancelEditing,
        disabled: isSubmitting,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 125,
            columnNumber: 17
        },
        __self: undefined
    }, "Cancel")) : /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment-content",
        dangerouslySetInnerHTML: {
            __html: processedContent
        },
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 130,
            columnNumber: 15
        },
        __self: undefined
    }))));
}, (prev, next)=>prev.comment.id === next.comment.id && prev.editingCommentId === next.editingCommentId && prev.editingContent === next.editingContent && prev.isSubmitting === next.isSubmitting);
Comment.propTypes = {
    comment: (0, _propTypesDefault.default).object.isRequired,
    startEditing: (0, _propTypesDefault.default).func.isRequired,
    confirmDeleteComment: (0, _propTypesDefault.default).func.isRequired,
    editingCommentId: (0, _propTypesDefault.default).number,
    editingContent: (0, _propTypesDefault.default).string,
    setEditingContent: (0, _propTypesDefault.default).func.isRequired,
    editingRef: (0, _propTypesDefault.default).object,
    saveEdit: (0, _propTypesDefault.default).func.isRequired,
    cancelEditing: (0, _propTypesDefault.default).func.isRequired,
    isSubmitting: (0, _propTypesDefault.default).bool,
    currentUser: (0, _propTypesDefault.default).object
};
// --- Commenting Component ---
const Commenting = ({ issueId, commentRefreshKey })=>{
    const [comments, setComments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [deleteCommentId, setDeleteCommentId] = useState(null);
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [error, setError] = useState(null);
    const [notificationMessage, setNotificationMessage] = useState(null);
    const editingRef = useRef(null);
    const [sortOrder, setSortOrder] = useState((0, _cookies.getCookie)('comment_sort_order') || 'desc');
    const showNotification = useCallback((message)=>{
        setNotificationMessage(message);
        setTimeout(()=>setNotificationMessage(null), 5000);
    }, []);
    useEffect(()=>{
        (0, _useUser.getUser)().then(setCurrentUser);
    }, []);
    const toggleSortOrder = ()=>{
        const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        setSortOrder(newSortOrder);
        (0, _cookies.setCookie)('comment_sort_order', newSortOrder, 365);
        document.getElementById('alpaca-comments')?.classList.toggle('oldestfirst');
    };
    useEffect(()=>{
        if (sortOrder === 'asc') // Original condition was 'asc'
        document.getElementById('alpaca-comments').classList.add('oldestfirst');
        else document.getElementById('alpaca-comments').classList.remove('oldestfirst');
    }, [
        sortOrder
    ]);
    const fetchComments = useCallback(()=>{
        if (!issueId) return;
        setIsLoadingComments(true);
        setError(null);
        wp.apiFetch({
            path: `/wp/v2/comments?post=${issueId}&_embed=author&per_page=-1&orderby=date&order=desc&comment_type=issuecomment&show_hidden_comments=1&context=edit`
        }).then(setComments).catch((err)=>{
            console.error(err);
            setError('Could not load comments.');
        }).finally(()=>setIsLoadingComments(false));
    }, [
        issueId
    ]);
    useEffect(()=>fetchComments(), [
        fetchComments,
        commentRefreshKey
    ]);
    useEffect(()=>{
        const handleCommentCountChanged = ({ issueId: changedId })=>{
            if (changedId.toString() === issueId.toString()) fetchComments();
        };
        wp.hooks.addAction('alpaca.commentCountChanged', 'alpaca/commenting', handleCommentCountChanged);
        return ()=>wp.hooks.removeAction('alpaca.commentCountChanged', 'alpaca/commenting');
    }, [
        issueId,
        fetchComments
    ]);
    const handleCommentSubmit = useCallback(()=>{
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        const optimisticComment = {
            id: Date.now(),
            content: {
                raw: newComment
            },
            _embedded: {
                author: currentUser
            },
            date: new Date().toISOString(),
            author_user_agent: 'human'
        };
        setComments((prev)=>[
                optimisticComment,
                ...prev
            ]);
        setNewComment('');
        wp.apiFetch({
            path: `/wp/v2/comments`,
            method: 'POST',
            data: {
                content: newComment,
                post: issueId,
                comment_type: 'issuecomment',
                status: 'approve',
                author_user_agent: 'human'
            }
        }).then((created)=>{
            setComments((prev)=>prev.map((c)=>c.id === optimisticComment.id ? created : c));
            wp.hooks.doAction('alpaca.commentPosted', created);
            (0, _issueApi.fetchIssueCommentCount)(issueId).then((response)=>{
                if (response?.comment_count !== undefined) wp.hooks.doAction('alpaca.commentCountChanged', {
                    issueId: issueId.toString(),
                    newCount: response.comment_count
                });
            });
        }).catch((err)=>{
            console.error(err);
            setComments((prev)=>prev.filter((c)=>c.id !== optimisticComment.id));
            showNotification(`Failed to submit comment: ${err.message || 'Unknown error'}`);
        }).finally(()=>setIsSubmitting(false));
    }, [
        newComment,
        currentUser,
        issueId,
        showNotification
    ]);
    const startEditing = useCallback((comment)=>{
        setEditingCommentId(comment.id);
        setEditingContent(comment.content.raw || comment.content.rendered || '');
    }, []);
    const cancelEditing = useCallback(()=>{
        setEditingCommentId(null);
        setEditingContent('');
    }, []);
    const saveEdit = useCallback((commentId)=>{
        if (!editingContent.trim()) return;
        setIsSubmitting(true);
        wp.apiFetch({
            path: `/wp/v2/comments/${commentId}`,
            method: 'POST',
            data: {
                content: editingContent
            }
        }).then((updated)=>{
            setComments((prev)=>prev.map((c)=>c.id === commentId ? updated : c));
            setEditingCommentId(null);
            setEditingContent('');
            wp.hooks.doAction('alpaca.commentUpdated', updated);
        }).catch((err)=>{
            console.error(err);
            showNotification(`Failed to update comment: ${err.message || 'Unknown error'}`);
        }).finally(()=>setIsSubmitting(false));
    }, [
        editingContent,
        showNotification
    ]);
    const confirmDeleteComment = useCallback((commentId)=>setDeleteCommentId(commentId), []);
    const cancelDelete = useCallback(()=>setDeleteCommentId(null), []);
    const deleteComment = useCallback(()=>{
        if (!deleteCommentId) return;
        wp.apiFetch({
            path: `/wp/v2/comments/${deleteCommentId}`,
            method: 'DELETE',
            data: {
                force: true
            }
        }).then((deletedComment)=>{
            setComments((prev)=>prev.filter((c)=>c.id !== deleteCommentId));
            setDeleteCommentId(null);
            wp.hooks.doAction('alpaca.commentDeleted', deletedComment);
            // Dispatch event to update comment count
            // The deletedComment object contains the post ID
            const postId = deletedComment.previous.post;
            (0, _issueApi.fetchIssueCommentCount)(postId).then((response)=>{
                if (response && typeof response.comment_count !== 'undefined') wp.hooks.doAction('alpaca.commentCountChanged', {
                    issueId: postId.toString(),
                    newCount: response.comment_count
                });
            }).catch((err)=>{
                console.error('Error fetching updated comment count:', err);
            });
        }).catch((err)=>{
            console.error(err);
            showNotification(`Failed to delete comment: ${err.message || 'Unknown error'}`);
        });
    }, [
        deleteCommentId,
        showNotification
    ]);
    return /*#__PURE__*/ React.createElement("div", {
        id: "alpaca-comments-wrapper",
        className: "has-sidecontrols",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 369,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        id: "alpaca-comments-header",
        className: "sidecontrols",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 370,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Button, {
        variant: "tertiary",
        onClick: toggleSortOrder,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 371,
            columnNumber: 9
        },
        __self: undefined
    }, sortOrder === 'desc' ? "Sort: \u2191" : "Sort: \u2193")), /*#__PURE__*/ React.createElement("div", {
        id: "alpaca-comments",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 375,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comment-form",
        "data-source": "human",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 376,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _userDefault.default), {
        user: currentUser,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 377,
            columnNumber: 11
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-timeline-content",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 378,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(TextareaControl, {
        placeholder: "Add a comment...",
        value: newComment,
        onChange: setNewComment,
        disabled: isSubmitting,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 379,
            columnNumber: 13
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        onClick: handleCommentSubmit,
        disabled: isSubmitting,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 385,
            columnNumber: 13
        },
        __self: undefined
    }, isSubmitting ? 'Submitting...' : 'Submit Comment'))), isLoadingComments && /*#__PURE__*/ React.createElement("p", {
        className: "alpaca-loading",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 396,
            columnNumber: 11
        },
        __self: undefined
    }, "Loading comments..."), notificationMessage && /*#__PURE__*/ React.createElement("div", {
        className: "notice notice-error inline",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 399,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 400,
            columnNumber: 13
        },
        __self: undefined
    }, notificationMessage)), error && /*#__PURE__*/ React.createElement("p", {
        className: "alpaca-error",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 403,
            columnNumber: 19
        },
        __self: undefined
    }, error), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-comments-timeline",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 405,
            columnNumber: 9
        },
        __self: undefined
    }, comments.map((comment)=>/*#__PURE__*/ React.createElement(Comment, {
            key: comment.id,
            comment: comment,
            startEditing: startEditing,
            confirmDeleteComment: confirmDeleteComment,
            editingCommentId: editingCommentId,
            editingContent: editingContent,
            setEditingContent: setEditingContent,
            editingRef: editingRef,
            saveEdit: saveEdit,
            cancelEditing: cancelEditing,
            isSubmitting: isSubmitting,
            currentUser: currentUser,
            __source: {
                fileName: "src/components/Comment.jsx",
                lineNumber: 407,
                columnNumber: 13
            },
            __self: undefined
        }))), deleteCommentId && /*#__PURE__*/ React.createElement(Modal, {
        title: "Delete Comment?",
        onRequestClose: cancelDelete,
        className: "alpaca-modal",
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 425,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 430,
            columnNumber: 13
        },
        __self: undefined
    }, "Are you sure you want to delete this comment?"), /*#__PURE__*/ React.createElement(Button, {
        isPrimary: true,
        onClick: deleteComment,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 431,
            columnNumber: 13
        },
        __self: undefined
    }, "Delete"), /*#__PURE__*/ React.createElement(Button, {
        onClick: cancelDelete,
        __source: {
            fileName: "src/components/Comment.jsx",
            lineNumber: 434,
            columnNumber: 13
        },
        __self: undefined
    }, "Cancel"))));
};
Commenting.propTypes = {
    issueId: (0, _propTypesDefault.default).number.isRequired,
    commentRefreshKey: (0, _propTypesDefault.default).number.isRequired
};
exports.default = memo(Commenting);

},{"../hooks/useUser":"7ZWZh","../services/issueApi":"bebt9","prop-types":"7wKI2","./User":"enwL1","../utils/cookies":"4qoXW","marked":"4duqf","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./Time":"fOW67"}],"enwL1":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
var _useUser = require("../hooks/useUser");
const { useMemo } = wp.element;
const User = ({ user: userProp, showAvatar = true, showName = true })=>{
    const { user, loading } = (0, _useUser.useUser)(userProp);
    const { userName, avatarUrl } = useMemo(()=>{
        if (!user) return {
            userName: null,
            avatarUrl: null
        };
        const apiData = user;
        const displayName = apiData.displayName || apiData.display_name || apiData.name; // eslint-disable-line camelcase
        const avatarUrls = apiData.avatar_urls; // eslint-disable-line camelcase
        return {
            userName: displayName,
            avatarUrl: apiData.avatar || avatarUrls && avatarUrls[96]
        };
    }, [
        user
    ]);
    if (loading) return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user",
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 20,
            columnNumber: 23
        },
        __self: undefined
    }, "Loading...");
    if (!user) return null;
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user flexalign",
        title: userName,
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 24,
            columnNumber: 5
        },
        __self: undefined
    }, showAvatar && avatarUrl && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user-avatar",
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 26,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("img", {
        src: avatarUrl,
        alt: `Avatar of ${userName}`,
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 27,
            columnNumber: 11
        },
        __self: undefined
    })), showName && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-user-name",
        __source: {
            fileName: "src/components/User.jsx",
            lineNumber: 30,
            columnNumber: 20
        },
        __self: undefined
    }, userName));
};
User.propTypes = {
    user: (0, _propTypesDefault.default).object,
    showAvatar: (0, _propTypesDefault.default).bool,
    showName: (0, _propTypesDefault.default).bool
};
exports.default = User;

},{"prop-types":"7wKI2","../hooks/useUser":"7ZWZh","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4qoXW":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "setCookie", ()=>setCookie);
parcelHelpers.export(exports, "getCookie", ()=>getCookie);
const setCookie = (name, value, days)=>{
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 86400000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
};
const getCookie = (name)=>{
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++){
        let c = ca[i];
        while(c.charAt(0) === ' ')c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4duqf":[function(require,module,exports,__globalThis) {
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

},{}],"fOW67":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
const { useReducer, useEffect, useMemo, memo } = wp.element;
const { Tooltip } = wp.components;
const Time = memo(({ value, type = 'absolute', format, autoUpdate = true })=>{
    // useReducer to force re-render for relative time updates
    const [, forceUpdate] = useReducer((x)=>x + 1, 0);
    // Auto-update every 15 seconds
    useEffect(()=>{
        if (type !== 'relative' || !autoUpdate) return;
        const interval = setInterval(forceUpdate, 15000);
        return ()=>clearInterval(interval);
    }, [
        type,
        autoUpdate
    ]);
    // Convert string to JS Date
    const dateObj = useMemo(()=>value ? new Date(`${value}Z`) : null, [
        value
    ]);
    if (!dateObj || isNaN(dateObj.getTime())) return null;
    const wpFormat = format || wp.date.getSettings().formats.datetime;
    const formattedAbsolute = wp.date.dateI18n(wpFormat, dateObj);
    if (type === 'relative') {
        const secondsDiff = Math.floor((new Date() - dateObj) / 1000);
        // Show "just now" for the first minute
        const relative = secondsDiff < 60 ? 'just now' : window.moment(dateObj).fromNow();
        return /*#__PURE__*/ React.createElement(Tooltip, {
            text: formattedAbsolute,
            __source: {
                fileName: "src/components/Time.jsx",
                lineNumber: 35,
                columnNumber: 7
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("span", {
            className: "timestamp",
            __source: {
                fileName: "src/components/Time.jsx",
                lineNumber: 36,
                columnNumber: 9
            },
            __self: undefined
        }, relative));
    }
    return /*#__PURE__*/ React.createElement("span", {
        className: "timestamp",
        __source: {
            fileName: "src/components/Time.jsx",
            lineNumber: 41,
            columnNumber: 10
        },
        __self: undefined
    }, formattedAbsolute);
});
Time.propTypes = {
    value: (0, _propTypesDefault.default).string,
    type: (0, _propTypesDefault.default).oneOf([
        'absolute',
        'relative'
    ]),
    format: (0, _propTypesDefault.default).string,
    autoUpdate: (0, _propTypesDefault.default).bool
};
Time.displayName = 'Time';
exports.default = Time;

},{"prop-types":"7wKI2","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"jh4NY":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const { memo } = wp.element;
const JsonTable = memo(({ data })=>{
    if (!data) return null;
    let parsedData;
    try {
        if (typeof data === 'string') {
            if (data === 'null') return null;
            parsedData = JSON.parse(data);
        } else parsedData = data;
        if (!parsedData || typeof parsedData !== 'object') {
            console.error('JsonTable: Invalid data format', parsedData);
            return /*#__PURE__*/ React.createElement("p", {
                __source: {
                    fileName: "src/components/issue/JsonTable.jsx",
                    lineNumber: 17,
                    columnNumber: 14
                },
                __self: undefined
            }, "Invalid data format");
        }
    } catch (e) {
        console.error('JsonTable: Error parsing JSON', e, data);
        return /*#__PURE__*/ React.createElement("p", {
            __source: {
                fileName: "src/components/issue/JsonTable.jsx",
                lineNumber: 21,
                columnNumber: 12
            },
            __self: undefined
        }, "Error parsing JSON data");
    }
    return /*#__PURE__*/ React.createElement("table", {
        className: "alpaca-json-table widefat striped",
        style: {
            borderCollapse: 'collapse',
            width: '100%'
        },
        __source: {
            fileName: "src/components/issue/JsonTable.jsx",
            lineNumber: 25,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tbody", {
        __source: {
            fileName: "src/components/issue/JsonTable.jsx",
            lineNumber: 29,
            columnNumber: 7
        },
        __self: undefined
    }, Object.entries(parsedData).map(([key, value])=>/*#__PURE__*/ React.createElement("tr", {
            key: key,
            __source: {
                fileName: "src/components/issue/JsonTable.jsx",
                lineNumber: 31,
                columnNumber: 11
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("th", {
            __source: {
                fileName: "src/components/issue/JsonTable.jsx",
                lineNumber: 32,
                columnNumber: 13
            },
            __self: undefined
        }, key), /*#__PURE__*/ React.createElement("td", {
            __source: {
                fileName: "src/components/issue/JsonTable.jsx",
                lineNumber: 33,
                columnNumber: 13
            },
            __self: undefined
        }, String(value))))));
});
exports.default = JsonTable;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"f6zxb":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
const { memo } = wp.element;
const { Button } = wp.components;
const { date } = wp;
const datesettings = wp.date.getSettings();
/**
 * ReportTab component for displaying issue report information.
 *
 * @param {Object}   root0                    - Props object
 * @param {Object}   root0.issueDetails       - Issue details object
 * @param {Function} root0.onScreenshotDelete - Screenshot delete handler
 * @param {boolean}  root0.isLoading          - Loading state
 * @param {Function} root0.onScreenshotClick  - Screenshot click handler
 * @return {JSX.Element} ReportTab component
 */ const ReportTab = memo(({ issueDetails, onScreenshotDelete, isLoading, onScreenshotClick })=>/*#__PURE__*/ React.createElement("div", {
        className: "alpaca-report-tab",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 21,
            columnNumber: 5
        },
        __self: undefined
    }, (issueDetails.meta.alpaca_screenshot || issueDetails.meta.screenshot) && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-screenshot-wrapper",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 24,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("img", {
        src: issueDetails.meta.alpaca_screenshot || issueDetails.meta.screenshot,
        className: "alpaca-screenshot",
        alt: "Screenshot",
        style: {
            cursor: 'zoom-in',
            maxWidth: '100%'
        },
        onClick: ()=>onScreenshotClick(issueDetails.meta.alpaca_screenshot || issueDetails.meta.screenshot),
        role: "button",
        tabIndex: 0,
        onKeyDown: (e)=>{
            if (e.key === 'Enter' || e.key === ' ') onScreenshotClick(issueDetails.meta.alpaca_screenshot || issueDetails.meta.screenshot);
        },
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 26,
            columnNumber: 11
        },
        __self: undefined
    }), /*#__PURE__*/ React.createElement(Button, {
        disabled: isLoading,
        onClick: (e)=>{
            e.preventDefault();
            e.stopPropagation();
            onScreenshotDelete();
        },
        label: "Delete",
        showTooltip: "true",
        tooltipPosition: "middle left",
        icon: "trash",
        isDestructive: true,
        className: "alpaca-screenshot-delete",
        variant: "primary",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 52,
            columnNumber: 11
        },
        __self: undefined
    })), /*#__PURE__*/ React.createElement("table", {
        className: "widefat striped",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 70,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tbody", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 71,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 72,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 73,
            columnNumber: 13
        },
        __self: undefined
    }, "Reported"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 74,
            columnNumber: 13
        },
        __self: undefined
    }, date.format(datesettings.formats.datetimeAbbreviated, new Date(issueDetails.post_data.post_date)))), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 81,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 82,
            columnNumber: 13
        },
        __self: undefined
    }, "Last edit"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 83,
            columnNumber: 13
        },
        __self: undefined
    }, date.format(datesettings.formats.datetimeAbbreviated, new Date(issueDetails.post_data.post_modified)))), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 90,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 91,
            columnNumber: 13
        },
        __self: undefined
    }, "URL"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 92,
            columnNumber: 13
        },
        __self: undefined
    }, issueDetails.meta.alpaca_url || issueDetails.meta.URL ? /*#__PURE__*/ React.createElement("a", {
        href: issueDetails.meta.alpaca_url || issueDetails.meta.URL,
        target: "_blank",
        rel: "noopener noreferrer",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 94,
            columnNumber: 17
        },
        __self: undefined
    }, issueDetails.meta.alpaca_url || issueDetails.meta.URL) : 'N/A')), /*#__PURE__*/ React.createElement("tr", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 106,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("th", {
        scope: "row",
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 107,
            columnNumber: 13
        },
        __self: undefined
    }, "Screen"), /*#__PURE__*/ React.createElement("td", {
        __source: {
            fileName: "src/components/issue/ReportTab.jsx",
            lineNumber: 108,
            columnNumber: 13
        },
        __self: undefined
    }, (issueDetails.meta.alpaca_screenwidth || issueDetails.meta.screenwidth) && (issueDetails.meta.alpaca_screenheight || issueDetails.meta.screenheight) ? `${issueDetails.meta.alpaca_screenwidth || issueDetails.meta.screenwidth} x ${issueDetails.meta.alpaca_screenheight || issueDetails.meta.screenheight}` : 'N/A')), Object.entries(issueDetails.taxonomies).filter(([taxonomy])=>taxonomy !== 'assignee').map(([taxonomy, terms])=>/*#__PURE__*/ React.createElement("tr", {
            key: taxonomy,
            __source: {
                fileName: "src/components/issue/ReportTab.jsx",
                lineNumber: 126,
                columnNumber: 15
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("th", {
            style: {
                textTransform: 'capitalize'
            },
            __source: {
                fileName: "src/components/issue/ReportTab.jsx",
                lineNumber: 127,
                columnNumber: 17
            },
            __self: undefined
        }, taxonomy), /*#__PURE__*/ React.createElement("td", {
            __source: {
                fileName: "src/components/issue/ReportTab.jsx",
                lineNumber: 128,
                columnNumber: 17
            },
            __self: undefined
        }, terms.map((term)=>term.name).join(', '))))))));
ReportTab.propTypes = {
    issueDetails: (0, _propTypesDefault.default).object.isRequired,
    onScreenshotDelete: (0, _propTypesDefault.default).func.isRequired,
    isLoading: (0, _propTypesDefault.default).bool.isRequired,
    onScreenshotClick: (0, _propTypesDefault.default).func.isRequired
};
ReportTab.displayName = 'ReportTab';
exports.default = ReportTab;

},{"prop-types":"7wKI2","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"krnYi":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _reactDom = require("react-dom"); // eslint-disable-line import/no-extraneous-dependencies
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
const { useEffect, memo } = wp.element;
/**
 * Lightbox component for displaying enlarged images.
 *
 * @param {Object}   root0         - Props object
 * @param {string}   root0.src     - Image source URL
 * @param {Function} root0.onClose - Close handler
 * @return {JSX.Element} Lightbox component
 */ const Lightbox = memo(({ src, onClose })=>{
    useEffect(()=>{
        const handleKeyDown = (e)=>{
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return ()=>document.removeEventListener('keydown', handleKeyDown);
    }, [
        onClose
    ]);
    return /*#__PURE__*/ (0, _reactDom.createPortal)(/*#__PURE__*/ React.createElement("div", {
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999999999999
        },
        onClick: onClose,
        role: "button",
        tabIndex: 0,
        onKeyDown: (e)=>{
            if (e.key === 'Enter' || e.key === ' ') onClose();
        },
        __source: {
            fileName: "src/components/issue/Lightbox.jsx",
            lineNumber: 23,
            columnNumber: 5
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("img", {
        src: src,
        alt: "Enlarged screenshot",
        style: {
            maxWidth: '90%',
            maxHeight: '90%',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        },
        __source: {
            fileName: "src/components/issue/Lightbox.jsx",
            lineNumber: 45,
            columnNumber: 7
        },
        __self: undefined
    })), document.body);
});
Lightbox.propTypes = {
    src: (0, _propTypesDefault.default).string.isRequired,
    onClose: (0, _propTypesDefault.default).func.isRequired
};
Lightbox.displayName = 'Lightbox';
exports.default = Lightbox;

},{"react-dom":"fc7O8","prop-types":"7wKI2","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"fc7O8":[function(require,module,exports,__globalThis) {
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"91Aqy":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _jsonTable = require("./JsonTable");
var _jsonTableDefault = parcelHelpers.interopDefault(_jsonTable);
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
const { useMemo } = wp.element;
const { decodeEntities } = wp.htmlEntities;
/**
 * ErrorsTab component for displaying error information in a table format.
 *
 * @param {Object} root0            - Props object
 * @param {string} root0.errorsJson - JSON string of errors
 * @return {JSX.Element} ErrorsTab component
 */ const ErrorsTab = ({ errorsJson })=>{
    const errors = useMemo(()=>{
        if (!errorsJson || typeof errorsJson !== 'string') return [];
        try {
            const parsed = JSON.parse(errorsJson);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Failed to parse errors JSON:', e);
            return [];
        }
    }, [
        errorsJson
    ]);
    if (errors.length === 0) return /*#__PURE__*/ React.createElement("p", {
        __source: {
            fileName: "src/components/issue/ErrorsTab.jsx",
            lineNumber: 27,
            columnNumber: 12
        },
        __self: undefined
    }, "No JavaScript errors were recorded for this issue.");
    return /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-errors-tab",
        __source: {
            fileName: "src/components/issue/ErrorsTab.jsx",
            lineNumber: 31,
            columnNumber: 5
        },
        __self: undefined
    }, errors.map((error, index)=>{
        // Remove stack from main object to display it separately
        const { stack, ...errorWithoutStack } = error;
        return /*#__PURE__*/ React.createElement("div", {
            key: index,
            className: "alpaca-error-item",
            style: {
                marginBottom: '2rem',
                borderBottom: '1px solid #eee',
                paddingBottom: '1rem'
            },
            __source: {
                fileName: "src/components/issue/ErrorsTab.jsx",
                lineNumber: 36,
                columnNumber: 11
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("h4", {
            __source: {
                fileName: "src/components/issue/ErrorsTab.jsx",
                lineNumber: 45,
                columnNumber: 13
            },
            __self: undefined
        }, "Error #", index + 1, ": ", error.message), /*#__PURE__*/ React.createElement((0, _jsonTableDefault.default), {
            data: JSON.stringify(errorWithoutStack),
            __source: {
                fileName: "src/components/issue/ErrorsTab.jsx",
                lineNumber: 48,
                columnNumber: 13
            },
            __self: undefined
        }), stack && /*#__PURE__*/ React.createElement("div", {
            className: "alpaca-error-stack",
            style: {
                marginTop: '1rem'
            },
            __source: {
                fileName: "src/components/issue/ErrorsTab.jsx",
                lineNumber: 50,
                columnNumber: 15
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("h5", {
            __source: {
                fileName: "src/components/issue/ErrorsTab.jsx",
                lineNumber: 51,
                columnNumber: 17
            },
            __self: undefined
        }, "Stack Trace"), /*#__PURE__*/ React.createElement("pre", {
            style: {
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                background: '#f7f7f7',
                padding: '1rem',
                borderRadius: '4px'
            },
            __source: {
                fileName: "src/components/issue/ErrorsTab.jsx",
                lineNumber: 52,
                columnNumber: 17
            },
            __self: undefined
        }, /*#__PURE__*/ React.createElement("code", {
            __source: {
                fileName: "src/components/issue/ErrorsTab.jsx",
                lineNumber: 61,
                columnNumber: 19
            },
            __self: undefined
        }, decodeEntities(stack)))));
    }));
};
ErrorsTab.propTypes = {
    errorsJson: (0, _propTypesDefault.default).string
};
exports.default = ErrorsTab;

},{"./JsonTable":"jh4NY","prop-types":"7wKI2","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"QNfzH":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _draggableItem = require("./DraggableItem");
var _draggableItemDefault = parcelHelpers.interopDefault(_draggableItem);
var _item = require("./Item");
var _itemDefault = parcelHelpers.interopDefault(_item);
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
const { Card, CardHeader, CardBody, DropdownMenu, TextControl } = wp.components;
const { Heading = wp.components.__experimentalHeading } = wp.components;
const { useState, useEffect, useRef } = wp.element;
/**
 * Container component (delegates rename to parent via onRename).
 *
 * @param {Object}   root0                 - Props object
 * @param {number}   root0.id              - Container ID
 * @param {string}   root0.title           - Container title
 * @param {Array}    root0.items           - Array of items in the container
 * @param {Function} root0.onItemClick     - Callback when item is clicked
 * @param {Function} root0.onMoveAllToNext - Callback to move all items to next container
 * @param {Function} root0.onDeleteAll     - Callback to delete all items
 * @param {boolean}  root0.isLastContainer - Whether this is the last container
 * @param {boolean}  root0.isHidden        - Whether container is hidden
 * @param {Function} root0.onToggleHidden  - Callback to toggle hidden state
 * @param {Function} root0.onRename        - Callback to rename container
 * @param {Function} root0.onItemDrop
 * @return {JSX.Element} Container component
 */ function Container({ id, title, items, onItemClick, onMoveAllToNext, onDeleteAll, isLastContainer, isHidden, onToggleHidden, onRename, onItemDrop }) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [newTitle, setNewTitle] = useState(title);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);
    const hasItems = items.length > 0;
    // keep local input in sync if parent updates title
    useEffect(()=>{
        setNewTitle(title);
    }, [
        title
    ]);
    // auto-select when input appears
    useEffect(()=>{
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
        if (newTitle.trim() !== '' && newTitle !== title) onRename(id, newTitle);
        else setNewTitle(title);
    };
    const handleCancelRename = ()=>{
        setIsRenaming(false);
        setNewTitle(title);
    };
    const handleKeyDown = (event)=>{
        if (event.key === 'Enter') {
            event.preventDefault();
            handleRename();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            handleCancelRename();
        }
    };
    const menuControls = [
        {
            icon: 'edit',
            title: 'Rename',
            onClick: ()=>{
                setNewTitle(title);
                setIsRenaming(true);
            }
        },
        {
            icon: isHidden ? 'visibility' : 'hidden',
            title: isHidden ? 'Expand Column' : 'Collapse Column',
            onClick: toggleHidden
        }
    ];
    if (!isLastContainer) menuControls.push({
        icon: 'arrow-right-alt',
        title: 'Move All To Next Column',
        onClick: ()=>onMoveAllToNext(id),
        disabled: !hasItems
    });
    if (isLastContainer) menuControls.push({
        icon: 'trash',
        title: 'Delete All',
        onClick: ()=>onDeleteAll(id)
    });
    const handleDragOver = (e)=>{
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
        // throttle expensive work to avoid jank on large lists
        if (!handleDragOver._last || Date.now() - handleDragOver._last > 50) handleDragOver._last = Date.now();
        else return;
        // try to read drag payload so we can show a live preview.
        // Prefer dataTransfer, fall back to global state (window.__alpacaDragState).
        let parsed = null;
        try {
            const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
            if (raw) parsed = JSON.parse(raw);
        } catch (err) {
            parsed = null;
        }
        if (!parsed && typeof window !== 'undefined') try {
            parsed = window.__alpacaDragState || null;
        } catch (err) {
            parsed = null;
        }
        if (parsed && parsed.itemId) {
            const destIndex = getDropIndex(e);
            setDragOverIndex(destIndex);
            setDragOverItem(parsed);
        } else {
            setDragOverIndex(null);
            setDragOverItem(null);
        }
    };
    const handleDragLeave = (e)=>{
        // Only clear when leaving the container element
        if (containerRef.current && !containerRef.current.contains(e.relatedTarget)) {
            setIsDragOver(false);
            setDragOverIndex(null);
            setDragOverItem(null);
        }
    };
    const getDropIndex = (e)=>{
        const el = containerRef.current;
        if (!el) return items.length;
        const children = Array.from(el.querySelectorAll('.alpaca-item:not(.empty)'));
        for(let i = 0; i < children.length; i++){
            const rect = children[i].getBoundingClientRect();
            if (e.clientY < rect.top + rect.height / 2) return i;
        }
        return children.length;
    };
    const handleDrop = (e)=>{
        e.preventDefault();
        setIsDragOver(false);
        // Don't clear global drag state yet; consume it below after calling onItemDrop
        // Read payload from dataTransfer if available, otherwise nothing - caller may rely on payload
        const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
        let parsed = null;
        if (raw) try {
            parsed = JSON.parse(raw);
        } catch (err) {
            parsed = null;
        }
        const { itemId, sourceContainerId, sourceIndex } = parsed || {};
        const destIndex = getDropIndex(e);
        // Clear preview state immediately to avoid temporary hiding of the dropped element
        setDragOverIndex(null);
        setDragOverItem(null);
        if (onItemDrop) onItemDrop({
            itemId,
            sourceContainerId,
            sourceIndex,
            destinationContainerId: id,
            destinationIndex: destIndex
        });
        // Now that we've consumed the payload, clear the global drag state so
        // subsequent renders won't treat the source item as hidden and remove any
        // leftover clones from the DOM.
        try {
            if (typeof window !== 'undefined') {
                if (window.__alpacaDragState) delete window.__alpacaDragState;
                // eslint-disable-next-line global-require
                const { removeDragClone } = require("79b7fbfd2d1aa215");
                try {
                    removeDragClone();
                } catch (removeErr) {
                // ignore
                }
            }
        } catch (err) {
        // ignore
        }
    };
    return /*#__PURE__*/ React.createElement(Card, {
        className: `alpaca-container ${isHidden ? 'hidden' : ''}`,
        "data-id": id,
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 245,
            columnNumber: 5
        },
        __self: this
    }, /*#__PURE__*/ React.createElement(CardHeader, {
        className: "alpaca-container-header",
        size: "xSmall",
        isBorderless: true,
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 249,
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
            lineNumber: 255,
            columnNumber: 11
        },
        __self: this
    }) : /*#__PURE__*/ React.createElement(Heading, {
        level: 2,
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 264,
            columnNumber: 11
        },
        __self: this
    }, title, " ", /*#__PURE__*/ React.createElement("span", {
        className: "alpaca-item-count",
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 265,
            columnNumber: 21
        },
        __self: this
    }, items.length)), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-container-controls",
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 269,
            columnNumber: 9
        },
        __self: this
    }, /*#__PURE__*/ React.createElement(DropdownMenu, {
        icon: "menu",
        label: "Options",
        controls: menuControls,
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 270,
            columnNumber: 11
        },
        __self: this
    }))), /*#__PURE__*/ React.createElement(CardBody, {
        className: "alpaca-container-body",
        size: "xSmall",
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 274,
            columnNumber: 7
        },
        __self: this
    }, /*#__PURE__*/ React.createElement("div", {
        ref: containerRef,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        className: `alpaca-items ${isDragOver ? 'dragging-over' : ''}`,
        __source: {
            fileName: "src/components/Container.jsx",
            lineNumber: 275,
            columnNumber: 9
        },
        __self: this
    }, (()=>{
        // If there's an active drag preview, render the previewed list (remove source item if same container)
        if (dragOverItem) {
            const itemIdStr = dragOverItem.itemId?.toString();
            let previewItems = items;
            if (dragOverItem.sourceContainerId && dragOverItem.sourceContainerId.toString() === id.toString()) previewItems = items.filter((it)=>it.id !== itemIdStr);
            const insertAt = Math.max(0, Math.min(previewItems.length, dragOverIndex === null ? previewItems.length : dragOverIndex));
            return /*#__PURE__*/ React.createElement(React.Fragment, null, previewItems.slice(0, insertAt).map((item, index)=>/*#__PURE__*/ React.createElement((0, _draggableItemDefault.default), {
                    className: "alpaca-item",
                    key: item.id,
                    id: item.id,
                    index: index,
                    containerId: id,
                    content: item.content,
                    assignees: item.assignees,
                    commentCount: item.commentCount,
                    meta: item.meta,
                    onClick: onItemClick,
                    __source: {
                        fileName: "src/components/Container.jsx",
                        lineNumber: 305,
                        columnNumber: 21
                    },
                    __self: this
                })), /*#__PURE__*/ React.createElement("div", {
                className: "alpaca-item placeholder",
                key: `placeholder-${dragOverItem.itemId}`,
                __source: {
                    fileName: "src/components/Container.jsx",
                    lineNumber: 319,
                    columnNumber: 19
                },
                __self: this
            }, dragOverItem.content ? /*#__PURE__*/ React.createElement((0, _itemDefault.default), {
                content: dragOverItem.content,
                assignees: dragOverItem.assignees,
                commentCount: dragOverItem.commentCount,
                meta: dragOverItem.meta,
                className: "alpaca-item-inner",
                __source: {
                    fileName: "src/components/Container.jsx",
                    lineNumber: 324,
                    columnNumber: 23
                },
                __self: this
            }) : /*#__PURE__*/ React.createElement("div", {
                className: "alpaca-item-inner",
                __source: {
                    fileName: "src/components/Container.jsx",
                    lineNumber: 332,
                    columnNumber: 23
                },
                __self: this
            }, "Moving...")), previewItems.slice(insertAt).map((item, index)=>/*#__PURE__*/ React.createElement((0, _draggableItemDefault.default), {
                    className: "alpaca-item",
                    key: item.id,
                    id: item.id,
                    index: insertAt + index,
                    containerId: id,
                    content: item.content,
                    assignees: item.assignees,
                    commentCount: item.commentCount,
                    meta: item.meta,
                    onClick: onItemClick,
                    __source: {
                        fileName: "src/components/Container.jsx",
                        lineNumber: 337,
                        columnNumber: 21
                    },
                    __self: this
                })));
        }
        return hasItems ? (()=>{
            const globalDrag = typeof window !== 'undefined' ? window.__alpacaDragState : null;
            return items.map((item, index)=>{
                const isSourceHidden = globalDrag && globalDrag.itemId && globalDrag.sourceContainerId && globalDrag.itemId.toString() === item.id.toString() && globalDrag.sourceContainerId.toString() === id.toString();
                if (isSourceHidden) return /*#__PURE__*/ React.createElement("div", {
                    className: "alpaca-item",
                    key: item.id,
                    __source: {
                        fileName: "src/components/Container.jsx",
                        lineNumber: 370,
                        columnNumber: 23
                    },
                    __self: this
                }, /*#__PURE__*/ React.createElement((0, _itemDefault.default), {
                    id: item.id,
                    content: item.content,
                    assignees: item.assignees,
                    commentCount: item.commentCount,
                    meta: item.meta,
                    className: "alpaca-item-inner",
                    style: {
                        visibility: 'hidden'
                    },
                    __source: {
                        fileName: "src/components/Container.jsx",
                        lineNumber: 371,
                        columnNumber: 25
                    },
                    __self: this
                }));
                return /*#__PURE__*/ React.createElement((0, _draggableItemDefault.default), {
                    className: "alpaca-item",
                    key: item.id,
                    id: item.id,
                    index: index,
                    containerId: id,
                    content: item.content,
                    assignees: item.assignees,
                    commentCount: item.commentCount,
                    meta: item.meta,
                    onClick: onItemClick,
                    __source: {
                        fileName: "src/components/Container.jsx",
                        lineNumber: 385,
                        columnNumber: 21
                    },
                    __self: this
                });
            });
        })() : /*#__PURE__*/ React.createElement("div", {
            className: "alpaca-item empty",
            __source: {
                fileName: "src/components/Container.jsx",
                lineNumber: 401,
                columnNumber: 15
            },
            __self: this
        }, "Drop items here");
    })())));
}
Container.propTypes = {
    id: (0, _propTypesDefault.default).number.isRequired,
    title: (0, _propTypesDefault.default).string.isRequired,
    items: (0, _propTypesDefault.default).arrayOf((0, _propTypesDefault.default).shape({
        id: (0, _propTypesDefault.default).number.isRequired,
        content: (0, _propTypesDefault.default).string,
        assignees: (0, _propTypesDefault.default).array,
        commentCount: (0, _propTypesDefault.default).number,
        meta: (0, _propTypesDefault.default).object
    })).isRequired,
    onItemClick: (0, _propTypesDefault.default).func.isRequired,
    onMoveAllToNext: (0, _propTypesDefault.default).func.isRequired,
    onDeleteAll: (0, _propTypesDefault.default).func.isRequired,
    isLastContainer: (0, _propTypesDefault.default).bool.isRequired,
    isHidden: (0, _propTypesDefault.default).bool.isRequired,
    onToggleHidden: (0, _propTypesDefault.default).func.isRequired,
    onRename: (0, _propTypesDefault.default).func.isRequired,
    onItemDrop: (0, _propTypesDefault.default).func
};
exports.default = Container;

},{"./DraggableItem":"1yzcB","prop-types":"7wKI2","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./Item":"2yEr4","79b7fbfd2d1aa215":"../utils/dragClone"}],"1yzcB":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
var _item = require("./Item");
var _itemDefault = parcelHelpers.interopDefault(_item);
const { useRef, useState } = wp.element;
// const { Draggable: WPDraggable } = wp.components || {};
/**
 * Draggable item wrapper component.
 *
 * @param {Object}          root0                - Props object
 * @param {number}          root0.id             - Item ID
 * @param {number}          root0.index          - Index in drag list
 * @param {string}          root0.content        - Item content text
 * @param {string}          root0.className      - CSS class name
 * @param {boolean}         root0.isDragDisabled - Whether dragging is disabled
 * @param {Function}        root0.onClick        - Click handler
 * @param {Array}           root0.assignees      - Array of assignees
 * @param {number}          root0.commentCount   - Comment count
 * @param {Object}          root0.meta           - Metadata object
 * @param {(number|string)} root0.containerId    - Container ID (number or string)
 * @return {JSX.Element}                          - Draggable item component
 */ function DraggableItem({ id, index, containerId, content, className, isDragDisabled = false, onClick, assignees = [], commentCount, meta }) {
    const elRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const handleClick = (event)=>{
        if (onClick) onClick(event, id);
    };
    const handleDragStart = (e)=>{
        setIsDragging(true);
        const payload = {
            itemId: id,
            sourceContainerId: containerId,
            sourceIndex: index,
            content,
            assignees,
            commentCount,
            meta
        };
        try {
            e.dataTransfer.setData('application/json', JSON.stringify(payload));
        } catch (err) {
        // ignore
        }
        // Fallback: store payload on window so dragover handlers can read it
        try {
            window.__alpacaDragState = payload;
        } catch (err) {
        // ignore
        }
        // Create a lightweight drag image clone so user sees a preview
        if (elRef.current && e.dataTransfer && e.dataTransfer.setDragImage) {
            const original = elRef.current;
            const clone = original.cloneNode(true);
            const rect = original.getBoundingClientRect();
            // Recursively copy computed styles from original to clone so display:flex/grid
            // and child element styles are preserved in the preview.
            const copyComputedStylesRecursive = (src, dest)=>{
                try {
                    const cs = window.getComputedStyle(src);
                    for(let i = 0; i < cs.length; i++){
                        const prop = cs[i];
                        dest.style.setProperty(prop, cs.getPropertyValue(prop), cs.getPropertyPriority(prop));
                    }
                } catch (err) {
                // ignore copying styles on older browsers
                }
                const srcChildren = src.children || [];
                const destChildren = dest.children || [];
                for(let i = 0; i < srcChildren.length && i < destChildren.length; i++)copyComputedStylesRecursive(srcChildren[i], destChildren[i]);
            };
            copyComputedStylesRecursive(original, clone);
            clone.style.position = 'absolute';
            clone.style.top = '-10000px';
            clone.style.left = '-10000px';
            // enforce size so width matches column width
            clone.style.width = `${rect.width}px`;
            clone.style.height = `${rect.height}px`;
            clone.style.margin = '0';
            clone.classList.add('alpaca-drag-clone');
            document.body.appendChild(clone);
            try {
                e.dataTransfer.setDragImage(clone, 10, 10);
            } catch (err) {
            // ignore
            }
            // remove the clone on next tick
            setTimeout(()=>{
                try {
                    document.body.removeChild(clone);
                } catch (err) {
                // ignore
                }
            }, 0);
        }
    };
    const handleDragEnd = ()=>{
        setIsDragging(false);
    };
    return /*#__PURE__*/ React.createElement("div", {
        ref: elRef,
        draggable: !isDragDisabled,
        role: "listitem",
        "aria-grabbed": isDragging,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        "data-index": index,
        "data-id": id,
        className: `${className} ${isDragging ? 'dragging' : ''}`,
        __source: {
            fileName: "src/components/DraggableItem.jsx",
            lineNumber: 137,
            columnNumber: 5
        },
        __self: this
    }, /*#__PURE__*/ React.createElement((0, _itemDefault.default), {
        id: id,
        content: content,
        assignees: assignees,
        commentCount: commentCount,
        meta: meta,
        className: "alpaca-item-inner",
        onClick: handleClick,
        __source: {
            fileName: "src/components/DraggableItem.jsx",
            lineNumber: 148,
            columnNumber: 7
        },
        __self: this
    }));
}
DraggableItem.propTypes = {
    id: (0, _propTypesDefault.default).number.isRequired,
    index: (0, _propTypesDefault.default).number.isRequired,
    containerId: (0, _propTypesDefault.default).oneOfType([
        (0, _propTypesDefault.default).number,
        (0, _propTypesDefault.default).string
    ]),
    content: (0, _propTypesDefault.default).string.isRequired,
    className: (0, _propTypesDefault.default).string,
    isDragDisabled: (0, _propTypesDefault.default).bool,
    onClick: (0, _propTypesDefault.default).func,
    assignees: (0, _propTypesDefault.default).array,
    commentCount: (0, _propTypesDefault.default).number,
    meta: (0, _propTypesDefault.default).object
};
exports.default = DraggableItem;

},{"prop-types":"7wKI2","./Item":"2yEr4","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"2yEr4":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _propTypes = require("prop-types");
var _propTypesDefault = parcelHelpers.interopDefault(_propTypes);
var _watchlistContext = require("../context/WatchlistContext");
var _user = require("./User");
var _userDefault = parcelHelpers.interopDefault(_user);
var _commentIcon = require("./icons/CommentIcon");
var _commentIconDefault = parcelHelpers.interopDefault(_commentIcon);
var _calendarIcon = require("./icons/CalendarIcon");
var _calendarIconDefault = parcelHelpers.interopDefault(_calendarIcon);
const { forwardRef } = wp.element;
const { Card, CardBody, CardFooter } = wp.components;
const { Text = wp.components.__experimentalText } = wp.components;
/**
 * Item component displayed in board containers.
 *
 * @param {Object}   root0              - Props object
 * @param {number}   root0.id           - Item ID
 * @param {string}   root0.content      - Item content text
 * @param {Array}    root0.assignees    - Array of assignees
 * @param {number}   root0.commentCount - Number of comments
 * @param {Object}   root0.meta         - Metadata object
 * @param {string}   root0.className    - CSS class name
 * @param {Object}   root0.style        - Inline styles
 * @param {Function} root0.onClick      - Click handler
 * @param {Object}   root0.props        - Additional props
 * @param {Object}   ref                - Forwarded ref
 * @return {JSX.Element} Item component
 */ const Item = forwardRef(({ id, content, assignees = [], commentCount, meta, className, style, onClick, ...props }, ref)=>{
    const { isWatched, toggleWatch } = (0, _watchlistContext.useWatchlist)();
    const watched = isWatched(id);
    const assigneeDataAttributes = assignees.reduce((acc, assignee)=>{
        if (assignee && assignee.id) acc[`data-assignee-${assignee.id}`] = '';
        return acc;
    }, {});
    const watchedClass = watched ? 'is-watched item-highlight' : '';
    const deadline = meta && meta.deadline && meta.deadline[0] ? new Date(meta.deadline[0]) : null;
    const isValidDeadline = deadline && !isNaN(deadline);
    const deadlineFormatted = new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric'
    }).format(deadline);
    let diffDays = null;
    if (isValidDeadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadline.setHours(0, 0, 0, 0);
        diffDays = Math.ceil((deadline - today) / 86400000);
    }
    const lateClass = diffDays < 0 ? 'is-late' : '';
    // Format deadline display text
    let deadlineText = deadlineFormatted;
    if (isValidDeadline) {
        if (diffDays === 1) deadlineText = 'Tomorrow';
        else if (diffDays === 0) deadlineText = 'Today';
        else if (diffDays === -1) deadlineText = 'Yesterday';
    }
    return(// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    /*#__PURE__*/ React.createElement(Card, {
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
            lineNumber: 88,
            columnNumber: 7
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(CardBody, {
        size: "xSmall",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 98,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-upper",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 99,
            columnNumber: 11
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-content",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 100,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement(Text, {
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 101,
            columnNumber: 15
        },
        __self: undefined
    }, content)), /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-controls",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 103,
            columnNumber: 13
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "dashicons dashicons-star-filled",
        onClick: (e)=>{
            e.stopPropagation();
            toggleWatch(id);
        },
        role: "button",
        tabIndex: 0,
        onKeyDown: (e)=>{
            if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                toggleWatch(id);
            }
        },
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 104,
            columnNumber: 15
        },
        __self: undefined
    })))), /*#__PURE__*/ React.createElement(CardFooter, {
        size: "xSmall",
        isBorderless: true,
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 122,
            columnNumber: 9
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-datapoints flexalign",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 123,
            columnNumber: 11
        },
        __self: undefined
    }, assignees.length > 0 && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-assignees",
        "data-assignees": assignees.length,
        title: assignees.length === 1 ? assignees[0].displayName || assignees[0].name : assignees.map((a)=>a.displayName || a.name).join(', '),
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 125,
            columnNumber: 15
        },
        __self: undefined
    }, assignees.map((assignee)=>/*#__PURE__*/ React.createElement((0, _userDefault.default), {
            key: assignee.id,
            user: assignee,
            __source: {
                fileName: "src/components/Item.jsx",
                lineNumber: 135,
                columnNumber: 19
            },
            __self: undefined
        }))), typeof commentCount !== 'undefined' && commentCount > 0 && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-icon alpaca-item-comment-count",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 141,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _commentIconDefault.default), {
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 142,
            columnNumber: 17
        },
        __self: undefined
    }), commentCount), wp.hooks.applyFilters('alpaca.item.datapoints', null, {
        id,
        meta
    }), isValidDeadline && /*#__PURE__*/ React.createElement("div", {
        className: "alpaca-item-icon alpaca-item-deadline",
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 153,
            columnNumber: 15
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement((0, _calendarIconDefault.default), {
        __source: {
            fileName: "src/components/Item.jsx",
            lineNumber: 154,
            columnNumber: 17
        },
        __self: undefined
    }), deadlineText)))));
});
Item.propTypes = {
    id: (0, _propTypesDefault.default).number.isRequired,
    content: (0, _propTypesDefault.default).string.isRequired,
    assignees: (0, _propTypesDefault.default).arrayOf((0, _propTypesDefault.default).object),
    commentCount: (0, _propTypesDefault.default).number,
    meta: (0, _propTypesDefault.default).object,
    className: (0, _propTypesDefault.default).string,
    style: (0, _propTypesDefault.default).object,
    onClick: (0, _propTypesDefault.default).func
};
exports.default = Item;

},{"prop-types":"7wKI2","../context/WatchlistContext":"WrED9","./User":"enwL1","./icons/CommentIcon":"koklv","./icons/CalendarIcon":"8WFEL","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"koklv":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const CommentIcon = (props)=>/*#__PURE__*/ React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        height: "16px",
        viewBox: "0 -960 960 960",
        width: "16px",
        fill: "#999",
        ...props,
        __source: {
            fileName: "src/components/icons/CommentIcon.jsx",
            lineNumber: 2,
            columnNumber: 3
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("path", {
        d: "M880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z",
        __source: {
            fileName: "src/components/icons/CommentIcon.jsx",
            lineNumber: 10,
            columnNumber: 5
        },
        __self: undefined
    }));
exports.default = CommentIcon;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"8WFEL":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const CalendarIcon = (props)=>/*#__PURE__*/ React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        height: "16px",
        viewBox: "0 -960 960 960",
        width: "16px",
        fill: "currentColor",
        ...props,
        __source: {
            fileName: "src/components/icons/CalendarIcon.jsx",
            lineNumber: 2,
            columnNumber: 3
        },
        __self: undefined
    }, /*#__PURE__*/ React.createElement("path", {
        d: "M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z",
        __source: {
            fileName: "src/components/icons/CalendarIcon.jsx",
            lineNumber: 10,
            columnNumber: 5
        },
        __self: undefined
    }));
exports.default = CalendarIcon;

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
                    authorName: issue.author_name,
                    authorImg: issue.author_img,
                    assignees: issue.assignees || [],
                    commentCount: issue.comment_count ?? 0,
                    meta: issue.meta || {}
                }))
        }));
};
/**
 * Save board order in DOM order, including container IDs & titles.
 */ const saveBoardOrder = ()=>{
    const containersInDomOrder = document.querySelectorAll('.alpaca-container');
    const data = Array.from(containersInDomOrder).map((containerEl)=>{
        const id = parseInt(containerEl.dataset.id, 10);
        const title = containerEl.querySelector('h2').textContent.trim();
        // Select all items except for the empty placeholder.
        const items = containerEl.querySelectorAll('.alpaca-item:not(.empty)');
        return {
            id,
            title,
            issues: Array.from(items).map((itemEl)=>parseInt(itemEl.dataset.id, 10))
        };
    });
    // Use wp.apiFetch to send data to the REST API endpoint.
    // It automatically handles nonces for authenticated requests.
    wp.apiFetch({
        path: '/alpaca/v1/board',
        method: 'POST',
        data
    }).then((_res)=>{
    // saved successfully
    }).catch((err)=>{
        console.error('Error saving board order:', err);
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
            displayName: user.display_name || user.name,
            slug: user.slug,
            avatar: user.avatar_urls?.['96'] || user.avatar_urls?.['48'] || user.avatar_urls?.['24'] || ''
        }));
};

},{"./issueApi":"bebt9","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}]},["9iTdJ","d8Dch"], "d8Dch", "parcelRequire55a0", {})

//# sourceMappingURL=index.js.map
