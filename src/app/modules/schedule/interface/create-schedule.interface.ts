import { FieldType, InputAttrType } from "@core/enums";
import { DropdownOption } from "@core/interface";
import { ScheduleFormSourceKeys, ScheduleItemType } from "src/app/modules/schedule/constants";

export interface ScheduleForm {
  shiftId: number;
  startTime: string;
  endTime: string;
  unavailabilityReasonId?: number;
}

export interface ScheduleFormConfig {
  formClass: string;
  formFields: ScheduleFormFieldConfig[];
}

export interface ScheduleFormFieldConfig {
  field: string;
  title: string;
  type: FieldType;
  gridAreaName: string;
  required: boolean;
  readonly?: boolean;
  maxLen?: number;
  pattern?: string;
  inputType?: InputAttrType;
  sourceKey?: ScheduleFormSourceKeys
}

export interface ScheduleTypeRadioButton {
  label: string;
  value: ScheduleItemType;
  name: string;
}

export interface ScheduleFormSource {
  [ScheduleFormSourceKeys.Shifts]: DropdownOption[],
  [ScheduleFormSourceKeys.Reasons]: DropdownOption[],
  [ScheduleFormSourceKeys.Regions]: DropdownOption[],
  [ScheduleFormSourceKeys.Locations]: DropdownOption[],
  [ScheduleFormSourceKeys.Departments]: DropdownOption[],
  [ScheduleFormSourceKeys.Skills]: DropdownOption[],
}

export interface ScheduledDay {
  date: string;
  schedulesToOverrideIds: number[] | null;
}

export interface EmployeeScheduledDay {
  employeeId: number;
  scheduledDays: ScheduledDay[];
}

export interface EmployeeBookingDay {
  employeeId: number;
  bookedDays: string[];
}

export interface Schedule {
  scheduleType: number;
  shiftId: number | null;
  startTime: string | null;
  endTime: string | null;
  unavailabilityReasonId: number | null;
  employeeScheduledDays: EmployeeScheduledDay[];
}

export interface ScheduleBook {
  shiftId: number | null;
  startTime: string | null;
  endTime: string | null;
  departmentId: number | string;
  skillId: number | null;
  orderType: number;
  employeeBookedDays: EmployeeBookingDay[];
}

export interface BookingError {
  Key: string;
  Value: string;
}
export interface ScheduleBookingErrors {
  EmployeeId: number;
  DateLevelErrors: BookingError[];
  EmployeeLevelErrors: string[];
}
