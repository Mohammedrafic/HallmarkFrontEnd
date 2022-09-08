import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, distinctUntilChanged, Observable, takeUntil, throttleTime } from 'rxjs';

import { RowNode } from '@ag-grid-community/core';
import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { GridReadyEventModel } from '@shared/components/grid/models/grid-ready-event.model';
import { BaseObservable, Destroyable } from '@core/helpers';

import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { TimesheetsSelectedRowEvent } from '../../interface';
import { TimesheetsColumnsDefinition } from '../../constants';
import { TimesheetsTableColumns } from '../../enums';

@Component({
  selector: 'app-timesheets-table',
  templateUrl: './timesheets-table.component.html',
  styleUrls: ['./timesheets-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsTableComponent extends Destroyable implements OnInit, OnChanges {
  @Input() tableData: TimeSheetsPage;

  @Input() newSelectedIndex: null | number;

  @Input() activeTabIdx: number;

  @Output() readonly changePage: EventEmitter<number> = new EventEmitter<number>();

  @Output() readonly changePerPage: EventEmitter<number> = new EventEmitter<number>();

  @Output() readonly sortHandler: EventEmitter<string> = new EventEmitter<string>();

  @Output() readonly timesheetRowSelected: EventEmitter<TimesheetsSelectedRowEvent>
  = new EventEmitter<TimesheetsSelectedRowEvent>();

  @Output() readonly bulkApproveEmitter: EventEmitter<RowNode[]> = new EventEmitter<RowNode[]>();

  @Output() readonly bulkExportEmitter: EventEmitter<RowNode[]> = new EventEmitter<RowNode[]>();

  public readonly columnDefinitions: ColumnDefinitionModel[] =
    TimesheetsColumnsDefinition(this.router.url.includes('agency'));
  public currentPageSubj: BaseObservable<number> = new BaseObservable<number>(1);
  public currentPage$: Observable<number> = this.currentPageSubj.getStream();
  public pageSize = 30;
  public isLoading = false;
  public isAgency = false;
  public rowSelection: 'single' | 'multiple' = 'multiple';

  private readonly gridInstance$: BehaviorSubject<GridReadyEventModel | null> =
    new BehaviorSubject<GridReadyEventModel | null>(null);

  constructor(
    private router: Router,
  ) {
    super();

    this.isAgency = this.router.url.includes('agency');
  }

  ngOnInit(): void {
    this.startCurrentPageWatching();
  }

  ngOnChanges(): void {
    this.columnVisibility();
    this.resetSelectedRows();
  }

  public onRowsDropDownChanged(pageSize: number): void {
    this.pageSize = pageSize;
    this.changePerPage.emit(pageSize);
  }

  public onGoToClick(pageNumber: number): void {
    this.currentPageSubj.set(pageNumber);
  }

  public selectedRow(event: TimesheetsSelectedRowEvent): void {
    this.timesheetRowSelected.emit(event);
  }

  public gridReady(event: GridReadyEventModel): void {
    this.gridInstance$.next(event);
  }

  private resetSelectedRows(): void {
    this.gridInstance$.getValue()?.api.forEachNode((node) => {
      node.setSelected(false);
    });
  }

  private columnVisibility(): void {
    this.gridInstance$.getValue()?.columnApi
      .setColumnVisible(
        TimesheetsTableColumns.Approve,
        !this.isAgency && this.activeTabIdx === 1
      );
  }

  private startCurrentPageWatching(): void {
    this.currentPage$.pipe(
      distinctUntilChanged(),
      throttleTime(100),
      takeUntil(this.componentDestroy())
    ).subscribe((pageNumber) => {
      this.changePage.emit(pageNumber);
    });
  }
}
