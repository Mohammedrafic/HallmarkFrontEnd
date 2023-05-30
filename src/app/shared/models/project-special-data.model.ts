export interface ProjectSpecialData {
  specialProjectCategories: Array<{id: number; projectType: string;includeInIRP:boolean;includeInVMS:boolean;}>;
  projectNames: Array<{id: number; projectName: string;includeInIRP:boolean;includeInVMS:boolean;projectTypeId?:number;}>;
  poNumbers: Array<{id: number; poNumber: string}>;
}

