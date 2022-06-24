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
  inactiveDate: string;
}

export type DepartmentsPage = PageOfCollections<Department>;

export class DepartmentMapping {
  departmentId: number;
  departmentName?: string;
}

export class DepartmentFIlter {
  locationId?: number;
  externalIds?: string[];
  invoiceIds?: string[];
  departmentNames?: string[];
  facilityContacts?: string[];
  facilityEmails?: string[];
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
}
