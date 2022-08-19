import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component} from '@angular/core';

@Component({
  selector: 'app-toggle-switch',
  templateUrl: './toggle-switch.component.html',
  styleUrls: ['./toggle-switch.component.scss']
})
export class ToggleSwitchComponent implements ICellRendererAngularComp {

  constructor() { }
  private params!: any;
  public toggleYesOrNo = false;
  agInit(params: any): void {
    this.params = params;
    this.SetData();
  }
 
SetData():void{
  if(this.params.column.colId=='email')
  {
    this.toggleYesOrNo=this.params.data["isEmail"]
  }
  else if(this.params.column.colId=='text')
  {
    this.toggleYesOrNo=this.params.data["isText"];
  }
  else if(this.params.column.colId=='onScreen')
  {
    this.toggleYesOrNo=this.params.data["isOnScreen"];
  }
}
  refresh(): boolean {
    return true;
  }


}
