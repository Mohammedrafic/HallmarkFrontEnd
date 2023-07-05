import {
  ChangeDetectorRef,
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
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { DateTimeHelper } from "@core/helpers";
import { OrganizationManagementState } from "@organization-management/store/organization-management.state";
import { ExpiredCredentialsMessage } from "@shared/components/child-order-dialog/child-order-dialog.constants";
import { ChildOrderDialogService } from "@shared/components/child-order-dialog/child-order-dialog.service";
import { MissingCredentialsRequestBody, MissingCredentialsResponse } from "@shared/models/credential.model";
import {
  OPTION_FIELDS,
} from '@shared/components/order-candidate-list/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst';
import { AbstractPermission } from "@shared/helpers/permissions";
import { JobCancellation } from '@shared/models/candidate-cancellation.model';

import {
  AccordionComponent,
  MenuEventArgs,
  SelectEventArgs,
  SelectingEventArgs,
  TabComponent,
} from '@syncfusion/ej2-angular-navigations';
import {
  ClearAgencyCandidateJob,
  ClearAgencyOrderCandidatesList,
  GetAgencyExtensions,
  GetCandidateJob,
  GetDeployedCandidateOrderInfo,
  GetOrderApplicantsData,
} from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { ReOpenOrderService } from '@client/order-management/components/reopen-order/reopen-order.service';
import {
  CancelOrganizationCandidateJob,
  CancelOrganizationCandidateJobSuccess,
  ClearOrderCandidatePage,
  ClearOrganisationCandidateJob,
  GetAvailableSteps,
  GetCandidateCancellationReason,
  GetOrganisationCandidateJob,
  GetOrganizationExtensions,
  ReloadOrganisationOrderCandidatesLists,
  UpdateOrganisationCandidateJob,
} from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';
import {
  CancellationReasonsMap,
  PenaltiesMap,
} from '@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants';
import { ExtensionSidebarComponent } from '@shared/components/extension/extension-sidebar/extension-sidebar.component';
import {
  AcceptFormComponent,
} from '@shared/components/order-candidate-list/reorder-candidates-list/reorder-status-dialog/accept-form/accept-form.component';
import {
  CANCEL_CONFIRM_TEXT,
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  OrganizationalHierarchy,
  OrganizationSettingKeys,
  SET_READONLY_STATUS,
} from '@shared/constants';
import { OrderCandidateListViewService } from '@shared/components/order-candidate-list/order-candidate-list-view.service';
import { UnsavedFormDirective } from '@shared/directives/unsaved-form.directive';
import {
  ApplicantStatus as ApplicantStatusEnum,
  ApplicantStatus,
  CandidatStatus,
} from '@shared/enums/applicant-status.enum';
import { MessageTypes } from '@shared/enums/message-types';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderType } from '@shared/enums/order-type';
import { OrderStatusText } from '@shared/enums/status';
import { BillRate } from '@shared/models';
import { Comment } from '@shared/models/comment.model';
import {
  AcceptJobDTO,
  AgencyOrderManagement,
  Order,
  OrderCandidateJob,
  OrderFilter,
  OrderManagementChild,
  ApplicantStatus as ApplicantStatusModel,
  CandidateCancellationReason,
  CandidateCancellationReasonFilter,
} from '@shared/models/order-management.model';
import { ChipsCssClass } from '@shared/pipes/chip-css-class/chips-css-class.pipe';
import { CommentsService } from '@shared/services/comments.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { addDays, toCorrectTimezoneFormat } from '@shared/utils/date-time.utils';
import PriceUtils from '@shared/utils/price.utils';
import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';

import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { catchError, distinctUntilChanged, EMPTY, Observable, Subject, take, takeWhile, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ShowCloseOrderDialog, ShowToast } from 'src/app/store/app.actions';
import { AppState } from 'src/app/store/app.state';
import { UserState } from 'src/app/store/user.state';
import { PermissionService } from '../../../security/services/permission.service';
import { DeployedCandidateOrderInfo } from '@shared/models/deployed-candidate-order-info.model';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { SettingsViewService } from '@shared/services';
import { UserPermissions } from '@core/enums';

enum Template {
  accept,
  apply,
  onboarded,
  offerDeployment,
}

type MergedOrder = AgencyOrderManagement & Order;

enum MobileMenuItems {
  AddExtension = 'Add Extension',
  ClosePosition = 'Close Position',
  ReOpen = 'Re-Open',
}

@Component({
  selector: 'app-child-order-dialog',
  templateUrl: './child-order-dialog.component.html',
  styleUrls: ['./child-order-dialog.component.scss'],
})
export class ChildOrderDialogComponent extends AbstractPermission implements OnInit, OnChanges, OnDestroy {
  @Input() order: MergedOrder;
  @Input() openEvent: Subject<[AgencyOrderManagement, OrderManagementChild] | null>;
  @Input() candidate: OrderManagementChild;
  @Input() filters: OrderFilter;
  @Input() activeSystem: OrderManagementIRPSystemId;
  @Input() orderComments: Comment[] = [];
  @Output() saveEmitter = new EventEmitter<void>();

  // TODO: Delete it when we will have re-open sidebar
  @Output() private reOpenPositionSuccess: EventEmitter<OrderManagementChild> =
    new EventEmitter<OrderManagementChild>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('chipList') chipList: ChipListComponent;
  @ViewChild('tab') tab: TabComponent;
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;
  @ViewChild(ExtensionSidebarComponent) extensionSidebarComponent: ExtensionSidebarComponent;
  @ViewChild(UnsavedFormDirective) unsavedForm: UnsavedFormDirective;

  @Select(OrderManagementState.selectedOrder)
  public agencySelectedOrder$: Observable<Order>;

  @Select(OrderManagementContentState.selectedOrder)
  public orgSelectedOrder$: Observable<Order>;

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  @Select(OrderManagementState.candidatesJob)
  public agencyCandidatesJob$: Observable<OrderCandidateJob>;

  @Select(OrderManagementContentState.extensions) organizationExtensions$: Observable<any>;
  @Select(OrderManagementState.extensions) agencyExtensions$: Observable<any>;

  @Select(UserState.currentUserPermissions)
  public currentUserPermissions$: Observable<any[]>;

  @Select(OrderManagementState.deployedCandidateOrderInfo)
  public readonly deployedCandidateOrderInfo$: Observable<DeployedCandidateOrderInfo[]>;

  @Select(OrderManagementContentState.getCandidateCancellationReasons)
  candidateCancellationReasons$: Observable<CandidateCancellationReason[]>;

  public firstActive = true;
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public orderType = OrderType;
  public selectedTemplate: Template | null;
  public candidateTemplate = Template;
  public isAgency: boolean;
  public isOrganization: boolean;
  public selectedOrder$: Observable<Order>;
  public orderStatusText = OrderStatusText;
  public disabledCloseButton = true;
  public acceptForm = AcceptFormComponent.generateFormGroup();
  public candidateJob: OrderCandidateJob | null;
  public candidateStatus = CandidatStatus;
  public comments: Comment[] = [];
  public isExtensionSidebarShown: boolean;
  public isAddExtensionBtnAvailable: boolean;
  public extensions$: Observable<any>;
  public extensions: Order[];
  public selectedOrder: Order;
  public optionFields = OPTION_FIELDS;
  public openCandidateCancellationDialog = new Subject<void>();
  public jobStatusControl: FormControl;
  public agencyActionsAllowed = true;
  public canCreateOrder: boolean;
  public canCloseOrder: boolean;
  public isClosedOrder = false;
  public selectedApplicantStatus: ApplicantStatusModel | null = null;
  public isCandidatePayRateVisible: boolean;
  public candidateCancellationReasons: CandidateCancellationReason[] | null;

  public readonly nextApplicantStatuses = [
    {
      applicantStatus: CandidatStatus.Cancelled,
      statusText: CandidatStatus[CandidatStatus.Cancelled],
      isEnabled: true,
    },
  ];
  public readonly buttonTypeEnum = ButtonTypeEnum;
  public readonly orderStatus = OrderStatus;

  private isAlive = true;
  private isLastExtension = false;
  private ignoreMissingCredentials = false;
  private readonly permissions = UserPermissions;

  get isReorderType(): boolean {
    return this.candidateJob?.order.orderType === OrderType.ReOrder;
  }

  get isCancelled(): boolean {
    return this.candidateJob?.applicantStatus.applicantStatus === CandidatStatus.Cancelled;
  }

  get canEditClosedBillRates(): boolean {
    return this.userPermission[this.permissions.CanUpdateBillRates];
  }

  get isOnboard(): boolean {
    return this.candidateJob?.applicantStatus.applicantStatus === CandidatStatus.OnBoard;
  }

  get showAddExtension(): boolean {
    return this.isAddExtensionBtnAvailable && this.isLastExtension;
  }

  get disableAddExtension(): boolean {
    return this.candidate?.orderStatus === this.orderStatus.InProgressOfferAccepted || !this.canCreateOrder;
  }

  get showCloseOrder(): boolean {
    return !this.isAgency && !this.canReOpen;
  }

  get mobileMenu(): any {
    let menu: { text: string }[] = [];
    if (this.showAddExtension && !this.disableAddExtension) {
      menu = [...menu, { text: MobileMenuItems.AddExtension }];
    }
    if (!this.disabledCloseButton && this.showCloseOrder) {
      menu = [...menu, { text: MobileMenuItems.ClosePosition }];
    }
    if (this.canReOpen) {
      menu = [...menu, { text: MobileMenuItems.ReOpen }];
    }
    return menu;
  }

  get isClosedOrderPosition(): boolean {
    return this.candidate.orderStatus === OrderStatus.Closed || !!this.candidate.positionClosureReason
      || !!this.selectedOrder?.orderClosureReason;
  }

  get canReOpen(): boolean {
    return (
      this.candidate?.orderStatus !== OrderStatus.Closed &&
      Boolean(this.candidate?.positionClosureReasonId) &&
      !this.isAgency
    );
  }

  constructor(
    private chipsCssClass: ChipsCssClass,
    private router: Router,
    protected override store: Store,
    private actions$: Actions,
    private commentsService: CommentsService,
    private confirmService: ConfirmService,
    private orderCandidateListViewService: OrderCandidateListViewService,
    private reOpenOrderService: ReOpenOrderService,
    private permissionService: PermissionService,
    private changeDetectorRef: ChangeDetectorRef,
    private childOrderDialogService: ChildOrderDialogService,
    private settingService: SettingsViewService,
  ) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.isAgency = this.router.url.includes('agency');
    this.isOrganization = this.router.url.includes('client');
    this.selectedOrder$ = this.isAgency ? this.agencySelectedOrder$ : this.orgSelectedOrder$;
    this.extensions$ = this.isAgency ? this.agencyExtensions$ : this.organizationExtensions$;
    this.extensions$
      .pipe(
        takeWhile(() => this.isAlive),
        filter(Boolean)
      )
      .subscribe((extensions) => {
        this.extensions = extensions.filter((extension: Order) => extension.id !== this.order?.id);
        this.isLastExtension = !this.extensions.map((ex) => ex.extensionFromId).includes(this.order?.id);
      });
    this.subscribeOnCandidateJob();
    this.onOpenEvent();
    this.subscribeOnSelectedOrder();
    this.subscribeOnCancelOrganizationCandidateJobSuccess();
    this.subscribeOnPermissions();

    if (this.isAgency) {
      this.checkForAgencyStatus();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const candidate = changes['candidate']?.currentValue;
    if (candidate) {
      this.isClosedOrder = this.isClosedOrderPosition;
      this.setCloseOrderButtonState();
      this.setAddExtensionBtnState(candidate);
      this.getDeployedCandidateOrders();
      this.getCandidatePayRateSetting();

      if (this.chipList) {
        this.chipList.cssClass = this.chipsCssClass.transform(
          this.orderStatusText[changes['candidate'].currentValue.orderStatus]
        );
      }
    }
  }

  public override ngOnDestroy(): void {
    this.isAlive = false;
  }

  public setCloseOrderButtonState(): void {
    this.disabledCloseButton =
      !!this.candidate?.positionClosureReasonId ||
      this.candidate.orderStatus !== OrderStatus.Filled ||
      !!this.order?.orderCloseDate;
  }

  public closeOrder(order: MergedOrder): void {
    this.store.dispatch(new ShowCloseOrderDialog(true, true));
    this.order = { ...order };
  }

  public reOpenPosition(): void {
    this.reOpenOrderService
      .reOpenPosition({ positionId: this.candidate.jobId })
      .pipe(
        catchError((err) => {
          this.store.dispatch(new ShowToast(MessageTypes.Error, err.message));
          return EMPTY;
        }),
        take(1)
      )
      .subscribe(() => this.reOpenPositionSuccess.emit(this.candidate));
  }

  public onTabSelecting(event: SelectingEventArgs): void {
    if (event.isSwiped) {
      event.cancel = true;
    }

    this.orderCandidateListViewService.setIsCandidateOpened(event.selectingIndex === 1);
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
    if (this.unsavedForm?.hasChanges) {
      this.saveExtensionChanges().pipe(takeWhile(() => this.isAlive)).subscribe(() => this.closeSideDialog());
    } else {
      this.closeSideDialog();
    }
  }

  public onBillRatesChanged(bill: BillRate): void {
    if (!this.acceptForm.errors && this.candidateJob) {
      const rates = this.getBillRateForUpdate(bill);

      this.store
        .dispatch(
          new UpdateOrganisationCandidateJob({
            orderId: this.candidateJob?.orderId as number,
            organizationId: this.candidateJob?.organizationId as number,
            jobId: this.candidateJob?.jobId as number,
            nextApplicantStatus: {
              applicantStatus: this.candidateJob.applicantStatus.applicantStatus,
              statusText: this.candidateJob.applicantStatus.statusText,
            },
            actualStartDate: toCorrectTimezoneFormat(this.candidateJob?.actualStartDate) as string,
            actualEndDate: toCorrectTimezoneFormat(this.candidateJob?.actualEndDate) as string,
            offeredStartDate: toCorrectTimezoneFormat(this.candidateJob?.availableStartDate as string),
            candidateBillRate: this.candidateJob?.candidateBillRate as number,
            offeredBillRate: this.candidateJob?.offeredBillRate,
            requestComment: this.candidateJob?.requestComment as string,
            clockId: this.candidateJob?.clockId,
            guaranteedWorkWeek: this.candidateJob?.guaranteedWorkWeek,
            billRates: rates,
            billRatesUpdated: this.checkForBillRateUpdate(rates),
            candidatePayRate: this.candidateJob.candidatePayRate,
          })
        )
        .pipe(takeWhile(() => this.isAlive))
        .subscribe(() => {
          this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
          this.deleteUpdateFieldInRate();
        });
    }
  }

  public getBillRateForUpdate(value: BillRate): BillRate[] {
    let billRates;
    const existingBillRateIndex = this.candidateJob?.billRates.findIndex(
      (billRate) => billRate.id === value.id
    ) as number;
    if (existingBillRateIndex > -1) {
      this.candidateJob?.billRates.splice(existingBillRateIndex, 1, value);
      billRates = this.candidateJob?.billRates;
    } else {
      if (typeof value === 'number') {
        this.candidateJob?.billRates.splice(value, 1);
        billRates = this.candidateJob?.billRates;
      } else {
        billRates = [...(this.candidateJob?.billRates as BillRate[]), value];
      }
    }

    return billRates as BillRate[];
  }

  public showExtensionDialog(): void {
    const isVMCEnabled = this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences.isVMCEnabled;
    const isIrpFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);

    this.ignoreMissingCredentials = false;

    if (isIrpFlagEnabled && !isVMCEnabled) {
      this.isExtensionSidebarShown = true;

      return;
    }

    this.childOrderDialogService.getMissingCredentials(this.getMissingCredentialsRequestBody())
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((response: MissingCredentialsResponse) => {
        if (response.missingCredentials.length) {
          this.showMissingCredentialsWarningMessage();
        } else {
          this.isExtensionSidebarShown = true;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  public closeExtensionSidebar(): void {
    if (this.extensionSidebarComponent.extensionForm.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter(Boolean),
          take(1)
        ).subscribe(() => {
          this.isExtensionSidebarShown = false;
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.isExtensionSidebarShown = false;
    }
  }

  public saveExtension(): void {
    this.extensionSidebarComponent.saveExtension(this.sideDialog, this.ignoreMissingCredentials);
  }

  public getExtensions(): void {
    if (!this.candidateJob?.jobId) {
      return;
    }

    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);

    if (isAgencyArea) {
      this.store.dispatch(
        new GetAgencyExtensions(this.candidateJob.jobId, this.candidateJob.orderId, this.candidateJob?.organizationId)
      );
    } else {
      this.store.dispatch(new GetOrganizationExtensions(this.candidateJob.jobId, this.candidateJob.orderId));
    }
  }

  public updateGrid(): void {
    this.isExtensionSidebarShown = false;
    this.getExtensions();
    this.saveEmitter.emit();
  }

  public onSave(): void {
    if (this.isCancelled) {
      this.updateOrganisationCandidateJob();
    } else {
      this.saveHandler({ itemData: this.selectedApplicantStatus });
    }
  }

  public onStatusChange(event: { itemData: ApplicantStatusModel | null }): void {
    if (event.itemData?.isEnabled) {
      this.selectedApplicantStatus = event.itemData;
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, SET_READONLY_STATUS));
    }
  }

  public saveHandler(event: { itemData: ApplicantStatusModel | null }): void {
    if (event.itemData?.applicantStatus === ApplicantStatusEnum.Cancelled) {
      this.openCandidateCancellationDialog.next();
    }
  }

  public cancelCandidate(jobCancellationDto: JobCancellation): void {
    if (this.candidateJob) {
      this.store.dispatch(
        new CancelOrganizationCandidateJob({
          organizationId: this.candidateJob.organizationId,
          jobId: this.candidateJob.jobId,
          jobCancellationDto,
          candidatePayRate: this.candidateJob.candidatePayRate,
        })
      );
      this.closeSideDialog();
    }
  }

  public resetStatusesFormControl(): void {
    this.jobStatusControl.reset();
    this.selectedApplicantStatus = null;
  }

  public onMobileMenuSelect({ item: { text } }: MenuEventArgs): void {
    switch (text) {
      case MobileMenuItems.AddExtension:
        this.showExtensionDialog();
        break;
      case MobileMenuItems.ClosePosition:
        this.closeOrder(this.order);
        break;
      case MobileMenuItems.ReOpen:
        this.reOpenPosition();
        break;

      default:
        break;
    }
  }

  public clearCandidateJobState(): void {
    const ClearCandidateJob = this.isAgency ? ClearAgencyCandidateJob : ClearOrganisationCandidateJob;
    this.store.dispatch(new ClearCandidateJob());
  }

  private closeSideDialog(): void {
    this.tab.select(0);
    this.sideDialog.hide();
    this.openEvent.next(null);
    this.selectedTemplate = null;
    this.jobStatusControl.reset();
    this.selectedApplicantStatus = null;
    this.orderCandidateListViewService.setIsCandidateOpened(false);
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

  private setAddExtensionBtnState(candidate: OrderManagementChild): void {
    const isOrderTravelerOrContractToPerm =
      this.order.orderType === OrderType.Traveler || this.order.orderType === OrderType.ContractToPerm;
    const isOrderFilledOrProgressOrClosed =
      this.order.status === OrderStatus.Filled ||
      this.order.status === OrderStatus.InProgress ||
      this.order.status === OrderStatus.Closed;
    const dateAvailable = candidate.closeDate
      ? addDays(candidate.closeDate, 14)?.getTime()! >= new Date().getTime()
      : true;
    this.isAddExtensionBtnAvailable =
      this.isOrganization &&
      isOrderFilledOrProgressOrClosed &&
      dateAvailable &&
      isOrderTravelerOrContractToPerm &&
      this.candidate.statusName !== CandidatStatus[CandidatStatus.Cancelled];
  }

  private getTemplate(): void {
    if (this.order && this.candidate) {
      if (this.isAgency) {
        const allowedApplyStatuses = [ApplicantStatus.NotApplied, ApplicantStatus.Applied, ApplicantStatus.Shortlisted];
        const allowedAcceptStatuses = [
          ApplicantStatus.Offered,
          ApplicantStatus.Accepted,
          ApplicantStatus.Rejected,
          ApplicantStatus.OnBoarded,
          ApplicantStatus.Cancelled,
          ApplicantStatus.Offboard,
        ];

        if (allowedApplyStatuses.includes(this.candidate.candidateStatus)) {
          this.store.dispatch(
            new GetOrderApplicantsData(this.order.orderId, this.order.organizationId, this.candidate.candidateId)
          );
          this.selectedTemplate = Template.apply;
        } else if (allowedAcceptStatuses.includes(this.candidate.candidateStatus)) {
          this.store.dispatch(new GetCandidateJob(this.order.organizationId, this.candidate.jobId));
          this.selectedTemplate = Template.accept;
        }
      } else if (this.isOrganization) {
        const allowedOfferDeploymentStatuses = [
          ApplicantStatus.Applied,
          ApplicantStatus.Shortlisted,
          ApplicantStatus.PreOfferCustom,
          ApplicantStatus.Offered,
        ];
        const allowedOnboardedStatuses = [
          ApplicantStatus.Accepted,
          ApplicantStatus.OnBoarded,
          ApplicantStatus.Cancelled,
          ApplicantStatus.Offboard,
        ];

        if (allowedOfferDeploymentStatuses.includes(this.candidate.candidateStatus)) {
          this.store.dispatch(new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.jobId));
          this.store.dispatch(new GetAvailableSteps(this.order.organizationId, this.candidate.jobId));
          this.selectedTemplate = Template.offerDeployment;
        } else if (allowedOnboardedStatuses.includes(this.candidate.candidateStatus)) {
          this.store.dispatch(new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.jobId));
          this.selectedTemplate = Template.onboarded;
        }
      }
    }
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
      if (data) {
        this.tab.select(1);
        const [order, candidate] = data;
        this.order = order as MergedOrder;
        this.candidate = candidate;
        this.isClosedOrder = this.isClosedOrderPosition;
        this.getTemplate();
        windowScrollTop();
        this.sideDialog.show();
        disabledBodyOverflow(true);
      } else {
        this.sideDialog.hide();
        this.selectedTemplate = null;
        disabledBodyOverflow(false);
        this.clearOrderCandidateList();
        this.clearCandidateJobState();
      }
    });
    this.jobStatusControl = new FormControl('');
  }

  private getComments(): void {
    if (this.isReorderType && this.candidateJob?.commentContainerId) {
      this.commentsService
      .getComments(this.candidateJob?.commentContainerId as number, null)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
        this.changeDetectorRef.markForCheck();
      });
    }
  }

  private subscribeOnCandidateJob(): void {
    if (this.isOrganization) {
      this.candidateJobState$.pipe(takeWhile(() => this.isAlive)).subscribe((orderCandidateJob) => {
        this.candidateJob = orderCandidateJob;
        if (orderCandidateJob) {
          this.getExtensions();
          this.getComments();
          this.setAcceptForm(orderCandidateJob);
          this.subscribeCandidateCancellationReasons();
        }
      });
    }
    if (this.isAgency) {
      this.agencyCandidatesJob$.pipe(takeWhile(() => this.isAlive)).subscribe((orderCandidateJob) => {
        this.candidateJob = orderCandidateJob;
        if (orderCandidateJob) {
          this.getExtensions();
          this.getComments();
          this.setAcceptForm(orderCandidateJob);
          this.subscribeCandidateCancellationReasons();
        }
      });
    }
     }

  private setAcceptForm({
    order: {
      hourlyRate,
      locationName,
      departmentName,
      skillName,
      orderOpenDate,
      shiftStartTime,
      shiftEndTime,
      openPositions,
    },
    candidateBillRate,
    offeredBillRate,
    organizationPrefix,
    orderPublicId,
    jobCancellation,
    reOrderDate,
    candidatePayRate,
    clockId,
  }: OrderCandidateJob) {

    const candidateBillRateValue = candidateBillRate ?? hourlyRate;
    const isBillRatePending =
      this.candidateJob?.applicantStatus.applicantStatus === CandidatStatus.BillRatePending
        ? candidateBillRate
        : offeredBillRate;
    const orderDate = this.order.orderType === OrderType.ReOrder ? reOrderDate : orderOpenDate;

    this.acceptForm.patchValue({
      reOrderFromId: `${organizationPrefix}-${orderPublicId}`,
      offeredBillRate: PriceUtils.formatNumbers(hourlyRate),
      candidateBillRate: PriceUtils.formatNumbers(candidateBillRateValue),
      locationName,
      departmentName,
      skillName,
      orderOpenDate: DateTimeHelper.setCurrentTimeZone(orderDate as string),
      shiftStartTime: shiftStartTime ? DateTimeHelper.setCurrentTimeZone(shiftStartTime.toString()) : '',
      shiftEndTime: shiftEndTime ? DateTimeHelper.setCurrentTimeZone(shiftEndTime.toString()) : '',
      openPositions,
      hourlyRate: PriceUtils.formatNumbers(isBillRatePending),
      jobCancellationReason: CancellationReasonsMap[jobCancellation?.jobCancellationReason || 0],
      penaltyCriteria: PenaltiesMap[jobCancellation?.penaltyCriteria || 0],
      rate: jobCancellation?.rate,
      hours: jobCancellation?.hours,
      candidatePayRate: candidatePayRate,
      clockId: clockId,
    });
    this.enableFields();
  }

  private enableFields(): void {
    const applicantStatus = this.candidateJob?.applicantStatus.applicantStatus;
    if (this.isAgency && applicantStatus === CandidatStatus.Offered) {
      this.acceptForm.get('candidatePayRate')?.enable();
    } else {
      this.acceptForm.get('candidatePayRate')?.disable();
    }

    if (!this.isCancelled) {
      this.acceptForm.get('candidateBillRate')?.enable();
    }
    switch (applicantStatus) {
      case !this.isAgency && CandidatStatus.BillRatePending:
        this.acceptForm.get('hourlyRate')?.enable();
        this.acceptForm.get('candidateBillRate')?.disable();
        break;
      case CandidatStatus.OfferedBR:
      case CandidatStatus.OnBoard:
      case CandidatStatus.Rejected:
      case CandidatStatus.BillRatePending:
        this.acceptForm.disable();
        break;

      default:
        break;
    }
  }

  private subscribeOnSelectedOrder() {
    this.selectedOrder$.pipe(takeUntil(this.componentDestroy()))
      .subscribe((data) => {
        this.selectedOrder = data;
      });
  }

  private subscribeOnCancelOrganizationCandidateJobSuccess(): void {
    this.actions$
      .pipe(
        takeWhile(() => this.isAlive),
        ofActionSuccessful(CancelOrganizationCandidateJobSuccess)
      )
      .subscribe(() => {
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
  }

  private checkForAgencyStatus(): void {
    this.store
      .select(UserState.agencyActionsAllowed)
      .pipe(
        distinctUntilChanged(),
        takeWhile(() => this.isAlive)
      )
      .subscribe((value) => {
        this.agencyActionsAllowed = value;
      });
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions()
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(({ canCloseOrder, canCreateOrder }) => {
        this.canCreateOrder = canCreateOrder;
        this.canCloseOrder = canCloseOrder;
      });
  }

  private getDeployedCandidateOrders(): void {
    if (!!this.candidate.deployedCandidateInfo) {
      const candidateId = this.candidate.candidateId;
      const organizationId = this.candidate.organizationId || this.candidate.deployedCandidateInfo.organizationId;
      const orderId = this.candidate.orderId;
      this.store.dispatch(new GetDeployedCandidateOrderInfo(orderId, candidateId, organizationId));
    }
  }

  private clearOrderCandidateList(): void {
    const ClearCandidatesList = this.isAgency ? ClearAgencyOrderCandidatesList : ClearOrderCandidatePage;
    this.store.dispatch(new ClearCandidatesList());
  }

  private showMissingCredentialsWarningMessage(): void {
    this.confirmService
      .confirm(ExpiredCredentialsMessage, {
        title: 'Add Extension',
        okButtonLabel: 'Yes',
        okButtonClass: 'delete-button',
      })
      .pipe(
        filter(Boolean),
        take(1)
      ).subscribe(() => {
        this.isExtensionSidebarShown = true;
        this.ignoreMissingCredentials = true;
        this.changeDetectorRef.markForCheck();
      });
  }

  private getMissingCredentialsRequestBody(): MissingCredentialsRequestBody {
    return {
      orderId: this.order.orderId || this.order.id,
      candidateProfileId: this.candidate.candidateId,
      validateForDate: DateTimeHelper.setInitHours(
        DateTimeHelper.setUtcTimeZone(addDays(this.candidateJob?.actualEndDate as string, 1) as Date)
      ),
    };
  }

  private getCandidatePayRateSetting(): void {
    const organizationId = this.candidate.organizationId;

    if (organizationId) {
      this.settingService
        .getViewSettingKey(
          OrganizationSettingKeys.CandidatePayRate,
          OrganizationalHierarchy.Organization,
          organizationId,
          organizationId
        ).pipe(takeUntil(this.componentDestroy()))
        .subscribe(({ CandidatePayRate }) => {
          this.isCandidatePayRateVisible = JSON.parse(CandidatePayRate);
        });
    }
  }

  private updateOrganisationCandidateJob(): void {
    const value = this.acceptForm.getRawValue();

    const candidateJob: AcceptJobDTO = {
      orderId: this.candidateJob?.orderId!,
      organizationId: this.candidateJob?.organizationId!,
      jobId: this.candidateJob?.jobId!,
      candidateBillRate: value.candidateBillRate,
      candidatePayRate: value.candidatePayRate,
      offeredBillRate: value.offeredBillRate,
      clockId: value.clockId,
      nextApplicantStatus: {
        applicantStatus: ApplicantStatus.Cancelled,
        statusText: "Cancelled",
        isEnabled: true,
      },
    };

    this.store.dispatch(new UpdateOrganisationCandidateJob(candidateJob));
  }

  private deleteUpdateFieldInRate(): void {
    this.candidateJob?.billRates.filter((rate) => Object.prototype.hasOwnProperty.call(rate, 'isUpdated'))
    .forEach((rate) => {
      delete rate.isUpdated;
    });
  }

  private checkForBillRateUpdate(rates: BillRate[]): boolean {
    return rates.some((rate) => !!rate.isUpdated);
  }


  private subscribeCandidateCancellationReasons() {
    if (this.candidateJob) {
      const payload: CandidateCancellationReasonFilter = {
        locationId: this.candidateJob?.order.locationId,
        regionId: this.candidateJob?.order.regionId,
      };
      this.store.dispatch(new GetCandidateCancellationReason(payload));
      this.candidateCancellationReasons$
        .pipe(
          takeUntil(this.componentDestroy())
        ).subscribe((value) => {
          this.candidateCancellationReasons =value;
        });

    }
  }
}
