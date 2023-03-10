import { formatDate } from '@angular/common';

import { LtaAssignment } from '../../interface';


export const GetCandidateTypeTooltip = (ltaAssignment: LtaAssignment | null): string => {
  if (!ltaAssignment) {
    return '';
  }

  const { startDate, endDate, region, location, department } = ltaAssignment;
  const formattedStartDate = formatDate(startDate, 'MM/dd/yyyy', 'en-US');
  const formattedEndDate = formatDate(endDate, 'MM/dd/yyyy', 'en-US');

  return `${region} - ${location} - ${department}, ${formattedStartDate} - ${formattedEndDate}`;
};
