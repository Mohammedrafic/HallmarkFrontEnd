import { ValueGetterParams } from '@ag-grid-community/core';

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
  reason?: string;
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

export interface TypedValueGetterParams<T> extends ValueGetterParams {
  data: T;
}

export interface ParamsFromObject {
  [param: string]: string | string[];
}

interface PagerProp {
  currentPage: number;
}

export interface PagerChangeEvent {
  cancel: boolean;
  currentPage: number;
  name: string;
  newProp: PagerProp;
  oldProp: PagerProp;
}

export interface OrginazationModuleSettings {
  isFeatureIrpEnabled: boolean;
  isIrpDisplayed: boolean;
}

export interface DatePeriod {
  from: string;
  to: string;
}
