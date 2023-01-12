import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { Store } from '@ngxs/store';
import { switchMap, takeUntil } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { ScheduleApiService } from '@shared/services/schedule-api.service';
import { Destroyable } from '@core/helpers';

import { TabListConfig } from '../../constants';
import { SetHeaderState, ShowFilterDialog } from '../../../../store/app.actions';
import { ActiveTabIndex } from '../../enums';
import {
  CandidateSchedules,
  ScheduleCandidatesPage,
  ScheduleFilters,
  ScheduleFiltersData,
  ScheduleModelPage,
  ScheduleSelectedSlots,
} from '../../interface/schedule.interface';
import { ScheduleGridAdapter } from '../../adapters/shedule-grid.adapter';

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

  scheduleData: ScheduleModelPage;

  appliedFiltersAmount = 0;

  totalCount = 0;

  scheduleFilters: ScheduleFilters = {};

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

  changeFilters(filters: ScheduleFilters): void {
    this.scheduleFilters = {
      ...this.scheduleFilters,
      ...filters,
      pageNumber: 1,
      pageSize: 30,
    };

    this.initScheduleData();
  }

  selectedCells(cells: ScheduleSelectedSlots): void {}

  showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  updateScheduleFilter(data: ScheduleFiltersData): void {
    this.changeFilters(data.filters);
    this.appliedFiltersAmount = data.filteredItems?.length;
  }

  private initScheduleData(isLoadMore = false): void {
    const { startDate, endDate, ...restFilters } = this.scheduleFilters;

    this.scheduleApiService.getScheduleEmployees(restFilters)
    .pipe(
      take(1),
      switchMap((candidates: ScheduleCandidatesPage) =>
        this.scheduleApiService.getSchedulesByEmployeesIds(
          candidates.items.map(el => el.id),
          { startDate: startDate || '', endDate: endDate || '' }
        ).pipe(
          take(1),
          map((candidateSchedules: CandidateSchedules[]): ScheduleModelPage =>
            ScheduleGridAdapter.combineCandidateData(candidates, candidateSchedules)
          )
        )
      ),
      takeUntil(this.componentDestroy()),
    ).subscribe((scheduleData: ScheduleModelPage) => {
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
}
