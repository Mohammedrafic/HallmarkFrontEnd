import { DataSourceItem } from '@core/interface';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { SortOrder } from '@shared/enums/sort-order-dropdown.enum';
import { PageOfCollections } from '@shared/models/page.model';
import { DepartmentFiltersColumnsEnum } from '../enums';
import { EditDepartmentFieldsEnum } from '../enums/edit-department.enum';

export interface DepartmentAssigned {
  id: number;
  employeeId: number;
  departmentId: number;
  departmentName: string;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  skillType: number;
  skills: Skill[];
  isOriented: boolean;
  startDate: Date;
  endDate: Date;
}

interface Skill {
  id: number;
  name: string;
}

export interface EditAssignedDepartment {
  startDate: Date | string;
  endDate: Date | string;
  orientedStartDate?: Date | string;
  homeCostCenter?: boolean;
  isOriented?: boolean
}

export interface AssignNewDepartment {
  regionId: number;
  locationId: number;
  departmentId: number;
  startDate: Date | string;
  endDate?: Date | string;
}

export interface DepartmentFormFieldConfig<T> {
  type: ControlTypes;
  title: string;
  field: T;
  isShort?: boolean;
  showSelectAll?: boolean;
  sortOrder?: SortOrder;
  optionFields?: object;
  show?: boolean;
}

export type DepartmentFiltersColumns = {
  [key in DepartmentFiltersColumnsEnum]: {
    type: ControlTypes;
    valueType: ValueType;
    dataSource?: DataSourceItem[];
    valueField?: string;
    valueId?: string;
  };
};

export interface DepartmentFilterState {
  regionId: number[];
  locationId: number[];
  departmentId: number[];
  skills: number[];
  oriented: boolean;
}

export interface EditDepartmentFormState {
  [EditDepartmentFieldsEnum.START_DATE]: Date;
  [EditDepartmentFieldsEnum.END_DATE]: Date;
  [EditDepartmentFieldsEnum.ORIENTED]: boolean;
  [EditDepartmentFieldsEnum.HOME_COST_CENTER]: boolean;
  [EditDepartmentFieldsEnum.ORIENTED_START_DATE]?: Date;
}

export type DepartmentsPage = PageOfCollections<DepartmentAssigned>;
