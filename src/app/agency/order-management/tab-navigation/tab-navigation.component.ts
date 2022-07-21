import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent extends DestroyableDirective implements OnInit {
  @ViewChild('tabNavigation') tabNavigation: TabComponent;
  @Output() selectedTab = new EventEmitter<AgencyOrderManagementTabs>();

  public tabTitle = AgencyOrderManagementTabs;

  constructor(private orderManagementAgencyService: OrderManagementAgencyService) {
    super();
  }

  public ngOnInit(): void {
    this.selectedTab.emit(AgencyOrderManagementTabs.MyAgency);
    this.selectPerDiemTab();
  }

  public onSelect(event: SelectingEventArgs): void {
    const tabsArray = Object.values(AgencyOrderManagementTabs);
    this.selectedTab.emit(tabsArray[event.selectingIndex]);
  }

  private selectPerDiemTab(): void {
    const perDiemTabIndex = 3;
    this.orderManagementAgencyService.orderPerDiemId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.tabNavigation.select(perDiemTabIndex));
  }
}
