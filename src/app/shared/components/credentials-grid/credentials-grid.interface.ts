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
