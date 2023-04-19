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
  public controlName:string;
  private isEmailEnabled:string='isEmailEnabled';
  private isSMSEnabled:string='isSMSEnabled';
  private isOnScreenEnabled:string='isOnScreenEnabled';
  public disableFlag:boolean =false;
  agInit(params: any): void {
    this.params = params;
    this.SetData();
  }

  SetData(): void {
    if (this.params.column.colId == this.isEmailEnabled) {
      this.toggleYesOrNo = this.params.data[this.isEmailEnabled];
    }
    else if (this.params.column.colId == this.isSMSEnabled) {
      this.toggleYesOrNo = this.params.data[this.isSMSEnabled];
    }
    else if (this.params.column.colId == this.isOnScreenEnabled) {
      this.toggleYesOrNo = this.params.data[this.isOnScreenEnabled];
    }else{
      this.disableFlag = true;
      this.toggleYesOrNo = this.params.value;
    }
  }
  refresh(): boolean {
    return true;
  } 
  onChange($event: any) {
    if (this.params.onChange instanceof Function) {
      const params = {
        event: $event,
        rowData: this.params.node.data        
      }
      this.params.onChange(params);

    }
  }


}
