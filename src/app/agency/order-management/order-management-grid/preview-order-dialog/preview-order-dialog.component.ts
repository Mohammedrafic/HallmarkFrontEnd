import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Observable, Subject, takeWhile } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';

import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';
import { AgencyOrderManagement, Order } from '@shared/models/order-management.model';
import { OrderType } from '@shared/enums/order-type';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { OrderManagementState } from '@agency/store/order-management.state';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';

export type NextPreviousOrderEvent = {
  next: boolean;
  excludeDeployed: boolean;
};

@Component({
  selector: 'app-preview-order-dialog',
  templateUrl: './preview-order-dialog.component.html',
  styleUrls: ['./preview-order-dialog.component.scss'],
})
export class PreviewOrderDialogComponent implements OnInit, OnChanges, OnDestroy {
  @Input() order: AgencyOrderManagement;
  @Input() openEvent: Subject<boolean>;
  @Input() openCandidateTab: boolean;

  @Output() compareEvent = new EventEmitter<never>();
  @Output() nextPreviousOrderEvent = new EventEmitter<NextPreviousOrderEvent>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('chipList') chipList: ChipListComponent;
  @ViewChild('tab') tab: TabComponent;

  @Select(OrderManagementState.orderDialogOptions)
  public orderDialogOptions$: Observable<DialogNextPreviousOption>;

  @Select(OrderManagementState.orderCandidatesLenght)
  public countOrderCandidates$: Observable<number>;

  @Select(OrderManagementState.selectedOrder)
  public selectedOrder$: Observable<Order>;

  public firstActive = true;
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public orderType = OrderType;

  private excludeDeployed: boolean;
  private isAlive = true;

  constructor(private chipsCssClass: ChipsCssClass, private store: Store) {}

  ngOnInit(): void {
    this.onOpenEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chipList && changes['order']?.currentValue) {
      this.chipList.cssClass = this.chipsCssClass.transform(changes['order'].currentValue.statusText);
    }
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
    this.tab.select(0);
    this.sideDialog.hide();
    this.openEvent.next(false);
  }

  public onNextPreviousOrder(next: boolean): void {
    this.nextPreviousOrderEvent.emit({ next, excludeDeployed: this.excludeDeployed });
  }

  public onExcludeDeployed(event: boolean): void {
    this.excludeDeployed = event;
  }

  public onCompare(): void {
    disabledBodyOverflow(false);
    this.compareEvent.emit();
    // TODO temp solution for opening add reorder dialog
    // this.store.dispatch(new ShowSideDialog(true));
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (isOpen) {
        this.tab.select(1);

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

