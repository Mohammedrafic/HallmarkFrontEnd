import {BillRateFilters, BillRateSetupPost, ExternalBillRateSave } from '@shared/models/bill-rate.model';
import { ExportPayload } from '@shared/models/export.model';

export class GetBillRates {
  static readonly type = '[billrates] Get Bill Rates Pages';
  constructor(public filter: BillRateFilters) {}
}

export class GetExternalBillRateType {
  static readonly type = '[billrates] Get Bill Rates Types Pages';
  constructor(public filter?: BillRateFilters) {}
}

export class GetExternalBillRateMapping {
  static readonly type = '[billrates] Get Bill Rates Mapping Pages';
  constructor(public filter: BillRateFilters) {}
}

export class GetExternalBillRateMappingById {
  static readonly type = '[billrates] Get Bill Rates Mapping Pages By Id';
  constructor(public id: number) {}
}

export class SaveUpdateBillRate {
  static readonly type = '[billrates] Save/Update Bill Rate';
  constructor(public payload: BillRateSetupPost, public filters: BillRateFilters) {}
}

export class SaveBillRateType {
  static readonly type = '[billrates] Save Bill Rate Type';
  constructor(public payload: ExternalBillRateSave, public pageNumber: number, public pageSize: number) {}
}

export class UpdateBillRateType {
  static readonly type = '[billrates] Update Bill Rate Type';
  constructor(public id: number, public payload: ExternalBillRateSave, public pageNumber: number, public pageSize: number) {}
}

export class SaveUpdateBillRateMapping {
  static readonly type = '[billrates] Save/Update Bill Rate Mapping';
  constructor(public id: number, public payload: Array<{id: number}>, public pageNumber: number, public pageSize: number) {}
}

export class SaveUpdateBillRateSucceed {
  static readonly type = '[billrates] Save/Update Bill Rate Succeed';
  constructor() {}
}

export class ShowConfirmationPopUp {
  static readonly type = '[billrates] Save/Update Bill Rate Failed';
  constructor() {}
}

export class DeleteBillRatesById {
  static readonly type = '[billrates] Delete Bill Rate By Id';
  constructor(public payload: number, public filters: BillRateFilters) {}
}

export class DeleteBillRatesTypeById {
  static readonly type = '[billrates] Delete Bill Rate Type By Id';
  constructor(public payload: number, public pageNumber: number, public pageSize: number) {}
}

export class DeleteBillRatesMappingById {
  static readonly type = '[billrates] Delete Bill Rate Mapping By Id';
  constructor(public payload: number, public pageNumber: number, public pageSize: number) {}
}

export class GetBillRateOptions {
  static readonly type = '[billrates] Get Bill Rate Options';
  constructor() {}
}

export class ExportBillRateSetup {
  static readonly type = '[billrates] Export Bill Rate Setup';
  constructor(public payload: ExportPayload) { }
}

export class ExportExternalBillRate {
  static readonly type = '[billrates] Export External Bill Rate';
  constructor(public payload: ExportPayload) { }
}

export class ExportExternalBillRateMapping {
  static readonly type = '[billrates] Export External Bill Rate Mapping';
  constructor(public payload: ExportPayload) { }
}
