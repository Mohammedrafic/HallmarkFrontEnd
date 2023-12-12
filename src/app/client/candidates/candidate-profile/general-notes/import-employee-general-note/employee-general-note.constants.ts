import { ColDef } from "@ag-grid-community/core";
import { GridErroredCellListComponent } from "@shared/components/import-dialog-content/grid-errored-cell-list/grid-errored-cell-list.component";
import { GridErroredCellComponent } from "@shared/components/import-dialog-content/grid-errored-cell/grid-errored-cell.component";

export const EmployeesGeneralNoteColumnsConfig: ColDef[] = [
    {
      field: 'employeeID',
      width: 200,
      headerName: 'Employee ID',
      resizable: true,
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'employeeName',
      width: 200,
      headerName: 'Employee Name',
      resizable: true,
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'date',
      width: 100,
      headerName: 'Date',
      resizable: true,
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'category',
      width: 150,
      headerName: 'Category',
      resizable: true,
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'note',
      width: 250,
      headerName: 'Note',
      resizable: true,
      cellRenderer: GridErroredCellComponent,
    },
   
      
  ];
  


  export const EmployeesGeneralNoteErrorColumnsConfig: ColDef[] = [
    {
      field: 'employeeID',
      width: 100,
      headerName: 'Employee ID',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'employeeName',
      width: 100,
      headerName: 'Employee Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'date',
      width: 100,
      headerName: 'Date',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'category',
      width: 100,
      headerName: 'Category',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'note',
      width: 200,
      headerName: 'Note',
      cellRenderer: GridErroredCellComponent,
    },
    {
        field: 'errorDescriptions',
        resizable: true,
        autoHeight:true,
        suppressSizeToFit:true,
        headerName: 'Error Description',
        cellRenderer: GridErroredCellListComponent,

      },
      
  ];