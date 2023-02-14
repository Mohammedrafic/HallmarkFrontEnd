import { Component, EventEmitter, OnInit, Output, ViewChild, Inject } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';

import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';

import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { OrderManagementState } from '../../store/order-management.state';
import { SetOrdersTab } from '../../store/order-management.actions';
import { OrderType } from '@shared/enums/order-type';
import { ResponsiveTabsDirective } from '@shared/directives/responsive-tabs.directive';

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent extends ResponsiveTabsDirective implements OnInit {
  @ViewChild('tabNavigation') tabNavigation: TabComponent;
  @Output() selectedTab = new EventEmitter<AgencyOrderManagementTabs>();

  public width = '100%';
  public tabTitle = AgencyOrderManagementTabs;
  public tabsArray = Object.values(AgencyOrderManagementTabs).filter(
    (tab: string) => tab !== AgencyOrderManagementTabs.AllAgencies && tab !== AgencyOrderManagementTabs.OtherAgencies
  );

  private selectedTabIndex: number;
  private previousSelectedOrderId: number;

  constructor(
    @Inject(DOCUMENT) protected override document: Document,
    protected override store: Store,
    private orderManagementAgencyService: OrderManagementAgencyService,
    private location: Location,
  ) {
    super(store, document);
  }

  public ngOnInit(): void {
    this.selectPerDiemTab();
    this.selectReorderAfterNavigation();

    const locationState = this.location.getState() as { orderId: number };
    this.previousSelectedOrderId = locationState.orderId;
  }

  public onSelect(event: SelectingEventArgs): void {
    this.selectedTabIndex = event.selectingIndex;
    this.selectedTab.emit(this.tabsArray[this.selectedTabIndex]);
    this.store.dispatch(new SetOrdersTab(this.tabsArray[this.selectedTabIndex]));
  }

  public onTabCreated(): void {
    if (this.previousSelectedOrderId) {
      const selected = this.store.selectSnapshot(OrderManagementState.ordersTab);
      const storedTabIndex = this.tabsArray.indexOf(selected || AgencyOrderManagementTabs.MyAgency);
      this.tabNavigation.select(storedTabIndex);
    }

    this.selectReOrderTab();
  }

  private selectPerDiemTab(): void {
    //TODO: change perDiemTabIndex to 3 , when we implemented other tabs
    const perDiemTabIndex = 1;
    this.orderManagementAgencyService.orderPerDiemId$.pipe(takeUntil(this.componentDestroy())).subscribe(() => {
      this.tabNavigation.select(perDiemTabIndex);
    });
  }

  private selectReorderAfterNavigation(): void {
    const perDiemTabIndex = 3;
    this.orderManagementAgencyService.reorderId$.pipe(takeUntil(this.componentDestroy())).subscribe(() => {
      this.tabNavigation.select(perDiemTabIndex);
    });
  }

  private selectReOrderTab(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
    const reOrders = 3;

    if (selectedOrderAfterRedirect?.orderType === OrderType.ReOrder) {
      this.tabNavigation.select(reOrders);
      this.selectedTab.emit(this.tabsArray[reOrders]);
    } else if (selectedOrderAfterRedirect?.orderType !== OrderType.ReOrder) {
      this.store.dispatch(new SetOrdersTab(this.tabsArray[0]));
    }
  }
}
