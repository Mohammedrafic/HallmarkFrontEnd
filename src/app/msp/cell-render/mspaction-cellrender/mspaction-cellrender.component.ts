import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-mspaction-cellrender',
  templateUrl: './mspaction-cellrender.component.html',
  styleUrls: ['./mspaction-cellrender.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MspactionCellrenderComponent implements ICellRendererAngularComp {  

  public params: any;

  agInit(params: any): void {
    this.params = params;

  }
  refresh() {
    return true;
  }
}
