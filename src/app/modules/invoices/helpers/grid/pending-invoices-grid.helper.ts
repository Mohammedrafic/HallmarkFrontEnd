import { ICellRendererParams, CheckboxSelectionCallbackParams, ColDef } from '@ag-grid-community/core';

import { AgencyStatus } from '@shared/enums/status';
import { PendingInvoice } from '../../interfaces/pending-invoice-record.interface';
import { Attachment, AttachmentsListParams } from '@shared/components/attachments';
import { InvoicesContainerGridHelper } from './invoices-container-grid.helper';
import {
  ToggleRowExpansionHeaderCellComponent,
} from '../../components/grid-icon-cell/toggle-row-expansion-header-cell.component';
import { CurrencyFormatter, numberValueFormatter } from '../../constants';
import { TypedColDef } from '../../interfaces';

const commonColumn: ColDef = {
  sortable: true,
  comparator: () => 0,
};

interface GetPendingInvoiceRecordsColDefsConfig {
  previewAttachment: (attachment: Attachment) => void,
  downloadAttachment: (attachment: Attachment) => void,
}

export class PendingInvoicesGridHelper {
  public static getOrganizationColDefs(
    { previewAttachment, downloadAttachment }: GetPendingInvoiceRecordsColDefsConfig
  ): TypedColDef<PendingInvoice>[] {
    const {
      attachments,
      candidateName,
      regionName,
      locationName,
      departmentName,
      skillName,
      weekPeriod,
      unitName,
      orderId,
    } = InvoicesContainerGridHelper.getColDefsMap(false);
    return [
      {
        field: 'timesheetTypeText',
        headerName: 'TYPE',
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: (params: CheckboxSelectionCallbackParams) => {
          const { agencyStatus } = params.data as PendingInvoice;
          return agencyStatus !== AgencyStatus.Terminated;
        },
        minWidth: 240,
        headerComponent: ToggleRowExpansionHeaderCellComponent,
        cellRenderer: 'agGroupCellRenderer',
        ...commonColumn,
      },
      unitName,
      candidateName,
      orderId,
      regionName,
      locationName,
      {
        ...attachments,
        cellRendererParams: (params: ICellRendererParams): AttachmentsListParams => {
          return {
            attachments: (params.data as PendingInvoice).attachments,
            attachmentsListConfig: {
              download: downloadAttachment,
              preview: previewAttachment,
            },
          };
        },
        cellClass: 'invoice-records-attachments-list',
        ...commonColumn,
      },
      departmentName,
      skillName,
      weekPeriod,
      {
        field: 'rate',
        headerName: 'RATE',
        width: 110,
        type: 'rightAligned',
        cellClass: 'font-weight-bold align-right',
        valueFormatter: numberValueFormatter,
        ...commonColumn,
      },
      {
        field: 'hours',
        headerName: 'HOURS',
        width: 110,
        type: 'rightAligned',
        cellClass: 'font-weight-bold align-right',
        valueFormatter: numberValueFormatter,
        ...commonColumn,
      },
      {
        field: 'miles',
        headerName: 'MILES',
        width: 110,
        type: 'rightAligned',
        cellClass: 'font-weight-bold align-right',
        valueFormatter: numberValueFormatter,
        ...commonColumn,
      },
      {
        field: 'amount',
        headerName: 'AMOUNT',
        width: 110,
        cellClass: 'font-weight-bold',
        valueFormatter: CurrencyFormatter,
        ...commonColumn,
      },
    ];
  }
}
