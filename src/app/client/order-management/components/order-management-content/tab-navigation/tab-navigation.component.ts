import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { filter, takeUntil, Observable } from 'rxjs';

import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderManagementService } from '@client/order-management/components/order-management-content/order-management.service';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { SelectNavigationTab } from '@client/store/order-managment-content.actions';
import { NavigationTabModel } from '@shared/models/navigation-tab.model';
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

  @Input() incompleteCount: number;
  @Input() hideTemplatesTab = false;
  @Output() selectedTab = new EventEmitter<OrganizationOrderManagementTabs>();
  public tabsWidth$: Observable<string>;

  public tabTitle = OrganizationOrderManagementTabs;
  private tabsArray = Object.values(OrganizationOrderManagementTabs);

  public constructor(
    private store: Store,
    private orderManagementService: OrderManagementService,
    private actions: Actions,
    private ResizeContentService: ResizeContentService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.selectPerDiemTab();
    this.listenTabChanges();
    this.getTabsWidth();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.ResizeContentService.detachResizeObservable();
  }

  public onTabCreated(): void {
    this.selectReOrderTab();
  }

  public onSelect(event: SelectingEventArgs): void {
    this.selectedTab.emit(this.tabsArray[event.selectingIndex]);
    this.store.dispatch(new SelectNavigationTab(null, null, this.tabsArray[event.selectingIndex]));
  }

  private selectPerDiemTab(): void {
    const perDiemTabIndex = 1;
    this.orderManagementService.orderPerDiemId$
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => this.tabNavigation.select(perDiemTabIndex));
  }

  private selectReOrderTab(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementService;
    const reOrders = 2;
    if (selectedOrderAfterRedirect?.orderType === OrderType.ReOrder) {
      this.tabNavigation.select(reOrders);
      this.selectedTab.emit(this.tabsArray[reOrders]);
    }
  }

  private listenTabChanges(): void {
    this.actions
      .pipe(
        ofActionDispatched(SelectNavigationTab),
        filter(({ active }: NavigationTabModel) => !!active),
        takeUntil(this.componentDestroy())
      )
      .subscribe(({ active }: NavigationTabModel) => {
        const tabList = Object.values(OrganizationOrderManagementTabs);
        const index = tabList.findIndex((tabName: string) => tabName === active);
        this.tabNavigation.select(index);
      });
  }

  private getTabsWidth(): void {
    this.ResizeContentService.initResizeObservable().pipe(takeUntil(this.componentDestroy())).subscribe();
    this.tabsWidth$ = this.ResizeContentService.getContainerWidth();
  }
}
