import { Injectable } from '@angular/core';
import { GridContainerTabConfig, InvoicesContainerService } from './invoices-container.service';
import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Observable } from 'rxjs';
import { ManualInvoice } from '../../interfaces';
import { ManualInvoicesGridHelper, PendingInvoiceRowDetailsGridHelper, PendingInvoicesGridHelper } from '../../helpers';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoiceState, OrganizationInvoicesGridTab } from '../../enums';
import { Attachment } from '@shared/components/attachments';
import { PendingApprovalGridHelper } from '../../helpers/grid/pending-approval-grid.helper';
import { PendingApprovalInvoice } from '../../interfaces/pending-approval-invoice.interface';

@Injectable()
export class OrganizationInvoicesContainerService extends InvoicesContainerService {
  public getColDefsByTab(
    tabIndex: OrganizationInvoicesGridTab,
    { organizationId }: { organizationId: number | null }
  ): ColDef[] {
    switch (tabIndex) {
      case OrganizationInvoicesGridTab.Manual:
        return ManualInvoicesGridHelper.getOrganizationColDefs({
          approve: ({ id }: ManualInvoice) => this.store.dispatch(new Invoices.ApproveInvoice(id)),
          reject: ({ id }: ManualInvoice) => this.store.dispatch(new Invoices.ShowRejectInvoiceDialog(id)),
          previewAttachment: (attachment) => this.store.dispatch(
            new Invoices.PreviewAttachment(organizationId, attachment)
          ),
          downloadAttachment: (attachment) => this.store.dispatch(
            new Invoices.DownloadAttachment(organizationId, attachment),
          ),
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
            this.store.dispatch(new Invoices.ChangeInvoiceState(invoice, InvoiceState.PendingPayment)),
        });
      case OrganizationInvoicesGridTab.PendingPayment:
        return PendingApprovalGridHelper.getOrganizationColDefs({
          approve: (invoice: PendingApprovalInvoice) =>
            this.store.dispatch(new Invoices.ChangeInvoiceState(invoice, InvoiceState.Paid)),
          actionTitle: 'Pay'
        });
      case OrganizationInvoicesGridTab.Paid:
        return  PendingApprovalGridHelper.getOrganizationColDefs({});
      default:
        return [];
    }
  }

  public getRowData(tabIndex: OrganizationInvoicesGridTab, organizationId: number | null): Observable<void> {
    let action;

    switch (tabIndex) {
      case OrganizationInvoicesGridTab.Manual:
        action = new Invoices.GetManualInvoices(organizationId);
        break;
      case OrganizationInvoicesGridTab.PendingRecords:
        action = new Invoices.GetPendingInvoices(organizationId);
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
    }

    return this.store.dispatch(action);
  }

  public override getGridOptions(tabIndex: OrganizationInvoicesGridTab): GridOptions {
    switch (tabIndex) {
      case OrganizationInvoicesGridTab.PendingRecords:
        return PendingInvoiceRowDetailsGridHelper.getNestedRowsGridOptions();
      case OrganizationInvoicesGridTab.PendingApproval:
      case OrganizationInvoicesGridTab.PendingPayment:
        return PendingApprovalGridHelper.getGridOptions(false);
      case OrganizationInvoicesGridTab.Paid:
        return PendingApprovalGridHelper.getGridOptions(false);
      default:
        return super.getGridOptions(tabIndex);
    }
  }

  public override getTabConfig(tab: OrganizationInvoicesGridTab): GridContainerTabConfig {
    const defaultConfig = super.getTabConfig(tab);

    switch (tab) {
      case OrganizationInvoicesGridTab.PendingRecords:
        return this.createTabConfig({
          groupingEnabled: true,
        });
      default:
        return defaultConfig;
    }
  }
}
