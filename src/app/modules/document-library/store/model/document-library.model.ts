import { PageOfCollections } from '@shared/models/page.model';

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
  selectedFile?:Blob | null
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
  organizationName: string | null;
  regionName: string | null;
  locationName: string | null;
}

export class DocumentsFilter {
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
  keyword:string
}



