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
