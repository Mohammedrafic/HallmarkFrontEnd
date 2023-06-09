import { FieldType } from '@core/enums';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { OrganizationStructure } from '@shared/models/organization.model';

import {
  ChipsFilterStructure,
  ChipsInitialState,
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
  isAvailablity = 'isAvailablity',
  isUnavailablity = 'isUnavailablity',
  isOnlySchedulatedCandidate = 'isOnlySchedulatedCandidate',
  ShowGeneralnotes = 'ShowGeneralnotes',
  startTime = 'startTime',
  endTime = 'endTime',
  isExcludeNotOrganized = "isExcludeNotOrganized"
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
  [ScheduleFilterFormSourceKeys.startTime]: {
    type: ControlTypes.Dropdown,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Shift Start Time',
  },
  [ScheduleFilterFormSourceKeys.endTime]: {
    type: ControlTypes.Dropdown,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Shift End Time',
  },
  [ScheduleFilterFormSourceKeys.isAvailablity]: {
    type: ControlTypes.Toggle,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Show Availability',
  },
  [ScheduleFilterFormSourceKeys.isUnavailablity]: {
    type: ControlTypes.Toggle,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Show Unavailability',
  },
  [ScheduleFilterFormSourceKeys.isOnlySchedulatedCandidate]: {
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
  [ScheduleFilterFormSourceKeys.isExcludeNotOrganized]: {
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
    field: 'startTime',
    title: 'Shift Start Time',
    required: true,
    type: FieldType.Time,
    sourceKey: ScheduleFilterFormSourceKeys.startTime,
  },
  {
    field: 'endTime',
    title: 'Shift End Time',
    required: true,
    type: FieldType.Time,
    sourceKey: ScheduleFilterFormSourceKeys.endTime,
  },
  {
    field: 'isAvailablity',
    title: 'Show Availability',
    type: FieldType.Toggle,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.isAvailablity,
  },
  {
    field: 'isUnavailablity',
    title: 'Show Unavailability',
    type: FieldType.Toggle,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.isUnavailablity,
  },
  {
    field: 'isOnlySchedulatedCandidate',
    title: 'Show Only Scheduled Candidates',
    type: FieldType.Toggle,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.isOnlySchedulatedCandidate,
  },
  {
    field: 'ShowGeneralnotes',
    title: 'Show General Notes',
    type: FieldType.Toggle,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.ShowGeneralnotes,
  },
  {
    field: 'isExcludeNotOrganized',
    title: 'Show Exclude not Oriented',
    type: FieldType.Toggle,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.isExcludeNotOrganized,
  },
];

export const ScheduleFilterFormGroupConfig: ScheduleFilterFormConfig = {
  formClass: 'schedule-filter-form',
  formFields: scheduleFilterFormFields,
};

export const ChipsStructureState: ChipsInitialState = {
  regions: [],
  locations: [],
  departments: [],
};

export const FilterChipsStructure: ChipsFilterStructure = {
  regionIds: [],
  locationIds: [],
  departmentsIds: [],
  skillIds: [],
};
