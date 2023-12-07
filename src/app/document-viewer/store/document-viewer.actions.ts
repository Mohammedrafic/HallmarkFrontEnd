import { Status, Statuses } from "./document-viewer.state.model";

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


