import { ExportPayload } from "@shared/models/export.model";

export class ExportGeneralNote {
    static readonly type = '[admin] Export General Note';
    constructor(public payload: ExportPayload) { }
  }