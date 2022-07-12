import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss'],
})
export class OrderManagementComponent extends AbstractGridConfigurationComponent {
  public selectedTab: AgencyOrderManagementTabs;
  public selectedTabCases = AgencyOrderManagementTabs;
  public filteredItems$ = new Subject<number>();
  public exportSelected$ = new Subject<any>();

  constructor(private store: Store) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
  }

  public onTabChanged(selectedTab: AgencyOrderManagementTabs): void {
    this.selectedTab = selectedTab;
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onExportSelected(event: any): void {
    this.exportSelected$.next(event);
  }
}
