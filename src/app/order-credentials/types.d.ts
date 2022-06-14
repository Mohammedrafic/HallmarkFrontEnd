export interface IOrderCredentialItem {
  credentialId: number;
  credentialName: string;
  credentialType: string;
  reqForSubmission: boolean;
  reqForOnboard: boolean;
  optional: boolean;
  comment: string;
}

export interface IOrderCredential {
  type: string;
  items: IOrderCredentialItem[];
  totalPages: number;
  totalCount: number;
}
