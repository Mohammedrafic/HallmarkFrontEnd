import { Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from "rxjs";

import { Select } from "@ngxs/store";
import { AppState } from "../../../../store/app.state";
import { IsOrganizationAgencyAreaStateModel } from "@shared/models/is-organization-agency-area-state.model";
import { CandidateInfo, CandidateInfoUIItem } from "../../interface";

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
  public jobData: CandidateInfo | null;

  @Select(AppState.isOrganizationAgencyArea)
  public readonly isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

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

  private getUIItems(data: CandidateInfo): CandidateInfoUIItem[] {
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
        value: data.unitName,
      },
    ];
  }
}
