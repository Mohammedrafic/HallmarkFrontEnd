import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched } from '@ngxs/store';

import { ShowSideDialog } from '../../../store/app.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-side-dialog',
  templateUrl: './side-dialog.component.html',
  styleUrls: ['./side-dialog.component.scss'],
})
export class SideDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  targetElement: HTMLElement = document.body;

  @Input() header: string | null;
  @Input() width: string = '434px';
  @Input() disableSaveButton: boolean = false;

  @Output() formCancelClicked = new EventEmitter();
  @Output() formSaveClicked = new EventEmitter();

  constructor(private action$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.action$.pipe(ofActionDispatched(ShowSideDialog), takeUntil(this.destroy$)).subscribe((payload) => {
      if (payload.isDialogShown) {
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
