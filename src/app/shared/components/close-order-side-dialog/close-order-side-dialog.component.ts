import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched } from '@ngxs/store';

import { ShowCloseOrderDialog } from '../../../store/app.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-close-order-side-dialog',
  templateUrl: './close-order-side-dialog.component.html',
  styleUrls: ['../side-dialog/side-dialog.component.scss'],
})
export class CloseOrderSideDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  targetElement: HTMLElement = document.body;
  isPosition = false;

  @Input() header: string;
  @Input() width = '434px';

  @Output() formCancelClicked = new EventEmitter();
  @Output() formSaveClicked = new EventEmitter();
  @Output() isPositionEmitter = new EventEmitter<boolean>();

  constructor(private action$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnCloseOrderDialog();
  }

  onFormCancelClick(): void {
    this.formCancelClicked.emit();
  }

  onFormSaveClick(): void {
    this.formSaveClicked.emit();
  }

  private subscribeOnCloseOrderDialog(): void {
    this.action$
      .pipe(
        ofActionDispatched(ShowCloseOrderDialog),
        takeUntil(this.destroy$)
      ).subscribe(payload => {
        this.isPosition = payload.isPosition;
        if (payload.isDialogShown) {
          this.isPositionEmitter.emit(this.isPosition);
          this.sideDialog.show();
        } else {
          this.sideDialog.hide();
        }
      });
  }
}
