import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import {
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { SearchComponent } from '@shared/components/search/search.component';
import {
  TabNavigationComponent,
} from '@client/order-management/components/order-management-content/tab-navigation/tab-navigation.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss'],
})
export class OrderManagementComponent extends AbstractGridConfigurationComponent implements OnDestroy {
  @ViewChild('search') search: SearchComponent;
  @ViewChild('tabNavigation') tabNavigation: TabNavigationComponent;

  public selectedTab: AgencyOrderManagementTabs;
  public selectedTabCases = AgencyOrderManagementTabs;
  public filteredItems$ = new Subject<number>();
  public exportSelected$ = new Subject<any>();
  public search$ = new Subject<string>();
  private unsubscribe$: Subject<void> = new Subject();
  public orderStatus: string[] = [];
  public organizationIds: number[] = [];
  constructor(private store: Store,private router: Router) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
    const routerState = this.router.getCurrentNavigation()?.extras?.state;
    if(routerState?.['status'] == "Open&Inprogress"){
      this.orderStatus.push("Open");
      this.orderStatus.push("InProgress");
      this.organizationIds.push(routerState?.['orderStatus'])
    } else {
      routerState?.['status'];
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onTabChanged(selectedTab: AgencyOrderManagementTabs): void {
    this.search?.clear();
    this.selectedTab = selectedTab;
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onExportSelected(event: any): void {
    this.exportSelected$.next(event);
  }

  public searchOrders(event: KeyboardEvent): void {
    this.search$.next((event.target as HTMLInputElement).value);
  }

  onSelectTab(tab: number): void {
    this.tabNavigation.tabNavigation.select(tab);
  }
}
