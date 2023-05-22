import { formatDate } from '@angular/common';

import { DropdownOption } from '@core/interface';
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

  static getParentSettingValue(parentSetting: OrganizationSettingsGet, isIRP: boolean): any {
    if (!parentSetting.children?.length) {
      return parentSetting.value;
    }

    if (isIRP) {
      const setting = parentSetting.children
        .find((item: OrganizationSettingChild) => item.isIRPConfigurationValue && !item.regionId);

      return setting?.value || parentSetting.value;
    } else {
      const setting = parentSetting.children
        .find((item: OrganizationSettingChild) => !item.isIRPConfigurationValue && !item.regionId);

      return setting?.value || parentSetting.value;
    }
  }

  static getParsedValue(value: any): any {
    let parsedValue: any;

    try {
      parsedValue = JSON.parse(value);
    } catch {
      parsedValue = undefined;
    }

    return parsedValue;
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

    if (setting.separateValuesInSystems && setting.children && setting.children.length > 1) {
      return SettingsDataAdapter.getSharedSettingDisplayValue(setting);
    }

    switch (setting.controlType) {
      case OrganizationSettingControlType.Checkbox:
        displayValue = SettingsDataAdapter.getCheckboxDisplayValue(setting.value);
        break;
      case OrganizationSettingControlType.Multiselect:
      case OrganizationSettingControlType.Select:
        displayValue = SettingsDataAdapter.getMultiselectDisplayValue(setting.value);
        break;
      case OrganizationSettingControlType.Text:
        displayValue = setting.value;
        break;
      case OrganizationSettingControlType.DateTime:
        displayValue = formatDate(setting.value, 'MM/dd/yyyy', 'en-US');
        break;
      case OrganizationSettingControlType.InvoiceAutoGeneration:
        displayValue = SettingsDataAdapter.getInvoiceDisplayValue(setting.value);
        break;
      case OrganizationSettingControlType.SwitchedValue:
        displayValue = SettingsDataAdapter.getSwitchedDisplayValue(setting.parsedValue);
        break;
      case OrganizationSettingControlType.CheckboxValue:
        displayValue = SettingsDataAdapter.getCheckboxValueDisplayValue(setting.value);
        break;
      case OrganizationSettingControlType.PayPeriod:
        displayValue = SettingsDataAdapter.getPayPeriodDisplayValue(setting.parsedValue);
        break;
      default:
        displayValue = '';
    }

    return displayValue;
  }

  private static getSharedSettingDisplayValue(setting: OrganizationSettingsGet): string {
    if (setting.controlType === OrganizationSettingControlType.Checkbox) {
      const irpValue = SettingsDataAdapter
        .getCheckboxDisplayValue(SettingsDataAdapter.getParentSettingValue(setting, true));
      const vmsValue = SettingsDataAdapter
        .getCheckboxDisplayValue(SettingsDataAdapter.getParentSettingValue(setting, false));

      return `${irpValue}, ${vmsValue}`;
    }

    if (
      setting.controlType === OrganizationSettingControlType.Multiselect
      || setting.controlType === OrganizationSettingControlType.Select
    ) {
      const irpValue = SettingsDataAdapter
        .getMultiselectDisplayValue(SettingsDataAdapter.getParentSettingValue(setting, true));
      const vmsValue = SettingsDataAdapter
        .getMultiselectDisplayValue(SettingsDataAdapter.getParentSettingValue(setting, false));

      return `${irpValue}, ${vmsValue}`;
    }


    if (setting.controlType === OrganizationSettingControlType.Text) {
      const irpValue = SettingsDataAdapter.getParentSettingValue(setting, true);
      const vmsValue = SettingsDataAdapter.getParentSettingValue(setting, false);

      return `${irpValue}, ${vmsValue}`;
    }

    if (setting.controlType === OrganizationSettingControlType.DateTime) {
      const irpValue = formatDate(SettingsDataAdapter.getParentSettingValue(setting, true), 'MM/dd/yyyy', 'en-US');
      const vmsValue = formatDate(SettingsDataAdapter.getParentSettingValue(setting, false), 'MM/dd/yyyy', 'en-US');

      return `${irpValue}, ${vmsValue}`;
    }

    if (setting.controlType === OrganizationSettingControlType.InvoiceAutoGeneration) {
      const irpValue = SettingsDataAdapter
        .getInvoiceDisplayValue(SettingsDataAdapter.getParentSettingValue(setting, true));
      const vmsValue = SettingsDataAdapter
        .getInvoiceDisplayValue(SettingsDataAdapter.getParentSettingValue(setting, false));

      return `${irpValue}, ${vmsValue}`;
    }

    if (setting.controlType === OrganizationSettingControlType.SwitchedValue) {
      const irpValue = SettingsDataAdapter
        .getSwitchedDisplayValue(SettingsDataAdapter.getParentSettingParsedValue(setting, true));
      const vmsValue = SettingsDataAdapter
        .getSwitchedDisplayValue(SettingsDataAdapter.getParentSettingParsedValue(setting, false));

      return `${irpValue}, ${vmsValue}`;
    }

    if (setting.controlType === OrganizationSettingControlType.CheckboxValue) {
      const irpValue = SettingsDataAdapter
        .getCheckboxValueDisplayValue(SettingsDataAdapter.getParentSettingValue(setting, true));
      const vmsValue = SettingsDataAdapter
        .getCheckboxValueDisplayValue(SettingsDataAdapter.getParentSettingValue(setting, false));

      return `${irpValue}, ${vmsValue}`;
    }

    if (setting.controlType === OrganizationSettingControlType.PayPeriod) {
      const irpValue = SettingsDataAdapter
        .getPayPeriodDisplayValue(SettingsDataAdapter.getParentSettingParsedValue(setting, true));
      const vmsValue = SettingsDataAdapter
        .getPayPeriodDisplayValue(SettingsDataAdapter.getParentSettingParsedValue(setting, false));

      return `${irpValue}, ${vmsValue}`;
    }

    return '';
  }

  private static getSettingChildDisplayValue(child: OrganizationSettingChild, type: OrganizationSettingControlType): string {
    let displayValue: string;

    switch (type) {
      case OrganizationSettingControlType.Checkbox:
        displayValue = SettingsDataAdapter.getCheckboxDisplayValue(child.value);
        break;
      case OrganizationSettingControlType.Multiselect:
        displayValue = SettingsDataAdapter.getMultiselectDisplayValue(child.value);
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
        displayValue = SettingsDataAdapter.getSwitchedDisplayValue(child.parsedValue);
        break;
      default:
        displayValue = '';
    }

    return displayValue;
  }

  private static getCheckboxValueDisplayValue(value: string | null): string {
    if (value === null) {
      return CheckboxValue.No;
    }

    if (SettingsDataAdapter.getParsedValue(value)?.isEnabled) {
      return CheckboxValue.Yes;
    }

    return CheckboxValue.No;
  }

  private static getCheckboxDisplayValue(value: string): CheckboxValue {
    const result = value === 'true' ? CheckboxValue.Yes : CheckboxValue.No;

    return result;
  }

  private static getMultiselectDisplayValue(values: DropdownOption[]): string {
    if (!Array.isArray(values)) {
      return '';
    }

    const result = values.map((item: DropdownOption) => item.text).join(', ');

    return result;
  }

  private static getInvoiceDisplayValue(value: string): CheckboxValue {
    const result = SettingsDataAdapter.getParsedValue(value)?.isEnabled ? CheckboxValue.Yes : CheckboxValue.No;

    return result;
  }

  private static getSwitchedDisplayValue(parsedValue: any): string {
    const result = parsedValue != null && parsedValue.value && parsedValue.isEnabled ? parsedValue.value : CheckboxValue.No;

    return result;
  }

  private static getPayPeriodDisplayValue(parsedValue: { isEnabled: boolean }): CheckboxValue {
    const result = parsedValue?.isEnabled ? CheckboxValue.Yes : CheckboxValue.No;

    return result;
  }

  private static getParentSettingParsedValue(parentSetting: OrganizationSettingsGet, isIRP: boolean): any {
    if (!parentSetting.children?.length) {
      return parentSetting.parsedValue;
    }

    if (isIRP) {
      const setting = parentSetting.children
        .find((item: OrganizationSettingChild) => item.isIRPConfigurationValue && !item.regionId);

      return setting?.parsedValue || parentSetting.parsedValue;
    } else {
      const setting = parentSetting.children
        .find((item: OrganizationSettingChild) => !item.isIRPConfigurationValue && !item.regionId);

      return setting?.parsedValue || parentSetting.parsedValue;
    }
  }
}
