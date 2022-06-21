import { ChangeDetectionStrategy, Component, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';

import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ProfileTimeSheetDetail } from '../../store/model/timesheets.model';


@Component({
  selector: 'app-profile-timesheet-table',
  templateUrl: './profile-timesheet-table.component.html',
  styleUrls: ['./profile-timesheet-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileTimesheetTableComponent extends AbstractGridConfigurationComponent implements OnChanges {
  @ViewChild('profileTable') profileTable: GridComponent;

  @Input() timeSheetsProfile: ProfileTimeSheetDetail[];

  public override readonly allowPaging = false;

  public initialSort = {
    columns: [
      { field: 'timeIn', direction: 'Ascending' },
    ],
  };

  constructor() {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.timeSheetsProfile)
  }
  public editTimesheet(timesheet: ProfileTimeSheetDetail): void {}
}
