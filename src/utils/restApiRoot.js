const DEFAULT_REST_ROOT = '/wp-json/';
let alpacaApiRootMiddlewareInstalled = false;

const ensureTrailingSlash = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return DEFAULT_REST_ROOT;
  }

  return normalized.endsWith('/') ? normalized : `${normalized}/`;
};

const parseUrl = (value, base) => {
  try {
    return new URL(value, base);
  } catch (error) {
    return null;
  }
};

const getConfiguredRestRoot = () => {
  if (typeof wpApiSettings !== 'undefined' && wpApiSettings?.root) {
    return wpApiSettings.root;
  }

  return DEFAULT_REST_ROOT;
};

const hasExplicitRestRoot = () =>
  Boolean(
    typeof wpApiSettings !== 'undefined' &&
      wpApiSettings?.alpacaHasCustomRoot === true,
  );

const maybeAlignWithCurrentOrigin = (root) => {
  if (typeof window === 'undefined' || hasExplicitRestRoot()) {
    return root;
  }

  const rootUrl = parseUrl(root, window.location.origin);
  if (!rootUrl) {
    return root;
  }

  if (
    rootUrl.hostname &&
    window.location.hostname &&
    rootUrl.hostname.toLowerCase() === window.location.hostname.toLowerCase() &&
    rootUrl.origin !== window.location.origin
  ) {
    const aligned = new URL(
      `${rootUrl.pathname}${rootUrl.search}${rootUrl.hash}`,
      window.location.origin,
    );
    return aligned.toString();
  }

  return root;
};

const applyRootFilter = (root, context) => {
  if (typeof wp === 'undefined' || !wp.hooks?.applyFilters) {
    return root;
  }

  return wp.hooks.applyFilters('alpaca.api.root', root, context);
};

export const getAlpacaRestRoot = () => {
  const configuredRoot = ensureTrailingSlash(getConfiguredRestRoot());
  const correctedRoot = ensureTrailingSlash(
    maybeAlignWithCurrentOrigin(configuredRoot),
  );

  return ensureTrailingSlash(
    applyRootFilter(correctedRoot, {
      configuredRoot,
      hasCustomRoot: hasExplicitRestRoot(),
      currentOrigin:
        typeof window !== 'undefined' ? window.location.origin : null,
    }),
  );
};

export const buildAlpacaRestUrl = (path = '') => {
  const relativePath = String(path || '').replace(/^\/+/, '');
  const root = getAlpacaRestRoot();

  try {
    return new URL(relativePath, root).toString();
  } catch (error) {
    return `${root}${relativePath}`;
  }
};

const maybeRebaseRequestUrl = (url, targetRoot) => {
  if (typeof window === 'undefined' || hasExplicitRestRoot()) {
    return url;
  }

  const parsedRequestUrl = parseUrl(url, window.location.origin);
  const parsedTargetRoot = parseUrl(targetRoot, window.location.origin);
  if (!parsedRequestUrl || !parsedTargetRoot) {
    return url;
  }

  if (
    parsedRequestUrl.hostname.toLowerCase() !==
    parsedTargetRoot.hostname.toLowerCase()
  ) {
    return parsedRequestUrl.toString();
  }

  if (parsedRequestUrl.origin === parsedTargetRoot.origin) {
    return parsedRequestUrl.toString();
  }

  const jsonRootMarker = '/wp-json/';
  const requestPath = parsedRequestUrl.pathname || '/';
  const markerIndex = requestPath.indexOf(jsonRootMarker);
  const relativePath =
    markerIndex >= 0
      ? requestPath.slice(markerIndex + jsonRootMarker.length)
      : requestPath.replace(/^\/+/, '');

  return new URL(
    `${relativePath}${parsedRequestUrl.search}${parsedRequestUrl.hash}`,
    parsedTargetRoot.toString(),
  ).toString();
};

export const installAlpacaApiRootMiddleware = () => {
  if (alpacaApiRootMiddlewareInstalled) {
    return;
  }

  if (
    typeof wp === 'undefined' ||
    !wp.apiFetch ||
    typeof wp.apiFetch.use !== 'function'
  ) {
    return;
  }

  wp.apiFetch.use((options, next) => {
    const request =
      options && typeof options === 'object' ? { ...options } : options;
    const root = getAlpacaRestRoot();

    if (
      typeof wpApiSettings !== 'undefined' &&
      wpApiSettings &&
      wpApiSettings.root !== root
    ) {
      wpApiSettings.root = root;
    }

    if (request && typeof request === 'object') {
      if (typeof request.path === 'string' && request.path) {
        request.url = buildAlpacaRestUrl(request.path);
        delete request.path;
      } else if (typeof request.url === 'string' && request.url) {
        request.url = maybeRebaseRequestUrl(request.url, root);
      }
    }

    return next(request);
  });

  alpacaApiRootMiddlewareInstalled = true;
};
