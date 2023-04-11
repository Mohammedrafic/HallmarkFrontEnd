import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Store } from '@ngxs/store';
import { filter, takeUntil } from 'rxjs';
import { ICellRendererParams } from '@ag-grid-community/core';

import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { AbstractPermission } from '@shared/helpers/permissions';
import { WorkCommitment } from '../../../store/work-commitment.actions';
import { WorkCommitmentGridColumns } from '../../interfaces/work-commitment-grid.interface';

@Component({
  selector: 'app-work-commitment-button-renderer',
  templateUrl: './work-commitment-button-renderer.html',
  styleUrls: ['./work-commitment-button-renderer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkCommitmentButtonRenderer extends AbstractPermission {
  public cellValue: WorkCommitmentGridColumns;

  constructor(protected override store: Store, private readonly confirmService: ConfirmService) {
    super(store);
  }

  public agInit(params: ICellRendererParams): void {
    this.cellValue = params;
  }

  public refresh(params: ICellRendererParams): boolean {
    this.cellValue = params;
    return true;
  }

  public editCommitment(): void {
    this.cellValue.edit!(this.cellValue.data);
  }

  public deleteCommitment(): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.store.dispatch(new WorkCommitment.DeleteCommitment(this.cellValue.data.workCommitmentId));
      });
  }
}
