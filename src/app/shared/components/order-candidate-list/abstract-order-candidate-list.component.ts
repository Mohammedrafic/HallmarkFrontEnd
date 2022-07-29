import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, debounceTime, filter, Observable, Subject, takeUntil, tap } from 'rxjs';
import { Store } from '@ngxs/store';

import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { AgencyOrder, CandidateListEvent, OrderCandidatesListPage } from '@shared/models/order-management.model';
import { disabledBodyOverflow } from '@shared/utils/styles.utils';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { UserState } from 'src/app/store/user.state';
import { AbstractGridConfigurationComponent } from '../abstract-grid-configuration/abstract-grid-configuration.component';

@Directive()
export abstract class AbstractOrderCandidateListComponent
  extends AbstractGridConfigurationComponent
  implements OnInit, OnDestroy
{
  @ViewChild('orderCandidatesGrid') grid: GridComponent;

  @Input() candidatesList: OrderCandidatesListPage | null;
  @Input() order: AgencyOrder;
  @Input() includeDeployedCandidates: boolean = true;

  @Output() getCandidatesList = new EventEmitter<CandidateListEvent>();

  public openDetails = new Subject<boolean>();
  public isAgency: boolean;
  public isOrganization: boolean;

  protected pageSubject = new Subject<number>();
  protected unsubscribe$: Subject<void> = new Subject();

  constructor(protected store: Store, protected router: Router) {
    super();
  }

  ngOnInit(): void {
    this.isAgency = this.router.url.includes('agency');
    this.isOrganization = this.router.url.includes('client');

    combineLatest([this.onPageChanges(), this.onCloseDetails()]).pipe(takeUntil(this.unsubscribe$)).subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onSwitcher(event: { checked: boolean }): void {
    this.includeDeployedCandidates = event.checked;
    this.emitGetCandidatesList();
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

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  protected onCloseDetails(): Observable<boolean> {
    return this.openDetails.pipe(
      filter((isOpen) => !isOpen),
      tap(() => this.removeActiveCssClass())
    );
  }

  protected emitGetCandidatesList(): void {
    this.getCandidatesList.emit({
      orderId: this.order.orderId,
      organizationId: this.order.organizationId,
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      excludeDeployed: !this.includeDeployedCandidates,
    });
  }

  protected onPageChanges(): Observable<unknown> {
    return this.pageSubject.pipe(
      debounceTime(1),
      tap((page) => {
        this.currentPage = page;
        this.emitGetCandidatesList();
      })
    );
  }
}

