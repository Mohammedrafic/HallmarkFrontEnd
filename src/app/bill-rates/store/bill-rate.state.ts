import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { BillRateService } from '@bill-rates/services/bill-rate.service';
import { BillRateOption } from '@shared/models/bill-rate.model';
import { GetBillRateOptions } from './bill-rate.actions';

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

  constructor(private billRateService: BillRateService) {}

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
