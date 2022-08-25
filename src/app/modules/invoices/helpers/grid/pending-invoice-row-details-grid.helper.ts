import {
  GetDetailRowDataParams,
  GridOptions,
  ICellRendererParams,
  IDetailCellRendererParams,
  RowHeightParams
} from '@ag-grid-community/core';
import {
  TitleValueCellRendererComponent
} from '@shared/components/grid/components/title-value-cell-renderer/title-value-cell-renderer.component';
import {
  InvoiceRecordsTableRowDetailsComponent
} from '../../components/invoice-records-table-row-details/invoice-records-table-row-details.component';
import { GridValuesHelper } from '../../../timesheets/helpers';
import { Attachment, AttachmentsListComponent, AttachmentsListParams } from '@shared/components/attachments';
import { PendingInvoice, PendingInvoiceRecord } from '../../interfaces/pending-invoice-record.interface';
import { TypedColDef, TypedValueGetterParams } from '../../interfaces/typed-col-def.interface';
import { InvoiceType } from '../../enums/invoice-type.enum';
import { currencyFormatter, invoicesRowDetailsOffsetColDef, titleValueCellRendererSelector } from '../../constants';

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
  valueFormatter: currencyFormatter,
  cellRendererSelector: titleValueCellRendererSelector,
};

const totalColDef: TypedColDef<PendingInvoiceRecord> = {
  field: 'total',
  width: 80,
  headerName: 'Total',
  valueFormatter: currencyFormatter,
  cellRendererSelector: titleValueCellRendererSelector,
  cellRenderer: TitleValueCellRendererComponent
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
  },
  totalColDef,
  {
    field: 'comment',
    headerName: 'Comment',
    cellRendererSelector: titleValueCellRendererSelector,
  },
];

const manualTypeColDefs: TypedColDef<PendingInvoiceRecord>[] = [
  invoicesRowDetailsOffsetColDef,
  dayColDef,
  {
    field: 'invoiceRecordTypeText',
    headerName: 'Type',
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
    field: 'reasonCode',
    headerName: 'Reason Code',
    cellRendererSelector: titleValueCellRendererSelector,
  },
  {
    field: 'comment',
    headerName: 'Comment',
    cellRendererSelector: titleValueCellRendererSelector,
  },
  {
    field: 'attachments',
    cellRenderer: AttachmentsListComponent,
    cellRendererParams: (params: ICellRendererParams): AttachmentsListParams => {
      const { attachments } = params.data as PendingInvoiceRecord;

      return {
        attachments,
        attachmentsListConfig: {
          // TODO: Implement
          preview: (item: Attachment) => {},
          download: (item: Attachment) => {},
        },
      }
    }
  }
];

const milesInvoiceTypeColDefs: TypedColDef<PendingInvoiceRecord>[] = [
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
    valueFormatter: currencyFormatter
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
    cellRendererParams: (params: ICellRendererParams): AttachmentsListParams => {
      const { attachments } = params.data as PendingInvoiceRecord;

      return {
        attachments,
        attachmentsListConfig: {
          // TODO: Implement
          preview: (item: Attachment) => {},
          download: (item: Attachment) => {},
        },
      }
    }
  },
];

export class PendingInvoiceRowDetailsGridHelper {
  public static getNestedRowsGridOptions(): GridOptions {
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
            columnDefs: PendingInvoiceRowDetailsGridHelper.getRowDetailsColumnDefinitions(timesheetType),
          },
          getDetailRowData: (params: GetDetailRowDataParams) => params.successCallback(
            (params.data as PendingInvoice).invoiceRecords,
          ),
        };
      }
    }
  }

  public static getRowDetailsColumnDefinitions(invoiceType: InvoiceType): TypedColDef<PendingInvoiceRecord>[] {
    switch (invoiceType) {
      case InvoiceType.Timesheet:
        return timesheetTypeColDefs;
      case InvoiceType.Manual:
        return manualTypeColDefs;
      case InvoiceType.Mileage:
        return milesInvoiceTypeColDefs;
      default:
        throw new Error(`Invoice record type "${invoiceType}" is not supported`);
    }
  }
}
