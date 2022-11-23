import { ApplicantStatus } from "@shared/enums/applicant-status.enum";

export class JobDetailSummaryReportFilterOptions {
  orderStatuses: {
    status: string;
    statusText: string;
  }[];
  candidateStatuses: {
    status: ApplicantStatus;
    statusText: string;
  }[];
  masterSkills: {
    id: number;
    organizationid?: number;
    skillCategoryId: number;
    Name: string;
    Description: string;
    Abbr: string;
  }[];
  skillCategories: {
    id: number;
    name: string;
  }[];
}
export class JobDetailSummaryFilter {
  businessUnitIds: number[]
}
