import { ScheduleType } from '../../../enums';
import { ScheduleDateItem, ScheduleMonthCardConfig } from '../../../interface';
import { ScheduleCardTooltips } from '../../schedule-card/schedule-card.interface';

export const ScheduleCardTypeMap: Map<ScheduleType, ScheduleMonthCardConfig> =
  new Map<ScheduleType, ScheduleMonthCardConfig>()
  .set(ScheduleType.Book, {
      title: '',
      titleColor: '#000000',
      timeColor: '#060715',
      showTitleToolTip: true,
  }).set(ScheduleType.Unavailability, {
      title: '',
      titleColor: '#FF5858' ,
      timeColor: '#FF5858' ,
  }).set(ScheduleType.Availability, {
      title: 'Available',
      titleColor: '#70B16E',
      timeColor:'#70B16E',
  });

export const GetMonthCardConfig = (scheduleItem: ScheduleDateItem): ScheduleMonthCardConfig | undefined => {
  return ScheduleCardTypeMap.get(scheduleItem.daySchedules[0]?.scheduleType);
};

export const CardTooltip: ScheduleCardTooltips = {
  orderTooltip: '',
  additionalTooltip: '',
};
