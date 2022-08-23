import { Pipe, PipeTransform } from '@angular/core';
import { ApplicantStatus } from '../enums/applicant-status.enum';

@Pipe({
  name: 'candidateStatusName',
})
export class CandidateStatusName implements PipeTransform {
  public transform(status: ApplicantStatus): string {
    if (status === ApplicantStatus.OnBoarded) {
      return 'Onboard';
    } else {
      return ApplicantStatus[status];
    }
  }
}
