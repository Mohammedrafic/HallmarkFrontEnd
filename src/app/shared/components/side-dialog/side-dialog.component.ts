import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched } from '@ngxs/store';

import { ShowSideDialog } from '../../../store/app.actions';

@Component({
  selector: 'app-side-dialog',
  templateUrl: './side-dialog.component.html',
  styleUrls: ['./side-dialog.component.scss']
})
export class SideDialogComponent implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  targetElement: HTMLElement = document.body;

  @Input() header: string;
  @Input() width: string = '434px';
  @Output() formCancelClicked = new EventEmitter();
  @Output() formSaveClicked = new EventEmitter();

  constructor(private action$: Actions) { }

  ngOnInit(): void {
    this.action$.pipe(ofActionDispatched(ShowSideDialog)).subscribe(isDialogShown => {
      if (isDialogShown) {
        this.sideDialog.show();
      }
    });
  }

  onFormCancelClick(): void {
    this.sideDialog.hide();
    this.formCancelClicked.emit();
  }

  onFormSaveClick(): void {
    this.sideDialog.hide();
    this.formSaveClicked.emit();
  }
}
