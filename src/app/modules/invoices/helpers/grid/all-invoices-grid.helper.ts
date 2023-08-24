import {
  ColDef,
  GetDetailRowDataParams,
  GridOptions,
  ICellRendererParams,
  IDetailCellRendererParams,
  RowHeightParams,
} from '@ag-grid-community/core';
import { TypedValueGetterParams } from '@core/interface';
import { TitleValueCellRendererParams } from '@shared/components/grid/models';

import { TableStatusCellComponent } from '@shared/components/table-status-cell/table-status-cell.component';
import {
  AllInvoicesActionCellComponent,
} from '../../components/all-invoices-action-cell/all-invoices-action-cell.component';
import {
  ToggleRowExpansionHeaderCellComponent } from '../../components/grid-icon-cell/toggle-row-expansion-header-cell.component';
import {
  InvoiceRecordsTableRowDetailsComponent,
} from '../../components/invoice-records-table-row-details/invoice-records-table-row-details.component';
import { CurrencyFormatter, DepartmentNameGetter, invoicesRowDetailsOffsetColDef,
  monthDayYearDateFormatter, numberValueFormatter, RateReasonValueGetter,
  titleValueCellRendererSelector, weekPeriodValueGetter } from '../../constants';
import { BaseInvoice, TypedColDef } from '../../interfaces';
import { PendingApprovalInvoice, PendingApprovalInvoiceRecord } from '../../interfaces/pending-approval-invoice.interface';
import { PendingInvoice } from '../../interfaces/pending-invoice-record.interface';
import { InvoicesContainerGridHelper } from './invoices-container-grid.helper';

interface AllColDefsConfig {
  approve?: (invoice: PendingApprovalInvoice) => void;
  pay?: (invoice: PendingApprovalInvoice) => void;
  actionTitle?: string,
}

const commonColumn: ColDef = {
  sortable: true,
  comparator: () => 0,
};

export class AllInvoicesGridHelper {
  public static getColDefs(canPay: boolean, { pay }: AllColDefsConfig): TypedColDef<PendingApprovalInvoice>[] {
    return [
      canPay ?  {
        headerName: '',
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        width: 160,
        headerComponent: ToggleRowExpansionHeaderCellComponent,
        cellRenderer: AllInvoicesActionCellComponent,
        cellRendererParams: {
          pay: pay,
          canPay: true,
        },
        sortable: false,
        suppressMenu: true,
        filter: false,
        resizable: false,
      } : {
        field: '',
        headerName: '',
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        width: 80,
        headerComponent: ToggleRowExpansionHeaderCellComponent,
      },
      {
        field: 'formattedInvoiceId',
        minWidth: 160,
        headerName: 'Invoice Id',
        cellRenderer: 'agGroupCellRenderer',
        cellClass: 'expansion-toggle-icons-order-1 color-primary-active-blue-10 font-weight-bold',
        flex: 1,
        ...commonColumn,
      },
      {
        field: 'invoiceStateText',
        headerName: 'Status',
        minWidth: 190,
        flex: 1,
        cellRenderer: TableStatusCellComponent,
        cellClass: 'status-cell',
        ...commonColumn,
      },
      {
        field: 'amount',
        minWidth: 280,
        headerName: 'Amount',
        cellClass: 'font-weight-bold',
        valueFormatter: CurrencyFormatter,
        ...commonColumn,
      },
      {
        field: 'apDeliveryText',
        headerName: 'Ap Delivery',
        minWidth: 270,
        ...commonColumn,
      },
      {
        field: 'aggregateByTypeText',
        headerName: 'Group By Type',
        minWidth: 360,
        ...commonColumn,
      },
      {
        field: 'issuedDate',
        minWidth: 230,
        headerName: 'Issued Date',
        valueFormatter: monthDayYearDateFormatter,
        ...commonColumn,
      },
      {
        field: 'payDate',
        minWidth: 230,
        headerName: 'Paid Date',
        valueFormatter: monthDayYearDateFormatter,
        ...commonColumn,
      },
      {
        field: 'dueDate',
        minWidth: 200,
        headerName: 'Due Date',
        valueFormatter: monthDayYearDateFormatter,
        ...commonColumn,
      },
      {
        field: 'organizationName',
        headerName: 'Organization',
        minWidth: 200,
        ...commonColumn,
      },
    ];
  }

  public static getGridOptions(agency: boolean): GridOptions {
    return {
      masterDetail: true,
      detailCellRenderer: InvoiceRecordsTableRowDetailsComponent,
      animateRows: true,
      embedFullWidthRows: true,
      isRowMaster: (dataItem: PendingApprovalInvoice) => !!dataItem?.invoiceRecords?.length,
      getRowHeight: (params: RowHeightParams) => {
        if (params?.node?.detail) {
          const data = params.data as PendingInvoice;
          return data.invoiceRecords.length * params.api.getSizesForCurrentTheme().rowHeight + 1;
        }

        return null;
      },
      detailCellRendererParams: (params: IDetailCellRendererParams): IDetailCellRendererParams => {
        const {
          weekPeriod,
        } = InvoicesContainerGridHelper.getColDefsMap(agency);

        const rendererParams: Pick<TitleValueCellRendererParams, 'titleValueParams'> = {
          titleValueParams: {
            organizationId: (params.data as BaseInvoice).organizationId,
          },
        };

        return {
          ...params,
          detailGridOptions: {
            columnDefs: [
              invoicesRowDetailsOffsetColDef,
              {
                headerName: 'Candidate Name',
                minWidth: 170,
                width: 170,
                valueGetter: (
                  {
                    data: {
                      candidateFirstName,
                      candidateLastName,
                    },
                  }: TypedValueGetterParams<PendingApprovalInvoiceRecord>
                ) => `${candidateLastName}, ${candidateFirstName}`,
                cellRendererSelector: titleValueCellRendererSelector,
                cellRendererParams: (params: ICellRendererParams): TitleValueCellRendererParams => {
                  return {
                    ...params,
                    titleValueParams: {
                      valueClass: 'font-weight-bold color-primary-active-blue-10',
                      ...rendererParams.titleValueParams,
                    },
                  };
                },
              },
              {
                ...weekPeriod,
                valueGetter: weekPeriodValueGetter,
                headerName: 'Week Period',
                cellRendererSelector: titleValueCellRendererSelector,
                cellRendererParams: rendererParams,
              },
              {
                field: 'dateTime',
                valueFormatter: monthDayYearDateFormatter,
                headerName: 'Date',
                width: 120,
                cellRendererSelector: titleValueCellRendererSelector,
              },
              {
                field: 'billRateConfigTitle',
                headerName: 'Bill Rate Type',
                width: 150,
                cellRendererSelector: titleValueCellRendererSelector,
              },
              {
                field: 'billRate',
                headerName: 'Rate',
                minWidth: 80,
                maxWidth: 190,
                cellRendererSelector: titleValueCellRendererSelector,
                valueGetter: RateReasonValueGetter,
              },
              {
                field: 'value',
                headerName: 'Hours',
                cellRendererSelector: titleValueCellRendererSelector,
                valueFormatter: numberValueFormatter,
                cellRendererParams: rendererParams,
                width: 100,
              },
              {
                field: 'amount',
                headerName: 'Total',
                width: 120,
                cellClass: 'font-weight-bold',
                cellRendererParams: rendererParams,
                cellRendererSelector: titleValueCellRendererSelector,
                valueFormatter: CurrencyFormatter,
              },
              {
                field: 'locationName',
                minWidth: 210,
                headerName: 'Location',
                cellRendererSelector: titleValueCellRendererSelector,
                cellRendererParams: rendererParams,
              },
              {
                field: 'departmentName',
                minWidth: 160,
                headerName: 'Department (Cost Center)',
                cellRendererSelector: titleValueCellRendererSelector,
                cellRendererParams: rendererParams,
                valueGetter: DepartmentNameGetter,
              },
              {
                field: 'timesheetTypeText',
                width: 90,
                headerName: 'Type',
                cellRendererSelector: titleValueCellRendererSelector,
                cellRendererParams: rendererParams,
              },
              {
                field: 'feeAmount',
                headerName: 'Agency Fee',
                width: 120,
                cellClass: 'font-weight-bold',
                cellRendererParams: rendererParams,
                cellRendererSelector: titleValueCellRendererSelector,
                valueFormatter: CurrencyFormatter,
              },
            ] as TypedColDef<PendingApprovalInvoiceRecord>[],
          },
          getDetailRowData: (params: GetDetailRowDataParams) => params.successCallback(
            (params.data as PendingApprovalInvoice).invoiceRecords,
          ),
        };
      },
    };
  }
}
