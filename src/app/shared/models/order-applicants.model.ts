export type OrderApplicantsInitialData = {
  candidateId: number;
  orderId: number;
  organizationId: number;
  jobStartDate: string;
  jobEndDate: string;
  orderBillRate: number;
  locationId: number;
  locationName: string;
  availableStartDate: string;
  yearsOfExperience: number;
}

export type OrderApplicantsApplyData = {
  orderId: number;
  organizationId: number;
  candidateId: number;
  candidateBillRate: number;
  expAsTravelers: number;
  availableStartDate: string;
  requestComment: string;
}
