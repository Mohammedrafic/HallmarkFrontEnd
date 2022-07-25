import { Component, OnDestroy } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';


@Component({
  selector: 'detail-cell-renderer',
  styleUrls: ['./detail-cell-render.component.scss'],
  templateUrl: './detail-cell-render.component.html'
})
export class DetailRowCellRenderer implements ICellRendererAngularComp {
  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  onOpenDialog(event: any) {
    debugger;
    this.params.clicked(event,this.params.data);
  }

  refresh(params: any): boolean {
    return false;
  }
}