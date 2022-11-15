import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { LogiReportTypes } from 'src/app/shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { LogiReportJsLoaded } from '@shared/constants';
//declare const com: any;

declare global {
  /* eslint-disable no-var */
  var com: {
    jinfonet: {
      api: {
        AppFactory: any;
      };
    };
  };
  
}

@Component({
  selector: 'app-logi-report',
  templateUrl: './logi-report.component.html',
  styleUrls: ['./logi-report.component.scss']
})

export class LogiReportComponent implements OnInit {
  private factory: any;
  private reportIframeName: string = "reportIframe";
  private uId: string = "";
  private pwd: string = "";
  private jrdPrefer: any;
  private reportUrl: string;
  private reportBaseUrl:string;  
  private scriptLoadTimeoutHandle: any;
  @Input() paramsData: any | {};
  @Input() reportName: LogiReportFileDetails;
  @Input() catelogName: LogiReportFileDetails;
  @Input() reportType: LogiReportTypes;
  @Input() resultList: LogiReportFileDetails[];
  
  constructor(@Inject(APP_SETTINGS) private appSettings: AppSettings) {
  }
  

  ngOnInit(): void {
       
    //this.factory = com.jinfonet.api.AppFactory;    
    
  }
  
  public SetReportData(data:ConfigurationDto[]):void{
    let url=data.find(i=>i.key=="ReportServer:BaseUrl")?.value;
    let userId=data.find(i=>i.key=="ReportServer:UId")?.value;
    let pass=data.find(i=>i.key=="ReportServer:Pwd")?.value;
    this.reportBaseUrl=url==null?"":url;
    this.reportUrl=url==null?"":url+ 'jinfonet/tryView.jsp';
    this.uId=userId==null?"":userId;
    this.pwd=pass==null?"":pass;
    this.injectReportApiJs();
  }
  public RenderReport():void
  {
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
      console.log(this.reportUrl);
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
      jrd_studio_mode:this.reportType == LogiReportTypes.PageReport? "basic_only":"view_only",
      "jrs.param_page": true //,
      //"jrs.profile": "profilename"
    };
    let prptRes = this.reportName;
    let catRes = this.catelogName;
    let test = this.factory?.runReport(
      server, prptRes, catRes, this.paramsData, entryId);
  };

  private injectReportApiJs(): Promise<void> {
    let jrReportApiJsInjected= window.localStorage.getItem(LogiReportJsLoaded)
    return jrReportApiJsInjected!=null&&jrReportApiJsInjected=="true"
      ? Promise.resolve()
      : new Promise((resolve: () => void, reject: () => void) => {
          const script = document.createElement('script');
          script.id = 'j$vm';
          script.type = 'text/javascript';
          window.localStorage.setItem(LogiReportJsLoaded,"true");
          script.onload = (): void => {
            this.factory = com.jinfonet.api.AppFactory;            
            clearTimeout(this.scriptLoadTimeoutHandle);
            resolve();
          };
          script.src = `${this.reportBaseUrl}webos/jsvm/lib/jreportapi.js`;
          document.getElementsByTagName('head')[0].appendChild(script);

          this.scriptLoadTimeoutHandle = setTimeout(() => {
            reject();
          }, 10000);
        });
  }
}
