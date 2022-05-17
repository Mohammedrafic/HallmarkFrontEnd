import { Shift } from "src/app/shared/models/shift.model";

export class GetShiftsByPage {
  static readonly type = '[shift] Get Shifts by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class SaveShift {
  static readonly type = '[shift] Save Shift';
  constructor(public payload: Shift) {}
}

export class SaveShiftSucceeded {
  static readonly type = '[shift] Save Shift Succeeded';
  constructor(public payload: Shift) {}
}

export class DeleteShift {
  static readonly type = '[shift] Remove Shift';
  constructor(public payload: Shift) { }
}

export class DeleteShiftSucceeded {
  static readonly type = '[shift] Remove Shift Succeeded';
  constructor(public payload: Shift) { }
}
