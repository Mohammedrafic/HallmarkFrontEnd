export interface IOrderCredentialItem {
  credentialId: number;
  credentialName: string;
  credentialType: string;
  reqForSubmission: boolean;
  reqForOnboard: boolean;
  optional: boolean;
  comment: string;
  isPredefined: boolean;
}

export interface IOrderCredential {
  comments: string;
  credentialType: string;
  credentialTypeId: number;
  isActive: boolean;
  isPredefined: boolean;
  masterCredentialId: number;
  name: string;
  reqOnboard: boolean;
  reqSubmission: boolean;
}

export interface IOrderCredential {
  type: string;
  items: IOrderCredentialItem[];
  totalPages: number;
  totalCount: number;
}
