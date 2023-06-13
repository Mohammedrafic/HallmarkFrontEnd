import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { DialogUtility } from '@syncfusion/ej2-angular-popups';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  confirm(content: string, options?: {
    title: string,
    okButtonLabel:string,
    okButtonClass: string,
    cancelButtonLabel?: string,
    customStyleClass?: string }): Observable<boolean> {
      
    const isAllowed$ = new Subject<boolean>();
    const dialogClass = options?.customStyleClass
    ? `unsaved-changes-dialog ${options?.customStyleClass}`: 'unsaved-changes-dialog';

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
        },
      },
      close: () => {
        isAllowed$.next(false);
        isAllowed$.complete();
      },
      showCloseIcon: true,
      closeOnEscape: true,
      position: { X: 'center', Y: 'center' },
      animationSettings: { effect: 'Zoom' },
      cssClass: dialogClass,
    });

    const [ok, cencel] = dialog.buttons;
    ok.isFlat = false;
    cencel.isFlat = false;

    return isAllowed$;
  }
}
