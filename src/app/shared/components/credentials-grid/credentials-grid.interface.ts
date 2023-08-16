import { FilesPropModel } from '@syncfusion/ej2-angular-inputs';

export interface AddCredentialForm {
  status: string;
  insitute: string;
  createdOn: string;
  number: string;
  experience: string;
  createdUntil: string;
  completedDate: string;
  rejectReason: string;
}

export interface SearchCredentialForm {
  searchTerm: string;
  credentialTypeId: number;
}

export interface CredentialFiles extends FilesPropModel {
  size: number;
  uploadedDate: string;
}
