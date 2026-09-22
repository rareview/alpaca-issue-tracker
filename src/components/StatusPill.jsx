const { memo } = wp.element;

const StatusPill = memo(({ children, className = '' }) => (
  <span className={`alpaca-search-status-pill ${className}`.trim()}>
    {children}
  </span>
));

export default StatusPill;
