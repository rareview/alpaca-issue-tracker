/**
 * Custom Prism language definition for key-value pairs.
 * Registers a 'keyvalue' language for syntax highlighting cookie strings,
 * query parameters, and other key=value; formatted data.
 */

/**
 * Register the keyvalue language with Prism.
 * Should be called once when the module loads, before any highlighting occurs.
 */
export function registerKeyValueLanguage() {
  if (typeof window === 'undefined' || !window.Prism) {
    return false;
  }

  // Check if already registered
  if (window.Prism.languages.keyvalue) {
    return true;
  }

  // Register custom key=value language
  window.Prism.languages.keyvalue = {
    pair: {
      pattern: /(?:[^;=]+=[^;]*;)/g,
      inside: {
        key: { pattern: /^[^=]+/, alias: 'property' },
        operator: { pattern: /=/, alias: 'operator' },
        value: {
          pattern: /=.*(?=;$)/,
          lookbehind: true,
          alias: 'string',
        },
        separator: { pattern: /;$/, alias: 'punctuation' },
      },
    },
  };

  return true;
}

// Auto-register when module loads (if Prism is available)
if (typeof window !== 'undefined' && window.Prism) {
  registerKeyValueLanguage();
} else if (typeof window !== 'undefined') {
  // Wait for Prism to be available
  const checkPrism = setInterval(() => {
    if (window.Prism) {
      registerKeyValueLanguage();
      clearInterval(checkPrism);
    }
  }, 10);

  setTimeout(() => clearInterval(checkPrism), 5000);
}

export default registerKeyValueLanguage;
