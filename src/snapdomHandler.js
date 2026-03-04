const isImageInViewport = (image) => {
  const rect = image.getBoundingClientRect();

  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= window.innerHeight &&
    rect.left <= window.innerWidth
  );
};

const prepareResponsiveSourcesForCapture = () => {
  const imageSnapshots = [];
  const sourceSnapshots = [];
  const handledPictureElements = new Set();
  const visibleImages = Array.from(document.querySelectorAll('img')).filter(
    isImageInViewport,
  );

  visibleImages.forEach((image) => {
    imageSnapshots.push({
      image,
      src: image.getAttribute('src'),
      srcset: image.getAttribute('srcset'),
      sizes: image.getAttribute('sizes'),
    });

    if (image.currentSrc && image.currentSrc !== image.src) {
      image.setAttribute('src', image.currentSrc);
    }

    image.removeAttribute('srcset');
    image.removeAttribute('sizes');

    const picture = image.closest('picture');

    if (!picture || handledPictureElements.has(picture)) {
      return;
    }

    handledPictureElements.add(picture);

    Array.from(picture.querySelectorAll('source')).forEach((sourceElement) => {
      sourceSnapshots.push({
        sourceElement,
        src: sourceElement.getAttribute('src'),
        srcset: sourceElement.getAttribute('srcset'),
        sizes: sourceElement.getAttribute('sizes'),
      });

      sourceElement.removeAttribute('src');
      sourceElement.removeAttribute('srcset');
      sourceElement.removeAttribute('sizes');
    });
  });

  return () => {
    imageSnapshots.forEach((snapshot) => {
      const { image, src, srcset, sizes } = snapshot;

      if (src === null) {
        image.removeAttribute('src');
      } else {
        image.setAttribute('src', src);
      }

      if (srcset === null) {
        image.removeAttribute('srcset');
      } else {
        image.setAttribute('srcset', srcset);
      }

      if (sizes === null) {
        image.removeAttribute('sizes');
      } else {
        image.setAttribute('sizes', sizes);
      }
    });

    sourceSnapshots.forEach((snapshot) => {
      const { sourceElement, src, srcset, sizes } = snapshot;

      if (src === null) {
        sourceElement.removeAttribute('src');
      } else {
        sourceElement.setAttribute('src', src);
      }

      if (srcset === null) {
        sourceElement.removeAttribute('srcset');
      } else {
        sourceElement.setAttribute('srcset', srcset);
      }

      if (sizes === null) {
        sourceElement.removeAttribute('sizes');
      } else {
        sourceElement.setAttribute('sizes', sizes);
      }
    });
  };
};

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

  const restoreResponsiveSources = prepareResponsiveSourcesForCapture();

  let canvas;

  try {
    canvas = await snapdom.toCanvas(document.body, {
      type: 'webp',
      embedFonts: true,
      ignoreErrors: true,
      skipAutoScale: false,
    });
  } finally {
    restoreResponsiveSources();
  }

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

  return croppedCanvas.toDataURL('image/webp', 0.5);
};

export default handleSnapdomCapture;
