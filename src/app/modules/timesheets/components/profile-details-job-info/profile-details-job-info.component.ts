import { Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Select } from "@ngxs/store";
import { AppState } from "../../../../store/app.state";
import { map, Observable } from "rxjs";
import { IsOrganizationAgencyAreaStateModel } from "@shared/models/is-organization-agency-area-state.model";

interface JobData {
  jobTitle: string;
  location: string;
  department: string;
  skill: string;
  startDate: string;
  endDate: string;
  agency: string;
  orgName?: string;
}

interface JobInfoUIItem {
  icon: string;
  value: unknown;
  title: string;
}

@Component({
  selector: 'app-profile-details-job-info',
  templateUrl: './profile-details-job-info.component.html',
  styleUrls: ['./profile-details-job-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsJobInfoComponent implements OnChanges {
  public items: JobInfoUIItem[] = [];

  @Input() jobData;

  isAgency: boolean;

  @Select(AppState.isOrganizationAgencyArea)
  public readonly isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  constructor(
    private datePipe: DatePipe,
    private router: Router,
  ) {
    let data;
    if (localStorage.getItem('profile')) {
      data = JSON.parse(localStorage.getItem('profile') as string);
      this.jobData = {
        jobTitle: data.jobTitle,
        location: data.location,
        department: data.department,
        skill: data.skill,
        startDate: data.startDate,
        endDate: data.endDate,
        agency: 'AB Staffing',
      };
    }

    this.isAgency = this.router.url.includes('agency');
  }

  ngOnChanges(): void {
    if (this.jobData) {
      this.items = this.getUIItems(this.jobData);
    }
  }

  public trackByTitle(_: number, item: JobInfoUIItem): string {
    return item.title;
  }

  private getUIItems(data: JobData): JobInfoUIItem[] {
    return [
      {
        title: 'Job Title',
        icon: 'user',
        value: data.jobTitle,
      },
      {
        title: 'Region / Location',
        icon: 'map-pin',
        value: data.location,
      },
      {
        title: 'Department',
        icon: 'folder',
        value: data.department,
      },
      {
        title: 'Skill',
        icon: 'folder',
        value: data.skill,
      },
      {
        title: 'Start - End Date',
        icon: 'calendar',
        value: `${this.datePipe.transform(data.startDate, 'MM/d/y')} - ${this.datePipe.transform(data.endDate, 'MM/d/y')}`,
      },
      {
        title: !this.isAgency ? 'Agency' : 'Organization',
        icon: 'briefcase',
        value: data.orgName,
      },
    ]
  }
}
