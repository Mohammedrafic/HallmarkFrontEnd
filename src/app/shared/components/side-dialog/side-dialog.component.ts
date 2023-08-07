import { DOCUMENT } from "@angular/common";
import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, Select, ofActionDispatched } from '@ngxs/store';
import { Observable, takeUntil } from 'rxjs';

import { ShowSideDialog } from 'src/app/store/app.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-side-dialog',
  templateUrl: './side-dialog.component.html',
  styleUrls: ['./side-dialog.component.scss'],
})
export class SideDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  
  @Input() targetElement: HTMLElement | null = this.document.body.querySelector('#main');
  @Input() header: string | null;
  @Input() width = '434px';
  @Input() disableSaveButton = false;
  @Input() saveButtonLabel = 'Save';

  @Output() formCancelClicked = new EventEmitter();
  @Output() formSaveClicked = new EventEmitter();

  @Select(AppState.isMobileScreen)
  public readonly isMobile$: Observable<boolean>;

  constructor(@Inject(DOCUMENT) private document: Document,
              private action$: Actions) {
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
