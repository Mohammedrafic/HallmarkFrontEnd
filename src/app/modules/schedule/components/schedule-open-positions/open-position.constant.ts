import { OpenPositionState, PositionDragEvent } from '../../interface';

export const InitialPositionState: OpenPositionState = {
  initialPositions: [],
  shiftTime: null,
};

export const InitialDragEvent: PositionDragEvent = {
  action: false,
  date: null,
  candidateId: null,
};

export const MissingMatchDate = 'The Order date does not match to the selected date';
export const NotOrientEmployee = 'The Employee is not Oriented';
