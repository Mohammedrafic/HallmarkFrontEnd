import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export type OrganizationIdProvider = Observable<number | null>;

export const OrganizationId: InjectionToken<number | null> =
  new InjectionToken<number | null>('Organization id for agency');
