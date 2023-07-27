import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';

@Component({
  selector: 'app-candidate-details',
  templateUrl: './candidate-details.component.html',
  styleUrls: ['./candidate-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateDetailsComponent extends AbstractContactDetails implements OnInit {
  constructor(
    protected override cdr: ChangeDetectorRef,
    protected override candidateProfileFormService: CandidateProfileFormService
  ) {
    super(cdr, candidateProfileFormService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }
}
