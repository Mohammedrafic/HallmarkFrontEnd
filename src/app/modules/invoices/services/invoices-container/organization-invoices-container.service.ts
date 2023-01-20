import { Injectable } from '@angular/core';

import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Observable } from 'rxjs';

import { Attachment } from '@shared/components/attachments';
import {
  invoiceDetailsColumnDefs, invoiceInfoItems, invoiceSummaryColumnDefs,
} from '../../constants/invoice-detail.constant';
import { InvoiceState, OrganizationInvoicesGridTab } from '../../enums';
import { ManualInvoicesGridHelper, PendingInvoiceRowDetailsGridHelper, PendingInvoicesGridHelper } from '../../helpers';
import { PendingApprovalGridHelper } from '../../helpers/grid/pending-approval-grid.helper';
import {
  GridContainerTabConfig, InvoiceAttachment, InvoiceDetail, InvoiceInfoUIItem, ManualInvoice, PendingApprovalInvoice,
} from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesContainerService } from './invoices-container.service';

@Injectable()
export class OrganizationInvoicesContainerService extends InvoicesContainerService {
  public getColDefsByTab(
    tabIndex: OrganizationInvoicesGridTab,
    { organizationId, canPay, canEdit }: { organizationId: number, canPay: boolean, canEdit: boolean }
  ): ColDef[] {
    switch (tabIndex) {
      case OrganizationInvoicesGridTab.Manual:
        return ManualInvoicesGridHelper.getOrganizationColDefs({
          approve: ({ id }: ManualInvoice) =>
            this.store.dispatch(new Invoices.ApproveInvoice(id)),
          reject: ({ id }: ManualInvoice) =>
            this.store.dispatch(new Invoices.ShowRejectInvoiceDialog(id)),
          previewAttachment: (attachment) => this.store.dispatch(
            new Invoices.PreviewAttachment(organizationId, attachment)
          ),
          downloadAttachment: (attachment) => this.store.dispatch(
            new Invoices.DownloadAttachment(organizationId, attachment),
          ),
          canEdit,
        });
      case OrganizationInvoicesGridTab.PendingRecords:
        return PendingInvoicesGridHelper.getOrganizationColDefs({
          previewAttachment: (attachment: Attachment) => this.store.dispatch(
            new Invoices.PreviewAttachment(organizationId, attachment)
          ),
          downloadAttachment: (attachment: Attachment) => this.store.dispatch(
            new Invoices.DownloadAttachment(organizationId, attachment),
          ),
        });
      case OrganizationInvoicesGridTab.PendingApproval:
        return PendingApprovalGridHelper.getOrganizationColDefs({
          approve: (invoice: PendingApprovalInvoice) =>
            this.store.dispatch(new Invoices.ChangeInvoiceState(invoice.invoiceId, InvoiceState.PendingPayment)),
          actionEnabled: canEdit,
        });
      case OrganizationInvoicesGridTab.PendingPayment:
        return PendingApprovalGridHelper.getOrganizationColDefs({
          approve: (invoice: PendingApprovalInvoice) =>
            this.store.dispatch(new Invoices.OpenPaymentAddDialog({
              invoiceId: invoice.invoiceId,
              invoiceNumber: invoice.formattedInvoiceId,
              amount: invoice.amountToPay,
              agencySuffix: invoice.agencySuffix,
            })),
          actionTitle: 'Pay',
          actionEnabled: canPay,
        });
      case OrganizationInvoicesGridTab.Paid:
        return  PendingApprovalGridHelper.getOrganizationPaidColDefs();
      case OrganizationInvoicesGridTab.All:
        return PendingApprovalGridHelper.getOrganizationAllColDefs({
          approve: (invoice: PendingApprovalInvoice) =>
          this.store.dispatch(new Invoices.ChangeInvoiceState(invoice.invoiceId, InvoiceState.PendingPayment)),
          pay: (invoice: PendingApprovalInvoice) =>
          this.store.dispatch(new Invoices.OpenPaymentAddDialog({
            invoiceId: invoice.invoiceId,
            invoiceNumber: invoice.formattedInvoiceId,
            amount: invoice.amountToPay,
            agencySuffix: invoice.agencySuffix,
          })),
          canEdit,
          canPay,
        });
      default:
        return [];
    }
  }

  public getRowData(tabIndex: OrganizationInvoicesGridTab, organizationId: number | null): Observable<void> {
    let action;

    switch (tabIndex) {
      case OrganizationInvoicesGridTab.PendingRecords:
        action = new Invoices.GetPendingInvoices(organizationId);
        break;
      case OrganizationInvoicesGridTab.Manual:
        action = new Invoices.GetManualInvoices(organizationId);
        break;
      case OrganizationInvoicesGridTab.PendingApproval:
        action = new Invoices.GetPendingApproval({
          organizationId,
          invoiceState: InvoiceState.SubmittedPendingApproval,
        });
        break;
      case OrganizationInvoicesGridTab.PendingPayment:
        action = new Invoices.GetPendingApproval({
          organizationId,
          invoiceState: InvoiceState.PendingPayment,
        });
        break;
      case OrganizationInvoicesGridTab.Paid:
        action = new Invoices.GetPendingApproval({
          organizationId,
          invoiceState: InvoiceState.Paid,
        });
        break;
      case OrganizationInvoicesGridTab.All:
        action = new Invoices.GetPendingApproval({
          organizationId,
          invoiceState: undefined,
        });
        break;
    }

    return this.store.dispatch(action);
  }

  public override getGridOptions(tabIndex: OrganizationInvoicesGridTab, organizationId: number | null): GridOptions {
    switch (tabIndex) {
      case OrganizationInvoicesGridTab.PendingRecords:
        return PendingInvoiceRowDetailsGridHelper.getRowDetailsGridOptions({
          previewExpensesAttachment: (attachment: InvoiceAttachment) => this.store.dispatch(
            new Invoices.PreviewAttachment(organizationId, attachment)
          ),
          downloadExpensesAttachment: (attachment: InvoiceAttachment) => this.store.dispatch(
            new Invoices.DownloadAttachment(organizationId, attachment),
          ),
          previewMilesAttachments: (invoiceId: number) => (attachment: InvoiceAttachment) => this.store.dispatch(
            new Invoices.PreviewMilesAttachment(invoiceId, null, attachment)
          ),
          downloadMilesAttachments: (invoiceId: number) => (attachment: InvoiceAttachment) => this.store.dispatch(
            new Invoices.DownloadMilesAttachment(invoiceId, null, attachment)
          ),
        });
      case OrganizationInvoicesGridTab.PendingApproval:
      case OrganizationInvoicesGridTab.PendingPayment:
        return PendingApprovalGridHelper.getGridOptions(false);
      case OrganizationInvoicesGridTab.Paid:
        return PendingApprovalGridHelper.getGridOptions(false);
      case OrganizationInvoicesGridTab.All:
        return PendingApprovalGridHelper.getGridOptions(false);
      default:
        return super.getGridOptions(tabIndex, organizationId);
    }
  }

  public override getTabConfig(tab: OrganizationInvoicesGridTab): GridContainerTabConfig {
    const defaultConfig = super.getTabConfig(tab);

    switch (tab) {
      case OrganizationInvoicesGridTab.Manual:
        return this.createTabConfig({
          manualInvoiceCreationEnabled: true,
        });
      case OrganizationInvoicesGridTab.PendingRecords:
        return this.createTabConfig({
          groupingEnabled: true,
          manualInvoiceCreationEnabled: false,
        });
      default:
        return defaultConfig;
    }
  }

  public getDetailColDef(): ColDef[] {
    return invoiceDetailsColumnDefs(false);
  }

  public getDetailSummaryColDef(location: string): ColDef[] {
    return invoiceSummaryColumnDefs(location);
  }

  public isAgency(): boolean {
    return false;
  }

  public getDetailsUIItems(data: InvoiceDetail): InvoiceInfoUIItem[] {
    return invoiceInfoItems(data, false);
  }
}
