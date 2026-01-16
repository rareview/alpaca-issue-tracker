const { useState, useEffect } = wp.element;
const { __ } = wp.i18n;

export const useClipboard = () => {
  const [isClipboardSupported, setIsClipboardSupported] = useState(false);

  useEffect(() => {
    // The navigator object is only available in the browser.
    // We check for it to prevent errors during server-side rendering.
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      setIsClipboardSupported(true);
    }
  }, []);

  const copyToClipboard = (text, onSuccess, onError) => {
    if (!isClipboardSupported) {
      if (onError) {
        onError(__('Clipboard API not supported.', 'alpaca'));
      }
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (onSuccess) {
          onSuccess();
        }
      })
      .catch((err) => {
        if (onError) {
          onError(err);
        }
      });
  };

  return { isClipboardSupported, copyToClipboard };
};
