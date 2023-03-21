import { DataSourceItem } from '@core/interface';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { SortOrder } from '@shared/enums/sort-order-dropdown.enum';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { PageOfCollections } from '@shared/models/page.model';
import { DepartmentFiltersColumnsEnum } from '../enums';
import { EditDepartmentFields } from '../enums/edit-department.enum';

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
  startDate: string;
  endDate: string;
  isHomeCostCenter: boolean;
  orientationDate: string | null;
  extDepartmentId: string;
}

interface Skill {
  id: number;
  name: string;
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
  disabled?: boolean;
  required?: boolean;
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

export interface AssignDepartmentFormState {
  regionId: number;
  locationId: number;
  departmentId: number;
  startDate: Date;
  endDate: Date | null;
  isOriented: boolean;
  isHomeCostCenter: boolean;
}

export interface DepartmentFilterState {
  regionIds: number[];
  locationIds: number[];
  departmentsIds: number[];
  skillIds: number[];
  oriented: boolean;
  employeeWorkCommitmentId: number;
}
export interface EditDepartmentFormState {
  [EditDepartmentFields.START_DATE]: Date;
  [EditDepartmentFields.END_DATE]: Date;
  [EditDepartmentFields.IS_ORIENTED]: boolean;
  [EditDepartmentFields.ORIENTATION_DATE]?: Date;
}
export interface DepartmentHierarchy {
  organizationId: number;
  organizationName: string;
  organizationPrefix: string;
  regions: OrganizationRegion[];
}

export interface AssignDepartmentHierarchy {
  regions: OrganizationRegion[];
  locations: OrganizationLocation[];
  departments: OrganizationDepartment[];
}

export interface DepartmentPayload {
  forceUpdate: boolean;
  employeeWorkCommitmentId?: number;
  isOriented: boolean;
  startDate: string;
  endDate?: string;
  isHomeCostCenter?: boolean;
  orientationDate?: string;
  ids?: number[] | null;
  departmentId?: number;
  employeeId?: number;
}

export interface DepartmentConditions {
  showAllDepartments: boolean;
  disableBulkButton: boolean;
  noActiveWC: boolean;
}

export interface DateRanges {
  min?: Date;
  max?: Date;
}

export type DepartmentsPage = PageOfCollections<DepartmentAssigned>;
