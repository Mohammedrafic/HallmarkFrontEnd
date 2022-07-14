import { Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { DatePipe } from '@angular/common';

import { CandidateInfoUIItem, TimesheetDetailsModel } from "../../interface";

@Component({
  selector: 'app-profile-details-job-info',
  templateUrl: './profile-details-job-info.component.html',
  styleUrls: ['./profile-details-job-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsJobInfoComponent implements OnChanges {
  public items: CandidateInfoUIItem[] = [];

  public isAgency: boolean;

  @Input()
  public jobData: TimesheetDetailsModel | null;

  constructor(
    private datePipe: DatePipe,
    private router: Router,
  ) {
    this.isAgency = this.router.url.includes('agency');
  }

  public ngOnChanges(): void {
    if (this.jobData) {
      this.items = this.getUIItems(this.jobData);
    }
  }

  public trackByTitle(_: number, item: CandidateInfoUIItem): string {
    return item.title;
  }

  private getUIItems(data: TimesheetDetailsModel): CandidateInfoUIItem[] {
    return [
      {
        title: 'Job Title',
        icon: 'user',
        value: data.orderTitle,
      },
      {
        title: 'Region / Location',
        icon: 'map-pin',
        value: data.orderLocationName,
      },
      {
        title: 'Department',
        icon: 'folder',
        value: data.orderDepartmentName,
      },
      {
        title: 'Skill',
        icon: 'folder',
        value: data.orderSkillAbbreviation,
      },
      {
        title: 'Start - End Date',
        icon: 'calendar',
        value: `${this.datePipe.transform(data.jobStartDate, 'MM/d/y')} - ${this.datePipe.transform(data.jobEndDate, 'MM/d/y')}`,
      },
      {
        title: !this.isAgency ? 'Agency' : 'Organization',
        icon: 'briefcase',
        value: this.isAgency ? data.agencyName : data.organizationName,
      },
    ];
  }
}
