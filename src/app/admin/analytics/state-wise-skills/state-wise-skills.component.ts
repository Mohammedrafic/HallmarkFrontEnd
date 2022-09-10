import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-state-wise-skills',
  templateUrl: './state-wise-skills.component.html',
  styleUrls: ['./state-wise-skills.component.scss']
})
export class StateWiseSkillsComponent {
  public paramsData: any = {};
  public reportName: LogiReportFileDetails = { name: "/JobDetails/JobDetails.wls" };
  public catelogName: LogiReportFileDetails = { name: "/JobDetails/Dashbord.cat" };
  public resultList: LogiReportFileDetails[] = [
    { name: "/JobDetails - JobDetails.wls" }
  ];
  public title: string = "Dashboard";
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;

  constructor(store: Store) {
    store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }
}



