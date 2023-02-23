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
  startDate: Date;
  endDate: Date;
}

interface Skill {
  id: number;
  name: string;
}

export interface EditAssignedDepartment {
  employeeWorkCommitmentId: number;
  startDate: Date | string;
  endDate: Date | string;
  orientedStartDate?: Date | string;
  homeCostCenter?: boolean;
  isOriented?: boolean;
}

export interface AssignNewDepartment {
  employeeWorkCommitmentId: number;
  isOriented: number;
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
  disabled?: boolean;
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
  [EditDepartmentFields.START_DATE]: Date;
  [EditDepartmentFields.END_DATE]: Date;
  [EditDepartmentFields.ORIENTED]: boolean;
  [EditDepartmentFields.HOME_COST_CENTER]: boolean;
  [EditDepartmentFields.ORIENTED_START_DATE]?: Date;
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

export interface EditDepartmentPayload {
  isOriented?: true | undefined;
  homeCostCenter?: true | undefined;
  orientedStartDate?: string | undefined;
  employeeWorkCommitmentId: number;
  startDate: string;
  endDate: string;
  ids: number[] | null;
}

export interface NewDepartmentPayload {
  employeeWorkCommitmentId: number;
  departmentId: number;
  isOriented: boolean;
  startDate: string;
  endDate: string | undefined;
}

export type DepartmentsPage = PageOfCollections<DepartmentAssigned>;
