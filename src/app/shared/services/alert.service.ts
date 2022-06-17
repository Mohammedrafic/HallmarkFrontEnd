import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { DialogUtility } from '@syncfusion/ej2-angular-popups';

interface OptionsButton {
  title: string;
  okButtonLabel: string;
  okButtonClass: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  alert(content: string, options: Partial<OptionsButton> = { title: '', okButtonClass: '', okButtonLabel: 'OK'} ): Observable<boolean> {
    const { title, okButtonClass: cssClass, okButtonLabel: text } = options;
    const isAllowed$ = new Subject<boolean>();
    const dialog = DialogUtility.alert({
      title,
      content,
      okButton: {
        text,
        cssClass,
        click: () => {
          isAllowed$.next(true);
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
      cssClass: 'alert-dialog',
    });

    const [ok] = dialog.buttons;
    ok.isFlat = false;

    return isAllowed$;
  }
}
