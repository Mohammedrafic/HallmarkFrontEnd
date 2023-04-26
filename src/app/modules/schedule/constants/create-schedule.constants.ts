import { FieldType, UserPermissions } from "@core/enums";

import { ScheduleType } from "../enums";
import * as ScheduleInt from '../interface';
import { CreateScheduleTypesConfig } from '../interface';


export enum ScheduleItemType {
  Book = 0,
  Availability = 1,
  Unavailability = 2,
  OpenPositions = 3,
}

export enum ScheduleFormSourceKeys {
  Shifts = 'shifts',
  Reasons = 'reasons',
  Regions = 'regions',
  Locations = 'locations',
  Departments = 'departments',
  Skills = 'skill',
}

export const OpenPositionTypes: ScheduleInt.ScheduleTypeRadioButton = {
  label: ScheduleType.OpenPositions,
  value: ScheduleItemType.OpenPositions,
  name: 'scheduleType',
  disabled: false,
  permission: UserPermissions.CanViewSchedule,
};

export const BookTypes: ScheduleInt.ScheduleTypeRadioButton = {
  label: ScheduleType.Book,
  value: ScheduleItemType.Book,
  name: 'scheduleType',
  disabled: false,
  permission: UserPermissions.CanAddShift,
};

export const AvailabilityTypes: ScheduleInt.ScheduleTypeRadioButton = {
  label: ScheduleType.Availability,
  value: ScheduleItemType.Availability,
  name: 'scheduleType',
  disabled: false,
  permission: UserPermissions.CanAddAvailability,
};

export const UnavailabilityTypes = {
  label: ScheduleType.Unavailability,
  value: ScheduleItemType.Unavailability,
  name: 'scheduleType',
  disabled: false,
  permission: UserPermissions.CanAddUnavailability,
};

export const ScheduleTypesForEditBar: ReadonlyArray<ScheduleInt.ScheduleTypeRadioButton> = [
  BookTypes,AvailabilityTypes, UnavailabilityTypes,
];

export const ScheduleTypesForCreateBar: CreateScheduleTypesConfig = {
  columnsTemplate: 'auto auto auto auto',
  source: [
    BookTypes,OpenPositionTypes, AvailabilityTypes, UnavailabilityTypes,
  ],
};

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
    show: false,
    required: true,
  },
  {
    field: 'endTime',
    title: 'End Time',
    type: FieldType.Time,
    gridAreaName: 'endTime',
    show: false,
    required: true,
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

const openPositionsFormFields: ScheduleInt.ScheduleFormFieldConfig[] = [
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
    show: false,
    required: true,
  },
  {
    field: 'endTime',
    title: 'End Time',
    type: FieldType.Time,
    gridAreaName: 'endTime',
    show: false,
    required: true,
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

const bookingToggleForm: ScheduleInt.ScheduleFormFieldConfig[] = [
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
    field: 'onCall',
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
    field: 'meal',
    title: 'Meal',
    type: FieldType.Toggle,
    gridAreaName: 'meal',
    required: false,
    show: true,
  },
];

const bookFormFields: ScheduleInt.ScheduleFormFieldConfig[] = [
  ...availabilityFormFields,
  ...bookingToggleForm,
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

export const OpenPositionsConfig: ScheduleInt.ScheduleFormConfig = {
  formClass: 'open-positions-form',
  formFields: openPositionsFormFields,
};

export const ScheduleSourcesMap: ScheduleInt.ScheduleFormSource = {
  [ScheduleFormSourceKeys.Shifts]: [],
  [ScheduleFormSourceKeys.Reasons]: [],
  [ScheduleFormSourceKeys.Regions]: [],
  [ScheduleFormSourceKeys.Locations]: [],
  [ScheduleFormSourceKeys.Departments]: [],
  [ScheduleFormSourceKeys.Skills]: [],
};

export const ScheduleCircleType = {
  [ScheduleType.Book]: 'book-circle',
  [ScheduleType.Availability]: 'availability-circle',
  [ScheduleType.Unavailability]: 'unavailability-circle',
};

export const PermissionRequired = 'Separate permission right is required';
