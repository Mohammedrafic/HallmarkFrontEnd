import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-status-text-cellrender',
  templateUrl: './status-text-cellrender.component.html',
  styleUrls: ['./status-text-cellrender.component.scss']
})
export class StatusTextCellrenderComponent implements ICellRendererAngularComp {
  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh() {
    return false;
  }
}
