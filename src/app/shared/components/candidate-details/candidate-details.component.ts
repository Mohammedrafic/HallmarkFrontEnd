import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { SetHeaderState, ShowFilterDialog } from '../../../store/app.actions';
import {
  GetCandidateDetailsPage,
  GetCandidateRegions,
  GetCandidateSkills,
} from '@shared/components/candidate-details/store/candidate.actions';
import { CandidateDetailsState } from '@shared/components/candidate-details/store/candidate.state';
import { combineLatest, filter, Observable, takeUntil, tap, switchMap, of, debounceTime, skip } from 'rxjs';
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
  NavigationTabModel,
} from '@shared/components/candidate-details/models/candidate.model';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { UserState } from '../../../store/user.state';
import { OrderTypeOptionsForCandidates } from '@shared/components/candidate-details/candidate-details.constant';
import { toCorrectTimezoneFormat } from '../../utils/date-time.utils';
import { GRID_CONFIG } from '@shared/constants';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import { Router } from '@angular/router';
import {
  ClearPageFilters,
  GetPreservedFiltersByPage,
  ResetPageFilters,
  SaveFiltersByPageName,
} from 'src/app/store/preserved-filters.actions';
import { CandidateDetailsService } from './services/candidate-details.service';
import { PreservedFiltersByPage } from '@core/interface';
import { FilterPageName } from '@core/enums';

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

  @Select(UserState.lastSelectedAgencyId)
  lastSelectedAgencyId$: Observable<number>;

  @Select(UserState.lastSelectedOrganizationId)
  lastSelectedOrganizationId$: Observable<number>;

  @Select(PreservedFiltersState.preservedFiltersByPageName)
  private readonly preservedFiltersByPageName$: Observable<PreservedFiltersByPage<FiltersModal>>;

  public filtersForm: FormGroup;
  public filters: FiltersModal | null;
  public filterColumns: FilterColumnsModel;
  public filteredItems: FilteredItem[] = [];
  public orderTypes = OrderTypeOptionsForCandidates;
  public candidatesPage: CandidateDetailsPage;

  public pageNumber = GRID_CONFIG.initialPage;
  public pageSize = GRID_CONFIG.initialRowsPerPage;
  public CandidateStatus: number;

  private selectedTab: number | null;
  private isAgency = false;

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

    combineLatest([
      this.subscribeOnPageNumberChange(),
      this.subscribeOnPageSizeChange(),
      this.subscribeOnTabChange(),
      this.subscribeOnSkills(),
      this.subscribeOnRegions(),
      this.subscribeOnCandidatePage(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.subscribeOnAgencyOrganizationChanges();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(new ResetPageFilters());
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.store.dispatch(new ClearPageFilters(this.getPageName()));
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

      this.store.dispatch(new SaveFiltersByPageName(this.getPageName(), this.filters));
      this.filtersForm.markAsPristine();
    } else {
      this.store.dispatch(new ShowFilterDialog(false));
    }
  }

  public onFilterDelete(event: FilteredItem): void {
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
    this.store.dispatch(new SetHeaderState({ title: 'Candidate Assignment', iconName: 'users' }));
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

  private subscribeOnRegions(): Observable<CandidatesDetailsRegions[]> {
    return this.candidateRegions$.pipe(
      tap((regions: CandidatesDetailsRegions[]) => (this.filterColumns.regionsIds.dataSource = regions || []))
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
        valueField: 'skillDescription',
        valueId: 'masterSkillId',
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
    combineLatest([this.lastSelectedOrganizationId$, this.lastSelectedAgencyId$, this.candidateRegions$])
      .pipe(
        filter((data) => !!data[2]),
        debounceTime(600),
        tap(() => this.store.dispatch(new GetPreservedFiltersByPage(this.getPageName()))),
        switchMap(() => this.adjustFilters()),
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
    });
    this.filteredItems = this.filterService.generateChips(this.filtersForm, this.filterColumns);
  }

  private adjustFilters(): Observable<PreservedFiltersByPage<FiltersModal>> {
    return this.preservedFiltersByPageName$.pipe(
      debounceTime(100),
      tap((filters) => this.handleFilterState(filters))
    );
  }

  private handleFilterState(filters: PreservedFiltersByPage<FiltersModal>): void {
    const { isNotPreserved, state, dispatch } = filters;
    if (!isNotPreserved && dispatch) {
      this.filters = {
        orderTypes: state?.orderTypes || [],
        startDate: state?.startDate,
        endDate: state?.endDate,
        skillsIds: (state?.skillsIds && [...state.skillsIds]) || [],
        regionsIds: (state?.regionsIds && [...state.regionsIds]) || [],
      };

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
}
