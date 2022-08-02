import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeWhile } from 'rxjs';

import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import {
  AccordionClickArgs,
  AccordionComponent,
  ExpandEventArgs,
  SelectEventArgs,
  TabComponent
} from '@syncfusion/ej2-angular-navigations';

import { OrderManagementState } from '@agency/store/order-management.state';
import { OrderType } from '@shared/enums/order-type';
import { AgencyOrderManagement, Order, OrderCandidateJob, OrderManagementChild, } from '@shared/models/order-management.model';
import { AcceptFormComponent } from "@shared/components/order-candidate-list/reorder-candidates-list/reorder-status-dialog/accept-form/accept-form.component";
import { AccordionOneField } from "@shared/models/accordion-one-field.model";
import PriceUtils from "@shared/utils/price.utils";
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { ApplicantStatus, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { GetCandidateJob, GetOrderApplicantsData } from '@agency/store/order-management.actions';
import { GetAvailableSteps, GetOrganisationCandidateJob } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { OrderStatusText } from '@shared/enums/status';
import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';
import { ShowCloseOrderDialog } from '../../../store/app.actions';
import { OrderStatus } from '@shared/enums/order-management';

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

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('chipList') chipList: ChipListComponent;
  @ViewChild('tab') tab: TabComponent;
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Select(OrderManagementState.selectedOrder)
  public agencySelectedOrder$: Observable<Order>;

  @Select(OrderManagementContentState.selectedOrder)
  public orgSelectedOrder$: Observable<Order>;

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

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
  public accordionOneField: AccordionOneField;
  public accordionClickElement: HTMLElement | null;
  public acceptForm = AcceptFormComponent.generateFormGroup();
  public candidateJob: OrderCandidateJob | null;
  public candidateStatus = CandidatStatus;

  private isAlive = true;

  constructor(private chipsCssClass: ChipsCssClass, private router: Router, private store: Store) {}

  ngOnInit(): void {
    this.isAgency = this.router.url.includes('agency');
    this.isOrganization = this.router.url.includes('client');
    this.selectedOrder$ = this.isAgency ? this.agencySelectedOrder$ : this.orgSelectedOrder$;
    this.subscribeOnCandidateJob();
    this.onOpenEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidate']?.currentValue) {
      this.setCloseOrderButtonState();
      if (this.chipList) {
        this.chipList.cssClass = this.chipsCssClass.transform(this.orderStatusText[changes['candidate'].currentValue.orderStatus]);
      }
    }
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  setCloseOrderButtonState(): void {
    this.disabledCloseButton = !!this.candidate?.positionClosureReasonId || this.candidate.orderStatus !== OrderStatus.Filled;
  }

  closeOrder(order: MergedOrder): void {
    this.store.dispatch(new ShowCloseOrderDialog(true, true));
    this.order = { ...order };
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

  public onCloseDialog(): void {}

  public onClose(): void {
    this.tab.select(0);
    this.sideDialog.hide();
    this.openEvent.next(null);
    this.selectedTemplate = null;
  }

  public clickedOnAccordion(accordionClick: AccordionClickArgs): void {
    this.accordionOneField = new AccordionOneField(this.accordionComponent);
    this.accordionClickElement = this.accordionOneField.clickedOnAccordion(accordionClick);
  }

  public toForbidExpandSecondRow(expandEvent: ExpandEventArgs): void {
    this.accordionOneField = new AccordionOneField(this.accordionComponent);
    this.accordionOneField.toForbidExpandSecondRow(expandEvent, this.accordionClickElement);
  }

  private getTemplate(): void {
    if (this.order && this.candidate) {
      if (this.isAgency) {
        const allowedApplyStatuses = [
          ApplicantStatus.NotApplied,
          ApplicantStatus.Applied,
          ApplicantStatus.Shortlisted,
        ];
        const allowedAcceptStatuses = [
          ApplicantStatus.Offered,
          ApplicantStatus.Accepted,
          ApplicantStatus.Rejected,
          ApplicantStatus.OnBoarded,
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
        const allowedOnboardedStatuses = [ApplicantStatus.Accepted, ApplicantStatus.OnBoarded];

        if (allowedOfferDeploymentStatuses.includes(this.candidate.candidateStatus)) {
          this.store.dispatch(new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.jobId));
          this.store.dispatch(new GetAvailableSteps(this.order.organizationId, this.candidate.jobId));
          this.selectedTemplate = Template.offerDeployment;
        } else if (allowedOnboardedStatuses.includes(this.candidate.candidateStatus)) {
          this.store.dispatch(new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.jobId));
          this.selectedTemplate =  Template.onboarded;
        }
      }
    }
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
      if (data) {
        this.tab.select(1);
        const [order, candidat] = data;
        this.order = order as MergedOrder;
        this.candidate = candidat;
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

  private subscribeOnCandidateJob(): void {
    this.candidateJobState$.pipe(takeWhile(() => this.isAlive)).subscribe((orderCandidateJob) => {
      this.candidateJob = orderCandidateJob;
      if (orderCandidateJob) {
        this.setAcceptForm(orderCandidateJob);
      }
    });
  }

  private setAcceptForm({
                         order: {
                           reOrderFromId,
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
                         orderId,
                         positionId,
                       }: OrderCandidateJob) {
    const candidateBillRateValue = candidateBillRate ?? hourlyRate;
    const isBillRatePending =
      this.candidateJob?.applicantStatus.applicantStatus === CandidatStatus.BillRatePending
        ? candidateBillRate
        : offeredBillRate;
    this.acceptForm.patchValue({
      reOrderFromId: `${reOrderFromId}-${orderId}-${positionId}`,
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

