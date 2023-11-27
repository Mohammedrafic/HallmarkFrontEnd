import { Status } from "./document-viewer.state.model";

export class GetFiles {
  static readonly type = '[document-viewer] Get Files';
  constructor(public fileHash: string, public fileId: string) {}
}

export class GetFilesSucceeded {
  static readonly type = '[document-viewer] Get Files Succeeded';
  constructor(public payload: Blob) {}
}

export class GetPdfFiles {
  static readonly type = '[document-viewer] Get PDF Files';
  constructor(public fileHash: string, public fileId: string) {}
}


export class GetPdfFilesSucceeded {
  static readonly type = '[document-viewer] Get PDF Files Succeeded';
  constructor(public payload: Blob) {}
}

export class GetGroupedFiles {
  static readonly type = '[document-viewer] Get Grouped Files';
  constructor(public fileHash: string) {}
}

export class SaveStatus {
  static readonly type = '[status] Save Status';
  constructor(public orderId: number | null, public jobId: number | null, public statusText: string, public statusId: number | null) {}
}

export class SaveStatusSucceeded {
  static readonly type = '[status] Save Status Succeeded';
  constructor(public orderId: number | null, public jobId: number | null, public statusText: string, statusId: number | null) {}
}

export class SaveStatusFailed {
  static readonly type = '[status] Save Status Failed';
}
