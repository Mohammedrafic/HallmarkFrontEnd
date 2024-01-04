import { ColDef } from "@ag-grid-community/core";

import { GridErroredCellComponent } from "@shared/components/import-dialog-content/grid-errored-cell/grid-errored-cell.component";
import { ImportedDepartment } from '@shared/models/department.model';
import { ImportResult } from '@shared/models/import.model';
import { ImportedOrder } from '@shared/models/imported-order.model';
import { ImportedLocation } from '@shared/models/location.model';

// eslint-disable-next-line max-lines-per-function
export const DepartmentsColumns = (isIRPEnabled: boolean, isInvoiceDepartmentIdFieldShow: boolean,
  data: ImportResult<ImportedLocation & ImportedDepartment & ImportedOrder> | null): ColDef[] => {
  let result = [
    {
      field: 'orgName',
      width: 150,
      headerName: 'Organization',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'region',
      width: 150,
      headerName: 'Region',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'location',
      width: 200,
      headerName: 'Location',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'departmentName',
      width: 200,
      headerName: 'Department Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'extDepartmentId',
      width: 200,
      headerName: 'Ext Department ID',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'facilityContact',
      width: 150,
      headerName: 'Department Contact',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'facilityEmail',
      width: 150,
      headerName: 'Department Email',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'facilityPhoneNo',
      width: 200,
      headerName: 'Department Phone Number',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'inactiveDate',
      width: 150,
      headerName: 'Inactive Date',
      cellRenderer: GridErroredCellComponent,
    },
  ];

  if (isInvoiceDepartmentIdFieldShow) {
    result.splice(5, 0, {
      field: 'invoiceDepartmentId',
      width: 200,
      headerName: 'Invoice Department ID',
      cellRenderer: GridErroredCellComponent,
    });
  }

  if (isIRPEnabled) {
    result.push({
      field: 'includeInIRP',
      width: 150,
      headerName: 'INCLUDE IN IRP',
      cellRenderer: GridErroredCellComponent,
    });
  }

  if (isIRPEnabled) {
    const records = data?.succesfullRecords.length && data.succesfullRecords || data?.errorRecords;

    // Find record which has longest skills array and create coldefs based on it's length with generic field name. 
    if (records) {
      const primarySkillLength = records
      .filter((record) => !!record.primarySkills.length)
      .map((record) => record.primarySkills?.length);
      const secondarySkillLength = records
      .filter((record) => !!record.secondarySkills?.length)
      .map((record) => record.secondarySkills?.length);
  
      if (primarySkillLength && primarySkillLength.length) {
        const longestLengthSkillsIndex = primarySkillLength.indexOf(Math.max(...primarySkillLength));
        const cols = records[longestLengthSkillsIndex].primarySkills.map((skillName, index) => ({
          field: `primarySkill${index}`,
          width: 180,
          headerName: 'Primary Skill',
          cellRenderer: GridErroredCellComponent,
        }));
    
        result = result.concat(cols as []);
      }
  
      if (secondarySkillLength) {
        const longestLengthSkillsIndex = secondarySkillLength.indexOf(Math.max(...secondarySkillLength));
        const cols = records[longestLengthSkillsIndex].secondarySkills.map((skillName, index) => ({
          field: `secondarySkill${index}`,
          width: 180,
          headerName: 'Secondary Skill',
          cellRenderer: GridErroredCellComponent,
        }));
    
        result = result.concat(cols as []);
      }
    }
  }

  return result;
};
