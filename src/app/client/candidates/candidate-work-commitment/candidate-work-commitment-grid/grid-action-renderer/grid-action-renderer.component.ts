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
  public isPast: boolean = false;

  constructor(
    protected override store: Store,
  ) {
    super(store);
  }

  public agInit(params: ICellRendererParams): void {
    this.cellValue = params;
    if (this.cellValue.today) {
      this.isPast = (this.cellValue.data.endDate && new Date(formatDate(this.cellValue.data.endDate, 'MM/dd/yyyy', 'en-US')) < this.cellValue.today) ||
                     this.cellValue.data.isInUse;
    }
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

  private checkIfCommitmentPast(): void {

  }
}
