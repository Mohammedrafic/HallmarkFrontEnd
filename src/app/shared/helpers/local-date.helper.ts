import { formatDate } from '@angular/common';

export const GetLocalDate = (): string => {
  return formatDate(new Date(), 'yyyy-MM-ddTHH:mm:ss', 'en-US');
};
