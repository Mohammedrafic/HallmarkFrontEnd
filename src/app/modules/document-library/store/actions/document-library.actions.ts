import { NodeItem } from "../model/document-library.model";

export class GetDocumentsTree {
  static readonly type = '[documents] Get document tree items';
  constructor() { }
}

export class GetDocumentsSelectedNode {
  static readonly type = '[documents] Get document selected node';
  constructor(public payload: NodeItem) { }
}
