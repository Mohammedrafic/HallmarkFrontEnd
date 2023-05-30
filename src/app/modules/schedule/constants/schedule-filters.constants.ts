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
  Shift = 'shiftId',
  ShowAvailability = 'ShowAvailability',
  ShowUnavailability = 'ShowUnavailability',
  ShowOnlyscheduledcandidates = 'ShowOnlyscheduledcandidates',
  ShowGeneralnotes = 'ShowGeneralnotes',
  ShowExcludenotoriented = 'ShowExcludenotoriented',
  // ShiftStartTime = 'ShiftStartTime',
  // ShiftEndTime = 'ShiftEndTime'
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
  [ScheduleFilterFormSourceKeys.Shift]: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'shift',
  },
  // [ScheduleFilterFormSourceKeys.ShiftStartTime]: {
  //   type: ControlTypes.Dropdown,
  //   valueType: ValueType.Id,
  //   dataSource: [],
  //   valueField: 'text',
  //   valueId: 'value',
  //   filterTitle: 'Shift Start Time',
  // },
  // [ScheduleFilterFormSourceKeys.ShiftEndTime]: {
  //   type: ControlTypes.Dropdown,
  //   valueType: ValueType.Id,
  //   dataSource: [],
  //   valueField: 'text',
  //   valueId: 'value',
  //   filterTitle: 'Shift End Time',
  // },
  [ScheduleFilterFormSourceKeys.ShowAvailability]: {
    type: ControlTypes.Toggle,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Show Availability',
  },
  [ScheduleFilterFormSourceKeys.ShowUnavailability]: {
    type: ControlTypes.Toggle,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Show Unavailability',
  },
  [ScheduleFilterFormSourceKeys.ShowOnlyscheduledcandidates]: {
    type: ControlTypes.Toggle,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Show Only Scheduled Candidates',
  },
  [ScheduleFilterFormSourceKeys.ShowGeneralnotes]: {
    type: ControlTypes.Toggle,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Show General Notes',
  },
  [ScheduleFilterFormSourceKeys.ShowExcludenotoriented]: {
    type: ControlTypes.Toggle,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Show Exclude not Oriented',
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
  {
    field: 'shiftIds',
    title: 'Shift',
    type: FieldType.MultiSelectDropdown,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.Shift,
  },
  // {
  //   field: 'ShiftStartTime',
  //   title: 'Shift Start Time',
  //   required: true,
  //   type: FieldType.Time,
  //   sourceKey: ScheduleFilterFormSourceKeys.ShiftStartTime,
  // },
  // {
  //   field: 'ShiftEndTime',
  //   title: 'Shift End Time',
  //   required: true,
  //   type: FieldType.Time,
  //   sourceKey: ScheduleFilterFormSourceKeys.ShiftEndTime,
  // },
  {
    field: 'ShowAvailability',
    title: 'Show Availability',
    type: FieldType.Toggle,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.ShowAvailability,
  },
  {
    field: 'ShowUnavailability',
    title: 'Show Unavailability',
    type: FieldType.Toggle,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.ShowUnavailability,
  },
  {
    field: 'ShowOnlyscheduledcandidates',
    title: 'Show Only Scheduled Candidates',
    type: FieldType.Toggle,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.ShowOnlyscheduledcandidates,
  },
  {
    field: 'ShowGeneralnotes',
    title: 'Show General Notes',
    type: FieldType.Toggle,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.ShowGeneralnotes,
  },
  {
    field: 'ShowExcludenotoriented',
    title: 'Show Exclude not Oriented',
    type: FieldType.Toggle,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.ShowExcludenotoriented,
  },
];

export const ScheduleFilterFormGroupConfig: ScheduleFilterFormConfig = {
  formClass: 'schedule-filter-form',
  formFields: scheduleFilterFormFields,
};
