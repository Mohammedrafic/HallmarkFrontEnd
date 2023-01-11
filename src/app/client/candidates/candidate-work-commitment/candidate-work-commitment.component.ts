import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Component({
  selector: 'app-candidate-work-commitment',
  templateUrl: './candidate-work-commitment.component.html',
  styleUrls: ['./candidate-work-commitment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateWorkCommitmentComponent extends DestroyableDirective implements OnInit, OnDestroy {

  constructor(
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  public ngOnInit(): void {

  }

}
