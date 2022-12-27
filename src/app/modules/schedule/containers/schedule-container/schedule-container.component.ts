import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { ScheduleApiService } from '@shared/services/schedule-api.service';
import { Destroyable } from '@core/helpers';

import { TabListConfig } from '../../constants';
import { SetHeaderState } from '../../../../store/app.actions';
import { ActiveTabIndex } from '../../enums/schedule.enum';
import { ScheduleModel } from '../../interface/schedule.model';

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
  scheduleData$: Observable<ScheduleModel[]>;

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

  changeTab(tabIndex: ActiveTabIndex) {
    this.activeTabIndex = tabIndex;
  }

  private initScheduleData(): void {
    this.scheduleData$ = this.scheduleApiService.getScheduleData();
  }
}
