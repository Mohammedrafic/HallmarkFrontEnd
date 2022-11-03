import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { SetHeaderState, ShowFilterDialog } from '../../../store/app.actions';
import {
  GetCandidateDetailsPage,
  GetCandidateRegions,
  GetCandidateSkills,
  SetNavigation,
  SetPageFilters
} from '@shared/components/candidate-details/store/candidate.actions';
import { CandidateDetailsState } from '@shared/components/candidate-details/store/candidate.state';
import { combineLatest, filter, Observable, takeUntil, tap } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FilterService } from '@shared/services/filter.service';
import { FilteredItem } from '@shared/models/filter.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { DatePipe } from '@angular/common';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import {
  CandidateDetailsPage,
  CandidatesDetailsRegions,
  FilterColumnsModel,
  FiltersModal,
  NavigationTabModel
} from '@shared/components/candidate-details/models/candidate.model';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { UserState } from '../../../store/user.state';
import { OrderTypeOptionsForCandidates } from '@shared/components/candidate-details/candidate-details.constant';
import { toCorrectTimezoneFormat } from '../../utils/date-time.utils';
import { GRID_CONFIG } from '@shared/constants';

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

  @Select(CandidateDetailsState.filtersPage)
  public filtersPage$: Observable<FiltersModal>;

  @Select(CandidateDetailsState.candidateRegions)
  public candidateRegions$: Observable<CandidatesDetailsRegions[]>;

  @Select(UserState.lastSelectedAgencyId)
  lastSelectedAgencyId$: Observable<number>;

  @Select(UserState.lastSelectedOrganizationId)
  lastSelectedOrganizationId$: Observable<number>;

  public filtersForm: FormGroup;
  public filters: FiltersModal | null;
  public filterColumns: FilterColumnsModel;
  public filteredItems: FilteredItem[] = [];
  public orderTypes = OrderTypeOptionsForCandidates;
  public candidatesPage: CandidateDetailsPage;

  public pageNumber = GRID_CONFIG.initialPage;
  public pageSize = GRID_CONFIG.initialRowsPerPage;
  private selectedTab: number | null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.setHeaderName();
    this.createFilterForm();
    this.initFilterColumns();
    this.setOrderTypes();

    combineLatest([
      this.subscribeOnPageNumberChange(),
      this.subscribeOnPageSizeChange(),
      this.subscribeOnTabChange(),
      this.subscribeOnSkills(),
      this.subscribeOnRegions(),
      this.subscribeOnFiltersPage(),
      this.subscribeOnCandidatePage(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.subscribeOnAgencyOrganizationChanges();
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.store.dispatch(new SetPageFilters(this.filters));
    this.updatePage();
  }

  public onFilterApply(): void {
    const formData = this.filtersForm.getRawValue();
    const { startDate, endDate } = formData;
    this.filters = {
      ...formData,
      startDate: toCorrectTimezoneFormat(startDate),
      endDate: toCorrectTimezoneFormat(endDate),
    };

    this.filteredItems = this.filterService.generateChips(this.filtersForm, this.filterColumns, this.datePipe);
    this.updatePage();
    this.store.dispatch(new SetPageFilters(this.filters));
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.filtersForm, this.filterColumns);
  }

  public onFilterClose(): void {
    this.filtersForm.setValue({
      orderTypes: this.filters?.orderTypes || [],
      startDate: this.filters?.startDate || null,
      endDate: this.filters?.endDate || null,
      skillsIds: this.filters?.skillsIds || [],
      regionsIds: this.filters?.regionsIds || [],
    });
    this.filteredItems = this.filterService.generateChips(this.filtersForm, this.filterColumns, this.datePipe);
  }

  public showFilters(): void {
    this.store.dispatch(new GetCandidateSkills());
    this.store.dispatch(new GetCandidateRegions());
    this.store.dispatch(new ShowFilterDialog(true));
  }

  private setHeaderName(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Candidate Assignment', iconName: 'users' }));
  }

  private subscribeOnPageNumberChange(): Observable<number> {
    return this.pageNumber$.pipe(
      filter((currentPage: number) => !!currentPage),
      tap((currentPage: number) => {
        this.pageNumber = currentPage;
        this.setActiveTab();
        this.updateFilters();
        this.updatePage();
      })
    );
  }

  private subscribeOnPageSizeChange(): Observable<number> {
    return this.pageSize$.pipe(
      filter((currentSize: number) => !!currentSize),
      tap((currentSize: number) => {
        this.pageSize = currentSize;
        this.setActiveTab();
        this.updateFilters();
        this.updatePage();
      })
    );
  }

  private subscribeOnTabChange(): Observable<NavigationTabModel> {
    return this.candidateTab$.pipe(
      filter(({ active }: NavigationTabModel) => active === 0 || !!active),
      tap((selectedTab: NavigationTabModel) => {
        this.selectedTab = selectedTab.active;
        if (this.isNavigationFromAnotherPage()) {
          this.updateFilters();
          this.store.dispatch(new SetNavigation(false));
        } else {
          this.clearFilters();
        }
        this.store.dispatch(new SetNavigation(false));
        this.updatePage();
      })
    );
  }

  private updateFilters(): void {
    const filters = this.store.selectSnapshot(CandidateDetailsState.filtersPage);
    if (filters && !!filters) {
      this.filters = filters;
      this.filtersForm.setValue(filters);
      this.filteredItems = this.filterService.generateChips(this.filtersForm, this.filterColumns, this.datePipe);
    }
  }

  private subscribeOnRegions(): Observable<CandidatesDetailsRegions[]> {
    return this.candidateRegions$.pipe(
      tap((regions: CandidatesDetailsRegions[]) => (this.filterColumns.regionsIds.dataSource = regions))
    );
  }

  private subscribeOnSkills(): Observable<MasterSkillByOrganization[]> {
    return this.candidateSkills$.pipe(
      tap((skills: MasterSkillByOrganization[]) => (this.filterColumns.skillsIds.dataSource = skills))
    );
  }

  private subscribeOnFiltersPage(): Observable<FiltersModal> {
    return this.filtersPage$.pipe(
      filter((filters: FiltersModal) => !!filters),
      tap((filters: FiltersModal) => (this.filters = filters))
    );
  }

  private subscribeOnCandidatePage(): Observable<CandidateDetailsPage> {
    return this.candidates$.pipe(tap((page: CandidateDetailsPage) => (this.candidatesPage = page)));
  }

  private createFilterForm(): void {
    this.filtersForm = this.formBuilder.group({
      orderTypes: [null],
      startDate: [null],
      endDate: [null],
      skillsIds: [null],
      regionsIds: [null],
    });
  }

  private initFilterColumns(): void {
    this.filterColumns = {
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
        valueField: 'name',
        valueId: 'id',
      },
      regionsIds: {
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

  private clearFilters(): void {
    this.pageNumber = GRID_CONFIG.initialPage;
    this.pageSize = GRID_CONFIG.initialRowsPerPage;
    this.filtersForm.reset();
    this.filteredItems = [];
    this.filters = null;
    this.filteredItems = this.filterService.generateChips(this.filtersForm, this.filterColumns, this.datePipe);
    this.store.dispatch(new SetPageFilters(this.filters));
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
    combineLatest([this.lastSelectedOrganizationId$, this.lastSelectedAgencyId$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isNavigationFromAnotherPage()) {
          this.clearFilters();
          this.updatePage();
        }
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
}
