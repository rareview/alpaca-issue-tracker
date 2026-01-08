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

  const canvas = await snapdom.toCanvas(document.body, {
    type: 'webp',
    embedFonts: true,
    ignoreErrors: true,
    skipAutoScale: false,
  });

  // Calculate the visible area based on scroll position and viewport size
  const dpr = window.devicePixelRatio || 1;
  const x = window.scrollX * dpr;
  const y = window.scrollY * dpr;
  const width = window.innerWidth * dpr;
  const height = window.innerHeight * dpr;

  // Create a new canvas to hold the cropped image
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = width;
  croppedCanvas.height = height;
  const ctx = croppedCanvas.getContext('2d');
  ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

  const base64String = croppedCanvas.toDataURL('image/webp', 0.5);

  return base64String;
};

export default handleSnapdomCapture;
