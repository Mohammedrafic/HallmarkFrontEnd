import { FieldType, InputAttrType } from '@core/enums';
import { DropdownOption } from '@core/interface';

import { EditScheduleFormSourceKeys } from './edit-schedule.constants';

export interface ScheduledShift {
  scheduleId: number;
  departmentId?: number;
  skillId?: number;
  shiftId: number;
  date: string;
  startTime: string;
  endTime: string;
  createOrder: boolean;
  unavailabilityReasonId?: number;
  initialStartTime?: string;
  initialEndTime?: string;
  orientated?: boolean;
  critical?: boolean;
  onCall?: boolean;
  charge?: boolean;
  preceptor?: boolean;
  meal?: boolean;
}

export interface ScheduledShiftForm {
  date: Date;
  shiftId: number;
  startTime: string;
  hours: string;
  endTime: string;
  regionId?: number;
  locationId?: number;
  departmentId?: number;
  skillId?: number;
  unavailabilityReasonId?: number;
  orientated?: boolean,
  critical?: boolean,
  oncall?: boolean,
  charge?: boolean,
  preceptor?: boolean,
  meal?: boolean,
}

export interface EditScheduleFormConfig {
  formClass: string;
  formFields: EditScheduleFormFieldConfig[];
}

export interface EditScheduleFormFieldConfig {
  field: string;
  title: string;
  type: FieldType;
  gridAreaName: string;
  required: boolean;
  readonly?: boolean;
  maxLen?: number;
  pattern?: string;
  inputType?: InputAttrType;
  sourceKey?: EditScheduleFormSourceKeys;
  show?: boolean;
}

export interface EditScheduleFormSource {
  [EditScheduleFormSourceKeys.Shifts]: DropdownOption[],
  [EditScheduleFormSourceKeys.Reasons]: DropdownOption[],
  [EditScheduleFormSourceKeys.Regions]: DropdownOption[],
  [EditScheduleFormSourceKeys.Locations]: DropdownOption[],
  [EditScheduleFormSourceKeys.Departments]: DropdownOption[],
  [EditScheduleFormSourceKeys.Skills]: DropdownOption[],
}

export interface ShiftTab {
  title: string;
  subTitle: string;
  id: number;
}

export interface ChangeValueEvent {
  isInteracted: boolean,
  value: Date | number,
}
