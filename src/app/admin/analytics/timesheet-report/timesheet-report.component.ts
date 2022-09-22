import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-timesheet-report',
  templateUrl: './timesheet-report.component.html',
  styleUrls: ['./timesheet-report.component.scss']
})
export class TimesheetReportComponent implements OnInit {

  public title: string = "Timesheet Report"; 
  public paramsData: any = {
  };
  public reportName: LogiReportFileDetails = { name: "/TimeSheetReport/TimeSheetReport.wls" };
  public catelogName: LogiReportFileDetails = { name: "/TimeSheetReport/Dashbord.cat" };
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;
  
  ngOnInit(): void {
   
  }

}
