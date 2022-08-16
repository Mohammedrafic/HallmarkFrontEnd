import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { SelectingEventArgs } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-invoices-table-tabs',
  templateUrl: './invoices-table-tabs.component.html',
  styleUrls: ['./invoices-table-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesTableTabsComponent {
  @Input()
  public tabConfig: TabsListConfig[];

  @Input()
  public agency: boolean = false;

  @Output()
  public readonly changeTab: EventEmitter<number> = new EventEmitter<number>();

  public onSelect(selectEvent: SelectingEventArgs): void {
    this.changeTab.emit(selectEvent.selectingIndex);
  }
}
