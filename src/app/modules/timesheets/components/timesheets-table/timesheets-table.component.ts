import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';

import { SelectionSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ORDERS_GRID_CONFIG } from '@client/client.config';

import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { TIMETHEETS_STATUSES } from '../../enums/timesheets.enum';
import { ITimesheet } from '../../interface/i-timesheet.interface';

const ROW_HEIGHT = {
  SCALE_UP_HEIGHT: 140,
  SCALE_DOWN_HEIGHT: 64
}

enum MoreMenuType {
  'Edit',
  'Duplicate',
  'Close',
  'Delete'
}

@Component({
  selector: 'app-timesheets-table',
  templateUrl: './timesheets-table.component.html',
  styleUrls: ['./timesheets-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimesheetsTableComponent extends AbstractGridConfigurationComponent {
  @ViewChild('grid') grid: GridComponent;

  @Input() tableData: TimeSheetsPage;

  @Output() changePage: EventEmitter<number> = new EventEmitter<number>();
  @Output() changePerPage: EventEmitter<number> = new EventEmitter<number>();
  @Output() sortHandler: EventEmitter<string> = new EventEmitter<string>();
  @Output() timesheetRowSelected: EventEmitter<void> =  new EventEmitter();

  public allowWrap = ORDERS_GRID_CONFIG.isWordWrappingEnabled;
  public selectionOptions: SelectionSettingsModel = { type: 'Single', mode: 'Row', checkboxMode: 'ResetOnRowClick' };
  public wrapSettings: TextWrapSettingsModel = ORDERS_GRID_CONFIG.wordWrapSettings;
  public isLockMenuButtonsShown = false;
  public moreMenuWithDeleteButton: ItemModel[] = [
    { text: MoreMenuType[0], id: '0' },
    { text: MoreMenuType[1], id: '1' },
    { text: MoreMenuType[3], id: '3' }
  ];
  public moreMenuWithCloseButton: ItemModel[] = [
    { text: MoreMenuType[0], id: '0' },
    { text: MoreMenuType[1], id: '1' },
    { text: MoreMenuType[2], id: '2' }
  ];
  public TIMESHEETS_STATUSES = TIMETHEETS_STATUSES;

  constructor() {
    super();
  }

  public onRowClick(event: any): void {
    if (!event.isInteracted) {
      this.timesheetRowSelected.emit();
    }
  }

  public onRowScaleUpClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_UP_HEIGHT;
  }

  public onRowScaleDownClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_DOWN_HEIGHT;
  }

  public menuOptionSelected(event: any, data: ITimesheet): void {
    switch (Number(event.item.properties.id)) {
      case MoreMenuType['Edit']: {
        break;
      }
      case MoreMenuType['Duplicate']: {
        break;
      }
      case MoreMenuType['Close']: {
        break;
      }
      case MoreMenuType['Delete']: {
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
