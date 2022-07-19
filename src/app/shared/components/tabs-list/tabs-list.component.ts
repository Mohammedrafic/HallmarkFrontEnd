import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { SelectingEventArgs } from '@syncfusion/ej2-angular-navigations';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';

@Component({
  selector: 'app-tabs-list',
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsListComponent {
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
