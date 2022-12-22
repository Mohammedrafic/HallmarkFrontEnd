import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { Store } from '@ngxs/store';

import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';

import { ActiveTabIndex } from '../../enums/schedule';
import { TabListConfig } from '../../constants';
import { SetHeaderState } from '../../../../store/app.actions';

@Component({
  selector: 'app-schedule-container',
  templateUrl: './schedule-container.component.html',
  styleUrls: ['./schedule-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleContainerComponent {
  tabsListConfig: TabsListConfig[] = TabListConfig;
  activeTabIndex: ActiveTabIndex = ActiveTabIndex.Scheduling;
  tabIndex = ActiveTabIndex;

  constructor(private store: Store, private cdr: ChangeDetectorRef) {
    store.dispatch(new SetHeaderState({ title: 'Schedule Management', iconName: 'file-text' }));
  }

  changeTab(tabIndex: ActiveTabIndex) {
    this.activeTabIndex = tabIndex;
  }
}
