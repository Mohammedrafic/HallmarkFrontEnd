import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched } from '@ngxs/store';

import { ShowGroupEmailSideDialog } from '../../../store/app.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-send-email-side-dialog',
  templateUrl: './send-email-side-dialog.component.html',
  styleUrls: ['./send-email-side-dialog.component.scss']
})
export class SendEmailSideDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('groupEmailSideDialog') groupEmailSideDialog: DialogComponent;
  targetElement: HTMLElement = document.body;

  @Input() header: string | null;
  @Input() width: string = '434px';
  @Input() isSend:boolean=true;

  @Output() groupEmailFormCancelClicked = new EventEmitter();
  @Output() groupEmailFormSendClicked = new EventEmitter();

  constructor(private action$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.action$.pipe(ofActionDispatched(ShowGroupEmailSideDialog), takeUntil(this.destroy$)).subscribe((payload) => {
      if (payload.isDialogShown) {
        this.groupEmailSideDialog.show();
      } else {
        this.groupEmailSideDialog.hide();
      }
    });
  }

  onGroupEmailFormCancelClick(): void {
    this.groupEmailFormCancelClicked.emit();
  }

  onGroupEmailFormSendClick(): void {
    this.groupEmailFormSendClicked.emit();
  }
}

