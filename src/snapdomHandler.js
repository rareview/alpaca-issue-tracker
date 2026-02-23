const handleSnapdomCapture = async () => {
  function hide_from_snapdom(selector) {
    const el = document.querySelector(selector);
    if (el) {
      el.dataset.capture = 'exclude';
    }
  }

  hide_from_snapdom('#wpadminbar');
  hide_from_snapdom('.components-modal__screen-overlay');
  hide_from_snapdom('#alpaca-toolbar-mount');

  const snapdomOptions = {
    type: 'webp',
    embedFonts: true,
    ignoreErrors: true,
    skipAutoScale: false,
    fallbackURL: null,
  };

  try {
    if (
      typeof window !== 'undefined' &&
      window.alpacaSettings &&
      window.alpacaSettings.snapdomProxy
    ) {
      // SnapDOM expects useProxy to be the proxy URL string (not boolean).
      snapdomOptions.useProxy = window.alpacaSettings.snapdomProxy;
    }

    const canvas = await snapdom.toCanvas(document.body, snapdomOptions);

    const dpr = window.devicePixelRatio || 1;
    const x = window.scrollX * dpr;
    const y = window.scrollY * dpr;
    const width = window.innerWidth * dpr;
    const height = window.innerHeight * dpr;

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const ctx = croppedCanvas.getContext('2d');
    ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

    const base64String = croppedCanvas.toDataURL('image/webp', 0.5);
    return base64String;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SnapDOM] capture failed:', err);
    return '';
  }
};

export default handleSnapdomCapture;
