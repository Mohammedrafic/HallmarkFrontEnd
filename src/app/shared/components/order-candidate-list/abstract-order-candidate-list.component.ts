import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, debounceTime, distinctUntilChanged, filter, Observable, Subject, takeUntil, tap } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
  AgencyOrder,
  CandidateListEvent,
  IrpOrderCandidate,
  OrderCandidateJob,
  OrderCandidatesListPage,
} from '@shared/models/order-management.model';
import { disabledBodyOverflow } from '@shared/utils/styles.utils';
import { AppState } from 'src/app/store/app.state';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { UserState } from 'src/app/store/user.state';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { OrderManagementState } from '@agency/store/order-management.state';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { PageOfCollections } from '@shared/models/page.model';
import { CandidateSearchPlaceholder, EmployeeSearchPlaceholder } from '@shared/constants/candidate-search-placeholder';
import { OrderManagementPagerState } from '@shared/models/candidate.model';

@Directive()
export abstract class AbstractOrderCandidateListComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('orderCandidatesGrid') grid: GridComponent;

  @Input() candidatesList: OrderCandidatesListPage | null;
  @Input() order: AgencyOrder;
  @Input() includeDeployedCandidates = true;
  @Input() irpCandidates: PageOfCollections<IrpOrderCandidate> | null;
  @Input() orderManagementPagerState: OrderManagementPagerState | null;

  @Output() getCandidatesList = new EventEmitter<CandidateListEvent>();

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobOrganisationState$: Observable<OrderCandidateJob>;

  @Select(OrderManagementState.candidatesJob)
  candidateJobAgencyState$: Observable<OrderCandidateJob>;

  @Select(AppState.isMobileScreen)
  private readonly isMobileScreen$: Observable<boolean>;

  public openDetails = new Subject<boolean>();
  public isAgency: boolean;
  public isOrganization: boolean;
  public candidateSearchPlaceholder = CandidateSearchPlaceholder;
  public employeeSearchPlaceholder = EmployeeSearchPlaceholder;
  public isAvailable = false;
  public isMobileScreen = false;

  private readonly searchByCandidateName$: Subject<string> = new Subject();
  private searchTermByCandidateName: string;
  protected pageSubject = new Subject<number>();
  protected unsubscribe$: Subject<void> = new Subject();
  
  constructor(
    protected override store: Store,
    protected router: Router,
    protected globalWindow : WindowProxy & typeof globalThis,
  ) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.isAgency = this.router.url.includes('agency');
    this.isOrganization = this.router.url.includes('client');

    combineLatest([this.onPageChanges(), this.onCloseDetails()]).pipe(takeUntil(this.unsubscribe$)).subscribe();
    this.searchCandidatesByName();
    this.listenScreenResolution();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onSwitcher(event: { checked: boolean }): void {
    this.includeDeployedCandidates = event.checked;
    this.isAvailable = event.checked;
    this.emitGetCandidatesList();
  }

  public onViewNavigation(data: any): void {
    if(data.candidateId!=undefined)
    {

    

    if(this.isMobileScreen){
      return;
    }
    const user = this.store.selectSnapshot(UserState.user);
    const isOrganizationAgencyArea = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
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
    const state = {
            orderId: this.order.orderId,
            candidateStatus: data.status,
            pageToBack,
            orderManagementPagerState: this.orderManagementPagerState,
            readonly: !this.isAgency,
            isRedirectFromOrder: true,
            isNavigatedFromOrganizationArea: isOrganizationAgencyArea.isOrganizationArea,
          };
    this.globalWindow.localStorage.setItem('navigationState', JSON.stringify(state));
    this.router.navigate([url, data.candidateId], {
      state: state,
    });
    disabledBodyOverflow(false);
  }
  else {

    
   
    if(this.isMobileScreen){
      return;
    }
    const user = this.store.selectSnapshot(UserState.user);
    const isOrganizationAgencyArea = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const url =
      user?.businessUnitType === BusinessUnitType.Organization ? 'client/candidates/edit' : 'client/candidates/edit';
        if (user?.businessUnitType === BusinessUnitType.Hallmark) {
          this.store.dispatch(
            new SetLastSelectedOrganizationAgencyId({
              lastSelectedAgencyId: data.agencyId,
              lastSelectedOrganizationId: null,
            })
          );
        }
    const pageToBack = this.router.url;
    const state = {
            orderId: this.order.orderId,
            candidateStatus: data.status,
            pageToBack,
            orderManagementPagerState: this.orderManagementPagerState,
            readonly: !this.isAgency,
            isRedirectFromOrder: true,
            isNavigatedFromOrganizationArea: isOrganizationAgencyArea.isOrganizationArea,
          };
    this.globalWindow.localStorage.setItem('navigationState', JSON.stringify(state));
    this.router.navigate([url, data.candidateProfileId], {
      state: state,
    });
    disabledBodyOverflow(false);
  }
  }

  public gridPerPageChanged(perPage: number): void {
    this.pageSize = perPage;
    this.pageSubject.next(1);
  }

  public gridPageChanged(page: number): void {
    this.pageSubject.next(page);
  }

  public searchByCandidateName(event: KeyboardEvent): void {
    const queryString = (event.target as HTMLInputElement).value;
    this.searchByCandidateName$.next(queryString.toLowerCase());
  }

  public clearInputField(): void {
    this.searchByCandidateName$.next('');
  }

  private listenScreenResolution(): void {
    this.isMobileScreen$.pipe(takeUntil(this.unsubscribe$)).subscribe((isMobile) => {
      this.candidateSearchPlaceholder = isMobile ? '' : CandidateSearchPlaceholder;
      this.employeeSearchPlaceholder = isMobile ? "" : EmployeeSearchPlaceholder;
      this.isMobileScreen = isMobile;
    });
  }

  private searchCandidateByName(value: string): void {
    this.getCandidatesList.emit({
      orderId: this.order.orderId,
      organizationId: this.order.organizationId,
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      excludeDeployed: !this.includeDeployedCandidates,
      isAvailable: this.isAvailable,
      searchTerm: value,
    });
  }

  private searchCandidatesByName(): void {
    this.searchByCandidateName$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.unsubscribe$))
      .subscribe((queryString) => {
        this.searchTermByCandidateName = queryString;
        this.searchCandidateByName(queryString);
      });
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
      isAvailable: this.isAvailable,
      searchTerm: this.searchTermByCandidateName,
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
