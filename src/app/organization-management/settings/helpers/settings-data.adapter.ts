import { OrganizationSettingControlType } from '@shared/enums/organization-setting-control-type';
import {
  OrganizationSettingChild,
  OrganizationSettingsDropDownOption,
  OrganizationSettingsGet,
  OrganizationSettingValueOptions,
} from '@shared/models/organization-settings.model';

export class SettingsDataAdapter {

  static getDropDownOptionIds(data: OrganizationSettingsDropDownOption[]): string[] {
    if (data) {
      return data.map((item: OrganizationSettingsDropDownOption) => item.value);
    }

    return [];
  }

  static adaptSettings(settings: OrganizationSettingsGet[], IRPAndVMS: boolean): OrganizationSettingsGet[] {
    return settings.map((item: OrganizationSettingsGet) => {
      if (
        item.controlType === OrganizationSettingControlType.Select ||
        item.controlType === OrganizationSettingControlType.Multiselect
      ) {

        if (typeof item.value === 'string') {
          item.value = SettingsDataAdapter.getDropDownOptionsFromString(item.value, item.valueOptions);
        }

        item.children?.forEach((child: OrganizationSettingChild) => {
          if (typeof child.value === 'string') {
            child.value = SettingsDataAdapter.getDropDownOptionsFromString(child.value, item.valueOptions);
          }
        });

      }

      item.children?.forEach((child: OrganizationSettingChild) => {
        child.systemType = IRPAndVMS ? SettingsDataAdapter.getSettingChildSystemType(child) : null;
      });

      item.systemType = IRPAndVMS ? SettingsDataAdapter.getSettingSystemType(item) : null;

      return item;
    });
  }

  private static getDropDownOptionsFromString(
    text: string,
    valueOptions: OrganizationSettingValueOptions[]
  ): OrganizationSettingsDropDownOption[] {
    const options: OrganizationSettingsDropDownOption[] = [];
    if (text) {
      const optionIds = text.split(';');
      optionIds.forEach((id) => {
        const foundOption = valueOptions.find((option) => option.key === id);
        if (foundOption) {
          options.push({ value: foundOption.key, text: foundOption.value });
        }
      });
    }
    return options;
  }

  private static getSettingSystemType(setting: OrganizationSettingsGet): string | null {
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

  private static getSettingChildSystemType(setting: OrganizationSettingChild): string {
    if (setting.isIRPConfigurationValue) {
      return 'IRP';
    } else {
      return 'VMS';
    }
  }
}
