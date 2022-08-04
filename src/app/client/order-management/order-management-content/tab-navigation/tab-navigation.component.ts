import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderManagementService } from '@client/order-management/order-management-content/order-management.service';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { filter, takeUntil } from 'rxjs';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { SelectNavigationTab } from '@client/store/order-managment-content.actions';
import { NavigationTabModel } from '@shared/models/navigation-tab.model';

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent extends DestroyableDirective implements OnInit {
  @ViewChild('tabNavigation') tabNavigation: TabComponent;

  @Input() incompleteCount: number;
  @Output() selectedTab = new EventEmitter<OrganizationOrderManagementTabs>();

  public tabTitle = OrganizationOrderManagementTabs;

  public constructor(
    private orderManagementService: OrderManagementService,
    private actions: Actions,
    private store: Store
  ) {
    super();
  }

  public ngOnInit(): void {
    this.selectPerDiemTab();
    this.listenTabChanges();
  }

  public onSelect(event: SelectingEventArgs): void {
    const tabsArray = Object.values(OrganizationOrderManagementTabs);
    this.selectedTab.emit(tabsArray[event.selectingIndex]);
    this.store.dispatch(new SelectNavigationTab(null, null, tabsArray[event.selectingIndex]));
  }

  private selectPerDiemTab(): void {
    const perDiemTabIndex = 1;
    this.orderManagementService.orderPerDiemId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.tabNavigation.select(perDiemTabIndex));
  }

  private listenTabChanges(): void {
    this.actions
      .pipe(
        ofActionDispatched(SelectNavigationTab),
        filter(({ active }: NavigationTabModel) => !!active),
        takeUntil(this.destroy$)
      )
      .subscribe(({ active }: NavigationTabModel) => {
        const tabList = Object.values(OrganizationOrderManagementTabs);
        const index = tabList.findIndex((tabName: string) => tabName === active);
        this.tabNavigation.select(index);
      });
  }
}
