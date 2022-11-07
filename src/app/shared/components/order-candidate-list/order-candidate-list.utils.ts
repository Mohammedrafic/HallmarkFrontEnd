import { ApplicantStatus } from "@shared/enums/applicant-status.enum";
import { ApplicantStatus as AvailableStatus } from "@shared/models/order-management.model";

export const getCandidatePositionId = (organizationPrefix: string, publicId: number, positionId: number): string => {
  if (organizationPrefix) {
    return `${organizationPrefix}-${publicId}-${positionId}`;
  } else {
    return `${publicId}-${positionId}`;
  }
};

export const getOrderPublicId = (organizationPrefix: string, publicId: number): string => {
  return `${organizationPrefix}-${publicId}`;
};

export const hasEditOrderBillRatesPermission = (applicantStatus: ApplicantStatus, statuses: AvailableStatus[]): boolean => {
  if (applicantStatus === ApplicantStatus.Shortlisted || applicantStatus === ApplicantStatus.PreOfferCustom) {
    return !!statuses.find(status => status.applicantStatus === ApplicantStatus.Shortlisted);
  }

  if (applicantStatus === ApplicantStatus.Offered) {
    return !!statuses.find(status => status.applicantStatus === ApplicantStatus.Offered);
  }

  if (
    applicantStatus === ApplicantStatus.OnBoarded
    || applicantStatus === ApplicantStatus.BillRatePending
    || applicantStatus === ApplicantStatus.OfferedBR
  ) {
    return !!statuses.find(status => status.applicantStatus === ApplicantStatus.OnBoarded)
  }

  return true;
}
