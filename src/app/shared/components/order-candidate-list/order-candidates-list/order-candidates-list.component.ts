import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { GetCandidateJob, GetOrderApplicantsData } from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { GetAvailableSteps, GetOrganisationCandidateJob } from '@client/store/order-managment-content.actions';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { Order, OrderCandidatesList } from '@shared/models/order-management.model';
import { AcceptCandidateComponent } from './accept-candidate/accept-candidate.component';
import { ApplyCandidateComponent } from './apply-candidate/apply-candidate.component';
import { OfferDeploymentComponent } from './offer-deployment/offer-deployment.component';
import { OnboardedCandidateComponent } from './onboarded-candidate/onboarded-candidate.component';
import { AbstractOrderCandidateListComponent } from '../abstract-order-candidate-list.component';

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
  public selectedOrder$: Observable<Order>;

  public templateState: Subject<any> = new Subject();
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  public candidate: OrderCandidatesList;

  get isShowDropdown(): boolean {
    return [ApplicantStatus.Rejected, ApplicantStatus.OnBoarded].includes(this.candidate.status) && !this.isAgency;
  }

  constructor(protected override store: Store, protected override router: Router) {
    super(store, router);
  }

  public onEdit(data: OrderCandidatesList, event: MouseEvent): void {
    this.candidate = { ...data };

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
          ApplicantStatus.PreOfferCustom,
        ];

        if (allowedApplyStatuses.includes(this.candidate.status)) {
          this.store.dispatch(
            new GetOrderApplicantsData(this.order.orderId, this.order.organizationId, this.candidate.candidateId)
          );
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
        const allowedOnboardedStatuses = [ApplicantStatus.Accepted, ApplicantStatus.OnBoarded];

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
          if (!this.isShowDropdown && !this.candidate.deployedCandidateInfo) {
            this.store.dispatch(new GetAvailableSteps(this.order.organizationId, this.candidate.candidateJobId));
          }
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
}
