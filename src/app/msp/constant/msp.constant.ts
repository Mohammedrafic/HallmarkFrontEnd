import { ColDef, ICellRendererParams } from "@ag-grid-community/core";
import { ColumnDefinitionModel } from "@shared/components/grid/models";
import { TableStatusCellComponent } from "@shared/components/table-status-cell/table-status-cell.component";
import { AgencyStatus } from "@shared/enums/status";
import { ActionCellrenderComponent } from "src/app/modules/document-library/components/cell-render/action-cellrender/action-cellrender.component";
import { StatusTextCellrenderComponent } from "src/app/modules/document-library/components/cell-render/status-text-cellrender/status-text-cellrender.component";
import { MspactionCellrenderComponent } from "../cell-render/mspaction-cellrender/mspaction-cellrender.component";

const commonColumn: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  }

  export enum MspListColumnField {
    Id = 'id',
    Name = 'name',
    Status = 'status',
    TaxId = 'taxId',
    NetSuiteId = 'netSuiteId',
    linkedAgencyId='linkedAgencyId',
    linkedAgencyName = 'linkedAgencyName',
    LinkedAgencyNetSuiteId = 'linkedAgencyNetSuiteId'
  }

  export enum MspListColumnHeaderText {
    Id = 'Id',
    Name = 'Name',
    Status = 'Status',
    TaxId = 'Tax Id',
    NetSuiteId = 'Netsuite Id',
    LinkedAgency = 'Linked Agency',
    LinkedAgencyNetSuiteId = 'Linked Agency Netsuite Id'
  }

  export const MspListColumnsDefinition = (): ColumnDefinitionModel[] => {
    return [
      {
        headerName: '',
        width: 50,
        minWidth: 50,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: function (params: any) {
          if (params.data.isSharedWithMe || params.data.status == 'Inactive') {
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
        headerName: '',
        cellRenderer: MspactionCellrenderComponent,        
        sortable: false,
        resizable: false,
        filter: false,
        maxWidth:150
      },
      
      {
        field: MspListColumnField.Id,
        headerName: MspListColumnHeaderText.Id,
        hide: true,
        sortable: true,
        resizable: false,
        filter: false,
      },
      
      {
        field: MspListColumnField.Name,
        headerName: MspListColumnHeaderText.Name,
        ...commonColumn,
        //cellStyle: { color: '#3e7fff', fontWeight: '600', cursor:'pointer' }
      },
      {
      field: MspListColumnField.Status,
      headerName:MspListColumnHeaderText.Status,
      minWidth: 170,
      cellRenderer: TableStatusCellComponent,
      cellClass: 'status-cell',
      ...commonColumn,
    },  
      {
        field: MspListColumnField.TaxId,
        headerName: MspListColumnHeaderText.TaxId,
        ...commonColumn,
      },
      {
        field: MspListColumnField.NetSuiteId,
        headerName: MspListColumnHeaderText.NetSuiteId,
        ...commonColumn
      },
      {
        field: MspListColumnField.linkedAgencyName,
        headerName: MspListColumnHeaderText.LinkedAgency,
        ...commonColumn,
      },
      {
        field: MspListColumnField.LinkedAgencyNetSuiteId,
        headerName: MspListColumnHeaderText.LinkedAgencyNetSuiteId,
        ...commonColumn,
      }    
    ];
  }; 

export class MspListDto {
    id: number;
    name: string;    
    netSuiteId?: string | null;
    linkedAgencyId: number|null;
    linkedAgencyName?: string | null;
    LinkedAgencyNetSuiteId?: string | null;
    taxId: string;
    status: AgencyStatus;
  }