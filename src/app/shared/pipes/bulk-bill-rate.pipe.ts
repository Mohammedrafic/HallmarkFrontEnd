import { Pipe, PipeTransform } from '@angular/core';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';

@Pipe({
  name: 'bulkbillRate',
})
export class BulkBillRatePipe implements PipeTransform {
  transform(rate: number, candidateRate: number, status: number, offeredBillRate: number): string {
    if(status==ApplicantStatus.Applied||status==ApplicantStatus.Shortlisted||status==ApplicantStatus.PreOfferCustom)
        return `${Number(rate).toFixed(2)}`;
    else if(status==ApplicantStatus.NotApplied)
        return `${Number(candidateRate).toFixed(2)}`;
    else
        return `${Number(offeredBillRate).toFixed(2)}`;
  }
}
