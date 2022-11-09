import { ApplicantStatus } from "@shared/enums/applicant-status.enum";

export class CommonReportFilterOptions {    
      orderStatuses: OrderStatusDto[];
      candidateStatuses: {
        status: ApplicantStatus;
        statusText: string;
      }[];
      masterSkills: MasterSkillDto[];
      skillCategories: SkillCategoryDto[];
      agencies: AgencyDto[];
  }
  export class OrderStatusDto{
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
  }
  export class SearchCandidate{
    id:number;
    firstName:string;
    middleName:string|null;
    lastName:string;
    fullName:string;
  }
