import { PageOfCollections } from '@shared/models/page.model';
import { Document } from '@shared/models/document.model';

export class DocumentLibrary {
  documentItems:  DocumentItem[];
}

export class DocumentItem {
  children: DocumentItem[];
  id: number;
  businessUnitId: number;
  fileType: string;
  name: string;
}

export class NodeItem {
  expanded: boolean;
  hasChildren: boolean;
  id: number;
  isChecked?: boolean;
  parentID?: number;
  selected:boolean
  text: string;
}

export class DocumentFolder {
  id: number;
  name: string;
  parentFolderId?: number | null;
  status: number;
  isDeleted: boolean;
  businessUnitId?: number | null;
  businessUnitType?:number | null
}

export class Documents {
  id: number;
  businessUnitType: number;
  businessUnitId?: number | null;
  regionId: number | null;
  locationId: number | null;
  documentName: number | null;
  folderId: number;
  startDate?: Date |null;
  endDate?: Date | null;
  docTypeId: number;
  tags: string;
  comments: string;
}

export class DocumentLibraryDto {
  id: number;
  name: string;
  folderId?: number | null;
  folderName: string ;
  startDate?: Date | null;
  endDate?: Date | null;
  docTypeId: number;
  docTypeName: string;
  uploadedByName: string;
  tags: string;
  comments: string;
  status: string;
}

export class DocumentTypes {
  id: number;
  name: string;
}

export class DocumentTypeFilter {
  businessUnitType: number;
  businessUnitId?: number | null;
}


export class DocumentsInfo {
  docId: number;
  name: string;
  organization: string;
  status: string;
  region: string;
  location: string;
  role: string;
  type: string;
  tags: string;
  startDate: Date;
  endDate: Date;
  sharedWith: string;
  comments: string;
  documents: Document[] | null;
}

export type DocumentsLibraryPage = PageOfCollections<DocumentsInfo>;

