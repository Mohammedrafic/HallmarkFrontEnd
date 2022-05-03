import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { DialogUtility } from '@syncfusion/ej2-angular-popups';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  confirm(content: string): Observable<boolean> {
    const isAllowed$ = new Subject<boolean>();
    const dialog = DialogUtility.confirm({
      title: '',
      content,
      okButton: {
        text: 'OK',
        click: () => {
          isAllowed$.next(true);
          dialog.close();
          isAllowed$.complete();
        },
      },
      cancelButton: {
        text: 'Cancel',
        cssClass: 'e-outline',
        click: () => {
          isAllowed$.next(false);
          dialog.close();
          isAllowed$.complete();
        },
        
      },
      showCloseIcon: false,
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
}
