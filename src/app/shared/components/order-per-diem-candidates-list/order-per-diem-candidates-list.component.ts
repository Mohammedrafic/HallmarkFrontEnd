import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { debounceTime, filter, merge, Observable, Subject, takeUntil } from 'rxjs';
import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
  AgencyOrder,
  CandidateListEvent,
  Order,
  OrderCandidateJob,
  OrderCandidatesList,
  OrderCandidatesListPage,
} from '@shared/models/order-management.model';
import { disabledBodyOverflow } from '@shared/utils/styles.utils';
import { OrderManagementState } from '@agency/store/order-management.state';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { UserState } from 'src/app/store/user.state';
import { GetOrganisationCandidateJob } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { GetCandidateJob, GetOrderApplicantsData } from '@agency/store/order-management.actions';

@Component({
  selector: 'app-order-per-diem-candidates-list',
  templateUrl: './order-per-diem-candidates-list.component.html',
  styleUrls: ['./order-per-diem-candidates-list.component.scss'],
})
export class OrderPerDiemCandidatesListComponent
  extends AbstractGridConfigurationComponent
  implements OnInit, OnDestroy
{
  @Select(OrderManagementContentState.candidatesJob)
  candidateJobOrganisationState$: Observable<OrderCandidateJob>;

  @Select(OrderManagementState.candidatesJob)
  candidateJobAgencyState$: Observable<OrderCandidateJob>;

  @ViewChild('orderCandidatesGrid') grid: GridComponent;

  @Input() candidatesList: OrderCandidatesListPage | null;
  @Input() order: AgencyOrder;

  @Output() getCandidatesList = new EventEmitter<CandidateListEvent>();

  @Select(OrderManagementState.selectedOrder)
  public selectedOrder$: Observable<Order>;

  public templateState: Subject<any> = new Subject();
  public includeDeployedCandidates: boolean = true;
  public candidate: OrderCandidatesList;
  public isAgency: boolean;
  public openDetails = new Subject<boolean>();
  public candidateJob: OrderCandidateJob | null;

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store, private router: Router) {
    super();
  }

  ngOnInit() {
    this.isAgency = this.router.url.includes('agency');
    this.subscribeOnPageChanges();
    this.dialogOpenEventHandler();
    this.subscribeOnChangeCandidateJob();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
      if (this.isAgency) {
        if ([ApplicantStatus.NotApplied].includes(this.candidate.status)) {
          this.candidateJob = null;
          this.store.dispatch(new GetOrderApplicantsData(this.order.orderId, this.order.organizationId, this.candidate.candidateId));
        } else {
          this.store.dispatch(new GetCandidateJob(this.order.organizationId, data.candidateJobId));
        }
      } else {
          this.store.dispatch(new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.candidateJobId));
      }
      this.openDetails.next(true);
    }
  }

  private subscribeOnChangeCandidateJob(): void {
    merge(this.candidateJobOrganisationState$, this.candidateJobAgencyState$)
      .pipe(
        filter((candidateJob) => !!candidateJob),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((candidateJob: OrderCandidateJob) => (this.candidateJob = candidateJob));
  }

  private dialogOpenEventHandler(): void {
    this.openDetails.pipe(takeUntil(this.unsubscribe$)).subscribe((isOpen: boolean) => {
      if (!isOpen) {
        this.removeActiveCssClass();
      }
    });
  }

  private subscribeOnPageChanges(): void {
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.getCandidatesList.emit({
        orderId: this.order.orderId,
        organizationId: this.order.organizationId,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        excludeDeployed: false,
      });
    });
  }
}
