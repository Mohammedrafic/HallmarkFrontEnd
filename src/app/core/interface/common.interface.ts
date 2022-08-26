export interface FileForUpload {
  blob: Blob;
  fileName: string;
}

export interface DropdownOption {
  text: string;
  value: string | number;
}

export interface DataSourceItem {
  id: number;
  name: string;
}
export interface CommonDialogConformMessages {
  confirmUnsavedChages: string;
  confirmTabChange: string;
  confirmAddFormCancel: string;
  confirmRecordDelete: string;
  confirmOrderChange: string;
  confirmEdit: string;
}
