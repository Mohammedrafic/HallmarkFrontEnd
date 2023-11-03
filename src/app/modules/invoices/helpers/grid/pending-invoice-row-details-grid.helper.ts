import {
  GetDetailRowDataParams,
  GridOptions,
  ICellRendererParams,
  IDetailCellRendererParams,
  RowHeightParams,
  ValueFormatterParams,
} from '@ag-grid-community/core';
import { formatNumber } from '@angular/common';
import {
  TitleValueCellRendererComponent,
} from '@shared/components/grid/components/title-value-cell-renderer/title-value-cell-renderer.component';

import { TypedValueGetterParams } from '@core/interface';
import { AttachmentsListComponent, AttachmentsListParams } from '@shared/components/attachments';
import { GridValuesHelper } from '../../../timesheets/helpers';
import {
  InvoiceRecordsTableRowDetailsComponent,
} from '../../components/invoice-records-table-row-details/invoice-records-table-row-details.component';
import { CurrencyFormatter, invoicesRowDetailsOffsetColDef, titleValueCellRendererSelector } from '../../constants';
import { InvoiceType } from '../../enums/invoice-type.enum';
import { GetPendingInvoiceDetailsColDefsFn,
  InvoiceAttachment, PendingInvoiceRowDetailsConfig, TypedColDef } from '../../interfaces';
import { PendingInvoice, PendingInvoiceRecord } from '../../interfaces/pending-invoice-record.interface';


const dayColDef: TypedColDef<PendingInvoiceRecord> = {
  width: 130,
  headerName: 'Day',
  valueGetter: (params: TypedValueGetterParams<PendingInvoiceRecord>) =>
    GridValuesHelper.formatDate(params.data.dateTime, 'E | d MMM'),
  cellRendererSelector: titleValueCellRendererSelector,
};

const rateColDef: TypedColDef<PendingInvoiceRecord> = {
  field: 'rate',
  width: 80,
  headerName: 'Rate',
  valueFormatter: CurrencyFormatter,
  cellRendererSelector: titleValueCellRendererSelector,
};

const totalColDef: TypedColDef<PendingInvoiceRecord> = {
  field: 'total',
  width: 80,
  headerName: 'Total',
  valueFormatter: CurrencyFormatter,
  cellRendererSelector: titleValueCellRendererSelector,
  cellRenderer: TitleValueCellRendererComponent,
};

const timesheetTypeColDefs: TypedColDef<PendingInvoiceRecord>[] = [
  invoicesRowDetailsOffsetColDef,
  dayColDef,
  {
    field: 'billRateConfigTitle',
    headerName: 'Bill Rate Type',
    width: 110,
    cellRendererSelector: titleValueCellRendererSelector,
  },
  {
    field: 'timeIn',
    width: 100,
    headerName: 'Time In',
    cellRendererSelector: titleValueCellRendererSelector,
  },
  {
    field: 'timeOut',
    width: 140,
    headerName: 'Time Out',
    cellRendererSelector: titleValueCellRendererSelector,
  },
  rateColDef,
  {
    field: 'value',
    width: 80,
    headerName: 'Hours',
    cellRendererSelector: titleValueCellRendererSelector,
    valueFormatter: (params: ValueFormatterParams) => formatNumber(params.value, 'en', '1.2-2'),
  },
  totalColDef,
  {
    field: 'comment',
    headerName: 'Comment',
    cellRendererSelector: titleValueCellRendererSelector,
  },
];

const getManualTypeColDefs: GetPendingInvoiceDetailsColDefsFn =
  ({ previewExpensesAttachment, downloadExpensesAttachment }: PendingInvoiceRowDetailsConfig) => [
    invoicesRowDetailsOffsetColDef,
    dayColDef,
    {
      field: 'reasonCode',
      headerName: 'Reason Code',
      width: 300,
      cellRendererSelector: titleValueCellRendererSelector,
    },
    totalColDef,
    {
      field: 'linkedInvoiceId',
      headerName: 'Linked Invoice',
      cellRendererSelector: titleValueCellRendererSelector,
    },
    {
      field: 'vendorFeeApplicable',
      headerName: 'Vendor Fee Applicable',
      cellRendererSelector: titleValueCellRendererSelector,
      valueGetter: (params: TypedValueGetterParams<PendingInvoiceRecord>) =>
        params.data.vendorFeeApplicable ? 'Yes' : 'No',
    },
    {
      field: 'comment',
      headerName: 'Comment',
      cellRendererSelector: titleValueCellRendererSelector,
    },
    {
      field: 'attachments',
      cellRenderer: AttachmentsListComponent,
      cellRendererParams: (params: ICellRendererParams): AttachmentsListParams<InvoiceAttachment> => {
        const { attachments } = params.data as PendingInvoiceRecord;

        return {
          attachments,
          attachmentsListConfig: {
            preview: previewExpensesAttachment,
            download: downloadExpensesAttachment,
          },
        };
      },
    },
  ];

const milesInvoiceTypeColDefs: (config: PendingInvoiceRowDetailsConfig) => TypedColDef<PendingInvoiceRecord>[] =
  ({ downloadMilesAttachments, previewMilesAttachments }) => [
  invoicesRowDetailsOffsetColDef,
  dayColDef,
  {
    field: 'billRateConfigTitle',
    headerName: 'Bill Rate Type',
    width: 300,
    cellRendererSelector: titleValueCellRendererSelector,
  },
  rateColDef,
  {
    field: 'value',
    headerName: 'Miles',
    width: 110,
    cellRendererSelector: titleValueCellRendererSelector,
    valueFormatter: (params: ValueFormatterParams) => formatNumber(params.value, 'en', '1.2-2'),
  },
  totalColDef,
  {
    field: 'comment',
    headerName: 'Comment',
    width: 110,
    cellRendererSelector: titleValueCellRendererSelector,
  },
  {
    field: 'attachments',
    cellRenderer: AttachmentsListComponent,
    cellRendererParams: (params: ICellRendererParams): AttachmentsListParams<InvoiceAttachment> => {
      const { attachments, timesheetRecordId } = params.data as PendingInvoiceRecord;

      return {
        attachments,
        attachmentsListConfig: {
          preview: previewMilesAttachments(timesheetRecordId),
          download: downloadMilesAttachments(timesheetRecordId),
        },
      };
    },
  },
];

export class PendingInvoiceRowDetailsGridHelper {
  public static getRowDetailsGridOptions(config: PendingInvoiceRowDetailsConfig): GridOptions {
    return {
      masterDetail: true,
      detailCellRenderer: InvoiceRecordsTableRowDetailsComponent,
      animateRows: true,
      embedFullWidthRows: true,
      isRowMaster: (dataItem: PendingInvoice) => !!dataItem?.invoiceRecords?.length,
      getRowHeight: (params: RowHeightParams) => {
        if (params?.node?.detail) {
          const data = params.data as PendingInvoice;
          return data.invoiceRecords.length * params.api.getSizesForCurrentTheme().rowHeight + 1;
        }

        return null;
      },
      detailCellRendererParams: (params: IDetailCellRendererParams): IDetailCellRendererParams => {
        const { timesheetType } = params.data as PendingInvoice;

        return {
          ...params,
          detailGridOptions: {
            columnDefs: PendingInvoiceRowDetailsGridHelper.getRowDetailsColumnDefinitions(timesheetType, config),
          },
          getDetailRowData: (params: GetDetailRowDataParams) => params.successCallback(
           (params.data as PendingInvoice).invoiceRecords.map((rec) => ({ ...rec, timesheetType: timesheetType,})),
          ),
        };
      },
    };
  }

  public static getRowDetailsColumnDefinitions(
    invoiceType: InvoiceType,
    config: PendingInvoiceRowDetailsConfig
  ): TypedColDef<PendingInvoiceRecord>[] {
    switch (invoiceType) {
      case InvoiceType.Timesheet:
        return timesheetTypeColDefs;
      case InvoiceType.Manual:
        return getManualTypeColDefs(config);
      case InvoiceType.Mileage:
        return milesInvoiceTypeColDefs(config);
      default:
        throw new Error(`Invoice record type "${invoiceType}" is not supported`);
    }
  }
}
