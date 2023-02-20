import { DataSourceItem } from '@core/interface';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { SortOrder } from '@shared/enums/sort-order-dropdown.enum';
import { PageOfCollections } from '@shared/models/page.model';
import { DepartmentFiltersColumnsEnum } from '../enums';

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

export interface EditAssignedDepartment{
  assignedDepartmentIds: number[];
  startDate: Date | string;
  endDate: Date | string;
}

export interface AssignNewDepartment {
  regionId: number;
  locationId: number;
  departmentId: number;
  startDate: Date | string;
  endDate?: Date | string;
}

export interface DepartmentFilterFieldConfig {
  type: ControlTypes;
  title: string;
  field: DepartmentFiltersColumnsEnum;
  isShort?: boolean;
  showSelectAll?: boolean;
  sortOrder?: SortOrder;
  optionFields?: object;
}

export type DepartmentFiltersColumns =  {
  [key in DepartmentFiltersColumnsEnum ]:{
    type: ControlTypes;
    valueType: ValueType;
    dataSource?: DataSourceItem[];
    valueField?: string;
    valueId?: string;
  }
}

export interface DepartmentFilterState {
  regionId: number[];
  locationId: number[];
  departmentId: number[];
  startDate: Date | string;
  endDate: Date | string;
  both: boolean;
  oriented: boolean;
  notOriented: boolean;
}

export type DepartmentsPage = PageOfCollections<DepartmentAssigned>;
