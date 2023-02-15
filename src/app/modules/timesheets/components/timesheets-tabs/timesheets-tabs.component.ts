import {
  ChangeDetectionStrategy, Component, EventEmitter,
  Input, NgZone, OnChanges, Output, SimpleChanges, ViewChild,Inject
} from '@angular/core';

import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { Destroyable } from '@core/helpers';
import { OutsideZone } from '@core/decorators';
import { TabConfig } from '../../interface';
import { AlertIdEnum } from '@admin/alerts/alerts.enum';
import { GlobalWindow } from '@core/tokens';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-timesheets-tabs',
  templateUrl: './timesheets-tabs.component.html',
  styleUrls: ['./timesheets-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsTabsComponent extends Destroyable implements OnChanges{
  @ViewChild(TabComponent)
  public tabComponent: TabComponent;

  @Input()
  public tabConfig: TabConfig[];

  @Input()
  public isDisabled: boolean = false;

  @Output()
  public readonly changeTab: EventEmitter<number> = new EventEmitter<number>();
  public alertTitle: string;
  public orgwidgetpendingtimesheet: string;

  constructor(
    @Inject(GlobalWindow)protected readonly globalWindow: WindowProxy & typeof globalThis,
    private readonly ngZone: NgZone,
    @Inject(DOCUMENT) private document: Document,
  ) {
    super();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.tabConfig) {
      this.asyncRefresh();
      this.navigatingTab();
    }
    this.getalerttitle();
    this.navigatetopendingtimesheet();
  }

  public getalerttitle(): void {
    this.alertTitle = JSON.parse(localStorage.getItem('alertTitle') || '""') as string; 
  }

  public trackBy(_: number, item: TabsListConfig): string {
    return item.title;
  }

  public programSelection(idx = 0): void {
    this.tabComponent.select(idx);
  }

  public onSelect(selectEvent: SelectingEventArgs): void {
    this.changeTab.emit(selectEvent.selectingIndex);
  }

  @OutsideZone
  private asyncRefresh(): void {
    setTimeout(() => {
      this.tabComponent.refreshActiveTabBorder();
    });
  }
  @OutsideZone
  private navigatetopendingtimesheet(): void {
    setTimeout(() => {
      this.orgwidgetpendingtimesheet = JSON.parse(localStorage.getItem('orgpendingwidget') || '""') as string;
       if(this.orgwidgetpendingtimesheet === "Pending Timesheet") {
         this.tabComponent.selectedItem=1;
         this.changeTab.emit(1);
         this.globalWindow.localStorage.setItem("orgpendingwidget", JSON.stringify(""));
       }
   }, 1000);
  }
  @OutsideZone
  private navigatingTab():void{
    setTimeout(() => {
      this.getalerttitle();
    if (AlertIdEnum[AlertIdEnum['Time Sheet: Org. pending approval']].toLowerCase() == this.alertTitle.toLowerCase()) {
        this.tabComponent.selectedItem = 1;
        this.changeTab.emit(1);
        this.document.defaultView?.localStorage.setItem("alertTitle", JSON.stringify(""));
    }
    if (AlertIdEnum[AlertIdEnum['Time Sheet: Rejected']].toLowerCase() == this.alertTitle.toLowerCase()) {
        this.tabComponent.selectedItem = 3;
        this.changeTab.emit(3);
        this.document.defaultView?.localStorage.setItem("alertTitle", JSON.stringify(""));
    }
    },5000);
  }
}
