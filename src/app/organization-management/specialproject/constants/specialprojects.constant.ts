import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { ColDef, DateFilter, ICellRendererParams } from '@ag-grid-community/core';
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
      headerName: PurchaseOrderHeaderText.POId,
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
      field: PurchaseOrderTableColumns.PODescription,
      headerName: PurchaseOrderHeaderText.PODescription,
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
      field: 'budget',
      headerName: PurchaseOrderHeaderText.Budget,
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
      ...commonColumn
    },
    {
      field: PurchaseOrderTableColumns.EndDate,
      headerName: PurchaseOrderHeaderText.EndDate,
      cellRenderer: (params: ICellRendererParams) => {
        const str = datePipe?.transform(params.value, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      ...commonColumn
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
      headerName: SpecialProjectHeaderText.ProjectId,
      hide: true
    },
    {
      field: SpecialProjectTableColumns.Category,
      headerName: SpecialProjectHeaderText.ProjectCategory,
      ...commonColumn,
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset']
      }
    },
    {
      field: SpecialProjectTableColumns.Name,
      headerName: SpecialProjectHeaderText.ProjectName,
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
      field: 'budget',
      headerName: PurchaseOrderHeaderText.Budget,
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
      ...commonColumn
    },
    {
      field: PurchaseOrderTableColumns.EndDate,
      headerName: PurchaseOrderHeaderText.EndDate,
      cellRenderer: (params: ICellRendererParams) => {
        const str = datePipe?.transform(params.value, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      ...commonColumn
    },
    {
      field: '',
      headerName: 'Action',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: actionCellParams
    }
  ];
};



