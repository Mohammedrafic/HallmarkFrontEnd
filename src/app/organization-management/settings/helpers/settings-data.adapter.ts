import { OrganizationSettingControlType } from '@shared/enums/organization-setting-control-type';
import {
  OrganizationSettingChild,
  OrganizationSettingsDropDownOption,
  OrganizationSettingsGet,
  OrganizationSettingValueOptions,
} from '@shared/models/organization-settings.model';

export class SettingsDataAdapter {

  static adaptSettings(settings: OrganizationSettingsGet[], IRPAndVMS: boolean): OrganizationSettingsGet[] {
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

      item.children?.forEach((child) => {
        child.systemType = IRPAndVMS ? SettingsDataAdapter.getSettingChildSystemType(child) : null;
      });

      item.systemType = IRPAndVMS ? SettingsDataAdapter.getSettingSystemType(item) : null;

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

  static getSettingSystemType(setting: OrganizationSettingsGet): string | null {
    if (setting.includeInVMS && !setting.includeInIRP) {
      return 'VMS';
    }

    if (setting.includeInIRP && !setting.includeInVMS) {
      return 'IRP';
    }

    if (setting.includeInIRP && setting.includeInVMS) {
      return 'IRP, VMS';
    }

    return null;
  }

  static getSettingChildSystemType(setting: OrganizationSettingChild): string {
    if (setting.isIRPConfigurationValue) {
      return 'IRP';
    } else {
      return 'VMS';
    }
  }
}
