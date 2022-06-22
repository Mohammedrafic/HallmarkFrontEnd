import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';

import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { Store } from '@ngxs/store';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ProfileTimeSheetDetail } from '../../store/model/timesheets.model';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { ProfileTimeSheetActionType } from '../../enums/timesheets.enum';


@Component({
  selector: 'app-profile-timesheet-table',
  templateUrl: './profile-timesheet-table.component.html',
  styleUrls: ['./profile-timesheet-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ProfileTimesheetTableComponent extends AbstractGridConfigurationComponent {
  @ViewChild('profileTable') readonly profileTable: GridComponent;

  @Input() timeSheetsProfile: ProfileTimeSheetDetail[];

  public override readonly allowPaging = false;

  public readonly tableHeight = 304;

  public initialSort = {
    columns: [
      { field: 'timeIn', direction: 'Ascending' },
    ],
  };

  constructor(
    private store: Store,
  ) {
    super();
  }

  public editTimesheet(timesheet: ProfileTimeSheetDetail): void {
    this.store.dispatch(new Timesheets.OpenProfileTimesheetEditDialog(
      ProfileTimeSheetActionType.Edit,
      timesheet,
      ));
  }

  public deleteTimesheet(timesheet: ProfileTimeSheetDetail): void {}
}
