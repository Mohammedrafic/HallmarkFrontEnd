import { Injectable } from '@angular/core';
import { InvoicesContainerService } from './invoices-container.service';
import { ManualInvoicesGridHelper } from '../../helpers';
import { ColDef } from '@ag-grid-community/core';
import { Observable } from 'rxjs';
import { ManualInvoice } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { AgencyInvoicesGridTab } from '../../enums';
import { DialogAction } from '@core/enums';

@Injectable()
export class AgencyInvoicesContainerService extends InvoicesContainerService {
  public getColDefsByTab(tab: AgencyInvoicesGridTab, { organizationId }: { organizationId: number }): ColDef[] {
    switch (tab) {
      case 0:
        return ManualInvoicesGridHelper.getAgencyColDefs({
          edit: (invoice: ManualInvoice) => this.store.dispatch(
            new Invoices.ToggleManualInvoiceDialog(DialogAction.Open, invoice)
          ),
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
      default:
        return [];
    }
  }

  public getRowData(tab: AgencyInvoicesGridTab, organizationId: number | null): Observable<void> {
    let action;

    switch (tab) {
      case AgencyInvoicesGridTab.Manual:
        action = new Invoices.GetManualInvoices(organizationId);
        break;
      case AgencyInvoicesGridTab.All:
        action = new Invoices.GetPendingInvoices(organizationId);
        break;
    }

    return this.store.dispatch(action);
  }
}
