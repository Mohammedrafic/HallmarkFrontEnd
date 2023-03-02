import { DateTimeHelper } from '@core/helpers';
import { IrpOrderCandidate, IrpOrderCandidateDto } from '@shared/models/order-management.model';
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
        lastShiftTime: candidate.lastShiftFrom ? `${lastTimeFrom} - ${lastTimeTo}` : '',
        nextShiftTime: candidate.nextShiftFrom ? `${nextTimeFrom} - ${nextTimeTo}` : '',
      };

      return irpCandidate;
    }),
  };

  return candidatesData;
};
