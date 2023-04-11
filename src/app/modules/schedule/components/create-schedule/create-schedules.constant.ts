import { X } from 'angular-feather/icons';

import { ScheduleItemType } from '../../constants';

export const Icons = {
  X,
};

export const StartTimeField = 'startTime';
export const EndTimeField = 'endTime';
export const ToggleControls = ['critical','onCall','charge', 'preceptor'];
export const ScheduleControlsToReset = [
  'shiftId',
  'startTime',
  'endTime',
  'hours',
  'critical',
  'onCall',
  'charge',
  'preceptor'
];
export const ScheduleClassesList = {
  [ScheduleItemType.Book]: 'book-form',
  [ScheduleItemType.Availability]: 'availability-form',
  [ScheduleItemType.Unavailability]: 'unavailability-form',
};

export const ScheduleCustomClassesList = {
  [ScheduleItemType.Book]: 'book-time-form',
  [ScheduleItemType.Availability]: 'availability-time-form',
  [ScheduleItemType.Unavailability]: 'unavailability-time-form',
};
