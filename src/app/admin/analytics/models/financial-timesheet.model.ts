
export class FinancialTimeSheetReportFilterOptions {    
      orderStatuses: {
        status: number;
        statusText: string;
      }[];
      candidateStatuses: {
        status: number;
        statusText: string;
      }[];
      masterSkills: {
        id:number;
        businessUnitId?:number;
        skillCategoryId:number;
        skillAbbr:string;
        skillDescription:string;
      }[];
      skillCategories: {
        id: number;
        name: string;
      }[];
  }
  export class FinancialTimeSheetFilter {
    businessUnitIds:number[]
  }