import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { Observable } from 'rxjs';

import { getWorkCommitmentChildColumnDef } from '../candidate-work-commitment-grid.constants';
import { CandidateWorkCommitmentService } from
  '@client/candidates/candidate-work-commitment/services/candidate-work-commitment.service';
import {
  CandidateWorkCommitment,
  WorkCommitmentSetup,
} from '@client/candidates/candidate-work-commitment/models/candidate-work-commitment.model';


@Component({
  selector: 'app-work-commitment-child-row-renderer',
  templateUrl: './work-commitment-child-row-renderer.component.html',
  styleUrls: ['./work-commitment-child-row-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkCommitmentChildRowRendererComponent implements ICellRendererAngularComp {
  public colDefs: ColDef[] = getWorkCommitmentChildColumnDef();
  public rowData$: Observable<WorkCommitmentSetup[]>;

  constructor(private candidateWorkCommitmentService: CandidateWorkCommitmentService) { }

  public agInit(params: ICellRendererParams): void {
    const employeeWorkCommitmentId = (params.data as CandidateWorkCommitment).id;

    if (employeeWorkCommitmentId) {
      this.rowData$ = this.candidateWorkCommitmentService
        .getCandidateWorkCommitmentChildRecords(employeeWorkCommitmentId);
    }
  }

  public refresh(): boolean {
    return true;
  }
} 
