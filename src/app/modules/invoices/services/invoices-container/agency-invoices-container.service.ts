import { Injectable } from '@angular/core';

import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Observable } from 'rxjs';

import { DialogAction } from '@core/enums';
import { InvoicesContainerService } from './invoices-container.service';
import { ManualInvoicesGridHelper } from '../../helpers';
import { InvoiceDetail, InvoiceInfoUIItem, ManualInvoice } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { AgencyInvoicesGridTab, InvoiceState } from '../../enums';
import { invoiceDetailsColumnDefs, invoiceInfoItems, invoiceSummaryColumnDefs } from '../../constants/invoice-detail.constant';
import { AllInvoicesGridHelper } from '../../helpers/grid/all-invoices-grid.helper';
import { GridContainerTabConfig } from '../../interfaces/grid-container-tab-config.interface';
import { PendingApprovalInvoice } from '../../interfaces/pending-approval-invoice.interface';

@Injectable()
export class AgencyInvoicesContainerService extends InvoicesContainerService {
  public getColDefsByTab(
    tab: AgencyInvoicesGridTab,
    { organizationId, canPay }: { organizationId: number, canPay: boolean },
    ): ColDef[] {
    switch (tab) {
      case 0:
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
        });
      case 1:
        return AllInvoicesGridHelper.getColDefs(
          canPay,
          {
            pay: (invoice: PendingApprovalInvoice) =>
            this.store.dispatch(
              new Invoices.ChangeInvoiceState(invoice.invoiceId, InvoiceState.Paid, invoice.organizationId)),
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

  public getRowData(tab: AgencyInvoicesGridTab, organizationId: number | null): Observable<void> {
    let action;

    switch (tab) {
      case AgencyInvoicesGridTab.Manual:
        action = new Invoices.GetManualInvoices(organizationId);
        break;
      case AgencyInvoicesGridTab.All:
        action = new Invoices.GetPendingApproval({ organizationId });
        break;
    }

    return this.store.dispatch(action);
  }

  public getDetailColDef(): ColDef[] {
    return invoiceDetailsColumnDefs(true);
  }

  public getDetailSummaryColDef(location: string): ColDef[] {
    return invoiceSummaryColumnDefs(location);
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
}
