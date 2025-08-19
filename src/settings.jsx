import StatusManager from "./components/StatusManager";

const AlpacaSettings = () => {
  return (
    <>
      <h2>Status Management</h2>
      <p>
        Define the statuses (columns) for your project board. Drag and drop to
        reorder.
      </p>
      <StatusManager />
    </>
  );
};

export default AlpacaSettings;
