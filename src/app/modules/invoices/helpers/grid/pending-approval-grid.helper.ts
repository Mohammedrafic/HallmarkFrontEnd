import { TypedColDef, TypedValueGetterParams } from '../../interfaces/typed-col-def.interface';
import {
  PendingApprovalInvoice,
  PendingApprovalInvoiceRecord
} from '../../interfaces/pending-approval-invoice.interface';
import { GridActionsCellComponent } from '@shared/components/grid/cell-renderers/grid-actions-cell';
import {
  GetDetailRowDataParams,
  GridOptions,
  ICellRendererParams,
  IDetailCellRendererParams,
  RowHeightParams
} from '@ag-grid-community/core';
import { ManualInvoice } from '../../interfaces';
import { PendingInvoiceStatus } from '../../enums/invoice-status.enum';
import { InvoicesContainerGridHelper } from './invoices-container-grid.helper';
import {
  InvoiceRecordsTableRowDetailsComponent
} from '../../components/invoice-records-table-row-details/invoice-records-table-row-details.component';
import { PendingInvoice } from '../../interfaces/pending-invoice-record.interface';
import { TitleValueCellRendererParams } from '@shared/components/grid/models';
import {
  ToggleRowExpansionHeaderCellComponent
} from '../../components/grid-icon-cell/toggle-row-expansion-header-cell.component';
import {
  amountValueFormatter, weekPeriodValueGetter,
  invoicesRowDetailsOffsetColDef,
  monthDayYearDateFormatter,
  titleValueCellRendererSelector
} from '../../constants';
import { GridActionsCellConfig } from '@shared/components/grid/cell-renderers/grid-actions-cell';
import { TableStatusCellComponent } from '@shared/components/table-status-cell/table-status-cell.component';
import { AllInvoicesActionCellComponent } from '../../components/all-invoices-action-cell/all-invoices-action-cell.component';

interface PendingApprovalColDefsConfig {
  approve?: (invoice: PendingApprovalInvoice) => void;
  actionTitle?: string,
}

interface AllColDefsConfig {
  approve?: (invoice: PendingApprovalInvoice) => void;
  pay?: (invoice: PendingApprovalInvoice) => void;
  actionTitle?: string,
}

export class PendingApprovalGridHelper {
  public static getOrganizationColDefs(
    { approve, actionTitle }: PendingApprovalColDefsConfig
  ): TypedColDef<PendingApprovalInvoice>[] {
    const colDef = [
      approve ? {
        headerName: '',
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        minWidth: 240,
        headerComponent: ToggleRowExpansionHeaderCellComponent,
        cellRenderer: GridActionsCellComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          const { status } = params.data as ManualInvoice;

          return {
            actionsConfig: [
              {
                action: approve,
                title: actionTitle || 'Approve',
                titleClass: 'color-supportive-green-10',
                disabled: [
                  PendingInvoiceStatus.Approved,
                ].includes(status),
              },
            ],
          } as GridActionsCellConfig
        },
        sortable: false,
        suppressMenu: true,
        filter: false,
        resizable: false,
      } : {},
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
        cellClass: 'font-weight-bold',
        valueFormatter: amountValueFormatter,
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
        field: 'dueDate',
        minWidth: 200,
        headerName: 'Due Date',
        type: 'rightAligned',
        valueFormatter: monthDayYearDateFormatter,
      },
    ];

    if (!colDef[0].headerComponent) {
      colDef.splice(0, 1);
    }

    return colDef;
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

        return {
          ...params,
          detailGridOptions: {
            columnDefs: [
              invoicesRowDetailsOffsetColDef,
              {
                headerName: 'Candidate Name',
                minWidth: 170,
                width: 170,
                valueGetter: ({
                                data: {
                                  candidateFirstName,
                                  candidateLastName
                                }
                              }: TypedValueGetterParams<PendingApprovalInvoiceRecord>) => `${candidateLastName}, ${candidateFirstName}`,
                cellRendererSelector: titleValueCellRendererSelector,
                cellRendererParams: (params: ICellRendererParams): TitleValueCellRendererParams => {
                  return {
                    ...params,
                    titleValueParams: {
                      valueClass: 'font-weight-bold color-primary-active-blue-10'
                    }
                  }
                }
              },
              {
                field: 'amount',
                headerName: 'Amount',
                cellClass: 'font-weight-bold',
                cellRendererSelector: titleValueCellRendererSelector,
                valueFormatter: amountValueFormatter,
              },
              {
                ...weekPeriod,
                valueGetter: weekPeriodValueGetter,
                headerName: 'Week Period',
                cellRendererSelector: titleValueCellRendererSelector,
              },
              {
                field: 'value',
                headerName: 'Total Hours',
                cellRendererSelector: titleValueCellRendererSelector,
                width: 100,
              },
              {
                field: 'locationName',
                minWidth: 210,
                headerName: 'Location',
                cellRendererSelector: titleValueCellRendererSelector,
              },
              {
                field: 'departmentName',
                minWidth: 160,
                headerName: 'Department',
                cellRendererSelector: titleValueCellRendererSelector,
              },
              {
                field: 'timesheetTypeText',
                width: 90,
                headerName: 'Type',
                cellRendererSelector: titleValueCellRendererSelector,
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

  public static getOrganizationAllColDefs(
    { approve, pay }: AllColDefsConfig
  ): TypedColDef<PendingApprovalInvoice>[] {
    const colDef = [
      {
        headerName: '',
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        width: 160,
        headerComponent: ToggleRowExpansionHeaderCellComponent,
        cellRenderer: AllInvoicesActionCellComponent,
        cellRendererParams: {
          approve: approve,
          pay: pay,
        },
        sortable: false,
        suppressMenu: true,
        filter: false,
        resizable: false,
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
        cellClass: 'font-weight-bold',
        valueFormatter: amountValueFormatter,
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
        field: 'dueDate',
        minWidth: 200,
        headerName: 'Due Date',
        type: 'rightAligned',
        valueFormatter: monthDayYearDateFormatter,
      },
    ];

    if (!colDef[0].headerComponent) {
      colDef.splice(0, 1);
    }

    return colDef;
  }
}
