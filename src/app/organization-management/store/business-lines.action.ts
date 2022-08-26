import { BusinessLines } from "@shared/models/business-line.model";

export class GetBusinessLines {
  static readonly type = '[Business lines] Get Business Lines';
}

export class DeleteBusinessLine {
  static readonly type = '[Business lines] Delete Business Line';
  constructor(public id: number) {}
}

export class AddBusinessLine {
  static readonly type = '[Business lines] Add Business Line';
  constructor(public businessLine: BusinessLines) {}
}
