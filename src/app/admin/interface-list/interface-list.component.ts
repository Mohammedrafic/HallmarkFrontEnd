import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Input, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { InterfaceListFilter, InterfaceListModel, InterfaceListPage } from './models/InterfaceListModel';
import { GetInterfaceList, GetInterfaceListPage } from '../store/integrations.actions';
import { IntegrationsState } from '../store/integrations.state';
import { IntegrationFilterDto } from '../../shared/models/integrations.model';
import { SetHeaderState } from '../../store/app.actions';
import { GridComponent, PagerComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { AbstractPermissionGrid } from '../../shared/helpers/permissions/abstract-permission-grid';

@Component({
  selector: 'app-interface-list',
  templateUrl: './interface-list.component.html',
  styleUrls: ['./interface-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterfaceListComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  constructor(protected override store: Store) {
    super(store);
    this.store.dispatch(new SetHeaderState({ title: 'Interface List', iconName: 'file-text' }));
  }
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false = true;
  @Input() public description: string;

  public filters: InterfaceListFilter = {
    pageNumber: this.currentPage,
    pageSize: this.pageSizePager,
  };

  @Select(IntegrationsState.getInterfaceListPage)
  InterfaceListData$: Observable<InterfaceListPage>;

  override ngOnInit(): void {
    this.getInterfaceList();
    this.watchForPaging();
  }
  private getInterfaceList() {
    this.filters.orderBy = this.orderBy;
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSize;
    this.filters.getAll = false;
    this.store.dispatch([new GetInterfaceListPage(this.filters)]);
  }
  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }
  changePage(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }
  onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }
  public override updatePage(): void {
    this.getInterfaceList();
  }
  changeRowsPerPage(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }
  private watchForPaging(): void {
    this.pageSubject
      .pipe(
        throttleTime(100),
        takeUntil(this.unsubscribe$),
      ).subscribe((page) => {
        this.currentPage = page;
        this.getInterfaceList();
      });
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
