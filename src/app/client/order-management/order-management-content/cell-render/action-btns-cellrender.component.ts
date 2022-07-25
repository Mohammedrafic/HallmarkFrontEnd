import { Component, OnDestroy } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';


@Component({
  selector: 'action-btn-cell-renderer',
  styleUrls: ['./action-btns-cellrender.component.scss'],
  templateUrl: './action-btns-cellrender.component.html',
  template: ''
})
export class ActionBtnCellRenderer implements ICellRendererAngularComp {
  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  btnClickedHandler(event: any) {
    this.params.clicked(this.params.data);
  }

  btnDisabledLock(){
   return this.params.disabled(this.params.data);
  }

  menuOptionSelected(event:any){
    this.params.select(event,this.params.data)
  }

  refresh() {
    return true;
  }
}