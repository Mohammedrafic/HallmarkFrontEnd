import { Component, OnInit, ViewChild } from '@angular/core';
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

import { SetHeaderState, ShowFilterDialog } from '../../../store/app.actions';
import {
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
import { adaptToNameEntity } from '@shared/helpers/dropdown-options.helper';
import { FiltersComponent } from './filters/filters.component';

@Component({
  selector: 'app-candidate-details',
  templateUrl: './candidate-details.component.html',
  styleUrls: ['./candidate-details.component.scss'],
})
export class CandidateDetailsComponent extends DestroyableDirective implements OnInit {
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

  @Select(CandidateDetailsState.candidateRegions)
  regions$: Observable<string[]>;
  @ViewChild(FiltersComponent, { static: false }) filterco: FiltersComponent;

  public filtersForm: FormGroup;
  public filters: FiltersModal | null;
  public filterColumns: FilterColumnsModel;
  public filteredItems: FilteredItem[] = [];
  public orderTypes = OrderTypeOptionsForCandidates;
  public applicantStatuses = ApplicantStatusOptionsForCandidates;
  public candidatesPage: CandidateDetailsPage;

  public pageNumber = GRID_CONFIG.initialPage;
  public pageSize = GRID_CONFIG.initialRowsPerPage;
  public CandidateStatus: number;
  public isAgency = false;
  public allLocations: OrganizationLocation[];
  private selectedTab: number | null;
  private unsubscribe$: Subject<void> = new Subject();
  allRegions: OrganizationRegion[] = [];
  regionBasedLocations: OrganizationLocation[] = [];
  private orgStructure: OrganizationStructure;
  private orgRegions: OrganizationRegion[] = [];
  public isClear:boolean=false;
  constructor(
    private store: Store,
    private router: Router,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private datePipe: DatePipe,
    private candidateService: CandidateDetailsService,
  ) {
    super();
    const routerState = this.router.getCurrentNavigation()?.extras?.state;
    this.CandidateStatus = routerState?.['orderStatus'];
    this.isAgency = this.router.url.includes('agency');
  }

  ngOnInit(): void {
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
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.subscribeOnAgencyOrganizationChanges();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(new PreservedFilters.ResetPageFilters());
  }

  public onFilterClearAll(): void {
    this.filterColumns.locationIds.dataSource=[];
    this.filterColumns.departmentIds.dataSource=[];
    this.clearFilters
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
    if(event.column =="regionsIds"){
      this.filterColumns.departmentIds.dataSource = this.filterColumns.departmentIds.dataSource?.filter(f=>f.regionId!==event.regionId);
      this.filterColumns.locationIds.dataSource = this.filterColumns.locationIds.dataSource?.filter(f=>f.regionId!==event.regionId);
    }
    this.filterService.removeValue(event, this.filtersForm, this.filterColumns);
    this.filtersForm.markAsDirty();    
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

  private createFilterForm(): void {
    this.filtersForm = this.formBuilder.group({
      orderTypes: [null],
      startDate: [null],
      endDate: [null],
      skillsIds: [null],
      regionsIds: [null],
      locationIds: [null],
      departmentIds: [null],
      applicantStatuses:[null],
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
    this.isClear=true;
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
    combineLatest([this.lastSelectedOrganizationId$, this.lastSelectedAgencyId$, this.candidateRegions$, this.candidateDepartments$,this.candidateLocations$])
      .pipe(
        filter((data) => !!data[2]),
        debounceTime(600),
        tap(() => { this.store.dispatch(new PreservedFilters.GetPreservedFiltersByPage(this.getPageName())); }),
        switchMap(() => this.preservedFiltersByPageName$),
        debounceTime(100),
        tap((filters) => { this.handleFilterState(filters); }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updatePage();
      });
  }

  private updatePage(): void {
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
        structure.regions.forEach(region => {
          region.locations && this.allLocations.push(...getIRPOrgItems(region.locations));
        });
        if (this.filterColumns.locationIds) {
          this.filterColumns.locationIds.dataSource = this.allLocations;
        }
      });
  }

  private subscribeOnLocationChange(): void {
    this.filtersForm.get('locationIds')?.valueChanges
      .pipe(filter(Boolean), takeUntil(this.unsubscribe$))
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
      ).subscribe();
  }

  private getLastSelectedBusinessUnitId(): Observable<number> {
    const businessUnitId$ = this.isAgency ? this.lastSelectedAgencyId$ : this.lastSelectedOrganizationId$;
    return businessUnitId$;
  }

  private watchForRegionControl(): void {
    this.filtersForm.get('regionsIds')?.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
      )
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
