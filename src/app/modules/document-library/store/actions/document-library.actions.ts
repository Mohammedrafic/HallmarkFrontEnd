import { DocumentFolder, NodeItem, Documents, DocumentTypeFilter, DocumentsFilter, DocumentTagFilter } from "../model/document-library.model";

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
  constructor(public documentsFilter: DocumentsFilter) { }
}

export class SaveDocumentFolder {
  static readonly type = '[documentsLibrary] Save Document Folder';
  constructor(public documentFolder: DocumentFolder) { }
}

export class SaveDocuments {
  static readonly type = '[documentsLibrary] Save Document';
  constructor(public document: Documents) { }
}

export class GetDocumentTypes {
  static readonly type = '[documentsLibrary] Get Document Types';
  constructor(public documentTypeFilter: DocumentTypeFilter) { }
}

export class SearchDocumentTags {
  static readonly type = '[documentsLibrary] Search Document Tags';
  constructor(public documentTagFilter: DocumentTagFilter) { }
}
