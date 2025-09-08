const { useState, useEffect } = wp.element;

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
        onError('Clipboard API not supported.');
      }
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      if (onSuccess) {
        onSuccess();
      }
    }).catch(err => {
      if (onError) {
        onError(err);
      }
    });
  };

  return { isClipboardSupported, copyToClipboard };
};
