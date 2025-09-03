const DragHandleIcon = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: "middle" }}
    {...props}
  >
    <circle cx="4" cy="3" r="1.5" />
    <circle cx="8" cy="3" r="1.5" />
    <circle cx="4" cy="8" r="1.5" />
    <circle cx="8" cy="8" r="1.5" />
    <circle cx="4" cy="13" r="1.5" />
    <circle cx="8" cy="13" r="1.5" />
  </svg>
);

export default DragHandleIcon;
