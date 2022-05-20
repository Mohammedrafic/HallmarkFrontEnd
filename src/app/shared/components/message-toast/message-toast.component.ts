import { Component, OnInit, ViewChild } from '@angular/core';

import { ToastComponent } from '@syncfusion/ej2-angular-notifications';
import { Actions, ofAction, ofActionDispatched, Store } from '@ngxs/store';

import { MessageTypes } from '../../enums/message-types';
import { ShowToast } from '../../../store/app.actions';
import { delay, tap } from 'rxjs';

@Component({
  selector: 'app-message-toast',
  templateUrl: './message-toast.component.html',
})
export class MessageToastComponent implements OnInit {
  @ViewChild('toast') toast: ToastComponent;
  cssClass: string;
  messageContent: string;
  type: MessageTypes;
  messageType = MessageTypes;

  constructor(private store: Store, private actions$: Actions) {}

  ngOnInit(): void {
    this.actions$
      .pipe(ofActionDispatched(ShowToast))
      .pipe(tap(() => this.toast.hide()), delay(500))
      .subscribe((payload: { type: MessageTypes; messageContent: string }) => {
        this.type = payload.type;
        this.messageContent = payload.messageContent;
        this.cssClass = this.getCssClass(this.type);
        this.toast.show();
      });
  }

  getCssClass(type: MessageTypes): string {
    switch (type) {
      case MessageTypes.Error:
        return 'error-toast';
      case MessageTypes.Success:
        return 'success-toast';
    }
  }
}
