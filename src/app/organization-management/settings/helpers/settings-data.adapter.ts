import { OrganizationSettingControlType } from '@shared/enums/organization-setting-control-type';
import { OrganizationSettingsDropDownOption, OrganizationSettingsGet, OrganizationSettingValueOptions } from '@shared/models/organization-settings.model';

export class SettingsDataAdapter {

  static adaptSettings(settings: OrganizationSettingsGet[]): OrganizationSettingsGet[] {
    /**
     * TODO: refactoring needed here. High cyclomatic complexity.
     */
    return settings.map((item) => {
      if (
        item.controlType === OrganizationSettingControlType.Select ||
        item.controlType === OrganizationSettingControlType.Multiselect
      ) {

        if (typeof item.value === 'string') {
          item.value = SettingsDataAdapter.getDropDownOptionsFromString(item.value, item.valueOptions);
        }

        if (item.children && item.children.length > 0) {

          item.children.forEach((child) => {

            if (typeof child.value === 'string') {
              child.value = SettingsDataAdapter.getDropDownOptionsFromString(child.value, item.valueOptions);
            }


          });
        }
      }

      return item;
    });
  }

  static getDropDownOptionsFromString(
    text: string,
    valueOptions: OrganizationSettingValueOptions[]
  ): OrganizationSettingsDropDownOption[] {
    let options: OrganizationSettingsDropDownOption[] = [];
    if (text) {
      let optionIds = text.split(';');
      optionIds.forEach((id) => {
        const foundOption = valueOptions.find((option) => option.key === id);
        if (foundOption) {
          options.push({ value: foundOption.key, text: foundOption.value });
        }
      });
    }
    return options;
  }
}
