import {
  ChangeDetectionStrategy, Component, EventEmitter,
  Input, NgZone, OnChanges, Output, SimpleChanges, ViewChild
} from '@angular/core';

import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { Destroyable } from '@core/helpers';
import { OutsideZone } from '@core/decorators';

@Component({
  selector: 'app-timesheets-tabs',
  templateUrl: './timesheets-tabs.component.html',
  styleUrls: ['./timesheets-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsTabsComponent extends Destroyable implements OnChanges {
  @ViewChild(TabComponent)
  public tabComponent: TabComponent;

  @Input()
  public tabConfig: TabsListConfig[];

  @Input()
  public isDisabled: boolean = false;

  @Output()
  public readonly changeTab: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private readonly ngZone: NgZone,
  ) {
    super();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.tabConfig) {
      this.asyncRefresh();
    }
  }

  public trackBy(_: number, item: TabsListConfig): string {
    return item.title;
  }

  public programSelection(idx = 0): void {
    this.tabComponent.select(idx);
  }

  public onSelect(selectEvent: SelectingEventArgs): void {
    this.changeTab.emit(selectEvent.selectingIndex);
  }

  @OutsideZone
  private asyncRefresh(): void {
    setTimeout(() => {
      this.tabComponent.refreshActiveTabBorder();
    });
  }
}
