import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Component({
  selector: 'app-reorder-status-dialog',
  templateUrl: './reorder-status-dialog.component.html',
  styleUrls: ['./reorder-status-dialog.component.scss']
})
export class ReorderStatusDialogComponent extends DestroyableDirective implements OnInit {
  @Input() openEvent: Subject<boolean>;
  @Input() templateState: any;

  @ViewChild('sideDialog') sideDialog: DialogComponent;

  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  public targetElement: HTMLElement | null = document.body.querySelector('#main');

  ngOnInit(): void {
    this.onOpenEvent()
  }

  public onCloseDialog(): void {
    this.sideDialog.hide();
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.destroy$)).subscribe((isOpen: boolean) => {
      if (isOpen) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }

}
