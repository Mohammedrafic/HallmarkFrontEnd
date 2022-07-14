import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { SelectEventArgs, SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
})
export class TabNavigationComponent implements OnInit, OnDestroy {
  @ViewChild('tabNavigation') tabNavigation: TabComponent;

  @Input() incompleteCount: number;
  @Input() reOrdersNumber$: Subject<number>;
  @Output() selectedTab = new EventEmitter<OrganizationOrderManagementTabs>();

  public tabTitle = OrganizationOrderManagementTabs;
  public reOrderCount: number = 0;
  public firstActive = true;

  private unsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.reOrdersNumber$
      .pipe(takeUntil(this.unsubscribe$)).subscribe((reorderNumber) => this.reOrderCount = reorderNumber);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onSelect(event: SelectingEventArgs): void {
    const tabsArray = Object.values(OrganizationOrderManagementTabs);
    this.selectedTab.emit(tabsArray[event.selectingIndex]);
  }

  public onTabCreated(): void {
    this.tabNavigation.selected.pipe(takeUntil(this.unsubscribe$)).subscribe((event: SelectEventArgs) => {
      const visibilityTabIndex = 0;
      if (event.selectedIndex !== visibilityTabIndex) {
        this.tabNavigation.refresh();
        this.firstActive = false;
      } else {
        this.firstActive = true;
      }
    });
  }
}
