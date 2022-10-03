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



export class DocumentsInfo {
  docId: number;
  name: string;
  organization: string;
  status: string;
  region: string;
  location: string;
  type: string;
  tags: string;
  startDate: Date;
  endDate: Date;
  sharedWith: string;
  comments: string;
}

export type DocumentsLibraryPage = PageOfCollections<DocumentsInfo>;

