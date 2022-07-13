import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';

import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';
import { OrderType } from '@shared/enums/order-type';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { Order, OrderCandidatesListPage } from '@shared/models/order-management.model';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderStatus } from '@shared/enums/order-management';
import { ApproveOrder, DeleteOrder } from '@client/store/order-managment-content.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_ORDER_CONFIRM_TEXT, CANCEL_ORDER_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { Location } from '@angular/common';
import { ApplicantStatus } from "@shared/enums/applicant-status.enum";

@Component({
  selector: 'app-order-details-dialog',
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.scss'],
})
export class OrderDetailsDialogComponent implements OnInit, OnChanges, OnDestroy {
  @Input() order: Order;
  @Input() openEvent: Subject<boolean>;

  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('chipList') chipList: ChipListComponent;
  @ViewChild('tab') tab: TabComponent;

  @Select(OrderManagementContentState.orderDialogOptions)
  public orderDialogOptions$: Observable<DialogNextPreviousOption>;

  @Select(OrderManagementContentState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  private unsubscribe$: Subject<void> = new Subject();

  public firstActive = true;
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public orderType = OrderType;
  public orderStatus  = OrderStatus;
  public candidatesCounter: number;

  private secondHasOpendOnes = false;

  constructor(private chipsCssClass: ChipsCssClass,
              private router: Router,
              private route: ActivatedRoute,
              private store: Store,
              private confirmService: ConfirmService,
              private location: Location) {}

  ngOnInit(): void {
    this.onOpenEvent();
    this.subscribeOnOrderCandidatePage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chipList && changes['order'].currentValue) {
      this.chipList.cssClass = this.chipsCssClass.transform(changes['order'].currentValue.statusText);
      this.chipList.text = changes['order'].currentValue.statusText.toUpperCase();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public lockOrder(): void {

  }

  public onTabSelecting(event: SelectEventArgs): void {
    if (event.isSwiped) {
      event.cancel = true;
    }
  }

  public onTabCreated(): void {
    this.tab.selected.pipe(takeUntil(this.unsubscribe$)).subscribe((event: SelectEventArgs) => {
      const visibilityTabIndex = 0;
      if (event.selectedIndex !== visibilityTabIndex) {
        this.tab.refresh();
        this.firstActive = false;
      } else {
        this.firstActive = true;
      }
    });
  }

  public deleteOrder(id: number): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.store.dispatch(new DeleteOrder(id));
        }
      });
  }

  /** Executes when user cancel the order with custom status*/
  public cancelOrder(id: number): void {
    const options = {
      title: CANCEL_ORDER_CONFIRM_TITLE,
      okButtonLabel: 'Yes',
      okButtonClass: 'delete-button',
      cancelButtonLabel: 'No'
    };

    this.confirmService
      .confirm(CANCEL_ORDER_CONFIRM_TEXT, options)
      .subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.store.dispatch(new DeleteOrder(id));
        }
      });
  }

  public approveOrder(id: number): void {
    this.store.dispatch(new ApproveOrder(id));
  }

  public editOrder(data: Order) {
    this.router.navigate(['./edit', data.id], { relativeTo: this.route });
    this.onClose();
  }

  public onClose(): void {
    this.sideDialog.hide();
    this.openEvent.next(false);
  }

  public onNextPreviousOrder(next: boolean): void {
    this.nextPreviousOrderEvent.emit(next);
  }

  private selectCandidateOnOrderId(): void {
    const locationState = this.location.getState() as { orderId: number };
    if (!this.secondHasOpendOnes && !!locationState.orderId) {
      this.tab.select(1);
      this.secondHasOpendOnes = true;
    }
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.unsubscribe$)).subscribe((isOpen) => {
      if (isOpen) {
        windowScrollTop();
        this.sideDialog.show();
        this.selectCandidateOnOrderId();
        disabledBodyOverflow(true);
      } else {
        this.sideDialog.hide();
        disabledBodyOverflow(false);
      }
    });
  }

  private subscribeOnOrderCandidatePage(): void {
    this.orderCandidatePage$.pipe(takeUntil((this.unsubscribe$))).subscribe((order: OrderCandidatesListPage) => {
      this.candidatesCounter = order && order.items?.filter((candidate) =>
        candidate.status !== ApplicantStatus.Rejected  && candidate.status !== ApplicantStatus.Withdraw
      ).length;
    });
  }
}
