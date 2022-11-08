export interface FileForUpload {
  blob: Blob;
  fileName: string;
  size?: string;
}

export interface DropdownOption {
  text: string;
  value: string | number;
}

export interface DataSourceItem {
  id: number;
  name: string;
  organizationId?: number;
}
export interface CommonDialogConformMessages {
  confirmUnsavedChages: string;
  confirmTabChange: string;
  confirmAddFormCancel: string;
  confirmRecordDelete: string;
  confirmOrderChange: string;
  confirmEdit: string;
  confirmBulkApprove: string;
}
