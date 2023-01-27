import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { Store } from '@ngxs/store';
import { Observable, switchMap, takeUntil } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { Destroyable } from '@core/helpers';
import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { ChipDeleteEventType, ChipItem } from '@shared/components/inline-chips';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { SetHeaderState, ShowFilterDialog } from '../../../../store/app.actions';
import { ScheduleGridAdapter } from '../../adapters';
import { TabListConfig } from '../../constants';
import { ActiveTabIndex } from '../../enums';
import * as ScheduleInt from '../../interface';
import { ScheduleApiService, ScheduleFiltersService } from '../../services';

@Component({
  selector: 'app-schedule-container',
  templateUrl: './schedule-container.component.html',
  styleUrls: ['./schedule-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleContainerComponent extends Destroyable {
  tabsListConfig: TabsListConfig[] = TabListConfig;

  activeTabIndex: ActiveTabIndex = ActiveTabIndex.Scheduling;

  tabIndex = ActiveTabIndex;

  scheduleData: ScheduleInt.ScheduleModelPage | null;

  appliedFiltersAmount = 0;

  totalCount = 0;

  scheduleFilters: ScheduleInt.ScheduleFilters = {};

  createScheduleDialogOpen = false;

  scheduleSelectedSlots: ScheduleInt.ScheduleSelectedSlots;

  datePickerLimitations: DatePickerLimitations;

  chipsData: ChipItem[];

  private selectedCandidate: ScheduleInt.ScheduleCandidate | null;

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private scheduleApiService: ScheduleApiService,
    private filterService: ScheduleFiltersService,
  ) {
    super();

    store.dispatch(new SetHeaderState({ title: 'Schedule Management', iconName: 'file-text' }));
  }

  changeTab(tabIndex: ActiveTabIndex): void {
    this.activeTabIndex = tabIndex;
  }

  loadMoreData(pageNumber: number): void {
    this.scheduleFilters.pageNumber = pageNumber;

    this.initScheduleData(true);
  }

  changeFilters(filters: ScheduleInt.ScheduleFilters): void {
    //TODO: make filters as plain arrays number;
    this.scheduleFilters = {
      ...this.scheduleFilters,
      ...filters,
      pageNumber: 1,
      pageSize: 30,
    };

    this.updateScheduleGrid();
  }

  updateScheduleGrid(): void {
    this.detectWhatDataNeeds();
    this.setDateLimitation();
    this.selectCells({
      candidates: [],
      dates: [],
    });
  }

  selectCells(cells: ScheduleInt.ScheduleSelectedSlots): void {
    this.scheduleSelectedSlots = cells;
  }

  scheduleCell(cells: ScheduleInt.ScheduleSelectedSlots): void {
    this.selectCells(cells);
    this.openScheduleDialog();
  }

  openScheduleDialog(): void {
    this.createScheduleDialogOpen = true;
  }

  closeScheduleDialog(): void {
    this.createScheduleDialogOpen = false;
  }

  showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  updateScheduleFilter(data: ScheduleInt.ScheduleFiltersData): void {
    this.chipsData = data.chipsData;
    this.changeFilters(data.filters);
    this.appliedFiltersAmount = data.filteredItems?.length;
  }

  selectCandidate(selectedCandidate: ScheduleInt.ScheduleCandidate | null): void {
    this.selectedCandidate = selectedCandidate;
    if (!selectedCandidate) {
      this.scheduleFilters.firstLastNameOrId = '';
    }
    this.detectWhatDataNeeds();
  }

  deleteFilterItem(event: ChipDeleteEventType): void {
    this.filterService.deleteInlineChip(event);
  }

  private initScheduleData(isLoadMore = false): void {
    this.scheduleApiService.getScheduleEmployees(this.scheduleFilters)
    .pipe(
      take(1),
      switchMap((candidates: ScheduleInt.ScheduleCandidatesPage) =>
        this.getSchedulesByEmployeesIds(candidates)
      ),
      takeUntil(this.componentDestroy()),
    ).subscribe((scheduleData: ScheduleInt.ScheduleModelPage) => {
      if (isLoadMore) {
        this.scheduleData = {
          ...scheduleData,
          items: [...(this.scheduleData?.items || []), ...scheduleData.items],
        };
      } else {
        this.scheduleData = scheduleData;
      }

      this.totalCount = scheduleData.totalCount;

      this.cdr.detectChanges();
    });
  }

  private initSelectedCandidateScheduleData(): void {
    const candidatesPage = {
      items: [this.selectedCandidate],
      totalCount: 1,
    } as ScheduleInt.ScheduleCandidatesPage;

    this.getSchedulesByEmployeesIds(candidatesPage)
      .subscribe((scheduleData: ScheduleInt.ScheduleModelPage) => {
        this.scheduleData = scheduleData;
        this.totalCount = scheduleData.totalCount;

        this.cdr.detectChanges();
    });
  }

  private detectWhatDataNeeds(): void {
    if (!this.detectIsRequiredFiltersExist()) {
      this.scheduleData = null;

      return;
    }

    if (this.selectedCandidate) {
      this.initSelectedCandidateScheduleData();
    } else {
      this.initScheduleData();
    }
  }

  private getSchedulesByEmployeesIds(
    candidates: ScheduleInt.ScheduleCandidatesPage,
  ): Observable<ScheduleInt.ScheduleModelPage> {
    const { startDate, endDate } = this.scheduleFilters;

    return this.scheduleApiService.getSchedulesByEmployeesIds(
      candidates.items.map(el => el.id),
      { startDate: startDate || '', endDate: endDate || '',  departmentsIds: this.scheduleFilters.departmentsIds ?? [] }
    ).pipe(
      take(1),
      map((candidateSchedules: ScheduleInt.CandidateSchedules[]): ScheduleInt.ScheduleModelPage =>
        ScheduleGridAdapter.combineCandidateData(candidates, candidateSchedules)
      ),
      takeUntil(this.componentDestroy()),
    );
  }

  private setDateLimitation(): void {
    if (this.scheduleFilters.startDate && this.scheduleFilters.endDate) {
      this.datePickerLimitations = {
        minDate: new Date(this.scheduleFilters.startDate),
        maxDate: new  Date(this.scheduleFilters.endDate),
      };
    }
  }

  private detectIsRequiredFiltersExist(): boolean {
    return !!this.selectedCandidate
      || !!this.scheduleFilters.firstLastNameOrId
      || !!this.scheduleFilters.regionIds?.length
      || !!this.scheduleFilters.locationIds?.length;
  }
}
