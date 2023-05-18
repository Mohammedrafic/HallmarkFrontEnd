import { ColDef, ICellRendererParams } from "@ag-grid-community/core";
import { DatePipe } from '@angular/common';
import { ColumnDefinitionModel } from "@shared/components/grid/models";
import { ActionCellrenderComponent } from "../components/cell-render/action-cellrender/action-cellrender.component";
import { StatusTextCellrenderComponent } from "../components/cell-render/status-text-cellrender/status-text-cellrender.component";
import { documentsColumnField, documentsColumnHeaderText, DocType } from "../enums/documents.enum";
import { valuesOnly } from "@shared/utils/enum.utils";
import { BusinessUnitType } from "@shared/enums/business-unit-type";

export const UNIT_FIELDS = {
  text: 'text',
  value: 'id',
};

export const DISABLED_GROUP = [BusinessUnitType.Agency, BusinessUnitType.Organization];

export const BUSSINES_DATA_FIELDS = {
  text: 'name',
  value: 'id',
};

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
      checkboxSelection: function (params: any) {
        if (params.data.isSharedWithMe) {
          return false;
        }
        return true;
      },
      sortable: false,
      resizable: false,
      filter: false,
    },
    {
      field: '',
      headerName: 'Action',
      cellRenderer: ActionCellrenderComponent,
      cellRendererParams: actionCellParams,
      sortable: false,
      resizable: false,
      filter: false,
    },
    {
      field: documentsColumnField.Id,
      headerName: documentsColumnHeaderText.Id,
      hide: true,
      sortable: true,
      resizable: false,
      filter: false,
    },
    // {
    //   field: documentsColumnField.FileName,
    //   headerName: documentsColumnHeaderText.FileName,
    //   ...commonColumn,
    //   cellStyle: { color: '#3e7fff', fontWeight: '600', cursor:'pointer' }
    // },
    {
      field: documentsColumnField.Name,
      headerName: documentsColumnHeaderText.Name,
      ...commonColumn,
      cellStyle: { color: '#3e7fff', fontWeight: '600', cursor:'pointer' }
    },
    {
      field: documentsColumnField.Status,
      headerName: documentsColumnHeaderText.Status,
      ...commonColumn,
      cellRenderer: StatusTextCellrenderComponent
    },
   
    {
      field: documentsColumnField.FolderName,
      headerName: documentsColumnHeaderText.FolderName,
      ...commonColumn,
    },
    {
      field: documentsColumnField.OrganizationName,
      headerName: documentsColumnHeaderText.OrganizationName,
      ...commonColumn
    },
    {
      field: documentsColumnField.RegionName,
      headerName: documentsColumnHeaderText.RegionName,
      ...commonColumn,
    },
    {
      field: documentsColumnField.LocationName,
      headerName: documentsColumnHeaderText.LocationName,
      ...commonColumn,
    },
    {
      field: documentsColumnField.DocTypeName,
      headerName: documentsColumnHeaderText.DocTypeName,
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
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      }
    },
    {
      field: documentsColumnField.EndDate,
      headerName: documentsColumnHeaderText.EndDate,
      ...commonColumn,
      cellRenderer: (params: ICellRendererParams) => {
        const str = datePipe?.transform(params.value, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
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
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
    },
    {
      field: documentsColumnField.Comments,
      headerName: documentsColumnHeaderText.Comments,
      ...commonColumn,
    },
  ];
};

export const DocumentLibraryColumnsAgencyDefinition = (actionCellParams: ICellRendererParams, datePipe?: DatePipe): ColumnDefinitionModel[] => {
  return [
    {
      headerName: '',
      width: 50,
      minWidth: 50,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: function (params: any) {
        if (params.data.isSharedWithMe) {
          return false;
        }
        return true;
      },
      sortable: false,
      resizable: false,
      filter: false,
    },
    {
      field: '',
      headerName: 'Action',
      cellRenderer: ActionCellrenderComponent,
      cellRendererParams: actionCellParams,
      sortable: false,
      resizable: false,
      filter: false,
    },
    {
      field: documentsColumnField.Id,
      headerName: documentsColumnHeaderText.Id,
      hide: true,
      sortable: true,
      resizable: false,
      filter: false,
    },
    // {
    //   field: documentsColumnField.FileName,
    //   headerName: documentsColumnHeaderText.FileName,
    //   ...commonColumn,
    //   cellStyle: { color: '#3e7fff', fontWeight: '600', cursor:'pointer' }
    // },
    {
      field: documentsColumnField.Name,
      headerName: documentsColumnHeaderText.Name,
      ...commonColumn,
      cellStyle: { color: '#3e7fff', fontWeight: '600', cursor:'pointer' }
    },
    {
      field: documentsColumnField.Status,
      headerName: documentsColumnHeaderText.Status,
      ...commonColumn,
      cellRenderer: StatusTextCellrenderComponent
    },
   
    {
      field: documentsColumnField.FolderName,
      headerName: documentsColumnHeaderText.FolderName,
      ...commonColumn,
    },
    {
      field: documentsColumnField.OrganizationName,
      headerName: documentsColumnHeaderText.OrganizationName,
      ...commonColumn
    },
    {
      field: documentsColumnField.DocTypeName,
      headerName: documentsColumnHeaderText.DocTypeName,
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
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      }
    },
    {
      field: documentsColumnField.EndDate,
      headerName: documentsColumnHeaderText.EndDate,
      ...commonColumn,
      cellRenderer: (params: ICellRendererParams) => {
        const str = datePipe?.transform(params.value, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
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
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
    },
    {
      field: documentsColumnField.Comments,
      headerName: documentsColumnHeaderText.Comments,
      ...commonColumn,
    },
  ];
};

