import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';

export type InvoiceTabsProvider = Observable<TabsListConfig[]>;

export const InvoiceTabs: InjectionToken<InvoiceTabsProvider> =
  new InjectionToken<InvoiceTabsProvider>('Tabs list config');
