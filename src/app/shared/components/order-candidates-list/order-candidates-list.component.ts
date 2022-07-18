import { GetCandidateJob, GetOrderApplicantsData } from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GetAvailableSteps, GetOrganisationCandidateJob } from '@client/store/order-managment-content.actions';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
  AgencyOrder,
  Order,
  OrderCandidatesList,
  OrderCandidatesListPage,
} from '@shared/models/order-management.model';
import { disabledBodyOverflow } from '@shared/utils/styles.utils';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { debounceTime, Observable, Subject } from 'rxjs';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { UserState } from 'src/app/store/user.state';
import { AcceptCandidateComponent } from './accept-candidate/accept-candidate.component';
import { ApplyCandidateComponent } from './apply-candidate/apply-candidate.component';
import { OfferDeploymentComponent } from './offer-deployment/offer-deployment.component';
import { OnboardedCandidateComponent } from './onboarded-candidate/onboarded-candidate.component';

export type CandidateListEvent = {
  orderId: number;
  organizationId: number;
  currentPage: number;
  pageSize: number;
  excludeDeployed: boolean;
};

@Component({
  selector: 'app-order-candidates-list',
  templateUrl: './order-candidates-list.component.html',
  styleUrls: ['./order-candidates-list.component.scss'],
})
export class OrderCandidatesListComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('orderCandidatesGrid') grid: GridComponent;
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('accept') accept: AcceptCandidateComponent;
  @ViewChild('apply') apply: ApplyCandidateComponent;
  @ViewChild('onboarded') onboarded: OnboardedCandidateComponent;
  @ViewChild('offerDeployment') offerDeployment: OfferDeploymentComponent;

  @Input() candidatesList: OrderCandidatesListPage | null;
  @Input() order: AgencyOrder;

  @Output() getCandidatesList = new EventEmitter<CandidateListEvent>();

  @Select(OrderManagementState.selectedOrder)
  public selectedOrder$: Observable<Order>;

  public templateState: Subject<any> = new Subject();
  public includeDeployedCandidates: boolean = true;
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  public candidate: OrderCandidatesList;
  public isAgency: boolean;

  private pageSubject = new Subject<number>();

  constructor(private store: Store, private router: Router) {
    super();
  }

  ngOnInit() {
    this.isAgency = this.router.url.includes('agency');

    this.subscribeOnPageChanges();
  }

  public onSwitcher(): void {
    this.includeDeployedCandidates = !this.includeDeployedCandidates;

    this.getCandidatesList.emit({
      orderId: this.order.orderId,
      organizationId: this.order.organizationId,
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      excludeDeployed: !this.includeDeployedCandidates,
    });
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public onViewNavigation(data: any): void {
    const user = this.store.selectSnapshot(UserState.user);
    const url =
      user?.businessUnitType === BusinessUnitType.Organization ? '/agency/candidates' : '/agency/candidates/edit';
    if (user?.businessUnitType === BusinessUnitType.Hallmark) {
      this.store.dispatch(
        new SetLastSelectedOrganizationAgencyId({
          lastSelectedAgencyId: data.agencyId,
          lastSelectedOrganizationId: null,
        })
      );
    }
    const pageToBack = this.router.url;
    this.router.navigate([url, data.candidateId], { state: { orderId: this.order.orderId, pageToBack } });
    disabledBodyOverflow(false);
  }

  public onEdit(data: OrderCandidatesList, event: MouseEvent): void {
    this.candidate = { ...data };
    this.addActiveCssClass(event);

    if (this.order && this.candidate) {
      // TODO: find better approach
      const isOrganization = this.router.url.includes('client');

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
      } else if (isOrganization) {
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
          this.store.dispatch(new GetAvailableSteps(this.order.organizationId, this.candidate.candidateJobId));
          this.openDialog(this.offerDeployment);
        } else if (allowedOnboardedStatuses.includes(this.candidate.status)) {
          this.store.dispatch(
            new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.candidateJobId)
          );
          this.openDialog(this.onboarded);
        }
      }
    }
  }

  public onCloseDialog(): void {
    this.sideDialog.hide();
    this.removeActiveCssClass();
  }

  private subscribeOnPageChanges(): void {
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.getCandidatesList.emit({
        orderId: this.order.orderId,
        organizationId: this.order.organizationId,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        excludeDeployed: this.includeDeployedCandidates,
      });
    });
  }

  private openDialog(template: any): void {
    this.templateState.next(template);
    this.sideDialog.show();
  }
}
