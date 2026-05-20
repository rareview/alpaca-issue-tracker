import InlineCheckboxLabel from './settings/InlineCheckboxLabel.jsx';
import { useCheckboxSetting } from './settings/useCheckboxSetting.js';
const { __ } = wp.i18n;
const { CheckboxControl } = wp.components;

const EnableTestLogsControl = () => {
  const { isEnabled, isFetching, isSaving, handleChange } = useCheckboxSetting({
    settingKey: 'alpaca_enable_test_logs',
    defaultValue: false,
    onSave: (value) => {
      wp.hooks.doAction('alpaca.enableTestLogsChanged', value);
    },
  });

  return (
    <tr>
      <th>{__('Debugging', 'alpaca-issue-tracker')}</th>
      <td>
        <CheckboxControl
          __nextHasNoMarginBottom
          label={
            <InlineCheckboxLabel
              label={__('Enable Browser Console Messages', 'alpaca-issue-tracker')}
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

export default EnableTestLogsControl;
