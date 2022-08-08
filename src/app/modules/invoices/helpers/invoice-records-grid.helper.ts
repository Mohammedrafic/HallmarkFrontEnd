import {
  ColDef,
  GetDetailRowDataParams,
  GridOptions, ICellRendererParams,
  IDetailCellRendererParams, RowHeightParams,
  ValueGetterParams
} from '@ag-grid-community/core';
import {
  TitleValueCellRendererComponent
} from '@shared/components/grid/components/title-value-cell-renderer/title-value-cell-renderer.component';
import { InvoiceRecord, InvoiceRecordTimesheetEntry } from '../interfaces';
import { BillRateType } from '@shared/models';
import {
  InvoiceRecordsTableRowDetailsComponent
} from '../components/invoice-records-table-row-details/invoice-records-table-row-details.component';
import { ToggleRowExpansionHeaderCellComponent } from '../components/grid-icon-cell/toggle-row-expansion-header-cell.component';
import { GridValuesHelper } from '../../timesheets/helpers';
import { GridCellLinkComponent } from '@shared/components/grid/components/grid-cell-link/grid-cell-link.component';
import { GridCellLinkParams } from '@shared/components/grid/models';
import { Attachment, AttachmentsListComponent, AttachmentsListParams } from '@shared/components/attachments';

export class InvoiceRecordsGridHelper {
  public static getRowNestedGridOptions(): GridOptions {
    return {
      masterDetail: true,
      detailCellRenderer: InvoiceRecordsTableRowDetailsComponent,
      animateRows: true,
      getRowHeight: (params: RowHeightParams) => {
        if (params?.node?.detail) {
          const data = params.data as InvoiceRecord;
          return data.timesheetRecords.length * params.api.getSizesForCurrentTheme().rowHeight + 1;
        }

        return null;
      },
      detailCellRendererParams: {
        detailGridOptions: {
          columnDefs: InvoiceRecordsGridHelper.getRowDetailsColumnDefinitions(),
        },
        getDetailRowData: (params: GetDetailRowDataParams) => {
          params.successCallback(
            (params.data as InvoiceRecord).timesheetRecords
          );
        },
      } as IDetailCellRendererParams,
    };
  }

  public static getRowDetailsColumnDefinitions(): ColDef[] {
    return [
      {
        width: 140,
      },
      {
        width: 80,
        cellRenderer: TitleValueCellRendererComponent,
        valueGetter: (params: ValueGetterParams) => {
          const data = params.data as InvoiceRecordTimesheetEntry;

          return GridValuesHelper.formatDate(data.date, 'E | d MMM');
        },
        headerName: 'Day',
      },
      {
        field: 'billRateType',
        width: 110,
        cellRenderer: TitleValueCellRendererComponent,
        headerName: 'Bill Rate Type',
        valueGetter: (params: ValueGetterParams) => {
          const data = params.data as InvoiceRecordTimesheetEntry;
          return BillRateType[data.billRateType];
        },
      },
      {
        field: 'timeIn',
        width: 100,
        cellRenderer: TitleValueCellRendererComponent,
        headerName: 'Time In',
      },
      {
        field: 'timeOut',
        width: 140,
        cellRenderer: TitleValueCellRendererComponent,
        headerName: 'Time Out',
      },
      {
        field: 'rate',
        width: 80,
        cellRenderer: TitleValueCellRendererComponent,
        headerName: 'Rate',
      },
      {
        field: 'value',
        width: 80,
        cellRenderer: TitleValueCellRendererComponent,
        headerName: 'Value',
      },
      {
        field: 'total',
        width: 80,
        cellRenderer: TitleValueCellRendererComponent,
        headerName: 'Total',
      },
      {
        field: 'comment',
        headerName: 'Comment',
        cellRenderer: TitleValueCellRendererComponent,
      },
    ];
  }

  public static getInvoiceRecordsGridColumnDefinitions(): ColDef[] {
    return [
      {
        field: 'type',
        headerName: 'TYPE',
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        minWidth: 240,
        headerComponent: ToggleRowExpansionHeaderCellComponent,
        cellRenderer: 'agGroupCellRenderer',
      },
      {
        field: 'agency',
        headerName: 'AGENCY',
      },
      {
        headerName: 'CANDIDATE NAME',
        valueGetter: (params: ValueGetterParams) => {
          const record = params.data as InvoiceRecord;

          return `${record.candidateLastName}, ${record.candidateFirstName}`
        }
      },
      {
        field: 'orderId',
        headerName: 'ORDER ID',
        width: 110,
        cellRenderer: GridCellLinkComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          const orderId: number = (params.data as InvoiceRecord).orderId;

          return {
            ...params,
            link: `/client/order-management`,
            navigationExtras: {
              state: { orderId },
            }
          } as GridCellLinkParams;
        }
      },
      {
        field: 'location',
        headerName: 'Location',
      },
      {
        field: 'attachments',
        cellRenderer: AttachmentsListComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          return {
            attachments: (params.data as InvoiceRecord).attachments,
            attachmentsListConfig: {
              download: (item: Attachment) => {},
              preview: (item: Attachment) => {},
            }
          } as AttachmentsListParams;
        },
        cellClass: 'invoice-records-attachments-list',
      },
      {
        field: 'department',
        headerName: 'DEPARTMENT',
      },
      {
        field: 'skill',
        headerName: 'SKILL',
      },
      {
        headerName: 'WEEK PERIOD',
        valueGetter: (params: ValueGetterParams) => {
          const record = params.data as InvoiceRecord;

          return GridValuesHelper.formatDate(record.startDate, 'W - ccc M/d/yy');
        },
      },
      {
        field: 'rate',
        headerName: 'RATE',
        width: 110,
        type: 'rightAligned',
        cellClass: 'color-black-bold align-right',
      },
      {
        field: 'bonus',
        headerName: 'BONUS',
        width: 110,
        type: 'rightAligned',
        cellClass: 'color-black-bold align-right',
      },
      {
        field: 'expenses',
        headerName: 'EXPENSES',
        width: 110,
        type: 'rightAligned',
        cellClass: 'color-black-bold align-right',
      },
      {
        field: 'hours',
        headerName: 'HOURS',
        width: 110,
        type: 'rightAligned',
        cellClass: 'color-black-bold align-right',
      },
      {
        field: 'miles',
        headerName: 'MILES',
        width: 110,
        type: 'rightAligned',
        cellClass: 'color-black-bold align-right',
      },
      {
        field: 'amount',
        headerName: 'AMOUNT',
        width: 110,
        type: 'rightAligned',
        cellClass: 'color-black-bold align-right',
      },
      {
        field: 'amount',
        headerName: 'AMOUNT',
        width: 110,
        type: 'rightAligned',
        cellClass: 'color-black-bold align-right',
      },
    ];
  }
}
