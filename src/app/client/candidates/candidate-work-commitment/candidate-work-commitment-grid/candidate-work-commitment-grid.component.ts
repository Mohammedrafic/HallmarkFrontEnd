import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { CandidateWorkCommitmentColumnDef } from './candidate-work-commitment-grid.constants';

@Component({
  selector: 'app-candidate-work-commitment-grid',
  templateUrl: './candidate-work-commitment-grid.component.html',
  styleUrls: ['./candidate-work-commitment-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateWorkCommitmentGridComponent extends DestroyableDirective implements OnInit {

  public readonly columnDef: ColumnDefinitionModel[] = CandidateWorkCommitmentColumnDef;
  public rowSelection = undefined;
  public customRowsPerPageDropDownObject = [ { text: '5 Rows', value: 5 } ];

  constructor(
    public cd: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {

  }

  public addCommitment(): void {

  }

}
