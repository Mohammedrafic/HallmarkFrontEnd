import { CalcDaysMs } from '@core/helpers/functions.helper';
import { DatesRangeType } from '@shared/enums';

export const ConfirmWeekChangeMessage = 'Are you sure you want to change week period without saving changes?';



export const WeekInMs = CalcDaysMs(7);

export const WeekRangeDimensions = {
  [DatesRangeType.Day]: CalcDaysMs(1),
  [DatesRangeType.OneWeek]: CalcDaysMs(7),
  [DatesRangeType.TwoWeeks]: CalcDaysMs(14),
  [DatesRangeType.Month]: CalcDaysMs(28),
};

export const RangeDaysOptions = {
  [DatesRangeType.Day]: 1,
  [DatesRangeType.OneWeek]: 7,
  [DatesRangeType.TwoWeeks]: 14,
  [DatesRangeType.Month]: 28,
};
