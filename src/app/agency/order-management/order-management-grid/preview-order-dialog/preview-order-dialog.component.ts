import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subject, takeWhile } from 'rxjs';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { SelectEventArgs, TabComponent } from "@syncfusion/ej2-angular-navigations";

@Component({
  selector: 'app-preview-order-dialog',
  templateUrl: './preview-order-dialog.component.html',
  styleUrls: ['./preview-order-dialog.component.scss']
})
export class PreviewOrderDialogComponent implements OnInit {
  @Input() order: any
  @Input() openEvent: Subject<boolean>;
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('tab') tab: TabComponent;

  public targetElement: HTMLElement = document.body;
  public firstActive = true;
  private isAlive = true;

  ngOnInit(): void {
    this.onOpenEvent();
  }

  public onTabSelecting(event: SelectEventArgs): void {
    if (event.isSwiped) {
      event.cancel = true;
    }
  }

  public onTabCreated(): void {
    this.tab.selected.pipe(takeWhile(() => this.isAlive))
      .subscribe((event: SelectEventArgs) => {
        const visibilityTabIndex = 0;
        if (event.selectedIndex !== visibilityTabIndex) {
          this.tab.refresh();
          this.firstActive = false;
        } else {
          this.firstActive = true;
        }
      });
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
