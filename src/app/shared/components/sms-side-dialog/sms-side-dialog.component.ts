import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched } from '@ngxs/store';

import { ShowSmsSideDialog } from '../../../store/app.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-sms-side-dialog',
  templateUrl: './sms-side-dialog.component.html',
  styleUrls: ['./sms-side-dialog.component.scss']
})

export class SmsSideDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('smsSideDialog') smsSideDialog: DialogComponent;
  targetElement: HTMLElement = document.body;

  @Input() header: string | null;
  @Input() width: string = '434px';

  @Output() smsFormCancelClicked = new EventEmitter();
  @Output() smsFormSaveClicked = new EventEmitter();
  public isDisabled=false;

  constructor(private action$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.action$.pipe(ofActionDispatched(ShowSmsSideDialog), takeUntil(this.destroy$)).subscribe((payload) => {
      if (payload.isDialogShown) {
        this.smsSideDialog.show();
        this.isDisabled=false
      } else {
        this.smsSideDialog.hide();
      }
    });
  }

  onSmsFormCancelClick(): void {
    this.smsFormCancelClicked.emit();
  }

  onSmsFormSaveClick(): void {
    this.smsFormSaveClicked.emit();
    this.isDisabled=true
  }
}


