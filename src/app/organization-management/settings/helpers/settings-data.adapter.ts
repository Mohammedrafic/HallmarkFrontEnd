import { formatDate } from '@angular/common';

import { OrganizationSettingControlType } from '@shared/enums/organization-setting-control-type';
import {
  OrganizationSettingChild,
  OrganizationSettingsDropDownOption,
  OrganizationSettingsGet,
  OrganizationSettingValueOptions,
} from '@shared/models/organization-settings.model';

import { CheckboxValue } from '../enums/settings.enum';

export class SettingsDataAdapter {

  static getDropDownOptionIds(data: OrganizationSettingsDropDownOption[]): string[] {
    if (data) {
      return data.map((item: OrganizationSettingsDropDownOption) => item.value);
    }

    return [];
  }

  static adaptSettings(settings: OrganizationSettingsGet[], IRPAndVMS: boolean): OrganizationSettingsGet[] {
    SettingsDataAdapter.setParsedValues(settings);
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
        child.displayValue = SettingsDataAdapter.getSettingChildDisplayValue(child, item.controlType);
      });

      item.systemType = IRPAndVMS ? SettingsDataAdapter.getSettingSystemType(item) : null;
      item.displayValue = SettingsDataAdapter.getSettingDisplayValue(item);

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

  private static setParsedValues(data: OrganizationSettingsGet[]): void {
    const invoiceGeneration: OrganizationSettingsGet | undefined = data.find((setting: OrganizationSettingsGet) => {
      return setting.controlType === OrganizationSettingControlType.InvoiceAutoGeneration;
    });

    if (invoiceGeneration && invoiceGeneration.value && typeof invoiceGeneration.value === 'string') {
      invoiceGeneration.parsedValue = SettingsDataAdapter.getParsedValue(invoiceGeneration.value);
    }

    const payPeriodGeneration: OrganizationSettingsGet | undefined  = data.find((setting: OrganizationSettingsGet) => {
      return setting.controlType === OrganizationSettingControlType.PayPeriod;
    });

    if (payPeriodGeneration && payPeriodGeneration.value && typeof payPeriodGeneration.value === 'string') {
      payPeriodGeneration.parsedValue = SettingsDataAdapter.getParsedValue(payPeriodGeneration.value);
    }

    const switchedValues: OrganizationSettingsGet[] = data.filter((setting: OrganizationSettingsGet) => {
      return setting.controlType === OrganizationSettingControlType.SwitchedValue;
    });

    switchedValues.forEach((setting: OrganizationSettingsGet) => {
      if (setting.value && typeof setting.value === 'string') {
        setting.parsedValue = SettingsDataAdapter.getParsedValue(setting.value);
      }

      if (setting.children && setting.children.length) {
        setting.children.forEach((child: OrganizationSettingChild) => {
          if (child.value && typeof child.value === 'string') {
            child.parsedValue = SettingsDataAdapter.getParsedValue(child.value);
          }
        });
      }
    });
  }

  private static getSettingDisplayValue(setting: OrganizationSettingsGet): string {
    let displayValue: string;

    switch (setting.controlType) {
      case OrganizationSettingControlType.Checkbox:
        displayValue = setting.value === 'true' ? CheckboxValue.Yes : CheckboxValue.No;
        break;
      case OrganizationSettingControlType.Multiselect:
      case OrganizationSettingControlType.Select:
        displayValue = setting.value.map((item: { text: string }) => item.text).join(', ');
        break;
      case OrganizationSettingControlType.Text:
        displayValue = setting.value;
        break;
      case OrganizationSettingControlType.DateTime:
        displayValue = formatDate(setting.value, 'MM/dd/yyyy', 'en-US');
        break;
      case OrganizationSettingControlType.InvoiceAutoGeneration:
        displayValue = SettingsDataAdapter.getParsedValue(setting.value)?.isEnabled ? CheckboxValue.Yes : CheckboxValue.No;
        break;
      case OrganizationSettingControlType.SwitchedValue:
        displayValue = setting.parsedValue != null && setting.parsedValue.value && setting.parsedValue.isEnabled
          ? setting.parsedValue.value : CheckboxValue.No;
        break;
      case OrganizationSettingControlType.CheckboxValue:
        displayValue = SettingsDataAdapter.getCheckboxValue(setting);
        break;
      case OrganizationSettingControlType.PayPeriod:
        displayValue = setting.parsedValue?.isEnabled ? CheckboxValue.Yes : CheckboxValue.No;
        break;
      default:
        displayValue = '';
    }

    return displayValue;
  }

  private static getSettingChildDisplayValue(child: OrganizationSettingChild, type: OrganizationSettingControlType): string {
    let displayValue: string;

    switch (type) {
      case OrganizationSettingControlType.Checkbox:
        displayValue = child.value === 'true' ? CheckboxValue.Yes : CheckboxValue.No;
        break;
      case OrganizationSettingControlType.Multiselect:
        displayValue = child.value.map((item: { text: string }) => item.text).join(', ');
        break;
      case OrganizationSettingControlType.Select:
        displayValue = child.value[0]?.text;
        break;
      case OrganizationSettingControlType.Text:
        displayValue = child.value;
        break;
      case OrganizationSettingControlType.DateTime:
        displayValue = formatDate(child.value, 'MM/dd/yyyy', 'en-US');
        break;
      case OrganizationSettingControlType.SwitchedValue:
        displayValue = child.parsedValue != null && child.parsedValue.value && child.parsedValue.isEnabled
          ? child.parsedValue.value : CheckboxValue.No;
        break;
      default:
        displayValue = '';
    }

    return displayValue;
  }

  private static getCheckboxValue(setting: OrganizationSettingsGet): string {
    if (setting.value === null) {
      return CheckboxValue.No;
    }

    if (SettingsDataAdapter.getParsedValue(setting.value)?.isEnabled) {
      return CheckboxValue.Yes;
    }

    return CheckboxValue.No;
  }

  private static getParsedValue(value: any): any {
    let parsedValue: any;

    try {
      parsedValue = JSON.parse(value);
    } catch {
      parsedValue = undefined;
    }

    return parsedValue;
  }
}
