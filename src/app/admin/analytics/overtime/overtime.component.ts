import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-overtime',
  templateUrl: './overtime.component.html',
  styleUrls: ['./overtime.component.scss']
})
export class OvertimeComponent implements OnInit {

  public title: string = "Overtime Report";
  
  public paramsData: any = {
  };
  public reportName: LogiReportFileDetails = { name: "/OverTimeReport/OverTimeReport.wls" };
  public catelogName: LogiReportFileDetails = { name: "/OverTimeReport/Dashbord.cat" };
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));   
  }
  ngOnInit(): void {
   
  }

}
