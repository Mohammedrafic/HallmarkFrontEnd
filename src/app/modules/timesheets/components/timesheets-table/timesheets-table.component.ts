import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input, OnInit,
  Output,
  ViewChild
} from '@angular/core';

import { SelectionSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';

import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { MoreMenuType, TIMETHEETS_STATUSES } from '../../enums';
import { ITimesheet, ITimesheetsColumnWidth } from '../../interface';
import {
  moreMenuWithClose,
  moreMenuWithDelete,
  ROW_HEIGHT,
  tableSelectionModel, TIMESHEETS_GRID_CONFIG,
  timesheetsTableColumnWidth
} from '../../constants/timesheets-table.constant';
import { Actions } from '@ngxs/store';

@Component({
  selector: 'app-timesheets-table',
  templateUrl: './timesheets-table.component.html',
  styleUrls: ['./timesheets-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  @Output() timesheetRowSelected: EventEmitter<number> =  new EventEmitter<number>();

  public allowWrap = TIMESHEETS_GRID_CONFIG.isWordWrappingEnabled;
  public wrapSettings: TextWrapSettingsModel = TIMESHEETS_GRID_CONFIG.wordWrapSettings;
  public selectionOptions: SelectionSettingsModel = tableSelectionModel;
  public isLockMenuButtonsShown = false;
  public moreMenuWithDeleteButton: ItemModel[] = moreMenuWithDelete;
  public moreMenuWithCloseButton: ItemModel[] = moreMenuWithClose;
  public timesheetsTableColumnWidth: ITimesheetsColumnWidth = timesheetsTableColumnWidth;
  public TIMESHEETS_STATUSES = TIMETHEETS_STATUSES;

  constructor() {
    super();
  }

  public onRowClick(event: any): void {
    if (!event.isInteracted) {
      this.timesheetRowSelected.emit(event.rowIndex);
    }
  }

  public onRowScaleUpClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_UP_HEIGHT;
  }

  public onRowScaleDownClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_DOWN_HEIGHT;
  }

  public menuOptionSelected(event: any, data: ITimesheet): void {
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
