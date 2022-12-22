import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { DatePeriodId } from '../enums/schedule';

export const DatesPeriods: ItemModel[] = [
  {
    text: DatePeriodId.Day,
    id: DatePeriodId.Day,
  },
  {
    text: DatePeriodId.Week,
    id: DatePeriodId.Week,
  },
  {
    text: DatePeriodId.TwoWeeks,
    id: DatePeriodId.TwoWeeks,
  },
];
