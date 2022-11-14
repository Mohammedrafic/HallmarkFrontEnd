import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Store } from '@ngxs/store';
import { filter, takeUntil } from 'rxjs';
import { ICellRendererParams } from "@ag-grid-community/core";

import { Tiers } from '@organization-management/store/tiers.actions';
import { TierGridColumns } from '@organization-management/tiers/interfaces';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Component({
  selector: 'app-grid-action-renderer',
  templateUrl: './grid-action-renderer.component.html',
  styleUrls: ['./grid-action-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridActionRendererComponent extends DestroyableDirective {
  public cellValue: TierGridColumns;

  constructor(
    private store: Store,
    private readonly confirmService: ConfirmService
  ) {
    super();
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
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.store.dispatch(new Tiers.DeleteTier(this.cellValue.data.id));
      });
  }
}
