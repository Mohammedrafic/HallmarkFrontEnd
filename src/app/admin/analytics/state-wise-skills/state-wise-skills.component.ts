import { FactoryTarget } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-state-wise-skills',
  templateUrl: './state-wise-skills.component.html',
  styleUrls: ['./state-wise-skills.component.scss']
})
export class StateWiseSkillsComponent implements OnInit {

  private _sanitizer:DomSanitizer;
  public paramsData:any={};
  public reportName:string="/Dashboard/DemoDashboard.cls";
  public catelogName:string="/Dashboard/POC.cat";
  public title:string="State Wise Skills";
  constructor(private store: Store,
    private router: Router,
    private route: ActivatedRoute,sanitizer: DomSanitizer) {
store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
this._sanitizer=sanitizer;
}

  ngOnInit(): void {  
  
  }

  }



