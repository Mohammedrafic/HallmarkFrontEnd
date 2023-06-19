import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  Output,
  ViewChild,
} from '@angular/core';
import { OutsideZone } from '@core/decorators';

import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { TabConfig } from '@client/candidates/interface';
import { OrderManagementIRPTabsIndex } from '@shared/enums/order-management-tabs.enum';
import { GlobalWindow } from '@core/tokens';

@Component({
  selector: 'app-tabs-list',
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsListComponent implements AfterViewInit {
  @ViewChild('timesheetTabs') tab: TabComponent;

  @Input()
  public tabConfig: TabsListConfig[] | TabConfig[];

  @Output()
  public readonly changeTab: EventEmitter<number> = new EventEmitter<number>();

  constructor(private readonly ngZone: NgZone,  
  @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,) {}

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
}
