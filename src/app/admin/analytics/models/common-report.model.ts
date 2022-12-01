import { ApplicantStatus } from "@shared/enums/applicant-status.enum";
import { OrderStatus } from "@shared/enums/order-management";

export class CommonReportFilterOptions {    
      orderStatuses: OrderStatusDto[];
      jobStatuses: JobStatusDto[];
      candidateStatuses: {
        status: ApplicantStatus;
        statusText: string;
      }[];
      masterSkills: MasterSkillDto[];
      skillCategories: SkillCategoryDto[];
      agencies: AgencyDto[];
  }
  export class JobStatusDto{
    status: OrderStatus;
    statusText: string;
  }
  export class OrderStatusDto{
    id:number;
    status: string;
    statusText: string;
  }
  export class CandidateStatusDto{
    status: ApplicantStatus;
    statusText: string;
  }
  export class MasterSkillDto{
    id:number;
    organizationid?:number;
    skillCategoryId:number;
    Name:string;
    Description:string;
    Abbr:string;       
  }
  export class SkillCategoryDto{
    id: number;
    name: string;
}
export class AgencyDto {
  agencyId: number;
  agencyName: string;
}
  export class CommonReportFilter {
    businessUnitIds: number[]
  }
  export class CommonCandidateSearchFilter{
    searchText:string;
    businessUnitIds:number[]|null;
  }
  export class SearchCandidate{
    id:number;
    firstName:string;
    middleName:string|null;
    lastName:string;
    fullName:string;
  }
