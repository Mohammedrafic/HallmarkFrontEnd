import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched } from '@ngxs/store';

import { ShowEmailSideDialog } from '../../../store/app.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-email-side-dialog',
  templateUrl: './email-side-dialog.component.html',
  styleUrls: ['./email-side-dialog.component.scss']
})

export class EmailSideDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('emailSideDialog') emailSideDialog: DialogComponent;
  targetElement: HTMLElement = document.body;

  @Input() header: string | null;
  @Input() width: string = '434px';

  @Output() emailFormCancelClicked = new EventEmitter();
  @Output() emailFormSaveClicked = new EventEmitter();
  public isDisabled=false;

  constructor(private action$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.action$.pipe(ofActionDispatched(ShowEmailSideDialog), takeUntil(this.destroy$)).subscribe((payload) => {
      if (payload.isDialogShown) {
        this.isDisabled=false
        this.emailSideDialog.show();
      } else {
        this.emailSideDialog.hide();
      }
    });
  }

  onemailFormCancelClick(): void {
    this.emailFormCancelClicked.emit();
  }

  onemailFormSaveClick(): void {
    this.emailFormSaveClicked.emit();
    this.isDisabled=true
  }
}

