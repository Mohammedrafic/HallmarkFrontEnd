import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject, takeWhile } from 'rxjs';

import { SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';

@Component({
  selector: 'app-preview-order-dialog',
  templateUrl: './preview-order-dialog.component.html',
  styleUrls: ['./preview-order-dialog.component.scss'],
})
export class PreviewOrderDialogComponent implements OnInit, OnDestroy {
  @Input() order: any;
  @Input() openEvent: Subject<boolean>;

  @Output() compareEvent = new EventEmitter<never>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('tab') tab: TabComponent;

  public firstActive = true;
  public targetElement: HTMLElement | null = document.body.querySelector('#main');

  private isAlive = true;

  ngOnInit(): void {
    this.onOpenEvent();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onTabSelecting(event: SelectEventArgs): void {
    if (event.isSwiped) {
      event.cancel = true;
    }
  }

  public onTabCreated(): void {
    this.tab.selected.pipe(takeWhile(() => this.isAlive)).subscribe((event: SelectEventArgs) => {
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

  public onCompare(): void {
    disabledBodyOverflow(false);
    this.compareEvent.emit();
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (isOpen) {
        windowScrollTop();
        this.sideDialog.show();
        disabledBodyOverflow(true);
      } else {
        this.sideDialog.hide();
        disabledBodyOverflow(false);
      }
    });
  }
}
