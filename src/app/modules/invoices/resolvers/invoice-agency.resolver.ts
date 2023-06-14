import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { CurrentUserPermission } from '@shared/models/permission.model';
import { PermissionCodes } from '../enums';
import { InvoicesApiService } from '../services';
import { Invoices } from '../store/actions/invoices.actions';

@Injectable()
export class InvoiceAgencyResolver implements Resolve<void | CurrentUserPermission[]> {
  constructor(
    private store: Store,
    private invoiceApiService: InvoicesApiService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): void | Observable<CurrentUserPermission[]> {
    const isAgency = route.data['isAgencyArea'] as boolean;
    this.store.dispatch(new Invoices.SetIsAgencyArea(isAgency));

    if (isAgency) {
      return this.invoiceApiService.getAgencyPermissions()
      .pipe(
        tap((res) => {
          const agCanPay = res
          .find((permission) => permission.permissionId === PermissionCodes.AgencyCanPay);
          this.store.dispatch(new Invoices.SetInvoicePermissions({ agencyCanPay: !!agCanPay }));
        }),
      );
    }
  }
}