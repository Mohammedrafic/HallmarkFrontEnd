import { FactoryTarget } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';
@Component({
  selector: 'app-candidate-stats',
  templateUrl: './candidate-stats.component.html',
  styleUrls: ['./candidate-stats.component.scss']
})
export class CandidateStatsComponent implements OnInit {

  private _sanitizer:DomSanitizer;
  public paramsData:any={"pState":"CA",
  "pWeek#":"1"};
  public reportName:string="/POC/CandidatesReport.wls";
  public catelogName:string="/POC/POC.cat";
  public title:string="Candidate Statistics";
  constructor(private store: Store,
    private router: Router,
    private route: ActivatedRoute,sanitizer: DomSanitizer) {
store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
this._sanitizer=sanitizer;
}

  ngOnInit(): void {
 
  }
  }



