import { Injectable } from '@angular/core';
import { CanDeactivate, UrlTree } from '@angular/router';
import { Store } from '@ngxs/store';
import { DialogUtility } from '@syncfusion/ej2-angular-popups';
import { Observable, Subject } from 'rxjs';
import { SetDirtyState } from 'src/app/admin/store/admin.actions';
import { AdminState } from 'src/app/admin/store/admin.state';

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<unknown> {

  result: boolean;
  constructor(private store: Store) { }

  canDeactivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const isDirty = this.store.selectSnapshot<boolean>(AdminState.isDirty);

    if (isDirty) {
      let isAllowed$ = new Subject<boolean>();
      let dialog = DialogUtility.confirm({
        title: '',
        content: 'Are you sure you want to cancel? All data will be deleted.',
        okButton: {  text: 'OK', click: () => { isAllowed$.next(true); this.store.dispatch(new SetDirtyState(false)); dialog.close(); } },
        cancelButton: {  text: 'Cancel', cssClass: 'e-outline', click: () => { isAllowed$.next(false); dialog.close(); } },
        showCloseIcon: false,
        closeOnEscape: true,
        position: { X: 'center', Y: 'center' },
        animationSettings: { effect: 'Zoom' },
        cssClass: 'unsaved-changes-dialog'
      });
      dialog.buttons[0].isFlat = false; 
      dialog.buttons[1].isFlat = false; 

      return isAllowed$;
    } else {
      return true;
    }
  }
}
