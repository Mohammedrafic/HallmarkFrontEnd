import { DialogAction } from '@core/enums';
import { DataSourceItem, FileForUpload } from '@core/interface';
import { OrganizationRegion } from '@shared/models/organization.model';
import { Attachment } from '@shared/components/attachments';
import { ExportPayload } from '@shared/models/export.model';

import {
  GetPendingApprovalParams,
  GroupInvoicesParams,
  InvoicesFilterState,
  ManualInvoice,
  ManualInvoicePostDto,ManualInvoicePutDto,
  PrintingPostDto
} from '../../interfaces';
import { INVOICES_ACTIONS, InvoicesTableFiltersColumns } from '../../enums';
import { PendingApprovalInvoice } from '../../interfaces/pending-approval-invoice.interface';

export namespace Invoices {
  export class GetManualInvoices {
    static readonly type = INVOICES_ACTIONS.GET_MANUAL_INVOICES;

    constructor(
      public readonly organizationId: number | null
    ) {
    }
  }

  export class DetailExport {
    static readonly type = INVOICES_ACTIONS.DETAIL_EXPORT;

    constructor(public readonly payload: ExportPayload) { }
  }

  export class GetPendingInvoices {
    static readonly type = INVOICES_ACTIONS.GET_PENDING_INVOICES;

    constructor(public readonly organizationId: number | null) {
    }
  }

  export class GetPendingApproval {
    static readonly type = INVOICES_ACTIONS.GET_PENDING_APPROVAL;

    constructor(
      public readonly payload: GetPendingApprovalParams,
    ) {
    }
  }

  export class ToggleInvoiceDialog {
    static readonly type = INVOICES_ACTIONS.TOGGLE_INVOICE_DIALOG;

    constructor(
      public readonly action: DialogAction,
      public readonly payload?: { organizationIds?: number[]; invoiceIds: number[] },
      public readonly prevId?: number | null,
      public readonly nextId?: number | null
    ) {
    }
  }

  export class ToggleManualInvoiceDialog {
    static readonly type = INVOICES_ACTIONS.ToggleManualInvoice;

    constructor(
      public readonly action: DialogAction,
      public readonly invoice?: ManualInvoice,
    ) {}
  }

  export class UpdateFiltersState {
    static readonly type = INVOICES_ACTIONS.UPDATE_FILTERS_STATE;

    constructor(
      public readonly payload?: InvoicesFilterState | null,
    ) {}
  }

  export class ResetFiltersState {
    static readonly type = INVOICES_ACTIONS.RESET_FILTERS_STATE;
  }

  export class GetFiltersDataSource {
    static readonly type = INVOICES_ACTIONS.GET_FILTERS_DATA_SOURCE;
  }

  export class SetFiltersDataSource {
    static readonly type = INVOICES_ACTIONS.SET_FILTERS_DATA_SOURCE;

    constructor(
      public readonly columnKey: InvoicesTableFiltersColumns,
      public readonly dataSource: DataSourceItem[] | OrganizationRegion[]
    ) {
    }
  }

  export class GetInvoicesReasons {
    static readonly type = INVOICES_ACTIONS.GetReasons;

    constructor(
      public readonly orgId: number | null,
    ) {}
  }

  export class GetManInvoiceMeta {
    static readonly type = INVOICES_ACTIONS.GetMeta;

    constructor(
      public readonly orgId?: number,
    ) {}
  }

  export class SaveManulaInvoice {
    static readonly type = INVOICES_ACTIONS.SaveManualinvoice;

    constructor(
      public readonly payload: ManualInvoicePostDto,
      public readonly files: FileForUpload[],
      public readonly isAgency: boolean,
    ) {}
  }

  export class UpdateManualInvoice {
    static readonly type = INVOICES_ACTIONS.UpdateManualInvoice;

    constructor(
      public readonly payload: ManualInvoicePutDto,
      public readonly files: FileForUpload[],
      public readonly filesToDelete: Attachment[],
      public readonly isAgency: boolean,
    ) {}
  }

  export class DeleteManualInvoice {
    static readonly type = INVOICES_ACTIONS.DeleteManualInvoice;

    constructor(
      public readonly id: number,
      public readonly organizationId: number | null,
    ) {}
  }

  export class GetOrganizations {
    static readonly type = INVOICES_ACTIONS.GetOrganizations;
  }

  export class GetOrganizationStructure {
    static readonly type = INVOICES_ACTIONS.GetOrganizationStructure;

    constructor(
      public readonly orgId: number,
      public readonly isAgency: boolean,
    ) {}
  }

  export class SelectOrganization {
    static readonly type = INVOICES_ACTIONS.SelectOrganization;

    constructor(public readonly id: number) {
    }
  }

  export class ClearAttachments {
    static readonly type = INVOICES_ACTIONS.ClearManInvoiceAttachments;
  }

  export class SubmitInvoice {
    static readonly type = INVOICES_ACTIONS.SubmitInvoice;

    constructor(
      public readonly invoiceId: number,
      public readonly orgId: number | null,
    ) {
    }
  }

  export class ApproveInvoice {
    static readonly type = INVOICES_ACTIONS.ApproveInvoice;

    constructor(
      public readonly invoiceId: number,
    ) {
    }
  }

  export class ApproveInvoices {
    static readonly type = INVOICES_ACTIONS.ApproveInvoices;

    constructor(
      public readonly invoiceIds: number[],
    ) {
    }
  }

  export class RejectInvoice {
    static readonly type = INVOICES_ACTIONS.RejectInvoice;

    constructor(
      public readonly invoiceId: number,
      public readonly rejectionReason: string,
    ) {
    }
  }

  export class PreviewAttachment {
    static readonly type = INVOICES_ACTIONS.PreviewAttachment;

    constructor(
      public readonly organizationId: number | null,
      public readonly payload: Attachment,
    ) {
    }
  }

  export class DownloadAttachment {
    static readonly type = INVOICES_ACTIONS.DownloadAttachment;

    constructor(
      public readonly organizationId: number | null,
      public readonly payload: Attachment,
    ) {
    }
  }

  export class DeleteAttachment {
    static readonly type = INVOICES_ACTIONS.DeleteAttachment;

    constructor(
      public readonly fileId: number,
      public readonly invoiceId: number,
      public readonly organizationId: number | null,
    ) {
    }
  }

  export class ShowRejectInvoiceDialog {
    static readonly type = INVOICES_ACTIONS.OpenRejectReasonDialog;

    constructor(
      public readonly invoiceId: number,
    ) {
    }
  }

  export class GroupInvoices {
    static readonly type = INVOICES_ACTIONS.GroupInvoices;

    constructor(
      public readonly payload: GroupInvoicesParams,
    ) {
    }
  }

  export class ChangeInvoiceState {
    static readonly type = INVOICES_ACTIONS.ApprovePendingApprovalInvoice;

    constructor(
      public readonly invoiceId: number,
      public readonly stateId: number,
    ) {
    }
  }

  export class GetPrintData {
    static readonly type = INVOICES_ACTIONS.GetPrintingData;

    constructor (
      public readonly body: PrintingPostDto,
      public readonly isAgency: boolean,
      ) {}
  }
}
