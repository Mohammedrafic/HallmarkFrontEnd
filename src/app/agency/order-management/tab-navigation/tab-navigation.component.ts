import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Location } from '@angular/common';

import { Store } from '@ngxs/store';
import { takeUntil, Observable } from 'rxjs';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';

import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { OrderManagementState } from '../../store/order-management.state';
import { SetOrdersTab } from '../../store/order-management.actions';
import { OrderType } from '@shared/enums/order-type';
import { Destroyable } from '@core/helpers';
import { ResizeContentService } from '@shared/services/resize-main-content.service';

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent extends Destroyable implements OnInit {
  @ViewChild('tabNavigation') tabNavigation: TabComponent;
  @Output() selectedTab = new EventEmitter<AgencyOrderManagementTabs>();

  public width = '100%';
  public tabTitle = AgencyOrderManagementTabs;
  public tabsArray = Object.values(AgencyOrderManagementTabs).filter(
    (tab: string) => tab !== AgencyOrderManagementTabs.AllAgencies && tab !== AgencyOrderManagementTabs.OtherAgencies
  );

  private selectedTabIndex: number;
  private previousSelectedOrderId: number;
  public tabsWidth$: Observable<string>;

  constructor(
    private store: Store,
    private orderManagementAgencyService: OrderManagementAgencyService,
    private location: Location,
    private ResizeContentService: ResizeContentService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.selectPerDiemTab();
    this.selectReorderAfterNavigation();
    this.getTabsWidth();
  
    const locationState = this.location.getState() as { orderId: number };
    this.previousSelectedOrderId = locationState.orderId;
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.ResizeContentService.detachResizeObservable();
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
    this.orderManagementAgencyService.orderPerDiemId$
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.tabNavigation.select(perDiemTabIndex);
        this.store.dispatch(new SetOrdersTab(this.tabsArray[perDiemTabIndex]));
      });
  }

  private selectReorderAfterNavigation(): void {
    const reorderTabIndex = 3;
    this.orderManagementAgencyService.reorderId$
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.tabNavigation.select(reorderTabIndex);
        this.store.dispatch(new SetOrdersTab(this.tabsArray[reorderTabIndex]));
      });
  }

  private selectReOrderTab(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
    const reOrders = 3;

    if (selectedOrderAfterRedirect?.orderType === OrderType.ReOrder) {
      this.tabNavigation.select(reOrders);
      this.selectedTab.emit(this.tabsArray[reOrders]);
    }
  }

  private getTabsWidth(): void {
    this.ResizeContentService.initResizeObservable()
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe();
    this.tabsWidth$ = this.ResizeContentService.getContainerWidth();
  }
}
