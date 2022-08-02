import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-page-report',
  templateUrl: './page-report.component.html',
  styleUrls: ['./page-report.component.scss']
})
export class PageReportComponent {
  public paramsData: any = {};
  public reportName: LogiReportFileDetails = { name: "/Dashboard/DemoDashboard.cls" };
  public catelogName: LogiReportFileDetails = { name: "/Dashboard/POC.cat" };
  public title: string = "Page Report";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;

  constructor(store: Store) {
    store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }
}
