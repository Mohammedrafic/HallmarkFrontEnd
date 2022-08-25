import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { AgencyInvoicesGridTab, OrganizationInvoicesGridTab } from '../../enums';

export interface GridContainerTabConfig {
  groupingEnabled?: boolean;
}

export abstract class InvoicesContainerService {
  constructor(
    protected readonly store: Store,
  ) {
  }

  public abstract getColDefsByTab(tab: AgencyInvoicesGridTab | OrganizationInvoicesGridTab, config: object): ColDef[];

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
