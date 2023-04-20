import { PayRateFilters, PayRateSetupPost } from '@shared/models/pay-rate.model';
import { ExportPayload } from '@shared/models/export.model';

export class GetPayRates {
  static readonly type = '[payrates] Get Pay Rates Pages';
  constructor(public filter: PayRateFilters) {}
}

export class SaveUpdatePayRate {
  static readonly type = '[payrates] Save/Update Pay Rate';
  constructor(public payload: PayRateSetupPost, public filters: PayRateFilters) {}
}

export class SaveUpdatePayRateSucceed {
  static readonly type = '[payrates] Save/Update Pay Rate Succeed';
  constructor() {}
}

export class ShowConfirmationPopUp {
  static readonly type = '[payrates] Save/Update Pay Rate Failed';
  constructor() {}
}

export class DeletePayRatesById {
  static readonly type = '[payrates] Delete Pay Rate By Id';
  constructor(public payload: number, public filters: PayRateFilters) {}
}

export class ExportPayRateSetup {
  static readonly type = '[payrates] Export Pay Rate Setup';
  constructor(public payload: ExportPayload) { }
}

export class GetSkillsbyDepartment {
  static readonly type = '[payrates] Get Skills by department';
  constructor(public payload: number[]) { }
}

