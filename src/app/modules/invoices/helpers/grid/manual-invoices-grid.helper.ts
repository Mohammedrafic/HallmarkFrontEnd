import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { TypedValueGetterParams } from '@core/interface';

import { Attachment, AttachmentAction, AttachmentsListParams } from '@shared/components/attachments';
import { GridActionsCellComponent, GridActionsCellConfig } from '@shared/components/grid/cell-renderers/grid-actions-cell';
import { AgencyStatus } from '@shared/enums/status';
import {
  amountColDef,
  commentColDef,
  linkedInvoiceIdColDef,
  reasonCodeColDef,
  rejectionReasonColDef,
  vendorFeeAppliedColDef,
} from '../../constants';
import { InvoiceRecordType } from '../../enums';
import { PendingInvoiceStatus } from '../../enums/invoice-status.enum';
import { InvoiceAttachment, ManualInvoice, TypedColDef } from '../../interfaces';
import {
  InvoicesContainerGridHelper,
} from './invoices-container-grid.helper';

interface GetManualInvoicesColDefsConfig {
  previewAttachment: (attachment: Attachment) => void,
  downloadAttachment: (attachment: Attachment) => void,
}

export interface OrganizationGetManualInvoicesColDefsConfig extends GetManualInvoicesColDefsConfig {
  approve: (invoice: ManualInvoice) => void,
  reject: (invoice: ManualInvoice) => void,
  canEdit: boolean,
}
type InvoiceAttachmentAction = AttachmentAction<InvoiceAttachment>;
export interface AgencyGetManualInvoicesColDefsConfig {
  edit: (invoice: ManualInvoice) => void,
  delete: (invoice: ManualInvoice) => void,
  previewAttachment: (organizationId: number) => InvoiceAttachmentAction;
  downloadAttachment: (organizationId: number) => InvoiceAttachmentAction;
  canEdit: boolean,
}

const invoiceRecordDescriptionMap: Record<InvoiceRecordType, string> = {
  [InvoiceRecordType.ManualInvoiceRecord]: 'Manual',
};

const commonColumn: ColDef = {
  sortable: true,
  comparator: () => 0,
};

const invoiceRecordTypeColDef: TypedColDef<ManualInvoice> = {
  field: 'invoiceRecordType',
  headerName: 'TYPE',
  valueGetter: (params: TypedValueGetterParams<ManualInvoice>) =>
    invoiceRecordDescriptionMap[params.data.invoiceRecordType],
  sortable: false,
};

export class ManualInvoicesGridHelper {
  static getAgencyColDefs({
      edit,
      delete: deleteInvoice,
      downloadAttachment,
      previewAttachment,
      canEdit,
  }: AgencyGetManualInvoicesColDefsConfig): TypedColDef<ManualInvoice>[] {
    const {
      attachments,
      candidateName,
      regionName,
      locationName,
      departmentName,
      skillName,
      weekPeriod,
      statusText,
      orderId,
      unitName,
    } = InvoicesContainerGridHelper.getColDefsMap(true);
    return [
      {
        headerName: '',
        width: 150,
        cellRenderer: GridActionsCellComponent,
        cellRendererParams: (params: ICellRendererParams): GridActionsCellConfig<ManualInvoice> => {
          const { status } = params.data as ManualInvoice;

          return {
            actionsConfig: canEdit ? [
              {
                action: edit,
                iconName: 'edit',
                iconClass: 'color-primary-active-blue-10',
                disabled: [PendingInvoiceStatus.Approved,PendingInvoiceStatus.Rejected].includes(status),
              },
              {
                action: deleteInvoice,
                iconName: 'trash-2',
                iconClass: 'color-supportive-red',
                disabled: [PendingInvoiceStatus.Approved].includes(status),
              },
            ] : [],
          };
        },
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        resizable: false,
      },
      invoiceRecordTypeColDef,
      statusText,
      candidateName,
      orderId,
      regionName,
      locationName,
      departmentName,
      skillName,
      {
        ...weekPeriod,
        minWidth: 150,
        ...commonColumn,
      },
      vendorFeeAppliedColDef,
      rejectionReasonColDef,
      commentColDef,
      linkedInvoiceIdColDef,
      reasonCodeColDef,
      {
        ...attachments,
        cellRendererParams: (params: ICellRendererParams) => {
          const { attachments, organizationId } = params.data as ManualInvoice;
          return {
            attachments,
            attachmentsListConfig: {
              download: downloadAttachment(organizationId),
              preview: previewAttachment(organizationId),
            },
          }
        },
        ...commonColumn,
      },
      amountColDef,
      unitName,
    ];
  }

  static getOrganizationColDefs(
    { approve, reject, downloadAttachment, previewAttachment, canEdit }: OrganizationGetManualInvoicesColDefsConfig
  ): TypedColDef<ManualInvoice>[] {
    const {
      attachments,
      candidateName,
      regionName,
      locationName,
      departmentName,
      skillName,
      weekPeriod,
      statusText,
      unitName,
      orderId,
    } = InvoicesContainerGridHelper.getColDefsMap(false);
    return [
      {
        headerName: '',
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        minWidth: 230,
        cellRenderer: GridActionsCellComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          const { status, agencyStatus } = params.data as ManualInvoice;

          return {
            actionsConfig: [
              {
                action: approve,
                title: 'Approve',
                titleClass: 'color-supportive-green-10',
                disabled: [
                  PendingInvoiceStatus.Approved,
                ].includes(status) || agencyStatus === AgencyStatus.Terminated || !canEdit,
              },
              {
                action: reject,
                title: 'Reject',
                titleClass: 'color-supportive-red',
                disabled: [
                  PendingInvoiceStatus.Approved,
                  PendingInvoiceStatus.Rejected,
                ].includes(status) || agencyStatus === AgencyStatus.Terminated || !canEdit,
              },
            ],
          } as GridActionsCellConfig;
        },
        sortable: false,
        suppressMenu: true,
        filter: false,
        resizable: false,
      },
      invoiceRecordTypeColDef,
      statusText,
      unitName,
      candidateName,
      orderId,
      regionName,
      locationName,
      departmentName,
      skillName,
      weekPeriod,
      vendorFeeAppliedColDef,
      rejectionReasonColDef,
        commentColDef,
      reasonCodeColDef,
      {
        ...attachments,
        cellRendererParams: (params: ICellRendererParams): AttachmentsListParams => {
          return {
            attachments: (params.data as ManualInvoice).attachments,
            attachmentsListConfig: {
              download: downloadAttachment,
              preview: previewAttachment,
            },
          };
        },
      },
      amountColDef,
    ];
  }
}
