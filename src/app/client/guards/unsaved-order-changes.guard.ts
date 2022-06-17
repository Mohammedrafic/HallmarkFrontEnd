import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { ConfirmService } from '@shared/services/confirm.service';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

@Injectable({
  providedIn: 'root'
})
export class UnsavedOrderChangesGuard implements CanDeactivate<unknown> {

  constructor(private store: Store, private confirmService: ConfirmService) { }

  canDeactivate(): Observable<boolean> | boolean {

    const isDirty = this.store.selectSnapshot<boolean>(OrderManagementContentState.isDirtyOrderForm);

    if (isDirty) {
      return this.confirmService
              .confirm(DELETE_CONFIRM_TEXT, {
                title: DELETE_CONFIRM_TITLE,
                okButtonLabel: 'Leave',
                okButtonClass: 'delete-button'
              });
    } else {
      return true;
    }
  }
}
