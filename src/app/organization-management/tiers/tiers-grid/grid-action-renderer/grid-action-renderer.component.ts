import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Store } from '@ngxs/store';
import { filter, takeUntil } from 'rxjs';
import { ICellRendererParams } from "@ag-grid-community/core";

import { Tiers } from '@organization-management/store/tiers.actions';
import { TierGridColumns } from '@organization-management/tiers/interfaces';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { AbstractPermission } from '@shared/helpers/permissions';

@Component({
  selector: 'app-grid-action-renderer',
  templateUrl: './grid-action-renderer.component.html',
  styleUrls: ['./grid-action-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridActionRendererComponent extends AbstractPermission {
  public cellValue: TierGridColumns;

  constructor(
    protected override store: Store,
    private readonly confirmService: ConfirmService
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

  public editTier(): void {
    this.cellValue.edit!(this.cellValue.data);
  }

  public deleteTier(): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      )
      .subscribe(() => {
        this.store.dispatch(new Tiers.DeleteTier(this.cellValue.data.id));
      });
  }
}
