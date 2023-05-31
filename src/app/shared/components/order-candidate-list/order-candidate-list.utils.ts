import { formatDate } from '@angular/common';

import { DateTimeHelper } from '@core/helpers';
import { IrpOrderCandidate, IrpOrderCandidateDto, OrderAvailabilityOverlap } from '@shared/models/order-management.model';
import { PageOfCollections } from '@shared/models/page.model';
import { getOrientationDate } from '@shared/components/order-candidate-list/edit-candidate-list.helper';

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
      const availabilityOverlap = GetAvailabilityOverlap(candidate?.availabilityOverlap);
      const timeFormat = 'HH:mm';
      const lastTimeFrom = DateTimeHelper.formatDateUTC(candidate.lastShiftFrom, timeFormat);
      const lastTimeTo = DateTimeHelper.formatDateUTC(candidate.lastShiftTo, timeFormat);
      const nextTimeFrom = DateTimeHelper.formatDateUTC(candidate.nextShiftFrom, timeFormat);
      const nextTimeTo = DateTimeHelper.formatDateUTC(candidate.nextShiftTo, timeFormat);
      const irpCandidate: IrpOrderCandidate = {
        ...candidate,
        lastShiftTime: candidate.lastShiftFrom ? `${lastTimeFrom} - ${lastTimeTo}` : '',
        nextShiftTime: candidate.nextShiftFrom ? `${nextTimeFrom} - ${nextTimeTo}` : '',
        departmentOrientationDate: getOrientationDate(candidate.departmentOrientationDate),
        availabilityOverlap,
      };

      return irpCandidate;
    }),
  };

  return candidatesData;
};

export const GetAvailabilityOverlap = (overlap: OrderAvailabilityOverlap): OrderAvailabilityOverlap => {
  if(overlap) {
    return {
      ...overlap,
      tooltip: `${formatDate(overlap.start, 'HH:mm', 'en-US', 'UTC')} -
                ${formatDate(overlap.end, 'HH:mm', 'en-US', 'UTC')}`,
    };
  }

  return {} as OrderAvailabilityOverlap;
};
