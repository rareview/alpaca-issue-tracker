const { TextControl, Button } = wp.components;

const AlpacaSettings = () => {
  return (
    <>
      <TextControl
        label="Example Setting"
        value="Default Value"
        help="Just proving we can have settings here"
      />
      <Button isPrimary onClick={() => alert("Settings saved!")}>
        Save Settings
      </Button>
    </>
  );
};

export default AlpacaSettings;
