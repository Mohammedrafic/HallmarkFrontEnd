import { Component, Input } from '@angular/core';

interface JobData {
  jobTitle: string;
  location: string;
  department: string;
  skill: string;
  startDate: string;
  endDate: string;
  agency: string;
}

@Component({
  selector: 'app-profile-details-job-info',
  templateUrl: './profile-details-job-info.component.html',
  styleUrls: ['./profile-details-job-info.component.scss']
})
export class ProfileDetailsJobInfoComponent {
  @Input()
  public jobData: JobData | null = {
    jobTitle: 'RN Surgery',
    location: 'Great Lakes / Defiance Hospital',
    department: 'Surgery - 9310',
    skill: 'CNA',
    startDate: '03/01/2022',
    endDate: '05/30/2022',
    agency: 'AB Staffing',
  };
}
