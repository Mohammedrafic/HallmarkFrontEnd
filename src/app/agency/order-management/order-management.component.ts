import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';

import { SetHeaderState } from 'src/app/store/app.actions';
import { OrderManagemetTabs } from './tab-navigation/tab-navigation.component';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss'],
})
export class OrderManagementComponent {
  public selectedTab: OrderManagemetTabs;
  public selectedTabCases = OrderManagemetTabs;

  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
  }

  public onTabChanged(selectedTab: OrderManagemetTabs): void {
    this.selectedTab = selectedTab;
  }
}
