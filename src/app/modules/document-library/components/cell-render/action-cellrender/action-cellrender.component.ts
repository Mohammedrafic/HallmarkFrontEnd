import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-action-cellrender',
  templateUrl: './action-cellrender.component.html',
  styleUrls: ['./action-cellrender.component.scss']
})
export class ActionCellrenderComponent implements ICellRendererAngularComp {

  public params: any;
  agInit(params: any): void {
    this.params = params;
  }

  refresh() {
    return true;
  }
}
