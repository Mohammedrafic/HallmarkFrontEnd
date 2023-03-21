import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Store } from '@ngxs/store';
import { ICellRendererParams } from "@ag-grid-community/core";
import { AbstractPermission } from '@shared/helpers/permissions';
import { CommitmentGridColumns } from '../../interfaces/candidate-work-commitment.interface';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-grid-action-renderer',
  templateUrl: './grid-action-renderer.component.html',
  styleUrls: ['./grid-action-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateCommitmentGridActionRendererComponent extends AbstractPermission {
  public cellValue: CommitmentGridColumns;

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

  public editCommitment(): void {
    this.cellValue.edit!(this.cellValue.data);
  }

  public deleteCommitment(): void {
    this.cellValue.delete!(this.cellValue.data);
  }
}
