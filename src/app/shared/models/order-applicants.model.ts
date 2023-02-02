export type OrderApplicantsInitialData = {
  candidateId: number;
  orderId: number;
  organizationId: number;
  jobStartDate: string;
  jobEndDate: string;
  orderBillRate: number;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  availableStartDate: string;
  yearsOfExperience: number;
  expAsTravelers?: number;
  requestComment?: string;
  skill?: string;
  candidatePayRate: string;
}

export type OrderApplicantsApplyData = {
  orderId: number;
  organizationId: number;
  candidateId: number;
  candidateBillRate?: number;
  expAsTravelers?: number;
  availableStartDate?: string;
  requestComment?: string;
  candidatePayRate: string;
}
