import { PageOfCollections } from '@shared/models/page.model';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';

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
  title: string;
  positionId: string;
  duration: number;
  orderTypeName: string;
  status: CandidatStatus;
  jobId?: number | null;
  statusName?: string | null;
  durationText?: string;
}

export type OpenJobPage = PageOfCollections<OpenJob>;
