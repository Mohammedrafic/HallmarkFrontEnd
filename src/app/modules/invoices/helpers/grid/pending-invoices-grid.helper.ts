import { ICellRendererParams } from '@ag-grid-community/core';
import { PendingInvoice } from '../../interfaces/pending-invoice-record.interface';
import { Attachment, AttachmentsListParams } from '@shared/components/attachments';
import { TypedColDef } from '../../interfaces/typed-col-def.interface';
import { InvoicesContainerGridHelper } from './invoices-container-grid.helper';
import {
  ToggleRowExpansionHeaderCellComponent
} from '../../components/grid-icon-cell/toggle-row-expansion-header-cell.component';
import { numberValueFormatter } from '../../constants';

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
      locationName,
      departmentName,
      skillName,
      weekPeriod,
      unitName,
      orderId
    } = InvoicesContainerGridHelper.getColDefsMap(false);
    return [
      {
        field: 'timesheetTypeText',
        headerName: 'TYPE',
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        minWidth: 240,
        headerComponent: ToggleRowExpansionHeaderCellComponent,
        cellRenderer: 'agGroupCellRenderer',
      },
      unitName,
      candidateName,
      orderId,
      locationName,
      {
        ...attachments,
        cellRendererParams: (params: ICellRendererParams): AttachmentsListParams => {
          return {
            attachments: (params.data as PendingInvoice).attachments,
            attachmentsListConfig: {
              download: downloadAttachment,
              preview: previewAttachment,
            }
          };
        },
        cellClass: 'invoice-records-attachments-list',
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
      },
      {
        field: 'hours',
        headerName: 'HOURS',
        width: 110,
        type: 'rightAligned',
        cellClass: 'font-weight-bold align-right',
        valueFormatter: numberValueFormatter,
      },
      {
        field: 'miles',
        headerName: 'MILES',
        width: 110,
        type: 'rightAligned',
        cellClass: 'font-weight-bold align-right',
        valueFormatter: numberValueFormatter,
      },
      {
        field: 'amount',
        headerName: 'AMOUNT',
        width: 110,
        type: 'rightAligned',
        cellClass: 'font-weight-bold align-right',
        valueFormatter: numberValueFormatter,
      },
    ];
  }
}
