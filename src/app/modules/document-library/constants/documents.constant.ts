import { ColDef, ICellRendererParams } from "@ag-grid-community/core";
import { DatePipe } from '@angular/common';
import { ColumnDefinitionModel } from "@shared/components/grid/models";
import { ActionCellrenderComponent } from "../components/cell-render/action-cellrender/action-cellrender.component";
import { StatusTextCellrenderComponent } from "../components/cell-render/status-text-cellrender/status-text-cellrender.component";
import { documentsColumnField, documentsColumnHeaderText, DocType } from "../enums/documents.enum";
import { valuesOnly } from "@shared/utils/enum.utils";
import { BusinessUnitType } from "@shared/enums/business-unit-type";

export const BUSINESS_UNITS_VALUES = Object.values(BusinessUnitType)
  .filter(valuesOnly)
  .map((text, id) => ({ text, id: id + 1 }));

export const DOCUMENT_TYPE_VALUES = Object.values(DocType)
  .filter(valuesOnly)
  .map((text, id) => ({ text, id: id + 1 }));

const commonColumn: ColDef = {
  sortable: true,
  resizable: true,
  filter: true,
}
export const DocumentLibraryColumnsDefinition = (actionCellParams: ICellRendererParams, datePipe?: DatePipe): ColumnDefinitionModel[] => {
  return [
    {
      headerName: '',
      width: 50,
      minWidth: 50,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      ...commonColumn,
    },
    {
      field: '',
      headerName: 'Action',
      cellRenderer: ActionCellrenderComponent,
      cellRendererParams: actionCellParams
    },
    {
      field: documentsColumnField.Id,
      headerName: documentsColumnHeaderText.Id,
      hide: true
    },
    {
      field: documentsColumnField.DocumentName,
      headerName: documentsColumnHeaderText.DocumentName,
      ...commonColumn,
      cellStyle: { color: '#3e7fff', fontWeight:'600'}

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
      cellRenderer: StatusTextCellrenderComponent,
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
      field: documentsColumnField.Role,
      headerName: documentsColumnHeaderText.Role,
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
