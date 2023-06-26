import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrganizationDepartment, OrganizationLocation, OrganizationStructure,OrganizationRegion } from '@shared/models/organization.model';
import { getIRPOrgItems } from '@core/helpers/org-structure.helper';
import { DepartmentHelper } from '@client/candidates/departments/helpers/department.helper';
import { sortByField } from '@shared/helpers/sort-by-field.helper';


import { Select, Store } from '@ngxs/store';
import {
  combineLatest,
  filter,
  Observable,
  takeUntil,
  Subject,
  tap,
  switchMap,
  debounceTime,
  skip } from 'rxjs';

import { SetHeaderState, ShowExportDialog, ShowFilterDialog } from '../../../store/app.actions';
import {
  ExportCandidateAssignment,
  GetCandidateDetailsPage,
  GetCandidateRegions,
  GetCandidateSkills,
} from '@shared/components/candidate-details/store/candidate.actions';
import { CandidateDetailsState } from '@shared/components/candidate-details/store/candidate.state';
import { FilterService } from '@shared/services/filter.service';
import { FilteredItem } from '@shared/models/filter.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import {
  CandidateDetailsPage,
  CandidatesDetailsRegions,
  CandidatesDetailsDepartments,
  CandidatesDetailsLocations,
  FilterColumnsModel,
  FiltersModal,
  NavigationTabModel,
} from '@shared/components/candidate-details/models/candidate.model';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { UserState } from '../../../store/user.state';
import { ApplicantStatusOptionsForCandidates, OrderTypeOptionsForCandidates } from '@shared/components/candidate-details/candidate-details.constant';
import { toCorrectTimezoneFormat } from '../../utils/date-time.utils';
import { GRID_CONFIG } from '@shared/constants';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import * as PreservedFilters from 'src/app/store/preserved-filters.actions';
import { CandidateDetailsService } from './services/candidate-details.service';
import { PreservedFiltersByPage } from '@core/interface';
import { FilterPageName } from '@core/enums';
import { GetMasterRegions } from '@organization-management/store/organization-management.actions';
import { FiltersComponent } from './filters/filters.component';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { GetAssociateAgencies } from '@client/store/order-managment-content.actions';
import { CandidateDetailsFilterTab } from '@shared/enums/candidate-assignment.enum';
import { ExportColumn ,ExportOptions} from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { GridApi, RowNode } from '@ag-grid-community/core';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';

@Component({
  selector: 'app-candidate-details',
  templateUrl: './candidate-details.component.html',
  styleUrls: ['./candidate-details.component.scss'],
})
export class CandidateDetailsComponent extends AbstractPermissionGrid implements OnInit {
  @Select(CandidateDetailsState.navigationTab)
  private candidateTab$: Observable<NavigationTabModel>;

  @Select(CandidateDetailsState.pageNumber)
  private pageNumber$: Observable<number>;

  @Select(CandidateDetailsState.pageSize)
  private pageSize$: Observable<number>;

  @Select(CandidateDetailsState.candidateSkills)
  public candidateSkills$: Observable<MasterSkillByOrganization[]>;

  @Select(CandidateDetailsState.candidateDetails)
  public candidates$: Observable<CandidateDetailsPage>;

  @Select(CandidateDetailsState.candidateRegions)
  public candidateRegions$: Observable<CandidatesDetailsRegions[]>;

  @Select(CandidateDetailsState.candidateLocations)
  public candidateLocations$: Observable<CandidatesDetailsLocations[]>;

  @Select(CandidateDetailsState.candidateDepartments)
  public candidateDepartments$: Observable<CandidatesDetailsDepartments[]>;

  @Select(UserState.lastSelectedAgencyId)
  lastSelectedAgencyId$: Observable<number>;

  @Select(UserState.lastSelectedOrganizationId)
  lastSelectedOrganizationId$: Observable<number>;

  @Select(PreservedFiltersState.preservedFiltersByPageName)
  private readonly preservedFiltersByPageName$: Observable<PreservedFiltersByPage<FiltersModal>>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrderManagementContentState.associateAgencies)
  public associateAgencies$: Observable<AssociateAgency[]>;

  @Select(CandidateDetailsState.candidateRegions)
  regions$: Observable<string[]>;
  @ViewChild(FiltersComponent, { static: false }) filterco: FiltersComponent;
  public selectedRowDatas: any[] = [];
  @Input() export$: Subject<ExportedFileType>;
  @ViewChild('grid')
  public grid: GridComponent;
  public filtersForm: FormGroup;
  public filters: FiltersModal | null;
  public filterColumns: FilterColumnsModel;
  public override filteredItems: FilteredItem[] = [];
  public orderTypes = OrderTypeOptionsForCandidates;
  public applicantStatuses = ApplicantStatusOptionsForCandidates;
  public candidatesPage: CandidateDetailsPage;
  public exportCandidate$ = new Subject<ExportedFileType>();
  public activeTab: CandidateDetailsFilterTab = CandidateDetailsFilterTab.All;
  public fileName: string;
  public defaultFileName: string;
  public activeTabname: CandidateDetailsFilterTab;
  private gridApi: GridApi;
  private cd$ = new Subject();
  public columnsToExport: ExportColumn[];
  public pageNumber = GRID_CONFIG.initialPage;
  public override pageSize = GRID_CONFIG.initialRowsPerPage;
  public CandidateStatus: number;
  public isAgency = false;
  public isOrganization = false;
  public allLocations: OrganizationLocation[];
  private selectedTab: number | null;
  private unsubscribe$: Subject<void> = new Subject();
  allRegions: OrganizationRegion[] = [];
  regionBasedLocations: OrganizationLocation[] = [];
  private orgStructure: OrganizationStructure;
  private orgRegions: OrganizationRegion[] = [];
  protected readonly destroy$: Subject<void> = new Subject();
  public isClear: boolean = false;
  constructor(
    store: Store,
    private router: Router,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private datePipe: DatePipe,
    private candidateService: CandidateDetailsService
  ) {
    super(store);
    const routerState = this.router.getCurrentNavigation()?.extras?.state;
    this.CandidateStatus = routerState?.['orderStatus'];
    this.isAgency = this.router.url.includes('agency');
    this.isOrganization = this.router.url.includes('client');
  }

  override ngOnInit(): void {
    const user = this.store.selectSnapshot(UserState.user);
    let lastSelectedOrganizationId = window.localStorage.getItem('lastSelectedOrganizationId');
    let orgid = user?.businessUnitId || parseInt(lastSelectedOrganizationId || '0');
    this.store.dispatch([new GetAssociateAgencies(orgid)]);
    this.store.dispatch([new GetCandidateRegions(), new GetCandidateSkills()]);
    this.setHeaderName();
    this.createFilterForm();
    this.initFilterColumns();
    this.setOrderTypes();
    this.setApplicantStatuses();
    this.store.dispatch(new GetMasterRegions());
    this.getRegions();
    this.watchForStructure();
    this.subscribeOnLocationChange();
    this.watchForRegionControl();

    combineLatest([
      this.subscribeOnPageNumberChange(),
      this.subscribeOnPageSizeChange(),
      this.subscribeOnTabChange(),
      this.subscribeOnSkills(),
      this.subscribeOnCandidatePage(),
      this.subscribeOnAgency(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.subscribeOnAgencyOrganizationChanges();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(new PreservedFilters.ResetPageFilters());
  }

  public onFilterClearAll(): void {
    this.isClear = true;
    this.filterColumns.locationIds.dataSource = [];
    this.filterColumns.departmentIds.dataSource = [];
    this.clearFilters();
    this.patchFormValue();
    this.store.dispatch(new ShowFilterDialog(true));
    this.store.dispatch(new PreservedFilters.ClearPageFilters(this.getPageName()));
    this.updatePage();
  }

  public onFilterApply(): void {
    if (this.filtersForm.dirty) {
      const formData = this.filtersForm.getRawValue();
      const { startDate, endDate } = formData;
      this.filters = {
        ...formData,
        startDate: toCorrectTimezoneFormat(startDate),
        endDate: toCorrectTimezoneFormat(endDate),
      };

      this.filteredItems = this.filterService.generateChips(this.filtersForm, this.filterColumns, this.datePipe);
      this.updatePage();
      this.store.dispatch(new ShowFilterDialog(false));
      const orgs: number[] = [];
      if (this.filters?.regionsIds) {
        this.filterColumns.regionsIds.dataSource?.forEach((val) => {
          if (this.filters?.regionsIds?.includes(val.id)) {
            orgs.push(val.organizationId);
          }
        });
        this.filters.organizationIds = orgs.filter((item, pos) => orgs.indexOf(item) == pos);
      }

      this.store.dispatch(new PreservedFilters.SaveFiltersByPageName(this.getPageName(), this.filters));
      this.filtersForm.markAsPristine();
    } else {
      this.store.dispatch(new ShowFilterDialog(false));
    }
  }

  public onFilterDelete(event: FilteredItem): void {
    if (event.column == 'regionsIds') {
      this.filterColumns.departmentIds.dataSource = this.filterColumns.departmentIds.dataSource?.filter(
        (f) => f.regionId !== event.regionId
      );
      this.filterColumns.locationIds.dataSource = this.filterColumns.locationIds.dataSource?.filter(
        (f) => f.regionId !== event.regionId
      );
      this.filterco.locationDropdown.refresh();
      this.filterco.departmentDropdown.refresh();
    }
    if (event.column == 'locationIds') {
      this.filterColumns.locationIds.dataSource = this.filterColumns.locationIds.dataSource?.filter(
        (f) => f.locationIds !== event.locationId
      );
      this.filterColumns.departmentIds.dataSource = this.filterColumns.departmentIds.dataSource?.filter(
        (f) => f.locationIds !== event.locationId
      );
    }
    if (event.column == 'departmentIds') {
      this.filterColumns.departmentIds.dataSource = this.filterColumns.departmentIds.dataSource?.filter(
        (f) => f.departmentIds !== event.value
      );
    }
    this.filterService.removeValue(event, this.filtersForm, this.filterColumns); 
    this.filtersForm.markAsDirty();
    this.filterco.regionDropdown.refresh();
       if(!this.filtersForm.value.regionsIds.length)
       {
         this.filterco.regionDropdown.selectAll(false)
       }
  }

  public onFilterClose(): void {
    this.patchFormValue();
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  private setHeaderName(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Candidate Assignment', iconName: 'user' }));
  }

  private subscribeOnPageNumberChange(): Observable<number> {
    return this.pageNumber$.pipe(
      filter((currentPage: number) => !!currentPage),
      tap((currentPage: number) => {
        this.pageNumber = currentPage;
        this.setActiveTab();
        this.updatePage();
      })
    );
  }

  private subscribeOnPageSizeChange(): Observable<number> {
    return this.pageSize$.pipe(
      skip(1),
      filter((currentSize: number) => !!currentSize),
      tap((currentSize: number) => {
        this.pageSize = currentSize;
        this.setActiveTab();
        this.updatePage();
      })
    );
  }

  private subscribeOnTabChange(): Observable<NavigationTabModel> {
    return this.candidateTab$.pipe(
      skip(1),
      filter(({ active }: NavigationTabModel) => active === 0 || !!active),
      tap((selectedTab: NavigationTabModel) => {
        this.selectedTab = selectedTab.active;
        !this.isNavigationFromAnotherPage() && this.updatePage();
      })
    );
  }

  private subscribeOnLocaions(): Observable<CandidatesDetailsLocations[]> {
    return this.candidateLocations$.pipe(
      tap((locations: CandidatesDetailsLocations[]) => {
        this.filterColumns.locationIds.dataSource = locations || [];
      })
    );
  }

  private subscribeOnDepartments(): Observable<CandidatesDetailsDepartments[]> {
    return this.candidateDepartments$.pipe(
      tap((departments: CandidatesDetailsDepartments[]) => {
        this.filterColumns.locationIds.dataSource = departments || [];
      })
    );
  }

  private subscribeOnSkills(): Observable<MasterSkillByOrganization[]> {
    return this.candidateSkills$.pipe(
      tap((skills: MasterSkillByOrganization[]) => {
        this.filterColumns.skillsIds.dataSource = this.candidateService.assignSkillDataSource(skills);
      })
    );
  }

  private subscribeOnCandidatePage(): Observable<CandidateDetailsPage> {
    return this.candidates$.pipe(
      tap((page: CandidateDetailsPage) => {
        this.candidatesPage = page;
      })
    );
  }

  public override customExport(): void {
    this.fileName = 'Candidate Assignment' + this.generateDateTime(this.datePipe);
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType): void {
    this.exportCandidate$.next(fileType);
  }

  public tabSelected(tabIndex: CandidateDetailsFilterTab): void {
    this.activeTab = tabIndex;
    switch (tabIndex) {
      case CandidateDetailsFilterTab.All:
        this.activeTab = CandidateDetailsFilterTab.All;
        break;
      case CandidateDetailsFilterTab.Confirmed:
        this.activeTab = CandidateDetailsFilterTab.Confirmed;
        break;
      case CandidateDetailsFilterTab.Active:
        this.activeTab = CandidateDetailsFilterTab.Active;
        break;
      case CandidateDetailsFilterTab.Past:
        this.activeTab = CandidateDetailsFilterTab.Past;
        break;
    }
  }

  private subscribeOnAgency(): Observable<AssociateAgency[]> {
    return this.associateAgencies$.pipe(
      tap((page: AssociateAgency[]) => {
        this.filterColumns.agencyIds.dataSource = page;
      })
    );
  }

  private createFilterForm(): void {
    this.filtersForm = this.formBuilder.group({
      orderTypes: [null],
      startDate: [null],
      endDate: [null],
      skillsIds: [null],
      regionsIds: [null],
      locationIds: [null],
      departmentIds: [null],
      applicantStatuses: [null],
      candidateNames: [null],
      agencyIds: [null],
      orderID: [null],
    });
  }

  private initFilterColumns(): void {
    this.filterColumns = {
      regionsIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      candidateNames: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      agencyIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'agencyName',
        valueId: 'agencyId',
      },
      applicantStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      locationIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      orderTypes: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      skillsIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'skillDescription',
        valueId: 'masterSkillId',
      },

      departmentIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
    };
  }

  private setOrderTypes(): void {
    this.filterColumns.orderTypes.dataSource = this.orderTypes;
  }

  private setApplicantStatuses(): void {
    this.filterColumns.applicantStatuses.dataSource = this.applicantStatuses;
  }

  private clearFilters(): void {
    this.pageNumber = GRID_CONFIG.initialPage;
    this.pageSize = GRID_CONFIG.initialRowsPerPage;
    this.filtersForm.reset();
    this.isClear = true;
    this.filteredItems = [];
    this.filters = null;
    this.filteredItems = this.filterService.generateChips(this.filtersForm, this.filterColumns, this.datePipe);
  }

  private isNavigationFromAnotherPage(): boolean | null {
    return this.store.selectSnapshot(CandidateDetailsState.isNavigate);
  }

  private setActiveTab(): void {
    const tabs = this.store.selectSnapshot(CandidateDetailsState.navigationTab);
    if (!this.selectedTab) {
      this.selectedTab = tabs.pending;
    }
  }

  private subscribeOnAgencyOrganizationChanges(): void {
    combineLatest([
      this.lastSelectedOrganizationId$,
      this.lastSelectedAgencyId$,
      this.candidateRegions$,
      this.candidateDepartments$,
      this.candidateLocations$,
    ])
      .pipe(
        filter((data) => !!data[2]),
        debounceTime(600),
        tap(() => {
          this.store.dispatch(new PreservedFilters.GetPreservedFiltersByPage(this.getPageName()));
        }),
        switchMap(() => this.preservedFiltersByPageName$),
        debounceTime(100),
        tap((filters) => {
          this.handleFilterState(filters);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updatePage();
      });
  }

  override updatePage(): void {
    this.store.dispatch(
      new GetCandidateDetailsPage({
        pageNumber: this.pageNumber ?? GRID_CONFIG.initialPage,
        pageSize: this.pageSize ?? GRID_CONFIG.initialRowsPerPage,
        tab: this.selectedTab,
        ...this.filters,
      })
    );
  }

  private patchFormValue(): void {
    this.filtersForm.setValue({
      orderTypes: this.filters?.orderTypes || [],
      startDate: this.filters?.startDate || null,
      endDate: this.filters?.endDate || null,
      skillsIds: this.filters?.skillsIds || [],
      regionsIds: this.filters?.regionsIds || [],
      applicantStatuses: this.filters?.applicantStatuses || [],
      locationIds: this.filters?.locationIds || [],
      departmentIds: this.filters?.departmentIds || [],
      candidateNames: this.filters?.candidateNames || null,
      agencyIds: this.filters?.agencyIds || [],
      orderID: this.filters?.orderID || null,
    });
    this.filteredItems = this.filterService.generateChips(this.filtersForm, this.filterColumns);
  }

  private handleFilterState(filters: PreservedFiltersByPage<FiltersModal>): void {
    let dispatchPatch = false;
    const { isNotPreserved, state, dispatch } = filters;
    if (!isNotPreserved && dispatch) {
      this.filters = {
        orderTypes: state?.orderTypes || [],
        startDate: state?.startDate,
        endDate: state?.endDate,
        skillsIds: (state?.skillsIds && [...state.skillsIds]) || [],
        regionsIds: (state?.regionsIds && [...state.regionsIds]) || [],
        applicantStatuses: state?.applicantStatuses || [],
        locationIds: (state?.locationIds && [...state.locationIds]) || [],
        departmentIds: (state?.departmentIds && [...state.departmentIds]) || [],
      };

      dispatchPatch = true;
    }

    if (this.CandidateStatus) {
      this.filters = {
        ...this.filters,
        applicantStatuses: [this.CandidateStatus],
      };
      dispatchPatch = true;
    }

    if (dispatchPatch) {
      this.patchFormValue();
    }
  }

  private getPageName(): FilterPageName {
    if (this.isAgency) {
      return FilterPageName.CandidateAssignmentVMSAgency;
    } else {
      return FilterPageName.CandidateAssignmentVMSOrganization;
    }
  }

  private subscribeOnOrgStructure(): void {
    this.organizationStructure$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.allLocations = [];
        structure.regions.forEach((region) => {
          region.locations && this.allLocations.push(...getIRPOrgItems(region.locations));
        });
        if (this.filterColumns.locationIds) {
          this.filterColumns.locationIds.dataSource = this.allLocations;
        }
      });
  }

  private subscribeOnLocationChange(): void {
    this.filtersForm
      .get('locationIds')
      ?.valueChanges.pipe(filter(Boolean), takeUntil(this.unsubscribe$))
      .subscribe((val: number[]) => {
        if (this.filterColumns.departmentIds) {
          this.filterColumns.departmentIds.dataSource = [];
          if (val?.length) {
            const locationDataSource = this.filterColumns.locationIds?.dataSource as OrganizationLocation[];
            const selectedLocations: OrganizationLocation[] = DepartmentHelper.findSelectedItems(
              val,
              locationDataSource
            ) as OrganizationLocation[];
            const locationDepartments: OrganizationDepartment[] = selectedLocations.flatMap(
              (location) => location.departments
            );

            this.filterColumns.departmentIds.dataSource = getIRPOrgItems(locationDepartments);
            if (selectedLocations.length == locationDataSource.length) {
              this.filtersForm.controls['departmentIds'].setValue(
                this.filterColumns.departmentIds.dataSource.map((m) => m.id)
              );
            }
          } else {
            this.filtersForm.get('departmentIds')?.setValue([]);
          }
        }
      });
  }

  private getRegions(): void {
    this.getLastSelectedBusinessUnitId()
      .pipe(
        filter(Boolean),
        switchMap(() => this.store.dispatch(new GetCandidateRegions())),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  private getLastSelectedBusinessUnitId(): Observable<number> {
    const businessUnitId$ = this.isAgency ? this.lastSelectedAgencyId$ : this.lastSelectedOrganizationId$;
    return businessUnitId$;
  }

  private watchForRegionControl(): void {
    this.filtersForm
      .get('regionsIds')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((val: number[]) => {
        if (val?.length) {
          const selectedRegions: OrganizationRegion[] = [];
          const locations: OrganizationLocation[] = [];
          val.forEach((id) =>
            selectedRegions.push(this.allRegions.find((region) => region.id === id) as OrganizationRegion)
          );
          this.filterColumns.locationIds.dataSource = [];
          selectedRegions.forEach((region) => {
            locations.push(...(region.locations as []));
          });
          this.filterColumns.locationIds.dataSource = sortByField(locations, 'name');
          if (selectedRegions.length == this.allRegions.length) {
            this.filtersForm.controls['locationIds'].setValue(
              this.filterColumns.locationIds.dataSource.map((m) => m.id)
            );
          }
        } else {
          this.filterColumns.locationIds.dataSource = [];
          this.filtersForm.get('locationIds')?.setValue([]);
          this.filteredItems = this.filterService.generateChips(this.filtersForm, this.filterColumns);
        }
      });
  }

  private watchForStructure(): void {
    this.organizationStructure$
      .pipe(filter(Boolean), takeUntil(this.unsubscribe$))
      .subscribe((structure: OrganizationStructure) => {
        this.orgStructure = structure;
        this.orgRegions = structure.regions;
        this.allRegions = [...this.orgRegions];
        this.filterColumns.regionsIds.dataSource = this.allRegions;    
      });
  }
}
