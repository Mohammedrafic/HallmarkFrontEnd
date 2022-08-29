import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-extension-grid-status-renderer',
  templateUrl: './extension-grid-status-renderer.component.html',
  styleUrls: ['./extension-grid-status-renderer.component.scss'],
})
export class ExtensionGridStatusRendererComponent implements ICellRendererAngularComp {
  public cellValue: string;

  public agInit(params: ICellRendererParams): void {
    this.cellValue = params.value;
  }

  public refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
