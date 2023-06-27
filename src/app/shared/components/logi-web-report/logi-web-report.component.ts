import { Component, Inject, Input, OnInit } from '@angular/core';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { LogiReportTypes } from 'src/app/shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
declare const com: any;

@Component({
  selector: 'app-logi-web-report',
  templateUrl: './logi-web-report.component.html',
  styleUrls: ['./logi-web-report.component.scss']
})
export class LogiWebReportComponent implements OnInit {
  private factory: any;
  private reportIframeName: string = "reportIframeNew";
  private uId: string = "admin";
  private pwd: string = "admin";
  private jrdPrefer: any;
  private reportUrl: string;
  @Input() paramsData: any | {};
  @Input() reportName: LogiReportFileDetails;
  @Input() catelogName: LogiReportFileDetails;
  @Input() reportType: LogiReportTypes;
  @Input() resultList: LogiReportFileDetails[];

  constructor(@Inject(APP_SETTINGS) private appSettings: AppSettings) {
  }

  ngOnInit(): void {
    this.factory = com.jinfonet.api.AppFactory;
    this.reportUrl = this.appSettings.reportServerUrl + 'jinfonet/tryView.jsp';
      
    if (this.reportType == LogiReportTypes.DashBoard) {
      this.showDashBoard(this.reportIframeName);
    }
    else {
      this.ShowReport(this.reportIframeName);
    }
  }

  private showDashBoard(entryId: string): void {
    this.jrdPrefer = {
      // For dashboard
      dashboard: {
        viewMode: {
          toolbar: true,
          taskbar: true
        },
        cstTitleBar: { tstyle: 0, bstyle: 1 }
      }
    }
    let server = {
      url: this.reportUrl,
      user: this.uId,
      pass: this.pwd,
      jrd_prefer: this.jrdPrefer,
      jrd_dashboard_mode: "view",
    },
      resExt = {
        reslst: this.resultList,
        active: 1
      };
    let task = this.factory.runDashboard(server, resExt, entryId);
  }

  private ShowReport(entryId: string): void {
    if (this.reportType == LogiReportTypes.PageReport) {
      this.jrdPrefer = {
        // For page report
        pagereport: {
          feature_UserInfoBar: false,
          feature_ToolBar: true,
          feature_Toolbox: false,
          feature_DSOTree: false,
          feature_TOCTree: false,
          feature_PopupMenu: false,
          feature_ADHOC: false
        }
      };
    }
    else if (this.reportType == LogiReportTypes.WebReport) {
      this.jrdPrefer = {
        // For web report
        webreport: {
          viewMode: {
            hasToolbar: true,
            hasSideArea: true
          }
        }
      }
    }
    let server = {
      url: this.reportUrl,
      user: this.uId,
      pass: this.pwd,
      jrd_prefer: this.jrdPrefer,
      jrd_studio_mode:this.reportType == LogiReportTypes.PageReport? "basic":"view",
      "jrs.param_page": true
    };
    let prptRes = this.reportName;
    let catRes = this.catelogName;
    let test = this.factory.runReport(
      server, prptRes, catRes, this.paramsData, entryId);
  };
}

