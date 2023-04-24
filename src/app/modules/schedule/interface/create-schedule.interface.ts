import { FieldType, InputAttrType, UserPermissions } from "@core/enums";
import { DropdownOption } from "@core/interface";
import { ScheduleFormSourceKeys, ScheduleItemType, ScheduleTypesForEditBar } from "src/app/modules/schedule/constants";
import { ScheduleItemAttributes } from './schedule.interface';
import * as ScheduleInt from './index';

export interface ScheduleForm {
  shiftId: number;
  startTime: string;
  endTime: string;
  unavailabilityReasonId?: number;
  orientated?: boolean;
  critical?: boolean;
  onCall?: boolean;
  charge?: boolean;
  preceptor?: boolean;
  meal?: boolean;
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
  show?: boolean;
  inputType?: InputAttrType;
  sourceKey?: ScheduleFormSourceKeys;
}

export interface CreateScheduleTypesConfig {
  columnsTemplate: string;
  source: ReadonlyArray<ScheduleInt.ScheduleTypeRadioButton>;
}

export interface ScheduleTypeRadioButton {
  label: string;
  value: ScheduleItemType;
  name: string;
  disabled: boolean;
  permission: UserPermissions;
}

export interface ScheduleFormSource {
  [ScheduleFormSourceKeys.Shifts]: DropdownOption[],
  [ScheduleFormSourceKeys.Reasons]: DropdownOption[],
  [ScheduleFormSourceKeys.Regions]: DropdownOption[],
  [ScheduleFormSourceKeys.Locations]: DropdownOption[],
  [ScheduleFormSourceKeys.Departments]: DropdownOption[],
  [ScheduleFormSourceKeys.Skills]: DropdownOption[],
}

export interface EmployeeScheduledDay {
  employeeId: number;
  dates: string[];
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
  createOrder: boolean;
}

export interface ScheduleBook extends ScheduleItemAttributes{
  shiftId: number | null;
  startTime: string | null;
  endTime: string | null;
  departmentId: number | string;
  skillId: number | null;
  employeeBookedDays: EmployeeBookingDay[];
  createOrder: boolean;
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

export interface BarSettings {
  showScheduleForm: boolean;
  showRemoveButton: boolean;
  showOpenPositions: boolean;
  removeReplacementMode: boolean;
  replacementOrderDialogOpen: boolean;
}
