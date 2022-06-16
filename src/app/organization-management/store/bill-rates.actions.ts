import { BillRateFilters, BillRateSetupPost } from '@shared/models/bill-rate.model';

export class GetBillRates {
  static readonly type = '[billrates] Get Bill Rates Pages';
  constructor(public filter: BillRateFilters) {}
}

export class SaveUpdateBillRate {
  static readonly type = '[billrates] Save/Update Bill Rate';
  constructor(public payload: BillRateSetupPost, public pageNumber: number, public pageSize: number) {}
}

export class SaveUpdateBillRateSucceed {
  static readonly type = '[billrates] Save/Update Bill Rate Succeed';
  constructor() {}
}

export class DeleteBillRatesById {
  static readonly type = '[billrates] Delete Bill Rate By Id';
  constructor(public payload: number, public pageNumber: number, public pageSize: number) {}
}

export class GetBillRateOptions {
  static readonly type = '[billrates] Get Bill Rate Options';
  constructor() {}
}
