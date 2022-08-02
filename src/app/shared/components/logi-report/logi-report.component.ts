import { Component, Inject, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';
import { AppSettings, APP_SETTINGS, APP_SETTINGS_URL } from 'src/app.settings';
declare const com:any;

@Component({
  selector: 'app-logi-report',
  templateUrl: './logi-report.component.html',
  styleUrls: ['./logi-report.component.scss']
})
export class LogiReportComponent implements OnInit {

  private _sanitizer:DomSanitizer;
  private factory:any;
  private reportIframeName="reportIframe";
  @Input() paramsData: any | {};
  @Input() reportName:string ;
  @Input() catelogName:string ;
  


  constructor(private store: Store,
    private router: Router,
    private route: ActivatedRoute,sanitizer: DomSanitizer, @Inject(APP_SETTINGS) private appSettings: AppSettings) {
this._sanitizer=sanitizer;

}

  ngOnInit(): void {
    
   this.factory=com.jinfonet.api.AppFactory;  
   this.ShowReport(this.reportIframeName);
  }
  

  public ShowReport(entryId:string):void {
    
      var server = {
        url: this.appSettings.reportServerUrl+'jinfonet/tryView.jsp',
    user: "admin",
       pass: "admin",
        jrd_prefer:{
            // For page report
            pagereport:{
                feature_UserInfoBar:true,
                feature_ToolBar: true,
                feature_Toolbox: true,
                feature_DSOTree: true,
                feature_TOCTree: true,
                feature_PopupMenu: true,
                feature_ADHOC: true
            },
            
            // For web report
            webreport:{
                viewMode:{
                    hasToolbar: true,
                    hasSideArea: true
                },
                editMode:{
                  hasToolbar: true,
                  hasSideArea: true
                }
            }
        },
        jrd_studio_mode: "edit",
        "jrs.param_page": true
    };
     
     var prptRes = {name:this.reportName};
     var catRes = {name:this.catelogName};
  
      
      var test = this.factory.runReport(
      server, prptRes, catRes, this.paramsData, entryId);
      };
  }
