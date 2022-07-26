import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { Observable, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { OrderManagementState } from '../../store/order-management.state';
import { SetOrdersTab } from '../../store/order-management.actions';

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent extends DestroyableDirective implements OnInit, AfterViewInit {
  @ViewChild('tabNavigation') tabNavigation: TabComponent;
  @Output() selectedTab = new EventEmitter<AgencyOrderManagementTabs>();

  @Select(OrderManagementState.ordersTab)
  ordersTab$: Observable<AgencyOrderManagementTabs>;

  public tabTitle = AgencyOrderManagementTabs;
  public tabsArray = Object.values(AgencyOrderManagementTabs);

  private selectedTabIndex: number;

  constructor(private orderManagementAgencyService: OrderManagementAgencyService, private store: Store) {
    super();
  }

  public ngOnInit(): void {
    this.selectPerDiemTab();
  }

  public ngAfterViewInit(): void {
    this.onOrdersTabChange();
  }

  public onSelect(event: SelectingEventArgs): void {
    this.selectedTabIndex = event.selectingIndex;
    this.selectedTab.emit(this.tabsArray[this.selectedTabIndex]);
    this.store.dispatch(new SetOrdersTab(this.tabsArray[this.selectedTabIndex]));
  }

  private selectPerDiemTab(): void {
    const perDiemTabIndex = 3;
    this.orderManagementAgencyService.orderPerDiemId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.tabNavigation.select(perDiemTabIndex);
    });
  }

  private onOrdersTabChange(): void {
    this.ordersTab$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const storedTabIndex = this.tabsArray.indexOf(data);

      if (this.selectedTabIndex !== storedTabIndex) {
        setTimeout(() => this.tabNavigation.select(storedTabIndex));
      }
    });
  }
}
