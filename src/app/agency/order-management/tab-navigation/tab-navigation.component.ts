import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { distinctUntilChanged, filter, map, Observable, takeUntil } from 'rxjs';

import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';

import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { OrderManagementState } from '../../store/order-management.state';
import { SetOrdersTab } from '../../store/order-management.actions';
import { Location } from '@angular/common';
import { OrderType } from '@shared/enums/order-type';
import { BreakpointObserverService } from '@core/services';
import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';
import { MiddleTabletWidth } from '@shared/constants/media-query-breakpoints';

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent extends DestroyableDirective implements OnInit {
  @ViewChild('tabNavigation') tabNavigation: TabComponent;
  @Output() selectedTab = new EventEmitter<AgencyOrderManagementTabs>();

  public readonly targetElement: HTMLElement | null = document.body.querySelector('#main');
  public width = '100%';
  public tabTitle = AgencyOrderManagementTabs;
  public tabsArray = Object.values(AgencyOrderManagementTabs).filter(
    (tab: string) => tab !== AgencyOrderManagementTabs.AllAgencies && tab !== AgencyOrderManagementTabs.OtherAgencies
  );

  private selectedTabIndex: number;
  private previousSelectedOrderId: number;
  private resizeObserver: ResizeObserverModel;
  private isTabletOrMobile = false;

  constructor(
    private orderManagementAgencyService: OrderManagementAgencyService,
    private store: Store,
    private location: Location,
    private breakpointService: BreakpointObserverService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.getDeviceResolution();
    this.selectPerDiemTab();
    this.selectReorderAfterNavigation();
    this.initResizeObserver();
    this.listenParentContainerWidth();

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
    this.orderManagementAgencyService.orderPerDiemId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.tabNavigation.select(perDiemTabIndex);
    });
  }

  private selectReorderAfterNavigation(): void {
    const perDiemTabIndex = 3;
    this.orderManagementAgencyService.reorderId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
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

  private initResizeObserver(): void {
    this.resizeObserver = ResizeObserverService.init(this.targetElement!);
  }

  private listenParentContainerWidth(): void {
    const resizeToolbarObserver$: Observable<number> = this.resizeObserver.resize$.pipe(
      filter(() => this.isTabletOrMobile),
      map((data) => data[0].contentRect.width),
      distinctUntilChanged()
    );

    resizeToolbarObserver$.pipe(takeUntil(this.destroy$)).subscribe((toolbarWidth) => {
      const isSmallScreen = toolbarWidth <= MiddleTabletWidth;
      const paddingWidth = 50;
      this.width = isSmallScreen ? Math.trunc(toolbarWidth - paddingWidth) + 'px' : '100%';
    });
  }

  private getDeviceResolution(): void {
    this.breakpointService
      .getBreakpointMediaRanges()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ isMobile, isTablet }) => {
        this.isTabletOrMobile = isMobile || isTablet;
      });
  }
}
