import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { CandidateCredentialGridItem } from '@shared/models/candidate-credential.model';
import { departmentMatchCellConfig } from './department-match-cell.constant';
import { DepartmentMatchConfig } from './department-match-cell.interface';

@Component({
  selector: 'app-department-match-cell',
  templateUrl: './department-match-cell.component.html',
  styleUrls: ['./department-match-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentMatchCellComponent {
  @Input() set cellData(value : CandidateCredentialGridItem) {
    const status = value.departmentMatch ?? null;
    if (status !== null) {
      this.cell = departmentMatchCellConfig[status];
    }
  }

  public cell: DepartmentMatchConfig;
}
