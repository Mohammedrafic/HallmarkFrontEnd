import { FieldType } from "@core/enums";
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

const scheduledShiftFormFields: EditScheduleFormFieldConfig[] = [
  {
    field: 'date',
    title: 'Date',
    required: true,
    type: FieldType.Calendar,
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
  },
  {
    field: 'endTime',
    title: 'End Time',
    type: FieldType.Time,
    gridAreaName: 'endTime',
    required: true,
  },
  {
    field: 'hours',
    title: 'Hours',
    type: FieldType.Input,
    gridAreaName: 'hours',
    required: false,
    readonly: true,
  },
  {
    field: 'regionId',
    title: 'Region',
    type: FieldType.Dropdown,
    gridAreaName: 'region',
    required: false,
    sourceKey: EditScheduleFormSourceKeys.Regions,
  },
  {
    field: 'locationId',
    title: 'Location',
    type: FieldType.Dropdown,
    gridAreaName: 'location',
    required: false,
    sourceKey: EditScheduleFormSourceKeys.Locations,
  },
  {
    field: 'departmentId',
    title: 'Department',
    type: FieldType.Dropdown,
    gridAreaName: 'department',
    required: false,
    sourceKey: EditScheduleFormSourceKeys.Departments,
  },
  {
    field: 'skillId',
    title: 'Skill',
    type: FieldType.Dropdown,
    gridAreaName: 'skill',
    required: false,
    sourceKey: EditScheduleFormSourceKeys.Skills,
  },
];


export const ScheduledShiftFormConfig: EditScheduleFormConfig = {
  formClass: 'scheduled-shift-form',
  formFields: scheduledShiftFormFields,
};

export const EditScheduleSourcesMap: EditScheduleFormSource = {
  [EditScheduleFormSourceKeys.Shifts]: [],
  [EditScheduleFormSourceKeys.Reasons]: [],
  [EditScheduleFormSourceKeys.Regions]: [],
  [EditScheduleFormSourceKeys.Locations]: [],
  [EditScheduleFormSourceKeys.Departments]: [],
  [EditScheduleFormSourceKeys.Skills]: [],
};
