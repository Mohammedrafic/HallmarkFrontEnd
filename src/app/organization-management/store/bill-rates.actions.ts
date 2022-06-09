export class GetBillRates {
  static readonly type = '[billrates] Get Bill Rates Pages';
  constructor() {}
}

export class SaveUpdateBillRate {
  static readonly type = '[billrates] Save/Update Bill Rate';
  constructor(public payload: any) {}
}

export class DeleteBillRatesById {
  static readonly type = '[billrates] Delete Bill Rate By Id';
  constructor(public payload: number) {}
}
