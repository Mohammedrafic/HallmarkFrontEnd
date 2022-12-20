import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import { CandidateProfileService } from '@client/candidates/candidate-profile/candidate-profile.service';

@Component({
  selector: 'app-candidate-details',
  templateUrl: './candidate-details.component.html',
  styleUrls: ['./candidate-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateDetailsComponent extends AbstractContactDetails implements OnInit {
  constructor(
    protected override cdr: ChangeDetectorRef,
    protected override candidateProfileService: CandidateProfileService
  ) {
    super(cdr, candidateProfileService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }


  public listenProfileStatusChange(): void {

  }

}
