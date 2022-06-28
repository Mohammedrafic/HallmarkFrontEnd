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

import { ProfileTimeSheetDetail } from '../../store/model/timesheets.model';
import { ProfileTimesheetTableConfig } from '../../constants';


@Component({
  selector: 'app-profile-timesheet-table',
  templateUrl: './profile-timesheet-table.component.html',
  styleUrls: ['./profile-timesheet-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ProfileTimesheetTableComponent extends AbstractGridConfigurationComponent {
  @ViewChild('profileTable') readonly profileTable: GridComponent;

  @Input() timeSheetsProfile: ProfileTimeSheetDetail[];

  @Output() openAddSideDialog: EventEmitter<void> = new EventEmitter<void>();

  public override readonly allowPaging = false;

  public readonly tableHeight = 260;

  public readonly tableConfig = ProfileTimesheetTableConfig;

  public initialSort = {
    columns: [
      { field: 'timeIn', direction: 'Ascending' },
    ],
  };

  constructor() {
    super();
  }

  public editTimesheet(timesheet: ProfileTimeSheetDetail): void {}

  public deleteTimesheet(timesheet: ProfileTimeSheetDetail): void {}
}
