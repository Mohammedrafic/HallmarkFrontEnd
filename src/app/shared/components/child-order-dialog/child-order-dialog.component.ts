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
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeWhile, tap } from 'rxjs';

import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import {
  AccordionComponent,
  SelectEventArgs,
  SelectingEventArgs,
  TabComponent,
} from '@syncfusion/ej2-angular-navigations';

import { OrderManagementState } from '@agency/store/order-management.state';
import { OrderType } from '@shared/enums/order-type';
import {
  AgencyOrderManagement,
  Order,
  OrderCandidateJob,
  OrderFilter,
  OrderManagementChild,
} from '@shared/models/order-management.model';
import { AcceptFormComponent } from '@shared/components/order-candidate-list/reorder-candidates-list/reorder-status-dialog/accept-form/accept-form.component';
import PriceUtils from '@shared/utils/price.utils';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { ApplicantStatus, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { GetAgencyExtensions, GetCandidateJob, GetOrderApplicantsData } from '@agency/store/order-management.actions';
import {
  GetAvailableSteps,
  GetExtensions,
  GetOrganisationCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  UpdateOrganisationCandidateJob,
} from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { OrderStatusText } from '@shared/enums/status';
import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';
import { ShowCloseOrderDialog } from '../../../store/app.actions';
import { OrderStatus } from '@shared/enums/order-management';
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';
import { BillRate } from '@shared/models';
import { addDays, toCorrectTimezoneFormat } from '@shared/utils/date-time.utils';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';
import { ExtensionSidebarComponent } from '@shared/components/extension/extension-sidebar/extension-sidebar.component';
import { AppState } from '../../../store/app.state';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ExtensionCandidateComponent } from '../order-candidate-list/order-candidates-list/extension-candidate/extension-candidate.component';
import { filter } from 'rxjs/operators';

enum Template {
  accept,
  apply,
  onboarded,
  offerDeployment,
}

type MergedOrder = AgencyOrderManagement & Order;

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

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('chipList') chipList: ChipListComponent;
  @ViewChild('tab') tab: TabComponent;
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;
  @ViewChild(ExtensionSidebarComponent) extensionSidebarComponent: ExtensionSidebarComponent;
  @ViewChild(ExtensionCandidateComponent) extensionCandidateComponent: ExtensionCandidateComponent;

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

  public readonly buttonTypeEnum = ButtonTypeEnum;
  public readonly orderStatus = OrderStatus;

  private isAlive = true;

  constructor(
    private chipsCssClass: ChipsCssClass,
    private router: Router,
    private store: Store,
    private commentsService: CommentsService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.isAgency = this.router.url.includes('agency');
    this.isOrganization = this.router.url.includes('client');
    this.selectedOrder$ = this.isAgency ? this.agencySelectedOrder$ : this.orgSelectedOrder$;
    this.extensions$ = this.isAgency ? this.agencyExtensions$ : this.organizationExtensions$;
    this.subscribeOnCandidateJob();
    this.onOpenEvent();
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

  public onTabSelecting(event: SelectingEventArgs): void {
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
    if (this.extensionCandidateComponent?.form.dirty) {
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
            actualStartDate: this.candidateJob?.actualStartDate as string,
            actualEndDate: this.candidateJob?.actualEndDate as string,
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
    this.isExtensionSidebarShown = false;
  }

  public saveExtension(): void {
    this.extensionSidebarComponent.saveExtension(this.sideDialog);
  }

  public getExtensions(): void {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);

    if (isAgencyArea) {
      this.store.dispatch(new GetAgencyExtensions(this.candidateJob?.jobId!, this.candidateJob?.organizationId!));
    } else {
      this.store.dispatch(new GetExtensions(this.candidateJob?.jobId!));
    }
  }

  public updateGrid(): void {
    this.closeExtensionSidebar();
    this.getExtensions();
    this.saveEmitter.emit();
  }

  private closeSideDialog(): void {
    this.tab.select(0);
    this.sideDialog.hide();
    this.openEvent.next(null);
    this.selectedTemplate = null;
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
    const isOrderFilledOrProgress =
      this.order.status === OrderStatus.Filled || this.order.status === OrderStatus.InProgress;
    const dateAvailable = candidate.closeDate
      ? addDays(candidate.closeDate, 14)?.getTime()! >= new Date().getTime()
      : true;
    this.isAddExtensionBtnAvailable =
      this.isOrganization && isOrderFilledOrProgress && dateAvailable && isOrderTravelerOrContractToPerm;
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
        const allowedOnboardedStatuses = [ApplicantStatus.Accepted, ApplicantStatus.OnBoarded];

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
    });
    this.enableFields();
  }

  private enableFields(): void {
    this.acceptForm.get('candidateBillRate')?.enable();
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
}
