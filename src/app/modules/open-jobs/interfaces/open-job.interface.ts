import { ValueType } from '@syncfusion/ej2-angular-grids';

import { OrderJobType } from '@shared/enums';
import { FieldType } from '@core/enums';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { DropdownOption } from '@core/interface';

export interface PageSettings {
  pageNumber: number;
  pageSize: number;
}

export interface OpenJobFilter {
  orderType: number | null | OrderJobType;
}

export interface OrderTypeSource {
  text: string;
  value: number | null | OrderJobType;
}

export interface OpenJobFilterConfig {
  field: string;
  title: string;
  fieldType: FieldType;
  required: boolean;
  sources: OrderTypeSource[]
}

export interface OpenJobFilterItem {
  type: ControlTypes;
  dataSource: DropdownOption[] | OrderTypeSource[];
  valueField: string;
  valueId: string;
  valueType: ValueType;
  filterTitle: string;
}

export interface FiltersColumnConfig {
  orderType: OpenJobFilterItem;
}

export interface FiltersState {
  employeeTime: string;
  orderType: OrderJobType | number |null;
  orderBy: string | null;
  pageNumber: number;
  pageSize: number;
}

export interface PreservedFilters {
  filters: FiltersState;
  appliedFiltersAmount: number;
}

export interface LtaEmployeeDto {
  employeeId: number | string;
  orderId: number;
  workflowStepType: number;
}

export interface EmployeeScheduledDays {
  employeeId: number | string;
  dates: string[];
}

export interface PerDiemEmployeeDto {
  employeeScheduledDays: EmployeeScheduledDays[];
  userLocalTime: string;
  scheduleType: number;
  startTime: string;
  endTime: string;
  shiftId: number | null;
}
