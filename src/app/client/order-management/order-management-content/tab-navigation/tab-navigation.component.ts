import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderManagementService } from '@client/order-management/order-management-content/order-management.service';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { takeUntil } from 'rxjs';

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

  public constructor(private orderManagementService: OrderManagementService) {
    super();
  }

  public ngOnInit(): void {
    this.selectPerDiemTab();
  }

  public onSelect(event: SelectingEventArgs): void {
    const tabsArray = Object.values(OrganizationOrderManagementTabs);
    this.selectedTab.emit(tabsArray[event.selectingIndex]);
  }

  private selectPerDiemTab(): void {
    const perDiemTabIndex = 1;
    this.orderManagementService.orderPerDiemId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.tabNavigation.select(perDiemTabIndex));
  }
}
