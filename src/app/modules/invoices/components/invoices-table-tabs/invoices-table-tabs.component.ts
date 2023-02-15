import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NgZone,
  Output,
  ViewChild,
} from '@angular/core';

import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { BehaviorSubject, filter, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { OutsideZone } from '@core/decorators';
import { AlertIdEnum } from '@admin/alerts/alerts.enum';
import { UserState } from 'src/app/store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { Destroyable } from '@core/helpers';
import { ResizeContentService } from '@shared/services/resize-main-content.service';

@Component({
  selector: 'app-invoices-table-tabs',
  templateUrl: './invoices-table-tabs.component.html',
  styleUrls: ['./invoices-table-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesTableTabsComponent extends Destroyable implements AfterViewInit {
  private readonly tabsComponentCreated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @Input()
  public tabConfig: TabsListConfig[];

  @Input() preselectedTabIdx: number | null;

  @Output()
  public readonly changeTab: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild(TabComponent)
  public tabComponent: TabComponent;
  public alertTitle: string;
  public tabsWidth$: Observable<string>;

  constructor(
    private store: Store,
    private readonly ngZone: NgZone,
    private ResizeContentService: ResizeContentService
  ) {
    super();
  }

  public ngAfterViewInit(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.alertTitle = JSON.parse(localStorage.getItem('alertTitle') || '""') as string;
    //Paid Tab navigation
    if (
      AlertIdEnum[AlertIdEnum['Invoice: Organization Paid']].trim().toLowerCase() ==
      this.alertTitle.trim().toLowerCase()
    ) {
      if (
        user?.businessUnitType === BusinessUnitType.Organization ||
        user?.businessUnitType === BusinessUnitType.Hallmark
      ) {
        this.changeTab.emit(4);
        this.tabComponent.selectedItem = 4;
        window.localStorage.setItem('alertTitle', JSON.stringify(''));
      }
      if (user?.businessUnitType === BusinessUnitType.Agency) {
        this.changeTab.emit(1);
        this.tabComponent.selectedItem = 1
        window.localStorage.setItem("alertTitle", JSON.stringify(""));
      }
    }
    if (AlertIdEnum[AlertIdEnum['Invoice: Approved']].trim().toLowerCase() == this.alertTitle.trim().toLowerCase()) {
      //Pending payment tab navigation for organization
      if (
        user?.businessUnitType === BusinessUnitType.Organization ||
        user?.businessUnitType === BusinessUnitType.Hallmark
      ) {
        this.changeTab.emit(3);
        this.tabComponent.selectedItem = 3;
      }
      //All invoices tab navigation for agency
      if (user?.businessUnitType === BusinessUnitType.Agency) {
        this.changeTab.emit(1);
        this.tabComponent.selectedItem = 1;
      }
      window.localStorage.setItem('alertTitle', JSON.stringify(''));
    }
    if (
      AlertIdEnum[AlertIdEnum['Time Sheet: Org. Approved']].trim().toLowerCase() == this.alertTitle.trim().toLowerCase()
    ) {
      //Pending invoice record tab navigation for organization
      if (user?.businessUnitType === BusinessUnitType.Organization) {
        this.changeTab.emit(0);
        this.tabComponent.selectedItem = 0;
      }
      window.localStorage.setItem('alertTitle', JSON.stringify(''));
    }
    if (
      AlertIdEnum[AlertIdEnum['Manual Invoice: Pending Approval']].trim().toLowerCase() ==
      this.alertTitle.trim().toLowerCase()
    ) {
      //Manual Invoice Pending tab navigation for orgnization
      if (user?.businessUnitType === BusinessUnitType.Organization) {
        this.changeTab.emit(1);
        this.tabComponent.selectedItem = 1;
      }
      window.localStorage.setItem('alertTitle', JSON.stringify(''));
    }
    this.asyncRefresh();

    this.getTabsWidth();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.ResizeContentService.detachResizeObservable();
  }

  public onSelect(selectEvent: SelectingEventArgs): void {
    this.changeTab.emit(selectEvent.selectingIndex);
  }

  public tabsCreated(): void {
    this.tabsComponentCreated$.next(true);
  }

  public setTabVisibility(tabIndex: number, shown: boolean): void {
    if (shown) {
      this.showTab(tabIndex);
    } else {
      this.hideTab(tabIndex);
    }
  }

  public trackBy(_: number, item: TabsListConfig): string {
    return item.title;
  }

  public preselectTab(idx: number): void {
    this.tabComponent.selectedItem = idx;
    this.tabComponent.refreshActiveTab();
  }

  private hideTab(index: number): void {
    this.tabsComponentCreated$
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.tabComponent.hideTab(index, true);
        this.asyncRefresh();
      });
  }

  private showTab(index: number): void {
    this.tabsComponentCreated$
      .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.tabComponent.hideTab(index, false);
        this.asyncRefresh();
      });
  }

  @OutsideZone
  private asyncRefresh(): void {
    setTimeout(() => {
      this.tabComponent.refreshActiveTabBorder();
    });
  }

  private getTabsWidth(): void {
    this.ResizeContentService.initResizeObservable()
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe();
    this.tabsWidth$ = this.ResizeContentService.getContainerWidth();
  }
}
