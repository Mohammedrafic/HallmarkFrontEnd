import { Component, OnInit, ViewChild } from '@angular/core';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';

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
  
  ngOnInit(): void {
   
  }

}
