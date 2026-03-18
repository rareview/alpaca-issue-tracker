import { datapointRegistrations } from '../datapoints';

const DATAPOINT_VISIBILITY_OPTION_KEY = 'alpaca_item_datapoint_visibility';

const registeredDatapoints = [];
const registeredDatapointsBySlug = {};
let visibilityRequest = null;

/**
 * Normalize datapoint visibility values from settings payloads.
 *
 * @param {Object|null|undefined} maybeVisibility Candidate visibility map.
 * @return {Object} Normalized visibility map keyed by datapoint slug.
 */
const normalizeVisibilityMap = (maybeVisibility) => {
  const normalized = {};

  if (!maybeVisibility || typeof maybeVisibility !== 'object') {
    return normalized;
  }

  Object.entries(maybeVisibility).forEach(([slug, value]) => {
    if (typeof slug !== 'string' || slug.trim() === '') {
      return;
    }

    if (value === true || value === 1 || value === '1') {
      normalized[slug] = true;
      return;
    }

    normalized[slug] = false;
  });

  return normalized;
};

/**
 * Read bootstrapped visibility from localized settings when available.
 *
 * @return {Object} Normalized visibility map keyed by datapoint slug.
 */
const getBootstrappedDatapointVisibility = () => {
  if (
    typeof window === 'undefined' ||
    !window.alpacaSettings ||
    typeof window.alpacaSettings !== 'object'
  ) {
    return {};
  }

  return normalizeVisibilityMap(window.alpacaSettings.itemDatapointVisibility);
};

let datapointVisibility = getBootstrappedDatapointVisibility();

/**
 * Check whether a datapoint should be rendered.
 *
 * @param {string}  slug           Datapoint slug.
 * @param {boolean} defaultEnabled Whether the datapoint is enabled by default.
 * @return {boolean} True when datapoint should be rendered.
 */
const isDatapointEnabled = (slug, defaultEnabled) => {
  if (Object.prototype.hasOwnProperty.call(datapointVisibility, slug)) {
    return Boolean(datapointVisibility[slug]);
  }

  return defaultEnabled;
};

/**
 * Get a snapshot of datapoint visibility settings.
 *
 * @return {Object} Visibility map keyed by datapoint slug.
 */
export const getItemDatapointVisibility = () => {
  return { ...datapointVisibility };
};

/**
 * Notify listeners that visibility settings changed.
 *
 * @return {void}
 */
const notifyVisibilityChanged = () => {
  wp.hooks.doAction(
    'alpaca.item.datapoints.visibilityChanged',
    getItemDatapointVisibility(),
  );
};

/**
 * Fetch datapoint visibility settings from wp/v2/settings.
 *
 * @return {Promise<Object>} Resolved visibility map.
 */
export const fetchItemDatapointVisibility = () => {
  if (visibilityRequest) {
    return visibilityRequest;
  }

  visibilityRequest = wp
    .apiFetch({ path: '/wp/v2/settings' })
    .then((settings) => {
      const rawVisibility = settings?.[DATAPOINT_VISIBILITY_OPTION_KEY] || {};
      datapointVisibility = normalizeVisibilityMap(rawVisibility);
      notifyVisibilityChanged();

      return getItemDatapointVisibility();
    })
    .catch(() => {
      return getItemDatapointVisibility();
    })
    .finally(() => {
      visibilityRequest = null;
    });

  return visibilityRequest;
};

/**
 * Save datapoint visibility settings.
 *
 * @param {Object} nextVisibility Next visibility map keyed by datapoint slug.
 * @return {Promise<Object>} Resolved visibility map.
 */
export const saveItemDatapointVisibility = (nextVisibility) => {
  const normalized = normalizeVisibilityMap(nextVisibility);

  return wp
    .apiFetch({
      path: '/wp/v2/settings',
      method: 'POST',
      data: {
        [DATAPOINT_VISIBILITY_OPTION_KEY]: normalized,
      },
    })
    .then((settings) => {
      const rawVisibility = settings?.[DATAPOINT_VISIBILITY_OPTION_KEY] || {};
      datapointVisibility = normalizeVisibilityMap(rawVisibility);
      notifyVisibilityChanged();

      return getItemDatapointVisibility();
    });
};

/**
 * Get all datapoints currently registered for item rendering.
 *
 * @return {Array<Object>} Datapoint registration entries.
 */
export const getRegisteredItemDatapoints = () => {
  return registeredDatapoints.map((entry) => ({ ...entry }));
};

/**
 * Notify listeners that the datapoint registry changed.
 *
 * @return {void}
 */
const notifyRegistryChanged = () => {
  wp.hooks.doAction(
    'alpaca.item.datapoints.registryChanged',
    getRegisteredItemDatapoints(),
  );
};

/**
 * Register an item datapoint so it can render on cards and appear in settings.
 *
 * @param {Object}   registration                  Datapoint registration.
 * @param {string}   registration.slug             Unique datapoint slug.
 * @param {Function} registration.callback         Render callback for hook.
 * @param {string}   registration.label            Human-readable label.
 * @param {string}   [registration.description]    Optional description.
 * @param {string}   [registration.namespace]      Optional hook namespace.
 * @param {boolean}  [registration.defaultEnabled] Whether enabled by default.
 * @return {Object|null} Registered datapoint metadata.
 */
export const registerItemDatapoint = (registration) => {
  if (!registration || typeof registration !== 'object') {
    return null;
  }

  const slug =
    typeof registration.slug === 'string' ? registration.slug.trim() : '';

  if (slug === '') {
    return null;
  }

  if (registeredDatapointsBySlug[slug]) {
    return registeredDatapointsBySlug[slug];
  }

  if (typeof registration.callback !== 'function') {
    return null;
  }

  const namespace =
    typeof registration.namespace === 'string' &&
    registration.namespace.trim() !== ''
      ? registration.namespace.trim()
      : `alpaca/item/datapoint/${slug}`;
  const defaultEnabled = registration.defaultEnabled !== false;
  const label =
    typeof registration.label === 'string' && registration.label.trim() !== ''
      ? registration.label.trim()
      : slug;
  const description =
    typeof registration.description === 'string'
      ? registration.description
      : '';

  const wrappedCallback = (originalContent, itemProps) => {
    if (!isDatapointEnabled(slug, defaultEnabled)) {
      return originalContent;
    }

    return registration.callback(originalContent, itemProps);
  };

  wp.hooks.addFilter('alpaca.item.datapoints', namespace, wrappedCallback);

  const entry = {
    slug,
    label,
    description,
    namespace,
    defaultEnabled,
  };

  registeredDatapoints.push(entry);
  registeredDatapointsBySlug[slug] = entry;
  notifyRegistryChanged();

  return entry;
};

datapointRegistrations.forEach((registration) => {
  registerItemDatapoint(registration);
});

if (!window.alpaca) {
  window.alpaca = {};
}

if (!window.alpaca.itemDatapoints) {
  window.alpaca.itemDatapoints = {};
}

window.alpaca.itemDatapoints.register = registerItemDatapoint;
window.alpaca.itemDatapoints.getRegistered = getRegisteredItemDatapoints;
window.alpaca.itemDatapoints.getVisibility = getItemDatapointVisibility;
window.alpaca.itemDatapoints.fetchVisibility = fetchItemDatapointVisibility;
window.alpaca.itemDatapoints.saveVisibility = saveItemDatapointVisibility;

fetchItemDatapointVisibility();
