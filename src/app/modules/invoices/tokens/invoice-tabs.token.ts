import { InjectionToken } from '@angular/core';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { Observable } from 'rxjs';

export type InvoiceTabsProvider = Observable<TabsListConfig[]>;

export const InvoiceTabs: InjectionToken<InvoiceTabsProvider> =
  new InjectionToken<InvoiceTabsProvider>('Tabs list config');
