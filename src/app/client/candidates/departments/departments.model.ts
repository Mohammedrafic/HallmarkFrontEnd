import { PageOfCollections } from '@shared/models/page.model';

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

export type DepartmentsPage = PageOfCollections<DepartmentAssigned>;
