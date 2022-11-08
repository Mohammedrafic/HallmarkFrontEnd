import { ApplicantStatus } from "@shared/enums/applicant-status.enum";

export class FinancialTimeSheetReportFilterOptions {    
      orderStatuses: {
        status: string;
        statusText: string;
      }[];
      candidateStatuses: {
        status: ApplicantStatus;
        statusText: string;
      }[];
      masterSkills: {
        id:number;
        organizationid?:number;
        skillCategoryId:number;
        Name:string;
        Description:string;
        Abbr:string;        
      }[];
      skillCategories: {
        id: number;
        name: string;
      }[];
  }
  export class FinancialTimeSheetFilter {
    businessUnitIds: number[]
  }
  export class FinancialCandidateSearchFilter{
    searchText:string;
  }
  export class SearchCandidate{
    id:number;
    firstName:string;
    middleName:string|null;
    lastName:string;
    fullName:string;
  }
