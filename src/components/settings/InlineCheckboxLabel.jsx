import PropTypes from 'prop-types';

const { Spinner } = wp.components;

const InlineCheckboxLabel = ({ label, isBusy }) => {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span>{label}</span>
      {isBusy && <Spinner />}
    </span>
  );
};

InlineCheckboxLabel.propTypes = {
  label: PropTypes.node.isRequired,
  isBusy: PropTypes.bool,
};

export default InlineCheckboxLabel;
