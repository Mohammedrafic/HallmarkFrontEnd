import { ValueType } from '@syncfusion/ej2-angular-grids';
import { Observable } from 'rxjs';

import { OrderJobType } from '@shared/enums';
import { FieldType } from '@core/enums';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { DropdownOption } from '@core/interface';
import { EmployeeAction } from '../enums';

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

export interface UpdateLtaEmployeeDTO {
  jobId: number;
  orderId: number | null;
  organizationId: number;
  workflowStepType: number;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  availableStartDate?: string | null;
  offeredStartDate?: string | null;
  offeredEndDate?: string | null;
  employeeTime?: string | null;
}

export interface PerDiemEmployeeDto {
  orderId: number;
  employeeTime?: string | null;
}

export interface WithdrawPerDiemEmployeeDto {
  orderId: number;
  employeeTime?: string | null;
}

export interface RejectEmployeeDto {
  organizationId: number | string;
  employeeId: number;
}

export interface EmployeeButton {
  title: string;
  type: EmployeeAction;
  cssClass: string
}

export interface EmployeeServiceMethods {
  acceptEmployee(): Observable<void | Error>;
  rejectEmployee(): Observable<void | Error>;
}
