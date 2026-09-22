/**
 * Normalize an item control into a descriptor object.
 *
 * The `alpaca.item.controls` filter supports either a renderable element or an
 * object descriptor with these properties:
 *
 * - `element`: Renderable control element.
 * - `isActive`: Whether the control should be treated as active before hover.
 * - `isReady`: Whether the control is ready to render at all.
 * - `key`: Stable key used for subscription tracking.
 * - `subscribe`: Optional function that accepts a notify callback and returns
 *   an unsubscribe function.
 *
 * @param {*}      control Raw control value from the filter.
 * @param {number} index   Fallback index for key generation.
 * @return {?Object} Normalized control descriptor.
 */
export const normalizeItemControl = (control, index) => {
  if (!control) {
    return null;
  }

  const isDescriptor =
    typeof control === 'object' && control !== null && 'element' in control;
  const element = isDescriptor ? control.element : control;

  if (!element) {
    return null;
  }

  const elementIsActive = Boolean(
    element && element.props && element.props['data-active'] === '1',
  );

  return {
    element,
    isActive: isDescriptor ? Boolean(control.isActive) : elementIsActive,
    isReady: isDescriptor ? control.isReady !== false : true,
    key:
      (isDescriptor && control.key) ||
      (element && element.key) ||
      `alpaca-item-control-${index}`,
    subscribe:
      isDescriptor && typeof control.subscribe === 'function'
        ? control.subscribe
        : null,
  };
};

/**
 * Normalize a list of raw item controls.
 *
 * @param {Array} controls Raw controls from the hook chain.
 * @return {Array<Object>} Normalized control descriptors.
 */
export const getNormalizedItemControls = (controls) =>
  (Array.isArray(controls) ? controls : [])
    .map((control, index) => normalizeItemControl(control, index))
    .filter(Boolean);

/**
 * Build the effect dependency signature for control subscriptions.
 *
 * @param {Array<Object>} controls Normalized control descriptors.
 * @return {string} Subscription signature.
 */
export const getControlSubscriptionSignature = (controls) =>
  controls
    .map((control) =>
      [
        control.key,
        control.isActive ? '1' : '0',
        control.isReady ? '1' : '0',
        control.subscribe ? '1' : '0',
      ].join(':'),
    )
    .join('|');

/**
 * Sort ready controls and materialize render elements with stable keys.
 *
 * @param {Array<Object>} controls            Normalized control descriptors.
 * @param {Function}      cloneControlElement Clone callback that applies a key.
 * @return {Array} Renderable item controls.
 */
export const getRenderableItemControls = (controls, cloneControlElement) =>
  controls
    .filter((control) => control.isReady)
    .slice()
    .sort((a, b) => {
      if (a.isActive === b.isActive) {
        return 0;
      }

      return a.isActive ? -1 : 1;
    })
    .map((control) => cloneControlElement(control.element, control.key));
