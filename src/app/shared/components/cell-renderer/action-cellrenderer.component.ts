import { Component, ChangeDetectionStrategy } from "@angular/core";
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Store } from "@ngxs/store";
import { AbstractPermission } from "@shared/helpers/permissions";

@Component({
  selector: 'app-action-cellrenderer',
  templateUrl: './action-cellrenderer.component.html',
  styleUrls: ['./action-cellrenderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionCellRendererComponent extends AbstractPermission implements ICellRendererAngularComp {
  private params: any;

  constructor(protected override store: Store) {
    super(store);
  }

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

