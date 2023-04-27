
import { FilteredDataByOrganizationId } from "./group-by-organization-filter-data.model";

export interface GetWorkCommitment {
    id: number
    name: string
}

export interface GetNursingUtilizationbyByFilters {
  targetUtilization: number;
  todayDate: Date;
  workCommitmentIds: number[];
  skillIds: number[];
  organizationFilter: FilteredDataByOrganizationId[] | null;
}

export interface GetNursingWidgetData {
    monthlyTotalHoursSchedule : number,
    noOfPerdiemNursing : number,
    perdayTotalHoursSchedule : number,
    targetPerdiemNursingHours : number
}
