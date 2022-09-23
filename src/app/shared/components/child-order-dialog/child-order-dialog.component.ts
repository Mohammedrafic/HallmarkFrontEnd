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
import { FormControl } from "@angular/forms";
import { Router } from '@angular/router';
import { OPTION_FIELDS } from "@shared/components/order-candidate-list/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst";
import { JobCancellation } from "@shared/models/candidate-cancellation.model";

import { MenuEventArgs } from '@syncfusion/ej2-angular-navigations';
import { GetAgencyExtensions, GetCandidateJob, GetOrderApplicantsData } from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { ReOpenOrderService } from '@client/order-management/reopen-order/reopen-order.service';
import {
  CancelOrganizationCandidateJob, CancelOrganizationCandidateJobSuccess,
  GetAvailableSteps,
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
import { AcceptFormComponent } from '@shared/components/order-candidate-list/reorder-candidates-list/reorder-status-dialog/accept-form/accept-form.component';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, SET_READONLY_STATUS } from '@shared/constants';
import { OrderCandidateListViewService } from '@shared/components/order-candidate-list/order-candidate-list-view.service';
import { UnsavedFormDirective } from '@shared/directives/unsaved-form.directive';
import { ApplicantStatus as ApplicantStatusEnum, ApplicantStatus, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { MessageTypes } from '@shared/enums/message-types';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderType } from '@shared/enums/order-type';
import { OrderStatusText } from '@shared/enums/status';
import { BillRate } from '@shared/models';
import { Comment } from '@shared/models/comment.model';
import {
  AgencyOrderManagement,
  Order,
  OrderCandidateJob,
  OrderFilter,
  OrderManagementChild,
} from '@shared/models/order-management.model';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { CommentsService } from '@shared/services/comments.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { addDays, toCorrectTimezoneFormat } from '@shared/utils/date-time.utils';
import PriceUtils from '@shared/utils/price.utils';
import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';

import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';
import {
  AccordionComponent,
  SelectEventArgs,
  SelectingEventArgs,
  TabComponent,
} from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { catchError, EMPTY, Observable, Subject, take, takeUntil, takeWhile } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ShowCloseOrderDialog, ShowToast } from 'src/app/store/app.actions';
import { AppState } from 'src/app/store/app.state';

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
export class ChildOrderDialogComponent implements OnInit, OnChanges, OnDestroy {
  @Input() order: MergedOrder;
  @Input() openEvent: Subject<[AgencyOrderManagement, OrderManagementChild] | null>;
  @Input() candidate: OrderManagementChild;
  @Input() filters: OrderFilter;
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

  public firstActive = true;
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public orderType = OrderType;
  public selectedTemplate: Template | null;
  public template = Template;
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

  public  readonly nextApplicantStatuses = [
    { applicantStatus: CandidatStatus.Cancelled, statusText: CandidatStatus[CandidatStatus.Cancelled], isEnabled: true }
  ];
  public readonly buttonTypeEnum = ButtonTypeEnum;
  public readonly orderStatus = OrderStatus;

  private isAlive = true;

  get isReorderType(): boolean {
    return this.candidateJob?.order.orderType === OrderType.ReOrder;
  }

  get isCancelled(): boolean {
    return this.candidateJob?.applicantStatus.applicantStatus === CandidatStatus.Cancelled;
  }

  get isOnboard(): boolean {
    return this.candidateJob?.applicantStatus.applicantStatus === CandidatStatus.OnBoard;
  }

  get showAddExtension(): boolean {
    return this.isAddExtensionBtnAvailable && !this.extensions?.length;
  }

  get disableAddExtension(): boolean {
    return this.candidate?.orderStatus === this.orderStatus.InProgressOfferAccepted;
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

  constructor(
    private chipsCssClass: ChipsCssClass,
    private router: Router,
    private store: Store,
    private actions$: Actions,
    private commentsService: CommentsService,
    private confirmService: ConfirmService,
    private orderCandidateListViewService: OrderCandidateListViewService,
    private reOpenOrderService: ReOpenOrderService
  ) {}

  ngOnInit(): void {
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
      });
    this.subscribeOnCandidateJob();
    this.onOpenEvent();
    this.subscribeOnSelectedOrder();
    this.subscribeOnCancelOrganizationCandidateJobSuccess();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const candidate = changes['candidate']?.currentValue;
    if (candidate) {
      this.setCloseOrderButtonState();
      this.setAddExtensionBtnState(candidate);

      if (this.chipList) {
        this.chipList.cssClass = this.chipsCssClass.transform(
          this.orderStatusText[changes['candidate'].currentValue.orderStatus]
        );
      }
    }
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  setCloseOrderButtonState(): void {
    this.disabledCloseButton =
      !!this.candidate?.positionClosureReasonId || this.candidate.orderStatus !== OrderStatus.Filled;
  }

  closeOrder(order: MergedOrder): void {
    this.store.dispatch(new ShowCloseOrderDialog(true, true));
    this.order = { ...order };
  }

  get canReOpen(): boolean {
    return (
      this.candidate?.orderStatus !== OrderStatus.Closed &&
      Boolean(this.candidate?.positionClosureReasonId) &&
      !this.isAgency
    );
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
      this.saveExtensionChanges().subscribe(() => this.closeSideDialog());
    } else {
      this.closeSideDialog();
    }
  }

  public onBillRatesChanged(bill: BillRate): void {
    if (!this.acceptForm.errors && this.candidateJob) {
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
            billRates: this.getBillRateForUpdate(bill),
          })
        )
        .subscribe(() => {
          this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
        });
    }
  }

  getBillRateForUpdate(value: BillRate): BillRate[] {
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
    this.isExtensionSidebarShown = true;
  }

  public closeExtensionSidebar(): void {
    if (this.extensionSidebarComponent.extensionForm.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.isExtensionSidebarShown = false;
        });
    } else {
      this.isExtensionSidebarShown = false;
    }
  }

  public saveExtension(): void {
    this.extensionSidebarComponent.saveExtension(this.sideDialog);
  }

  public getExtensions(): void {
    if (!this.candidateJob?.jobId) {
      return;
    }

    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);

    if (isAgencyArea) {
      this.store.dispatch(
        new GetAgencyExtensions(this.candidateJob?.jobId, this.selectedOrder?.id!, this.candidateJob?.organizationId!)
      );
    } else {
      this.store.dispatch(new GetOrganizationExtensions(this.candidateJob?.jobId, this.order.id));
    }
  }

  public updateGrid(): void {
    this.isExtensionSidebarShown = false;
    this.getExtensions();
    this.saveEmitter.emit();
  }

  public onDropDownChanged(event: { itemData: { applicantStatus: ApplicantStatus; isEnabled: boolean } }): void {
    if (event.itemData?.isEnabled) {
      if (event.itemData?.applicantStatus === ApplicantStatusEnum.Cancelled) {
        this.openCandidateCancellationDialog.next();
      }
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, SET_READONLY_STATUS));
    }
  }

  public cancelCandidate(jobCancellationDto: JobCancellation): void {
    if (this.candidateJob) {
      this.store.dispatch(new CancelOrganizationCandidateJob({
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        jobCancellationDto,
      }));
      this.closeSideDialog();
    }
  }

  public resetStatusesFormControl(): void {
    this.jobStatusControl.reset();
  }

  private closeSideDialog(): void {
    this.tab.select(0);
    this.sideDialog.hide();
    this.openEvent.next(null);
    this.selectedTemplate = null;
    this.jobStatusControl.reset();
    this.orderCandidateListViewService.setIsCandidateOpened(false);
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
      this.isOrganization && isOrderFilledOrProgressOrClosed && dateAvailable && isOrderTravelerOrContractToPerm;
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
          ApplicantStatus.Offboard,
        ];
        const allowedOnboardedStatuses = [
          ApplicantStatus.Accepted,
          ApplicantStatus.OnBoarded,
          ApplicantStatus.Cancelled,
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
        this.getTemplate();
        windowScrollTop();
        this.sideDialog.show();
        disabledBodyOverflow(true);
      } else {
        this.sideDialog.hide();
        this.selectedTemplate = null;
        disabledBodyOverflow(false);
      }
    });
    this.jobStatusControl = new FormControl('');
  }

  private getComments(): void {
    this.commentsService
      .getComments(this.candidateJob?.commentContainerId as number, null)
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
      });
  }

  private subscribeOnCandidateJob(): void {
    if (this.isOrganization) {
      this.candidateJobState$.pipe(takeWhile(() => this.isAlive)).subscribe((orderCandidateJob) => {
        this.candidateJob = orderCandidateJob;
        if (orderCandidateJob) {
          this.getExtensions();
          this.getComments();
          this.setAcceptForm(orderCandidateJob);
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
  }: OrderCandidateJob) {
    const candidateBillRateValue = candidateBillRate ?? hourlyRate;
    const isBillRatePending =
      this.candidateJob?.applicantStatus.applicantStatus === CandidatStatus.BillRatePending
        ? candidateBillRate
        : offeredBillRate;
    this.acceptForm.patchValue({
      reOrderFromId: `${organizationPrefix}-${orderPublicId}`,
      offeredBillRate: PriceUtils.formatNumbers(hourlyRate),
      candidateBillRate: PriceUtils.formatNumbers(candidateBillRateValue),
      locationName,
      departmentName,
      skillName,
      orderOpenDate,
      shiftStartTime,
      shiftEndTime,
      openPositions,
      hourlyRate: PriceUtils.formatNumbers(isBillRatePending),
      jobCancellationReason: CancellationReasonsMap[jobCancellation?.jobCancellationReason || 0],
      penaltyCriteria: PenaltiesMap[jobCancellation?.penaltyCriteria || 0],
      rate: jobCancellation?.rate,
      hours: jobCancellation?.hours,
    });
    this.enableFields();
  }

  private enableFields(): void {
    if (!this.isCancelled) {
      this.acceptForm.get('candidateBillRate')?.enable();
    }
    switch (this.candidateJob?.applicantStatus.applicantStatus) {
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
    this.selectedOrder$.subscribe((data) => {
      this.selectedOrder = data;
    });
  }

  private subscribeOnCancelOrganizationCandidateJobSuccess(): void {
    this.actions$
      .pipe(takeWhile(() => this.isAlive), ofActionSuccessful(CancelOrganizationCandidateJobSuccess))
      .subscribe(() => {
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
  }
}
