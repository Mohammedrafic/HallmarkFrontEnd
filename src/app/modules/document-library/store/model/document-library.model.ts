import { PageOfCollections } from '@shared/models/page.model';

export class FolderTreeItem {
  id: number;
  name: string;
  businessUnitId: number | null;
  fileType: string;
  parentId: number | null;
  Children: FolderTreeItem[];
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
  regionId: number | null;
  locationId: number | null;
  documentName: number | null;
  folderId: number;
  startDate?: Date | null;
  endDate?: Date | null;
  docTypeId: number;
  tags: string;
  comments: string;
  selectedFile?: Blob | null
  isEdit?: boolean | false
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
  regionId: number | null;
  regionName: string | null;
  locationId: number | null;
  locationName: string | null;
  documentVisibilities: any | null;
}

export class DocumentsFilter {
  documentId: number | null;
  businessUnitType: number;
  businessUnitId: number | null;
  regionId: number | null;
  locationId: number | null;
  folderId: number | null
  getAll: boolean | null
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

export class DeleteDocumentsFilter {
  documentIds: number[];
  businessUnitType: number;
  businessUnitId: number | null;
}

export class SharedDocumentPostDto {
  documentId: number;
  sharedDocumentIds: number[];
}
export class ShareDocumentsFilter {
  documentIds: number[];
  businessUnitType: number;
  businessUnitId: number | null;
  regionLocationMappings: { [id: number]: number[]; } | null
}




