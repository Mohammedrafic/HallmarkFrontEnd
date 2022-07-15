import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SelectingEventArgs } from '@syncfusion/ej2-angular-navigations';
import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent implements OnInit {
  @Output() selectedTab = new EventEmitter<AgencyOrderManagementTabs>();

  public tabTitle = AgencyOrderManagementTabs;

  ngOnInit(): void {
    this.selectedTab.emit(AgencyOrderManagementTabs.MyAgency);
  }

  public onSelect(event: SelectingEventArgs): void {
    const tabsArray = Object.values(AgencyOrderManagementTabs);
    this.selectedTab.emit(tabsArray[event.selectingIndex]);
  }
}
