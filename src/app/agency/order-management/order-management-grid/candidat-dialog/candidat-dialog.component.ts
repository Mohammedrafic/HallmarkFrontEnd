import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeWhile } from 'rxjs';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';

import { disabledBodyOverflow } from '@shared/utils/styles.utils';

@Component({
  selector: 'app-candidat-dialog',
  templateUrl: './candidat-dialog.component.html',
  styleUrls: ['./candidat-dialog.component.scss']
})
export class CandidatDialogComponent implements OnInit, OnDestroy {
  @Input() openEvent: Subject<boolean>;

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('tab') tab: TabComponent;

  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public firstActive = true;

  private isAlive = true;

  ngOnInit(): void {
    this.onOpenEvent();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onEdit(): void {
    //TBI
  }

  public onClose(): void {
    this.sideDialog.hide();
    this.openEvent.next(false);
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

  private onOpenEvent(): void {
    this.openEvent.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (isOpen) {
        this.sideDialog.show();
        disabledBodyOverflow(true);
      } else {
        this.sideDialog.hide();
      }
    });
  }
}
