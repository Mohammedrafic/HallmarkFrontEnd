import isNil from 'lodash/fp/isNil';

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
import { distinctUntilChanged, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';

import { SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';

import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';
import { OrderType } from '@shared/enums/order-type';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { Order, OrderCandidatesListPage, OrderManagementChild } from '@shared/models/order-management.model';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderStatus } from '@shared/enums/order-management';
import { ApproveOrder, DeleteOrder, GetExtensions, SetLock } from '@client/store/order-managment-content.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CANCEL_CONFIRM_TEXT,
  CANCEL_ORDER_CONFIRM_TEXT,
  CANCEL_ORDER_CONFIRM_TITLE,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
} from '@shared/constants';
import { Location } from '@angular/common';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { ShowCloseOrderDialog, ShowSideDialog } from '../../../store/app.actions';
import { AddEditReorderComponent } from '@client/order-management/add-edit-reorder/add-edit-reorder.component';
import { AddEditReorderService } from '@client/order-management/add-edit-reorder/add-edit-reorder.service';
import { SidebarDialogTitlesEnum } from '@shared/enums/sidebar-dialog-titles.enum';

@Component({
  selector: 'app-order-details-dialog',
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.scss'],
})
export class OrderDetailsDialogComponent implements OnInit, OnChanges, OnDestroy {
  @Input() order: Order;
  @Input() openEvent: Subject<boolean>;
  @Input() children: OrderManagementChild[] | undefined;

  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();
  @Output() saveReOrderEmitter: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeReOrderEmitter: EventEmitter<void> = new EventEmitter<void>();
  @Output() selectReOrder = new EventEmitter<any>();
  @Output() updateOrders = new EventEmitter();

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('chipList') chipList: ChipListComponent;
  @ViewChild('tab') tab: TabComponent;
  @ViewChild(AddEditReorderComponent) addEditReOrder: AddEditReorderComponent;

  @Select(OrderManagementContentState.orderDialogOptions)
  public orderDialogOptions$: Observable<DialogNextPreviousOption>;

  @Select(OrderManagementContentState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementContentState.extensions) extensions$: Observable<any>;
  public extensions: any[] = [];

  public readonly isReOrderDialogOpened$: Observable<boolean> = this.isDialogOpened();

  candidateOrderPage: OrderCandidatesListPage;
  private unsubscribe$: Subject<void> = new Subject();

  public firstActive = true;
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public orderType = OrderType;
  public orderStatus = OrderStatus;
  public candidatesCounter: number;
  public reOrderToEdit: Order | null;
  public reOrderDialogTitle$ = this.addEditReorderService.reOrderDialogTitle$;

  public disabledCloseButton = true;
  public showCloseButton = false;
  private openInProgressFilledStatuses = ['open', 'in progress', 'filled', 'custom step'];
  private secondHasOpenedOnes = false;

  public get isReOrder(): boolean {
    return !isNil(this.order?.reOrderFromId) && this.order?.reOrderFromId !== 0;
  }

  get disabledLock(): boolean {
    const statuses = [this.orderStatus.Open, this.orderStatus.InProgress, this.orderStatus.Filled];
    return !statuses.includes(this.order?.status);
  }
  get canCloseOrder(): boolean {
    const canNotClose = [this.orderStatus.PreOpen, this.orderStatus.Incomplete];
    return canNotClose.includes(this.order?.status);
  }

  constructor(
    private chipsCssClass: ChipsCssClass,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private confirmService: ConfirmService,
    private location: Location,
    private actions: Actions,
    private addEditReorderService: AddEditReorderService
  ) {}

  ngOnInit(): void {
    this.onOpenEvent();
    this.subscribeOnOrderCandidatePage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order']?.currentValue) {
      this.setCloseOrderButtonState();
      const order = changes['order']?.currentValue;
      const hasStatus = this.openInProgressFilledStatuses.includes(order.statusText.toLowerCase());
      this.showCloseButton = hasStatus || (!hasStatus && (order?.orderClosureReasonId || order?.orderCloseDate));
      if (this.chipList) {
        this.chipList.cssClass = this.chipsCssClass.transform(changes['order'].currentValue.statusText);
        this.chipList.text = changes['order'].currentValue.statusText.toUpperCase();
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setCloseOrderButtonState(): void {
    if (this.order?.orderType === null || this.order?.orderType === undefined) {
      this.disabledCloseButton = true;
      return;
    }

    if (this.order?.orderType === OrderType.OpenPerDiem) {
      this.disabledCloseButton = false;
      return;
    }

    if (!this.children?.length) {
      this.disabledCloseButton = false;
      return;
    }

    const orderStatuses = [OrderStatus.InProgressOfferAccepted, OrderStatus.Filled];
    if (orderStatuses.includes(OrderStatus.InProgressOfferAccepted)) {
      this.disabledCloseButton = Boolean(this.children?.some((child) => orderStatuses.includes(child.orderStatus)));
    }
  }

  public lockOrder(): void {
    this.store.dispatch(new SetLock(this.order.id, !this.order.isLocked, {}, true));
  }

  public onTabSelecting(event: SelectEventArgs): void {
    if (event.isSwiped) {
      event.cancel = true;
    }
  }

  public deleteOrder(id: number): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
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
      cancelButtonLabel: 'No',
    };

    this.confirmService.confirm(CANCEL_ORDER_CONFIRM_TEXT, options).subscribe((isConfirm: boolean) => {
      if (isConfirm) {
        this.store.dispatch(new DeleteOrder(id));
      }
    });
  }

  public createReOrder(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public approveOrder(id: number): void {
    this.store.dispatch(new ApproveOrder(id));
  }

  public editOrder(data: Order) {
    if (this.isReOrder && data.orderType !== OrderType.OpenPerDiem) {
      this.order = { ...data };
      this.addEditReorderService.setReOrderDialogTitle(SidebarDialogTitlesEnum.EditReOrder);
      this.store.dispatch(new ShowSideDialog(true));
    } else {
      this.router.navigate(['./edit', data.id], { relativeTo: this.route });
      this.onClose();
    }
  }

  public editNestedReOrder(data: Order): void {
    this.store.dispatch(new ShowSideDialog(true));
    this.reOrderToEdit = { ...data };
  }

  public saveReOrder(): void {
    this.saveReOrderEmitter.emit();
    this.reOrderToEdit = null;
    this.store.dispatch(new ShowSideDialog(false));
  }

  public onSaveReOrder(): void {
    this.addEditReOrder.onSave();
  }

  public clearEditReOrder(): void {
    if (this.addEditReOrder.reorderForm.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.closeReOrderEmitter.emit();
          this.reOrderToEdit = null;
          this.store.dispatch(new ShowSideDialog(false));
        });
    } else {
      this.closeReOrderEmitter.emit();
      this.reOrderToEdit = null;
      this.store.dispatch(new ShowSideDialog(false));
    }
  }

  public closeOrder(order: Order): void {
    this.store.dispatch(new ShowCloseOrderDialog(true));
    this.order = { ...order };
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
    if (!this.secondHasOpenedOnes && !!locationState.orderId) {
      this.tab.select(1);
      this.secondHasOpenedOnes = true;
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
    this.orderCandidatePage$.pipe(takeUntil(this.unsubscribe$)).subscribe((order: OrderCandidatesListPage) => {
      this.candidateOrderPage = order;
      this.candidatesCounter =
        order &&
        order.items?.filter(
          (candidate) => candidate.status !== ApplicantStatus.Rejected && candidate.status !== ApplicantStatus.Withdraw
        ).length;
        this.extensions = [];
        if (order?.items[0]?.deployedCandidateInfo?.jobId) {
          this.store.dispatch(new GetExtensions(order.items[0].deployedCandidateInfo.jobId));
        }
    });
    this.extensions$.pipe(takeUntil(this.unsubscribe$)).subscribe((extensions) => {
      this.extensions = extensions?.filter((extension: any) => extension.id !== this.order.id);
    });
  }

  private isDialogOpened(): Observable<boolean> {
    return this.actions.pipe(ofActionDispatched(ShowSideDialog)).pipe(
      map((payload: ShowSideDialog) => payload.isDialogShown),
      distinctUntilChanged()
    );
  }
}
