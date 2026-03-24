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
  const excludedElements = [];

  /**
   * Exclude matching elements from SnapDOM capture and restore their prior state.
   *
   * @param {string} selector CSS selector for the element to exclude.
   * @return {void}
   */
  function hide_from_snapdom(selector) {
    const el = document.querySelector(selector);
    if (!el) {
      return;
    }

    excludedElements.push({
      element: el,
      previousCapture: el.getAttribute('data-capture'),
    });
    el.dataset.capture = 'exclude';
  }

  hide_from_snapdom('#wpadminbar');
  hide_from_snapdom('.components-modal__screen-overlay');
  hide_from_snapdom('#alpaca-toolbar-mount');
  hide_from_snapdom('#query-monitor-main');
  hide_from_snapdom('#query-monitor-ceased');

  let restoreResponsiveSources = () => {};

  try {
    restoreResponsiveSources = prepareResponsiveSourcesForCapture();

    const snapdomOptions = {
      type: 'webp',
      embedFonts: true,
      ignoreErrors: true,
      skipAutoScale: false,
      fallbackURL: null,
    };

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

    return croppedCanvas.toDataURL('image/webp', 0.5);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SnapDOM] capture failed:', err);
    return '';
  } finally {
    restoreResponsiveSources();
    excludedElements.forEach(({ element, previousCapture }) => {
      if (previousCapture === null) {
        element.removeAttribute('data-capture');
      } else {
        element.setAttribute('data-capture', previousCapture);
      }
    });
  }
};

export default handleSnapdomCapture;
