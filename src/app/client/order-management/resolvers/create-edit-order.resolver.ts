import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable, of, switchMap } from 'rxjs';

import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { Preferences } from '@shared/models/organization.model';
import { GetOrganizationById } from '@organization-management/store/organization-management.actions';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { OrderSystem } from '@client/order-management/enums';
import { UserState } from '../../../store/user.state';

@Injectable()
export class CreateEditOrderResolver implements Resolve<OrderSystem> {
  private preferences: Preferences;

  constructor(private store: Store) {}

  resolve(): Observable<OrderSystem> {
   this.setPreferences();

   const hasPreferences = !Object.values(this.preferences ?? {}).length;

    if(hasPreferences) {
     const id = this.store.selectSnapshot(UserState.lastSelectedOrganizationId) ??
       this.store.selectSnapshot(UserState.user)?.businessUnitId as number;

      return this.store.dispatch(new GetOrganizationById(id)).pipe(
        switchMap(() => {
          this.setPreferences();
          return of(this.getSystemType());
        })
      );
    } else {
      return of(this.getSystemType());
    }
  }

  private setPreferences(): void {
    this.preferences = this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences as Preferences;
  }

  private getSystemType(): OrderSystem {
    const orderManagementSystem = localStorage.getItem('selectedOrderManagementSystem');
    if(
      orderManagementSystem &&
      Number(orderManagementSystem) === OrderManagementIRPSystemId.VMS &&
      this.preferences?.isVMCEnabled
    ) {
      return OrderSystem.VMS;
    }

    if(
      orderManagementSystem &&
      Number(orderManagementSystem) === OrderManagementIRPSystemId.IRP &&
      this.preferences?.isIRPEnabled
    ) {
      return OrderSystem.IRP;
    }

    return OrderSystem.VMS;
  }
}
