import { Injectable } from '@angular/core';
import { BillRate } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class BillRatesSyncService {
  getBillRateForSync(billRates: BillRate[], jobStartDate?: Date): BillRate | null {
    const jobStartDateTimeStamp = jobStartDate ? jobStartDate.getTime() : new Date().getTime();
    let billRateForSync: BillRate | null = null;
    const sortedBillRates = this.getDESCsortedBillRates(billRates).filter(
      (billRate) => billRate.billRateConfig.id === 1
    );
    for (let billRate of sortedBillRates) {
      const timeStamp = new Date(billRate.effectiveDate).getTime();
      if (timeStamp < jobStartDateTimeStamp) {
        billRateForSync = billRate;
        break;
      }
    }
    return billRateForSync;
  }

  private getDESCsortedBillRates(billRates: BillRate[]): BillRate[] {
    return billRates.sort((item1: BillRate, item2: BillRate) => {
      return new Date(item2.effectiveDate).getTime() - new Date(item1.effectiveDate).getTime();
    });
  }
}
