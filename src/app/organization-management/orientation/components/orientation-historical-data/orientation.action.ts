import { ExportPayload } from "@shared/models/export.model";

export class ExportOrientation {
    static readonly type = '[admin] Export Orientation list';
    constructor(public payload: ExportPayload) {}
  }