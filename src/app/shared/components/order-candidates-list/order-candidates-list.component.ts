import { OrderManagementState } from "@agency/store/order-management.state";
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DialogNextPreviousOption } from "@shared/components/dialog-next-previous/dialog-next-previous.component";
import { Router } from '@angular/router';
import { ApplicantStatus } from "@shared/enums/applicant-status.enum";
import { GridComponent } from "@syncfusion/ej2-angular-grids";
import { AbstractGridConfigurationComponent } from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { Select, Store } from "@ngxs/store";
import { AgencyOrder, Order, OrderCandidatesList, OrderCandidatesListPage } from "@shared/models/order-management.model";
import { GetAgencyOrderCandidatesList, GetCandidateJob, GetOrderApplicantsData } from "@agency/store/order-management.actions";
import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { debounceTime, Observable, Subject } from "rxjs";
import { UserState } from 'src/app/store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { disabledBodyOverflow } from '@shared/utils/styles.utils';
import { GetAvailableSteps, GetOrganisationCandidateJob } from "@client/store/order-managment-content.actions";
import { OnboardedCandidateComponent } from "./onboarded-candidate/onboarded-candidate.component";
import { AcceptCandidateComponent } from "./accept-candidate/accept-candidate.component";
import { ApplyCandidateComponent } from "./apply-candidate/apply-candidate.component";
import { OfferDeploymentComponent } from "./offer-deployment/offer-deployment.component";
import { SetLastSelectedOrganizationAgencyId } from "src/app/store/user.actions";

@Component({
  selector: 'app-order-candidates-list',
  templateUrl: './order-candidates-list.component.html',
  styleUrls: ['./order-candidates-list.component.scss']
})
export class OrderCandidatesListComponent extends AbstractGridConfigurationComponent implements OnInit{
  @ViewChild('orderCandidatesGrid') grid: GridComponent;
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('accept') accept: AcceptCandidateComponent;
  @ViewChild('apply') apply: ApplyCandidateComponent;
  @ViewChild('onboarded') onboarded: OnboardedCandidateComponent;
  @ViewChild('offerDeployment') offerDeployment: OfferDeploymentComponent;

  @Input() candidatesList: OrderCandidatesListPage;
  @Input() order: AgencyOrder;

  @Select(OrderManagementState.selectedOrder)
  public selectedOrder$: Observable<Order>;
  public templateState: Subject<any> = new Subject();

  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  public candidate: OrderCandidatesList;

  private pageSubject = new Subject<number>();

  constructor(private store: Store, private router: Router) {
    super();
  }

  ngOnInit() {
    this.subscribeOnPageChanges();
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
    const url = user?.businessUnitType === BusinessUnitType.Organization ? '/agency/candidates' : '/agency/candidates/edit';
    if (user?.businessUnitType === BusinessUnitType.Hallmark) {
      this.store.dispatch(new SetLastSelectedOrganizationAgencyId({ lastSelectedAgencyId: data.agencyId, lastSelectedOrganizationId: null }))
    }
    const pageToBack = this.router.url;
    this.router.navigate([url, data.candidateId], { state: { orderId: this.order.orderId, pageToBack }});
    disabledBodyOverflow(false);
  }

  public onEdit(data: OrderCandidatesList): void {
    this.candidate = data;

    if (this.order && this.candidate) {
      // TODO: find better approach
      const isAgency = this.router.url.includes('agency');
      const isOrganization = this.router.url.includes('client');

      if (isAgency) {
        if (this.candidate.status === ApplicantStatus.NotApplied) {
          this.store.dispatch(new GetOrderApplicantsData(this.order.orderId, this.order.organizationId, this.candidate.candidateId));
          this.openDialog(this.apply);
        } else if (
          this.candidate.status === ApplicantStatus.Offered
          || this.candidate.status === ApplicantStatus.Accepted
          || this.candidate.status === ApplicantStatus.Rejected
        ) {
          this.store.dispatch(new GetCandidateJob(this.order.organizationId, data.candidateJobId));
          this.openDialog(this.accept);
        }
      } else if (isOrganization) {
        if (
          this.candidate.status === ApplicantStatus.Applied
          || this.candidate.status === ApplicantStatus.Shortlisted
          || this.candidate.status === ApplicantStatus.PreOfferCustom
        ) {
          this.store.dispatch(new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.candidateJobId));
          this.store.dispatch(new GetAvailableSteps(this.order.organizationId, this.candidate.candidateJobId));
          this.openDialog(this.offerDeployment);
        } else if (this.candidate.status === ApplicantStatus.Accepted) {
          this.store.dispatch(new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.candidateJobId));
          this.openDialog(this.onboarded);
        }
      }
    }
  }

  public onCloseDialog(): void {
    this.sideDialog.hide();
  }

  public getBillRate(rate: number, candidateRate: number):string {
    return candidateRate ? `$${rate} - ${candidateRate}` : `$${rate} - ${rate}`;
  }

  private subscribeOnPageChanges(): void {
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetAgencyOrderCandidatesList(this.order.orderId, this.order.organizationId, this.currentPage, this.pageSize));
    });
  }

  private openDialog(template: any): void {
    this.templateState.next(template);
    this.sideDialog.show();
  }
}
