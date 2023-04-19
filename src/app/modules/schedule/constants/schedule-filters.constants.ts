import { FieldType } from '@core/enums';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { OrganizationStructure } from '@shared/models/organization.model';

import {
  ScheduleFilterFormConfig,
  ScheduleFilterFormFieldConfig,
  ScheduleFiltersConfig,
  ScheduleFiltersData,
} from '../interface';

export const SkillsFieldsOptions = {
  text: 'skillDescription',
  value: 'id',
};

export enum ScheduleFilterFormSourceKeys {
  Regions = 'regionIds',
  Locations = 'locationIds',
  Departments = 'departmentsIds',
  Skills = 'skillIds',
}

export const ScheduleFiltersColumns: ScheduleFiltersConfig = {
  [ScheduleFilterFormSourceKeys.Regions]: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Region',
  },
  [ScheduleFilterFormSourceKeys.Locations]: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Location',
  },
  [ScheduleFilterFormSourceKeys.Departments]: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Department',
  },
  [ScheduleFilterFormSourceKeys.Skills]: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Skill',
  },
};

export const InitScheduleFiltersData: ScheduleFiltersData = {
  filters: {},
  filteredItems: [],
  chipsData: [],
};

export const InitEmployeeOrganizationStructure: OrganizationStructure = {
  organizationId: 0,
  organizationName: '',
  regions: [],
};

const scheduleFilterFormFields: ScheduleFilterFormFieldConfig[] = [
  {
    field: 'regionIds',
    title: 'Region',
    type: FieldType.MultiSelectDropdown,
    required: true,
    sourceKey: ScheduleFilterFormSourceKeys.Regions,
  },
  {
    field: 'locationIds',
    title: 'Location',
    type: FieldType.MultiSelectDropdown,
    required: true,
    sourceKey: ScheduleFilterFormSourceKeys.Locations,
  },
  {
    field: 'departmentsIds',
    title: 'Department',
    type: FieldType.MultiSelectDropdown,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.Departments,
  },
  {
    field: 'skillIds',
    title: 'Skill',
    type: FieldType.MultiSelectDropdown,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.Skills,
  },
];

export const ScheduleFilterFormGroupConfig: ScheduleFilterFormConfig = {
  formClass: 'schedule-filter-form',
  formFields: scheduleFilterFormFields,
};
