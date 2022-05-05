import { Injectable } from '@angular/core';
import { CanDeactivate, UrlTree } from '@angular/router';
import { Store } from '@ngxs/store';
import { DialogUtility } from '@syncfusion/ej2-angular-popups';
import { Observable, Subject } from 'rxjs';
import { SetDirtyState } from 'src/app/admin/store/admin.actions';
import { AdminState } from 'src/app/admin/store/admin.state';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '../constants/messages';
import { ConfirmService } from '../services/confirm.service';

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<unknown> {

  result: boolean;
  constructor(private store: Store, private confirmService: ConfirmService) { }

  canDeactivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const isDirty = this.store.selectSnapshot<boolean>(AdminState.isDirty);

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
