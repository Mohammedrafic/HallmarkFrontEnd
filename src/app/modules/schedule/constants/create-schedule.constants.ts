import { FieldType } from "@core/enums";

import { ScheduleType } from "../enums";
import * as ScheduleInt from '../interface';


export enum ScheduleTypeNumber {
  Book = 0,
  Availability = 1,
  Unavailability = 2,
}

export enum ScheduleFormSourceKeys {
  Shifts = 'shifts',
  Reasons = 'reasons',
}


export const ScheduleTypes: ScheduleInt.ScheduleTypeRadioButton[] = [
  // TODO: uncomment when Book is implemented
  // {
  //   label: ScheduleType.Book,
  //   value: ScheduleTypeMode.Book,
  //   name: 'scheduleType',
  // },
  {
    label: ScheduleType.Unavailability,
    value: ScheduleTypeNumber.Unavailability,
    name: 'scheduleType',
  },
  {
    label: ScheduleType.Availability,
    value: ScheduleTypeNumber.Availability,
    name: 'scheduleType',
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

export const AvailabilityFormConfig: ScheduleInt.ScheduleFormConfig = {
  formClass: 'availability-form',
  formFields: availabilityFormFields,
};

export const UnavailabilityFormConfig: ScheduleInt.ScheduleFormConfig = {
  formClass: 'unavailability-form',
  formFields: unavailabilityFormFields,
};
