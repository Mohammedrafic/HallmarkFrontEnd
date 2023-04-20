import { X } from 'angular-feather/icons';

import { ScheduleItemType } from '../../constants';
import { BarSettings } from '../../interface';

export const Icons = {
  X,
};

export const RemoveButtonToolTip = 'Remove all Schedules';
export const StartTimeField = 'startTime';
export const EndTimeField = 'endTime';
export const ToggleControls = ['critical', 'onCall', 'charge', 'preceptor', 'oncall'];
export const ScheduleControlsToReset = [
  'shiftId',
  'startTime',
  'endTime',
  'hours',
  'critical',
  'onCall',
  'charge',
  'preceptor',
];
export const ScheduleClassesList = {
  [ScheduleItemType.Book]: 'book-form',
  [ScheduleItemType.Availability]: 'availability-form',
  [ScheduleItemType.Unavailability]: 'unavailability-form',
  [ScheduleItemType.OpenPositions]: 'open-positions-form',
};

export const ScheduleCustomClassesList = {
  [ScheduleItemType.Book]: 'book-time-form',
  [ScheduleItemType.Availability]: 'availability-time-form',
  [ScheduleItemType.Unavailability]: 'unavailability-time-form',
  [ScheduleItemType.OpenPositions]: 'open-positions-time-form',
};

export const SideBarSettings: BarSettings = {
  showScheduleForm: true,
  showRemoveButton: false,
  showOpenPositions: true,
  removeReplacementMode: false,
  replacementOrderDialogOpen: false,
};
