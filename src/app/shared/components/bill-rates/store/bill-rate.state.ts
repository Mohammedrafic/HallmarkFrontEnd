import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { BillRatesService } from "@shared/services/bill-rates.service";
import { BillRateOption } from '@shared/models/bill-rate.model';
import { GetBillRateOptions } from '@shared/components/bill-rates/store/bill-rate.actions';

export interface BillRateStateModel {
  billRateOptions: BillRateOption[];
}

@State<BillRateStateModel>({
  name: 'billRate',
  defaults: {
    billRateOptions: [],
  },
})
@Injectable()
export class BillRateState {
  @Selector()
  static billRateOptions(state: BillRateStateModel): BillRateOption[] {
    return state.billRateOptions;
  }

  constructor(private billRateService: BillRatesService) {}

  @Action(GetBillRateOptions)
  GetBillRateOptions({ patchState }: StateContext<BillRateStateModel>): Observable<BillRateOption[]> {
    return this.billRateService.getBillRateOptions().pipe(
      tap((payload) => {
        patchState({ billRateOptions: payload });
        return payload;
      })
    );
  }
}
