import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';
@Component({
  selector: 'app-custom-reports',
  templateUrl: './custom-reports.component.html',
  styleUrls: ['./custom-reports.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomReportsComponent implements OnInit {
  public iframeUrl:SafeResourceUrl;
  private _sanitizer:DomSanitizer;
  constructor(private store: Store,
    private router: Router,
    private route: ActivatedRoute,sanitizer: DomSanitizer) {
    store.dispatch(new SetHeaderState({ title: 'Analytics', iconName: 'user' }));
this._sanitizer=sanitizer;
}

  ngOnInit(): void {
    //this.iframeUrl=this._sanitizer.bypassSecurityTrustUrl('https://10.20.1.4:6888/jinfonet/tryView.jsp?jrs.cmd=jrs.try_vw&jrs.page_style=1&jrs.report=%2FCPT%2FCPT_Initial.wls&paramPageDisabled=true&currTime=1658445444000&jrs.catalog=%2FCPT%2FSSRS.cat&jrs.cat_version=-1&catalog_last_modified=1655311407249&report_last_modified=1655394302527&jrd_studio_mode=view&jrs.path=%2FCPT%2FCPT_Initial.wls&jrs.result_type=8&jrs.engine_id=1658445447819-7&jrd_viewType=studio&profile_enable_default_nls=false');
    this.iframeUrl=this._sanitizer.bypassSecurityTrustUrl('https://10.20.1.4:6888/webos/app/dashboard/index.jsp?j$vm_pid=_ZREvduRG@-1#');
  }

}
