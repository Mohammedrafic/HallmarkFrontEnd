import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { SelectingEventArgs } from '@syncfusion/ej2-angular-navigations';

export enum OrderManagemetTabs {
  MyAgency = 'My Agency',
  OtherAgencies = 'Other Agencies',
  AllAgencies = 'All Agencies',
}

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent implements OnInit {
  @Output() selectedTab = new EventEmitter<OrderManagemetTabs>();

  public tabTitle = OrderManagemetTabs;

  ngOnInit(): void {
    this.selectedTab.emit(OrderManagemetTabs.MyAgency);
  }

  public onSelect(event: SelectingEventArgs): void {
    const tabsArray = Object.values(OrderManagemetTabs);
    this.selectedTab.emit(tabsArray[event.selectingIndex]);
  }
}
