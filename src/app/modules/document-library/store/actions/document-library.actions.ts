import { NodeItem } from "../model/document-library.model";

export class GetDocumentsTree {
  static readonly type = '[documents] Get document tree items';
  constructor() { }
}

export class GetDocumentsSelectedNode {
  static readonly type = '[documents] Get document selected node';
  constructor(public payload: NodeItem) { }
}

export class IsAddNewFolder {
  static readonly type = '[documents] Get documents';
  constructor(public payload: boolean) { }
}

export class GetDocuments {
  static readonly type = '[documents] Get documents';
  constructor() { }
}
