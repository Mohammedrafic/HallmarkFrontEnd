import { ColDef, ICellRendererParams, ValueGetterParams } from '@ag-grid-community/core';
import { TypedValueGetterParams } from '@core/interface';

import { AttachmentsListComponent } from '@shared/components/attachments';
import { GridCellLinkComponent } from '@shared/components/grid/components/grid-cell-link/grid-cell-link.component';
import { GridCellLinkParams } from '@shared/components/grid/models';
import { TableStatusCellComponent } from '@shared/components/table-status-cell/table-status-cell.component';
import { GridValuesHelper } from '@core/helpers';
import { GridOrderIdCellComponent } from '../../components/grid-order-id-cell/grid-order-id-cell.component';
import { BaseInvoice } from '../../interfaces';
import { PendingInvoice } from '../../interfaces';

type BaseInvoiceColDefsKeys = keyof Pick<
  BaseInvoice,
  'regionName' |
  'locationName' |
  'departmentName' |
  'skillName' |
  'statusText'>
type CustomColDefsKeys = 'weekPeriod' | 'attachments' | 'candidateName' | 'orderId' | 'unitName';
type ColDefKey = BaseInvoiceColDefsKeys | CustomColDefsKeys;

const commonColumn: ColDef = {
  sortable: true,
};

export class InvoicesContainerGridHelper {
  public static getColDefsMap(agency: boolean): {[key in ColDefKey]: ColDef} {
    return {
      regionName: {
        field: 'regionName',
        headerName: 'Region',
        ...commonColumn,
      },
      locationName: {
        field: 'locationName',
        headerName: 'Location',
        ...commonColumn,
      },
      departmentName: {
        field: 'departmentName',
        headerName: 'DEPARTMENT',
        ...commonColumn,
      },
      skillName: {
        field: 'skillName',
        headerName: 'SKILL',
        ...commonColumn,
      },
      statusText: {
        headerName: 'STATUS',
        minWidth: 170,
        cellRenderer: TableStatusCellComponent,
        cellClass: 'status-cell',
        field: 'statusText',
        ...commonColumn,
      },

      // custom columns definitions
      attachments: {
        field: 'attachments',
        headerName: 'ATTACHMENTS',
        cellRenderer: AttachmentsListComponent,
        cellClass: 'invoice-records-attachments-list',
        ...commonColumn,
      },
      candidateName: {
        headerName: 'CANDIDATE NAME',
        valueGetter: (params: ValueGetterParams) => {
          const record = params.data as BaseInvoice;

          return `${record.candidateLastName}, ${record.candidateFirstName}`;
        },
        ...commonColumn,
      },
      orderId: {
        field: 'formattedOrderIdFull',
        headerName: 'ORDER ID',
        width: 120,
        cellRenderer: GridOrderIdCellComponent,
        ...commonColumn,
      },
      unitName: {
        headerName: agency ? 'ORGANIZATION' : 'AGENCY',
        valueGetter: ({ data: { agencyName, organizationName } }: TypedValueGetterParams<BaseInvoice>) =>
          agency ? organizationName : agencyName,
        ...commonColumn,
      },
      weekPeriod: {
        headerName: 'WEEK PERIOD',
        width: 140,
        cellRenderer: GridCellLinkComponent,
        valueGetter: (params: ValueGetterParams) => {
          const { weekNumber, weekStartDate: date } = params.data as PendingInvoice;

          return `${weekNumber} - ${GridValuesHelper.formatDate(date, 'cccccc')}<br>
          ${GridValuesHelper.formatDate(date, 'MM/dd/yyyy')}`;
        },
        cellRendererParams: (params: ICellRendererParams): GridCellLinkParams => {
          const { id, organizationId } = params.data as BaseInvoice;

          return {
            ...params,
            link: agency ? `/agency/timesheets` : `/client/timesheets`,
            navigationExtras: {
              state: { timesheetId: id, organizationId },
            },
          };
        },
        ...commonColumn,
      },
    };
  }
}
