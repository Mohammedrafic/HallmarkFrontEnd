import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';

export interface SettingFilterColumn<T> {
  type: ControlTypes,
  valueType: ValueType,
  dataSource: T[],
  valueField?: 'name',
  valueId?: 'id',
  checkBoxTitle?: string,
}

export interface SettingsFilterColsConfig {
  regionIds: SettingFilterColumn<OrganizationRegion>,
  locationIds: SettingFilterColumn<OrganizationLocation>,
  departmentIds: SettingFilterColumn<OrganizationDepartment>,
  attributes: SettingFilterColumn<string>,
  includeInIRP?: SettingFilterColumn<boolean>,
  includeInVMS?: SettingFilterColumn<boolean>,
}

export interface AutoGenerationPayload {
  isEnabled: boolean;
  dayOfWeek: number;
  groupingBy: number;
  time: string;
}

export interface SwitchValuePayload {
  isEnabled: boolean;
  value: number | null;
}

export interface PayPeriodPayload {
  isEnabled: boolean;
  noOfWeek: number;
  date: Date;
}
