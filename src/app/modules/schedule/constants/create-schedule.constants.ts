import { FieldType, UserPermissions } from "@core/enums";

import { ScheduleType } from "../enums";
import * as ScheduleInt from '../interface';


export enum ScheduleItemType {
  Book = 0,
  Availability = 1,
  Unavailability = 2,
}

export enum ScheduleFormSourceKeys {
  Shifts = 'shifts',
  Reasons = 'reasons',
  Regions = 'regions',
  Locations = 'locations',
  Departments = 'departments',
  Skills = 'skill',
}

export const ScheduleTypes: ReadonlyArray<ScheduleInt.ScheduleTypeRadioButton> = [
  {
    label: ScheduleType.Book,
    value: ScheduleItemType.Book,
    name: 'scheduleType',
    disabled: false,
    permission: UserPermissions.CanAddShift,
  },
  {
    label: ScheduleType.Unavailability,
    value: ScheduleItemType.Unavailability,
    name: 'scheduleType',
    disabled: false,
    permission: UserPermissions.CanAddUnavailability,
  },
  {
    label: ScheduleType.Availability,
    value: ScheduleItemType.Availability,
    name: 'scheduleType',
    disabled: false,
    permission: UserPermissions.CanAddAvailability,
  },
];


const availabilityFormFields: ScheduleInt.ScheduleFormFieldConfig[] = [
  {
    field: 'shiftId',
    title: 'Shift',
    type: FieldType.Dropdown,
    gridAreaName: 'shift',
    required: true,
    sourceKey: ScheduleFormSourceKeys.Shifts,
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
];

const unavailabilityFormFields: ScheduleInt.ScheduleFormFieldConfig[] = [
  {
    field: 'unavailabilityReasonId',
    title: 'Reason',
    type: FieldType.Dropdown,
    gridAreaName: 'reason',
    required: true,
    sourceKey: ScheduleFormSourceKeys.Reasons,
  },
  ...availabilityFormFields,
];

const bookFormFields: ScheduleInt.ScheduleFormFieldConfig[] = [
  ...availabilityFormFields,
  {
    field: 'regionId',
    title: 'Region',
    type: FieldType.Dropdown,
    gridAreaName: 'region',
    required: false,
    sourceKey: ScheduleFormSourceKeys.Regions,
  },
  {
    field: 'locationId',
    title: 'Location',
    type: FieldType.Dropdown,
    gridAreaName: 'location',
    required: false,
    sourceKey: ScheduleFormSourceKeys.Locations,
  },
  {
    field: 'departmentId',
    title: 'Department',
    type: FieldType.Dropdown,
    gridAreaName: 'department',
    required: false,
    sourceKey: ScheduleFormSourceKeys.Departments,
  },
  {
    field: 'skillId',
    title: 'Skill',
    type: FieldType.Dropdown,
    gridAreaName: 'skill',
    required: false,
    sourceKey: ScheduleFormSourceKeys.Skills,
  },
];

export const AvailabilityFormConfig: ScheduleInt.ScheduleFormConfig = {
  formClass: 'availability-form',
  formFields: availabilityFormFields,
};

export const UnavailabilityFormConfig: ScheduleInt.ScheduleFormConfig = {
  formClass: 'unavailability-form',
  formFields: unavailabilityFormFields,
};

export const BookFormConfig: ScheduleInt.ScheduleFormConfig = {
  formClass: 'book-form',
  formFields: bookFormFields,
};

export const ScheduleSourcesMap: ScheduleInt.ScheduleFormSource = {
  [ScheduleFormSourceKeys.Shifts]: [],
  [ScheduleFormSourceKeys.Reasons]: [],
  [ScheduleFormSourceKeys.Regions]: [],
  [ScheduleFormSourceKeys.Locations]: [],
  [ScheduleFormSourceKeys.Departments]: [],
  [ScheduleFormSourceKeys.Skills]: [],
};
