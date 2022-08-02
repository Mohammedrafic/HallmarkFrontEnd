import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs';

import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';

import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { OrderManagementState } from '../../store/order-management.state';
import { SetOrdersTab } from '../../store/order-management.actions';
import { Location } from '@angular/common';

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent extends DestroyableDirective implements OnInit {
  @ViewChild('tabNavigation') tabNavigation: TabComponent;
  @Output() selectedTab = new EventEmitter<AgencyOrderManagementTabs>();

  public tabTitle = AgencyOrderManagementTabs;
  public tabsArray = Object.values(AgencyOrderManagementTabs).filter(
    (tab: string) => tab !== AgencyOrderManagementTabs.AllAgencies && tab !== AgencyOrderManagementTabs.OtherAgencies
  );

  private selectedTabIndex: number;
  private previousSelectedOrderId: number;

  constructor(
    private orderManagementAgencyService: OrderManagementAgencyService,
    private store: Store,
    private location: Location
  ) {
    super();
  }

  public ngOnInit(): void {
    this.selectPerDiemTab();
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
  }

  private selectPerDiemTab(): void {
    //TODO: change perDiemTabIndex to 3 , when we implemented other tabs
    const perDiemTabIndex = 1;
    this.orderManagementAgencyService.orderPerDiemId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.tabNavigation.select(perDiemTabIndex);
    });
  }
}
