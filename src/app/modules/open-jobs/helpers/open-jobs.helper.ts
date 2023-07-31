import { DateTimeHelper } from '@core/helpers';

export const GetLocalDate = (): string => {
  const today = DateTimeHelper.setInitDateHours(new Date().toUTCString());
  return DateTimeHelper.setUtcTimeZone(today) ;
};
