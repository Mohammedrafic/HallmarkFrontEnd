import { PageOfCollections } from "./page.model";

export class Department {
  departmentId?: number;
  locationId?: number;
  extDepartmentId: string;
  invoiceDepartmentId: string;
  departmentName: string;
  facilityContact: string;
  facilityEmail: string;
  facilityPhoneNo: string;
  inactiveDate: string | null;
  reactivateDate: string | null;
  unitDescription: string;
  includeInIRP?: boolean;
  locationIncludeInIRP?: boolean;
}

export type DepartmentsPage = PageOfCollections<Department>;

export class DepartmentMapping {
  departmentId: number;
  departmentName?: string;
}

export class DepartmentFilter {
  locationId?: number;
  externalIds?: string[];
  invoiceIds?: string[];
  departmentNames?: string[];
  facilityContacts?: string[];
  facilityEmails?: string[];
  includeInIRP?: string;
  inactiveDate?: Date;
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
}

export class DepartmentFilterOptions {
  externalIds: string[];
  ivnoiceIds: string[];
  departmentNames: string[];
  facilityContacts: string[];
  facilityEmails: string[];
  includeInIRP?: string[];
}

export type ImportedDepartment = {
  orgName: string;
  region: string;
  location: string;
  departmentName: string;
  extDepartmentId: string;
  invoiceDepartmentId: string;
  facilityContact: string;
  facilityEmail: string;
  facilityPhoneNo: string;
  inactiveDate: string;
  errorProperties: string[];
}
export class DepartmentsByLocationsFilter {
  ids?: number[];
  businessUnitIds?:number[];
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
  getAll?:boolean;
}
