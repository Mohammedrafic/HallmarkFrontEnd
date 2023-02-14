import { Component, EventEmitter, Input, OnInit, Output, ViewChild, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderManagementService } from '@client/order-management/components/order-management-content/order-management.service';
import { filter, takeUntil } from 'rxjs';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { SelectNavigationTab } from '@client/store/order-managment-content.actions';
import { NavigationTabModel } from '@shared/models/navigation-tab.model';
import { OrderType } from '@shared/enums/order-type';
import { ResponsiveTabsDirective } from '@shared/directives/responsive-tabs.directive.ts/responsive-tabs.directive';

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent extends ResponsiveTabsDirective implements OnInit {
  @ViewChild('tabNavigation') tabNavigation: TabComponent;

  @Input() incompleteCount: number;
  @Input() hideTemplatesTab = false;
  @Output() selectedTab = new EventEmitter<OrganizationOrderManagementTabs>();

  public tabTitle = OrganizationOrderManagementTabs;
  private tabsArray = Object.values(OrganizationOrderManagementTabs);

  public constructor(
    @Inject(DOCUMENT) protected override document: Document,
    protected override store: Store,
    private orderManagementService: OrderManagementService,
    private actions: Actions,
  ) {
    super(store, document);
  }

  public ngOnInit(): void {
    this.selectPerDiemTab();
    this.listenTabChanges();
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
    const reOrders = 3;
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
}
