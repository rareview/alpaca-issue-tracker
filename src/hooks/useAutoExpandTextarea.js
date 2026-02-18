const { useEffect } = wp.element;

/**
 * Auto-expands a textarea element to fit its content.
 *
 * @param {Object}  ref     Ref object that points to a textarea element.
 * @param {string}  value   Current textarea value.
 * @param {boolean} enabled Whether auto-expansion is enabled.
 */
const useAutoExpandTextarea = (ref, value, enabled = true) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const textarea = ref?.current;

    if (!textarea || typeof textarea.style === 'undefined') {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    return () => {
      if (textarea && textarea.style) {
        textarea.style.height = '';
      }
    };
  }, [ref, value, enabled]);
};

export default useAutoExpandTextarea;
