import {
  GetDetailRowDataParams,
  GridOptions,
  ICellRendererParams,
  IDetailCellRendererParams,
  RowHeightParams
} from '@ag-grid-community/core';
import { TitleValueCellRendererParams } from '@shared/components/grid/models';

import { TypedColDef, TypedValueGetterParams } from '../../interfaces/typed-col-def.interface';
import { PendingApprovalInvoice, PendingApprovalInvoiceRecord } from '../../interfaces/pending-approval-invoice.interface';
import { numberValueFormatter, invoicesRowDetailsOffsetColDef, monthDayYearDateFormatter,
  titleValueCellRendererSelector, weekPeriodValueGetter } from '../../constants';
import {
  InvoiceRecordsTableRowDetailsComponent
} from '../../components/invoice-records-table-row-details/invoice-records-table-row-details.component';
import { PendingInvoice } from '../../interfaces/pending-invoice-record.interface';
import { InvoicesContainerGridHelper } from './invoices-container-grid.helper';
import { ToggleRowExpansionHeaderCellComponent } from '../../components/grid-icon-cell/toggle-row-expansion-header-cell.component';
import { TableStatusCellComponent } from '@shared/components/table-status-cell/table-status-cell.component';
import { AllInvoicesActionCellComponent } from '../../components/all-invoices-action-cell/all-invoices-action-cell.component';
import { BaseInvoice } from '../../interfaces';

interface AllColDefsConfig {
  approve?: (invoice: PendingApprovalInvoice) => void;
  pay?: (invoice: PendingApprovalInvoice) => void;
  actionTitle?: string,
}

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
        },
        sortable: false,
        suppressMenu: true,
        filter: false,
        resizable: false,
      } :       {
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
      },
      {
        field: 'invoiceStateText',
        headerName: 'Status',
        minWidth: 190,
        flex: 1,
        cellRenderer: TableStatusCellComponent,
        cellClass: 'status-cell',
      },
      {
        field: 'amount',
        minWidth: 280,
        headerName: 'Amount',
        type: 'rightAligned',
        cellClass: 'font-weight-bold align-right',
        valueFormatter: numberValueFormatter,
      },
      {
        field: 'apDeliveryText',
        headerName: 'Ap Delivery',
        minWidth: 270,
      },
      {
        field: 'aggregateByTypeText',
        headerName: 'Group By Type',
        minWidth: 360,
      },
      {
        field: 'issuedDate',
        minWidth: 230,
        headerName: 'Issued Date',
        valueFormatter: monthDayYearDateFormatter,
      },
      {
        field: 'payDate',
        minWidth: 230,
        headerName: 'Paid Date',
        valueFormatter: monthDayYearDateFormatter,
      },
      {
        field: 'dueDate',
        minWidth: 200,
        headerName: 'Due Date',
        type: 'rightAligned',
        valueFormatter: monthDayYearDateFormatter,
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
            organizationId: (params.data as BaseInvoice).organizationId
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
                      candidateLastName
                    }
                  }: TypedValueGetterParams<PendingApprovalInvoiceRecord>
                ) => `${candidateLastName}, ${candidateFirstName}`,
                cellRendererSelector: titleValueCellRendererSelector,
                cellRendererParams: (params: ICellRendererParams): TitleValueCellRendererParams => {
                  return {
                    ...params,
                    titleValueParams: {
                      valueClass: 'font-weight-bold color-primary-active-blue-10',
                      ...rendererParams.titleValueParams,
                    }
                  }
                }
              },
              {
                field: 'amount',
                headerName: 'Amount',
                cellClass: 'font-weight-bold',
                cellRendererSelector: titleValueCellRendererSelector,
                cellRendererParams: rendererParams,
                valueFormatter: numberValueFormatter,
              },
              {
                ...weekPeriod,
                valueGetter: weekPeriodValueGetter,
                headerName: 'Week Period',
                cellRendererSelector: titleValueCellRendererSelector,
                cellRendererParams: rendererParams,
              },
              {
                field: 'value',
                headerName: 'Total Hours',
                cellRendererSelector: titleValueCellRendererSelector,
                cellRendererParams: rendererParams,
                width: 100,
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
                headerName: 'Department',
                cellRendererSelector: titleValueCellRendererSelector,
                cellRendererParams: rendererParams,
              },
              {
                field: 'timesheetTypeText',
                width: 90,
                headerName: 'Type',
                cellRendererSelector: titleValueCellRendererSelector,
                cellRendererParams: rendererParams,
              },
            ] as TypedColDef<PendingApprovalInvoiceRecord>[],
          },
          getDetailRowData: (params: GetDetailRowDataParams) => params.successCallback(
            (params.data as PendingApprovalInvoice).invoiceRecords,
          ),
        };
      }
    }
  }
}
