import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { Store } from '@ngxs/store';
import { Observable, switchMap, takeUntil } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { Destroyable } from '@core/helpers';

import { TabListConfig } from '../../constants';
import { SetHeaderState, ShowFilterDialog } from '../../../../store/app.actions';
import { ActiveTabIndex } from '../../enums';
import { ScheduleGridAdapter } from '../../adapters';
import { ScheduleApiService } from '../../services';
import * as ScheduleInt from '../../interface';

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

  scheduleData: ScheduleInt.ScheduleModelPage;

  appliedFiltersAmount = 0;

  totalCount = 0;

  scheduleFilters: ScheduleInt.ScheduleFilters = {};

  private selectedCandidate: ScheduleInt.ScheduleCandidate | null;

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private scheduleApiService: ScheduleApiService,
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
    this.scheduleFilters = {
      ...this.scheduleFilters,
      ...filters,
      pageNumber: 1,
      pageSize: 30,
    };

    this.detectWhatDataNeeds();
  }

  selectedCells(cells: ScheduleInt.ScheduleSelectedSlots): void {}

  showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  updateScheduleFilter(data: ScheduleInt.ScheduleFiltersData): void {
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

  private initScheduleData(isLoadMore = false): void {
    const { startDate, endDate, ...restFilters } = this.scheduleFilters;

    this.scheduleApiService.getScheduleEmployees(restFilters)
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
          items: [...this.scheduleData.items, ...scheduleData.items],
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
      { startDate: startDate || '', endDate: endDate || '' }
    ).pipe(
      take(1),
      map((candidateSchedules: ScheduleInt.CandidateSchedules[]): ScheduleInt.ScheduleModelPage =>
        ScheduleGridAdapter.combineCandidateData(candidates, candidateSchedules)
      ),
      takeUntil(this.componentDestroy()),
    );
  }
}
