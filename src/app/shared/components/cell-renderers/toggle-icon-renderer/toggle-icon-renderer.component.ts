import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-toggle-icon-renderer',
  templateUrl: './toggle-icon-renderer.component.html',
  styleUrls: ['./toggle-icon-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleIconRendererComponent implements ICellRendererAngularComp {
  toggleEnabled = false;

  private controlField: string;

  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  agInit(params: ICellRendererParams): void {
    this.setData(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    return true;
  }

  private setData(params: ICellRendererParams): void {
    this.controlField = params.colDef?.field as string;
    this.toggleEnabled = params.data[this.controlField];
    this.cd.markForCheck();
  }
}
