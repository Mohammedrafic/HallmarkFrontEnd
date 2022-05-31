import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subject, takeWhile } from 'rxjs';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';

@Component({
  selector: 'app-preview-order-dialog',
  templateUrl: './preview-order-dialog.component.html',
  styleUrls: ['./preview-order-dialog.component.scss']
})
export class PreviewOrderDialogComponent implements OnInit {
  @Input() order: any
  @Input() openEvent: Subject<boolean>;

  @ViewChild('sideDialog') sideDialog: DialogComponent;

  public targetElement: HTMLElement = document.body;

  private isAlive = true;

  ngOnInit(): void {
    this.onOpenEvent();
  }

  public onClose(): void {
    this.sideDialog.hide();
    this.openEvent.next(false);
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (isOpen) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }
}
