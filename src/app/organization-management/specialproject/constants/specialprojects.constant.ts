import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { PurchaseOrderTableColumns, PurchaseOrderHeaderText, SpecialProjectTableColumns, SpecialProjectHeaderText } from '../enums/specialproject.enum';
import { ActionCellRendererComponent } from '../../../shared/components/cell-renderer/action-cellrenderer.component';
import { DatePipe } from '@angular/common';

const commonColumn: ColDef = {
  sortable: true,
  resizable: true,
  filter: true,
}

export const PurchaseOrdderColumnsDefinition = (actionCellParams: ICellRendererParams, datePipe?:DatePipe): ColumnDefinitionModel[] => {
  return [
    {
      field: PurchaseOrderTableColumns.Id,
      headerName: PurchaseOrderHeaderText.Id,
      hide:true
    },
    {
      field: PurchaseOrderTableColumns.POName,
      headerName: PurchaseOrderHeaderText.POName,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: PurchaseOrderTableColumns.PONumber,
      headerName: PurchaseOrderHeaderText.PONumber,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: PurchaseOrderTableColumns.Region,
      headerName: PurchaseOrderHeaderText.Region,
      ...commonColumn,
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: PurchaseOrderTableColumns.Location,
      headerName: PurchaseOrderHeaderText.Location,
      ...commonColumn,
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: PurchaseOrderTableColumns.SkillName,
      headerName: PurchaseOrderHeaderText.SkillName,
      ...commonColumn,
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: PurchaseOrderTableColumns.Department,
      headerName: PurchaseOrderHeaderText.Department,
      ...commonColumn,
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: PurchaseOrderTableColumns.ProjectBudget,
      headerName: PurchaseOrderHeaderText.ProjectBudget,
      ...commonColumn,
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: PurchaseOrderTableColumns.StartDate,
      headerName: PurchaseOrderHeaderText.StartDate,
      cellRenderer: (params: ICellRendererParams) => {
        const str = datePipe?.transform(params.value, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      ...commonColumn,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = datePipe?.transform(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);
          const cellDate = new Date(year, month, day);

          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        }
      }
    },
    {
      field: PurchaseOrderTableColumns.EndDate,
      headerName: PurchaseOrderHeaderText.EndDate,
      cellRenderer: (params: ICellRendererParams) => {
        const str = datePipe?.transform(params.value, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      ...commonColumn,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = datePipe?.transform(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        }
      }
    },
    {
      field: '',
      headerName: 'Action',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: actionCellParams
    }
  ];
};

export const SpecialProjectColumnsDefinition = (actionCellParams: ICellRendererParams, datePipe?: DatePipe): ColumnDefinitionModel[] => {
  return [
    {
      field: SpecialProjectTableColumns.Id,
      headerName: SpecialProjectHeaderText.Id,
      hide: true
    },
    {
      field: SpecialProjectTableColumns.ProjectTypeId,
      headerName: SpecialProjectHeaderText.ProjectTypeId,
      ...commonColumn,
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: SpecialProjectTableColumns.Name,
      headerName: SpecialProjectHeaderText.Name,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: "regionName",
      headerName: SpecialProjectHeaderText.Region,
      ...commonColumn,
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: SpecialProjectTableColumns.Location,
      headerName: SpecialProjectHeaderText.Location,
      ...commonColumn,
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: SpecialProjectTableColumns.SkillName,
      headerName: SpecialProjectHeaderText.SkillName,
      ...commonColumn,
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: SpecialProjectTableColumns.Department,
      headerName: SpecialProjectHeaderText.Department,
      ...commonColumn,
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: SpecialProjectTableColumns.ProjectBudget,
      headerName: SpecialProjectHeaderText.ProjectBudget,
      ...commonColumn,
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: SpecialProjectTableColumns.StartDate,
      headerName: SpecialProjectHeaderText.StartDate,
      cellRenderer: (params: ICellRendererParams) => {
        const str = datePipe?.transform(params.value, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      ...commonColumn,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        comparator: (filterLocalDateAtMidnight:Date, cellValue:string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = datePipe?.transform(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        }
      }
    },
    {
      field: SpecialProjectTableColumns.EndDate,
      headerName: SpecialProjectHeaderText.EndDate,
      cellRenderer: (params: ICellRendererParams) => {
        const str = datePipe?.transform(params.value, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      ...commonColumn,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = datePipe?.transform(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);
          const cellDate = new Date(year, month, day);

          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        }
      }
    },
    {
      field: '',
      headerName: 'Action',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: actionCellParams
    }
  ];
};



