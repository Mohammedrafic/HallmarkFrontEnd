import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { DialogUtility } from '@syncfusion/ej2-angular-popups';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from "@shared/constants";

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  confirm(content: string, options?: { title: string, okButtonLabel: string, okButtonClass: string, cancelButtonLabel?: string }): Observable<boolean> {
    const isAllowed$ = new Subject<boolean>();
    const dialog = DialogUtility.confirm({
      title: options?.title ? options.title : '',
      content,
      okButton: {
        text: options?.okButtonLabel ? options.okButtonLabel : 'OK',
        cssClass: options?.okButtonClass ? options.okButtonClass : '',
        click: () => {
          isAllowed$.next(true);
          dialog.close();
          isAllowed$.complete();
        },
      },
      cancelButton: {
        text: options?.cancelButtonLabel ?? 'Cancel',
        cssClass: 'e-outline',
        click: () => {
          isAllowed$.next(false);
          dialog.close();
          isAllowed$.complete();
        }
      },
      close: () => {
        isAllowed$.next(false);
        isAllowed$.complete();
      },
      showCloseIcon: true,
      closeOnEscape: true,
      position: { X: 'center', Y: 'center' },
      animationSettings: { effect: 'Zoom' },
      cssClass: 'unsaved-changes-dialog',
    });

    const [ok, cencel] = dialog.buttons;
    ok.isFlat = false;
    cencel.isFlat = false;

    return isAllowed$;
  }

  public confirmDelete(): Observable<boolean> {
    return this.confirm(DELETE_RECORD_TEXT, {
      title: DELETE_RECORD_TITLE,
      okButtonLabel: 'Delete',
      okButtonClass: 'delete-button'
    });
  }
}
