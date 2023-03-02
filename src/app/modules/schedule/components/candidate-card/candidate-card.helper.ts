import { formatDate } from '@angular/common';

import { ScheduleCandidateCard, ScheduleDateItem, ScheduleItem } from '../../interface';
import { IrpOrderType } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.enum';

export const PrepareScheduleCandidate = (schedule: ScheduleDateItem[]): ScheduleCandidateCard[] => {
  return schedule.map((card: ScheduleDateItem) => {
    return card.daySchedules
      .filter((day: ScheduleItem) => day.orderMetadata?.orderType === IrpOrderType.LongTermAssignment)
      .map((day: ScheduleItem) => {
        return {
          startDate: formatDate(day.startDate, 'MM/dd/yyyy', 'en-US'),
          endDate: formatDate(day.endDate, 'MM/dd/yyyy', 'en-US'),
          orderType: day.orderMetadata?.orderType,
          region: day.orderMetadata?.region,
          location: day.orderMetadata?.location,
          department: day.orderMetadata?.department,
        };
      });
  }).flat();
};

export const GetCandidateTypeTooltip = (candidateCard: ScheduleCandidateCard[]): string => {
  return candidateCard.map((schedule: ScheduleCandidateCard) => {
    const { startDate,endDate,region,location,department } = schedule;
    return `${region} - ${location} - ${department}, ${startDate} - ${endDate}`;
  }).join(' ');
};
