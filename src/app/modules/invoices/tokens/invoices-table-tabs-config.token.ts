import { InjectionToken } from '@angular/core';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';

export const InvoicesTableTabsConfig: InjectionToken<TabsListConfig> =
  new InjectionToken<TabsListConfig>('Invoices Tabs List');
