import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { SelectingEventArgs } from '@syncfusion/ej2-angular-navigations';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';

@Component({
  selector: 'app-timesheets-tabs',
  templateUrl: './timesheets-tabs.component.html',
  styleUrls: ['./timesheets-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsTabsComponent {
  @Input()
  public tabConfig: TabsListConfig[];

  @Output()
  public readonly changeTab: EventEmitter<number> = new EventEmitter<number>();

  public trackByFn(idx: number): number {
    return idx;
  }

  public onSelect(selectEvent: SelectingEventArgs): void {
    this.changeTab.emit(selectEvent.selectingIndex);
  }
}
