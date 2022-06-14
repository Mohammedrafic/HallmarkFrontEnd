import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectingEventArgs } from '@syncfusion/ej2-angular-navigations';

export enum OrderManagemetTabs {
  AllOrders = 'All Orders',
  OrderTemplates = 'Order Templates',
  Incomplete = 'Incomplete',
}

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent {
  @Input() incompleteCount: number;
  @Input() pandingCount: number;
  @Output() selectedTab = new EventEmitter<OrderManagemetTabs>();

  public tabTitle = OrderManagemetTabs;

  public onSelect(event: SelectingEventArgs): void {
    const tabsArray = Object.values(OrderManagemetTabs);
    this.selectedTab.emit(tabsArray[event.selectingIndex]);
  }
}
