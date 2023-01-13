import { formatDate } from '@angular/common';

export const getCandidateDate = (date: Date | null | string | undefined): string | null => {
  return date ? formatDate(date, 'MM/dd/yyy', 'en-US', 'UTC') : null;
};
