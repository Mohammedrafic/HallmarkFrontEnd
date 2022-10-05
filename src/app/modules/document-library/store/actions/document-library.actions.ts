import { DocumentFolder, NodeItem } from "../model/document-library.model";

export class GetDocumentsTree {
  static readonly type = '[documentsLibrary] Get document tree items';
  constructor() { }
}

export class GetDocumentsSelectedNode {
  static readonly type = '[documentsLibrary] Get document selected node';
  constructor(public payload: NodeItem) { }
}

export class IsAddNewFolder {
  static readonly type = '[documentsLibrary] Get documents';
  constructor(public payload: boolean) { }
}

export class GetDocuments {
  static readonly type = '[documentsLibrary] Get documents';
  constructor() { }
}

export class SaveDocumentFolder {
  static readonly type = '[documentsLibrary] Save Document Folder';
  constructor(public documentFolder: DocumentFolder) { }
}
