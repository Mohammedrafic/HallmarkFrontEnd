import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { SetHeaderState, ShowFilterDialog } from '../../../store/app.actions';
import {
  GetCandidateDetailsPage,
  GetCandidateRegions,
  GetCandidateSkills,
  SetPageFilters,
} from '@shared/components/candidate-details/store/candidate.actions';
import { CandidateDetailsState } from '@shared/components/candidate-details/store/candidate.state';
import { combineLatest, filter, Observable, takeUntil, tap } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FilterService } from '@shared/services/filter.service';
import { FilteredItem } from '@shared/models/filter.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { OrderTypeOptions } from '@shared/enums/order-type';
import { DatePipe } from '@angular/common';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import {
  CandidateDetailsPage,
  CandidatesDetailsRegions,
  FilterColumnsModel,
  FiltersModal,
  NavigationTabModel,
} from '@shared/components/candidate-details/models/candidate.model';
import { MasterSkillByOrganization } from '@shared/models/skill.model';

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
  candidateSkills$: Observable<MasterSkillByOrganization[]>;

  @Select(CandidateDetailsState.candidateDetails)
  candidates$: Observable<CandidateDetailsPage>;

  @Select(CandidateDetailsState.filtersPage)
  filtersPage$: Observable<FiltersModal>;

  @Select(CandidateDetailsState.candidateRegions)
  candidateRegions$: Observable<CandidatesDetailsRegions[]>;

  public filtersForm: FormGroup;
  public filters: FiltersModal = {};
  public filterColumns: FilterColumnsModel;
  public filteredItems: FilteredItem[] = [];
  public orderTypes = OrderTypeOptions;
  public candidatesPage: CandidateDetailsPage;

  public pageNumber = 1;
  public pageSize = 30;
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
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.store.dispatch(new SetPageFilters(this.filters));
    this.updatePage();
  }

  public onFilterApply(): void {
    this.filters = this.filtersForm.getRawValue();
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
      orderTypes: this.filters.orderTypes || [],
      startDate: this.filters.startDate || null,
      endDate: this.filters.endDate || null,
      skillsIds: this.filters.skillsIds || [],
      regionsIds: this.filters.regionsIds || [],
    });
    this.filteredItems = this.filterService.generateChips(this.filtersForm, this.filterColumns, this.datePipe);
  }

  public showFilters(): void {
    this.store.dispatch(new GetCandidateSkills());
    this.store.dispatch(new GetCandidateRegions());
    this.store.dispatch(new ShowFilterDialog(true));
  }

  private setHeaderName(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Candidate Details', iconName: 'users' }));
  }

  private subscribeOnPageNumberChange(): Observable<number> {
    return this.pageNumber$.pipe(
      filter((currentPage: number) => !!currentPage),
      tap((currentPage: number) => {
        this.pageNumber = currentPage;
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
        this.updateFilters();
        this.updatePage();
      })
    );
  }

  private subscribeOnTabChange(): Observable<NavigationTabModel> {
    return this.candidateTab$.pipe(
      filter(({ active }: NavigationTabModel) => active === 0 || !!active),
      tap((selectedTab: NavigationTabModel) => {
        const isNavigate = this.store.selectSnapshot(CandidateDetailsState.isNavigate);
        this.selectedTab = selectedTab.active;
        isNavigate ? this.updateFilters() : this.clearFilters();
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
    this.pageNumber = 1;
    this.pageSize = 30;
    this.filtersForm.reset();
    this.filteredItems = [];
    this.filters = {};
    this.filteredItems = this.filterService.generateChips(this.filtersForm, this.filterColumns, this.datePipe);
    this.store.dispatch(new SetPageFilters(this.filters));
  }

  private updatePage(): void {
    this.store.dispatch(
      new GetCandidateDetailsPage({
        pageNumber: this.pageNumber ?? 1,
        pageSize: this.pageSize ?? 30,
        tab: this.selectedTab,
        ...this.filters,
      })
    );
  }
}
