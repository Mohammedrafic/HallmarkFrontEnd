import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched } from '@ngxs/store';

import { ShowOnScreenSideDialog } from '../../../store/app.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-on-screen-side-dialog',
  templateUrl: './on-screen-side-dialog.component.html',
  styleUrls: ['./on-screen-side-dialog.component.scss']
})

export class OnScreenSideDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('onScreenSideDialog') onScreenSideDialog: DialogComponent;
  targetElement: HTMLElement = document.body;

  @Input() header: string | null;
  @Input() width: string = '434px';

  @Output() onScreenFormCancelClicked = new EventEmitter();
  @Output() onScreenFormSaveClicked = new EventEmitter();

  constructor(private action$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.action$.pipe(ofActionDispatched(ShowOnScreenSideDialog), takeUntil(this.destroy$)).subscribe((payload) => {
      if (payload.isDialogShown) {
        this.onScreenSideDialog.show();
      } else {
        this.onScreenSideDialog.hide();
      }
    });
  }

  onScreenFormCancelClick(): void {
    this.onScreenFormCancelClicked.emit();
  }

  onScreenFormSaveClick(): void {
    this.onScreenFormSaveClicked.emit();
  }
}




