const handleSnapdomCapture = async () => {
  function hide_from_snapdom(selector) {
    const el = document.querySelector(selector);
    if (el) {
      el.dataset.capture = 'exclude';
    }
  }
  hide_from_snapdom('#wpadminbar');
  hide_from_snapdom('.components-modal__screen-overlay');

  // https://github.com/zumerlab/snapdom
  const canvas = await snapdom.toCanvas(document.body, {
    type: 'webp',
    embedFonts: true,
    ignoreErrors: true,
    skipAutoScale: false,
  });

  // Calculate the visible area based on scroll position and viewport size
  const x = window.scrollX;
  const y = window.scrollY;
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Create a new canvas to hold the cropped image
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = width;
  croppedCanvas.height = height;
  const ctx = croppedCanvas.getContext('2d');

  // Draw the relevant portion of the original canvas onto the new canvas
  // ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
  // might want to exclude admin bar's 32px?
  ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

  // Get the Base64-encoded string from the canvas
  const base64String = croppedCanvas.toDataURL('image/webp', 0.5); // Set compression level
  // console.log(base64String);

  return base64String;
};

export default handleSnapdomCapture;
