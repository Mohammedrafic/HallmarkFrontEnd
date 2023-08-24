import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

import { Actions, ofActionDispatched } from '@ngxs/store';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { filter, takeUntil } from 'rxjs';


import { TabConfig } from '@client/candidates/interface';
import { SelectNavigationTab } from '@client/store/order-managment-content.actions';
import { OutsideZone } from '@core/decorators';
import { Destroyable } from '@core/helpers';
import { GlobalWindow } from '@core/tokens';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { OrderManagementIRPTabs, OrderManagementIRPTabsIndex } from '@shared/enums/order-management-tabs.enum';
import { NavigationTabModel } from '@shared/models/navigation-tab.model';

@Component({
  selector: 'app-tabs-list',
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsListComponent extends Destroyable implements OnInit, AfterViewInit  {
  @ViewChild('timesheetTabs') tab: TabComponent;

  @Input()
  public tabConfig: TabsListConfig[] | TabConfig[];

  @Output()
  public readonly changeTab: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private readonly ngZone: NgZone,  
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
    private actions$: Actions,
  ) {
    super();
  }

  ngOnInit(): void {
    this.listenTabChanges();
  }

  public ngAfterViewInit(): void {
    this.asyncRefresh();
  }

  public trackByFn(idx: number): number {
    return idx;
  }

  public onSelect(selectEvent: SelectingEventArgs): void {
    this.changeTab.emit(selectEvent.selectingIndex);
  }

  @OutsideZone
  private asyncRefresh(): void {
    setTimeout(() => {
      this.tab.refreshActiveTabBorder();
      this.navigatingTab();
    });
  }

  @OutsideZone
  private navigatingTab():void{
    setTimeout(() => {
      let isIrpEnabled=  JSON.parse(localStorage.getItem('ISIrpEnabled') || '"false"') as boolean; 
      if(isIrpEnabled==true){
        this.globalWindow.localStorage.setItem("ISIrpEnabled", JSON.stringify(""));
        this.globalWindow.localStorage.setItem("IsLTAOrders", JSON.stringify(true));
        this.changeTab.emit(OrderManagementIRPTabsIndex.Lta)
        this.tab.selectedItem = OrderManagementIRPTabsIndex.Lta;
      }
      let IRPActiveTab=  JSON.parse(localStorage.getItem('IRPActiveTab') || '"4"') as number; 
      if(IRPActiveTab<4){
        this.globalWindow.localStorage.setItem("IRPActiveTab", JSON.stringify("4"));
        this.changeTab.emit(IRPActiveTab)
        this.tab.selectedItem =IRPActiveTab;
      }
    }, 1000);
  }

  private listenTabChanges(): void {
    this.actions$
      .pipe(
        ofActionDispatched(SelectNavigationTab),
        filter(({ active }: NavigationTabModel) => !!active),
        takeUntil(this.componentDestroy())
      )
      .subscribe(({ active }: NavigationTabModel) => {
        const tabList = Object.values(OrderManagementIRPTabs);
        const index = tabList.findIndex((tabName: string) => tabName === active);
        this.tab.selectedItem = index;
      });
  }
}
