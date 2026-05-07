import InlineCheckboxLabel from './settings/InlineCheckboxLabel.jsx';
import { useCheckboxSetting } from './settings/useCheckboxSetting.js';
const { __ } = wp.i18n;
const { CheckboxControl } = wp.components;

const EnableContextCaptureControl = () => {
  const { isEnabled, isFetching, isSaving, handleChange } = useCheckboxSetting({
    settingKey: 'alpaca_enable_context_capture',
    defaultValue: true,
  });

  return (
    <tr>
      <th>{__('Context Capture', 'alpaca')}</th>
      <td>
        <CheckboxControl
          __nextHasNoMarginBottom
          label={
            <InlineCheckboxLabel
              label={__(
                'Enable reporting of issues with associated context',
                'alpaca',
              )}
              isBusy={isFetching || isSaving}
            />
          }
          checked={isEnabled}
          onChange={handleChange}
          disabled={isFetching || isSaving}
        />
      </td>
    </tr>
  );
};

export default EnableContextCaptureControl;
