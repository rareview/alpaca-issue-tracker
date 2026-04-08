import PropTypes from 'prop-types';

/**
 * Shared SVG wrapper for Alpaca icons.
 *
 * @param {Object}   root0           Component props.
 * @param {JSX.Node} root0.children  Icon SVG paths or shapes.
 * @param {number}   [root0.size=16] Width and height in pixels.
 * @param {string}   [root0.viewBox] SVG viewBox.
 * @return {JSX.Element} Icon SVG markup.
 */
const BaseIcon = ({
  children,
  size = 16,
  viewBox = '0 0 16 16',
  ...svgProps
}) => {
  const isDecorative =
    !svgProps['aria-label'] &&
    !svgProps['aria-labelledby'] &&
    svgProps.role !== 'img';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      viewBox={viewBox}
      {...(isDecorative ? { 'aria-hidden': 'true', focusable: 'false' } : {})}
      {...svgProps}
    >
      {children}
    </svg>
  );
};

BaseIcon.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.number,
  viewBox: PropTypes.string,
};

export default BaseIcon;
