import { GetCandidateJob, GetOrderApplicantsData } from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GetAvailableSteps, GetOrganisationCandidateJob,
  GetPredefinedBillRates, SetPredefinedBillRatesData
} from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { Select, Store } from '@ngxs/store';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { OrderCandidateListViewService } from '@shared/components/order-candidate-list/order-candidate-list-view.service';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { Order, OrderCandidatesList } from '@shared/models/order-management.model';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { combineLatest, Observable, Subject, switchMap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

  public templateState: Subject<any> = new Subject();
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  public candidate: OrderCandidatesList;
  public applicantStatus = ApplicantStatus;
  public defaultDuration: Duration = Duration.Other;
  public selectedOrder: Order;

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
  }

  public onEdit(data: OrderCandidatesList, event: MouseEvent): void {
    if (this.order?.isClosed || data.status === ApplicantStatus.Offboard) {
      return;
    }

    this.candidate = { ...data };

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
          if (!this.isShowDropdown && !this.candidate.deployedCandidateInfo) {
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

  public onCloseDialog(): void {
    this.sideDialog.hide();
  }

  private openDialog(template: any): void {
    this.templateState.next(template);
    this.sideDialog.show();
  }

  private initPredefinedBillRates(): void {
    const { orderType, departmentId, skillId } = this.selectedOrder;

    this.store.dispatch(new SetPredefinedBillRatesData(orderType, departmentId, skillId)).pipe(
      takeUntil(this.unsubscribe$),
      switchMap(() => this.store.dispatch(new GetPredefinedBillRates()))
    ).subscribe();
  }
}
