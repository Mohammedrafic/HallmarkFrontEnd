import { Injectable } from '@angular/core';

import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Observable } from 'rxjs';

import { DialogAction } from '@core/enums';
import { InvoicesContainerService } from './invoices-container.service';
import { ManualInvoicesGridHelper } from '../../helpers';
import { GridContainerTabConfig, InvoiceDetail, InvoiceInfoUIItem, ManualInvoice } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { AgencyInvoicesGridTab } from '../../enums';
import { invoiceDetailsColumnDefs, invoiceInfoItems,
  InvoiceSummaryColumnDefs } from '../../constants/invoice-detail.constant';
import { AllInvoicesGridHelper } from '../../helpers/grid/all-invoices-grid.helper';
import { PendingApprovalInvoice } from '../../interfaces/pending-approval-invoice.interface';
import { InvoiceTableType } from '../../enums/invoice-tab.enum';

@Injectable()
export class AgencyInvoicesContainerService extends InvoicesContainerService {
  public getColDefsByTab(
    tab: AgencyInvoicesGridTab,
    { organizationId, canPay, canEdit }: { organizationId: number, canPay: boolean, canEdit: boolean },
    ): ColDef[] {
    switch (tab) {
      case AgencyInvoicesGridTab.Manual:
        return ManualInvoicesGridHelper.getAgencyColDefs({
          edit: (invoice: ManualInvoice) => this.store.dispatch([
            new Invoices.ToggleManualInvoiceDialog(DialogAction.Open, invoice),
            new Invoices.GetInvoicesReasons(organizationId),
          ]),
          delete: ({ id, organizationId }: ManualInvoice) => this.store.dispatch(
            new Invoices.DeleteManualInvoice(id, organizationId)
          ),
          previewAttachment: (attachment) => this.store.dispatch(
            new Invoices.PreviewAttachment(organizationId, attachment)
          ),
          downloadAttachment: (attachment) => this.store.dispatch(
            new Invoices.DownloadAttachment(organizationId, attachment),
          ),
          canEdit,
        });
      case AgencyInvoicesGridTab.All:
        return AllInvoicesGridHelper.getColDefs(
          canPay,
          {
            pay: (invoice: PendingApprovalInvoice) =>
            this.store.dispatch(new Invoices.OpenPaymentAddDialog({
              invoiceId: invoice.invoiceId,
              invoiceNumber: invoice.formattedInvoiceId,
              amount: invoice.amountToPay,
              agencySuffix: invoice.agencySuffix,
            })),
          });
      default:
        return [];
    }
  }

  public override getGridOptions(tabIndex: AgencyInvoicesGridTab, orgId: number | null): GridOptions {
    switch (tabIndex) {
      case AgencyInvoicesGridTab.All:
        return AllInvoicesGridHelper.getGridOptions(true);
      default:
        return super.getGridOptions(tabIndex, orgId);
    }
  }

  public getRowData(tab: AgencyInvoicesGridTab, organizationId: number | null, agencyOrganizationIds: number[] | null): Observable<void> {
    let action;

    switch (tab) {
      case AgencyInvoicesGridTab.Manual:
        action = new Invoices.GetManualInvoices(organizationId,agencyOrganizationIds);
        break;
      case AgencyInvoicesGridTab.All:
        action = new Invoices.GetPendingApproval({ organizationId,agencyOrganizationIds });
        break;
    }

    return this.store.dispatch(action);
  }

  public getDetailColDef(): ColDef[] {
    return invoiceDetailsColumnDefs(true);
  }

  public getDetailSummaryColDef(): ColDef[] {
    return InvoiceSummaryColumnDefs;
  }

  public isAgency(): boolean {
    return true;
  }

  public getDetailsUIItems(data: InvoiceDetail): InvoiceInfoUIItem[] {
    return invoiceInfoItems(data, true);
  }

  public override getTabConfig(tab: AgencyInvoicesGridTab): GridContainerTabConfig {
    return this.createTabConfig({
      manualInvoiceCreationEnabled: [AgencyInvoicesGridTab.Manual].includes(tab),
      groupingEnabled: false,
    });
  }

  public getAllTabId(): number {
    return InvoiceTableType.AgencyAll;
  }
}
