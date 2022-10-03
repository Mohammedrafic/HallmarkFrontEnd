import { ColDef, ICellRendererParams } from "@ag-grid-community/core";
import { DatePipe } from '@angular/common';
import { ColumnDefinitionModel } from "@shared/components/grid/models";
import { documentsColumnField, documentsColumnHeaderText } from "../enums/documents.enum";

const commonColumn: ColDef = {
  sortable: true,
  resizable: true,
  filter: true,
}
export const DocumentLibraryColumnsDefinition = (actionCellParams: ICellRendererParams, datePipe?: DatePipe): ColumnDefinitionModel[] => {
  return [
    {
      field: documentsColumnField.Id,
      headerName: documentsColumnHeaderText.Id,
      hide: true
    },
    {
      field: documentsColumnField.DocumentName,
      headerName: documentsColumnHeaderText.DocumentName,
      ...commonColumn
    },
    {
      field: documentsColumnField.Organization,
      headerName: documentsColumnHeaderText.Organization,
      ...commonColumn,
    },
    {
      field: documentsColumnField.Status,
      headerName: documentsColumnHeaderText.Status,
      ...commonColumn,
    },
    {
      field: documentsColumnField.Region,
      headerName: documentsColumnHeaderText.Region,
      ...commonColumn
    },
    {
      field: documentsColumnField.Location,
      headerName: documentsColumnHeaderText.Location,
      ...commonColumn,
    },
    {
      field: documentsColumnField.Type,
      headerName: documentsColumnHeaderText.Type,
      ...commonColumn,
    },
    {
      field: documentsColumnField.Tags,
      headerName: documentsColumnHeaderText.Tags,
      ...commonColumn,
    },
    {
      field: documentsColumnField.StartDate,
      headerName: documentsColumnHeaderText.StartDate,
      ...commonColumn,
    },
    {
      field: documentsColumnField.EndDate,
      headerName: documentsColumnHeaderText.EndDate,
      ...commonColumn,
    },
    {
      field: documentsColumnField.SharedWith,
      headerName: documentsColumnHeaderText.SharedWith,
      ...commonColumn,
    },
    {
      field: documentsColumnField.Comments,
      headerName: documentsColumnHeaderText.Comments,
      ...commonColumn,
    },
  ];
};
