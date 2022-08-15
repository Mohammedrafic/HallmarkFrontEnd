import { ProviderToken } from '@angular/core';

import { AgencyStrategy } from './agency.strategy';
import { OrganizationStrategy } from './organization.strategy';
import { ManualInvoiceStrategy } from './strategy.interface';

export const ManualInvoiceStrategyMap = new Map<boolean, ProviderToken<ManualInvoiceStrategy>>([
  [true, AgencyStrategy],
  [false, OrganizationStrategy],
]);
