import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
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
export class ProfileTimesheetTableComponent extends AbstractGridConfigurationComponent implements OnChanges {
  @ViewChild('profileTable') readonly profileTable: GridComponent;

  @Input() timeSheetsProfile: ProfileTimeSheetDetail[];

  @Input() tempProfile: any;

  @Output() openAddSideDialog: EventEmitter<number> = new EventEmitter<number>();

  public override readonly allowPaging = false;

  public readonly tableHeight = 220;

  public readonly tableConfig = ProfileTimesheetTableConfig;

  tempData: any[];

  profileId: number;

  public initialSort = {
    columns: [
      { field: 'timeIn', direction: 'Ascending' },
    ],
  };

  constructor() {
    super();

  }

  ngOnChanges() {
    this.createTableData();
  }

  public editTimesheet(timesheet: ProfileTimeSheetDetail): void {}

  public deleteTimesheet(timesheet: ProfileTimeSheetDetail): void {}

  private createTableData(): void {
    let profile;
    const init = localStorage.getItem('profile');
    if (init) {
      profile = JSON.parse(init as string);
    } else {
      profile = {}
    }


    this.profileId = profile.id;
    this.tempData = [];
    const data = localStorage.getItem('timesheet-details-tables');
    let storageData;


    if (data) {
      storageData = JSON.parse(data)
    } else {
      storageData = {}
    }

    if (storageData && storageData[profile.id]) {
      this.tempData = storageData[profile.id];
    } else {
      let initDate: Date = new Date(profile.startDate);

      for (let i = 0; i < profile.totalDays; i++) {
        const tableItem = {
          id: 500 + i,
          day: new Date(initDate),
          timeIn: this.setInitTime(new Date(initDate)),
          timeOut: this.setEndOfday(new Date(initDate)),
          costCenter: '',
          category: 'Regular',
          hours: 8,
          rate: profile.billRate,
          total: profile.billRate * 8,
        };


        this.tempData.push(tableItem)
        initDate = new Date(initDate.setDate(initDate.getDate() + 1));
      }
      const storageItem = {
        [profile.id]: this.tempData,
      };

      localStorage.setItem('timesheet-details-tables', JSON.stringify({
        ...storageData,
        ...storageItem,
      }));
    }

  }

  private setInitTime(time: Date) {
    const clonedDate = new Date(time.getTime());
    clonedDate.setHours(8, 0, 0);
    return clonedDate;
  }

  private setEndOfday(time: Date) {
    const clonedDate = new Date(time.getTime());
    clonedDate.setHours(17, 0,  0);
    return clonedDate;
  }
}
