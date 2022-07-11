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
import { TimesheetsGridConfig } from '../../constants';
import { TimesheetsTableColumns } from '../../enums';

@Component({
  selector: 'app-timesheets-table',
  templateUrl: './timesheets-table.component.html',
  styleUrls: ['./timesheets-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsTableComponent {
  @Input() tableData: TimeSheetsPage;

  @Input() set changeTableItem(next: number | null) {
    if (next !== null) {}
  };

  @Output() changePage: EventEmitter<number> = new EventEmitter<number>();

  @Output() changePerPage: EventEmitter<number> = new EventEmitter<number>();

  @Output() sortHandler: EventEmitter<string> = new EventEmitter<string>();

  @Output() timesheetRowSelected: EventEmitter<TimesheetsSelectedRowEvent> = new EventEmitter<TimesheetsSelectedRowEvent>();

  public currentPage = 1;
  public pageSize = 30;
  public readonly columnDefinitions: ColumnDefinitionModel[] = TimesheetsGridConfig;
  public isAgency: boolean;
  public isLoading = false;
  public rowSelection: 'single' | 'multiple' = 'single';

  private alreadySelected = false;

  constructor(
    private router: Router,
  ) {
    this.isAgency = this.router.url.includes('agency');

    this.columnDefinitions[9].field = this.isAgency ? TimesheetsTableColumns.OrgName : TimesheetsTableColumns.AgencyName;
    this.columnDefinitions[9].headerName = this.isAgency ? 'Org NAME' : 'Agency Name';
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
    this.alreadySelected = !this.alreadySelected;
    if (this.alreadySelected) {
      this.timesheetRowSelected.emit(event);
    }
  }
}
