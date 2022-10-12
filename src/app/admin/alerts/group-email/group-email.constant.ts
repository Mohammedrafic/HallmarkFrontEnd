import { ColDef, ICellRendererParams } from "@ag-grid-community/core";
import { DatePipe } from "@angular/common";
import { ButtonRendererComponent } from "@shared/components/button/button-renderer/button-renderer.component";
import { ColumnDefinitionModel } from "@shared/components/grid/models";
const commonColumn: ColDef = {
  sortable: true,
  resizable: true
}
export const GroupEmailColumnsDefinition = (actionCellParams: ICellRendererParams, datePipe?: DatePipe): ColumnDefinitionModel[] => [
    {
      field: 'Id',
      hide: true
    },      
    {
      headerName: 'View Mail',
      cellRenderer: ButtonRendererComponent,
      cellRendererParams: actionCellParams,
    },
    {
      headerName: 'Subject',
      field: 'subjectMail',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      ...commonColumn
    },
    {
      headerName: 'TO',
      field: 'toList',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      ...commonColumn
    },
    {
      headerName: 'CC',
      field: 'ccList',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      ...commonColumn
    },
    {
      headerName: 'Sent On',
      field: 'sentOn',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      ...commonColumn
    },
    {
      headerName: 'Sent By',
      field: 'sentBy',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      ...commonColumn
    }

  ];