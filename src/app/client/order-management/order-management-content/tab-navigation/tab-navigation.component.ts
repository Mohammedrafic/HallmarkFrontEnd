import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectingEventArgs } from '@syncfusion/ej2-angular-navigations';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent {
  @Input() incompleteCount: number;
  @Input() reOrdersCount: number;
  @Output() selectedTab = new EventEmitter<OrganizationOrderManagementTabs>();

  public tabTitle = OrganizationOrderManagementTabs;

  public onSelect(event: SelectingEventArgs): void {
    const tabsArray = Object.values(OrganizationOrderManagementTabs);
    this.selectedTab.emit(tabsArray[event.selectingIndex]);
  }
}
