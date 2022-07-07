import { Router } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';

import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';

import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { MoreMenuType, TIMETHEETS_STATUSES } from '../../enums';
import { ITimesheetsColumnWidth, TableSettingsConfig, Timesheet, TimesheetsSelectedRowEvent } from '../../interface';
import { ROW_HEIGHT, TableSettings, timesheetsTableColumnWidth } from '../../constants';

@Component({
  selector: 'app-timesheets-table',
  templateUrl: './timesheets-table.component.html',
  styleUrls: ['./timesheets-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsTableComponent extends AbstractGridConfigurationComponent {
  @ViewChild('grid') grid: GridComponent;

  @Input() tableData: TimeSheetsPage;

  @Input() set changeTableItem(next: number | null) {
    if (next !== null) {
      this.grid.selectRow(next);
    }
  };

  @Output() changePage: EventEmitter<number> = new EventEmitter<number>();

  @Output() changePerPage: EventEmitter<number> = new EventEmitter<number>();

  @Output() sortHandler: EventEmitter<string> = new EventEmitter<string>();

  @Output() timesheetRowSelected: EventEmitter<TimesheetsSelectedRowEvent> = new EventEmitter<TimesheetsSelectedRowEvent>();

  public tableSettings: TableSettingsConfig = TableSettings;

  public timesheetsTableColumnWidth: ITimesheetsColumnWidth = timesheetsTableColumnWidth;

  public TIMESHEETS_STATUSES = TIMETHEETS_STATUSES;

  public isAgency: boolean;

  constructor(
    private router: Router,
  ) {
    super();

    this.isAgency = this.router.url.includes('agency');
  }

  public onRowClick(event: TimesheetsSelectedRowEvent): void {
    if (!event.isInteracted) {
      this.timesheetRowSelected.emit(event);
    }
  }

  public onRowScaleUpClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_UP_HEIGHT;
  }

  public onRowScaleDownClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_DOWN_HEIGHT;
  }

  public menuOptionSelected(event: any, data: Timesheet): void {
    switch (event.item.properties.text) {
      case MoreMenuType.Edit: {
        break;
      }
      case MoreMenuType.Duplicate: {
        break;
      }
      case MoreMenuType.Close: {
        break;
      }
      case MoreMenuType.Delete: {
        break;
      }
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.changePerPage.emit(this.pageSize);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.currentPage = event.currentPage || event.value;
      this.changePage.emit(this.currentPage);
    }
  }
}
