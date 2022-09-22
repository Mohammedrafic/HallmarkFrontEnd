import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-invoice-summary',
  templateUrl: './invoice-summary.component.html',
  styleUrls: ['./invoice-summary.component.scss']
})
export class InvoiceSummaryComponent implements OnInit {

  public title: string = "Invoice Summary Report";
  public paramsData: any = {
  };
  public reportName: LogiReportFileDetails = { name: "/InvoiceSummaryReport/InvoiceSummaryReport.wls" };
  public catelogName: LogiReportFileDetails = { name: "/InvoiceSummaryReport/Dashbord.cat" };
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;
  
  ngOnInit(): void {
   
  }

}
