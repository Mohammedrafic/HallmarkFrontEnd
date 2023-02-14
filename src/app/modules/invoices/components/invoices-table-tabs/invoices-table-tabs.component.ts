import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input, NgZone,
  Output,
  Inject,
  ViewChild,
} from '@angular/core';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { BehaviorSubject, filter, takeUntil } from 'rxjs';
import { Destroyable } from '@core/helpers';
import { OutsideZone } from '@core/decorators';
import { AlertIdEnum } from '@admin/alerts/alerts.enum';
import { Store } from '@ngxs/store';
import { UserState } from 'src/app/store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GlobalWindow } from "@core/tokens";

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
  public alertTitle: string
  public orgwidgetpendinginvoice:string;
  constructor(
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
    private readonly ngZone: NgZone,
    private store: Store
  ) {
    super();
  }


  public ngAfterViewInit(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.getalerttitle();
    if ((AlertIdEnum[AlertIdEnum['Invoice: Organization Paid']].trim()).toLowerCase() == (this.alertTitle.trim()).toLowerCase()) {
      if (user?.businessUnitType === BusinessUnitType.Organization || user?.businessUnitType === BusinessUnitType.Hallmark) {
        this.changeTab.emit(4);
        this.tabComponent.selectedItem = 4
        this.globalWindow.localStorage.setItem("alertTitle", JSON.stringify(""));
      }
    }
    if ((AlertIdEnum[AlertIdEnum['Invoice: Approved']].trim()).toLowerCase() == (this.alertTitle.trim()).toLowerCase()) {
      if (user?.businessUnitType === BusinessUnitType.Organization || user?.businessUnitType === BusinessUnitType.Hallmark) {
        this.changeTab.emit(3);
        this.tabComponent.selectedItem = 3;
      }
      if (user?.businessUnitType === BusinessUnitType.Agency) {
        this.changeTab.emit(1);
        this.tabComponent.selectedItem = 1;
      }
      this.globalWindow.localStorage.setItem("alertTitle", JSON.stringify(""));
    }
    if ((AlertIdEnum[AlertIdEnum['Time Sheet: Org. Approved']].trim()).toLowerCase() == (this.alertTitle.trim()).toLowerCase()) {
      if (user?.businessUnitType === BusinessUnitType.Organization) {
        this.changeTab.emit(0);
        this.tabComponent.selectedItem = 0;
      }
      this.globalWindow.localStorage.setItem("alertTitle", JSON.stringify(""));
    }
    if ((AlertIdEnum[AlertIdEnum['Manual Invoice: Pending Approval']].trim()).toLowerCase() == (this.alertTitle.trim()).toLowerCase()) {
      if (user?.businessUnitType === BusinessUnitType.Organization) {
        this.changeTab.emit(1);
        this.tabComponent.selectedItem = 1;
      }
      this.globalWindow.localStorage.setItem("alertTitle", JSON.stringify(""));
    }
    this.pendinginvoicenavigation();
    this.asyncRefresh();
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

  public getalerttitle(): void {
    this.alertTitle = JSON.parse(localStorage.getItem('alertTitle') || '""') as string;
  }

  private hideTab(index: number): void {
    this.tabsComponentCreated$
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.tabComponent.hideTab(index, true);
        this.asyncRefresh();
      });
  }

  private showTab(index: number): void {
    this.tabsComponentCreated$
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      )
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
  private pendinginvoicenavigation(): void {
    setTimeout(() => {
      this.orgwidgetpendinginvoice = JSON.parse(localStorage.getItem('orgmanualinvoicewidget') || '""') as string;
       if(this.orgwidgetpendinginvoice === "ManualInvoice") {
         this.tabComponent.selectedItem=1;
         this.changeTab.emit(1);
         this.globalWindow.localStorage.setItem("orgmanualinvoicewidget", JSON.stringify(""));
       }
    }, 2000);
  }
}
