import { DateTimeHelper } from '@core/helpers';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { ApplicantStatus as AvailableStatus, IrpOrderCandidate, IrpOrderCandidateDto,
} from '@shared/models/order-management.model';
import { PageOfCollections } from '@shared/models/page.model';

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
    return !!statuses?.find(status => status.applicantStatus === ApplicantStatus.Shortlisted);
  }

  if (applicantStatus === ApplicantStatus.Offered) {
    return !!statuses?.find(status => status.applicantStatus === ApplicantStatus.Offered);
  }

  if (
    applicantStatus === ApplicantStatus.OnBoarded
    || applicantStatus === ApplicantStatus.BillRatePending
    || applicantStatus === ApplicantStatus.OfferedBR
  ) {
    return !!statuses?.find(status => status.applicantStatus === ApplicantStatus.OnBoarded);
  }

  return true;
};

export const AdaptIrpCandidates = (
  response: PageOfCollections<IrpOrderCandidateDto>): PageOfCollections<IrpOrderCandidate> => {
  const candidatesData: PageOfCollections<IrpOrderCandidate> = {
    ...response,
    items: response.items.map((candidate) => {
      const timeFormat = 'HH:mm';
      const lastTimeFrom = DateTimeHelper.formatDateUTC(candidate.lastShiftFrom, timeFormat);
      const lastTimeTo = DateTimeHelper.formatDateUTC(candidate.lastShiftTo, timeFormat);
      const nextTimeFrom = DateTimeHelper.formatDateUTC(candidate.nextShiftFrom, timeFormat);
      const nextTimeTo = DateTimeHelper.formatDateUTC(candidate.nextShiftTo, timeFormat);
  
  
      const irpCandidate: IrpOrderCandidate = {
        ...candidate,
        lastShiftTime: `${lastTimeFrom} - ${lastTimeTo}`,
        nextShiftTime: `${nextTimeFrom} - ${nextTimeTo}`,
      };
  
      return irpCandidate;
    }),
  };

  return candidatesData;
};
