import { Component, OnInit } from '@angular/core';
import { INoRowsOverlayAngularComp } from '@ag-grid-community/angular';
import { INoRowsOverlayParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-custom-no-rows-overlay',
  templateUrl: './custom-no-rows-overlay.component.html',
  styleUrls: ['./custom-no-rows-overlay.component.scss']
})
export class CustomNoRowsOverlayComponent implements INoRowsOverlayAngularComp {

  public params!: INoRowsOverlayParams & { noRowsMessageFunc: () => string };

  agInit(
    params: INoRowsOverlayParams & { noRowsMessageFunc: () => string }
  ): void {
    this.params = params;
  }
}
