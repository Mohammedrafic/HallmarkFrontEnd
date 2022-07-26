import { Component, OnDestroy } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';


@Component({
  selector: 'status-text-cell-renderer',
  styleUrls: ['./status-text-cellrender.component.scss'],
  templateUrl: './status-text-cellrender.component.html'
})
export class StatusTextCellRenderer implements ICellRendererAngularComp {
  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh() {
    return false;
  }
}