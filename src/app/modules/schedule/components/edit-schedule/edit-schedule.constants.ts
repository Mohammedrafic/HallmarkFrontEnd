import { FieldType } from "@core/enums";
import { ScheduleType } from 'src/app/modules/schedule/enums';
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

const scheduledAvailabilityFormFields = (createMode: boolean): EditScheduleFormFieldConfig[] => {
  return [
    {
      field: 'date',
      title: 'Date',
      required: true,
      type: FieldType.Calendar,
      readonly: createMode,
      gridAreaName: 'date',
    },
    {
      field: 'shiftId',
      title: 'Shift',
      type: FieldType.Dropdown,
      gridAreaName: 'shift',
      required: true,
      sourceKey: EditScheduleFormSourceKeys.Shifts,
    },
    {
      field: 'startTime',
      title: 'Start Time',
      type: FieldType.Time,
      gridAreaName: 'startTime',
      required: true,
      show: false,
    },
    {
      field: 'endTime',
      title: 'End Time',
      type: FieldType.Time,
      gridAreaName: 'endTime',
      required: true,
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

const scheduledUnavailabilityFormFields = (createMode: boolean): EditScheduleFormFieldConfig[] => {
  return [
    ...scheduledAvailabilityFormFields(createMode),
    {
      field: 'unavailabilityReasonId',
      title: 'Reason',
      type: FieldType.Dropdown,
      gridAreaName: 'reason',
      required: true,
      sourceKey: EditScheduleFormSourceKeys.Reasons,
    },
  ];
};

const scheduledShiftFormFields = (): EditScheduleFormFieldConfig[] => {
  return [
    ...scheduledAvailabilityFormFields(false),
    {
      field: 'orientated',
      title: 'ORI',
      type: FieldType.Toggle,
      gridAreaName: 'toggle1',
      required: false,
      show: true,
    },
    {
      field: 'critical',
      title: 'CRT',
      type: FieldType.Toggle,
      gridAreaName: 'toggle2',
      required: false,
      show: true,
    },
    {
      field: 'oncall',
      title: 'OC',
      type: FieldType.Toggle,
      gridAreaName: 'toggle3',
      required: false,
      show: true,
    },
    {
      field: 'charge',
      title: 'CHG',
      type: FieldType.Toggle,
      gridAreaName: 'toggle4',
      required: false,
      show: true,
    },
    {
      field: 'preceptor',
      title: 'PRC',
      type: FieldType.Toggle,
      gridAreaName: 'toggle5',
      required: false,
      show: true,
    },
    {
      field: 'regionId',
      title: 'Region',
      type: FieldType.Dropdown,
      gridAreaName: 'region',
      required: false,
      readonly: false,
      sourceKey: EditScheduleFormSourceKeys.Regions,
    },
    {
      field: 'locationId',
      title: 'Location',
      type: FieldType.Dropdown,
      gridAreaName: 'location',
      required: false,
      readonly: false,
      sourceKey: EditScheduleFormSourceKeys.Locations,
    },
    {
      field: 'departmentId',
      title: 'Department',
      type: FieldType.Dropdown,
      gridAreaName: 'department',
      required: false,
      readonly: false,
      sourceKey: EditScheduleFormSourceKeys.Departments,
    },
    {
      field: 'skillId',
      title: 'Skill',
      type: FieldType.Dropdown,
      gridAreaName: 'skill',
      readonly: false,
      required: false,
      sourceKey: EditScheduleFormSourceKeys.Skills,
    },
  ];
};

const newShiftFormFields = (): EditScheduleFormFieldConfig[] => {
  return [
    ...scheduledAvailabilityFormFields(true),
    {
      field: 'orientated',
      title: 'ORI',
      type: FieldType.Toggle,
      gridAreaName: 'toggle1',
      required: false,
      show: true,
    },
    {
      field: 'critical',
      title: 'CRT',
      type: FieldType.Toggle,
      gridAreaName: 'toggle2',
      required: false,
      show: true,
    },
    {
      field: 'oncall',
      title: 'OC',
      type: FieldType.Toggle,
      gridAreaName: 'toggle3',
      required: false,
      show: true,
    },
    {
      field: 'charge',
      title: 'CHG',
      type: FieldType.Toggle,
      gridAreaName: 'toggle4',
      required: false,
      show: true,
    },
    {
      field: 'preceptor',
      title: 'PRC',
      type: FieldType.Toggle,
      gridAreaName: 'toggle5',
      required: false,
      show: true,
    },
  ];
};

export const ScheduledShiftFormConfig = (): EditScheduleFormConfig => {
  return {
    formClass: 'scheduled-shift-form',
    formFields: scheduledShiftFormFields(),
  };
};

export const NewShiftFormConfig = (): EditScheduleFormConfig => {
  return {
    formClass: 'new-shift-form',
    formFields: newShiftFormFields(),
  };
};

export const ScheduledAvailabilityFormConfig = (createMode: boolean): EditScheduleFormConfig => {
  return {
    formClass: 'scheduled-availability-form',
    formFields: scheduledAvailabilityFormFields(createMode),
  };
};

export const ScheduledUnavailabilityFormConfig = (createMode: boolean): EditScheduleFormConfig => {
 return {
   formClass: 'scheduled-unavailability-form',
   formFields: scheduledUnavailabilityFormFields(createMode),
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
};
