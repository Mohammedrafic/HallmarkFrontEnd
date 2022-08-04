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
  public reportName: LogiReportFileDetails = { name: "/POC/1st_dashboard.dsh" };
  public catelogName: LogiReportFileDetails = { name: "/POC/POC.cat" };
  public resultList: LogiReportFileDetails[] = [
    { name: "/POC - 1st_dashboard.dsh" }
  ];
  public title: string = "Dashboard";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;

  constructor(store: Store) {
    store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }
}



