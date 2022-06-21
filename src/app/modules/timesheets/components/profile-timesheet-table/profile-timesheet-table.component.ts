import { ChangeDetectionStrategy, Component, Input, ViewChild, OnInit, SimpleChanges } from '@angular/core';

import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ProfileTimeSheetDetail } from '../../store/model/timesheets.model';


@Component({
  selector: 'app-profile-timesheet-table',
  templateUrl: './profile-timesheet-table.component.html',
  styleUrls: ['./profile-timesheet-table.component.scss'],

})
export class ProfileTimesheetTableComponent extends AbstractGridConfigurationComponent {
  @ViewChild('profileTable') readonly profileTable: GridComponent;

  @Input() timeSheetsProfile: ProfileTimeSheetDetail[];

  public override readonly allowPaging = false;

  public readonly tableHeight = 360;

  public initialSort = {
    columns: [
      { field: 'timeIn', direction: 'Ascending' },
    ],
  };

  constructor() {
    super();
  }

  public editTimesheet(timesheet: ProfileTimeSheetDetail): void {}
}
