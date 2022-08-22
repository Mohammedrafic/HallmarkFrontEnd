import { Component, ChangeDetectionStrategy } from "@angular/core";
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-action-cellrenderer',
  templateUrl: './action-cellrenderer.component.html',
  styleUrls: ['./action-cellrenderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionCellRendererComponent implements ICellRendererAngularComp {
  private params: any;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    return true;
  }

  onEdit(event: MouseEvent) {
    event.stopImmediatePropagation();
    this.params.handleOnEdit(this.params.data);
  }
  onRemove(event: MouseEvent) {
    event.stopImmediatePropagation();
    this.params.handleOnDelete(this.params.data);
  }
}

