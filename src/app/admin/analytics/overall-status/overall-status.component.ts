import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-overall-status',
  templateUrl: './overall-status.component.html',
  styleUrls: ['./overall-status.component.scss']
})
export class OverallStatusComponent implements OnInit {

  public title: string = "Overall Status Report";
  public paramsData: any = {
  };
  public reportName: LogiReportFileDetails = { name: "/OverAllStatusReport/OverAllStatusReport.wls" };
  public catelogName: LogiReportFileDetails = { name: "/OverAllStatusReport/Dashbord.cat" };
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));   
  }
  ngOnInit(): void {
   
  }


}
