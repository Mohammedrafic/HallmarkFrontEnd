import { ClearDeployedCandidateOrderInfo, GetCandidateJob, GetDeployedCandidateOrderInfo, GetOrderApplicantsData } from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GetAvailableSteps, GetOrganisationCandidateJob, GetPredefinedBillRates } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { Select, Store } from '@ngxs/store';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { OrderCandidateListViewService } from '@shared/components/order-candidate-list/order-candidate-list-view.service';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { Order, OrderCandidatesList } from '@shared/models/order-management.model';
import { DeployedCandidateOrderInfo } from '@shared/models/deployed-candidate-order-info.model';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { UserState } from 'src/app/store/user.state';
import { Duration } from '../../../enums/durations';
import { AbstractOrderCandidateListComponent } from '../abstract-order-candidate-list.component';
import { AcceptCandidateComponent } from './accept-candidate/accept-candidate.component';
import { ApplyCandidateComponent } from './apply-candidate/apply-candidate.component';
import { OfferDeploymentComponent } from './offer-deployment/offer-deployment.component';
import { OnboardedCandidateComponent } from './onboarded-candidate/onboarded-candidate.component';

@Component({
  selector: 'app-order-candidates-list',
  templateUrl: './order-candidates-list.component.html',
  styleUrls: ['./order-candidates-list.component.scss'],
})
export class OrderCandidatesListComponent extends AbstractOrderCandidateListComponent implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('accept') accept: AcceptCandidateComponent;
  @ViewChild('apply') apply: ApplyCandidateComponent;
  @ViewChild('onboarded') onboarded: OnboardedCandidateComponent;
  @ViewChild('offerDeployment') offerDeployment: OfferDeploymentComponent;

  @Select(OrderManagementState.selectedOrder)
  public selectedAgOrder$: Observable<Order>;

  @Select(OrderManagementContentState.selectedOrder)
  public selectedOrgOrder$: Observable<Order>;

  @Select(OrderManagementState.deployedCandidateOrderInfo)
  public readonly deployedCandidateOrderInfo$: Observable<DeployedCandidateOrderInfo[]>;

  public templateState: Subject<any> = new Subject();
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  public candidate: OrderCandidatesList;
  public applicantStatus = ApplicantStatus;
  public defaultDuration: Duration = Duration.Other;
  public selectedOrder: Order;
  public agencyActionsAllowed = true;
  public deployedCandidateOrderIds: string[] = [];
  public isOrderOverlapped = false;
  public hideWithStatus = [
    ApplicantStatus.Rejected,
    ApplicantStatus.Cancelled,
    ApplicantStatus.NotApplied,
    ApplicantStatus.Withdraw,
  ];

  get isShowDropdown(): boolean {
    return [ApplicantStatus.Rejected, ApplicantStatus.OnBoarded].includes(this.candidate.status) && !this.isAgency;
  }

  constructor(
    protected override store: Store,
    protected override router: Router,
    private orderCandidateListViewService: OrderCandidateListViewService
  ) {
    super(store, router);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    combineLatest([this.selectedAgOrder$, this.selectedOrgOrder$])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([agOrder, orgOrder]) => {
        this.selectedOrder = agOrder ?? orgOrder;
        this.initPredefinedBillRates();
      });
    if (this.isAgency) {
      this.checkForAgencyStatus();
      this.subscribeToDeployedCandidateOrdersInfo();
    }
  }

  public onEdit(data: OrderCandidatesList, event: MouseEvent): void {
    if (this.order?.isClosed || data.status === ApplicantStatus.Offboard) {
      return;
    }

    this.candidate = { ...data };
    this.getDeployedCandidateOrders();

    this.orderCandidateListViewService.setIsCandidateOpened(true);
    if (this.order && this.candidate) {
      if (this.isAgency) {
        const allowedApplyStatuses = [ApplicantStatus.NotApplied, ApplicantStatus.Withdraw];
        const allowedAcceptStatuses = [
          ApplicantStatus.Offered,
          ApplicantStatus.Accepted,
          ApplicantStatus.Rejected,
          ApplicantStatus.Applied,
          ApplicantStatus.Shortlisted,
          ApplicantStatus.OnBoarded,
          ApplicantStatus.Cancelled,
          ApplicantStatus.PreOfferCustom,
        ];

        if (allowedApplyStatuses.includes(this.candidate.status)) {
          this.store.dispatch(
            new GetOrderApplicantsData(this.order.orderId, this.order.organizationId, this.candidate.candidateId)
          );
          data.candidateJobId &&
            this.store.dispatch(new GetCandidateJob(this.order.organizationId, data.candidateJobId));
          this.openDialog(this.apply);
        } else if (allowedAcceptStatuses.includes(this.candidate.status)) {
          this.store.dispatch(new GetCandidateJob(this.order.organizationId, data.candidateJobId));
          this.openDialog(this.accept);
        }
      } else if (this.isOrganization) {
        const allowedOfferDeploymentStatuses = [
          ApplicantStatus.Withdraw,
          ApplicantStatus.Rejected,
          ApplicantStatus.Applied,
          ApplicantStatus.Shortlisted,
          ApplicantStatus.PreOfferCustom,
          ApplicantStatus.Offered,
        ];
        const allowedOnboardedStatuses = [
          ApplicantStatus.Accepted,
          ApplicantStatus.OnBoarded,
          ApplicantStatus.Cancelled,
        ];

        if (allowedOfferDeploymentStatuses.includes(this.candidate.status)) {
          this.store.dispatch(
            new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.candidateJobId)
          );
          if (!this.isShowDropdown) {
            this.store.dispatch(new GetAvailableSteps(this.order.organizationId, this.candidate.candidateJobId));
          }
          this.openDialog(this.offerDeployment);
        } else if (allowedOnboardedStatuses.includes(this.candidate.status)) {
          this.store.dispatch(
            new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.candidateJobId)
          );
          this.store.dispatch(new GetAvailableSteps(this.order.organizationId, this.candidate.candidateJobId));
          this.openDialog(this.onboarded);
        }
      }
    }
  }

  private getDeployedCandidateOrders(): void {
    if (!!this.candidate.deployedCandidateInfo) {
      const candidateId = this.candidate.candidateId;
      const organizationId = this.candidate.organizationId || this.candidate.deployedCandidateInfo.organizationId;
      this.store.dispatch(new GetDeployedCandidateOrderInfo(this.order.orderId, candidateId, organizationId));
    }
  }

  public onCloseDialog(): void {
    this.clearDeployedCandidateOrderInfo();
    this.sideDialog.hide();
  }

  private openDialog(template: any): void {
    this.templateState.next(template);
    this.sideDialog.show();
  }

  private checkForAgencyStatus(): void {
    this.store
      .select(UserState.agencyActionsAllowed)
      .pipe(distinctUntilChanged(), takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.agencyActionsAllowed = value;
      });
  }

  private initPredefinedBillRates(): void {
    this.store.dispatch(new GetPredefinedBillRates());
  }

  private subscribeToDeployedCandidateOrdersInfo(): void {
    this.deployedCandidateOrderInfo$.pipe(takeUntil(this.unsubscribe$)).subscribe((ordersInfo) => {
      this.isOrderOverlapped = this.isOrderOverlappingByDate(ordersInfo);
      this.deployedCandidateOrderIds = ordersInfo.map((data) => data.orderPublicId);
    });
  }

  private isOrderOverlappingByDate(ordersInfo: DeployedCandidateOrderInfo[]): boolean {
    const timeRange_1 = {
      start: this.selectedOrder.jobStartDate,
      end: this.selectedOrder.jobEndDate,
    };
    const isOverlaped: boolean[] = [];

    ordersInfo.forEach((order) => {
      const timeRange_2 = {
        start: order.positionActualStartDate,
        end: order.positionActualEndDate,
      };
      isOverlaped.push(this.isThereOverlappingDateRange(timeRange_1, timeRange_2));
    });

    return isOverlaped.includes(true);
  }

  private isThereOverlappingDateRange(
    timeRange_1: { start: Date | string; end: Date | string },
    timeRange_2: { start: Date | string; end: Date | string }
  ): boolean {
    const startDate_1 = new Date(timeRange_1.start).getTime();
    const endDate_1 = new Date(timeRange_1.end).getTime();
    const startDate_2 = new Date(timeRange_2.start).getTime();
    const endDate_2 = new Date(timeRange_2.end).getTime();

    if (endDate_1 && endDate_2) {
      return startDate_1 <= endDate_2 && startDate_2 <= endDate_1;
    }
    if (endDate_1 && !endDate_2) {
      return endDate_1 > startDate_2;
    }
    if (!endDate_1 && endDate_2) {
      return startDate_1 < endDate_2;
    }
    return true;
  }

  private clearDeployedCandidateOrderInfo(): void {
    if (this.deployedCandidateOrderIds.length) {
      this.store.dispatch(new ClearDeployedCandidateOrderInfo());
    }
  }
}
