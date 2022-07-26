import { FactoryTarget } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';
declare const com:any;
@Component({
  selector: 'app-custom-reports',
  templateUrl: './custom-reports.component.html',
  styleUrls: ['./custom-reports.component.scss']
})
export class CustomReportsComponent implements OnInit {

  private factory:any;
  constructor(private store: Store,
    private router: Router,
    private route: ActivatedRoute,sanitizer: DomSanitizer) {
    store.dispatch(new SetHeaderState({ title: 'Analytics', iconName: 'truck' }));
}

  ngOnInit(): void {
   this.factory=com.jinfonet.api.AppFactory;
   this.ShowReport("reportIframe");
  }

  
public ShowReport(entryId:string):void {
        var params1 = {
          
          };
          var server = {
            url: "https://10.20.1.4:6888/jinfonet/tryView.jsp",
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
         
         var prptRes = {name:"/Dashboard/DemoDashboard.cls"};
         var catRes = {name:"/Dashboard/POC.cat"};
      
          
          var test = this.factory.runReport(
          server, prptRes, catRes, params1, entryId);
          };

  }


