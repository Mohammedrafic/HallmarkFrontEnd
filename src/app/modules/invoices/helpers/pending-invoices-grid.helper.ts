import { ColDef, ICellRendererParams, ValueGetterParams } from '@ag-grid-community/core';
import { PendingInvoice } from '../interfaces/pending-invoice-record.interface';
import { GridCellLinkParams } from '@shared/components/grid/models';
import { GridCellLinkComponent } from '@shared/components/grid/components/grid-cell-link/grid-cell-link.component';
import { GridValuesHelper } from '../../timesheets/helpers';
import { Attachment, AttachmentsListComponent, AttachmentsListParams } from '@shared/components/attachments';
import {
  GridActionsCellComponent
} from '../components/grid-actions-cell/grid-actions-cell.component';
import { TimesheetType } from '../enums/timesheet-type.enum';
import {
  TimesheetTableStatusCellComponent
} from '../../timesheets/components/timesheets-table/timesheet-table-status-cell/timesheet-table-status-cell.component';
import { PendingInvoiceStatus } from '../enums/pending-invoice-status.enum';
import { GridActionsCellConfig } from '../interfaces';

type CustomField = 'weekPeriod' | 'candidateName';
type Fields = Pick<PendingInvoice,
  'timesheetType' |
  'locationName' |
  'departmentName' |
  'skillName' |
  'rejectionReason' |
  'pendingInvoiceStatusText' |
  'amount' |
  'attachments'>;
type PendingInvoiceField = keyof Fields | CustomField;
type PendingInvoicesColDef = ColDef & { field?: PendingInvoiceField };

export const pendingInvoicesColDefsMap: Record<PendingInvoiceField, PendingInvoicesColDef> = {
  attachments: {
    headerName: 'ATTACHMENTS',
    field: 'attachments',
    cellRenderer: AttachmentsListComponent,
    cellClass: 'invoice-records-attachments-list',
  },
  timesheetType: {
    field: 'timesheetType',
    headerName: 'TYPE',
    valueGetter: (params: ValueGetterParams) => {
      const data = params.data as PendingInvoice;
      return TimesheetType[data.timesheetType];
    }
  },
  locationName: {
    field: 'locationName',
    headerName: 'Location',
  },
  departmentName: {
    field: 'departmentName',
    headerName: 'DEPARTMENT',
  },
  skillName: {
    field: 'skillName',
    headerName: 'SKILL',
  },
  weekPeriod: {
    headerName: 'WEEK PERIOD',
    width: 120,
    cellRenderer: GridCellLinkComponent,
    valueGetter: (params: ValueGetterParams) => {
      const { weekNumber, weekStartDate: date } = params.data as PendingInvoice;

      return `${weekNumber} - ${GridValuesHelper.formatDate(date, 'cccccc')}<br>${GridValuesHelper.formatDate(date, 'M/d/yy')}`;
    }
  },
  rejectionReason: {
    field: 'rejectionReason',
    headerName: 'REASON FOR REJECTION',
    minWidth: 200,
  },
  candidateName: {
    headerName: 'CANDIDATE NAME',
    valueGetter: (params: ValueGetterParams) => {
      const record = params.data as PendingInvoice;

      return `${record.candidateLastName}, ${record.candidateFirstName}`
    }
  },
  pendingInvoiceStatusText: {
    headerName: 'STATUS',
    minWidth: 170,
    cellRenderer: TimesheetTableStatusCellComponent,
    cellClass: 'status-cell',
    field: 'pendingInvoiceStatusText',
  },
  amount: {
    field: 'amount',
    headerName: 'AMOUNT',
    width: 110,
    type: 'rightAligned',
    cellClass: 'color-black-bold align-right',
  },
}

export class PendingInvoicesGridHelper {
  static getAgencyPendingInvoicesColDefs(): ColDef[] {
    const {
      attachments,
      timesheetType,
      candidateName,
      rejectionReason,
      locationName,
      departmentName,
      skillName,
      weekPeriod,
      pendingInvoiceStatusText,
      amount,
    } = pendingInvoicesColDefsMap;
    return [
      {
        headerName: '',
        width: 150,
        cellRenderer: GridActionsCellComponent,
        cellRendererParams: {
          actionsConfig: [
            {
              action: () => console.log('EDIT'),
              iconName: 'edit',
              iconClass: 'color-primary-active-blue-10',
              disabled: true,
            },
            {
              action: () => console.log('DELETE'),
              iconName: 'trash-2',
              iconClass: 'color-supportive-red',
              disabled: true,
            },
          ],
        } as GridActionsCellConfig,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        resizable: false,
      },
      timesheetType,
      pendingInvoiceStatusText,
      {
        headerValueGetter: () => 'ORGANIZATION',
        valueGetter: (params) => (params.data as PendingInvoice).organizationName,
      },
      candidateName,
      {
        field: 'orderId',
        headerName: 'ORDER ID',
        width: 110,
        cellRenderer: GridCellLinkComponent,
        cellRendererParams: (params: ICellRendererParams): GridCellLinkParams => {
          const orderId: number = params.data as number;

          return {
            ...params,
            link: `/agency/order-management`,
            navigationExtras: {
              state: {orderId},
            }
          };
        }
      },
      locationName,
      departmentName,
      skillName,
      {
        ...weekPeriod,
        cellRendererParams: (params: ICellRendererParams) => {
          return {
            ...params,
            link: `/agency/order-management`,
            navigationExtras: {},
          } as GridCellLinkParams;
        }
      },
      rejectionReason,
      {
        ...attachments,
        cellRendererParams: (params: ICellRendererParams) => {
          return {
            attachments: (params.data as PendingInvoice).attachments,
            attachmentsListConfig: {
              download: (item: Attachment) => {
              },
              preview: (item: Attachment) => {
              },
            }
          } as AttachmentsListParams;
        },
      },
      amount,
    ];
  }

  static getOrganizationPendingInvoicesColDefs(
    {approveInvoice, rejectInvoice}: {
      approveInvoice: (invoice: PendingInvoice) => void,
      rejectInvoice: (invoice: PendingInvoice) => void,
    }
  ): ColDef[] {
    const {
      attachments,
      timesheetType,
      candidateName,
      rejectionReason,
      locationName,
      departmentName,
      skillName,
      weekPeriod,
      pendingInvoiceStatusText,
      amount,
    } = pendingInvoicesColDefsMap;
    return [
      {
        headerName: '',
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        minWidth: 230,
        cellRenderer: GridActionsCellComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          const { pendingInvoiceStatus } = params.data as PendingInvoice;
          const disabled: boolean = [
            PendingInvoiceStatus.Approved,
            PendingInvoiceStatus.Rejected,
          ].includes(pendingInvoiceStatus);

          return {
            actionsConfig: [
              {
                action: approveInvoice,
                title: 'Approve',
                titleClass: 'color-supportive-green-10',
                disabled,
              },
              {
                action: rejectInvoice,
                title: 'Reject',
                titleClass: 'color-supportive-red',
                disabled,
              },
            ],
          } as GridActionsCellConfig
        },
        sortable: false,
        suppressMenu: true,
        filter: false,
        resizable: false,
      },
      timesheetType,
      pendingInvoiceStatusText,
      {
        headerValueGetter: () => 'AGENCY',
        valueGetter: (params: ValueGetterParams) => (params.data as PendingInvoice).agencyName,
      },
      candidateName,
      {
        field: 'orderId',
        headerName: 'ORDER ID',
        width: 110,
        cellRenderer: GridCellLinkComponent,
        cellRendererParams: (params: ICellRendererParams): GridCellLinkParams => {
          const orderId: number = (params.data as PendingInvoice).orderId;

          return {
            ...params,
            link: `/client/order-management`,
            navigationExtras: {
              state: { orderId },
            }
          };
        }
      },
      locationName,
      departmentName,
      skillName,
      weekPeriod,
      rejectionReason,
      {
        ...attachments,
        cellRendererParams: (params: ICellRendererParams) => {
          return {
            attachments: (params.data as PendingInvoice).attachments,
            attachmentsListConfig: {
              download: (item: Attachment) => {
              },
              preview: (item: Attachment) => {
              },
            }
          } as AttachmentsListParams;
        },
      },
      amount,
    ];
  }
}
