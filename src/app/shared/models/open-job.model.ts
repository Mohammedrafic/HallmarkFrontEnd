import { PageOfCollections } from '@shared/models/page.model';

export interface OpenJob {
  employeeId: string;
  id: number;
  skillId: number;
  skillName: string;
  startDate: string;
  endDate: string;
  jobDate: string;
  shiftStartDateTime: string;
  shiftEndDateTime: string;
  shiftId: number;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  orderType: number;
  isApplySelected: boolean;
  isApplyEnabled: boolean;
  isDeprtmentVisible: boolean;
  orderTypeName: string;
}

export type OpenJobPage = PageOfCollections<OpenJob>;
