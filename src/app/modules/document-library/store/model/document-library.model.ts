import { PageOfCollections } from '@shared/models/page.model';

export class FolderTreeItem {
  id: number;
  name: string;
  businessUnitId: number | null;
  fileType: string;
  parentId: number | null;
  children: FolderTreeItem[];
}

export class FolderTreeFilter {
  businessUnitType: number;
  businessUnitId?: number | null;
}

export class NodeItem {
  expanded: boolean;
  hasChildren: boolean;
  id: number;
  isChecked?: boolean;
  parentID?: number;
  selected: boolean
  text: string;
  fileType: string;
  businessUnitId?: number | null;
}

export class DocumentFolder {
  id: number;
  name: string;
  parentFolderId?: number | null;
  status: number;
  isDeleted: boolean;
  businessUnitId?: number | null;
  businessUnitType?: number | null
}

export class Documents {
  id: number;
  businessUnitType: number;
  businessUnitId?: number | null;
  regionLocationMappings: { [id: number]: number[]; } | null;
  documentName: number | null;
  folderId: number;
  startDate?: Date | null;
  endDate?: Date | null;
  docTypeId: number;
  tags: string;
  comments: string;
  selectedFile?: Blob | null
  isEdit?: boolean | false
  status?: number;
}

export class DocumentLibraryDto {
  id: number;
  name: string;
  fileName: string;
  folderId?: number | null;
  folderName: string;
  startDate?: Date | null;
  endDate?: Date | null;
  docType: number;
  docTypeName: string;
  uploadedBy: string;
  uploadedByName: string;
  tags: string;
  comments: string;
  status: string;
  businessUnitId: number | null;
  businessUnitName: string | null;
  regionId: string | null;
  regionName: string | null;
  locationId: string | null;
  locationName: string | null;
  isSharedWithMe: boolean;
  isSharedByMe: boolean;
  documentVisibilities: any | null;
}

export class DocumentsFilter {
  documentId: number | null;
  businessUnitType: number;
  businessUnitId: number | null;
  regionId: number | null;
  locationId: number | null;
  folderId: number | null;
  includeSharedWithMe: boolean;
  showAllPages: boolean;
}
export type DocumentsLibraryPage = PageOfCollections<DocumentLibraryDto>;

export class DocumentTypes {
  id: number;
  name: string;
}

export class DocumentTypeFilter {
  businessUnitType: number;
  businessUnitId?: number | null;
}

export class DocumentTags {
  id: number;
  name: string;
}

export class DocumentTagFilter {
  businessUnitType: number;
  businessUnitId?: number | null;
  keyword: string
}

export class DownloadDocumentDetail {
  id: number;
  name: string;
  fileName: string;
  extension: string;
  fileAsBase64: string;
  sasUrl: string;
  contentType: string;
  metadata: any;
  folderId: number | null;
  active: boolean;
  createdAt: Date;
}

export class DownloadPreviewDetail {
  id: number;
  name: string;
  fileName: string;
  extension: string;
  fileAsBase64: string;
  sasUrl: string;
  contentType: string;
  metadata: any;
  folderId: number | null;
  active: boolean;
  createdAt: Date;
}

export class DownloadDocumentDetailFilter {
  documentId: number;
  businessUnitType: number;
  businessUnitId: number | null;
}

export class PreviewDocumentDetailFilter {
  documentId: number;
  businessUnitType: number;
  businessUnitId: number | null;
}

export class DeleteDocumentsFilter {
  documentIds: number[];
  businessUnitType: number;
  businessUnitId: number | null;
}

export class SharedDocumentInformation{
  businessUnitType: number;
  documentId: number;
}

export class SharedDocumentPostDto {
  documentId: number;
  sharedDocumentIds: number[];
}
export class ShareDocumentsFilter {
  documentIds: number[];
  businessUnitType: number;
  businessUnitIds: number[] | null;
  regionLocationMappings: { [id: number]: number[]; } | null;
  isShareWhileUpload: boolean;
}

export class ShareDocumentDto {
  id: number;
  documentId: number;
  businessUnitType: number;
  businessUnitId: number | null;
  regionId: number | null;
  locationId: number | null;
  document : DocumentLibraryDto
}

export class ShareDocumentInfoFilter {
  documentId: number | null;
  businessUnitType: number;
  businessUnitId: number | null;
  regionId: number | null;
  locationId: number | null;
  folderId: number | null
  getAll: boolean | null
}
export type ShareDocumentInfoPage = PageOfCollections<ShareDocumentDto>;

export class UnShareDocumentsFilter {
  documentIds: number[];
}

export class regionFilter {
  ids?: number[];
  name?: string[];
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
  getAll?: boolean;
  businessUnitId: number;
}

export class LocationsByRegionsFilter {
  ids?: number[];
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
  getAll?: boolean;
  businessUnitId: number;
}

export class AssociateAgencyDto {
  agencyId: number;
  agencyName: string;
}

export class ShareOrganizationsData {
  id: number;
  name: string;
}

export class DeleteDocumentFolderFilter {
  folderId: number;
  businessUnitType: number;
  businessUnitId: number | null;
}





