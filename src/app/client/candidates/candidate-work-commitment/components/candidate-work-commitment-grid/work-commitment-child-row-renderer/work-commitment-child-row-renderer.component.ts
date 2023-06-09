import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { Observable } from 'rxjs';

import { getWorkCommitmentChildColumnDef } from '../candidate-work-commitment-grid.constants';
import { CandidateWorkCommitmentService } from
  '@client/candidates/candidate-work-commitment/services/candidate-work-commitment.service';
import { WorkCommitmentSetup } from '@client/candidates/candidate-work-commitment/models/candidate-work-commitment.model';


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
    this.rowData$ = this.candidateWorkCommitmentService.getCandidateWorkCommitmentChildRecords(params.data.id);
  }

  public refresh(): boolean {
    return true;
  }
} 
