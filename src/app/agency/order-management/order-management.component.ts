import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss'],
})
export class OrderManagementComponent {
  public selectedTab: AgencyOrderManagementTabs;
  public selectedTabCases = AgencyOrderManagementTabs;
  public filteredItems$ = new Subject<number>();

  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
  }

  public onTabChanged(selectedTab: AgencyOrderManagementTabs): void {
    this.selectedTab = selectedTab;
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }
}
