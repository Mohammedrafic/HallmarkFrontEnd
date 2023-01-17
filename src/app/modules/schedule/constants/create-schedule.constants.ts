import { FieldType } from "@core/enums";

import {
  ScheduleFormConfig,
  ScheduleFormFieldConfig,
  ScheduleTypeRadioButton,
} from "../components/create-schedule/create-schedule.interface";
import { ScheduleType } from "../enums";


export enum ScheduleTypeNumber {
  Book = 0,
  Availability = 1,
  Unavailability = 2,
}

export enum ScheduleFormSourceKeys {
  Shifts = 'shifts',
  Reasons = 'reasons',
}


export const ScheduleTypes: ScheduleTypeRadioButton[] = [
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


const availabilityFormFields:  ScheduleFormFieldConfig[] = [
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

const unavailabilityFormFields:  ScheduleFormFieldConfig[] = [
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

export const AvailabilityFormConfig: ScheduleFormConfig = {
  formClass: 'availability-form',
  formFields: availabilityFormFields,
};

export const UnavailabilityFormConfig: ScheduleFormConfig = {
  formClass: 'unavailability-form',
  formFields: unavailabilityFormFields,
};
