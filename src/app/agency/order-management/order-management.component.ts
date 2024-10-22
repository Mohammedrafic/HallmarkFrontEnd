import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
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
import { ClearOrganizationStructure, SetOrdersTab } from '@agency/store/order-management.actions';
import { GlobalWindow } from '@core/tokens';
import { DOCUMENT } from '@angular/common';

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
  public orderStatus: string[]=[];
  public candidateStatuses: string[]=[];
  private unsubscribe$: Subject<void> = new Subject();
  public organizationIds: number[] = [];
  public ltaOrder: boolean|null;
  constructor(private store: Store,private router: Router,
    @Inject(DOCUMENT) private documentEle: Document,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis
    ) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
    const routerState = this.router.getCurrentNavigation()?.extras?.state;
    if(routerState?.['condition'] == "Open&Inprogress"){
      this.orderStatus.push("Open");
      this.orderStatus.push("InProgress");
      this.organizationIds.push(routerState?.['orderStatus'])
    } else {
      if(routerState?.['status'] == "In Progress"){
        this.orderStatus.push("InProgress");
      }else if(routerState?.['status']){
        this.orderStatus.push(routerState?.['status']);
      }
      if(routerState?.['candidateStatusId'] != undefined){
        this.candidateStatuses.push(routerState?.['candidateStatusId']);
        this.store.dispatch(new SetOrdersTab(AgencyOrderManagementTabs.AllAgencies));
        this.selectedTab = AgencyOrderManagementTabs.AllAgencies;
        let orderStatus:string[] = [];
        const candidatesOrderStatusList = this.globalWindow.localStorage.getItem('candidatesOrderStatusListFromDashboard');
        if(candidatesOrderStatusList){
          JSON.parse(candidatesOrderStatusList).forEach((data:any)=>{
            data.name = data.name.replace(/\s/g, '');
            orderStatus.push(data.name);
          })
          this.orderStatus = orderStatus;
          this.documentEle.defaultView?.localStorage.setItem('candidatesOrderStatusListFromDashboard','');
        }
      }
      const ltaOrderFlag = JSON.parse(localStorage.getItem('ltaorderending') || 'false') as boolean;
      if(ltaOrderFlag){
        this.ltaOrder = ltaOrderFlag;
        this.globalWindow.localStorage.setItem("ltaorderending", JSON.stringify(false));
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onTabChanged(selectedTab: AgencyOrderManagementTabs): void {
    this.search?.clear();
    this.selectedTab = selectedTab;
    this.store.dispatch(new ClearOrganizationStructure());
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
