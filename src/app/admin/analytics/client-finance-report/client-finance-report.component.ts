import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-client-finance-report',
  templateUrl: './client-finance-report.component.html',
  styleUrls: ['./client-finance-report.component.scss']
})
export class ClientFinanceReportComponent implements OnInit {
  
  public title: string = "Client Finance Report";
  public paramsData: any = {
  };
  public reportName: LogiReportFileDetails = { name: "/ClientFinanceReport/ClientFinanceReport.cls" };
  public catelogName: LogiReportFileDetails = { name: "/ClientFinanceReport/Dashbord.cat" };
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));   
  }
  ngOnInit(): void {
   
  }
 
     

}
