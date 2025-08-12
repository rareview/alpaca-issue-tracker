const { TextControl, Button } = wp.components;

const AlpacaSettings = () => {
  return (
    <>
      <p>Time for dndkit</p>
      <Button isPrimary onClick={() => alert("Settings saved!")}>
        Save Settings
      </Button>
    </>
  );
};

export default AlpacaSettings;
