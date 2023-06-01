import { FieldType, UserPermissions } from '@core/enums';

import { ScheduleAttributeTitles, ScheduleType } from '../../enums';
import {
  EditScheduleFormConfig,
  EditScheduleFormFieldConfig,
  EditScheduleFormSource,
} from './edit-schedule.interface';

export enum EditScheduleFormSourceKeys {
  Shifts = 'shifts',
  Reasons = 'reasons',
  Regions = 'regions',
  Locations = 'locations',
  Departments = 'departments',
  Skills = 'skill',
}

const newAvailabilityFormFields = (createMode: boolean, hasPermissions: boolean): EditScheduleFormFieldConfig[] => {
  return [
    {
      field: 'date',
      title: 'Date',
      required: true,
      type: FieldType.Calendar,
      readonly: createMode || !hasPermissions,
      gridAreaName: 'date',
    },
    {
      field: 'shiftId',
      title: 'Shift',
      type: FieldType.Dropdown,
      gridAreaName: 'shift',
      required: true,
      readonly: !hasPermissions,
      sourceKey: EditScheduleFormSourceKeys.Shifts,
    },
    {
      field: 'startTime',
      title: 'Start Time',
      type: FieldType.Time,
      gridAreaName: 'startTime',
      required: true,
      readonly: !hasPermissions,
      show: false,
    },
    {
      field: 'endTime',
      title: 'End Time',
      type: FieldType.Time,
      gridAreaName: 'endTime',
      required: true,
      readonly: !hasPermissions,
      show: false,
    },
    {
      field: 'hours',
      title: 'Hrs',
      type: FieldType.Input,
      gridAreaName: 'hours',
      required: false,
      readonly: true,
    },
  ];
};

const scheduledAvailabilityFormFields = (hasPermissions: boolean): EditScheduleFormFieldConfig[] => {
  return [
    ...newAvailabilityFormFields(false, hasPermissions),
    {
      field: 'regionId',
      title: 'Region',
      type: FieldType.Dropdown,
      gridAreaName: 'region',
      required: false,
      readonly: !hasPermissions,
      sourceKey: EditScheduleFormSourceKeys.Regions,
    },
    {
      field: 'locationId',
      title: 'Location',
      type: FieldType.Dropdown,
      gridAreaName: 'location',
      required: false,
      readonly: !hasPermissions,
      sourceKey: EditScheduleFormSourceKeys.Locations,
    },
    {
      field: 'departmentId',
      title: 'Department',
      type: FieldType.Dropdown,
      gridAreaName: 'department',
      required: false,
      readonly: !hasPermissions,
      sourceKey: EditScheduleFormSourceKeys.Departments,
    },
    {
      field: 'skillId',
      title: 'Skill',
      type: FieldType.Dropdown,
      gridAreaName: 'skill',
      readonly: !hasPermissions,
      required: false,
      sourceKey: EditScheduleFormSourceKeys.Skills,
    },
  ];
};

const scheduledUnavailabilityFormFields = (createMode: boolean, hasPermissions: boolean): EditScheduleFormFieldConfig[] => {
  return [
    ...newAvailabilityFormFields(createMode, hasPermissions),
    {
      field: 'unavailabilityReasonId',
      title: 'Reason',
      type: FieldType.Dropdown,
      gridAreaName: 'reason',
      required: true,
      readonly: !hasPermissions,
      sourceKey: EditScheduleFormSourceKeys.Reasons,
    },
  ];
};

const scheduledShiftFormFields = (hasPermissions: boolean): EditScheduleFormFieldConfig[] => {
  return [
    ...newAvailabilityFormFields(false, hasPermissions),
    {
      field: 'orientated',
      title: 'ORI',
      type: FieldType.Toggle,
      gridAreaName: 'toggle1',
      required: false,
      readonly: !hasPermissions,
      show: true,
      tooltipContent: ScheduleAttributeTitles.ORI,
    },
    {
      field: 'critical',
      title: 'CRT',
      type: FieldType.Toggle,
      gridAreaName: 'toggle2',
      required: false,
      readonly: !hasPermissions,
      show: true,
      tooltipContent: ScheduleAttributeTitles.CRT,
    },
    {
      field: 'oncall',
      title: 'OC',
      type: FieldType.Toggle,
      gridAreaName: 'toggle3',
      required: false,
      readonly: !hasPermissions,
      show: true,
      tooltipContent: ScheduleAttributeTitles.OC,
    },
    {
      field: 'charge',
      title: 'CHG',
      type: FieldType.Toggle,
      gridAreaName: 'toggle4',
      required: false,
      readonly: !hasPermissions,
      show: true,
      tooltipContent: ScheduleAttributeTitles.CHG,
    },
    {
      field: 'preceptor',
      title: 'PRC',
      type: FieldType.Toggle,
      gridAreaName: 'toggle5',
      required: false,
      readonly: !hasPermissions,
      show: true,
      tooltipContent: ScheduleAttributeTitles.PRC,
    },
    {
      field: 'meal',
      title: 'Meal',
      type: FieldType.Toggle,
      gridAreaName: 'meal',
      required: false,
      readonly: !hasPermissions,
      show: true,
      tooltipContent: ScheduleAttributeTitles.MEAL,
    },
    {
      field: 'regionId',
      title: 'Region',
      type: FieldType.Dropdown,
      gridAreaName: 'region',
      required: false,
      readonly: !hasPermissions,
      sourceKey: EditScheduleFormSourceKeys.Regions,
    },
    {
      field: 'locationId',
      title: 'Location',
      type: FieldType.Dropdown,
      gridAreaName: 'location',
      required: false,
      readonly: !hasPermissions,
      sourceKey: EditScheduleFormSourceKeys.Locations,
    },
    {
      field: 'departmentId',
      title: 'Department',
      type: FieldType.Dropdown,
      gridAreaName: 'department',
      required: false,
      readonly: !hasPermissions,
      sourceKey: EditScheduleFormSourceKeys.Departments,
    },
    {
      field: 'skillId',
      title: 'Skill',
      type: FieldType.Dropdown,
      gridAreaName: 'skill',
      readonly: !hasPermissions,
      required: false,
      sourceKey: EditScheduleFormSourceKeys.Skills,
    },
  ];
};

const newShiftFormFields = (): EditScheduleFormFieldConfig[] => {
  return [
    ...newAvailabilityFormFields(true, true),
    {
      field: 'orientated',
      title: 'ORI',
      type: FieldType.Toggle,
      gridAreaName: 'toggle1',
      required: false,
      show: true,
      tooltipContent: ScheduleAttributeTitles.ORI,
    },
    {
      field: 'critical',
      title: 'CRT',
      type: FieldType.Toggle,
      gridAreaName: 'toggle2',
      required: false,
      show: true,
      tooltipContent: ScheduleAttributeTitles.CRT,
    },
    {
      field: 'oncall',
      title: 'OC',
      type: FieldType.Toggle,
      gridAreaName: 'toggle3',
      required: false,
      show: true,
      tooltipContent: ScheduleAttributeTitles.OC,
    },
    {
      field: 'charge',
      title: 'CHG',
      type: FieldType.Toggle,
      gridAreaName: 'toggle4',
      required: false,
      show: true,
      tooltipContent: ScheduleAttributeTitles.CHG,
    },
    {
      field: 'preceptor',
      title: 'PRC',
      type: FieldType.Toggle,
      gridAreaName: 'toggle5',
      required: false,
      show: true,
      tooltipContent: ScheduleAttributeTitles.PRC,
    },
    {
      field: 'meal',
      title: 'Meal',
      type: FieldType.Toggle,
      gridAreaName: 'meal',
      required: false,
      show: true,
      tooltipContent: ScheduleAttributeTitles.MEAL,
    },
  ];
};

export const ScheduledShiftFormConfig = (hasPermissions: boolean): EditScheduleFormConfig => {
  return {
    formClass: 'scheduled-shift-form',
    formFields: scheduledShiftFormFields(hasPermissions),
  };
};

export const NewShiftFormConfig = (): EditScheduleFormConfig => {
  return {
    formClass: 'new-shift-form',
    formFields: newShiftFormFields(),
  };
};

export const NewAvailabilityFormConfig = (createMode: boolean, hasPermissions: boolean): EditScheduleFormConfig => {
  return {
    formClass: 'new-availability-form',
    formFields: newAvailabilityFormFields(createMode, hasPermissions),
  };
};

export const ScheduledAvailabilityFormConfig = (hasPermissions: boolean): EditScheduleFormConfig => {
  return {
    formClass: 'scheduled-availability-form',
    formFields: scheduledAvailabilityFormFields(hasPermissions),
  };
};

export const ScheduledUnavailabilityFormConfig = (createMode: boolean, hasPermissions: boolean): EditScheduleFormConfig => {
 return {
   formClass: 'scheduled-unavailability-form',
   formFields: scheduledUnavailabilityFormFields(createMode, hasPermissions),
 };
};

export const EditScheduleSourcesMap: EditScheduleFormSource = {
  [EditScheduleFormSourceKeys.Shifts]: [],
  [EditScheduleFormSourceKeys.Reasons]: [],
  [EditScheduleFormSourceKeys.Regions]: [],
  [EditScheduleFormSourceKeys.Locations]: [],
  [EditScheduleFormSourceKeys.Departments]: [],
  [EditScheduleFormSourceKeys.Skills]: [],
};

export const RemoveButtonTitleMap = {
  [ScheduleType.Book]: 'Booking',
  [ScheduleType.Availability]: 'Availability',
  [ScheduleType.Unavailability]: 'Unavailability',
  [ScheduleType.OpenPositions]: 'OpenPositions',
};

export const EditSchedulePermissionsMap = {
  [ScheduleType.Book]: UserPermissions.CanAddShift,
  [ScheduleType.Availability]: UserPermissions.CanAddAvailability,
  [ScheduleType.Unavailability]: UserPermissions.CanAddUnavailability,
  [ScheduleType.OpenPositions]: UserPermissions.CanAddShift,
};

export const OpenPositionsConfig = {
  canFetchOpenPositions: false,
  showOpenPositionsPanel: false,
  totalOpenPositions: 0,
};
