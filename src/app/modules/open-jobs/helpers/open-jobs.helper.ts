import { DateTimeHelper } from '@core/helpers';

export const GetLocalDate = (): Date => {
  return DateTimeHelper.setCurrentTimeZone(new Date().toDateString());
};
