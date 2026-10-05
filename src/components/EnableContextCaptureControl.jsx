import InlineCheckboxLabel from './settings/InlineCheckboxLabel.jsx';
import { useCheckboxSetting } from './settings/useCheckboxSetting.js';
const { __ } = wp.i18n;
const { CheckboxControl } = wp.components;

const EnableContextCaptureControl = () => {
  const { isEnabled, isFetching, isSaving, handleChange } = useCheckboxSetting({
    settingKey: 'alpaistr_enable_context_capture',
    defaultValue: true,
  });

  return (
    <tr className="alpaca-context-capture-setting">
      <th>{__('Front-End Issue Capture', 'alpaca-issue-tracker')}</th>
      <td>
        <CheckboxControl
          __nextHasNoMarginBottom
          label={
            <InlineCheckboxLabel
              label={__(
                'Enable the front-end controls for reporting issues with associated context',
                'alpaca-issue-tracker',
              )}
              isBusy={isFetching || isSaving}
            />
          }
          help={__(
            'Uncheck this option to use Alpaca as a back-end kanban board',
            'alpaca-issue-tracker',
          )}
          checked={isEnabled}
          onChange={handleChange}
          disabled={isFetching || isSaving}
        />
      </td>
    </tr>
  );
};

export default EnableContextCaptureControl;
