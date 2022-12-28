import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { ScheduleApiService } from '@shared/services/schedule-api.service';
import { Destroyable } from '@core/helpers';

import { TabListConfig } from '../../constants';
import { SetHeaderState } from '../../../../store/app.actions';
import { ActiveTabIndex } from '../../enums';
import {
  CandidateSchedules,
  ScheduleCandidatesPage,
  ScheduleFilters,
  ScheduleModelPage,
} from '../../interface/schedule.model';
import { ScheduleGridAdapter } from '../../adapters/shedule-grid.adapter';

@Component({
  selector: 'app-schedule-container',
  templateUrl: './schedule-container.component.html',
  styleUrls: ['./schedule-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleContainerComponent extends Destroyable implements OnInit {
  tabsListConfig: TabsListConfig[] = TabListConfig;

  activeTabIndex: ActiveTabIndex = ActiveTabIndex.Scheduling;

  tabIndex = ActiveTabIndex;

  scheduleData$: Observable<ScheduleModelPage>;

  scheduleFilters: ScheduleFilters = {
    firstLastNameOrId: '',
    startDate: '',
    endDate: '',
    regionIds: [0],
    locationIds: [0],
    departmentIds: [0],
    skillIds: [0],
    pageNumber: 1,
    pageSize: 30,
  };// TODO DEN! - REMOVE required fields when they will not be required

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private scheduleApiService: ScheduleApiService,
  ) {
    super();

    store.dispatch(new SetHeaderState({ title: 'Schedule Management', iconName: 'file-text' }));
  }

  ngOnInit(): void {
    this.initScheduleData();
  }

  changeTab(tabIndex: ActiveTabIndex): void {
    this.activeTabIndex = tabIndex;
  }

  changeFilters(filters: ScheduleFilters): void {
    this.scheduleFilters = {
      ...this.scheduleFilters,
      ...filters,
    };

    this.initScheduleData();
  }

  private initScheduleData(): void {
    this.scheduleData$ = this.scheduleApiService.getScheduleEmployees(this.scheduleFilters).pipe(
      switchMap((candidates: ScheduleCandidatesPage) =>
        this.scheduleApiService.getSchedulesByEmployeesIds(candidates.items.map(el => el.id)).pipe(
          map((candidateSchedules: CandidateSchedules[]): ScheduleModelPage =>
            ScheduleGridAdapter.combineCandidateData(candidates, candidateSchedules)
          )
        )
      )
    );
  }
}
