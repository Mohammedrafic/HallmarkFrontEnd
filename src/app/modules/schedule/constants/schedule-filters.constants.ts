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
  Departments = 'departmentIds',
  Skills = 'skillIds',
  isAvailablity = 'isAvailablity',
  isUnavailablity = 'isUnavailablity',
  isOnlySchedulatedCandidate = 'isOnlySchedulatedCandidate',
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
    allowNull: true,
  },
  [ScheduleFilterFormSourceKeys.Locations]: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Location',
    allowNull: true,
  },
  [ScheduleFilterFormSourceKeys.Departments]: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Department',
    allowNull: true,
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
    type: ControlTypes.Time,
    valueType: ValueType.Text,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Shift Start Time',
  },
  [ScheduleFilterFormSourceKeys.endTime]: {
    type: ControlTypes.Time,
    valueType: ValueType.Text,
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
    filterTitle: 'Show Only Scheduled Emp',
  },
  [ScheduleFilterFormSourceKeys.isExcludeNotOrganized]: {
    type: ControlTypes.Toggle,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Exclude not Oriented Emp',
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
    showAllToggle: true,
    customFiltering: true,
  },
  {
    field: 'locationIds',
    title: 'Location',
    type: FieldType.MultiSelectDropdown,
    required: true,
    sourceKey: ScheduleFilterFormSourceKeys.Locations,
    showAllToggle: true,
    customFiltering: true,
  },
  {
    field: 'departmentIds',
    title: 'Department',
    type: FieldType.MultiSelectDropdown,
    required: true,
    sourceKey: ScheduleFilterFormSourceKeys.Departments,
    showAllToggle: true,
    customFiltering: true,
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
    required: false,
    type: FieldType.Time,
    sourceKey: ScheduleFilterFormSourceKeys.startTime,
  },
  {
    field: 'endTime',
    title: 'Shift End Time',
    required: false,
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
    title: 'Show Only Scheduled Emp',
    type: FieldType.Toggle,
    required: false,
    sourceKey: ScheduleFilterFormSourceKeys.isOnlySchedulatedCandidate,
  },
  {
    field: 'isExcludeNotOrganized',
    title: 'Exclude not Oriented Emp',
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
  departmentIds: [],
  skillIds: [],
};
