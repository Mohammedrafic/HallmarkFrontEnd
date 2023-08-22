import { ColDef } from "@ag-grid-community/core";
import { IRPCandidate } from "@shared/components/candidate-list/types/candidate-list.model";

export interface ImportedEmployeeGrid {
    grids: EmployeeGrid[];
  }

  export interface EmployeeGrid {
    columnDefs: ColDef[];
    rowData: IRPCandidate[];
    gridName?: string;
  }

  export interface ImportedEmployee {
    isSubmit: boolean;
    employeeImport: ExtendedEmployee;
  }

  export type ExtendedEmployee = IRPCandidate & {
    errorProperties: string[];
  };

  export type EmployeeImportResult = {
    succesfullRecords: ImportedEmployee[];
    errorRecords: ImportedEmployee[];
  };
  

  export type EmployeeImportDto = {
    employeeID: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dOB: string;
    primarySkill: string;
    secondarySkill: string;
    classification: string;
    hireDate: string;
    fTE: string;
    hRCompanyCode: string;
    internalTransferRecruitment: string;
    contract: string;
    contractStartDate: string;
    contractEndDate: string;
    address: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    email: string;
    workEmail: string;
    cellphone: string;
    alternativePhone: string;
    professionalSummary: string;
    profileStatus: string;
    holdStartDate: string;
    holdEndDate: string;
    terminationDate: string;
    terminationReason: string;
    homeLocation: string;
    homeDepartment: string;
    workCommitment: string;
    errorProperties: string[];
}