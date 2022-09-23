import { StoreRefreshAfterParams } from '@ag-grid-community/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { UserState } from 'src/app/store/user.state';
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
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));   
  }
  ngOnInit(): void {
   
  }

}
