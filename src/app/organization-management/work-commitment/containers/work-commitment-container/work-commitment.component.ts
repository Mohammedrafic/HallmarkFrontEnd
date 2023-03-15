import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Store } from '@ngxs/store';

import { AbstractPermission } from '@shared/helpers/permissions';
import { ShowSideDialog } from '../../../../store/app.actions';
import { WorkCommitmentDTO, WorkCommitmentGrid } from '../../interfaces';
import { WorkCommitment } from '../../../store/work-commitment.actions';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';

@Component({
  selector: 'app-work-commitment',
  templateUrl: './work-commitment.component.html',
  styleUrls: ['./work-commitment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkCommitmentComponent extends AbstractPermission {
  public isEdit = false;
  public selectedCommitment: WorkCommitmentGrid;
  public buttonType = ButtonTypeEnum;

  private commitmentFormState: WorkCommitmentDTO;

  constructor(protected override store: Store) {
    super(store);
  }

  public addCommitment() {
    this.isEdit = false;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public handleSaveCommitment(commitment: WorkCommitmentDTO) {
    this.commitmentFormState = commitment;
    this.store.dispatch(
      new WorkCommitment.SaveCommitment(
        {
          ...this.commitmentFormState,
        },
        this.isEdit
      )
    );
  }

  public handleEditCommitment(commitment: WorkCommitmentGrid): void {
    this.isEdit = true;
    this.selectedCommitment = { ...commitment };
    this.store.dispatch(new ShowSideDialog(true));
  }
}
