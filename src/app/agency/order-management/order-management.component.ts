import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';

import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { OrderManagemetTabs } from './tab-navigation/tab-navigation.component';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss'],
})
export class OrderManagementComponent {
  public selectedTab: OrderManagemetTabs;
  public selectedTabCases = OrderManagemetTabs;
  public filteredItems$ = new Subject<number>();

  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
  }

  public onTabChanged(selectedTab: OrderManagemetTabs): void {
    this.selectedTab = selectedTab;
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }
}
