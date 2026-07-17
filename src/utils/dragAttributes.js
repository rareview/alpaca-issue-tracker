/**
 * Serialize useful attributes and classes from an element so they can be
 * re-applied to a preview/clone created elsewhere (eg. drag placeholder).
 *
 * We intentionally only capture classList and attributes that are safe to
 * reapply (data-*, aria-*, role, title). Avoid serializing event handlers
 * or complex objects.
 *
 * @param {Element} el DOM element to serialize.
 * @return {Object} Descriptor with `classes` and `attributes`.
 */
export function serializeElementAttributes(el) {
  if (!el || !(el instanceof Element)) return { classes: [], attributes: {} };

  const classes = Array.from(el.classList || []);

  const allowedAttrs = {};
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    const name = attr.name;
    const value = attr.value;

    // Only include data-*, aria-*, role, and title attributes
    if (
      name.startsWith('data-') ||
      name.startsWith('aria-') ||
      name === 'role' ||
      name === 'title'
    ) {
      allowedAttrs[name] = value;
    }
  }

  return {
    classes,
    attributes: allowedAttrs,
  };
}

/**
 * Combine descriptor classes with base classes and return a space-separated
 * class string suitable for `className`.
 *
 * @param {Object|null}   descriptor  Descriptor returned from `serializeElementAttributes`.
 * @param {Array<string>} baseClasses Array of base class names.
 * @return {string}       Combined class string.
 */
export function classesFromDescriptor(descriptor, baseClasses = []) {
  const descriptorClasses =
    descriptor && Array.isArray(descriptor.classes) ? descriptor.classes : [];
  return baseClasses.concat(descriptorClasses).filter(Boolean).join(' ');
}

/**
 * Return attributes object from descriptor (safe attributes only).
 * This can be spread into a JSX element as props.
 *
 * @param {Object|null} descriptor Descriptor from `serializeElementAttributes`.
 * @return {Object}      Attributes map.
 */
export function attrsFromDescriptor(descriptor) {
  return (descriptor && descriptor.attributes) || {};
}
