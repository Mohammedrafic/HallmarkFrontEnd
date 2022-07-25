import { Router } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';

import { RowNode } from '@ag-grid-community/core';

import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { TimesheetsSelectedRowEvent } from '../../interface';
import { TimesheetsColumnsDefinition } from '../../constants';
import { BehaviorSubject } from 'rxjs';
import { GridReadyEventModel } from '@shared/components/grid/models/grid-ready-event.model';
import { TimesheetsTableColumns } from '../../enums';

@Component({
  selector: 'app-timesheets-table',
  templateUrl: './timesheets-table.component.html',
  styleUrls: ['./timesheets-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsTableComponent implements OnChanges {
  @Input() tableData: TimeSheetsPage;

  @Input() newSelectedIndex: null | number;
  @Input() activeTabIdx: number;

  @Output() readonly changePage: EventEmitter<number> = new EventEmitter<number>();

  @Output() readonly changePerPage: EventEmitter<number> = new EventEmitter<number>();

  @Output() readonly sortHandler: EventEmitter<string> = new EventEmitter<string>();

  @Output() readonly timesheetRowSelected: EventEmitter<TimesheetsSelectedRowEvent>
  = new EventEmitter<TimesheetsSelectedRowEvent>();

  public readonly columnDefinitions: ColumnDefinitionModel[] =
    TimesheetsColumnsDefinition(this.router.url.includes('agency'));
  public currentPage = 1;
  public pageSize = 30;
  public isLoading = false;
  public rowSelection: 'single' | 'multiple' = 'multiple';

  private readonly gridInstance$: BehaviorSubject<GridReadyEventModel | null> =
    new BehaviorSubject<GridReadyEventModel | null>(null);

  constructor(
    private router: Router,
  ) {}

  ngOnChanges(): void {
    this.gridInstance$.getValue()?.columnApi
      .setColumnVisible(
        TimesheetsTableColumns.Approve,
        !this.router.url.includes('agency') && this.activeTabIdx === 1
      );
  }

  public onRowsDropDownChanged(pageSize: number): void {
    this.pageSize = pageSize;
    this.changePerPage.emit(pageSize);
  }

  public onGoToClick(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.changePage.emit(pageNumber);
  }

  public selectedRow(event: TimesheetsSelectedRowEvent): void {
    this.timesheetRowSelected.emit(event);
  }

  public bulkApprove(event: RowNode[]): void {
  }

  public bulkExport(event: RowNode[]): void {
  }

  public gridReady(event: GridReadyEventModel): void {
    this.gridInstance$.next(event);
  }
}
