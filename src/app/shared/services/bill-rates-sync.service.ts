import { Injectable } from '@angular/core';
import { BaseObservable } from '@core/helpers';
import { BillRate, BillRateCalculationType } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class BillRatesSyncService {
  private rateFormChanged$ = new BaseObservable<boolean>(false);

  public getBillRateForSync(
    billRates: BillRate[],
    jobStartDate?: Date,
    isLocal = false,
    showWithLongerDate = false
  ): BillRate | null {
    const jobStartDateTimeStamp = jobStartDate ? jobStartDate.getTime() : new Date().getTime();
    let billRateForSync: BillRate | null = null;
    const billRateType = isLocal ? BillRateCalculationType.RegularLocal : BillRateCalculationType.Regular;
    const sortedBillRates = this.getDESCsortedBillRates(billRates).filter(
      (billRate) => billRate.billRateConfig.id === billRateType
    );
    for (const billRate of sortedBillRates) {
      const timeStamp = new Date(billRate.effectiveDate).getTime();
      if (timeStamp < jobStartDateTimeStamp) {
        billRateForSync = billRate;
        break;
      }
    }

    if (!billRateForSync && showWithLongerDate) {
      billRateForSync = sortedBillRates[0] || null;
    }

    return billRateForSync;
  }

  public setFormChangedState(value: boolean): void {
    this.rateFormChanged$.set(value);
  }

  public getFormChangedState(): boolean {
    return this.rateFormChanged$.get();
  }

  private getDESCsortedBillRates(billRates: BillRate[]): BillRate[] {
    return billRates.sort((item1: BillRate, item2: BillRate) => {
      return new Date(item2.effectiveDate).getTime() - new Date(item1.effectiveDate).getTime();
    });
  }
}
