import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

interface JobData {
  jobTitle: string;
  location: string;
  department: string;
  skill: string;
  startDate: string;
  endDate: string;
  agency: string;
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
export class ProfileDetailsJobInfoComponent {
  public items: JobInfoUIItem[] = [];

  @Input()
  public set jobData(value: JobData) {
    this.items = this.getUIItems(value);
  };

  constructor(
    private datePipe: DatePipe,
  ) {
    this.jobData = {
      jobTitle: 'RN Surgery',
      location: 'Great Lakes / Defiance Hospital',
      department: 'Surgery - 9310',
      skill: 'CNA',
      startDate: '03/01/2022',
      endDate: '05/30/2022',
      agency: 'AB Staffing',
    };
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
        title: 'Agency',
        icon: 'briefcase',
        value: data.agency,
      },
    ]
  }
}
