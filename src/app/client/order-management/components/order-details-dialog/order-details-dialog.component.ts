import isNil from 'lodash/fp/isNil';

import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { catchError, distinctUntilChanged, EMPTY, filter, map, Observable, Subject, take, takeUntil, zip } from 'rxjs';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { SelectEventArgs, TabComponent} from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';

import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';
import { OrderType } from '@shared/enums/order-type';
import { ChipsCssClass } from '@shared/pipes/chip-css-class/chips-css-class.pipe';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { IRPOrderPosition, IRPOrderPositionpage, Order, OrderCandidatesListPage, OrderManagementChild } from '@shared/models/order-management.model';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderStatus } from '@shared/enums/order-management';
import {
  ApproveOrder,
  ApproveOrderSucceeded,
  ClearOrderCandidatePage,
  DeleteOrder,
  GetOrganizationExtensions,
  SetLock,
} from '@client/store/order-managment-content.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CANCEL_CONFIRM_TEXT,
  CANCEL_ORDER_CONFIRM_TEXT,
  CANCEL_ORDER_CONFIRM_TITLE,
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
} from '@shared/constants';
import { Location } from '@angular/common';
import { ShowCloseOrderDialog, ShowSideDialog, ShowToast } from '../../../../store/app.actions';
import { AddEditReorderComponent } from '@client/order-management/components/add-edit-reorder/add-edit-reorder.component';
import { AddEditReorderService } from '@client/order-management/components/add-edit-reorder/add-edit-reorder.service';
import { SidebarDialogTitlesEnum } from '@shared/enums/sidebar-dialog-titles.enum';
import { SettingsKeys } from '@shared/enums/settings';
import { Configuration } from '@shared/models/organization-settings.model';
import {
  ExtensionCandidateComponent,
} from '@shared/components/order-candidate-list/order-candidates-list/extension-candidate/extension-candidate.component';
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { ReOpenOrderService } from '@client/order-management/components/reopen-order/reopen-order.service';
import { MessageTypes } from '@shared/enums/message-types';
import { MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';
import { MobileMenuItems } from '@shared/enums/mobile-menu-items.enum';
import { PermissionService } from '../../../../security/services/permission.service';
import { UserState } from '../../../../store/user.state';
import { OrderManagementIRPSystemId, OrderManagementIRPTabsIndex } from '@shared/enums/order-management-tabs.enum';
import { Comment } from '@shared/models/comment.model';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { ReOrderState } from '@shared/components/order-reorders-container/store/re-order.state';
import { ReOrderPage } from '@shared/components/order-reorders-container/interfaces';
import { CandidateModel } from '../add-edit-reorder/models/candidate.model';
import { ONBOARDED_STATUS } from
  '@shared/components/order-candidate-list/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst';
import { GlobalWindow } from '@core/tokens';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-order-details-dialog',
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.scss'],
})
export class OrderDetailsDialogComponent implements OnInit, OnChanges, OnDestroy {
  @Input() order: Order;
  @Input() openEvent: Subject<boolean>;
  @Input() orderPositionSelected$: Subject<{ state: boolean; index?: number }>;
  @Input() children: OrderManagementChild[] | undefined;
  @Input() settings: { [key in SettingsKeys]?: Configuration };
  @Input() hasCreateEditOrderPermission: boolean;
  @Input() hasCanEditOrderBillRatePermission: boolean;
  @Input() CanEditOrderBillRateIRP: boolean;
  @Input() CanCloseOrdersIRP: boolean;
  @Input() activeSystem: OrderManagementIRPSystemId;
  @Input() orderComments: Comment[] = [];
  @Input() isCondidateTab: boolean;
  @Input() CanOrganizationEditOrdersIRP:boolean;
  @Input() CanOrganizationViewOrdersIRP:boolean;
  @Output() nextPreviousOrderEvent = new EventEmitter<{ next: boolean, isIrpOrder: boolean}>();
  @Output() saveReOrderEmitter: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeReOrderEmitter: EventEmitter<void> = new EventEmitter<void>();
  @Output() selectReOrder = new EventEmitter<any>();
  @Output() updateOrders = new EventEmitter();
  @Output() editOrderPressed = new EventEmitter<number>();
  @Input() activeIRPtabs: OrderManagementIRPTabsIndex;
  @Input() isOrderDetailsTab: boolean;
  @Input() candidateIRP: IRPOrderPosition;
  // TODO: Delete it when we will have re-open sidebar
  @Output() private reOpenOrderSuccess: EventEmitter<Order> = new EventEmitter<Order>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('chipList') chipList: ChipListComponent;
  @ViewChild('tab') tab: TabComponent;
  @ViewChild(AddEditReorderComponent) addEditReOrder: AddEditReorderComponent;
  @ViewChild(ExtensionCandidateComponent) extensionCandidateComponent: ExtensionCandidateComponent;

  @Select(OrderManagementContentState.orderDialogOptions)
  public orderDialogOptions$: Observable<DialogNextPreviousOption>;

  @Select(OrderManagementContentState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementContentState.selectedOrder) selectedOrder: Observable<Order>;

  @Select(OrderManagementContentState.extensions) extensions$: Observable<any>;
  public extensions: any[] = [];

  @Select(OrderManagementContentState.orderCandidatesLength)
  public orderCandidatesLength$: Observable<number>;

  @Select(OrderManagementContentState.getIrpCandidatesCount)
  public irpCandidatesCount$: Observable<number>;

  @Select(UserState.currentUserPermissions)
  public currentUserPermissions$: Observable<CurrentUserPermission[]>;

  @Select(AppState.getMainContentElement)
  public readonly targetElement$: Observable<HTMLElement | null>;

  @Select(ReOrderState.GetReOrdersByOrderId)
  public readonly reOrderList$: Observable<ReOrderPage | null>;

  @Select(OrderManagementContentState.irpCandidatesforExtension)
  public getIrpCandidatesforExtension$ : Observable<IRPOrderPositionpage>

  public readonly isReOrderDialogOpened$: Observable<boolean> = this.isDialogOpened();

  candidateOrderPage: OrderCandidatesListPage;
  private unsubscribe$: Subject<void> = new Subject();

  public SettingsKeys = SettingsKeys;
  public firstActive = true;
  public orderType = OrderType;
  public orderStatus = OrderStatus;
  public reOrderToEdit: Order | null;
  public reOrderDialogTitle$ = this.addEditReorderService.reOrderDialogTitle$;
  public canCreateOrder: boolean;
  public canCreateOrderIRP: boolean;
  public canCloseOrderPermission: boolean;
  public readonly systemType = OrderManagementIRPSystemId;
  public OrderManagementIRPSystemId = OrderManagementIRPSystemId;

  public disabledCloseButton = true;
  public showCloseButton = false;
  public showEmployeeTab = true;
  private openInProgressFilledStatuses = ['open', 'in progress', 'filled', 'custom step'];
  private secondHasOpenedOnes = false;
  activeSystems: OrderManagementIRPSystemId | null;
  irpCandidates: IRPOrderPosition;

  public get isReOrder(): boolean {
    return !isNil(this.order?.reOrderFromId) && this.order?.reOrderFromId !== 0;
  }

  get disabledLock(): boolean {
    const statuses = [this.orderStatus.Open, this.orderStatus.InProgress, this.orderStatus.Filled];
    return !statuses.includes(this.order?.status);
  }

  get canCloseOrder(): boolean {
    const canNotClose = [this.orderStatus.PreOpen, this.orderStatus.Incomplete];
    return this.canReOpen || canNotClose.includes(this.getOrderStatus());
  }

  get canReOpen(): boolean {
    return this.getOrderStatus() !== OrderStatus.Closed && Boolean(this.order?.orderClosureReasonId);
  }

  get showApproveAndCancel(): boolean {
    const status = this.activeSystem === OrderManagementIRPSystemId.IRP ?
      this.order?.irpOrderMetadata?.status : this.order?.status;
    return this.order?.canApprove &&
      status === this.orderStatus.PreOpen &&
      (!this.order?.orderOpenDate || this.order?.extensionFromId != null);
  }

  get showLockOrder(): boolean {
    return this.orderType.ReOrder !== this.order?.orderType && !this.order?.extensionFromId;
  }

  get showCreateReOrder(): boolean {
    return this.orderType.OpenPerDiem === this.order?.orderType;
  }

  get disableCreateReOrder(): boolean {
    return (
      [this.orderStatus.PreOpen, this.orderStatus.Closed, this.orderStatus.Incomplete].includes(this.order?.status) ||
      !this.settings[SettingsKeys.IsReOrder]?.value
    );
  }

  get disableEdit(): boolean {
    return this.getOrderStatus() === this.orderStatus.Closed;
  }

  get disableCloseOrder(): boolean {
    return !!this.order?.orderClosureReasonId
      || !!this.order?.orderCloseDate
      || !!this.order?.irpOrderMetadata?.orderCloseDate
      || this.disabledCloseButton;
  }

  get desktopSmallMenu(): { text: string }[] {
    let menu: { text: string }[] = [];

    if (!this.disableCloseOrder) {
      menu = [...menu, { text: MobileMenuItems.CloseOrder }];
    }
    if (this.canReOpen) {
      menu = [...menu, { text: MobileMenuItems.ReOpen }];
    }
    if (this.showCreateReOrder && !this.disableCreateReOrder) {
      menu = [...menu, { text: MobileMenuItems.CreateReOrder }];
    }
    if (!this.showCloseButton) {
      menu = [...menu, { text: MobileMenuItems.Delete }];
    }
    if (!this.disabledLock && this.showLockOrder && this.activeSystem !== this.systemType.IRP) {
      menu = [...menu, { text: this.order?.isLocked ? MobileMenuItems.Unlock : MobileMenuItems.Lock }];
    }

    return menu;
  }

  get tabletMenu(): { text: string }[] {
    let menu: { text: string }[] = this.desktopSmallMenu;
    if (this.showApproveAndCancel) {
      menu = [...menu, { text: MobileMenuItems.Cancel }, { text: MobileMenuItems.Approve }];
    }
    return menu;
  }

  get mobileMenu(): { text: string }[] {
    let menu: { text: string }[] = this.tabletMenu;

    if (!this.disableEdit  &&  this.activeSystem === this.systemType.IRP) {
      menu = [...menu, { text: MobileMenuItems.Edit }, { text: MobileMenuItems.CloseOrder}];
    }
    return menu;
  }

  constructor(
    private chipsCssClass: ChipsCssClass,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private confirmService: ConfirmService,
    private location: Location,
    private actions: Actions,
    private addEditReorderService: AddEditReorderService,
    private orderManagementService: OrderManagementService,
    private reOpenOrderService: ReOpenOrderService,
    private permissionService: PermissionService,
    private actions$: Actions,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
  ) {}

  ngOnInit(): void {
    this.onOpenEvent();
    this.subscribeOnOrderCandidatePage();
    this.subsToTabChange();
    this.subscribeOnPermissions();
    this.watchForApproveOrderSucceeded();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order']?.currentValue) {
      this.setCloseOrderButtonState();
      this.setShowEmployeeTabState();
      const order = changes['order']?.currentValue;
      const orderstatusValue=order.statusText==null?order.irpOrderMetadata.statusText:order.statusText;
      const hasStatus = this.openInProgressFilledStatuses.includes(orderstatusValue?.toLowerCase());
      this.showCloseButton = hasStatus
        || (!hasStatus && (order?.orderClosureReasonId || order?.orderCloseDate || order?.irpOrderMetadata?.orderCloseDate));

      if (this.chipList) {
        const status = this.order.irpOrderMetadata?.statusText && this.activeSystem === OrderManagementIRPSystemId.IRP
          ? this.order.irpOrderMetadata.statusText
          : this.order.statusText;

        this.chipList.cssClass = this.chipsCssClass.transform(status);
        this.chipList.text = status?(status).toUpperCase():"";
      }
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ClearOrderCandidatePage());
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

    if (!this.children?.length && this.activeSystem === this.systemType.VMS) {
      this.disabledCloseButton = false;
      return;
    }

    const orderStatuses = [OrderStatus.InProgressOfferAccepted, OrderStatus.Filled];

    if (orderStatuses.includes(OrderStatus.InProgressOfferAccepted)) {
      this.disabledCloseButton = Boolean(this.children?.some((child) => orderStatuses.includes(child.orderStatus)));
    }

    if (this.activeSystem === this.systemType.IRP) {
      this.disabledCloseButton = !!(this.order.activeCandidatesCount && this.order.activeCandidatesCount > 0);
    }

    // Disable close btn for Filled reorder or if it has onboarded candidate.
    if (this.order?.orderType === OrderType.ReOrder && this.order.status !== OrderStatus.Filled) {
      this.disabledCloseButton = this.order.candidates?.length
      ? this.checkOrderCandidatesForOnboard(this.order.candidates) : false;
      return;
    }
  }

  public lockOrder(): void {
    this.store.dispatch(
      new SetLock(
        this.order.id,
        this.activeSystem === this.systemType.IRP ? this.order.isLocked! : !this.order.isLocked,
        this.activeSystem === this.systemType.IRP ? !this.order.isLockedIRP : this.order.isLockedIRP!,
        {},
        `${this.order.organizationPrefix || ''}-${this.order.publicId}`,
        this.activeSystem === this.systemType.IRP,
        true
      )
    );
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
      }).pipe(
      takeUntil(this.unsubscribe$)
      ).subscribe((isConfirm: boolean) => {
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

    this.confirmService.confirm(CANCEL_ORDER_CONFIRM_TEXT, options).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((isConfirm: boolean) => {
      if (isConfirm) {
        this.store.dispatch(new DeleteOrder(id));
      }
    });
  }

  public createReOrder(): void {
    this.addEditReorderService.setReOrderDialogTitle(SidebarDialogTitlesEnum.AddReOrder);
    this.store.dispatch(new ShowSideDialog(true));
  }

  public approveOrder(id: number): void {
    this.store.dispatch(new ApproveOrder(id, this.activeSystem === OrderManagementIRPSystemId.IRP, true));
  }

  public editOrder(data: Order) {
    if (this.isReOrder && data.orderType !== OrderType.OpenPerDiem && this.activeSystem !== OrderManagementIRPSystemId.IRP) {
      this.order = { ...data };
      this.addEditReorderService.setReOrderDialogTitle(SidebarDialogTitlesEnum.EditReOrder);
      this.store.dispatch(new ShowSideDialog(true));
    } else {
      this.editOrderPressed.emit(data.id);
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
        .pipe(
          filter((confirm) => !!confirm),
          takeUntil(this.unsubscribe$)
        ).subscribe(() => {
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

  public reOpenOrder(order: Order): void {
    this.reOpenOrderService
      .reOpenOrder({ orderId: order.id })
      .pipe(
        catchError((err) => {
          this.store.dispatch(new ShowToast(MessageTypes.Error, err.message));
          return EMPTY;
        }),
        take(1)
      )
      .subscribe(() => {
        this.reOpenOrderSuccess.emit(this.order);
      });
  }

  public onClose(): void {
    if (this.extensionCandidateComponent?.form.dirty) {
      this.saveExtensionChanges().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        this.closeSideDialog();
      });
    } else {
      this.closeSideDialog();
    }
  }

  public onNextPreviousOrder(isNext: boolean): void {
    this.nextPreviousOrderEvent.emit({
      next: isNext,
      isIrpOrder: !!this.order.irpOrderMetadata,
    });
  }

  public onMobileMenuSelect({ item: { text } }: MenuEventArgs): void {
    switch (text) {
      case MobileMenuItems.Approve:
        this.approveOrder(this.order.id);
        break;
      case MobileMenuItems.Cancel:
        this.cancelOrder(this.order.id);
        break;
      case MobileMenuItems.Edit:
        this.editOrder(this.order);
        break;
      case MobileMenuItems.CloseOrder:
        this.closeOrder(this.order);
        break;
      case MobileMenuItems.ReOpen:
        this.reOpenOrder(this.order);
        break;
      case MobileMenuItems.CreateReOrder:
        this.createReOrder();
        break;
      case MobileMenuItems.Delete:
        this.deleteOrder(this.order.id);
        break;
      case MobileMenuItems.Lock:
      case MobileMenuItems.Unlock:
        this.lockOrder();
        break;

      default:
        break;
    }
  }

  private closeSideDialog(): void {
    this.sideDialog.hide();
    this.openEvent.next(false);
  }

  private saveExtensionChanges(): Observable<boolean> {
    const options = {
      title: DELETE_CONFIRM_TITLE,
      okButtonLabel: 'Leave',
      okButtonClass: 'delete-button',
      cancelButtonLabel: 'Cancel',
    };

    return this.confirmService.confirm(DELETE_CONFIRM_TEXT, options).pipe(filter((confirm) => confirm));
  }

  private selectCandidateOnOrderId(): void {
    const locationState = this.location.getState() as { orderId: number };
    if (!this.secondHasOpenedOnes && !!locationState.orderId) {
      this.tab.select(1);
      this.secondHasOpenedOnes = true;
    }
    if(this.isCondidateTab==true){
      this.tab.select(1);
    }
    setTimeout(()=>{
      let IsEmployeeTab=  JSON.parse(localStorage.getItem('IsEmployeeTab') || '"true"') as boolean;
      if(IsEmployeeTab){
        this.tab.select(1);
        this.globalWindow.localStorage.setItem("IsEmployeeTab",JSON.stringify(""));
      }
      if(this.isOrderDetailsTab){
        this.tab.select(0);
        this.isOrderDetailsTab=false;
      }
    },1000)
  }

  public subsToTabChange(): void {
    this.orderManagementService.selectedTab$.pipe(takeUntil(this.unsubscribe$)).subscribe((tab) => {
      this.tab.select(tab);
    });
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
    zip([
      this.orderCandidatePage$.pipe(filter((data) => !!data)),
      this.selectedOrder.pipe(filter((data) => !!data)),
      this.orderPositionSelected$,
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        ([order, selectedOrder, isOrderPositionSelected]: [
          OrderCandidatesListPage,
          Order,
          { state: boolean; index?: number }
        ]) => {
          this.candidateOrderPage = order;
          this.extensions = [];
          if (
            selectedOrder?.extensionFromId &&
            order?.items[isOrderPositionSelected.index ?? 0]?.candidateJobId &&
            (selectedOrder.orderType === OrderType.ContractToPerm || selectedOrder.orderType === OrderType.LongTermAssignment) && 
            this.activeSystem === OrderManagementIRPSystemId.VMS
          ) {
            this.store.dispatch(
              new GetOrganizationExtensions(
                order.items[isOrderPositionSelected.index ?? 0].candidateJobId,
                selectedOrder.id
              )
            );
          } else if(this.candidateIRP && this.activeSystem === OrderManagementIRPSystemId.IRP && selectedOrder?.extensionFromId){
            this.store.dispatch(new GetOrganizationExtensions(this.candidateIRP.candidateJobId as number, selectedOrder.id));
          }
        }
      );

    this.extensions$.pipe(takeUntil(this.unsubscribe$)).subscribe((extensions) => {
      this.extensions = extensions?.filter((extension: any) => extension.id !== this.order?.id);
    });
  }

  private isDialogOpened(): Observable<boolean> {
    return this.actions.pipe(ofActionDispatched(ShowSideDialog)).pipe(
      map((payload: ShowSideDialog) => payload.isDialogShown),
      distinctUntilChanged()
    );
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(({ canCreateOrder, canCloseOrder,canCreateOrderIRP }) => {
      this.canCloseOrderPermission = canCloseOrder;
      this.canCreateOrder = canCreateOrder;
      this.canCreateOrderIRP=canCreateOrderIRP;
    });
  }

  private getOrderStatus(): OrderStatus {
    if (!this.order) {
      return OrderStatus.NoOrder;
    }

    if (this.activeSystem === this.systemType.IRP) {
      return this.order.irpOrderMetadata?.status as OrderStatus;
    }

    return this.order.status;
  }

  private checkOrderCandidatesForOnboard(candiadtes: CandidateModel[]): boolean {
    return candiadtes.some((candidate) => candidate.status === ONBOARDED_STATUS);
  }

  private setShowEmployeeTabState(): void {
    const status = this.order.irpOrderMetadata?.status ? this.order.irpOrderMetadata.status : this.order.status;
    this.showEmployeeTab = !(this.activeSystem === OrderManagementIRPSystemId.IRP && status === OrderStatus.PreOpen);
  }

  private watchForApproveOrderSucceeded(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(ApproveOrderSucceeded),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.updateOrders.emit();
      });
  }
}
