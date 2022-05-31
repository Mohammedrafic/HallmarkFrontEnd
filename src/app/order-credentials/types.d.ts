export interface IOrderCredentialItem {
  name: string;
  reqForSubmission: boolean;
  reqForOnboard: boolean;
  optional: boolean;
  comments: string;
}

export interface IOrderCredential {
  type: string;
  items: IOrderCredentialItem[];
  totalPages: number;
  totalCount: number;
}
