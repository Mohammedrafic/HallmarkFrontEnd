import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-candidate-stats',
  templateUrl: './candidate-stats.component.html',
  styleUrls: ['./candidate-stats.component.scss']
})
export class CandidateStatsComponent {
  public paramsData: any = {
    "pState": "CA",
    "pWeek#": "1"
  };
  public reportName: LogiReportFileDetails = { name: "/POC/CandidatesReport.wls" };
  public catelogName: LogiReportFileDetails = { name: "/POC/POC.cat" };
  public title: string = "Web Report";
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;

  constructor(store: Store) {
    store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }
}



