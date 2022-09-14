import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-fillrate',
  templateUrl: './fillrate.component.html',
  styleUrls: ['./fillrate.component.scss']
})
export class FillRateComponent {
  public paramsData: any = {};
  public reportName: LogiReportFileDetails = { name: "/JobDetails/JobDetails.wls" };
  public catelogName: LogiReportFileDetails = { name: "/JobDetails/Dashbord.cat" };
  public resultList: LogiReportFileDetails[] = [
    { name: "/JobDetails - JobDetails.wls" }
  ];
  public title: string = "Fill Rate";
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;

  constructor(store: Store) {
    store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }
}



