import { Component, Inject, Input, OnInit } from '@angular/core';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { LogiReportTypes } from 'src/app/shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
declare const com: any;

@Component({
  selector: 'app-logi-report',
  templateUrl: './logi-report.component.html',
  styleUrls: ['./logi-report.component.scss']
})
export class LogiReportComponent implements OnInit {
  private factory: any;
  private reportIframeName: string = "reportIframe";
  private uId: string = "admin";
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

  public showDashBoard(entryId: string): void {
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
      authorized_user: this.uId,
      jrd_prefer: this.jrdPrefer,
      jrd_dashboard_mode: "edit",
    },
      resExt = {
        reslst: this.resultList,
        active: 1
      };
    let task = this.factory.runDashboard(server, resExt, entryId);
  }

  public ShowReport(entryId: string): void {
    if (this.reportType == LogiReportTypes.PageReport) {
      this.jrdPrefer = {
        // For page report
        pagereport: {
          feature_UserInfoBar: true,
          feature_ToolBar: true,
          feature_Toolbox: true,
          feature_DSOTree: true,
          feature_TOCTree: true,
          feature_PopupMenu: true,
          feature_ADHOC: true
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
          },
          editMode: {
            hasToolbar: true,
            hasSideArea: true
          }
        }
      }
    }
    let server = {
      url: this.reportUrl,
      authorized_user: this.uId,
      jrd_prefer: this.jrdPrefer,
      jrd_studio_mode: "edit",
      "jrs.param_page": true
    };
    let prptRes = this.reportName;
    let catRes = this.catelogName;
    let test = this.factory.runReport(
      server, prptRes, catRes, this.paramsData, entryId);
  };
}
