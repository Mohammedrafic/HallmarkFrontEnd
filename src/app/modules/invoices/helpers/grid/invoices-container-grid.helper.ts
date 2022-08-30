import { TypedValueGetterParams } from '../../interfaces/typed-col-def.interface';
import { BaseInvoice } from '../../interfaces';
import { AttachmentsListComponent } from '@shared/components/attachments';
import { GridCellLinkComponent } from '@shared/components/grid/components/grid-cell-link/grid-cell-link.component';
import { ColDef, ICellRendererParams, ValueGetterParams } from '@ag-grid-community/core';
import { PendingInvoice } from '../../interfaces/pending-invoice-record.interface';
import { GridValuesHelper } from '../../../timesheets/helpers';
import { GridCellLinkParams } from '@shared/components/grid/models';
import { TableStatusCellComponent } from '@shared/components/table-status-cell/table-status-cell.component';

type BaseInvoiceColDefsKeys = keyof Pick<BaseInvoice, 'locationName' | 'departmentName' | 'skillName' | 'statusText'>
type CustomColDefsKeys = 'weekPeriod' | 'attachments' | 'candidateName' | 'orderId' | 'unitName';
type ColDefKey = BaseInvoiceColDefsKeys | CustomColDefsKeys;


export class InvoicesContainerGridHelper {
  public static getColDefsMap(agency: boolean): {[key in ColDefKey]: ColDef} {
    return {
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
      statusText: {
        headerName: 'STATUS',
        minWidth: 170,
        cellRenderer: TableStatusCellComponent,
        cellClass: 'status-cell',
        field: 'statusText',
      },

      // custom columns definitions
      attachments: {
        field: 'attachments',
        headerName: 'ATTACHMENTS',
        cellRenderer: AttachmentsListComponent,
        cellClass: 'invoice-records-attachments-list',
      },
      candidateName: {
        headerName: 'CANDIDATE NAME',
        valueGetter: (params: ValueGetterParams) => {
          const record = params.data as BaseInvoice;

          return `${record.candidateLastName}, ${record.candidateFirstName}`
        }
      },
      orderId: {
        field: 'formattedOrderIdFull',
        headerName: 'ORDER ID',
        width: 120,
        cellRenderer: GridCellLinkComponent,
        cellRendererParams: (params: ICellRendererParams): GridCellLinkParams => {
          const orderId: number = (params.data as BaseInvoice).orderId;

          return {
            ...params,
            link: agency ? `/agency/order-management` : `/client/order-management`,
            navigationExtras: {
              state: { orderId },
            }
          };
        }
      },
      unitName: {
        headerName: agency ? 'ORGANIZATION' : 'AGENCY',
        valueGetter: ({ data: { agencyName, organizationName } }: TypedValueGetterParams<BaseInvoice>) =>
          agency ? organizationName : agencyName,
      },
      weekPeriod: {
        headerName: 'WEEK PERIOD',
        width: 140,
        cellRenderer: GridCellLinkComponent,
        valueGetter: (params: ValueGetterParams) => {
          const { weekNumber, weekStartDate: date } = params.data as PendingInvoice;

          return `${weekNumber} - ${GridValuesHelper.formatDate(date, 'cccccc')}<br>${GridValuesHelper.formatDate(date, 'M/d/yy')}`;
        },
        cellRendererParams: (params: ICellRendererParams): GridCellLinkParams => {
          const { id, organizationId } = params.data as BaseInvoice;

          return {
            ...params,
            link: agency ? `/agency/timesheets` : `/client/timesheets`,
            navigationExtras: {
              state: { timesheetId: id, organizationId },
            }
          };
        }
      },
    };
  }
}
