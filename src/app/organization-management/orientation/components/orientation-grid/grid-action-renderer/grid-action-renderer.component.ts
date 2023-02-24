import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Store } from '@ngxs/store';
import { ICellRendererParams } from "@ag-grid-community/core";
import { AbstractPermission } from '@shared/helpers/permissions';
import { OrientationGridColumns } from '@organization-management/orientation/models/orientation.model';

@Component({
  selector: 'app-grid-action-renderer',
  templateUrl: './grid-action-renderer.component.html',
  styleUrls: ['./grid-action-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrientationGridActionRendererComponent extends AbstractPermission {
  public cellValue: OrientationGridColumns;

  constructor(
    protected override store: Store,
  ) {
    super(store);
  }

  public agInit(params: ICellRendererParams): void {
    this.cellValue = params;
  }

  public refresh(params: ICellRendererParams): boolean {
    this.cellValue = params;
    return true;
  }

  public edit(): void {
    this.cellValue.edit!(this.cellValue.data);
  }

  public delete(): void {
    this.cellValue.delete!(this.cellValue.data);
  }
}
