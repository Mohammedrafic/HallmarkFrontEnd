import { DOCUMENT } from "@angular/common";
import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, Select, ofActionDispatched } from '@ngxs/store';
import { Observable, takeUntil } from 'rxjs';

import { ShowMSPCustomSideDialog } from 'src/app/store/app.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-msp-custom-side-dialog',
  templateUrl: './msp-custom-side-dialog.component.html',
  styleUrls: ['./msp-custom-side-dialog.component.scss'],
})
export class MspCustomSideDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('mspCustomSideDialog') mspCustomSideDialog: DialogComponent;

  @Input() targetElement: HTMLElement | null = document.body;
  @Input() headerText: string | null;
  @Input() width = '434px';
  @Input() tooltipMessage = '';
  
  @Output() closeDialogClicked: EventEmitter<void> = new EventEmitter();

  @Select(AppState.isMobileScreen)
  public readonly isMobile$: Observable<boolean>;

  constructor(private action$: Actions) {
    super();
  }

  ngOnInit(): void {
    debugger
    this.action$.pipe(ofActionDispatched(ShowMSPCustomSideDialog), takeUntil(this.destroy$)).subscribe((payload) => {
      if (payload.isDialogShown) {
        this.mspCustomSideDialog.show();
      } else {
        this.mspCustomSideDialog.hide();
      }
    });
  }

  public onClose(): void {
    this.closeDialogClicked.emit();
  }
}
