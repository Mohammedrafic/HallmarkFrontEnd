import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { LogiReportTypes } from 'src/app/shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { LogiReportJsLoaded } from '@shared/constants';
import { UserState } from '../../../store/user.state';
import { Store } from '@ngxs/store';
import { BusinessUnitType } from '../../enums/business-unit-type';
import { GlobalConstants } from '@shell/global-constants';
import { GetLogiReportData } from '../../../organization-management/store/logi-report.action';
import { takeUntil, takeWhile } from 'rxjs';
declare const com:any;
// declare global {
//   /* eslint-disable no-var */
//   var com: {
//     jinfonet: {
//       api: {
//         AppFactory: any;
//       };
//     };
//   };
  
// }

@Component({
  selector: 'app-logi-report',
  templateUrl: './logi-report.component.html',
  styleUrls: ['./logi-report.component.scss']
})

export class LogiReportComponent implements OnInit {
  private factory: any;
  private factoryReportSet: any;
  private reportIframeName: string = "reportIframe";
  private uId: string = "";
  private pwd: string = "";
  private jrdPrefer: any;
  private reportUrl: string; 
  private scriptLoadTimeoutHandle: any;
  private isAlive = true;
  @Input() paramsData: any | {};
  @Input() reportName: LogiReportFileDetails;
  @Input() catelogName: LogiReportFileDetails;
  @Input() reportType: LogiReportTypes;
  @Input() resultList: LogiReportFileDetails[];
  @Input() customCSS: string;
  
  constructor(@Inject(APP_SETTINGS) private appSettings: AppSettings, private store: Store) {
  }
  

  ngOnInit(): void {
    this.factory = com.jinfonet.api.AppFactory;
    this.factoryReportSet = com.jinfonet.api.ReportSet;
    
  }
  
  public SetReportData(data:ConfigurationDto[]):void{
    // let url=data.find(i=>i.key=="ReportServer:BaseUrl")?.value;
    // let userId=data.find(i=>i.key=="ReportServer:UId")?.value;
    // let pass=data.find(i=>i.key=="ReportServer:Pwd")?.value;
    // this.reportBaseUrl=url==null?"":url;
    // this.reportUrl=url==null?"":url+ 'jinfonet/tryView.jsp';
    // this.uId=userId==null?"":userId;
    // this.pwd=pass==null?"":pass;
    //this.injectReportApiJs();
  }
  public SaveAsReport(options: any, entryId: any): void {
    this.CustomizeSaveAs(options, entryId);  
  }
  public CloseReport( entryId: any): void {
    var app = this.factory.getApp(entryId);
    if (!app) return;
    app.close(function () {
      var linkPathEle = document.getElementById("linkPath");
      console.log(linkPathEle)
    });
  }
  private CustomizeSaveAs(options: any,  entryId: any): void {
    var app = this.factory.getApp(entryId), rptset;
    if (!app) return;

    rptset = app.getReportSet();
    rptset.saveAs(options, this.CallbackSaveAs);
  }
  private CallbackSaveAs(status: any) {
    console.log(status);
  }
  public RenderReport():void
  {
    if (this.customCSS == undefined) {
      this.customCSS = "logi-report-iframe-div";
    }
    if (GlobalConstants.reportBaseUrl == null || GlobalConstants.reportBaseUrl == undefined || GlobalConstants.reportBaseUrl.trim()=="") {
      this.store.dispatch(new GetLogiReportData()).pipe(takeWhile(() => this.isAlive)).subscribe((val: any) => {
        if (val) {
          let data: ConfigurationDto[];
          data = val?.LogiReport?.logiReportDto;
          if (data != null) {
            let url = data.find(i => i.key == "ReportServer:BaseUrl")?.value;
            let userId = data.find(i => i.key == "ReportServer:UId")?.value;
            let pass = data.find(i => i.key == "ReportServer:Pwd")?.value;
            GlobalConstants.reportBaseUrl = url == null ? "" : url;
            GlobalConstants.reportUId = userId == null ? "" : userId;
            GlobalConstants.reportPwd = pass == null ? "" : pass;
            this.setReportUrl();
          }
        }
      });
    } else {
      this.setReportUrl();
    }
  }

  private setReportUrl() {
    this.reportUrl = GlobalConstants.reportBaseUrl == null ? "" : GlobalConstants.reportBaseUrl + 'jinfonet/tryView.jsp';
    this.uId = GlobalConstants.reportUId == null ? "" : GlobalConstants.reportUId;
    this.pwd = GlobalConstants.reportPwd == null ? "" : GlobalConstants.reportPwd;
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
    let task = this.factory?.runDashboard(server, resExt, entryId);
  }

  private async ShowReport(entryId: string): Promise<void> {
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
    const user = await this.store.selectSnapshot(UserState.user);
    var studio_mode = this.reportType == LogiReportTypes.PageReport ? "basic_only" : "view_only";
    if (user?.businessUnitType === BusinessUnitType.Hallmark) {
     
      studio_mode = this.reportType == LogiReportTypes.PageReport ? "interactive" : "view";
    }
    let server = {
      url: this.reportUrl,
      user: this.uId,
      pass: this.pwd,
      jrd_prefer: this.jrdPrefer,
      jrd_studio_mode: studio_mode,
      "jrs.param_page": true ,
      "jrs.profile": "CustomProfile"
    };
    let prptRes = this.reportName;
    let catRes = this.catelogName;
   
    let test = this.factory?.runReport(
      server, prptRes, catRes, this.paramsData, entryId);
  }


  private injectReportApiJs(): Promise<void> {
    let jrReportApiJsInjected= window.localStorage.getItem(LogiReportJsLoaded);
    let jsfile=document.getElementById("j$vm");
    return jrReportApiJsInjected!=null&&jrReportApiJsInjected=="true"&&jsfile!=null
      ? Promise.resolve()
      : new Promise((resolve: () => void, reject: () => void) => {
          const script = document.createElement('script');
          script.id = 'j$vm';
          script.type = 'text/javascript';
          window.localStorage.setItem(LogiReportJsLoaded,"true");
          script.onload = (): void => {
            this.factory = com.jinfonet.api.AppFactory;
            this.factoryReportSet = com.jinfonet.api.ReportSet;
            clearTimeout(this.scriptLoadTimeoutHandle);
            resolve();
          };
          //script.src = `${this.reportBaseUrl}webos/jsvm/lib/jreportapi.js`;
          document.getElementsByTagName('head')[0].appendChild(script);

          this.scriptLoadTimeoutHandle = setTimeout(() => {
            reject();
          }, 10000);
        });
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }
}
