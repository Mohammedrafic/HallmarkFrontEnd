import {
  DocumentFolder, NodeItem, Documents, DocumentTypeFilter, DocumentsFilter,
  DocumentTagFilter, FolderTreeFilter, DownloadDocumentDetailFilter, DownloadDocumentDetail, DeleteDocumentsFilter,
  ShareDocumentsFilter, ShareDocumentInfoFilter, UnShareDocumentsFilter, DeleteDocumentFolderFilter, PreviewDocumentDetailFilter, DownloadPreviewDetail, SharedDocumentInformation
} from "../model/document-library.model";
import { regionFilter } from '../model/document-library.model';
import { LocationsByRegionsFilter } from "../model/document-library.model";

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

export class GetDocumentPreviewDeatils {
  static readonly type = '[documentsLibrary] Get document preview details';
  constructor(public documentPreveiwDetailFilter: PreviewDocumentDetailFilter) { }
}

export class GetDocumentDownloadDeatilsSucceeded {
  static readonly type = '[documentsLibrary] Get document download details Succeeded';
  constructor(public documentDownloadDetail: DownloadDocumentDetail) { }
}

export class GetDocumentPreviewDeatilsSucceeded {
  static readonly type = '[documentsLibrary] Get document preview details Succeeded';
  constructor(public documentPreviewDetail: DownloadPreviewDetail) { }
}

export class DeletDocuments {
  static readonly type = '[documentsLibrary] Delete documents';
  constructor(public deleteDocumentsFilter: DeleteDocumentsFilter) { }
}

export class DeletDocumentsSucceeded {
  static readonly type = '[documentsLibrary] Delete documents succeeded';
  constructor() { }
}

export class ShareDocuments {
  static readonly type = '[documentsLibrary] Share documents';
  constructor(public shareDocumentsFilter: ShareDocumentsFilter) { }
}

export class ShareDocumentsSucceeded {
  static readonly type = '[documentsLibrary] Share documents succeeded';
  constructor() { }
}

export class GetDocumentById {
  static readonly type = '[documentsLibrary] Get document by id';
  constructor(public documentId: number) { }
}

export class GetSharedDocumentInformation {
  static readonly type = '[documentsLibrary] Get document information by Id';
  constructor(public sharedDocumentInformation: SharedDocumentInformation) { }
}

export class GetSharedDocuments {
  static readonly type = '[documentsLibrary] Get Shared Documents';
  constructor(public documentsFilter: ShareDocumentInfoFilter) { }
}

export class UnShareDocuments {
  static readonly type = '[documentsLibrary] UnShare documents';
  constructor(public unShareDocumentsFilter: UnShareDocumentsFilter) { }
}

export class UnShareDocumentsSucceeded {
  static readonly type = '[documentsLibrary] UnShare documents succeeded';
  constructor() { }
}

export class GetRegionsByOrganizations {
  static readonly type = '[documentsLibrary] Get The List Of Regions By Organizations';
  constructor(public filter?: regionFilter) { }
}

export class GetLocationsByRegions {
  static readonly type = '[documentsLibrary] Get The List Of Locations By Regions';
  constructor(public filter?: LocationsByRegionsFilter) { }
}

export class GetShareAssociateAgencies {
  static readonly type = '[documentsLibrary] Get The List Of Associated Agencies';
  constructor() { }
}

export class GetShareOrganizationsDtata {
  static readonly type = '[documentsLibrary] Get The List Of Share Organizations Data';
  constructor() { }
}

export class SelectedBusinessType {
  static readonly type = '[documentsLibrary] selectedBusinessType';
  constructor(public businessUnitType:number) { }
}

export class IsDeleteEmptyFolder {
  static readonly type = '[documentsLibrary] delete empty folder';
  constructor(public isDeleteFolder: boolean) { }
}

export class DeleteEmptyDocumentsFolder {
  static readonly type = '[documentsLibrary] delete empty documents folder';
  constructor(public deleteDocumentFolderFilter: DeleteDocumentFolderFilter) { }
}

export class DeletDocumentFolderSucceeded {
  static readonly type = '[documentsLibrary] Delete document folder succeeded';
  constructor() { }
}

export class GetDocumentsByCognitiveSearch {
  static readonly type = '[documentsLibrary] Get documents by CognitiveSearch';
  constructor(public keyword: string, public businessUnitType: any, public businessUnitId?: any, public folderId?: any) { }
}

export class ClearLocationsAndRegions {
  static readonly type = '[documentsLibrary] Clear List Of Locations and Regions';
}
