import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { ToastComponent } from '@syncfusion/ej2-angular-notifications';
import { Actions, ofActionDispatched } from '@ngxs/store';

import { MessageTypes } from '../../enums/message-types';
import { ShowToast } from '../../../store/app.actions';
import { delay, Subject, takeUntil, tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-message-toast',
  templateUrl: './message-toast.component.html',
  styles: ['.order-id { font-size: 16px; font-weight: 600; cursor: pointer; }']
})
export class MessageToastComponent implements OnInit, OnDestroy {
  @ViewChild('toast') toast: ToastComponent;
  cssClass: string;
  messageContent: string;
  type: MessageTypes;
  messageType = MessageTypes;
  isQuickOrder: boolean | undefined;
  orderId: number | undefined;
  organizationPrefix: string | undefined

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private actions$: Actions, private router: Router) {}

  ngOnInit(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionDispatched(ShowToast))
      .pipe(tap(() => this.toast.hide()), delay(500))
      .subscribe((payload: { type: MessageTypes; messageContent: string; isQuickOrder?: boolean; organizationPrefix?: string; orderId?: number }) => {
        this.type = payload.type;
        this.messageContent = payload.messageContent;
        this.isQuickOrder = payload.isQuickOrder;
        this.orderId = payload.orderId;
        this.organizationPrefix = payload.organizationPrefix;
        this.cssClass = this.getCssClass(this.type);
        this.toast.show();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getCssClass(type: MessageTypes): string {
    switch (type) {
      case MessageTypes.Error:
        return 'error-toast';
      case MessageTypes.Success:
        return 'success-toast';
      case MessageTypes.Warning:
        return 'warning-toast'
        
    }
  }

  navigateToAllOrders(): void {
    this.router.navigateByUrl('/client/order-management').then(() => this.toast.hide());
  }
}
