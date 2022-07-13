import { Router } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';

import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { TimesheetsSelectedRowEvent } from '../../interface';
import { TimesheetsColumnsDefinition } from '../../constants';
import { RowNode } from '@ag-grid-community/core';

@Component({
  selector: 'app-timesheets-table',
  templateUrl: './timesheets-table.component.html',
  styleUrls: ['./timesheets-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsTableComponent {
  @Input() tableData: TimeSheetsPage;
  @Input() newSelectedIndex: null | number;

  @Output() changePage: EventEmitter<number> = new EventEmitter<number>();

  @Output() changePerPage: EventEmitter<number> = new EventEmitter<number>();

  @Output() sortHandler: EventEmitter<string> = new EventEmitter<string>();

  @Output() timesheetRowSelected: EventEmitter<TimesheetsSelectedRowEvent> = new EventEmitter<TimesheetsSelectedRowEvent>();

  public readonly columnDefinitions: ColumnDefinitionModel[] =
    TimesheetsColumnsDefinition(this.router.url.includes('agency'));
  public currentPage = 1;
  public pageSize = 30;
  public isLoading = false;
  public rowSelection: 'single' | 'multiple' = 'multiple';

  constructor(
    private router: Router,
  ) {}

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
}
