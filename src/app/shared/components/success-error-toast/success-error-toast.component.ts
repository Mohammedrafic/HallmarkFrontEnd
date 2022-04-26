import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { ToastComponent } from '@syncfusion/ej2-angular-notifications';
import { Select, Store } from '@ngxs/store';

import { AdminState } from '../../../admin/store/admin.state';
import { Observable } from 'rxjs';
import { SetSuccessErrorToastState } from '../../../admin/store/admin.actions';
import { SuccessErrorToast } from '../../models/success-error-toast.model';

@Component({
  selector: 'app-success-error-toast',
  templateUrl: './success-error-toast.component.html',
  styleUrls: ['./success-error-toast.component.scss']
})
export class SuccessErrorToastComponent implements OnInit {
  @ViewChild('toast') toast: ToastComponent;
  isSuccess: boolean;
  messageContent: string;

  @Select(AdminState.successErrorToastState)
  successErrorToast$: Observable<SuccessErrorToast>;

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this.successErrorToast$.subscribe(toastState => {
      if (toastState) {
        this.isSuccess = toastState.isSuccess;
        this.messageContent = toastState.messageContent;
        this.toast.show();
      }
    });
  }

  onToastClose(): void {
    this.store.dispatch(new SetSuccessErrorToastState(null));
  }
}
