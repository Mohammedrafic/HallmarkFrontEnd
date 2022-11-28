import { Pipe, PipeTransform } from '@angular/core';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';

@Pipe({
  name: 'hideByCandidateStatus'
})
export class HideByCandidateStatusPipe implements PipeTransform {

  transform(status: ApplicantStatus, candidateStatusList: ApplicantStatus[]): boolean {
    return !candidateStatusList.includes(status);
  }
}
