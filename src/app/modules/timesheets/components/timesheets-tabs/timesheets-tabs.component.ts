import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,Inject,
  OnInit,
  ViewContainerRef,
  TemplateRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Observable, takeUntil, filter, distinctUntilChanged, debounceTime } from 'rxjs';
import { Select } from '@ngxs/store';

import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { OutsideZone } from '@core/decorators';
import { TabConfig, TabCountConfig } from '../../interface';
import { AlertIdEnum } from '@admin/alerts/alerts.enum';
import { GlobalWindow } from '@core/tokens';
import { Destroyable, isObjectsEqual } from '@core/helpers';
import { ResizeContentService } from '@shared/services/resize-main-content.service';
import { TimesheetsState } from '../../store/state/timesheets.state';

@Component({
  selector: 'app-timesheets-tabs',
  templateUrl: './timesheets-tabs.component.html',
  styleUrls: ['./timesheets-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsTabsComponent extends Destroyable implements OnChanges, OnInit {
  @ViewChild(TabComponent)
  public tabComponent: TabComponent;

  @ViewChild('outletRef', { read: ViewContainerRef })
  private outletContainerRef: ViewContainerRef;

  @ViewChild('tabsRef', { read: TemplateRef })
  private tabsTemplateRef: TemplateRef<HTMLElement>;

  @Input()
  public tabConfig: TabConfig[];

  @Input() public isDisabled = false;

  @Output()
  public readonly changeTab: EventEmitter<number> = new EventEmitter<number>();
  public alertTitle: string;
  public orgwidgetpendingtimesheet: string;
  public missingtimesheet: string;
  public tabsWidth$: Observable<string>;
  public selectedTab = 0;

  @Select(TimesheetsState.tabCounts) private tabsConfig$: Observable<TabCountConfig>;

  constructor(
    @Inject(GlobalWindow)protected readonly globalWindow: WindowProxy & typeof globalThis,
    private readonly ngZone: NgZone,
    @Inject(DOCUMENT) private document: Document,
    private ResizeContentService: ResizeContentService,
  ) {
    super();
    this.watchForTabConfig();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['tabConfig']) {
      this.navigatingTab();
      this.navigatetopendingtimesheet();
    }
  }

  public getalerttitle(): void {
    this.alertTitle = JSON.parse(localStorage.getItem('alertTitle') || '""') as string;
  }

  public ngOnInit(): void {
    this.getTabsWidth();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.ResizeContentService.detachResizeObservable();
  }

  public trackBy(_: number, item: TabsListConfig): string {
    return item.title;
  }

  public programSelection(idx = 0): void {
    this.tabComponent?.select(idx);
  }

  public onSelect(selectEvent: SelectingEventArgs): void {
    this.selectedTab = selectEvent.selectingIndex;
    this.changeTab.emit(selectEvent.selectingIndex);
  }

  @OutsideZone
  private navigatetopendingtimesheet(): void {
    setTimeout(() => {
      this.orgwidgetpendingtimesheet = JSON.parse(localStorage.getItem('orgpendingwidget') || '""') as string;
      this.missingtimesheet = JSON.parse(localStorage.getItem('timeSheetMissing') || '""') as string;
       if(this.orgwidgetpendingtimesheet === "Pending Timesheet") {
         this.tabComponent.selectedItem=1;
         this.changeTab.emit(1);
         this.globalWindow.localStorage.setItem("orgpendingwidget", JSON.stringify(""));
       }
       if(this.missingtimesheet === "Missing") {
        this.tabComponent.selectedItem=2;
        this.changeTab.emit(2);
        this.globalWindow.localStorage.setItem("timeSheetMissing", JSON.stringify(""));
      }
   }, 2500);
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
    if(AlertIdEnum[AlertIdEnum['Time Sheet: DNW']].toLowerCase() == this.alertTitle.toLowerCase()){
      this.tabComponent.selectedItem = 1;
      this.changeTab.emit(1);
      this.document.defaultView?.localStorage.setItem("alertTitle", JSON.stringify(""));
    }
    },10000);

  }

  private getTabsWidth(): void {
    this.ResizeContentService.initResizeObservable()
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe();
    this.tabsWidth$ = this.ResizeContentService.getContainerWidth();
  }

  private watchForTabConfig(): void {
    this.tabsConfig$.pipe(
      filter(() => !!this.outletContainerRef),
      distinctUntilChanged((prev, curr) => {
        return isObjectsEqual(
          prev as unknown as Record<string, unknown>,
          curr as unknown as Record<string, unknown>
        );
      }),
      takeUntil(this.componentDestroy())
    )
    .subscribe(() => {
      this.reRenderTabs();
    });
  }
  
  private reRenderTabs(): void {
    this.outletContainerRef.clear();
    this.outletContainerRef.createEmbeddedView(this.tabsTemplateRef);
  }
}
