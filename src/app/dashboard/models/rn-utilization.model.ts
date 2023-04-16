
import { OrganizationFilter } from "@shared/models/organization.model";

export interface GetWorkCommitment {
    id: number
    name: string
}

export interface GetNursingUtilizationbyByFilters {
  targetUtilization: number;
  todayDate: Date;
  workCommitmentIds: number[];
  skillIds: number[];
  organizationFilter: OrganizationFilter[] | null;
}

export interface GetNursingWidgetData {
    monthlyTotalHoursSchedule : number,
    noOfPerdiemNursing : number,
    perdayTotalHoursSchedule : number,
    targetPerdiemNursingHours : number
}
