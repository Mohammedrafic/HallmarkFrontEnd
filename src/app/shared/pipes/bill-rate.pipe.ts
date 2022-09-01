import { Pipe, PipeTransform } from '@angular/core';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';

@Pipe({
  name: 'billRate',
})
export class BillRatePipe implements PipeTransform {
  transform(rate: number, candidateRate: number, status: number, offeredBillRate: number): string {
    return candidateRate
      ? `${
          status === ApplicantStatus.OnBoarded ? Number(offeredBillRate).toFixed(2) : Number(candidateRate).toFixed(2)
        }`
      : `${Number(rate).toFixed(2)}`;
  }
}
