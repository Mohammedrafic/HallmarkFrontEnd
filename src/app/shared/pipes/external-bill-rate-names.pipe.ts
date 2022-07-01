import { Pipe, PipeTransform } from "@angular/core";
import { ApplicantStatus } from "@shared/enums/applicant-status.enum";

@Pipe({
  name: 'exBillRateNames'
})

export class ExBillRateNamesPipe implements PipeTransform{
  transform(externalBillRates: Array<{ id: number; name: string; }>): string | null {
    if (!Boolean(externalBillRates.length)) {
      return null;
    }
    return externalBillRates.map(bill => bill.name).join(", ");
  }
}
