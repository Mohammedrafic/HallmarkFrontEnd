import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { AgencyInvoicesGridTab, OrganizationInvoicesGridTab } from '../../enums';
import { InvoiceDetail, InvoiceInfoUIItem } from '../../interfaces';

export interface GridContainerTabConfig {
  groupingEnabled?: boolean;
}

export abstract class InvoicesContainerService {
  constructor(
    protected readonly store: Store,
  ) {
  }

  public abstract getColDefsByTab(tab: AgencyInvoicesGridTab | OrganizationInvoicesGridTab, config: object): ColDef[];

  public abstract getDetailColDef(): ColDef[];

  public abstract getDetailSummaryColDef(summaryLocation: string): ColDef[];

  public abstract isAgency(): boolean;

  public abstract getDetailsUIItems(data: InvoiceDetail): InvoiceInfoUIItem[];

  public abstract getRowData(
    tabIndex: AgencyInvoicesGridTab | OrganizationInvoicesGridTab,
    organizationId: number | null
  ): Observable<void>;

  public getGridOptions(tab: AgencyInvoicesGridTab | OrganizationInvoicesGridTab): GridOptions {
    return {};
  }

  public getTabConfig(tab: AgencyInvoicesGridTab | OrganizationInvoicesGridTab): GridContainerTabConfig {
    return this.createTabConfig();
  }

  protected createTabConfig(config: GridContainerTabConfig = {}): GridContainerTabConfig {
    return {
      groupingEnabled: false,
      ...config,
    }
  }
}
