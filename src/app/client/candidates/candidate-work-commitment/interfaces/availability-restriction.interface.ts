import { ControlTypes } from "@shared/enums/control-types.enum";
import { AvailabilityFilterColumns } from "../enums";
import { DataSourceItem, DropdownOption } from "@core/interface";

export interface AvailabilityFormFieldConfig<T> {
  type: ControlTypes;
  title: string;
  field: T;
  optionFields?: DropdownOption;
  disabled?: boolean;
  required?: boolean;
  dataSource?: DataSourceItem[];
}

export interface AvailabilityRestriction {
  id: number | null;
  candidateProfileId: number;
  startDayOfWeek: number;
  endDayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface AvailabilityRestrictionFormState {
  [AvailabilityFilterColumns.START_DAY]: number;
  [AvailabilityFilterColumns.END_DAY]: number;
  [AvailabilityFilterColumns.START_TIME]: string;
  [AvailabilityFilterColumns.END_TIME]: string;
}

export interface AvailRestrictDialogData {
  isOpen: boolean,
  data?: AvailabilityRestriction,
}
