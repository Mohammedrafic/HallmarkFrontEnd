import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef } from '@ag-grid-community/core';
import { Observable } from 'rxjs';

import { getWorkCommitmentChildColumnDef } from '../candidate-work-commitment-grid.constants';
import { CandidateWorkCommitmentService } from
  '@client/candidates/candidate-work-commitment/services/candidate-work-commitment.service';
import { WorkCommitmentSetup } from '@client/candidates/candidate-work-commitment/models/candidate-work-commitment.model';
import { CandidatesService } from '@client/candidates/services/candidates.service';


@Component({
  selector: 'app-work-commitment-child-row-renderer',
  templateUrl: './work-commitment-child-row-renderer.component.html',
  styleUrls: ['./work-commitment-child-row-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkCommitmentChildRowRendererComponent implements ICellRendererAngularComp {
  public colDefs: ColDef[] = getWorkCommitmentChildColumnDef();
  public rowData$: Observable<WorkCommitmentSetup[]>;

  private employeeWorkCommitmentId: number;

  constructor(
    private candidateWorkCommitmentService: CandidateWorkCommitmentService,
    private candidateService: CandidatesService
  ) { }

  public agInit(): void {
    const employeeWorkCommitmentId = this.candidateService.getActiveWorkCommitment()?.id;

    if (employeeWorkCommitmentId) {
      this.rowData$ = this.candidateWorkCommitmentService
        .getCandidateWorkCommitmentChildRecords(this.employeeWorkCommitmentId);
    }
  }

  public refresh(): boolean {
    return true;
  }
} 
