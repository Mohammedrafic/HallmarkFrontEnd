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

export class DepartmentMapping {
  departmentId: number;
  departmentName?: string;
}
