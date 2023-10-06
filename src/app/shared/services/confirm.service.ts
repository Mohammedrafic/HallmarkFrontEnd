import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { DialogUtility } from '@syncfusion/ej2-angular-popups';

import { ConfirmEventType } from '@shared/enums/confirm-modal-events.enum';
import { ModalActions } from '@shared/models/confirm-modal-events.model';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  confirm(content: string, options?: {
    title: string,
    okButtonLabel: string,
    okButtonClass: string,
    cancelButtonLabel?: string,
    customStyleClass?: string,
    zIndex?: number,
  }): Observable<boolean> {

    const isAllowed$ = new Subject<boolean>();
    const dialogClass = options?.customStyleClass
      ? `unsaved-changes-dialog ${options?.customStyleClass}` : 'unsaved-changes-dialog';

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
      zIndex: options?.zIndex,
    });

    const [ok, cencel] = dialog.buttons;
    ok.isFlat = false;
    cencel.isFlat = false;

    return isAllowed$;
  }

  public confirmActions(content: string, options?: {
    title: string,
    okButtonLabel: string,
    okButtonClass: string,
    cancelButtonLabel?: string,
    customStyleClass?: string,
    zIndex?: number,
  }): Observable<ModalActions> {

    const isConfirmed$ = new Subject<ModalActions>();
    const dialog = DialogUtility.confirm(
      {
        title: options?.title ?? '',
        content,
        showCloseIcon: true,
        closeOnEscape: true,
        position: { X: 'center', Y: 'center' },
        animationSettings: { effect: 'Zoom' },

        cssClass: 'unsaved-changes-dialog',
        okButton: {
          text: options?.okButtonLabel ?? ' OK',
          cssClass: options?.okButtonClass ?? '',
          click: () => {
            isConfirmed$.next({ action: ConfirmEventType.YES });
            dialog.hide();
          },
        },
        cancelButton: {
          text: options?.cancelButtonLabel ?? 'Cancel',
          cssClass: 'e-outline',
          click: () => {
            isConfirmed$.next({ action: ConfirmEventType.NO });
            dialog.hide();
          },
        },
        close: () => {
          isConfirmed$.next({ action: ConfirmEventType.CLOSE });
          isConfirmed$.complete();
        },
      });

    const [ok, cancel] = dialog.buttons;
    ok.isFlat = false;
    cancel.isFlat = false;

    return isConfirmed$;
  }
}
