import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched } from '@ngxs/store';

import { ShowCloseOrderDialog } from '../../../store/app.actions';

@Component({
  selector: 'app-close-order-side-dialog',
  templateUrl: './close-order-side-dialog.component.html',
  styleUrls: ['../side-dialog/side-dialog.component.scss']
})
export class CloseOrderSideDialogComponent implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  targetElement: HTMLElement = document.body;
  isPosition: boolean = false;

  @Input() header: string;
  @Input() width: string = '434px';

  @Output() formCancelClicked = new EventEmitter();
  @Output() formSaveClicked = new EventEmitter();
  @Output() isPositionEmitter = new EventEmitter<boolean>();

  constructor(private action$: Actions) { }

  ngOnInit(): void {
    this.action$.pipe(ofActionDispatched(ShowCloseOrderDialog)).subscribe(payload => {
      this.isPosition = payload.isPosition;
      if (payload.isDialogShown) {
        this.isPositionEmitter.emit(this.isPosition);
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }

  onFormCancelClick(): void {
    this.formCancelClicked.emit();
  }

  onFormSaveClick(): void {
    this.formSaveClicked.emit();
  }
}
