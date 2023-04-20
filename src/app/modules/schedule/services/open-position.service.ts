import { Injectable } from '@angular/core';

import { distinctUntilChanged, Observable } from 'rxjs';

import { BaseObservable, DateTimeHelper } from '@core/helpers';
import { OpenPositionsList, OpenPositionState, Positions } from '../interface';
import { InitialPositionState } from '../components/schedule-open-positions';
import { ScheduleAttributeKeys } from '../enums';

@Injectable()
export class OpenPositionService {
  private readonly openPositionsState: BaseObservable<OpenPositionState> =
    new BaseObservable<OpenPositionState>(InitialPositionState);

  public setOpenPosition(key: string, value: OpenPositionsList[] | string | null): void {
    this.openPositionsState.set({
      ...this.openPositionsState.get(),
      [key]: value,
    });
  }

  public clearOpenPositionState(): void {
    this.openPositionsState.set(InitialPositionState);
  }

  public getOpenPositionsStream(): Observable<OpenPositionState> {
    return this.openPositionsState.getStream().pipe(
      distinctUntilChanged((previous: OpenPositionState, current: OpenPositionState) => {
        return previous.initialPositions?.length === current.initialPositions?.length &&
               previous.shiftTime === current.shiftTime;
      })
    );
  }

  public getOpenPositionsBySelectedSlots(state: OpenPositionState): OpenPositionsList[] {
    if(state.shiftTime) {
      const [startTime, endTime] = state.shiftTime.split('/');

      return [...this.openPositionsState.get().initialPositions].map((openPositions: OpenPositionsList) => {
        return {
          ...openPositions,
          positions: openPositions.positions.filter((position: Positions) => {
            return this.getFormattedShiftTime(position.shiftStartTime, false) === this.getFormattedShiftTime(startTime) &&
                   this.getFormattedShiftTime(position.shiftEndTime, false) === this.getFormattedShiftTime(endTime);
          }),
        };
      }).flat();
    }

    return state.initialPositions;
  }

  public prepareOpenPositions(openPositions: OpenPositionsList[]): OpenPositionsList[] {
    return openPositions.map((openPosition: OpenPositionsList) => {
      return {
        ...openPosition,
        positions: openPosition.positions.map((position: Positions) => {
          return {
            ...position,
            attributes: this.createAttributes(position),
          };
        }),
      };
    });
  }

  private getFormattedShiftTime(date: string, isFormatted = true): string {
    if(isFormatted) {
     return date.split('T')[1];
    }

    return DateTimeHelper.toUtcFormat(date).split('T')[1];
  }

  private createAttributes(position: Positions): string {
    const attributes = [];

    if(position.onCall) {
      attributes.push(ScheduleAttributeKeys.OC);
    }

    if(position.critical) {
      attributes.push(ScheduleAttributeKeys.CRT);
    }

    return attributes.length ? attributes.join(',') : '';
  }
}
