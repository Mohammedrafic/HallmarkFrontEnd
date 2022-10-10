import { DocumentFolder, NodeItem, Documents, DocumentTypeFilter, DocumentsFilter, DocumentTagFilter, FolderTreeFilter, DownloadDocumentDetailFilter, DownloadDocumentDetail, DeleteDocumentsFilter } from "../model/document-library.model";

export class GetFoldersTree {
  static readonly type = '[documentsLibrary] Get folders tree items';
  constructor(public folderTreeFilter: FolderTreeFilter) { }
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
  static readonly type = '[documentsLibrary] Save document folder';
  constructor(public documentFolder: DocumentFolder) { }
}

export class SaveDocuments {
  static readonly type = '[documentsLibrary] Save document';
  constructor(public document: Documents) { }
}

export class GetDocumentTypes {
  static readonly type = '[documentsLibrary] Get document Types';
  constructor(public documentTypeFilter: DocumentTypeFilter) { }
}

export class SearchDocumentTags {
  static readonly type = '[documentsLibrary] Search document Tags';
  constructor(public documentTagFilter: DocumentTagFilter) { }
}

export class GetDocumentDownloadDeatils {
  static readonly type = '[documentsLibrary] Get document download details';
  constructor(public documentDowloadDetailFilter: DownloadDocumentDetailFilter) { }
}

export class GetDocumentDownloadDeatilsSucceeded {
  static readonly type = '[documentsLibrary] Get document download details Succeeded';
  constructor(public documentDownloadDetail: DownloadDocumentDetail) { }
}

export class DeletDocuments {
  static readonly type = '[documentsLibrary] Delete documents';
  constructor(public deleteDocumentsFilter: DeleteDocumentsFilter) { }
}

export class DeletDocumentsSucceeded {
  static readonly type = '[SpecialProject] Delete documents succeeded';
  constructor() { }
}
