import { Injectable } from '@angular/core';
import { InvoicesContainerService } from './invoices-container.service';
import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Observable } from 'rxjs';
import { InvoiceAttachment, InvoiceDetail, InvoiceInfoUIItem, ManualInvoice } from '../../interfaces';
import { ManualInvoicesGridHelper, PendingInvoiceRowDetailsGridHelper, PendingInvoicesGridHelper } from '../../helpers';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoiceState, OrganizationInvoicesGridTab } from '../../enums';
import { Attachment } from '@shared/components/attachments';
import { PendingApprovalGridHelper } from '../../helpers/grid/pending-approval-grid.helper';
import { PendingApprovalInvoice } from '../../interfaces/pending-approval-invoice.interface';
import { invoiceDetailsColumnDefs, invoiceInfoItems, invoiceSummaryColumnDefs } from '../../constants/invoice-detail.constant';
import { GridContainerTabConfig } from '../../interfaces/grid-container-tab-config.interface';

@Injectable()
export class OrganizationInvoicesContainerService extends InvoicesContainerService {
  public getColDefsByTab(
    tabIndex: OrganizationInvoicesGridTab,
    { organizationId }: { organizationId: number }
  ): ColDef[] {
    switch (tabIndex) {
      case OrganizationInvoicesGridTab.Manual:
        return ManualInvoicesGridHelper.getOrganizationColDefs({
          approve: ({ id }: ManualInvoice) =>
            this.store.dispatch(new Invoices.ApproveInvoice(id))
              .subscribe(
                () => this.store.dispatch(new Invoices.CheckManualInvoicesExist(organizationId))
              ),
          reject: ({ id }: ManualInvoice) =>
            this.store.dispatch(new Invoices.ShowRejectInvoiceDialog(id))
              .subscribe(
                () => this.store.dispatch(new Invoices.CheckManualInvoicesExist(organizationId))
              ),
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
            this.store.dispatch(new Invoices.ChangeInvoiceState(invoice.invoiceId, InvoiceState.PendingPayment)),
        });
      case OrganizationInvoicesGridTab.PendingPayment:
        return PendingApprovalGridHelper.getOrganizationColDefs({
          approve: (invoice: PendingApprovalInvoice) =>
            this.store.dispatch(new Invoices.ChangeInvoiceState(invoice.invoiceId, InvoiceState.Paid)),
          actionTitle: 'Pay'
        });
      case OrganizationInvoicesGridTab.Paid:
        return  PendingApprovalGridHelper.getOrganizationPaidColDefs();
      case OrganizationInvoicesGridTab.All:
        return PendingApprovalGridHelper.getOrganizationAllColDefs({
          approve: (invoice: PendingApprovalInvoice) =>
          this.store.dispatch(new Invoices.ChangeInvoiceState(invoice.invoiceId, InvoiceState.PendingPayment)),
          pay: (invoice: PendingApprovalInvoice) =>
          this.store.dispatch(new Invoices.ChangeInvoiceState(invoice.invoiceId, InvoiceState.Paid)),
        })
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
          manualInvoiceCreationEnabled: true,
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
