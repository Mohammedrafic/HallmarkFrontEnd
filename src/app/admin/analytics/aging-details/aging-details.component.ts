import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-aging-details',
  templateUrl: './aging-details.component.html',
  styleUrls: ['./aging-details.component.scss']
})
export class AgingDetailsComponent implements OnInit {
  public title: string = "Aging Report";
  public paramsData: any = {
  };
  public reportName: LogiReportFileDetails = { name: "/AgingReport/AgingReport.cls" };
  public catelogName: LogiReportFileDetails = { name: "/AgingReport/Dashbord.cat" };
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));   
  }
  ngOnInit(): void {
   
  }

}
