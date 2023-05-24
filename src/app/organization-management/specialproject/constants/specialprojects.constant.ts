import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import {
  PurchaseOrderTableColumns, PurchaseOrderHeaderText,
  SpecialProjectTableColumns, SpecialProjectHeaderText,
  SpecilaProjectCategoryTableColumns, SpecilaProjectCategoryHeaderText,
  SpecilaProjectMappingTableColumns, SpecilaProjectMappingHeaderText,
  PurchaseOrderMappingTableColumns, PurchaseOrderMappingHeaderText,
} from '../enums/specialproject.enum';

import { DatePipe } from '@angular/common';
import { ActionCellRendererComponent } from '@shared/components/cell-renderers/actions-cell/action-cellrenderer.component';

const commonColumn: ColDef = {
  sortable: true,
  resizable: true,
  filter: true,
};

export const PurchaseOrdderColumnsDefinition = (
  actionCellParams: ICellRendererParams, datePipe?: DatePipe): ColumnDefinitionModel[] => {
  return [
    {
      field: '',
      headerName: 'Action',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: actionCellParams,
    },
    {
      field: PurchaseOrderTableColumns.Id,
      headerName: PurchaseOrderHeaderText.Id,
      hide: true,
    },
    {
      field: PurchaseOrderTableColumns.POName,
      headerName: PurchaseOrderHeaderText.POName,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: PurchaseOrderTableColumns.PONumber,
      headerName: PurchaseOrderHeaderText.PONumber,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: PurchaseOrderTableColumns.ProjectBudget,
      headerName: PurchaseOrderHeaderText.ProjectBudget,
      type: 'rightAligned',
      ...commonColumn,
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: PurchaseOrderTableColumns.StartDate,
      headerName: PurchaseOrderHeaderText.StartDate,
      cellRenderer: (params: ICellRendererParams) => {
        const str = datePipe?.transform(params.value, 'MM/dd/yyyy') as string;
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
          const dateAsString = datePipe?.transform(cellValue, 'MM/dd/yyyy') as string;
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
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY',
      },
    },
    {
      field: PurchaseOrderTableColumns.EndDate,
      headerName: PurchaseOrderHeaderText.EndDate,
      cellRenderer: (params: ICellRendererParams) => {
        const str = datePipe?.transform(params.value, 'MM/dd/yyyy') as string;
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
          const dateAsString = datePipe?.transform(cellValue, 'MM/dd/yyyy') as string;
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
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY',
      },
    },
  ];
};

export const SpecialProjectColumnsDefinition = (actionCellParams: ICellRendererParams, datePipe?: DatePipe): ColumnDefinitionModel[] => {
  return [
    {
      field: '',
      headerName: 'Action',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: actionCellParams,
    },
    {
      field: SpecialProjectTableColumns.Id,
      headerName: SpecialProjectHeaderText.Id,
      hide: true,
    },
    {
      field: SpecialProjectTableColumns.ProjectTypeName,
      headerName: SpecialProjectHeaderText.ProjectTypeName,
      ...commonColumn,
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: SpecialProjectTableColumns.Name,
      headerName: SpecialProjectHeaderText.Name,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: SpecialProjectTableColumns.ProjectBudget,
      headerName: SpecialProjectHeaderText.ProjectBudget,
      type: 'rightAligned',
      ...commonColumn,
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: SpecialProjectTableColumns.StartDate,
      headerName: SpecialProjectHeaderText.StartDate,
      cellRenderer: (params: ICellRendererParams) => {
        const str = datePipe?.transform(params.value, 'MM/dd/yyyy') as string;
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
          const dateAsString = datePipe?.transform(cellValue, 'MM/dd/yyyy') as string;
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
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY',
      },
    },
    {
      field: SpecialProjectTableColumns.EndDate,
      headerName: SpecialProjectHeaderText.EndDate,
      cellRenderer: (params: ICellRendererParams) => {
        const str = datePipe?.transform(params.value, 'MM/dd/yyyy') as string;
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
          const dateAsString = datePipe?.transform(cellValue, 'MM/dd/yyyy') as string;
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
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY',
      },
    },
    {
      field: SpecilaProjectCategoryTableColumns.System,
      headerName: SpecilaProjectCategoryHeaderText.System,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
  ];
};

export const SpecialProjectCategoryColumnsDefinition = (actionCellParams: ICellRendererParams): ColumnDefinitionModel[] => {
  return [
    {
      field: '',
      headerName: 'Action',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: actionCellParams,
    },
    {
      field: SpecilaProjectCategoryTableColumns.Id,
      headerName: SpecilaProjectCategoryHeaderText.Id,
      hide: true,
    },
    {
      field: SpecilaProjectCategoryTableColumns.Name,
      headerName: SpecilaProjectCategoryHeaderText.Name,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: SpecilaProjectCategoryTableColumns.System,
      headerName: SpecilaProjectCategoryHeaderText.System,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
  ];
};

export const SpecialProjectMappingColumnsDefinition = (actionCellParams: ICellRendererParams): ColumnDefinitionModel[] => {
  return [
    {
      field: '',
      headerName: 'Action',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: actionCellParams,
    },
    {
      field: SpecilaProjectMappingTableColumns.Id,
      headerName: SpecilaProjectMappingHeaderText.Id,
      hide: true,
    },
    {
      field: SpecilaProjectMappingTableColumns.OrderSpecialProjectCategoryName,
      headerName: SpecilaProjectMappingHeaderText.CategoryName,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: SpecilaProjectMappingTableColumns.OrderProjectName,
      headerName: SpecilaProjectMappingHeaderText.ProjectName,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: SpecilaProjectMappingTableColumns.RegionName,
      headerName: SpecilaProjectMappingHeaderText.RegionName,
      ...commonColumn,
      cellRenderer: (params: ICellRendererParams) => {
        const str = params.value == null ? 'All' : params.value;
        return str;
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: SpecilaProjectMappingTableColumns.LocationName,
      headerName: SpecilaProjectMappingHeaderText.LocationName,
      ...commonColumn,
      cellRenderer: (params: ICellRendererParams) => {
        const str = params.value == null ? 'All' : params.value;
        return str;
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: SpecilaProjectMappingTableColumns.DepartmentName,
      headerName: SpecilaProjectMappingHeaderText.DepartmentName,
      ...commonColumn,
      cellRenderer: (params: ICellRendererParams) => {
        const str = params.value == null ? 'All' : params.value;
        return str;
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: SpecilaProjectMappingTableColumns.SkillNames,
      headerName: SpecilaProjectMappingHeaderText.SkillName,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: SpecilaProjectCategoryTableColumns.System,
      headerName: SpecilaProjectCategoryHeaderText.System,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
  ];
};

export const PurchaseOrderMappingColumnsDefinition = (actionCellParams: ICellRendererParams): ColumnDefinitionModel[] => {
  return [
    {
      field: '',
      headerName: 'Action',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: actionCellParams,
    },
    {
      field: PurchaseOrderMappingTableColumns.Id,
      headerName: PurchaseOrderMappingHeaderText.Id,
      hide: true,
    },
    {
      field: PurchaseOrderMappingTableColumns.OrderPoName,
      headerName: PurchaseOrderMappingHeaderText.PoName,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: PurchaseOrderMappingTableColumns.RegionName,
      headerName: PurchaseOrderMappingHeaderText.RegionName,
      ...commonColumn,
      cellRenderer: (params: ICellRendererParams) => {
        const str = params.value == null ? 'All' : params.value;
        return str;
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: PurchaseOrderMappingTableColumns.LocationName,
      headerName: PurchaseOrderMappingHeaderText.LocationName,
      ...commonColumn,
      cellRenderer: (params: ICellRendererParams) => {
        const str = params.value == null ? 'All' : params.value;
        return str;
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: PurchaseOrderMappingTableColumns.DepartmentName,
      headerName: PurchaseOrderMappingHeaderText.DepartmentName,
      ...commonColumn,
      cellRenderer: (params: ICellRendererParams) => {
        const str = params.value == null ? 'All' : params.value;
        return str;
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
    {
      field: PurchaseOrderMappingTableColumns.SkillNames,
      headerName: PurchaseOrderMappingHeaderText.SkillName,
      ...commonColumn,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
      },
    },
  ];
};

export const SpecialProjectMessages = {
  NoRowsMessage: 'No Rows To Show',
};
