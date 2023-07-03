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
  