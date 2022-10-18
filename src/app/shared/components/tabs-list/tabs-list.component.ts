import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NgZone,
  Output,
  ViewChild,
} from '@angular/core';
import { OutsideZone } from '@core/decorators';

import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { TabConfig } from '@client/candidates/interface';

@Component({
  selector: 'app-tabs-list',
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsListComponent implements AfterViewInit {
  @ViewChild('timesheetTabs') tab: TabComponent;

  @Input()
  public tabConfig: TabsListConfig[] | TabConfig[];

  @Output()
  public readonly changeTab: EventEmitter<number> = new EventEmitter<number>();

  constructor(private readonly ngZone: NgZone) {}

  public ngAfterViewInit(): void {
    this.asyncRefresh();
  }

  public trackByFn(idx: number): number {
    return idx;
  }

  public onSelect(selectEvent: SelectingEventArgs): void {
    this.changeTab.emit(selectEvent.selectingIndex);
  }

  @OutsideZone
  private asyncRefresh(): void {
    setTimeout(() => {
      this.tab.refreshActiveTabBorder();
    });
  }
}
