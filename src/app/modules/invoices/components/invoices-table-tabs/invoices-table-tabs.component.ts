import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input, NgZone,
  Output,
  ViewChild
} from '@angular/core';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { BehaviorSubject, filter, takeUntil } from 'rxjs';
import { Destroyable } from '@core/helpers';

@Component({
  selector: 'app-invoices-table-tabs',
  templateUrl: './invoices-table-tabs.component.html',
  styleUrls: ['./invoices-table-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesTableTabsComponent extends Destroyable implements AfterViewInit {
  private readonly tabsComponentCreated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  @Input()
  public tabConfig: TabsListConfig[];

  @Output()
  public readonly changeTab: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild(TabComponent)
  public tabComponent: TabComponent;

  constructor(
    private readonly ngZone: NgZone,
  ) {
    super();
  }

  public ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => setTimeout(() => this.tabComponent.refreshActiveTabBorder()));
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

  private refreshTabsBorder(): void {
    setTimeout(() => this.tabComponent.refreshActiveTabBorder());
  }

  private hideTab(index: number): void {
    this.tabsComponentCreated$
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.tabComponent.hideTab(index, true);
        this.refreshTabsBorder();
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
        this.refreshTabsBorder();
      });
  }
}
